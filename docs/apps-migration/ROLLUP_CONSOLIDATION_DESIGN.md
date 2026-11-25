# Rollup consolidation design

Status: agreed 2026-11-25 (decisions in §8); implementation in progress. Covers the nonprofit-fundraising giving rollups on Person, Company, Appeal and Appeal source. The backend, field model and reporting-currency rules are unchanged; this is a structural refactor that also fixes the inconsistencies found below.

## 1. Recommendation

Replace the four rollup modules (about 2,500 lines) and their 16 event triggers with:

- **one rollup engine**, with a small definition for each rollup (target object, gift relation, fields and summary);
- **one gift loader** shared by all four rollups, so a gift change loads gifts once instead of four times;
- **four gift triggers** (created, updated, deleted, restored) that refresh all affected rollups, plus the existing four opportunity triggers for Company;
- **one nightly reconciliation** covering all four rollups.

The refactor fixes five inconsistencies in passing (§3). Expected size after: roughly 800 to 1,000 lines including definitions. Implementation is staged so each step can be verified on 2021 against a snapshot of current totals (§7).

## 2. Current behaviour

| Rollup | Target | Gift relation | Other source | Fields written |
|---|---|---|---|---|
| Donor | Person | `donorId` | none | `lifetimeGiftAmount`, `largestGiftAmount` (reporting currency), `giftCount`, `firstGiftDate`, `lastGiftDate`, `lastGiftAmount` (gift's own currency) |
| Company | Company | `companyId` | Opportunities (`companyId`) | `lifetimeGiftAmount`, `lastGiftDate` (date only), `awardedOpportunityAmount` (reporting currency only), `awardedOpportunityCount`, `nextApplicationDeadline`, `nextFundingPeriodEnd` (nearest date on or after today) |
| Appeal | Appeal | `appealId` | none | `raisedAmount`, `giftCount`, `donorCount` (distinct people and companies), `lastGiftAt` |
| Appeal source | Appeal source | `appealSourceId` | none | Same as Appeal. The module is a copy of Appeal with renamed identifiers |

Each module has the same pipeline: collect target IDs, load targets, load gifts for those targets (25 IDs per query, 200 gifts per page), compute a summary, skip unchanged targets, and upsert changes through the REST batch endpoint (60 per request). Each also has a "recompute all" path that loads every gift plus every target with existing rollup values, so targets that lost all their gifts are reset.

Shared rules, implemented four times:

- Gifts count unless `giftType` is `GIFT_IN_KIND`.
- Money totals use only reporting values in the reporting currency (`sumReportingValues`). Without `REPORTING_CURRENCY`, money fields are left untouched.
- Equality checks compare amounts by rounded micros and currency code.

What triggers a recompute:

- **Gift updated, deleted or restored:** 12 batch-mode triggers, three per rollup.
- **Opportunity created, updated, deleted or restored:** four triggers, Company only.
- **Gift created:** no trigger. The app's own creation paths call the recompute functions directly:
  - batch processing (all four rollups);
  - New gift (all four);
  - post-install (Company);
  - Stripe recurring (Donor only).
- **Nightly:** Donor only (`reconcile-donor-rollups-nightly`, spread across an hour).
- **Manual:** four `recompute-*-rollups` functions, used for upgrades and backfills.

Unit tests: 39 across the four modules and reporting-currency rollups, all on the compute functions.

## 3. Inconsistencies found

| # | Finding | Effect | Fixed by the refactor |
|---|---|---|---|
| F1 | Stripe recurring gifts recompute only the Donor rollup | Company, Appeal and Appeal source totals miss recurring gifts until something else recomputes them; nothing does nightly | Yes: every caller refreshes all affected rollups |
| F2 | Appeal and Appeal source update triggers don't watch `giftType` | Changing a gift to or from gift-in-kind leaves appeal totals wrong | Yes: one watch list |
| F3 | Only Donor has a nightly reconciliation | Company `nextApplicationDeadline` and `nextFundingPeriodEnd` stay on past dates until an unrelated event; other drift is never repaired | Yes: one nightly job for all |
| F4 | "Recompute all" loads every gift, then loads them all again per target chunk | Doubles API calls on backfills and the nightly run | Yes: reuse the loaded gifts |
| F5 | Currency normalisation differs: Donor treats a missing currency as empty; the others substitute the default currency. Company normalises `lastGiftDate` to a date; Appeal keeps the full value | Small, but the same gift can be compared differently per rollup | Yes: one helper each; output formats stay per field |
| F6 | No gift `created` trigger (known: backlog §2.8) | Gifts created by API, workflow or import never update rollups except Donor overnight | Optional (decision D2) |
| F7 | Refunds are recorded on the gift (`refundedAmount`) but ignored by every rollup and not watched | Totals are gross of refunds | No: product decision D1 |

## 4. Proposed design

### Module layout (`src/rollups/`)

- `gift-rollup-source.ts`: loads gifts for a set of targets with one selection covering every rollup (`id`, `giftDate`, `giftType`, `amount`, `reportingAmount`, `donorId`, `companyId`, `appealId`, `appealSourceId`). It uses `in` filters (supported for UUIDs in the generated client) and groups the results by relation. It also provides an all-gifts loader for full recomputes.
- `rollup-definition.ts`: the definition type, with the shared helpers used by every rollup: counts toward cash totals, amount equality, date normalisation, chunked target loading, and REST batch upsert with returned-ID checks.
- `definitions/donor.ts`, `company.ts`, `appeal.ts`, `appeal-source.ts`: each declares:
  - target object and REST path;
  - target fields to read;
  - gift relation;
  - "has existing rollups" filter;
  - `compute(target, gifts, extra)`, and for Company, opportunity loading.

  Appeal and Appeal source share one factory, parameterised by relation.
- `recompute-rollups.ts`: the orchestrator.
  - **Targeted:** `recomputeRollups(client, { donorIds, companyIds, appealIds, appealSourceIds })` loads gifts once for the union of targets, then runs each definition.
  - **Full:** `recomputeAllRollups(client, rollups?)` loads all gifts once and reuses them.
  - Failures in one rollup are reported without blocking the others.
- `affected-targets.ts`: derives all four ID sets from gift events (before and after values) and Company IDs from opportunity events.

Compute functions keep today's exact outputs (Appeal's `lastGiftAt` stays a full value, Company's `lastGiftDate` stays a date), except where §3 fixes are intended.

### Triggers

- Gift `updated`, `deleted`, `restored`, plus optionally `created` (D2): one function each, batch mode. The update trigger watches the union of fields: amount, reporting amount, date, type, and the four relations. It uses `updatedFields` to skip rollups the change can't affect; for example, a change only to `appealId` doesn't recompute Person.
- Opportunity triggers stay as they are, calling the orchestrator for Company.
- Result: 7 or 8 trigger functions instead of 16. Removing the old functions appears as deletions in `twenty app plan`; this is expected.

### Direct callers

Removed (D3). With the gift `created` trigger, every creation path, including Stripe recurring (F1), reaches the rollups the same way. Post-install seeding relies on the same triggers, and on the manual recompute if needed.

### Reconciliation

- **Nightly:** one job, `reconcile-rollups-nightly` with its runner, recomputes all four rollups from a single all-gifts load (fixes F3 and F4). It keeps the existing spread scheduling.
- **Manual:** one `recompute-rollups` function with an optional `rollups` list replaces the four manual functions. Upgrade notes that mention "the four recompute runs" need updating (D4).

## 5. API cost

Per gift change today: four gift loads (one per rollup), each chunked and paged, plus four target loads.

After: one gift load for the union of targets plus four target loads. In batch processing with 100 gifts across, say, 80 donors, 10 companies, 5 appeals and 5 sources, gift queries drop from at least 8 (with paging) to about 4.

The full nightly recompute drops from two passes over all gifts to one, and covers all four rollups instead of one.

## 6. Invariants the tests must hold

These are the assertions for the testing session's rollup integration test and the refactor's unit tests:

1. All gifts linked to a target count, except `GIFT_IN_KIND`.
2. Money totals include only reporting values in `REPORTING_CURRENCY`. Gifts without one are excluded from totals but still count in `giftCount` and dates. Without `REPORTING_CURRENCY`, money fields are not written.
3. **Donor:**
   - `giftCount`;
   - `firstGiftDate` and `lastGiftDate` from the earliest and latest gift;
   - `lastGiftAmount` in the last gift's own currency;
   - `largestGiftAmount` by reporting value.
4. **Company:**
   - lifetime total and date-only `lastGiftDate`;
   - awarded opportunities (non-zero `awardedAmount`) counted and, in the reporting currency only, summed;
   - next application deadline and funding end are the nearest dates on or after today.
5. **Appeal and Appeal source:**
   - `raisedAmount`, `giftCount`, `lastGiftAt`;
   - `donorCount` = distinct people plus distinct companies across counted gifts.
6. Unchanged targets are not written. A full recompute resets targets that have rollup values but no remaining gifts.
7. A gift moved between targets updates both the old and the new target.

## 7. Implementation plan

Each step is one commit, verified with unit tests, typecheck and build.

1. **Characterisation tests** for the current compute functions, filling gaps against §6. No behaviour change.
2. **Shared helpers, gift source and engine**, and port Appeal and Appeal source onto them.
3. **Port Donor and Company.**
4. **Orchestrator and direct callers** (fixes F1).
5. **Trigger consolidation,** with the `updatedFields` short-circuit (fixes F2), and the created trigger if D2 is agreed.
6. **Single nightly reconciliation and manual recompute** (fixes F3 and F4), and update the upgrade documentation.
7. **Remove the old modules and functions.**

Verification on 2021 after steps 3 and 6:
- snapshot every rollup field;
- run the new full recompute;
- diff the results.

Differences must be explained by F1 to F3 and nothing else. The snapshot and diff are a scratch script, not app code.

Wait for the testing session's rollup integration test before step 5, which changes when recomputes fire.

## 8. Decisions (agreed 2026-11-25)

- **D1. Refunds:** keep today's gross totals during the refactor. Resolve before v1; the user's inclination is donations less refunds, before processing fees. To research: comparable CRMs, and the interaction with reporting amounts.
- **D2. Gift created trigger:** add it. Gifts count the same way whether created by the app, native Twenty, the API, workflows or imports.
- **D3. One mechanism:** drop every direct recompute call, New gift included.
  - New gift shows no totals after saving.
  - Batch-mode triggers run straight away on the worker queue, one job per write, with no batching window.
  - Twenty throttles app trigger jobs (`APPLICATION_JOB_ENQUEUE_RATE_LIMITING_LIMIT`, 500 per minute per app per workspace) and drops jobs over the limit, so the nightly reconciliation is the repair path. Consolidation cuts rollup trigger jobs per gift update from up to four to one.
- **D4. Manual recompute:** one function with an optional `rollups` list.
- **Scope guard:** the engine stays a small, specific helper for these four rollups, not a general calculation framework. Changes to the meaning of any figure are listed explicitly (F1 to F3, F6), and everything else must match the snapshot.

## 9. Risks

- **Twenty batch trigger behaviour.** The union watch list fires the gift update trigger more often. The `updatedFields` short-circuit and the unchanged-target skip keep writes the same as today.
- **A bug in the shared engine affects all four rollups at once.** Mitigated by the characterisation tests, the snapshot diff and staged commits.
- **Time-dependent Company fields** change at midnight, not on events. Covered by the nightly job (F3); tests must fix "today".
