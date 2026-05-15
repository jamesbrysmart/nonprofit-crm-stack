# Twenty App Hardening Backlog

Updated: 2026-05-14
Status: Working note
Purpose: Capture the current `fix now` hardening backlog for `apps/fundraising/nonprofit-fundraising` based on the latest structural and runtime review pass.

Use this alongside:

- [REVIEW_POSTURE.md](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/REVIEW_POSTURE.md)
- [APP_HARDENING_REVIEW_RUBRIC.md](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/APP_HARDENING_REVIEW_RUBRIC.md)

This note is not a full findings report.

It is the current execution backlog: the technical changes that look justified to make before broader feature expansion.

## 1. Current Backlog Ordering

1. Stabilize shared app transport helpers
2. Centralize batch loaders and query shapes
3. Remove multi-write staging review actions where possible
4. Split `new-gift.front-component.tsx` by responsibility
5. Split `gift-aid-claim-batch.ts` into clearer layers
6. Split `batch-processing.executor.ts` into internal submodules
7. Decide a stale-widget refresh policy and apply it selectively

This order is based on refactor value rather than severity alone.

## 2. Backlog Items

### 2.1 Stabilize Shared App Transport Helpers

Status:

- `fix now`

Why:

- the app is already reimplementing the same route-call and REST-call patterns in multiple places
- this is becoming accidental infrastructure
- stabilizing it early reduces drift and makes later refactors safer

What to do:

- create one shared helper for front-component route-trigger calls
- create one shared helper for REST batch calls
- keep the helpers narrow and explicit rather than building a broad generic client layer

Current examples:

- [manual-gift-entry.api.ts](/home/jamesbryant/workspace/dev-stack/apps/fundraising/nonprofit-fundraising/src/manual-gift-entry/manual-gift-entry.api.ts)
- [batch-processing.api.ts](/home/jamesbryant/workspace/dev-stack/apps/fundraising/nonprofit-fundraising/src/batch-processing/batch-processing.api.ts)
- [gift-aid-claim.api.ts](/home/jamesbryant/workspace/dev-stack/apps/fundraising/nonprofit-fundraising/src/gift-aid-claims/gift-aid-claim.api.ts)
- [gift-staging-processing.api.ts](/home/jamesbryant/workspace/dev-stack/apps/fundraising/nonprofit-fundraising/src/gift-staging-review/gift-staging-processing.api.ts)
- [gift-refund.api.ts](/home/jamesbryant/workspace/dev-stack/apps/fundraising/nonprofit-fundraising/src/gift-lifecycle/gift-refund.api.ts)
- [gift-aid-claim-batch.ts](/home/jamesbryant/workspace/dev-stack/apps/fundraising/nonprofit-fundraising/src/gift-aid-claims/gift-aid-claim-batch.ts)
- [gift-staging-bulk-writeback.ts](/home/jamesbryant/workspace/dev-stack/apps/fundraising/nonprofit-fundraising/src/gift-staging/gift-staging-bulk-writeback.ts)
- [donor-rollups.ts](/home/jamesbryant/workspace/dev-stack/apps/fundraising/nonprofit-fundraising/src/donor-rollups/donor-rollups.ts)

### 2.2 Centralize Batch Loaders And Query Shapes

Status:

- `fix now`

Why:

- batch summary and row-loading logic is already duplicated
- query shapes are drifting between UI and logic-function code
- this is a maintainability and correctness risk

What to do:

- extract shared batch query/load functions
- centralize queue-scope query param construction
- centralize repeated gift-staging row field selections where practical

Current examples:

- [gift-batch-record.front-component.tsx](/home/jamesbryant/workspace/dev-stack/apps/fundraising/nonprofit-fundraising/src/front-components/gift-batch-record.front-component.tsx)
- [use-gift-batch-review.ts](/home/jamesbryant/workspace/dev-stack/apps/fundraising/nonprofit-fundraising/src/gift-batch-review/use-gift-batch-review.ts)
- [process-batch.ts](/home/jamesbryant/workspace/dev-stack/apps/fundraising/nonprofit-fundraising/src/logic-functions/process-batch.ts)
- [run-batch-donor-match.ts](/home/jamesbryant/workspace/dev-stack/apps/fundraising/nonprofit-fundraising/src/logic-functions/run-batch-donor-match.ts)
- [check-batch.ts](/home/jamesbryant/workspace/dev-stack/apps/fundraising/nonprofit-fundraising/src/logic-functions/check-batch.ts)

### 2.3 Remove Multi-Write Staging Review Actions Where Possible

Status:

- `fix now`

Why:

- some operator actions perform multiple writes to reach one logical outcome
- that creates transient inconsistent state and multiple invalidation events
- this is a correctness and operator-trust issue, not just code cleanup

What to do:

- review staging review actions for multi-step record mutations
- collapse to one write where possible
- if a second step is unavoidable, make the intermediate state clearly non-visible or tightly controlled

Current example:

- [gift-staging-review.actions.ts](/home/jamesbryant/workspace/dev-stack/apps/fundraising/nonprofit-fundraising/src/gift-staging-review/gift-staging-review.actions.ts)

### 2.4 Split `new-gift.front-component.tsx` By Responsibility

Status:

- `fix now`

Why:

- the component now mixes UI rendering, duplicate detection, search orchestration, validation, and payload assembly
- future changes to manual gift entry will become increasingly expensive in this form

What to do:

- extract a workflow hook or controller layer
- extract payload/validation helpers
- extract presentational sections where that makes the component easier to reason about

Current file:

- [new-gift.front-component.tsx](/home/jamesbryant/workspace/dev-stack/apps/fundraising/nonprofit-fundraising/src/front-components/new-gift.front-component.tsx)

### 2.5 Split `gift-aid-claim-batch.ts` Into Clearer Layers

Status:

- `fix now`

Why:

- the module currently combines REST transport, rollup calculation, draft-batch lifecycle, workspace loading, and finalization logic
- the code still works, but the file is now too mixed to scale comfortably

What to do:

- separate transport helpers
- separate rollup and summary logic
- separate workspace loading from mutation/finalization actions

Current file:

- [gift-aid-claim-batch.ts](/home/jamesbryant/workspace/dev-stack/apps/fundraising/nonprofit-fundraising/src/gift-aid-claims/gift-aid-claim-batch.ts)

### 2.6 Split `batch-processing.executor.ts` Into Internal Submodules

Status:

- `fix now`

Why:

- the executor now combines payload building, fallback donor creation, recurring-agreement helpers, batch-create strategy, writeback persistence, and post-processing side effects
- this is the kind of file that becomes hard to extend safely if left too long

What to do:

- separate payload construction
- separate donor fallback/enrichment
- separate recurring-agreement support
- separate batch-create and fallback execution strategy
- separate post-processing effects like Gift Aid batch attach and donor-rollup recompute

Current file:

- [batch-processing.executor.ts](/home/jamesbryant/workspace/dev-stack/apps/fundraising/nonprofit-fundraising/src/batch-processing/batch-processing.executor.ts)

### 2.7 Decide A Stale-Widget Refresh Policy And Apply It Selectively

Status:

- `policy agreed, apply selectively`

Why:

- some widgets are clearly using explicit invalidation already
- other record widgets still load once and do not refresh while open
- the important question is which surfaces require live operator trust versus snapshot-at-open behavior

What to do:

- classify surfaces by operator trust requirement rather than implementation similarity
- add refresh/invalidation only where the displayed state directly drives the next user action
- leave audit/history/detail surfaces snapshot-at-open by default unless stale data is proven harmful
- prefer narrow record-scoped invalidation over broader reactive patterns
- treat `reactive by default` as a cost to justify, not a hygiene improvement

Current candidates:

- [use-recurring-agreement-review-record.ts](/home/jamesbryant/workspace/dev-stack/apps/fundraising/nonprofit-fundraising/src/recurring/use-recurring-agreement-review-record.ts)
- [gift-aid-claim-submission-record.front-component.tsx](/home/jamesbryant/workspace/dev-stack/apps/fundraising/nonprofit-fundraising/src/front-components/gift-aid-claim-submission-record.front-component.tsx)

Current working classification:

- `giftStaging` review widgets: live-trust
- `giftBatch` summary/actions/worklists: live-trust
- `gift-aid-claim-submission-record.front-component.tsx`: snapshot-at-open by default
- recurring review surfaces: classify from actual workflow semantics, not component similarity

Why this remains product-adjacent:

- it depends partly on how much real-time trust or progress visibility the product expects from each record surface
- do not make this decision purely from technical neatness

## 3. Document And Watch, Not Refactor Now

These areas should stay visible but do not currently justify hardening refactor by themselves:

- front-component app-variable behavior via `process.env`
- `BroadcastChannel` invalidation as a provisional widget-sync pattern
- other version-sensitive Twenty runtime edges already tracked in:
  - [TWENTY_EXTENSIBILITY_WATCH.md](/home/jamesbryant/workspace/dev-stack/docs/TWENTY_EXTENSIBILITY_WATCH.md)
  - [MIGRATION_WORKING_PATTERNS.md](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/MIGRATION_WORKING_PATTERNS.md)

## 4. Pass 3: API And Operational Efficiency

This pass is not mainly about correctness bugs.

It is about making bounded pressure shapes explicit so we know what is:

- acceptable for the pilot,
- worth tightening now,
- or likely to need redesign before materially larger data volumes or more clients.

### 4.1 Treat Current `giftBatch` Processing Limits As Explicit Pilot Boundaries

Status:

- `document and watch`

Why:

- current `giftBatch` processing is already deliberately bounded
- it uses hard caps, chunking, writeback batching, and delay-based pacing
- those choices are sensible for current testing, but they define a pressure envelope rather than a general high-volume solution

Current limits:

- `MAX_BATCH_SIZE = 60`
- `GIFT_CREATE_CHUNK_SIZE = 30`
- `WRITEBACK_CHUNK_SIZE = 60`
- `CHUNK_DELAY_MS = 700`
- loader-level `first: 200` row fetches in batch contexts

Working implication:

- treat `60` rows as a meaningful current operating boundary, not just an implementation detail
- treat `100` rows as a real next pressure regime rather than "slightly more of the same"

### 4.2 Keep Recursive Batch Fallback, But Treat It As Pressure-Amplifying

Status:

- `document and watch`

Why:

- recursive chunk splitting and row fallback are the right safety shape for current batch create behavior
- but they multiply API calls under failure and therefore increase pressure exactly when the path is already unstable

Working implication:

- keep the fallback strategy for now
- document clearly that failures can amplify pressure
- avoid layering more automatic work into the same path without accounting for that amplification

### 4.3 Avoid Adding More Full-Workspace Auto-Refresh Patterns Without Clear Need

Status:

- `leave alone unless new feature work touches it`

Why:

- current invalidation-driven workspace reloads are acceptable and simple
- but they reload full record/workspace shapes rather than narrower slices
- that is a reasonable trust-first tradeoff today, not a pattern we should expand casually

Current examples:

- `Gift Aid` workspace reload
- `giftStaging` review record reload

Working implication:

- prefer correctness and simplicity on current live-trust surfaces
- but do not default future widgets to full-workspace refetch if a narrower shape would do

### 4.4 Treat Gift Aid Claim Workspace As A Heavy Control Surface

Status:

- `document and watch`

Why:

- one visible Gift Aid claim workspace refresh fans out into multiple queries plus summary recomputation elsewhere in the flow
- that is acceptable for an operational control surface, but it is not a cheap widget tree

Working implication:

- keep the current shape for now
- avoid expanding the workspace with more auto-refreshing blocks unless they add clear operator value

### 4.5 Manual Gift Entry Is Chatty But Acceptable

Status:

- `leave alone`

Why:

- duplicate checks, recurring searches, opportunity searches, and final duplicate-gift checks all create front-component read traffic
- but this is a user-driven path, not a high-volume batch path
- the current tradeoff appears acceptable for now

Working implication:

- do not treat manual gift entry as an immediate pressure problem
- just avoid casually adding more background checks or polling behavior

### 4.6 Batch Donor Match Is Grouped, But Still Query-Multiplying

Status:

- `document and watch`

Why:

- grouping rows by donor evidence reduces duplicate work
- but the current donor-match pass still issues one `people` query per grouped donor-name cluster
- that will scale with name variability even if total row count stays bounded

Working implication:

- acceptable for current bounded batches
- keep visible as a likely pressure multiplier if batch size or donor variance grows

## 5. Working Execution Posture

When implementing this backlog:

- prefer small, compositional refactors over broad rewrites
- improve shared patterns before touching more feature slices
- keep product-adjacent questions explicit rather than burying them inside refactors
- and avoid chasing newer Twenty patterns unless they clearly reduce current risk or code complexity
