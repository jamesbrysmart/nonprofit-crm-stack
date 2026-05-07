# Apps Migration API Pressure

Updated: 2026-05-07
Status: Working guide
Purpose: Keep API pressure visible as a migration-wide architectural constraint for Twenty apps, logic functions, imports, and any companion services we may add.

This note is the home for the recurring "API pressure" thread in the app migration work. It is not a product-spec doc. It exists so we keep a shared view of where pressure comes from, what Twenty enforces today, what this repo has already learned, and what design posture future apps should follow.

## 1. Why This Matters

As fundraising workflows move into Twenty apps, pressure shifts rather than disappearing.

The old service boundary may shrink, but the system can still overload itself through:

- direct Twenty API calls,
- front components that cause repeated reads or writes,
- logic functions triggered at row-level granularity,
- workflow runs triggered by imports or bulk edits,
- companion services or adapters sharing the same workspace/API budget.

The practical migration question is not just "can this feature work in a Twenty app?"

It is also:

- what pressure budget does it consume,
- what other app/runtime paths share that budget,
- and what happens when several features are active at once.

## 2. Current Enforced Limits In Twenty

### Core API

Current Twenty docs and server defaults align on these limits:

- `100` requests per minute
- `60` records per batch call

Relevant references:

- `services/twenty-core/packages/twenty-docs/user-guide/data-migration/how-tos/import-data-via-api.mdx`
- `services/twenty-core/packages/twenty-docs/developers/extend/api.mdx`
- `services/twenty-core/packages/twenty-server/src/engine/core-modules/twenty-config/config-variables.ts`
- `services/twenty-core/packages/twenty-server/src/engine/api/common/common-query-runners/common-base-query-runner.service.ts`

Current implementation detail:

- Twenty applies token-bucket throttling for API-key-authenticated requests at the workspace level.
- Server defaults currently include:
  - short window: `100` requests per `1000ms`
  - long window: `100` requests per `60_000ms`

Migration implication:

- The minute-level budget is the stable operating constraint we should design around.
- The shorter token bucket still matters for bursts, especially when multiple app or service paths fire at once.

### Workflow Runs

Twenty has a separate workflow pressure domain:

- soft limit: `100` runs per minute
- hard limit: `5,000` runs per hour

Behavior:

- soft-limit overflow queues runs in `Not Started`
- hard-limit overflow fails additional runs immediately

Relevant references:

- `services/twenty-core/packages/twenty-docs/user-guide/workflows/how-tos/need-more-help/workflows-faq.mdx`
- `services/twenty-core/packages/twenty-server/src/modules/workflow/workflow-runner/workflow-run-queue/workspace-services/workflow-throttling.workspace-service.ts`
- `services/twenty-core/packages/twenty-server/src/engine/core-modules/twenty-config/config-variables.ts`

Migration implication:

- A design that looks cheap in API calls can still be unsafe if it creates many workflow runs.

### Logic Function Execution

Twenty also has a separate logic-function execution throttle:

- `1000` executions per `60_000ms`

Relevant references:

- `services/twenty-core/packages/twenty-server/src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service.ts`
- `services/twenty-core/packages/twenty-server/src/engine/core-modules/twenty-config/config-variables.ts`

Migration implication:

- Row-level logic-function designs can create their own pressure wall even before core API limits become the bottleneck.

### App-Specific Runtime Throttles

Some app/runtime surfaces add their own throttles on top of shared limits.

Current example in `twenty-core`:

- app billing charge endpoint: `1000` charges per minute per workspace+application

Relevant reference:

- `services/twenty-core/packages/twenty-server/src/engine/core-modules/billing/app-billing/app-billing.controller.ts`

Migration implication:

- We should assume future app runtime surfaces may introduce additional local throttles. App design should not depend on every path sharing the same budget model.

## 3. Repo Learnings Already Captured

This repo already contains concrete operational learning from fundraising-service spikes and batch-processing work.

Most important current references:

- `docs/runbooks/OPERATIONS_RUNBOOK.md`
- `docs/solutions/gift-batch-processing.md`
- `docs/spikes/gift-batch-processing-continuity.md`

Current working lessons:

- Treat `429` behavior as a normal operational reality, not a rare edge case.
- Shared-key burst pressure matters even when logical request counts look reasonable.
- Gateway and staging flows can fan out into multiple Twenty API calls and therefore create more pressure than they appear to from the UI.
- Retry amplification can turn a mildly noisy flow into a serious pressure source.
- Improving call efficiency should come before adding broad throttling so we do not ship "slow but noisy" behavior.
- Large imports should favor batch operations, pacing, and explicit retry/backoff rather than optimistic high-frequency row-level calls.

Operational assumptions currently in use:

- sustained import pacing: `>=600-800ms` between requests
- prefer `/batch/*` for large write loads
- keep staging/gateway ingestion rates lower than raw batch-import rates

## 4. Current `nonprofit-fundraising` Reference Points

The current app already contains several shapes that future sessions should treat as API-pressure reference points.

These are not all "bad". Some are intentionally chosen because the product needs them. The point is to make the pressure visible early so later app work does not accidentally multiply it.

### Bounded hybrid batch processing

Current reference:

- `apps/fundraising/nonprofit-fundraising/src/logic-functions/process-batch.ts`
- `apps/fundraising/nonprofit-fundraising/src/batch-processing/batch-processing.executor.ts`

Why it matters:

- the batch route loads the batch plus up to `200` staging rows,
- writes batch status at start and finish,
- performs batched gift creates,
- performs batched staging-row writebacks,
- and can fall back from batch create into recursive split and row-level processing.

Pressure implications:

- this is a deliberate high-pressure path and should be treated as such,
- row fallback increases call count sharply when parity gaps or invalid rows push work off the fast path,
- post-processing side effects add more pressure beyond gift creation itself,
- especially Gift Aid batch attachment and recurring-agreement advancement.

Current app signal:

- the executor already bakes in chunking and `700ms` pauses,
- which is strong evidence that this path should remain explicitly pressure-aware.

### Single-row processing that reuses the batch executor

Current reference:

- `apps/fundraising/nonprofit-fundraising/src/logic-functions/process-gift-staging-row.ts`
- `apps/fundraising/nonprofit-fundraising/src/gift-staging-review/gift-staging-processing.api.ts`

Why it matters:

- the single-row route looks narrow,
- but it still loads the full processing shape for a row and runs through the same bounded processing engine.

Pressure implications:

- this is safe as an operator-driven exception path,
- but it would be risky if it became the dominant path for large queues,
- because it converts a set problem back into many route calls, many reads, and many writes.

Design warning:

- future sessions should resist any redesign that makes bulk staging work depend mainly on repeated `/gift-staging/process-row` calls.

### Staging review read churn and invalidation fan-out

Current reference:

- `apps/fundraising/nonprofit-fundraising/src/gift-staging-review/use-gift-staging-review-record.ts`
- `apps/fundraising/nonprofit-fundraising/src/gift-staging-review/gift-staging-review.actions.ts`

Why it matters:

- review surfaces load a rich `giftStaging` record on mount,
- local updates broadcast invalidation,
- and subscribers refetch on invalidation.

Pressure implications:

- this is manageable for a small number of open records,
- but it can become noisy if many front components on one page each maintain their own read model and refresh cycle,
- or if more edit actions begin broadcasting frequently.

Design warning:

- future front-component work should prefer shared record loads and targeted refresh over multiple independent loaders for the same record context.

### Manual gift entry duplicate checking and recurring search

Current reference:

- `apps/fundraising/nonprofit-fundraising/src/front-components/new-gift.front-component.tsx`
- `apps/fundraising/nonprofit-fundraising/src/manual-gift-entry/manual-gift-entry.api.ts`
- `apps/fundraising/nonprofit-fundraising/src/logic-functions/check-donor-duplicates.ts`
- `apps/fundraising/nonprofit-fundraising/src/logic-functions/search-recurring-agreements.ts`
- `apps/fundraising/nonprofit-fundraising/src/logic-functions/create-manual-gift.ts`

Why it matters:

- the manual-entry path performs explicit duplicate checks,
- optional recurring-agreement searches,
- then creates committed gifts directly instead of staging by default.

Pressure implications:

- human-driven usage is naturally lower-volume,
- but this flow still demonstrates a pattern where one operator action can fan out into several route calls plus direct record mutations,
- and follow-on effects like Gift Aid draft-batch attachment or recurring-agreement advancement add more writes after the main create succeeds.

Design warning:

- this path should remain a trusted operator flow, not drift into a quasi-import mechanism.

### Gift Aid claim batching and submission

Current reference:

- `apps/fundraising/nonprofit-fundraising/src/gift-aid-claims/gift-aid-claim-batch.ts`
- `apps/fundraising/nonprofit-fundraising/src/gift-aid-claims/gift-aid-claim-submission.ts`
- `apps/fundraising/nonprofit-fundraising/src/front-components/gift-aid-claim-batch-record.front-component.tsx`

Why it matters:

- claim flows recompute summaries from linked gifts,
- attach gifts to the current draft claim batch in bulk,
- and build a submission snapshot before queueing the HMRC adapter path.

Pressure implications:

- this is a good example of "operationally correct but not free" workflow logic,
- because readiness checks and rollup refreshes add read pressure,
- while bulk attachment and submission-state updates add write pressure.

Design warning:

- future claim-like or finance-export-like features should assume that summary recomputation and readiness validation are part of the pressure budget, not just the final outbound submission.

### Stripe intake and provider-event bursts

Current reference:

- `apps/fundraising/nonprofit-fundraising/src/logic-functions/handle-stripe-intake-event.ts`
- `apps/fundraising/nonprofit-fundraising/src/stripe/stripe-event-router.ts`
- `apps/fundraising/nonprofit-fundraising/src/logic-functions/handle-public-stripe-webhook.ts`

Why it matters:

- provider events can arrive in bursts,
- and one provider event can route into different creation paths depending on confidence and matching state.

Pressure implications:

- inbound event bursts create shared-budget contention with operator-driven app usage,
- especially if matching, staging creation, recurring fulfillment, and follow-on updates are all active at once.

Design warning:

- app sessions should treat webhook/intake paths as first-class pressure producers even when the UI appears quiet.

### Recurring-agreement side effects

Current reference:

- `apps/fundraising/nonprofit-fundraising/src/recurring/recurring.service.ts`
- current call sites in batch processing and manual gift creation

Why it matters:

- recurring linkage is not just lookup state,
- it also carries follow-on expectation updates and parity constraints that already force some rows onto the row-fallback path.

Pressure implications:

- recurring support increases both read complexity and write-side fan-out,
- and it is already one of the reasons the current batch executor cannot stay purely on the fast path.

Design warning:

- any feature that expands recurring semantics should be reviewed for how much extra pressure it imposes on the batch path before the product shape is considered stable.

## 5. Pressure Domains To Track During Migration

For migration decisions, treat these as separate but interacting pressure domains:

1. Core API request budget
2. Batch payload size budget
3. Workflow-run budget
4. Logic-function execution budget
5. Read amplification from front components and operational pages
6. Retry amplification from transient failures
7. Shared-budget contention across apps, integrations, and companion services

This means a feature can be acceptable in one domain and still be dangerous overall.

Examples:

- A row-level automation can stay below API rate limits but still exhaust workflow-run budget.
- A bulk action can stay within workflow limits but still create bursty API retries and `429`s.
- A front component can appear harmless in isolation but create expensive read chatter when opened across many records or users.

## 6. Migration Design Posture

When building or reviewing new app behavior, default to this posture:

### Prefer bulk semantics over row-by-row semantics

- Favor batch actions, batch reads, batch writes, and explicit operators over implicit per-row background work.
- Prefer one operator-triggered "process this set" action over thousands of record-triggered executions when the workflow naturally operates on a set.

### Minimize write chatter

- Avoid GET-before-PATCH when the needed state is already in hand.
- Avoid status/progress writes that are operationally nice but not worth high-frequency pressure.
- Be careful with audit or derived fields that require many extra writes to stay synchronized.

### Minimize read amplification

- Front components should not repeatedly refetch data that can be loaded once per record/page view.
- Avoid UI patterns that cause polling or repeated cross-object hydration unless the value clearly justifies the pressure cost.

### Treat retries as part of the design

- Backoff, jitter, and idempotency are baseline requirements for bulk or integration paths.
- A path that only works when nothing retries is not operationally sound.

### Avoid hidden fan-out

- Make it explicit when a single user action causes:
  - multiple API calls,
  - multiple workflow runs,
  - multiple logic-function executions,
  - or cross-system retries.

If the fan-out is non-obvious, document it in the implementation note for that feature.

### Keep human-triggered control points where helpful

- For operational workflows, explicit admin actions can be safer than fully automatic triggers when the automatic path would create uncontrolled pressure or expensive retries.

## 7. Questions To Ask For New App Features

Before locking a new design, ask:

- What budget does this consume first: API, workflow, logic-function, or UI read pressure?
- Is the work naturally row-level, or are we forcing row-level execution onto a batch problem?
- What is the fan-out from one user action?
- What happens during imports, bulk edits, or backfills?
- What happens if two apps and one integration are all active against the same workspace?
- What is the retry story for `429`, `503`, and partial-failure conditions?
- What is the operator-visible degradation mode: queued, slowed, retried, partially skipped, or hard failed?
- Which writes are essential, and which are nice-to-have operational metadata?

If those answers are fuzzy, the design is probably still under-specified.

## 8. Current Open Questions

These are the recurring unknowns worth revisiting as the migration progresses:

- How much app-owned operational meaning should stay derived at read time versus stored and maintained through writes?
- How much pressure is created by front-component-heavy record pages once several custom surfaces are active at once?
- Where do logic functions remain acceptable, and where do they become an unsafe row-level execution trap?
- When do we need a companion service or queueing layer to smooth shared-budget contention across multiple apps?
- What observability is sufficient to distinguish:
  - true platform limits,
  - avoidable call amplification,
  - workflow-budget exhaustion,
  - and bad local retry behavior?

## 9. Working Rules For This Thread

When future sessions uncover a new API-pressure lesson:

- update this note if the lesson is migration-wide,
- update the runbook if it changes operational commands or response steps,
- update a feature-specific or solution doc if the lesson is local to one workflow,
- and prefer replacing vague statements with measured behavior, limits, or explicit fan-out notes.

This doc should stay concise and architectural. It should not become a dump of every `429` incident log.

## 10. Related Docs

- [`OVERVIEW.md`](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/OVERVIEW.md)
- [`APP_RUNTIME_ARCHITECTURE.md`](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/APP_RUNTIME_ARCHITECTURE.md)
- [`MIGRATION_WORKING_PATTERNS.md`](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/MIGRATION_WORKING_PATTERNS.md)
- [`docs/runbooks/OPERATIONS_RUNBOOK.md`](/home/jamesbryant/workspace/dev-stack/docs/runbooks/OPERATIONS_RUNBOOK.md)
- [`docs/solutions/gift-batch-processing.md`](/home/jamesbryant/workspace/dev-stack/docs/solutions/gift-batch-processing.md)
- [`docs/spikes/gift-batch-processing-continuity.md`](/home/jamesbryant/workspace/dev-stack/docs/spikes/gift-batch-processing-continuity.md)
