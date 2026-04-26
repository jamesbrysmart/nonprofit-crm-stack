# Twenty App Batch Processing Design

Status: Working design note  
Updated: 2026-04-16  
Purpose: Capture the best current Twenty-native design direction for fundraising batch processing, grounded in the current `fundraising-service` executor and the constraints of the Twenty app/runtime model.

This note is not a final architecture decision. It exists so future spike work does not regress into:

- thin row-loop demos that ignore the real batch constraints,
- or easy “just keep it outside Twenty apps” conclusions before we have pushed the platform properly.

## 1. Why This Note Exists

The lightweight batch-processing proof in `apps/fundraising/staging-review-minimal` was useful, but only as a first product-surface check:

- batch metadata can exist in the `2020` app-dev workspace,
- a focused batch scope can be expressed in Twenty apps,
- a batch action can write row and batch outcomes back.

That proof is not enough for product-quality batch processing.

The real challenge is the executor behavior we already had to design in `services/fundraising-service`, especially under Twenty API constraints:

- API rate limits,
- `/batch/*` atomic failure behavior,
- chunking and pacing,
- correlation safety,
- row fallback for parity gaps,
- low write-churn writeback,
- operator-trustable outcomes.

This note captures the next design direction so we test Twenty apps against those real pressures rather than against an artificially simplified version of the problem.

## 2. Product Bar

Canonical product reference:
- [docs/apps-migration/PRODUCT_REVIEW.md](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/PRODUCT_REVIEW.md)

For batch processing, the product bar is:

- batch scope is a first-class operating mode, not just a filter,
- `Process batch` is an explicit operator action,
- processing is async/run-based in product terms,
- partial progress matters,
- blocked rows must not collapse the whole batch,
- failures and deferrals must stay visible/actionable,
- retry/resume must remain a real concern,
- review-time donor intent must not be silently reinterpreted during processing.

The product review is clear that batch processing is not secondary to single-record processing here. For imports and integrations, batch is the dominant operational shape.

## 3. What The Current Executor Actually Does

Primary implementation reference:
- [services/fundraising-service/src/gift-batch/gift-batch-processing.service.ts](/home/jamesbryant/workspace/dev-stack/services/fundraising-service/src/gift-batch/gift-batch-processing.service.ts)
- [services/fundraising-service/src/gift-batch/gift-batch-processing.logic.ts](/home/jamesbryant/workspace/dev-stack/services/fundraising-service/src/gift-batch/gift-batch-processing.logic.ts)
- [docs/solutions/gift-batch-processing.md](/home/jamesbryant/workspace/dev-stack/docs/solutions/gift-batch-processing.md)

The important design point is that the current executor is shaped mostly by platform/runtime pressure, not by a desire for elaborate orchestration.

Key current behaviors:

- start + poll async run model,
- `row` and `hybrid` execution modes,
- chunked `/batch/gifts` fast path,
- binary split on batch failure,
- row fallback for parity gaps,
- explicit correlation-contract failure handling,
- chunked staging writeback,
- pacing between batch and row requests,
- in-memory active run tracking with stale-run recovery,
- batch status and row outcome writeback.

Important implication:

- the interesting part to migrate is the executor policy,
- not the exact current in-memory run implementation,
- and not a temptation to encode execution machinery as additional CRM metadata unless truly necessary.

## 4. Verified Twenty Constraints And Capabilities

### 4.1 Verified constraints

Canonical operational note:
- [docs/OPERATIONS_RUNBOOK.md](/home/jamesbryant/workspace/dev-stack/docs/OPERATIONS_RUNBOOK.md)

Current Twenty-side constraints we should design around:

- 100 requests per minute per API key/workspace,
- 60 records per batch call,
- `/batch/*` is effectively atomic in observed behavior,
- sustained bulk work should use pacing (roughly 600–800ms delay),
- response order is currently treated as an operational assumption,
- there is no verified per-row correlation token support in batch create responses.

These are not theoretical. They are the reason the current executor does chunking, split fallback, and explicit correlation-contract checks.

### 4.2 Verified app/runtime capabilities

References:
- [services/twenty-core/packages/twenty-server/src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service.ts](/home/jamesbryant/workspace/dev-stack/services/twenty-core/packages/twenty-server/src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service.ts)
- [services/twenty-core/packages/twenty-server/src/engine/core-modules/open-api/open-api.service.ts](/home/jamesbryant/workspace/dev-stack/services/twenty-core/packages/twenty-server/src/engine/core-modules/open-api/open-api.service.ts)
- [services/twenty-core/packages/twenty-server/src/engine/core-modules/open-api/utils/path.utils.ts](/home/jamesbryant/workspace/dev-stack/services/twenty-core/packages/twenty-server/src/engine/core-modules/open-api/utils/path.utils.ts)

Verified capabilities:

- app logic functions get:
  - `TWENTY_API_URL`
  - `TWENTY_APP_ACCESS_TOKEN`
- logic functions can run up to 900 seconds
- app logic can call Twenty’s own REST/OpenAPI surface directly
- Twenty exposes:
  - `POST /rest/batch/{objectPlural}` for create-many
  - `POST /rest/batch/{objectPlural}?upsert=true` for upsert-style batch create
  - `PATCH /rest/{objectPlural}?filter=...` for update-many

Important implication:

- a serious hybrid-style executor is technically expressible inside Twenty apps,
- at least for chunked create/writeback logic,
- without leaving the Twenty runtime boundary.

### 4.3 The real uncertainty

The main uncertainty is not whether the batch API choreography is possible.

The main uncertainty is whether Twenty apps currently provides a sufficiently strong execution model for:

- long-ish chunked work,
- operator-trustable progress,
- interruption/retry/resume,
- and durable run visibility.

At the moment, logic functions look request-bounded rather than like a first-class background job system.

## 5. Design Principle For The Next Twenty-Native Executor

The next design should be:

- as Twenty-native as possible,
- product-true,
- and not distorted by “easy” metadata or service shortcuts.

That means:

- keep durable product truth in metadata,
- keep execution policy in app logic,
- avoid inventing process metadata unless the runtime proves it is necessary,
- and treat a hybrid service boundary as an explicit conclusion, not a fallback habit.

## 6. Recommended Twenty-Native Design

### 6.1 Durable metadata stays product-focused

Keep durable metadata on:

- `giftBatch`
  - status
  - visible summary counts
  - maybe a small amount of last-run summary if needed later
- staged gift rows
  - processing status
  - error detail
  - committed gift linkage
- committed `gift`

Do **not** add a `giftBatchRun`-style object by default.

Reason:

- that would leak execution machinery into the CRM model,
- and it is not what the current executor was fundamentally about,
- it would solve app-local representation before solving the real batch-execution design.

### 6.2 Executor policy lives in app logic functions

The next meaningful Twenty-native executor should:

1. load candidate staged rows for the batch,
2. compute routing:
   - batch-path eligible,
   - row fallback required,
   - not-ready / deferred,
3. create eligible gifts in chunks via `POST /rest/batch/gifts`,
4. on batch failure:
   - split the chunk,
   - isolate bad rows,
   - continue where safe,
5. on correlation-contract failure:
   - fail loudly,
   - do not split/retry the create path,
6. process parity-gap rows via row fallback,
7. write row outcomes back in chunks,
8. update visible batch summary counts/status.

### 6.3 Safeguards to preserve from the current executor

These are the parts of `fundraising-service` we should consciously preserve in the Twenty-native design:

- chunk size bounded to 60 or less,
- pacing between chunk requests,
- no hidden donor rematch or identity reinterpretation,
- selective row fallback for parity gaps,
- binary split on atomic batch failure,
- explicit correlation-contract validation,
- no split/retry on correlation-contract failure,
- chunked writeback to keep write pressure down,
- visible row-level outcomes for processed / deferred / failed states.

These are not incidental implementation details. They are the response to known Twenty constraints.

### 6.4 What the first Twenty-native executor can deliberately leave out

The first serious executor inside Twenty apps does **not** need to include:

- batch donor-match in the same implementation slice,
- recurring parity resolution,
- full telemetry parity,
- durable run history,
- full restart-safe resume semantics,
- Gift Aid side effects,
- import completion handoff flow.

The first goal is narrower:

- prove the strongest in-app executor policy we can,
- under real Twenty batch API constraints,
- without immediately leaving Twenty apps.

## 7. What The Next Implementation Should Actually Test

The next executor pass should answer these questions:

1. Can an app logic function safely own chunked `/rest/batch/gifts` execution?
2. Can it do split-on-failure without becoming operationally brittle?
3. Can row fallback remain selective rather than becoming the real default path?
4. Can batch/row writeback stay coherent and low-churn using batch upsert/update patterns?
5. Is a bounded request-driven executor enough for realistic batch sizes in the near term?
6. At what point do operator trust and runtime limitations force a more explicit background/hybrid execution boundary?

These are the real architecture questions.

## 8. The Main Constraint To Watch

Based on the current Twenty code review, the biggest risk is:

**not the availability of bulk APIs, but the lack of a clearly stronger app-native background/run primitive.**

That means:

- a bounded hybrid executor inside app logic is worth building,
- but we should expect the main strain to show up in:
  - timeout behavior,
  - live progress visibility,
  - interruption handling,
  - retry/resume semantics,
  - operator confidence on larger batches.

If that strain proves too strong, the right conclusion may be:
- metadata + review surface + processing contract in Twenty,
- executor runtime outside it.

But that should only be concluded after we have built the strongest current Twenty-native executor we can.

## 9. Current Evidence From The App Spike

The latest `staging-review-minimal` spike has now moved beyond the original row-loop proof.

What has been exercised successfully inside Twenty apps so far:

- app-owned `giftBatch`, staged-row, and `gift` metadata in the `2020` workspace,
- focused batch record-page scope,
- explicit `Process batch` action,
- bounded in-app hybrid executor using:
  - chunked `POST /rest/batch/gifts`,
  - split-on-failure,
  - row fallback,
  - chunked staging writeback,
- visible batch and row outcome writeback.

Observed stress cases:

- **clean-path batch**
  - a larger ready-only batch processed successfully through the batch path,
  - which is the strongest signal so far that the basic Twenty-native executor strategy is viable.
- **mixed-readiness batch**
  - ready rows processed while blocked rows remained behind coherently,
  - which supports the batch-scope operator model in the product review.
- **split/fallback batch**
  - a 9-row batch processed 8 rows successfully and isolated 1 failure,
  - which is the clearest proof so far that split/fallback behavior can be expressed inside Twenty apps rather than only in `fundraising-service`.
  - the main failures during implementation were app-side bugs in seed/writeback handling rather than platform failures, which is an important distinction for future review of this spike.

This changes the current posture:

- the core bounded executor no longer looks like the most likely blocker,
- the remaining uncertainty is execution lifecycle quality:
  - runtime stability,
  - host/front-component stability during heavy updates,
  - and how far bounded request-driven execution can stretch before a stronger run/background model becomes necessary.

## 10. Current Conclusion

The best current reading is:

- Twenty apps appears capable of the **core batch executor policy** we care about.
- The most important unanswered question is no longer “can it do batch processing at all?”
- The most important unanswered question is “how production-worthy can the execution lifecycle become inside the current app/runtime model?”

That is the right pressure point for the next phase of testing.

## 11. Recommended Next Slice

The next implementation slice should be:

1. keep the current batch UI surface,
2. replace the lightweight row-loop processor,
3. implement a bounded hybrid executor inside app logic that uses:
   - chunked batch create,
   - split fallback,
   - selective row fallback,
   - batch writeback/upsert,
   - pacing,
   - correlation checks,
4. keep durable state only on batch + rows,
5. document exactly where the runtime begins to strain.

This is the right next pressure test for Twenty apps.

## 12. Decision Gate After That Slice

After the bounded Twenty-native executor is built, we should reassess with this question:

**Is the remaining gap mainly execution lifecycle/runtime quality, or is the core batch-processing contract itself still not expressible inside Twenty apps?**

If it is mostly execution lifecycle/runtime quality, then the likely long-term shape is:

- product truth in Twenty,
- execution boundary possibly hybrid until Twenty matures.

If the core contract itself still fails, then the platform gap is deeper.

That is the next real architecture checkpoint.

## 13. Related References

- [docs/apps-migration/PRODUCT_REVIEW.md](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/PRODUCT_REVIEW.md)
- [docs/apps-migration/CODE_REVIEW.md](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/CODE_REVIEW.md)
- [docs/solutions/gift-batch-processing.md](/home/jamesbryant/workspace/dev-stack/docs/solutions/gift-batch-processing.md)
- [docs/OPERATIONS_RUNBOOK.md](/home/jamesbryant/workspace/dev-stack/docs/OPERATIONS_RUNBOOK.md)
- [services/fundraising-service/src/gift-batch/gift-batch-processing.service.ts](/home/jamesbryant/workspace/dev-stack/services/fundraising-service/src/gift-batch/gift-batch-processing.service.ts)
