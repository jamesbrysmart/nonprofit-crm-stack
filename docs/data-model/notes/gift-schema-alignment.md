# Gift Schema & Staging Alignment Notes (Working)

> Temporary scratchpad while we line up the fundraising proxy with the feature specs. Delete once implementation lands.

## Inputs
- Current proxy payload (see `services/fundraising-service/src/gift/gift.validation.ts`, `src/stripe/stripe-webhook.service.ts`).
- Target schema + staging expectations from:
  - `docs/features/donation-intake.md`
  - `docs/features/donation-staging.md`
  - `docs/features/donation-reconciliation.md`
  - `docs/features/opportunities-gifts.md`

## Observed Differences (Proxy → Target)

| Area | Proxy today | Target spec | Notes |
| --- | --- | --- | --- |
| Amount | `{ amount: { currencyCode, value } }` (major units) | `amount_minor` (integer), `currency` | Convert to minor units before persistence; expose derived major-unit value for UI only if needed. |
| Date | `giftDate` (string) | `date_received` | Rename field and update validation. |
| Currency key | `currencyCode` | `currency` | Simple rename. |
| Payment method | Not sent | `payment_method` enum | Derive from source (Stripe → `card`, GoCardless → `direct_debit`, manual entry uses UI value). |
| Attribution | Optional `campaignId` | `appeal_id`, `appeal_segment_id`, `tracking_code_id`, `fund_id` | Replace `campaignId`; surface new fields as optional inputs. |
| External reference | `externalId` (optional) | `external_id` (canonical) | Rename field; populate with provider/import ID early (staging). |
| Contact linkage | `contact` → `donorId` | `contact_id` (also household visibility) | Align naming; ensure staging row carries `contact_id`. |
| Staging metadata | None | `gift_staging` metadata object with optional `gift_batch_id` | Write staging row (`intake_source`, `raw_payload`, `source_fingerprint`, etc.) before Gift. |
| Validation/dedupe | Inline only | Persisted statuses (`validation_status`, `dedupe_status`, `promotion_status`) with batch-aware approvals | Build staging workflow to process rows, track errors, allow manual fixes, and respect batch auto-promote settings. |

## Implementation Outline

1. **Define staging object**: schema + persistence (DB table or Twenty object) with fields from `donation-staging.md`.
2. **Update proxy intake**: write to staging (including `external_id`, `source_fingerprint`), return staging ID.
3. **Validation worker**: process staging rows, run dedupe, mark status, emit audit logs.
4. **Promotion step**: when staging row approved, map to Gift payload using aligned field names and create the Twenty Gift.
5. **Link records**: store Gift ID back on staging row for reconciliation/rollback.
6. **Surface errors**: expose status via API/console so admins can resolve failed rows.

Once these steps are ticketed/implemented, retire this note and rely on the main data-model docs.

## Proposed `gift_staging` Metadata (Draft)

| Field | Type | Purpose |
| --- | --- | --- |
| `id` | UUID | Unique staging row identifier. |
| `intake_source` | Enum (`manual`, `portal`, `csv`, `api`, …) | Origin of the intake event. |
| `raw_payload` | JSON | Immutable payload captured at intake for audit/debug. |
| `source_fingerprint` | String | Hash combining salient fields to enforce idempotency. |
| `external_id` | String (nullable) | Canonical provider/import reference (if known at intake). |
| `validation_status` | Enum (`pending`, `passed`, `failed`) | Outcome of validation rules (required fields, amount, etc.). |
| `dedupe_status` | Enum (`pending`, `passed`, `suspect`, `blocked`) | Deduping outcome (suspect = needs human review). |
| `promotion_status` | Enum (`pending`, `ready_for_commit`, `committing`, `committed`, `commit_failed`, `cancelled`) | Tracks progression toward gift creation. |
| `error_detail` | JSON / text | Optional machine + human readable diagnostics when validation/promotion fails. |
| `gift_id` | UUID (nullable) | Reference to committed Gift once promotion succeeds. |
| `amount_minor` | Integer | Captured amount in minor units. |
| `currency` | String | Currency code (e.g., `GBP`). |
| `date_received` | Date | Effective gift date. |
| `payment_method` | Enum | Payment method captured/derived at intake. |
| `fund_id` / `appeal_id` / `appeal_segment_id` / `tracking_code_id` | UUID (nullable) | Attribution defaults (if known). |
| `contact_id` | UUID (nullable) | Linked contact; may be populated after dedupe. |
| `household_id` | UUID (nullable) | Optional household linkage when confirmed. |
| `notes` | Text (nullable) | Freeform notes from intake. |
| `created_at` / `updated_at` | Timestamp | Audit trail fields. |

**Config knobs:**
- Org-level flag (`auto_promote_gifts`) controls whether `validation_status = passed` automatically moves `promotion_status` to `committing`, or pauses at `ready_for_commit` for manual approval.
- Manual approval UI should allow updating `promotion_status` (`ready_for_commit` → `committing`), with audit log.
- Retry logic should be able to move `commit_failed` back to `committing` after remediation.

_Implementation TODOs to ticket:_
1. Define metadata object + enums in Twenty and document provisioning steps.
2. Update proxy/webhook to write `gift_staging` rows instead of direct gifts (respecting `auto_promote_gifts`).
3. Build validation + promotion worker (likely in fundraising-service) that reads `gift_staging`, applies rules, and commits gifts.
4. Expose status endpoints/UI so admins can monitor and manually action staging rows.
5. Update docs/runbooks once the flow is wired.

### `gift_batch` Metadata (Draft)

| Field | Type | Purpose |
| --- | --- | --- |
| `id` | UUID | Batch identifier. |
| `name` | String | Human-readable label (e.g., "Stripe 2025-02-03" or "CSV Import – Legacy Appeals"). |
| `source` | Enum (`stripe_webhook`, `go_cardless_webhook`, `manual_csv`, `manual_entry`, `api`, …) | Origin of the batch. |
| `risk_level` | Enum (`low`, `medium`, `high`) | Hint for reviewers; informs default `auto_promote`. |
| `auto_promote` | Boolean | Whether staging rows in this batch auto-advance to `committing` when validation passes. |
| `status` | Enum (`open`, `ready_for_review`, `approved`, `committing`, `committed`, `archived`) | Lifecycle of the batch itself. |
| `total_rows` / `total_amount_minor` | Integers | Summary metrics for UI. |
| `flagged_rows` | Integer | Count of staging rows marked `dedupe_status = suspect`/`blocked`. |
| `owner_id` / `created_by` | UUID | Accountability. |
| `created_at` / `updated_at` | Timestamp | Audit trail. |
| `notes` | Text | Optional context (import file name, comments). |

**Behaviour**
- When creating a `gift_staging` row, set `gift_batch_id` (create batch on the fly for stream sources like Stripe, or reuse existing batch for manual entry/import flows).
- `auto_promote` default can be derived from `source`/`risk_level`; allow override per batch (e.g., manual import sets `auto_promote = false`).
- Promotion worker checks batch: if `auto_promote = true` and staging row passes validation/dedupe, move to `committing`; otherwise hold at `ready_for_commit` until a user approves via batch UI.
- Batch UI should support bulk actions (approve selected rows, retry failures, archive). Promotion of a batch triggers promotion for eligible rows.
- Batches provide a natural review queue: filter by `status` + `risk_level` to prioritise manual work.

_To do_: include batch metadata in the implementation tickets (definition, UI, promotion logic) once the core staging flow is in place.
