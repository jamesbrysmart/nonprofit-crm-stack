# Gift Batch Processing (Solution Notes)

Status: Active (as-built reference)  
Last updated: 2026-02-11  
Scope: Fundraising-service batch processing, donor matching, and related client flow.

This document is the structured replacement for the spike continuity notes in
`docs/spikes/gift-batch-processing-continuity.md`.

The spike remains the implementation history log; this document captures the
durable behavior and operating model.

## 1) Why This Exists

Gift staging and batch processing are high-risk workflows because a single run can
touch many rows and trigger external side effects. We need:

- high throughput where safe (`/batch/*` paths),
- deterministic and explainable fallback behavior,
- strong safeguards against silent data corruption,
- predictable operator experience in queue-based workflows.

## 2) As-Built Capability (2026-02)

### Backend

- Async process-batch run model (`start` + `poll`).
- Async donor-match run model (`start` + `poll`).
- Async create-donors run model (`start` + `poll`).
- Hybrid executors with split/isolation fallback where appropriate.
- Correlation-contract failure classification and explicit run failure behavior.
- Batch patch/upsert hardening on staging write paths, including ID safety checks.

### Client

- Staging queue supports batch run initiation and run-status polling.
- Donor-match and process-batch workflows are exposed in queue experience.
- Gift-batch lookup uses bulk `id[in]` fetch with targeted fallback to avoid N+1.
- Manual gift entry supports selecting or creating a gift batch.

## 3) Runtime Model

### Run types

- `process-batch`
- `donor-match`
- `create-donors`

### Run statuses

- `queued`
- `running`
- terminal: `completed`, `completed_with_errors`, `failed`

### Batch status lifecycle (process run)

- start: `processing`
- full success: `processed`
- partial/deferred/error outcome: `processed_with_issues`
- run-level failure: `process_failed`

### Guardrails

- One active run per `batchId + runType`.
- Process-run stale recovery remains active (if batch is `processing` with no active
  in-memory run, batch transitions to failed/recoverable on start/poll flows).

## 4) Candidate and Outcome Semantics

### Donor-match candidate scope

- Default scope is unresolved candidate rows.
- Already-linked rows are skipped by default for rerun efficiency.

### Donor-match explicit outcomes

- `already_resolved`
- `auto_linked`
- `partial_match_review`
- `no_match`
- `insufficient_identity`
- `error`
- `created_donor` (create-donors run)

Each processed candidate row gets an explicit persisted outcome payload in
`processingDiagnostics.identityResolution`.

## 5) Processing and Persistence Safety

### Write semantics

- `undefined` means no change.
- `null` means explicit clear.

### Batch staging write safety

- Max 60 rows per batch write.
- Non-empty and unique IDs required.
- Non-empty update payload required.
- Strict response ID-set validation for upsert paths.
- `trustIds` fast-path only allowed with explicit bounded allowed-ID set.

### Correlation-contract handling

If post-create response correlation validation fails (length mismatch or missing ID):

- classify as `correlation_contract_failure`,
- do not split/retry create path,
- fail chunk/run loudly,
- emit structured logs/metrics for immediate detection.

Rationale: prevent duplicate or mis-correlated side effects.

## 6) Twenty `/batch` Contract Assumptions

Observed behavior from local validation and smoke work:

- `/batch/*` endpoints behave atomically (mixed-validity payload fails as a unit).
- Batch response ordering is treated as an operational assumption in current mapping.
- Response-contract mismatches are handled explicitly as failure class (above).

Open upstream asks:

- explicit response-order guarantee for `/batch/gifts` and `/batch/people`,
- explicit correlation support in API contracts.

## 7) Config Knobs (Current)

### Process-batch

- `FUNDRAISING_BATCH_PROCESS_EXECUTOR_MODE` (`hybrid` default, `row`)
- `FUNDRAISING_BATCH_PROCESS_CHUNK_SIZE` (clamped `1..60`)
- `FUNDRAISING_BATCH_PROCESS_BATCH_DELAY_MS`
- `FUNDRAISING_BATCH_PROCESS_ROW_DELAY_MS`

### Donor-match / create-donors

- `FUNDRAISING_DONOR_MATCH_LOOKUP_DELAY_MS`
- `FUNDRAISING_DONOR_MATCH_LOOKUP_BATCH_SIZE` (clamped `<=60`)
- `FUNDRAISING_DONOR_MATCH_CREATE_CHUNK_SIZE` (clamped `<=60`)
- `FUNDRAISING_DONOR_MATCH_CREATE_DELAY_MS`

## 8) Observability Contract

At minimum, operators should be able to observe:

- run start/finish/failure events per run type,
- correlation-contract failures (with `batchId`, `runId`, endpoint, chunk size, reason),
- retry pressure and 429 distribution by context/endpoint,
- process-batch execution breakdown (batch path vs row fallback).

See `docs/OPERATIONS_RUNBOOK.md` for command-level operational checks.

### Smoke ledger trend interpretation (quick rubric)

When comparing runs, track all three totals together:

- logical requests,
- total attempts,
- retries.

Interpretation:

- Logical unchanged + attempts/retries down:
  - path efficiency or retry amplification improved.
- Logical down + retries flat:
  - call-plan improved, but shared-key burst pressure still dominates.
- Logical up unexpectedly:
  - likely new call amplification (read-backs, extra polling, or fallback churn).
- Terminal 429s on non-critical safe-update paths:
  - still operational debt; treat as warning signal, not success.

## 9) Focused Verification Gate (Current Baseline)

Backend targeted gate:

- `npm test -- gift-batch/gift-batch-processing.service.spec.ts`
- `npm test -- gift-batch/gift-batch-donor-match.service.spec.ts`
- `npm test -- identity-resolution/person-identity.service.spec.ts`
- `npm test -- gift-staging/gift-staging.service.spec.ts`
- `npm test -- gift-staging/gift-staging-processing.service.spec.ts`

Frontend compile gate:

- `npm run client:build`

Smoke/ledger validation:

- `npm run smoke:gift-batch:bulk` (or direct script invocation with explicit scenario/rows)

## 10) Current Limits and Backlog

### Intentional interim limits

- Recurring-linked rows remain row-path until explicit batch-path parity is delivered.
- In-memory run state is not durable across process restarts.

### Hardening backlog (high-value next)

- Confirm/replace response-order assumption if Twenty provides better correlation guarantees.
- Add stronger durable run recovery if restart resilience becomes required.
- Continue reducing API pressure under high-volume mixed workflows.
- Keep invariant tests explicit before and after major refactors.

### Larger-batch follow-up plan (carried over from spike)

Use this phased approach for 60+/100+ scale hardening:

1. API efficiency first:
   - reduce avoidable staging read/write chatter in bulk paths,
   - minimize GET-before-PATCH patterns when run context already has needed data.
2. Realistic-load validation:
   - run donor-match -> short pause -> create-donors -> short pause -> process batch,
   - validate at 30, 60, 100 row sizes to separate architecture limits from smoke compression.
3. Production guardrails:
   - add shared backpressure/throttling safety net for shared-key contention.

Order rationale:
- optimize call efficiency before adding throttling so we do not ship "slow but noisy" behavior.

## 11) Items To Raise With Twenty

Keep these open until upstream contract clarity is explicit:

1. Response-order contract:
   - is response order guaranteed to match request order for `/rest/batch/people` and `/rest/batch/gifts`?
2. Correlation token support:
   - can clients send per-row correlation tokens and receive them back in batch create responses?
3. Upsert semantics:
   - confirm expected behavior for `POST /rest/batch/<object>?upsert=true` with existing IDs,
   - confirm recommended safeguards for missing IDs in upsert payloads.
4. Atomicity guarantees:
   - confirm whether create/upsert/update-many are atomic per request and whether any partial-success mode exists.

## 12) Related Canonical Docs

- `docs/ARCHITECTURE.md` (invariants and system-level constraints)
- `docs/OPERATIONS_RUNBOOK.md` (run/debug/smoke procedures)
- `docs/TESTING.md` (testing expectations)
- `docs/DECISIONS.md` (major tradeoffs and interim posture)
