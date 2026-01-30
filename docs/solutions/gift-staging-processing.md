# Gift Staging → Gift Processing Flow (Draft)

> Working design notes for the processing workflow that converts `gift_staging` rows into canonical `gift` records. Align this with `docs/features/donation-staging.md`, `docs/features/donation-intake.md`, and `docs/data-model/notes/gift-schema-alignment.md` before implementation. Update or retire once the solution is agreed and ticketed.
>
> _Terminology heads-up_: this flow used to be called “promotion”. Some older scripts/docs may still reference `/gift-staging/:id/promote`; the runtime endpoint is now `/gift-staging/:id/process`.

## Purpose & Goals

- Provide a single, auditable path that moves staged donations through validation, approval, and final gift creation.
- Bias toward optimistic auto-processing when eligibility is satisfied; pause when meaning is incomplete or ambiguous.
- Preserve idempotency (`external_id`, `source_fingerprint`) and surface clear logs/status updates for Support/Ops.
- Keep the flow modular so intake sources (Stripe, manual UI, CSV) share the same processing logic.

## Product intent (admin contract)

- Staging exists because some part of the gift’s meaning is not yet resolved (identity, classification, and/or trust context).
- “Process” (manual or automatic) is a deliberate transition that should be confidence-building for donation admins, especially at volume.
- Diagnostics introduced in stages 1–2 are an explicit UX contract that will later power explainable queues, safe bulk actions, batch-level trust boundaries, and guided resolution.

**Diagnostics contract (vNext):** any API response that returns staging records should include `processingDiagnostics` (eligibility, blockers, warnings, identityConfidence). Treat this as the stable signal that Stage 3 will rely on for admin-facing reasoning and bulk workflows, even if UI work lands later. On create, if the fresh staging read does not yet include diagnostics, fall back to the normalized payload’s computed diagnostics; once persisted, the staging record remains the source of truth.

## Key Inputs & References

- `gift_staging` object (metadata draft in `gift-schema-alignment.md`)
- `gift_batch` metadata (batch defaults, risk, manual review settings)
- `docs/features/donation-staging.md` — staging principles, validation/dedupe expectations
- `docs/features/donation-intake.md` — required gift fields on processing
- `docs/features/donation-reconciliation.md` — reconciliation hooks post-processing

## vNext processing plan (Stages 1–3)

1. **Processing eligibility & diagnostics**
   - Define the eligibility rubric (identity, semantic completeness, source/batch context).
   - Store clear blockers/warnings on staging records (no UI changes yet).
   - Use “autoProcess” as product terminology.

2. **Auto-processing alignment**
   - Gate auto-processing on eligibility + source trust posture.
   - Intake either processes immediately or remains staged with explicit reasons.

3. **Processing UX & admin confidence (product stage, not necessarily immediate build)**
   - Use the diagnostics contract to drive clear reasons + suggested actions.
   - Enable batch/bulk workflows (especially for CSV imports) using trust boundaries and defaults.
   - Make the “Process” moment (single/bulk) explain what will happen and why it’s safe.

## Stage 3: Admin UX & Batch Workflow Contract (draft, no UI build)

This stage defines the admin-facing contract that consumes `processingDiagnostics`. It is intentionally product-level
and should be implementable across UI surfaces without prescribing layout.

### Admin experience summary (product-level, no UI)

Donation admins encounter a staging queue that represents gifts whose meaning is incomplete or uncertain. The queue
is not a failure list; it is a focused workstream of gifts that need clarification before processing. Each staged gift
includes diagnostics that explain why it has not processed (blockers vs warnings and identity confidence), so admins
can move from “what happened?” to “what do I need to decide?” without guesswork.

Admins can resolve issues one-by-one or in batches. For individual records, they confirm identity, link or create
required relationships (e.g., recurring agreement), and fill missing classification fields. For batches, they apply
shared defaults or bulk actions to resolve common gaps (appeal/fund/opportunity/payout), and confirm suggested donors
where identity confidence is weak. These actions remove blockers and move gifts into an eligible state without creating
secondary “ready” truths.

Processing is a deliberate, confidence-building moment. Before processing (single or bulk), admins can see what will
happen, why it is safe (eligibility, trust posture, identity confidence), and what remains unresolved (warnings). If a
mistake is made, corrections happen on the canonical gift record with audit/history, rather than reprocessing. The goal
is safe, explainable, and efficient processing at scale, while keeping human judgment central.

### Admin mental model

- **Unprocessed gifts** exist because meaning is incomplete (identity, classification, or trust context).
- **Processing** is the deliberate act of converting staging → gift, and should be explainable and confidence‑building.
- **Batches** (especially CSV imports) are trust/intent boundaries: they carry defaults, expected data quality, and an
  implied review workflow.
- **Design principle:** maximize admin confidence per action (especially for bulk/batch workflows), not just minimize clicks.

### Required signals (API contract)

**Must (minimal stable contract):**
- `processingDiagnostics` (eligibility, blockers, warnings, identityConfidence).
- `intakeSource`, `giftBatchId`, `giftIntent`.
- Identity/classification ids when present (donorId/companyId, appealId/fundId/opportunityId/giftPayoutId, recurringAgreementId).

**Should (when available):**
- `processingStatus`, `validationStatus`, `dedupeStatus`.
- `rawPayloadAvailable`.

These signals power both explainability (“why is this unprocessed?”) and actionability (“what fixes it?”).

### Edge cases & guardrails (to avoid backsliding into stages 1–2)

- **Trust posture gates automation, not admins:** trust rules (high/medium/low) constrain auto-processing intent; an
  admin-initiated process action can proceed once blockers are resolved, even if auto-processing would have paused.
- **Org intent still requires company:** for org intents (`grant`, `corporateInKind`), `companyId` remains the
  requirement even if a `donorId` is present (donor attribution can still be stored but does not satisfy eligibility).
- **Recurring intent inference is broader than `giftIntent`:** recurring intent can be explicit (`giftIntent=recurring`)
  or inferred from provider/metadata signals; in either case, `recurringAgreementId` is the v1 requirement before
  auto-processing.
- **Recurring timing mismatch:** when the first installment arrives before an agreement exists, keep the gift staged
  with a clear blocker (`recurring_agreement_missing`) so admins can link/create the agreement without losing the payment.
- **Batch defaults resolve meaning, not truth:** batch-level defaults and bulk actions should be framed as resolving
  blockers/warnings (e.g., assign appeal/fund), not introducing a separate “ready” truth that can conflict with eligibility.
- **Unknown codes should degrade safely:** UI/batch logic should treat unrecognized blocker/warning codes as
  informational and avoid hard failures.

### Reason → action mapping (contractual, not UI)

- **Blockers** must map to at least one clear admin action:
  - `identity_missing` → assign donor or company (or enter donor details for matching).
  - `company_missing_for_org_intent` → assign company or change intent.
  - `recurring_agreement_missing` → link agreement or update intent.
- **Warnings** are not blockers but must be visible to inform admin confidence and batch decisions:
  - Missing appeal/fund/opportunity/payout/payment method/date should be actionable in bulk when batch context exists.
- **Suggested donors**: when `identityConfidence` is weak, surface suggested matches with rationale so admins can confirm
  quickly (applies to manual entry and batch review).

### Batch / bulk workflow expectations

- **Batch review**: view a batch with shared diagnostics summary (e.g., “12 missing appeal”, “5 low‑confidence identity”).
- **Bulk actions** (initial contract, no UI spec):
  - assign appeal/fund/opportunity/payout across selected rows,
  - confirm suggested donors (from dedupe),
  - apply bulk actions that resolve blockers/warnings so rows become eligible, then process,
  - process batch (subject to eligibility + trust posture).
- **Trust posture** should be visible in batch context (e.g., CSV = low trust), but still allow auto‑processing when
  eligibility is satisfied.

### Processing moment (single + bulk)

Before processing, the system must be able to summarize:
- what will happen (rows processed vs deferred),
- why it is safe (eligibility + trust + identityConfidence),
- what will remain unresolved (warnings).
- what needs attention next / suggested next actions.

### Audit / telemetry expectations

- Minimal contract: record processedBy (auto/manual), when, source/batch context, and a diagnostics snapshot at time of processing.
- Ensure list/get responses remain stable so future UI work can rely on the contract without additional API changes.

### Stability & evolution

- Blocker/warning codes are part of the UX contract: add new codes over time, deprecate rather than remove.
- UI strings and presentation can evolve independently of the underlying codes.
- Do not rely on code ordering unless a priority scheme is explicitly defined.

## Actors & Responsibilities

| Actor | Responsibility |
| --- | --- |
| Intake source (UI, webhook, CSV) | Create staging rows, attach raw payload and source fingerprint. |
| Validation/dedupe worker | Evaluate staged row, set `validation_status` / `dedupe_status`, attach diagnostics. |
| Processing worker/service | Decide if the row can process, transform payload to gift schema, call Twenty, update staging status. |
| Human reviewer | Approve or fix rows that stall in pending/review states. |

### Current admin tooling (2025-10-23)

- **Queue table** exposes inline actions for “Mark ready” (forces `processingStatus=ready_for_process`) and “Process now” (hits `/gift-staging/:id/process`), alongside a “Resolve duplicates” shortcut that opens the drawer focused on dedupe diagnostics.
- **Detail drawer** lets reviewers adjust amount/currency/date, coding fields, batch assignment, and notes without dropping to raw JSON. Saving issues a PATCH that preserves the raw payload while applying deltas. The drawer now reuses the same donor panel and gift form components as Manual Entry, so donor suggestions, selection, and search behave identically across both flows.
- **Donor reassignment** buttons reuse diagnostics embedded in the staged payload; selecting a suggested supporter patches `donorId` and updates `dedupeStatus=matched_existing`.
- **Recurring tab** shows linked agreement ID, expected installment date, and provider context so staff can confirm webhook wiring before processing.
- **Raw payload** remains accessible behind an explicit toggle to keep the drawer lightweight while still supporting audit/debug use cases.

## State Model (gift_staging)

| Status | Meaning | Transitions |
| --- | --- | --- |
| `pending` | Row awaiting validation or manual review. Default after intake. | → `ready_for_process` (manual approval) / → `validation_failed` (error) |
| `ready_for_process` | Validation + dedupe passed and reviewer has approved. | → `processing` (worker picks up) |
| `processing` | Worker creating the gift in Twenty. | → `processed` (success) / → `process_failed` (exception) |
| `processed` | Gift created; `gift_id` populated. | Terminal (optional archival) |
| `validation_failed` | Hard validation error; needs human fix/retry. | → `pending` (after edit) |
| `duplicate_blocked` / `dedupe_review` | Dedupe flagged; requires manual action. | → `pending` or `ready_for_process` after resolution |
| `process_failed` | Gift creation failed (API/network issue). | → `ready_for_process` or `processing` (retry) |
| `cancelled` | User explicitly stops processing (e.g., donor retracts). | Terminal |

## Auto-Processing Policy (vNext)

- Use **autoProcess** as the product term; the current metadata field is still `autoProcess` until renamed.
- autoProcess is best-effort intent; eligibility + trust posture can pause processing.
- Required relationships by intent:
  - `grant` / `corporateInKind` → require `companyId`.
  - explicit recurring intent → require `recurringAgreementId`.
- Trust posture by intake source:
  - Manual UI: high trust.
  - Connector/webhook: medium trust.
  - CSV import: low trust.
- Auto-processing rules:
  - High trust → process when eligible (warnings allowed).
  - Medium trust → process when eligible and `identityConfidence` ≥ strong.
  - Low trust → process when eligible and `identityConfidence` = strong; batch confirmation can override later.
- Dedupe is a confidence signal, not a hard gate on its own.

## Processing Eligibility & Diagnostics (vNext)

- **Eligibility rubric**
  - Identity resolved: `donorId` present, or `companyId` for org intents.
  - Recurring intent must include `recurringAgreementId`.
  - Amount + currency required (already enforced).
  - Missing classification relationships (appeal/fund/opportunity/payout) are warnings, not blockers in v1.
- **Diagnostics contract (stored on staging)**
  - `processingEligibility`: `eligible | blocked`
  - `processingBlockers[]`: reason codes
  - `processingWarnings[]`: warning codes
  - `identityConfidence`: `explicit | strong | weak | none`
  - Storage detail TBD (new fields vs encoded metadata), but the contract should remain stable for stage 3.
- **Blocking reason codes (v1)**
  - `identity_missing`
  - `company_missing_for_org_intent`
  - `recurring_agreement_missing`
  - `gift_date_missing`
- **Warning codes (v1)**
  - `identity_low_confidence`
  - `appeal_missing`
  - `fund_missing`
  - `opportunity_missing`
  - `payout_missing`
  - `payment_method_missing`

## Processing Flow (Sequential Overview)

1. **Fetch Candidate Rows**
   - Query `gift_staging` for rows in `ready_for_process` or (`pending` with auto-process true and eligibility satisfied).
   - Optionally limit by batch, source, or retry window.

2. **Eligibility Checks**
   - Apply the eligibility rubric (identity, intent-specific requirements, and required fields).
   - Record blockers/warnings and `identityConfidence` based on dedupe diagnostics and explicit IDs.
   - Apply source/batch trust posture to decide auto-processing vs staged-with-reasons.
   - Re-check idempotency: confirm no existing gift with same `external_id` or `source_fingerprint`.

3. **Payload Build**
   - Transform staging fields into the proxy gift payload (mirror logic in `gift.service.prepareGiftPayload`).
   - Attach attribution (`fund_id`, `appeal_id`, etc.) where present.
   - Ensure `giftBatchId` propagates so the gift can reference the same batch metadata.
   - Preserve the original `rawPayload` when reviewers update statuses so manual actions don’t drop intake context (service now rehydrates the payload if omitted).

4. **Process Attempt**
   - Call Twenty’s `/gifts` endpoint.
   - On success: capture `gift_id`, move staging to `processed`, set `processing_status=processed`, propagate statuses (`validation_status=passed`, `dedupe_status=passed`).
   - On API error: move staging to `process_failed`, record diagnostics, leave ready for retry.

5. **Post-Process Hooks**
   - Emit structured log/audit entry including staging ID, gift ID, batch ID, source.
   - Optionally enqueue reconciliation or receipting signals (`donation-reconciliation.md`, `gift-receipts.md`).
   - Update batch rollups if tracked (e.g., `processed_count`, `processed_amount_minor`).

## Processing (Manual “Processing”) Contract (Draft)

```ts
type ProcessGiftArgs = {
  stagingId: string;
};

type ProcessGiftResult =
  | { status: 'processed'; giftId: string; stagingId: string }
  | { status: 'deferred'; stagingId: string; reason: ProcessGiftDeferredReason }
  | { status: 'error'; stagingId: string; error: ProcessGiftErrorReason };

type ProcessGiftDeferredReason =
  | 'not_ready' // validation/dedupe not passed or reviewer has not approved
  | 'locked' // staging row in progress (processing_status=processing)
  | 'missing_payload'; // raw payload absent/corrupt

type ProcessGiftErrorReason =
  | 'fetch_failed' // staging record not found / API error
  | 'payload_invalid' // raw payload unable to parse or missing required fields
  | 'gift_api_failed'; // downstream Twenty gift create failure
```

- **Entry points**
  - REST endpoint for manual processing (`POST /gift-staging/:id/process`).
  - Background job/worker (queue or cron) deferred to future slice once manual path is proven.
- **Side effects**
  - Reads: `gift_staging`, `gift_batch` metadata.
  - Writes: `gift_staging` (status updates, diagnostics), Twenty `/gifts`.
  - Logs: structured events (`gift_staging_process_start`, `gift_staging_process_success`, `gift_staging_process_failed`).

## Error Handling & Retries

- Retryable failures (HTTP 5xx, network) → transition to `process_failed` with backoff; queue for retry capped by attempt count.
- Non-retryable failures (validation mismatch, duplicate gift) → set `processing_status=process_failed`, attach `error_detail`, require manual fix.
- When a reviewer edits a row, reset statuses to `pending` and clear historical diagnostics except audit log.

### MVP Handling Notes

- Already-processed rows return `status: 'processed'` immediately (no-op) so manual reviewers can safely re-run the command.
- Rows lacking `rawPayload` or with unparseable JSON return `deferred` (`missing_payload`) and should stay in manual queue until corrected.
- For MVP, `error` is reserved for infrastructure/API failures we cannot recover from inside the request; business constraints stay under `deferred`.

## Security & Permissions

- Processing endpoint should check that the acting user/system has fundraising admin privileges.
- Future automation/override flags (e.g., `force` or batch auto-process) must audit actor + reason before advancing rows without manual review.
- Access to raw payload should be limited to trusted roles (contains donor PII, payment metadata).

## Open Questions / Decisions to Ratify

- Confirm Twenty metadata supports linking `gift_staging.gift_batch_id` → `gift_batch`. Manual UI creation still required today; document the runbook steps.
- Define storage for `error_detail` (JSON vs string) and ensure truncation/logging policies exist.
- Decide where to store retry counters / timestamps (fields on `gift_staging` vs shadow table).
- Determine how to surface staging queues in the admin UI (filters, bulk approve, bulk retry).
- Align with reconciliation flow: when a staging row processes, how does reconciliation mark the transaction? (Possibly via shared `external_id`).
- Plan phased rollout (feature flag per workspace, dry-run mode that logs would-be processing without creating gifts).
- Revisit naming only if Twenty metadata constraints force a change; keep current terminology in code for continuity.
- Decide if/when a `force` override is needed once automation is introduced; excluded from MVP to simplify behaviour.
- Validate state names (`ready_for_process`, `processing`, etc.) against the metadata we can create in Twenty—rename if the platform has restrictions.
- Decide which team owns batch configuration (Fundraising vs Admin) and how auto-process toggles are audited.
- Smoke script still warns when staging responses omit `meta.rawPayload`; consider aligning the API response so manual tooling gets the payload consistently.

## Proposed Implementation Slices

1. **Design Finalisation**
   - Ratify status/state model and batch-level auto-process rules.
   - Define processing API/worker interfaces; capture open questions above.

2. **Scaffold & Manual Processing** *(done 2025-10-07, renamed 2025-10-??)*
   - `POST /gift-staging/:id/process` and `PATCH /gift-staging/:id/status` behind `FUNDRAISING_ENABLE_GIFT_STAGING`.
   - `GiftStagingService` now exposes `getGiftStagingById`, `updateStatusById`, `markProcessedById`, preserving `rawPayload` when statuses change.
   - Processing tests + smoke script cover staging → status update → processing → cleanup.

3. **Batch-aware Automation**
   - Build worker/cron to process batches based on `auto_process` + validation status.
   - Implement retry/backoff logic and batch rollups.

4. **UI & Admin Tooling**
   - Surface staging queues, summary chips (status/intake/batch), and drawer-first review controls in the console.

5. **Hardening & Observability**
   - Metrics (counts per status, processing duration), alerting on stuck rows, integration with reconciliation.

---

## Manual Entry Validation (2025-02-26, local stack)

_Purpose:_ Validate the thin manual intake slice stages and processes a single gift end-to-end using the new UI.

### Preconditions

- `FUNDRAISING_ENABLE_GIFT_STAGING=true` and `FUNDRAISING_STAGING_AUTO_PROCESS_DEFAULT=false` in `services/fundraising-service/.env`.
- Twenty stack running via docker compose with admin credentials seeded (`ADMIN_EMAIL` / `ADMIN_PASSWORD`).

### Runbook

```bash
# 1. Start / refresh core services (db, redis, Twenty, fundraising, gateway)
docker compose --profile fast up -d --build

# 2. (Optional) Follow fundraising-service logs for staging/process events
docker compose logs -f fundraising-service

# 3. In a browser, visit http://localhost:4000/fundraising
#    - Sign in with ADMIN_EMAIL / ADMIN_PASSWORD when prompted
#    - Enter a manual gift (GBP amount, donor name, optional email)
#    - Submission should display "Gift processed in Twenty..." with both gift + staging ids

# 4. Inspect the most recent staging record
curl -s "http://localhost:4000/api/fundraising/gift-staging?limit=1&sort=updatedAt:desc" | jq '.data[0]'

# 5. Verify the processed gift exists in Twenty (replace GIFT_ID from the success toast)
curl -s -H "Authorization: Bearer $TWENTY_API_KEY" \
  "http://localhost:4000/rest/gifts/GIFT_ID" | jq '.data.gift'
```

### Observations

- Duplicate check fires before staging; selecting an existing donor reuses their `donorId`.
- Exact email matches now set `dedupeStatus=matched_existing`; fallback/partial matches set `dedupeStatus=needs_review` and carry diagnostics in the raw payload (`dedupeDiagnostics`).
- Duplicate detection continues to reuse Twenty's `/people/duplicates` endpoint; managed logic only annotates results so reviewers have context and future per-workspace tuning (see guiding principles in `docs/PROJECT_CONTEXT.md` §3a).
- Staging records now surface donor first/last name, email, and notes so CSV imports can map directly and the review UI can show the context without digging into `rawPayload`.
- Queue shows lean columns with status/alert pills; summary chips filter by intake source, batch, and duplicates, and the drawer owns edits + processing.
- CSV imports should map `processingStatus`, `validationStatus`, and `dedupeStatus` to `pending`; future work will make the service default missing values to `pending` automatically.
- Staging response returns `{ stagedOnly: true }`, and processing yields `status: processed` with the new gift id.
- Fundraising logs emit `gift_staging_stage`, `gift_staging_process_call_create`, and `gift_staging_processed` events with matching IDs.
- Twenty REST lookup confirms the processed gift retains the submitted amount, currency, donor linkage, and timestamps.

### Follow-ups

1. Gift batch UX: promote batches to first-class cards with batch-level processing (see `docs/POC-backlog.md` §3a).
2. Donor context panel: surface recent gifts/agreements in manual entry and drawer (POC backlog §2a).
3. Recurring insights: extend agreement triage with drill-down actions once pause/resume APIs are ready (POC backlog §4b).
4. Persist raw payload diffs for inline edits (still TODO) and continue planning matching-threshold configuration knobs.

Document each slice in tickets/ADRs as we commit to implementation. Update this note (or migrate into feature specs) once decisions are locked.
