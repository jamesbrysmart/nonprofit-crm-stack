# Gift Batch Processing Continuity Notes (Temporary)

_Last updated: 2026-02-11_

## Purpose

This temporary document captures the current product + engineering alignment for gift batch processing so context survives model compaction and handoffs.

This is a working continuity artifact, not final policy.

## Canonical References

- Product direction for staging + batches: `docs/features/donation-staging.md`
- Stage 3 processing contract: `docs/solutions/gift-staging-processing.md`
- As-built UX notes: `docs/UX_UI.md`
- Data model notes: `docs/FUNDRAISING_DATA_MODEL.md`
- Operational/rate-limit guidance: `docs/OPERATIONS_RUNBOOK.md`
- Architecture and rate-limit impact: `docs/ARCHITECTURE.md`
- Backpressure deferral ADR: `docs/DECISIONS.md`
- Backlog direction: `docs/POC-backlog.md`

Canonical invariant contract for refactor safety now lives in:
- `docs/ARCHITECTURE.md` (Gift Batch Processing Invariants section)
- `docs/OPERATIONS_RUNBOOK.md` (Gift batch invariant expectations)

This spike file remains implementation history and continuity context.

## Executive Snapshot

### Product intent (agreed)

- Batch is an operator confidence boundary for grouped staging work.
- Batch processing should be one-click from the queue, resumable, and explainable.
- Partial success/failure must be visible at row level.
- Batch workflows complement staging, they do not replace staging.

### Current implementation status (as-built)

- Async batch run endpoints and queue UI are live.
- Lean stale-run recovery is live (no scheduler/cron/serverless dependency).
- Hybrid executor is live:
  - default mode `hybrid`,
  - `/batch/gifts` chunking for throughput,
  - split-on-failure and row fallback for row-level explainability.
- Row-level plain-text failure reason persistence is live for isolated failures.

### Important caveat

- Hybrid batch success path does not execute every side effect from row-mode `processGift` (notably recurring agreement update currently performed in row mode). Recurring behavior requires explicit follow-up design.

## What Is Implemented

### Backend

- Batch run orchestration service:
  - `services/fundraising-service/src/gift-batch/gift-batch-processing.service.ts`
- Batch process endpoints:
  - `POST /gift-batches/:id/process`
  - `GET /gift-batches/:id/process/:runId`
  - implemented in `services/fundraising-service/src/gift-batch/gift-batch.controller.ts`
- Module wiring:
  - `services/fundraising-service/src/gift-batch/gift-batch.module.ts`

### Run lifecycle behavior

- One active run per batch guard.
- Run statuses: `queued`, `running`, `completed`, `completed_with_errors`, `failed`.
- Batch statuses used by run engine:
  - start: `processing`,
  - full success: `processed`,
  - partial/deferred/error outcome: `processed_with_issues`,
  - system-level run failure: `process_failed`.
- Resumable start statuses: `open`, `processed_with_issues`, `process_failed` (plus empty fallback).
- On-demand stale-run recovery:
  - if batch is `processing` but active in-memory run is missing, batch is marked `process_failed` during start/poll flows.

### Executor behavior

- `row` mode:
  - per-row `processGift` for all candidates.
- `hybrid` mode (default):
  - pre-filter rows suitable for direct `/batch/gifts`,
  - create gifts in chunks,
  - on chunk failure use binary split until row isolation,
  - isolated failures fallback to row mode and persist plain-text error detail.

### Current executor config knobs

- `FUNDRAISING_BATCH_PROCESS_EXECUTOR_MODE`
  - values: `hybrid` (default), `row`
- `FUNDRAISING_BATCH_PROCESS_CHUNK_SIZE`
  - default `60`, clamped to `1..60`
- `FUNDRAISING_BATCH_PROCESS_BATCH_DELAY_MS`
  - default `800`
- `FUNDRAISING_BATCH_PROCESS_ROW_DELAY_MS`
  - default `600`

### Client/UI

- Batch run start/poll API integration:
  - `services/fundraising-service/client/src/api/giftBatches.ts`
- Queue orchestration and polling:
  - `services/fundraising-service/client/src/components/gift-staging/StagingQueue.tsx`
- Summary UX:
  - `Process/Resume batch` action when batch filter is active,
  - live run snapshot (attempted/processed/deferred/errors + recent outcomes),
  - implemented in `services/fundraising-service/client/src/components/gift-staging/StagingQueueSummary.tsx`

### Validation completed

- `npm test -- gift-batch/gift-batch-processing.service.spec.ts` (pass, 5 tests)
- `npm run build` in `services/fundraising-service` (pass)

## Confirmed Twenty `/batch` Evidence

Based on the local spike captured in this session:

- `POST /batch/people` and `POST /batch/gifts` are atomic in observed behavior:
  - one invalid record fails the whole call,
  - no partial creates returned for mixed-validity payloads.
- Error payload is batch-level (`messages[]`) and does not include per-item failures.
- Success payload includes full created records (`id`, timestamps, normalized/defaulted fields).
- Rate-limit probe did not trigger `429` in short bursts, but this does not invalidate documented limits.

## Rate-Limit Positioning

Operational assumptions currently in use:

- Documented cap: `100 requests/min` per API key/workspace.
- Batch call cap: `60` records per call.
- Sustained imports guidance: `>=600-800ms` delay between requests.

Current implementation choice:

- default `/batch` pacing `800ms` to leave headroom for shared-key traffic.

## CSV Import Path and Identity Context

### Current ingestion reality

- Native Twenty CSV import (current product direction) bypasses fundraising-service intake logic.
- Therefore intake-time dedupe diagnostics from our bespoke endpoints are not guaranteed for those rows.

### Implication

- We need a batch-level identity action that can run after import and after admin edits, regardless of ingestion source.

## Product Decisions Captured (Current)

- Keep using Twenty native CSV import (do not build bespoke CSV import UI now).
- Keep one-click explicit `Process batch` action.
- Introduce a separate identity action before processing (working label: `Donor match`).
- Company matching is different and lower-volume:
  - no auto-match for company in v1,
  - handle company resolution primarily via guided UI/manual flow.
- Matching policy (agreed):
  - email-only signal is sufficient for suggested/partial match,
  - email-only is not sufficient for auto-link.
- Matching visibility policy (agreed):
  - no silent skips for candidate rows,
  - every candidate (unresolved) row receives an explicit donor-match outcome status.

## Next Slice (Backend-First, Not UI-First)

### Two explicit batch actions (API-first)

1. `Donor match` (label can still be refined in UX)
- Batch-scoped pre-processing action.
- Surfaces exact matches and partial matches before processing.
- Intended to be rerunnable and safe after batch edits.

2. `Process batch`
- Remains separate, explicit posting action.
- Uses resolved identities to maximize fast-path throughput.

### Recommended safety posture

- In v1 identity action:
  - auto-link only when match confidence is strong enough by agreed criteria,
  - do not auto-create donors/companies by default.
- Add an explicit confirmation step for creating new donors/companies from unresolved rows.
- Keep this create step user-driven and auditable.

### Row outcome model for donor-match runs

No candidate row should be silently skipped. Each candidate (unresolved) staging row should be assigned one outcome:

- `already_resolved` (row already has donor/company id)
- `auto_linked` (strong enough match; donor id assigned)
- `partial_match_review` (candidate(s) found, manual decision required)
- `no_match` (no candidate found)
- `insufficient_identity` (missing fields needed for matching, e.g. incomplete name/email)
- `error` (lookup/update failed)

These outcomes should be persisted so admins can filter and rerun confidently.

### Backend quality guardrails (agreed)

- Reuse/centralize identity logic:
  - extract shared matching/creation logic from row-level path into a reusable service for both row processing and donor-match bulk runs.
- Keep matching idempotent and rerunnable:
  - reruns should only re-evaluate unresolved rows unless explicitly requested.
- Treat API limits as first-class:
  - cache duplicate-lookup results by normalized identity key within a run,
  - use capped concurrency and pacing for duplicate lookup/create flows,
  - chunk any bulk creates and preserve split/fallback behavior for isolation.

## Open Questions To Resolve Before Building Identity Action

- Final label/copy for `Donor match`.
- Should `Process batch` remain always available, or should CSV batches show a strong nudge when identity resolution has not run.
- Exact criteria for `auto_link` threshold (email+name strictness and any additional gates).
- UX for confirming creation of new donors (and separately companies) after matching pass.
- Whether recurring-linked rows should be forced through row mode until side-effect parity is implemented.

## Known Constraints and Risks

- Shared Twenty API key bucket across services (no global backpressure yet).
- In-memory run state is not durable across service restarts.
- Hybrid success path and row path are not fully side-effect-equivalent yet.

## Current File Map (Relevant)

- Batch orchestration:
  - `services/fundraising-service/src/gift-batch/gift-batch-processing.service.ts`
- Batch controller:
  - `services/fundraising-service/src/gift-batch/gift-batch.controller.ts`
- Batch module:
  - `services/fundraising-service/src/gift-batch/gift-batch.module.ts`
- Row processor:
  - `services/fundraising-service/src/gift-staging/gift-staging-processing.service.ts`
- Batch client API:
  - `services/fundraising-service/client/src/api/giftBatches.ts`
- Queue run UX:
  - `services/fundraising-service/client/src/components/gift-staging/StagingQueue.tsx`
  - `services/fundraising-service/client/src/components/gift-staging/StagingQueueSummary.tsx`
- Runner tests:
  - `services/fundraising-service/src/gift-batch/gift-batch-processing.service.spec.ts`

## Temporary Status

This file is temporary and should be either:

- promoted into permanent solution/decision docs once settled, or
- retired after equivalent content is merged into:
  - `docs/solutions/gift-staging-processing.md`
  - `docs/UX_UI.md`
  - `docs/DECISIONS.md`
  - `docs/OPERATIONS_RUNBOOK.md`

## Build Plan (Context Continuity, Appended Intentionally)

Note: this section is intentionally appended for continuity because we expect model context compaction during build.

### Scope for the next implementation slice

- Backend-first only.
- No new UI work in this slice.
- Build structural foundations that keep policy details evolvable without major rebuild.

### Task 1: Donor Match Backend Workflow

#### 1.1 Structural refactor for code reuse

- Extract reusable identity-resolution logic into a shared service used by:
  - row-level path (existing processing flow),
  - batch donor-match runs (new flow).
- Shared service responsibilities:
  - normalize identity input from staging rows,
  - call duplicate lookup,
  - classify match confidence and candidate set,
  - encapsulate donor creation helpers.

#### 1.2 New run orchestration service

- Add `GiftBatchDonorMatchService` in `gift-batch` module.
- Provide run model parallel to process runs:
  - statuses: `queued`, `running`, `completed`, `completed_with_errors`, `failed`,
  - one active donor-match run per batch guard,
  - in-memory run state for MVP parity with process runs.
- Add endpoints:
  - `POST /gift-batches/:id/donor-match` (start run),
  - `GET /gift-batches/:id/donor-match/:runId` (poll status).

#### 1.3 Matching policy (agreed defaults)

- Company matching:
  - no auto company matching in v1.
- Donor matching:
  - email-only signal is enough for suggested/partial classification,
  - email-only signal is not enough for auto-link.
- Every candidate row must receive an explicit donor-match outcome (no silent skips).

#### 1.4 Row outcome persistence model

- Persist a donor-match outcome record for each processed row.
- Proposed durable location for v1:
  - `processingDiagnostics.identityResolution` sub-object on staging row.
- Keep this schema flexible:
  - stable keys for orchestration/filtering,
  - policy thresholds and vocabulary can evolve without endpoint redesign.
- Outcome envelope (v1 target):
  - `status`,
  - `reason` (optional),
  - `matchedDonorId` (optional),
  - `candidateDonorIds` (optional),
  - `processedAt`,
  - `runId`.

#### 1.5 Explicit donor creation endpoint

- Add endpoint:
  - `POST /gift-batches/:id/donor-match/create-donors`
- Input:
  - explicit selected staging ids only.
- Behavior:
  - create donors for selected unresolved rows only,
  - write back `donorId`,
  - update donor-match outcome to resolved state,
  - never create implicitly during donor-match scan.

#### 1.6 API-limit-aware execution

- Add per-run caching by normalized identity key to reduce duplicate lookup calls.
- Add env-configured pacing and capped concurrency for donor-match lookups.
- For explicit donor creation:
  - prefer chunked create flow with robust failure isolation,
  - keep row-level error outcomes when create fails.

#### 1.7 Tests for Task 1

- Unit tests for shared identity-resolution service:
  - exact/partial/no-match classification,
  - insufficient identity handling,
  - duplicate parsing edge cases.
- Unit tests for donor-match run orchestration:
  - run lifecycle, one-active-run guard, progress accounting.
- Unit tests for selected donor creation endpoint:
  - success, partial failure, idempotent rerun behavior.
- Regression test to confirm row-level processing path can consume shared identity service without behavior loss.

### Task 2: Process Batch Backend Hardening (On Existing Hybrid)

#### 2.1 Integrate identity resolution state into process preflight

- At batch-process run start, compute and expose identity readiness summary:
  - resolved,
  - unresolved,
  - insufficient identity,
  - partial review pending.
- Keep process run API contract backward compatible; append additional fields.

#### 2.2 Routing and side-effect safeguards

- Keep hybrid fast path for eligible, identity-resolved rows.
- Keep row fallback for unresolved/unsupported rows.
- Add explicit routing rule for parity-sensitive cases (e.g., recurring-linked rows) to row path until parity work is complete.

#### 2.3 Run metrics for operational clarity

- Add counters to process run snapshot/log metadata:
  - `batchPathProcessed`,
  - `rowFallbackProcessed`,
  - `rowFallbackErrors`,
  - `rowFallbackDeferred`,
  - `splitOperations`.
- This supports tuning without changing UX first.

#### 2.4 Tests for Task 2

- Mixed-batch tests:
  - resolved + unresolved + recurring-linked rows.
- Verify:
  - correct routing (batch vs row),
  - final status semantics,
  - per-row error persistence,
  - no regression of existing run endpoints.

### Configuration Plan (Backend)

- Donor-match execution knobs (new):
  - `FUNDRAISING_DONOR_MATCH_LOOKUP_DELAY_MS`,
  - `FUNDRAISING_DONOR_MATCH_LOOKUP_BATCH_SIZE`,
  - `FUNDRAISING_DONOR_MATCH_CREATE_CHUNK_SIZE`,
  - `FUNDRAISING_DONOR_MATCH_CREATE_DELAY_MS`.
- Reuse existing process-run knobs:
  - `FUNDRAISING_BATCH_PROCESS_EXECUTOR_MODE`,
  - `FUNDRAISING_BATCH_PROCESS_CHUNK_SIZE`,
  - `FUNDRAISING_BATCH_PROCESS_BATCH_DELAY_MS`,
  - `FUNDRAISING_BATCH_PROCESS_ROW_DELAY_MS`.

### Delivery order

1. Shared identity-resolution service extraction.
2. Donor-match run endpoints + persistence.
3. Explicit create-donors endpoint.
4. Process-run hardening using donor-match state.
5. Tests + docs sync.

### Acceptance criteria for this slice

- Donor-match can be run repeatedly on a batch without duplicate side effects.
- Every row in donor-match run has explicit persisted outcome.
- Process-batch still works with one-click API and remains backward compatible.
- Process run clearly reports batch-path vs row-fallback behavior.
- Existing batch-process tests remain green; new tests cover donor-match and mixed routing.

## Implementation Update (2026-02-07)

This section is appended intentionally for continuity after context compaction.

### What was implemented in code

1. Shared identity-resolution service extraction
- Added `services/fundraising-service/src/identity-resolution/person-identity.service.ts`
  - centralizes person duplicate lookup + person create logic
  - exports reusable types and methods:
    - `findExistingPersonMatch(...)`
    - `lookupDuplicateCandidates(...)`
    - `createPerson(...)`
- Added `services/fundraising-service/src/identity-resolution/identity-resolution.module.ts`
- Refactored `services/fundraising-service/src/gift/gift.service.ts` to use this service (row-level behavior preserved).

2. Donor-match batch backend workflow
- Added `services/fundraising-service/src/gift-batch/gift-batch-donor-match.service.ts`
  - async run model with statuses:
    - `queued`, `running`, `completed`, `completed_with_errors`, `failed`
  - one-active-run-per-batch guard
  - run endpoints support:
    - start + poll
  - per-row explicit outcomes persisted and returned:
    - `already_resolved`
    - `auto_linked`
    - `partial_match_review`
    - `no_match`
    - `insufficient_identity`
    - `error`
  - selected-row donor creation path:
    - `created_donor`
- Added controller routes in `services/fundraising-service/src/gift-batch/gift-batch.controller.ts`:
  - `POST /gift-batches/:id/donor-match`
  - `GET /gift-batches/:id/donor-match/:runId`
  - `POST /gift-batches/:id/donor-match/create-donors`

3. Staging persistence support for outcome durability
- Extended staging payload update path to persist donor-match outcome metadata under `processingDiagnostics.identityResolution`:
  - updated `services/fundraising-service/src/gift-staging/gift-staging.service.ts`
  - updated `services/fundraising-service/src/gift-staging/utils/payload-merger.util.ts`
  - widened diagnostics typing in `services/fundraising-service/src/gift/gift.types.ts`
- Outcome persistence writes:
  - dedupe status updates where relevant
  - donor id on auto-link/create
  - error detail on explicit donor-match error cases

4. Module wiring
- Updated `services/fundraising-service/src/gift/gift.module.ts` and `services/fundraising-service/src/gift-batch/gift-batch.module.ts` to import the shared identity module.

### Added/updated tests

- Added:
  - `services/fundraising-service/src/gift-batch/gift-batch-donor-match.service.spec.ts`
- Updated:
  - `services/fundraising-service/src/gift/gift.service.spec.ts` constructor wiring for new shared service dependency.

### Verification run in this session

- `npm test -- gift-batch/gift-batch-donor-match.service.spec.ts` passed.
- `npm test -- gift/gift.service.spec.ts` passed.
- `npm test -- gift-batch/gift-batch-processing.service.spec.ts` passed.
- `npm run build` passed.

### Follow-up notes (deferred intentionally)

1. Duplicate lookup path consolidation
- Manual entry duplicate suggestions still use `PeopleService.findDuplicates` path.
- Batch/row processing now uses shared `PersonIdentityService`.
- Add a follow-up task to unify these so matching behavior and policy stay consistent across UI preview and processing flows.

2. Bulk API strategy for donor creation
- Current donor creation in donor-match `create-donors` is chunked + paced row calls (`/people`) with explicit per-row outcomes.
- Rate-limit controls are present via env knobs:
  - `FUNDRAISING_DONOR_MATCH_LOOKUP_DELAY_MS`
  - `FUNDRAISING_DONOR_MATCH_LOOKUP_BATCH_SIZE`
  - `FUNDRAISING_DONOR_MATCH_CREATE_CHUNK_SIZE`
  - `FUNDRAISING_DONOR_MATCH_CREATE_DELAY_MS`
- Follow-up decision remains open: evaluate hybrid use of `/batch/people` for higher throughput while preserving clear row-level error visibility.

## Implementation Update (2026-02-07, Task 2 Completed)

### Process-batch hardening delivered

1. Identity preflight summary added to process run snapshot
- `GiftBatchRunSnapshot` now includes:
  - `preflight.identityReadiness` with:
    - `resolved`
    - `unresolved`
    - `insufficientIdentity`
    - `partialReviewPending`
- Computed at run start from batch candidate rows.

2. Routing safeguard for parity-sensitive rows
- Recurring-linked rows (`recurringAgreementId` present) are now forced to row path in hybrid mode.
- This keeps recurring side effects on the existing row processing path until explicit parity work is implemented on batch path.

3. Execution metrics added to process run snapshot/logging
- `execution` counters now include:
  - `batchPathProcessed`
  - `rowFallbackProcessed`
  - `rowFallbackErrors`
  - `rowFallbackDeferred`
  - `splitOperations`
- These metrics are intended for tuning/observability and are backward-compatible additions.

### Additional tests completed

- Added dedicated shared-service tests:
  - `services/fundraising-service/src/identity-resolution/person-identity.service.spec.ts`
- Extended process-run tests with mixed routing + metrics assertions:
  - `services/fundraising-service/src/gift-batch/gift-batch-processing.service.spec.ts`

### Verification run (post Task 2)

- `npm test -- identity-resolution/person-identity.service.spec.ts` passed.
- `npm test -- gift-batch/gift-batch-processing.service.spec.ts` passed.
- `npm test -- gift-batch/gift-batch-donor-match.service.spec.ts` passed.
- `npm test -- gift/gift.service.spec.ts` passed.
- `npm run build` passed.

## Implementation Update (2026-02-07, Bulk Smoke Harness + Batch Isolation Fix)

### New bulk smoke harness

- Added script:
  - `services/fundraising-service/scripts/smoke-gift-batch-bulk.mjs`
- Added npm command:
  - `npm run smoke:gift-batch:bulk -- --rows=8`
- Purpose:
  - seed CSV-like staging rows into a new batch,
  - run donor-match,
  - run explicit create-donors,
  - mark rows ready,
  - run process batch,
  - assert outcomes.

### Critical issue discovered during smoke run

- During first live run, donor-match attempted more rows than seeded.
- Root cause:
  - fundraising-service list query params were not translated to Twenty REST list syntax.
  - Twenty expects `filter` / `order_by` / `starting_after`; raw `giftBatchId` / `sort` / `cursor` params are ignored on `/rest/giftStagings`.

### Fix applied

- Added query translation in staging list service so fundraising-service now sends Twenty-native params:
  - `filter` (including `giftBatchId`), `order_by`, `starting_after`.
  - file: `services/fundraising-service/src/gift-staging/gift-staging.service.ts`
- Added explicit in-service batch isolation in both run loaders:
  - `services/fundraising-service/src/gift-batch/gift-batch-donor-match.service.ts`
  - `services/fundraising-service/src/gift-batch/gift-batch-processing.service.ts`
- Candidate rows are now filtered by `row.giftBatchId === batchId` in code, independent of upstream query filtering behavior.

### Test updates for isolation behavior

- Updated donor-match and process service specs to include `giftBatchId` on rows and out-of-batch rows in fixtures:
  - `services/fundraising-service/src/gift-batch/gift-batch-donor-match.service.spec.ts`
  - `services/fundraising-service/src/gift-batch/gift-batch-processing.service.spec.ts`
- Added shared identity tests:
  - `services/fundraising-service/src/identity-resolution/person-identity.service.spec.ts`

### Verification run (after isolation fix)

- `npm test -- gift-batch/gift-batch-processing.service.spec.ts` passed.
- `npm test -- gift-batch/gift-batch-donor-match.service.spec.ts` passed.
- `npm test -- identity-resolution/person-identity.service.spec.ts` passed.
- `npm run build` passed.

### Operational note

- The first bulk smoke run (before isolation fix was deployed) updated donor-match diagnostics on many existing staging rows in the local environment because batch isolation was not yet active in runtime.
- Rebuild/restart the stack before rerunning bulk smoke so runtime reflects the fix.

## Session Status Snapshot (2026-02-07, latest)

### What is complete

1. Task 1 (Donor Match backend) is complete
- Shared identity-resolution service extracted and reused.
- Donor-match run endpoints implemented.
- Selected-row `create-donors` endpoint implemented.
- Explicit donor-match row outcomes persisted to staging diagnostics.

2. Task 2 (Process Batch hardening) is complete
- Process run now reports identity preflight summary.
- Hybrid routing safeguards added (recurring-linked rows forced to row path).
- Execution counters added for batch path vs row fallback behavior.

3. Gift-staging list query translation fix is present
- Query translation now uses Twenty-native parameters:
  - `starting_after` for cursor
  - `order_by` for sorting
  - `filter` for statuses/intake source/recurring agreement/batch/search
- This addresses the earlier symptom where `giftBatchId` filtering was ineffective.

4. Batch isolation invariant retained intentionally
- Both donor-match and process-run candidate loaders enforce:
  - `row.giftBatchId === batchId`
- This is kept as a low-cost safety invariant.

### Verification status (latest)

- `npm test -- gift-staging/gift-staging.service.spec.ts` passed.
- `npm test -- gift-batch/gift-batch-processing.service.spec.ts` passed.
- `npm test -- gift-batch/gift-batch-donor-match.service.spec.ts` passed.
- Shared identity tests pass.
- Build passes.

### Recommended next steps

1. Rebuild/restart local stack so runtime uses latest code.
2. Run API-first bulk smoke:
  - start with `--rows=8`
  - then `--rows=20` or `--rows=30`
3. Do light UI verification for process-batch flow in staging queue.

### Deferred by design (not in this slice)

- Donor-match UI wiring.
- Consolidation of manual-entry duplicate path with shared identity service.
- Optional `/batch/people` hybrid strategy for donor creation throughput.

## Implementation Update (2026-02-08, Batch Payload + Failure Persistence)

### 1) `/batch/gifts` payload fix

- Root cause confirmed in runtime logs:
  - `/batch/gifts` rejected payloads containing `giftAidEligible` with:
    - `Object gift doesn't have any "giftAidEligible" field.`
- Fix applied:
  - removed `giftAidEligible` from hybrid batch payload construction in:
    - `services/fundraising-service/src/gift-batch/gift-batch-processing.service.ts`
- Validation:
  - bulk smoke run after rebuild showed batch fast path active:
    - `batchPathProcessed: 8`
    - `rowFallbackProcessed: 0`

### 2) `errorDetail` schema alignment for failed rows

- Issue discovered:
  - row-level process failures were sometimes not persisting `process_failed` status.
  - logs showed PATCH rejection:
    - `Invalid object value ... for field "errorDetail"`
- Root cause:
  - `giftStaging.errorDetail` was provisioned as `RAW_JSON`, but processing writes plain text.
- Decision and fix:
  - keep failure reason as plain text and change schema to `TEXT`.
  - updated setup script in:
    - `services/fundraising-service/scripts/setup-schema.mjs`
  - local workflow used:
    - delete old field in Twenty UI,
    - rerun setup script to recreate `errorDetail` as `TEXT`.
- Validation:
  - reran row-fallback-error scenario:
    - error row persisted as `processingStatus: process_failed`
    - `errorDetail` persisted with failure message text.

### 3) Bulk smoke harness extension

- Extended script:
  - `services/fundraising-service/scripts/smoke-gift-batch-bulk.mjs`
- Added scenario support:
  - `--scenario=happy-path`
  - `--scenario=mixed-routing`
  - `--scenario=row-fallback-error`
  - `--scenario=all` (runs all three)
- Added scenario-focused assertions:
  - mixed routing must show at least one row fallback and successful overall processing.
  - row-fallback-error must show `completed_with_errors` with row fallback error metrics.
- Added smoke-side rate-limit resilience for setup/update calls:
  - retry/backoff wrappers for staging row PATCH/status operations to reduce transient 429/503 noise during test setup.

### 4) Latest evidence snapshot

- `--scenario=mixed-routing --rows=6`:
  - `batchPathProcessed: 5`
  - `rowFallbackProcessed: 1`
  - `errors: 0`
- `--scenario=row-fallback-error --rows=6` after schema fix:
  - `status: completed_with_errors`
  - `batchPathProcessed: 5`
  - `rowFallbackErrors: 1`
  - error row stored as `process_failed` with plain-text `errorDetail`.

## Implementation Update (2026-02-08, Async Create-Donors + Hybrid Donor Creation + Batch Duplicate Lookup)

### 1) Async create-donors run model added (process-batch aligned)

- Added create-donors run lifecycle to donor-match service:
  - statuses: `queued`, `running`, `completed`, `completed_with_errors`, `failed`
  - one active create-donors run per batch guard
  - in-memory run state (same durability profile as process/donor-match runs)
- New endpoints:
  - `POST /gift-batches/:id/donor-match/create-donors/run`
  - `GET /gift-batches/:id/donor-match/create-donors/run/:runId`
- Existing sync endpoint remains available in code during transition:
  - `POST /gift-batches/:id/donor-match/create-donors`

### 2) Create-donors executor upgraded to hybrid donor creation

- Execution behavior:
  - classify selected rows first (`already_resolved`, `insufficient_identity`, out-of-batch, not-found)
  - unresolved + valid identity rows:
    - single row -> `POST /people`
    - multi-row -> `POST /batch/people`
  - on `/batch/people` failure:
    - recursive split (binary)
    - single-row fallback for isolation
- Row-level outcomes remain explicit and persisted to staging diagnostics.
- This preserves operator explainability while improving throughput over pure row-by-row create.

### 3) Donor-match duplicate lookup upgraded to batched lookup

- Added batch duplicate lookup path in shared identity service:
  - `POST /people/duplicates?depth=0` with `data: [...]`
- Donor-match run now evaluates unresolved rows in lookup batches (configurable batch size).
- Added env knob:
  - `FUNDRAISING_DONOR_MATCH_LOOKUP_BATCH_SIZE` (default `20`)

### 4) Duplicate lookup semantics tightened (explicit outcomes)

- `no duplicates found` in batch lookup is now explicit:
  - returns `candidates: { candidateIds: [] }`
- missing lookup result entries are now explicit errors:
  - `error: "duplicate_lookup_result_missing"`
- transport/API failures in lookup batches are explicit per-row errors (not implicit no-match).

### 5) Smoke harness updates for new async create-donors flow

- Updated smoke script to use async create-donors run endpoints:
  - start create-donors run, poll to terminal status, then continue.
- Added rate-limit retry on batch row verification listing (`listBatchRows`) to reduce false negatives from transient 503/429.

### 6) Verification snapshot (this session)

- Unit/build verification:
  - `npm test -- gift-batch/gift-batch-donor-match.service.spec.ts` passed.
  - `npm test -- identity-resolution/person-identity.service.spec.ts` passed.
  - `npm test -- gift/gift.service.spec.ts` passed.
  - `npm run build` passed.
- Functional smoke (small batches) after rebuild:
  - `--scenario=mixed-routing --rows=8` passed.
    - donor-match: `completed`
    - create-donors: `completed`
    - process: `completed`
    - execution: `batchPathProcessed: 7`, `rowFallbackProcessed: 1`
  - `--scenario=row-fallback-error --rows=8` passed.
    - process: `completed_with_errors`
    - execution: `batchPathProcessed: 7`, `rowFallbackErrors: 1`
    - failing row persisted as `process_failed` with plain-text `errorDetail`

### 7) Medium-batch issue observed (important)

- Medium `rows=20` flows reached terminal success for donor-match/create-donors/process runs, but smoke verification intermittently hit:
  - `503 Service Unavailable` from fundraising-service caused by Twenty `429` rate limiting.
- Logs confirm repeated Twenty responses:
  - `"Limit reached (100 tokens per 60000 ms)"`
- This is not a core logic failure in run orchestration; it is rate-limit pressure under request volume.

### 8) Larger-batch follow-up (open)

- Even with `/batch/people` and `/batch/gifts`, request volume remains high due to per-row staging reads/writes and status updates.
- Next hardening discussion should focus on reducing staging update chatter in bulk paths and tuning pacing to shared-key limits.

## Strategy Update (2026-02-08, Larger Batch Hardening Plan)

### Product/technical alignment

- We should use a combined approach:
  1. make API usage more efficient by design,
  2. then validate realistic operating behavior,
  3. then add production-grade guardrails.
- Hitting limits around medium runs is treated as an early warning, not a reason to relax quality standards.

### What in smoke is realistic vs compressed

- Realistic in production:
  - an admin can run `donor-match`, then `create-donors`, then `process batch` in a short session,
  - each step generates real Twenty traffic and competes in the shared key bucket.
- Compressed/synthetic in smoke:
  - setup + orchestration + polling + verification all happen in one tight script loop,
  - many row updates are executed with minimal human pause,
  - this increases minute-level burst pressure.

### Phased hardening strategy (agreed)

#### Phase A: API efficiency first (next implementation focus)

- Reduce avoidable staging read/write chatter in bulk paths.
- Goal:
  - fewer per-row calls while preserving row-level outcomes and audit clarity.
- Examples of likely targets:
  - avoid unnecessary read-backs after writes in run paths,
  - reduce GET-before-PATCH patterns where payload context is already available.

#### Phase B: realistic-load validation

- Test orchestration under a more production-like sequence:
  - run donor-match,
  - short pause,
  - run create-donors,
  - short pause,
  - run process batch.
- Validate at step-up sizes:
  - 30, 60, 100 rows.
- Goal:
  - separate true architectural limits from smoke-only burst artifacts.

#### Phase C: production-grade guardrails

- Add shared backpressure/throttling in fundraising-service for Twenty requests.
- Goal:
  - predictable behavior under concurrent operations and shared-key contention.
- This is a safety net and does not replace Phase A efficiency work.

### Why this order

1. Efficiency before throttling avoids “slow but still noisy” behavior.
2. Realistic-load validation gives a credible decision basis for production posture.
3. Throttling then provides controlled degradation under high concurrency.

## Implementation Update (2026-02-08, Create-Donors Async-Only Cleanup)

### What changed

- Removed the legacy synchronous create-donors API route:
  - deleted `POST /gift-batches/:id/donor-match/create-donors`
- Removed the corresponding public sync service method and legacy sync result type.
- Kept only run-based create-donors flow:
  - `POST /gift-batches/:id/donor-match/create-donors/run`
  - `GET /gift-batches/:id/donor-match/create-donors/run/:runId`

### Why

- Aligns create-donors with process-batch/donor-match run model.
- Prevents dual execution paths for the same operation.
- Simplifies upcoming Phase A API-efficiency changes to one execution path.

### Verification

- `npm test -- gift-batch/gift-batch-donor-match.service.spec.ts` passed.
- `npm run build` passed.

## Stage 1 Plan (2026-02-09, Context Anchor)

This section is intentionally appended as a context anchor before implementation so later sessions can resume without re-deriving design intent.

### Goal

Implement a safe bulk update writer for `giftStagings` so bulk flows can replace row-by-row PATCH calls where payload is shared.

### Confirmed API contract (lightweight probe)

- Batch update endpoint works for custom object:
  - `PATCH /rest/batch/giftStagings?filter=id[in]:["<id1>","<id2>"]`
- Request body is a shared patch object (not per-row payload array).
- Success response shape:
  - `{ data: { updateGiftStagings: [...] } }`
- Invalid payload returns:
  - `400 BadRequestException` with `messages[]` field-level detail.
- Mixed-invalid probe showed no row changes, consistent with atomic batch behavior.

### Stage 1 scope (only)

1. Add `GiftStagingService.patchGiftStagingBatchByIds(...)`.
2. Enforce guardrails:
   - non-empty ID list,
   - dedup IDs,
   - max 60 IDs per request,
   - non-empty patch payload,
   - explicit `id[in]` filter only.
3. Keep single-row `patchGiftStagingById(...)` unchanged for fallback use.
4. Add/adjust `gift-staging.service.spec.ts` coverage for route/payload guardrails.

### Out of scope for Stage 1

- Donor-match/service refactors to consume batch writer.
- Process-run writer refactors.
- Throttling/backoff tuning.

### Why this order

- Highest confidence, lowest coupling: establish one tested bulk writer primitive first.
- Stages 2+ can then switch call sites incrementally with rollback safety.

## Stage 2 Update (2026-02-09, Donor-Match Grouped Writes)

### Scope completed

- Refactored donor-match run persistence in `GiftBatchDonorMatchService` to use grouped writes:
  - outcomes are still computed per row,
  - row updates are collected as intents,
  - intents are grouped by identical patch payload,
  - grouped writes use `GiftStagingService.patchGiftStagingBatchByIds(...)`.

### Fallback/safety behavior

- Batch write fallback is recursive split:
  - attempt grouped batch write,
  - on failure split IDs and retry,
  - single-ID fallback uses existing `patchGiftStagingById(...)`.
- Guardrails from Stage 1 still apply at the writer layer (`<=60`, non-empty ids/payload).

### Important implementation nuance

- To enable grouping for donor-match outcomes, `identityResolution.processedAt` is now consistent within a donor-match run pass (single timestamp per run execution pass), instead of being generated independently per row.
- This preserves row-level outcome fidelity while avoiding artificial payload drift that prevents grouping.

### Verification

- `npm test -- gift-batch/gift-batch-donor-match.service.spec.ts` passed.
- Added/updated coverage includes:
  - grouped identical outcomes result in one batch patch call,
  - existing donor-match/create-donors behavior remains green.

### Remaining for next stage

- Create-donors write path still persists row-by-row updates and can be migrated to grouped batch writes in Stage 3.

## Stage 3 Update (2026-02-09, Create-Donors Grouped Writes)

### Scope completed

- Refactored create-donors run persistence in `GiftBatchDonorMatchService` to use grouped staging writes:
  - outcomes still computed per row,
  - row update intents are collected,
  - intents grouped by identical payload,
  - grouped writes executed via `patchGiftStagingBatchByIds(...)`.

### Fallback/safety behavior

- Reuses the same writer fallback stack as donor-match stage:
  - batch write attempt,
  - split on failure,
  - single-row fallback.

### Important implementation nuance

- Create-donors diagnostics now use the create-donors run id for `identityResolution.runId` (instead of per-row generated ids), with a single pass timestamp. This avoids artificial payload drift and improves traceability.

### Verification

- `npm test -- gift-batch/gift-batch-donor-match.service.spec.ts` passed.
- Added coverage includes:
  - grouped identical create-donors updates perform a single batch patch call.

## Implementation Update (2026-02-09, API Pressure Hardening Pass)

### Scope completed in this pass

1. Twenty API retry policy tuned for 429 behavior
- File: `services/fundraising-service/src/twenty/twenty-api.service.ts`
- Changes:
  - 429 retry delays now use `1000ms` then `2500ms` with jitter.
  - 5xx retry delays remain short (`250ms`, `500ms`).
  - `Retry-After` is honored as an upper floor via `max(retry_after, computed_delay)`.
  - Added HTTP-date parsing for `Retry-After` in addition to numeric seconds.

2. Donor-match candidate scope tightened for reruns
- File: `services/fundraising-service/src/gift-batch/gift-batch-donor-match.service.ts`
- Changes:
  - Donor-match candidate loader now skips rows already identity-resolved (`donorId` or `companyId`) in addition to already processed rows.
  - This keeps reruns focused on unresolved identities.

3. No-op staging write suppression added for donor-match/create-donors
- File: `services/fundraising-service/src/gift-batch/gift-batch-donor-match.service.ts`
- Changes:
  - Row persistence now computes effective field changes before patching.
  - If no effective change (`donorId`, `dedupeStatus`, `errorDetail`, `processingDiagnostics`), row write is skipped.
  - Diagnostics builder now reuses existing `identityResolution` payload when semantic outcome is unchanged, preventing churn-only writes due to run metadata drift.

4. Process writeback correctness hardened
- Files:
  - `services/fundraising-service/src/gift-staging/gift-staging.service.ts`
  - `services/fundraising-service/src/gift-batch/gift-batch-processing.service.ts`
  - `services/fundraising-service/src/gift-staging/gift-staging-processing.service.ts`
- Changes:
  - `markProcessedById(...)` now returns success/failure (`boolean`) instead of silent void.
  - Batch process path now only counts batch-path rows as processed when staging writeback succeeds.
  - On writeback failure, run records row error and attempts to persist `process_failed` + error detail.
  - Row-level `processGift(...)` now returns error when gift create succeeded but staging writeback failed, instead of false-success processed outcome.

### Tests and verification

- `npm test -- gift-batch/gift-batch-donor-match.service.spec.ts` passed.
- `npm test -- gift-batch/gift-batch-processing.service.spec.ts gift-staging/gift-staging-processing.service.spec.ts` passed.
- `npm run build` passed.

### New/updated tests in this pass

- `gift-batch-donor-match.service.spec.ts`
  - updated expectations for skipping already-resolved rows in donor-match candidate load.
  - added no-op write suppression test for unchanged donor-match outcomes.
- `gift-batch-processing.service.spec.ts`
  - added writeback failure test to ensure batch-path row is not counted as processed and row status is marked failed.
- `gift-staging-processing.service.spec.ts`
  - added writeback failure test to ensure `processGift` returns error and persists failure detail.

## Smoke + Ledger Comparison (2026-02-09, post API-pressure hardening)

### Run executed

- Command: `npm run smoke:gift-batch:bulk -- --rows=30 --scenario=all`
- Output log: `/tmp/smoke-30all-latest.log`
- Docker log window used for ledger: `/tmp/fundraising-run-30all-latest.log`

### Functional result

- happy-path: `completed` (`batchPathProcessed=30`, `rowFallbackProcessed=0`)
- mixed-routing: `completed` (`batchPathProcessed=29`, `rowFallbackProcessed=1`)
- row-fallback-error: `completed_with_errors` (`batchPathProcessed=29`, `rowFallbackErrors=1`)

### Ledger delta vs prior 30/all baseline

Prior baseline (pre-hardening) request-level totals:
- logical: `235`
- attempts: `628`
- retries: `393`

Current run (post-hardening) request-level totals:
- logical: `235`
- attempts: `371`
- retries: `136`

Delta:
- logical: unchanged (`0`)
- attempts: `-257` (about `-40.9%`)
- retries: `-257` (about `-65.4%`)

### Notes

- Core call plan remains the same (logical unchanged), but retry amplification dropped substantially.
- Two terminal `429` errors were observed on batch metadata PATCH at end of happy process run; these are currently non-fatal because batch status/progress updates are guarded with safe-update behavior.

## New Lead (2026-02-09): `createMany` with `upsert=true` for per-row unique staging updates

### Why this matters

- Current bottleneck remains unique per-row staging writebacks (`donorId`, `giftId`) after bulk create paths.
- `updateMany` in Twenty only supports one shared payload + filter, so it cannot carry per-row unique values in one call.
- Twenty team guidance indicates `createMany` supports `upsert: true`; this may allow per-row unique updates in a single API call when each row includes `id` + changed fields.

### Quick source evidence reviewed

- REST create-many handler parses `upsert` query flag:
  - `services/twenty-core/packages/twenty-server/src/engine/api/rest/core/handlers/rest-api-create-many.handler.ts`
  - `services/twenty-core/packages/twenty-server/src/engine/api/rest/input-request-parsers/upsert-parser-utils/parse-upsert-rest-request.util.ts`
- Upsert conflict matching includes `id` as conflict key candidate:
  - `services/twenty-core/packages/twenty-server/src/engine/api/common/common-query-runners/common-create-many-query-runner/utils/get-conflicting-fields.util.ts`
- `createMany` upsert path categorizes update vs insert and performs update operations in one request path:
  - `services/twenty-core/packages/twenty-server/src/engine/api/common/common-query-runners/common-create-many-query-runner/common-create-many-query-runner.service.ts`

### Hypothesis

- We may be able to replace many `PATCH /giftStagings/:id` calls with one:
  - `POST /rest/batch/giftStagings?upsert=true`
  - body: array of `{ id, ...rowSpecificFields }`
- If behavior is safe/understood, this can materially reduce request count for:
  - create-donors staging writeback,
  - process-batch staging writeback.

### Validation questions before adoption

1. Mixed-validity behavior:
- if one row in upsert payload is invalid, does whole request fail or partial apply?
2. Non-existent `id` behavior:
- does upsert insert a new row, or fail?
- if insert occurs, can we reliably prevent that with service-level guardrails?
3. Response shape and mapping:
- does response reliably include updated records and preserve input-order mapping for row outcome correlation?
4. Throughput/rate behavior:
- does one upsert call materially reduce effective request pressure vs row PATCH in our 30-row/60-row smoke context?
5. Safe chunk size:
- docs/claims vary (60 vs larger internal constant); maintain 60 until empirically verified.

### Proposed next spike (targeted, no broad refactor yet)

1. Add a focused script/probe for `/batch/giftStagings?upsert=true` on existing rows.
2. Run 3 probes:
- all-valid updates,
- mixed-valid/invalid update payload,
- payload containing unknown id.
3. Capture:
- response shape,
- success/failure semantics,
- side effects on unchanged/unknown rows.
4. Decide adoption for create-donors/process writebacks based on evidence.

## Implementation Update (2026-02-09, Upsert Validation + Guarded Adoption)

### Validation probe result (local)

Probe script:
- `services/fundraising-service/scripts/probe-gift-staging-upsert.mjs`

Observed against local stack:
1. `POST /rest/batch/giftStagings?upsert=true` supports per-row unique payloads.
- Distinct fields per row were persisted successfully in one request.
2. Mixed valid/invalid payload behaves atomically.
- One invalid row produced `400` and no rows changed.
3. Unknown `id` in payload can create a row.
- This confirms we must enforce strict service-level guardrails.

### Guardrails implemented

In `GiftStagingService`:
- Added `upsertGiftStagingBatch(records, allowedIds?)`.
- Enforces:
  - non-empty records, max 60, unique/non-empty ids,
  - non-empty per-row update payload,
  - optional allowed-id set restriction.
- Adds pre-write existence check:
  - verifies all ids exist before issuing upsert.
- Adds strict response validation:
  - response id count and id set must exactly match requested ids.

### Runtime wiring

1. Donor-match / create-donors persistence (`GiftBatchDonorMatchService`)
- Existing shared-payload groups still use `patchGiftStagingBatchByIds(...)`.
- Singleton/unique intents are now upserted in chunks with split fallback:
  - multi-row unique writes -> `upsertGiftStagingBatch(...)`
  - fallback -> recursive split, then single-row `patchGiftStagingById(...)`.

2. Process-batch writeback (`GiftBatchProcessingService`)
- After `/batch/gifts` create, multi-row staging writeback now uses:
  - `upsertGiftStagingBatch(...)` with per-row `{ id, giftId, processed statuses }`.
- Fallback behavior preserved:
  - split recursively on failure,
  - single-row fallback via existing `markProcessedById(...)`,
  - row-level failure accounting/status persistence unchanged.

### Test status

Focused suites passing:
- `gift-staging/gift-staging.service.spec.ts`
- `gift-batch/gift-batch-donor-match.service.spec.ts`
- `gift-batch/gift-batch-processing.service.spec.ts`

Net effect:
- We now have an implemented path for high-volume, unique per-row staging writes without N row-level PATCH calls in the happy path.

### Post-change smoke snapshot (2026-02-09, happy-path rows=30)

Run:
- `npm run smoke:gift-batch:bulk -- --rows=30 --scenario=happy-path`

Functional result:
- donor-match: `completed`
- create-donors: `completed`
- process: `completed`
- execution: `batchPathProcessed=30`, `rowFallbackProcessed=0`

Request/retry ledger (by run requestId from structured logs):
- donor-match: `logical=5`, `attempts=5`, `retries=0`
- create-donors: `logical=6`, `attempts=6`, `retries=0`
- process: `logical=9`, `attempts=14`, `retries=5`, `http_errors=0`

Interpretation:
- Upsert wiring is functionally stable in happy-path flow.
- Remaining retry pressure is now concentrated in process-phase shared-key contention, not in row-by-row staging writeback volume.

## Implementation Update (2026-02-09, trustIds fast path + process pacing)

### Changes made

1. Trusted-ID fast path for upsert
- `GiftStagingService.upsertGiftStagingBatch(...)` now supports options `{ trustIds?: boolean }`.
- In `trustIds=true` mode:
  - skips `ensureExistingGiftStagingIds(...)` pre-check read,
  - still enforces: max-60, unique/non-empty IDs, non-empty updates, allowed-id membership, strict response ID-set match.
- Guardrail:
  - `trustIds=true` requires an `allowedIds` set.

2. Wired trusted fast path into internal run-owned flows
- Donor-match/create-donors unique write intents now call upsert with:
  - `allowedIds` + `{ trustIds: true }`.
- Process-batch multi-row writeback now calls upsert with:
  - `allowedIds` + `{ trustIds: true }`.

3. Process pacing cleanup
- Removed unconditional `batchDelayMs` sleep in `createBatchGifts(...)`.
- Delay is now applied only between hybrid chunk iterations (not after final chunk).

### Test status

Focused suites passing:
- `gift-staging/gift-staging.service.spec.ts`
- `gift-batch/gift-batch-donor-match.service.spec.ts`
- `gift-batch/gift-batch-processing.service.spec.ts`

### 30/all smoke comparison (post-upsert baseline -> trustIds refinement)

Functional result:
- unchanged and passing for all scenarios (`happy`, `mixed-routing`, `row-fallback-error`).

Ledger totals:
- previous (post-upsert, before trustIds): `logical=71`, `attempts=100`, `retries=29`
- current (post-trustIds): `logical=65`, `attempts=94`, `retries=29`

Delta:
- logical: `-6`
- attempts: `-6`
- retries: unchanged

Interpretation:
- Fast path removed additional conservative read calls as intended.
- Retry volume did not improve in this run, indicating residual 429 pressure is still dominated by shared-key burst/timing rather than this specific read optimization.

## Deferred Follow-up Queue (Session Wrap)

These items were discussed and intentionally deferred unless priority changes:

1. Full observability expansion
- Promote current structured logs into dashboards/alerts/SLO-oriented telemetry.

2. Aggressive tuning for 100/200+ row runs under concurrent system load
- Dedicated load-test session with controlled baseline and tuning criteria.

3. UI polish for donor-match/create-donors run surfaces
- Keep backend-first progress; return in a focused UX iteration.

4. Service-level throttling/backpressure for shared Twenty API key budget
- Add explicit shared-key shaping beyond per-request retries.

5. Smarter split-fallback classification
- Current split fallback is correctness-first and catches all batch failures.
- Future improvement: classify transient infra/rate-limit failures differently from data-shape failures to reduce amplification.

6. Durable run persistence
- Current run state is in-memory by design.
- Consider persistent run records/checkpoints after initial feature validation.

7. Hybrid parity gaps (notably recurring-linked side effects)
- Keep recurring-sensitive rows on row path until parity is intentionally implemented.

8. Identity workflow and policy decisions
- Final donor-match labeling/copy.
- Exact auto-link threshold policy.
- Company matching policy and explicit confirmation UX for creation flows.

9. Duplicate-matching consistency
- Unify manual-entry duplicate suggestion behavior with shared identity service behavior used by donor-match/process.

10. Throughput knob tuning
- Revisit defaults like donor-match lookup batch size (`20`) and create-donors chunk size (`25`) after 60-row/100-row comparative runs.

11. Batch create response-order assumption (known risk)
- Current implementation maps batch-create results (`/batch/people`, `/batch/gifts`) by index order.
- Assumption: Twenty `createMany` response order matches request order.
- Decision for now: keep this approach to preserve throughput and avoid extra API pressure.
- Guardrail to add when prioritized: if post-create mapping/contract validation fails, fail the chunk and surface explicit error (no split/retry of create call to avoid duplicate side effects).

12. Frontend fallback resilience for partial ID lookup failures
- Current `useGiftBatchLookup` fallback path can lose partial successes when one request in a fallback chunk fails.
- This is primarily a transient network/backend instability concern (not core domain logic).
- Hardening follow-up: switch fallback chunk handling from `Promise.all` to `Promise.allSettled` so successful label lookups are retained even when one ID fetch fails.

## Items To Raise With Twenty

1. Response order contract for `createMany`/REST batch create
- Is response order guaranteed to match request order for endpoints such as `/rest/batch/people` and `/rest/batch/gifts`?
- Is this guarantee documented and considered stable across versions?

2. Correlation support in batch create responses
- Is there a supported way to pass a client correlation token per row and receive it back in response rows?
- If not, is this on roadmap?

3. Upsert semantics clarity for custom objects
- Confirm expected behavior for `POST /rest/batch/<object>?upsert=true` when all rows target existing IDs.
- Confirm behavior and recommended safeguards when an ID does not exist.

4. Batch atomicity for create/upsert/updateMany
- Confirm whether operations are atomic per request and whether any partial-success mode exists.
- Confirm if semantics differ by object type or endpoint family.

## Implementation Update (2026-02-10, minimal correlation-contract hardening)

### What changed

1. Added explicit `CorrelationContractFailure` classification
- New shared type in fundraising service:
  - `src/twenty/correlation-contract.failure.ts`
- Used to represent post-create contract issues (for now):
  - `response_length_mismatch`
  - `missing_record_id`

2. Process-batch (`/batch/gifts`) now avoids split/retry on contract failures
- In `GiftBatchProcessingService`:
  - contract failures thrown from `createBatchGifts(...)` (length mismatch/missing id),
  - `processHybridEntries(...)` detects this class and:
    - logs structured event + metric fields (`gift_batch_process_correlation_contract_failure`),
    - records per-row error outcomes and persists `process_failed` with correlation failure detail,
    - rethrows to fail run (no split/retry of create call).

3. Create-donors (`/batch/people`) now avoids split/retry on contract failures
- In `GiftBatchDonorMatchService`:
  - contract failures thrown in `createDonorsForChunk(...)` for length mismatch/missing person id,
  - catch path logs structured event + metric fields (`gift_batch_create_donors_correlation_contract_failure`) and rethrows,
  - no split/retry for this class.
- In `PersonIdentityService.createPeopleBatch(...)`:
  - malformed `/batch/people` response is now classified as `CorrelationContractFailure` (shared Twenty error type),
  - this closes a prior gap where response-shape mismatches were converted to generic `HttpException` and could bypass non-retriable handling.

### Why this shape
- Keeps fast path and request volume unchanged.
- Avoids worst-case duplicate side effects from retrying create after ambiguous post-create contract failures.
- Preserves existing split/fallback behavior for non-contract failures.

### Test coverage
- Added focused tests:
  - process-batch: run fails without split/retry on correlation contract failure.
  - create-donors: run fails without split/retry on correlation contract failure.
- Existing focused suites pass for these paths.

## Pending Verification (UI-Blocked)

- Frontend bulk gift-batch label lookup now uses list fetch with `filter=id[in]:[...]` and chunking.
- Live verification against running stack is still pending because current UI state does not yet expose a reliable scenario to observe multiple batch label lookups in-network.
- Verification to run once UI path is available:
  - expect request(s) to `/api/fundraising/gift-batches` with `filter=id[in]:[...]`,
  - confirm per-id fallback (`/api/fundraising/gift-batches/:id`) occurs only on filter-support errors.

## Refactor Gate Baseline (Locked Before Structural Refactor)

### Backend targeted gate

Command:
- `npm test -- gift-batch/gift-batch-processing.service.spec.ts gift-batch/gift-batch-donor-match.service.spec.ts identity-resolution/person-identity.service.spec.ts gift-staging/gift-staging.service.spec.ts gift-staging/gift-staging-processing.service.spec.ts`

Result:
- `PASS` 5 suites, 58 tests.

### Frontend compile gate

Command:
- `npm run client:build`

Result:
- `PASS` (Vite production build successful).

## Refactor Plan Proposal (2026-02-11)

### Objective
- Improve separation of concerns in batch processing and donor-match flows while preserving current behavior, API contracts, and operator outcomes.
- Refactor for maintainability and safety first; do not redesign product policy in the same pass.

### Recommended Design Approach (Pragmatic Middle Path)
- Keep `GiftBatchProcessingService` and `GiftBatchDonorMatchService` as thin orchestration facades.
- Extract focused collaborators for each concern:
  - Candidate selection and scoping.
  - Routing and policy decisions (batch path vs row fallback).
  - External execution (Twenty create calls, split/isolation behavior).
  - Staging writeback coordination.
  - Run state transitions and counters.
  - Donor-match outcome classification and persistence planning.
- Preserve existing external behavior and invariants during this extraction.

Why this is recommended:
- It delivers meaningful quality gains now without the risk and delay of a full architecture rewrite.
- It keeps velocity high for a pre-customer lean team while reducing hidden complexity in the highest-risk path.

### Alternatives Considered
1. Minimal helper extraction only.
- Pros: fastest and lowest immediate change risk.
- Cons: leaves "god services" mostly intact; future changes remain expensive and error-prone.

2. Full redesign now (durable run store/job system).
- Pros: strongest long-term architecture.
- Cons: high scope and migration risk; likely over-investment at current stage.

3. Recommended middle path (modular refactor, behavior preserved).
- Best balance of correctness, maintainability, and delivery speed.

### Execution Sequence (Behavior-Preserving)
1. Baseline lock:
- Keep the current focused test/build gate unchanged as the regression safety net.

2. Extract pure logic first:
- Move deterministic, side-effect-free logic (classification, mapping, status derivation) into dedicated modules.

3. Extract side-effect adapters:
- Move Twenty create orchestration and staging writeback orchestration into focused components with narrow interfaces.

4. Slim orchestrators:
- Convert top-level services into coordinators that compose the extracted collaborators.

5. Stabilize and document:
- Run focused gates after each slice and update docs to match as-built boundaries.

### Suggested Commit Slices
1. Pure logic extraction (no side effects).
2. Writeback coordination extraction.
3. Batch create execution extraction (including split/isolation path).
4. Donor-match outcome/persistence extraction.
5. Wiring cleanup + focused tests/docs updates.

### Scope Guardrails (Important)
- In scope: structural separation, naming clarity, module boundaries, local testability.
- Out of scope: policy changes, new retry semantics, new user-facing behavior, new run contract fields.

### Light-Touch Twenty Alignment Check
- Twenty REST architecture follows layered dispatch: controller -> core service -> per-operation handlers -> common query runners.
- Upsert behavior is parsed at request boundary (`upsert=true`) and then executed through create-many flow.
- This generally aligns with our proposed split between orchestration, policy, and execution.
- Remaining uncertainty still stands: upstream response-order guarantees for create-many should not be assumed stronger than current documented contract; keep existing correlation-contract safeguards and the "Items To Raise With Twenty" list active.

## Refactor Progress (2026-02-11, Slice 1 + Slice 2 complete)

### Scope followed
- Structural extraction only.
- No policy changes.
- No changes to public DTO fields, status enums, metric/event names, or log keys.
- Same baseline gate commands used after each slice.

### Slice 1 (process service) move map
- New module: `services/fundraising-service/src/gift-batch/gift-batch-processing.logic.ts`
- Extracted pure helpers from process service:
  - optional string normalization
  - row-in-batch guard
  - batch-processable routing predicate
  - recurring parity row-fallback predicate
  - identity readiness preflight computation
- `GiftBatchProcessingService` now delegates to extracted helpers.

### Slice 2 (donor-match service) move map
- New module: `services/fundraising-service/src/gift-batch/gift-batch-donor-match.logic.ts`
- Extracted pure helpers from donor-match service:
  - candidate resolution from duplicate lookup results
  - deterministic update serialization (grouping key)
  - identity diagnostics payload composition + compare/normalize helpers
  - row-in-batch guard
  - dedupe-status resolution helper
  - contact extraction + identity key builder
  - normalization/object/string helpers
- `GiftBatchDonorMatchService` now delegates these pure computations to the logic module while keeping orchestration/persistence flow unchanged.

### Gate results (serial execution)
- `npm test -- gift-batch/gift-batch-processing.service.spec.ts` ✅
- `npm test -- gift-batch/gift-batch-donor-match.service.spec.ts` ✅
- `npm test -- identity-resolution/person-identity.service.spec.ts` ✅
- `npm test -- gift-staging/gift-staging.service.spec.ts` ✅
- `npm test -- gift-staging/gift-staging-processing.service.spec.ts` ✅
- `npm run client:build` ✅
