# Gift Staging → Gift Promotion Flow (Draft)

> Working design notes for the promotion workflow that converts `gift_staging` rows into canonical `gift` records. Align this with `docs/features/donation-staging.md`, `docs/features/donation-intake.md`, and `docs/data-model/notes/gift-schema-alignment.md` before implementation. Update or retire once the solution is agreed and ticketed.

## Purpose & Goals

- Provide a single, auditable path that moves staged donations through validation, approval, and final gift creation.
- Bias toward safety: manual approval is the default until the org (or batch) explicitly enables auto-promotion.
- Preserve idempotency (`external_id`, `source_fingerprint`) and surface clear logs/status updates for Support/Ops.
- Keep the flow modular so intake sources (Stripe, manual UI, CSV) share the same promotion logic.

## Key Inputs & References

- `gift_staging` object (metadata draft in `gift-schema-alignment.md`)
- `gift_batch` metadata (batch defaults, risk, manual review settings)
- `docs/features/donation-staging.md` — staging principles, validation/dedupe expectations
- `docs/features/donation-intake.md` — required gift fields on commit
- `docs/features/donation-reconciliation.md` — reconciliation hooks post-commit

## Actors & Responsibilities

| Actor | Responsibility |
| --- | --- |
| Intake source (UI, webhook, CSV) | Create staging rows, attach raw payload and source fingerprint. |
| Validation/dedupe worker | Evaluate staged row, set `validation_status` / `dedupe_status`, attach diagnostics. |
| Promotion worker/service | Decide if the row can commit, transform payload to gift schema, call Twenty, update staging status. |
| Human reviewer | Approve or fix rows that stall in pending/review states. |

## State Model (gift_staging)

| Status | Meaning | Transitions |
| --- | --- | --- |
| `pending` | Row awaiting validation or manual review. Default after intake. | → `ready_for_commit` (manual approval) / → `validation_failed` (error) |
| `ready_for_commit` | Validation + dedupe passed and reviewer has approved. | → `committing` (worker picks up) |
| `committing` | Worker creating the gift in Twenty. | → `committed` (success) / → `commit_failed` (exception) |
| `committed` | Gift created; `gift_id` populated. | Terminal (optional archival) |
| `validation_failed` | Hard validation error; needs human fix/retry. | → `pending` (after edit) |
| `duplicate_blocked` / `dedupe_review` | Dedupe flagged; requires manual action. | → `pending` or `ready_for_commit` after resolution |
| `commit_failed` | Gift creation failed (API/network issue). | → `ready_for_commit` or `committing` (retry) |
| `cancelled` | User explicitly stops promotion (e.g., donor retracts). | Terminal |

## Auto-Promotion Policy (WIP)

- Baseline: `autoPromote=false` unless both the organisation and the enclosing `gift_batch` opt in.
- When enabled on a batch, promotion worker can advance rows automatically once `validation_status=passed` AND `dedupe_status=passed` AND no blocking diagnostics remain.
- Intake should not rely on per-row `autoPromote` toggles alone—batch-level controls carry the reviewer intent.
- Deferred Design: criteria for batch-level risk configuration, safeguarding overrides, and audit logging for bulk approvals.

## Promotion Flow (Sequential Overview)

1. **Fetch Candidate Rows**
   - Query `gift_staging` for rows in `ready_for_commit` or (`pending` with auto-promote true and validation/dedupe passed).
   - Optionally limit by batch, source, or retry window.

2. **Eligibility Checks**
   - Ensure validation/dedupe statuses are `passed`.
   - Confirm batch exists and (if auto-promotion) batch `auto_promote=true` and not archived.
   - Verify required fields (`amount_minor`, `currency`, `date_received`, `contact_id`/resolved donor).
   - Re-check idempotency: confirm no existing gift with same `external_id` or `source_fingerprint`.

3. **Payload Build**
   - Transform staging fields into the proxy gift payload (mirror logic in `gift.service.prepareGiftPayload`).
   - Attach attribution (`fund_id`, `appeal_id`, etc.) where present.
   - Ensure `giftBatchId` propagates so the gift can reference the same batch metadata.
   - Preserve the original `rawPayload` when reviewers update statuses so manual actions don’t drop intake context (service now rehydrates the payload if omitted).

4. **Commit Attempt**
   - Call Twenty’s `/gifts` endpoint.
   - On success: capture `gift_id`, move staging to `committed`, set `promotion_status=committed`, propagate statuses (`validation_status=passed`, `dedupe_status=passed`).
   - On API error: move staging to `commit_failed`, record diagnostics, leave ready for retry.

5. **Post-Commit Hooks**
   - Emit structured log/audit entry including staging ID, gift ID, batch ID, source.
   - Optionally enqueue reconciliation or receipting signals (`donation-reconciliation.md`, `gift-receipts.md`).
   - Update batch rollups if tracked (e.g., `committed_count`, `committed_amount_minor`).

## Promotion (Manual “Processing”) Contract (Draft)

```ts
type PromoteGiftArgs = {
  stagingId: string;
};

type PromoteGiftResult =
  | { status: 'committed'; giftId: string; stagingId: string }
  | { status: 'deferred'; stagingId: string; reason: PromoteGiftDeferredReason }
  | { status: 'error'; stagingId: string; error: PromoteGiftErrorReason };

type PromoteGiftDeferredReason =
  | 'not_ready' // validation/dedupe not passed or reviewer has not approved
  | 'locked' // staging row in progress (promotion_status=committing)
  | 'missing_payload'; // raw payload absent/corrupt

type PromoteGiftErrorReason =
  | 'fetch_failed' // staging record not found / API error
  | 'payload_invalid' // raw payload unable to parse or missing required fields
  | 'gift_api_failed'; // downstream Twenty gift create failure
```

- **Entry points**
  - REST endpoint for manual promotion/processing (`POST /gift-staging/:id/promote` — naming TBD).
  - Background job/worker (queue or cron) deferred to future slice once manual path is proven.
- **Side effects**
  - Reads: `gift_staging`, `gift_batch` metadata.
  - Writes: `gift_staging` (status updates, diagnostics), Twenty `/gifts`.
  - Logs: structured events (`gift_staging_promote_start`, `gift_staging_promote_success`, `gift_staging_promote_failed`).

## Error Handling & Retries

- Retryable failures (HTTP 5xx, network) → transition to `commit_failed` with backoff; queue for retry capped by attempt count.
- Non-retryable failures (validation mismatch, duplicate gift) → set `promotion_status=commit_failed`, attach `error_detail`, require manual fix.
- When a reviewer edits a row, reset statuses to `pending` and clear historical diagnostics except audit log.

### MVP Handling Notes

- Already-committed rows return `status: 'committed'` immediately (no-op) so manual reviewers can safely re-run the command.
- Rows lacking `rawPayload` or with unparseable JSON return `deferred` (`missing_payload`) and should stay in manual queue until corrected.
- For MVP, `error` is reserved for infrastructure/API failures we cannot recover from inside the request; business constraints stay under `deferred`.

## Security & Permissions

- Promotion endpoint should check that the acting user/system has fundraising admin privileges.
- Future automation/override flags (e.g., `force` or batch auto-promote) must audit actor + reason before advancing rows without manual review.
- Access to raw payload should be limited to trusted roles (contains donor PII, payment metadata).

## Open Questions / Decisions to Ratify

- Confirm Twenty metadata supports linking `gift_staging.gift_batch_id` → `gift_batch`. Manual UI creation still required today; document the runbook steps.
- Define storage for `error_detail` (JSON vs string) and ensure truncation/logging policies exist.
- Decide where to store retry counters / timestamps (fields on `gift_staging` vs shadow table).
- Determine how to surface staging queues in the admin UI (filters, bulk approve, bulk retry).
- Align with reconciliation flow: when a staging row commits, how does reconciliation mark the transaction? (Possibly via shared `external_id`).
- Plan phased rollout (feature flag per workspace, dry-run mode that logs would-be commits without creating gifts).
- Revisit naming (`promotion` vs `processing`) once manual flow lands; keep current terminology in code for continuity.
- Decide if/when a `force` override is needed once automation is introduced; excluded from MVP to simplify behaviour.
- Validate state names (`ready_for_commit`, `committing`, etc.) against the metadata we can create in Twenty—rename if the platform has restrictions.
- Decide which team owns batch configuration (Fundraising vs Admin) and how auto-promote toggles are audited.
- Smoke script still warns when staging responses omit `meta.rawPayload`; consider aligning the API response so manual tooling gets the payload consistently.

## Proposed Implementation Slices

1. **Design Finalisation**
   - Ratify status/state model and batch-level auto-promote rules.
   - Define promotion API/worker interfaces; capture open questions above.

2. **Scaffold & Manual Promotion** *(done 2025-10-07)*
   - `POST /gift-staging/:id/promote` and `PATCH /gift-staging/:id/status` behind `FUNDRAISING_ENABLE_GIFT_STAGING`.
   - `GiftStagingService` now exposes `getGiftStagingById`, `updateStatusById`, `markCommittedById`, preserving `rawPayload` when statuses change.
   - Promotion tests + smoke script cover staging → status update → promotion → cleanup.

3. **Batch-aware Automation**
   - Build worker/cron to process batches based on `auto_promote` + validation status.
   - Implement retry/backoff logic and batch rollups.

4. **UI & Admin Tooling**
   - Surface staging queues, approval, error diagnostics, and retry controls in the console.

5. **Hardening & Observability**
   - Metrics (counts per status, promotion duration), alerting on stuck rows, integration with reconciliation.

Document each slice in tickets/ADRs as we commit to implementation. Update this note (or migrate into feature specs) once decisions are locked.
