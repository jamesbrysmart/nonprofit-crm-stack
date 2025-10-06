# Fundraising Data Model Overview

**Purpose**  
Define the managed extension objects that power donation intake, attribution, pipeline, and stewardship so we can plan slices without stepping on other modules.

---

## Primary Objects (Planned)

| Object | Owned By | Description | Key Links |
| --- | --- | --- | --- |
| `Gift` | Fundraising | Single payment/receipt record (includes in-kind and refunds). | Links to `Person` (donor), `Fund`, `Appeal`, `TrackingCode`, optional `Opportunity`. |
| `Appeal` | Fundraising | Collapsed campaign/appeal entity that drives attribution and rollups. | Defaults for `Fund`/`TrackingCode`; parents group broader campaigns. |
| `AppealSegment` | Fundraising | Optional channel/audience breakout for appeals. | Holds solicitation counts; inherits from `Appeal`. |
| `TrackingCode` | Fundraising | First-class tracking artefact for UTMs, QR codes, offline reply codes. | Points to `Appeal` or `AppealSegment`; surfaces attribution metrics. |
| `Fund` | Fundraising | Designation/purpose for Gifts. | Referenced by Gift defaults, financial exports. |
| `Opportunity` | Fundraising | Optional pipeline record for grants/HNW/legacy. | Aggregates linked Gifts, stores commitment amount/schedule defaults. |
| `SolicitationSnapshot` | Fundraising | Records solicited counts for response-rate calculations. | References `Appeal`/`AppealSegment`; consumed by dashboards. |
| `RecurringAgreement` | Fundraising | Captures recurring intent (Stripe/GoCardless). | Webhooks spawn `Gift` installments; references payment method metadata in core. |

> Additional helpers (e.g., `OpportunityPaymentSchedule`, Membership/Event modules) stay feature-flagged and get their own tables when activated. See `docs/features/opportunities-gifts.md` for the current roadmap.

---

## Relationship Map (High Level)

```
Person ─┬─ Gift ── Fund
        │       └─ Appeal ──┬─ AppealSegment ── TrackingCode
        │                   └─ SolicitationSnapshot
        └─ Opportunity ── Gift (optional link)

RecurringAgreement ──(produces)── Gift
```

- Gifts are authoritative for revenue, reconciliation, and receipting. Opportunities never count as income.
- Appeals own attribution defaults; marketing integrations resolve to `TrackingCode` values instead of duplicating campaign members.
- Recurring Agreements and Opportunity schedules never create revenue on their own—they only help orchestrate future Gifts.

---

## Gift Schema Alignment (WIP)

| Concern | Current proxy behaviour (`gift.validation.ts`, `gift.service.ts`) | Target across Specs | Action / Notes |
| --- | --- | --- | --- |
| Amount representation | Accepts `{ amount: { currencyCode, value } }` (major units) and forwards as-is. | `amount_minor` integer (minor units) + `currency` string (`docs/features/donation-intake.md:30`). | Convert UI/proxy input to minor units before persistence; keep derived major-unit value only for UX if needed. Align outbound payloads once Twenty schema confirmed. |
| Date field | Uses `giftDate` (optional `date`). | `date_received` (`donation-intake.md:30`). | Rename field in proxy + metadata; ensure staging/envelope uses the same attribute. |
| Currency key | Uses `currencyCode`. | `currency`. | Rename to match staging/export conventions. |
| Payment method | Not captured today. | `payment_method` enum (`card`, `direct_debit`, etc.) (`donation-intake.md:34`). | Add to proxy payload and validation; defaults derive from intake source (Stripe → `card`, GoCardless → `direct_debit`). |
| Attribution defaults | Optional `campaignId`; no fund/segment/tracking support yet. | `fund_id`, `appeal_id`, `appeal_segment_id`, `tracking_code_id` (`campaigns-appeals.md:20-62`, `opportunities-gifts.md:71`). | Replace `campaignId` with `appeal_id`; add remaining fields as optional inputs once metadata lands. |
| External reference | Optional `externalId`; reconciler expectations unclear. | Canonical `external_id` string (`donation-reconciliation.md:109`, decision from discussion). | Store provider/import IDs in `external_id`. Additional provenance fields (`source_system`, etc.) remain optional. |
| Contact / donor linkage | Proxy resolves `contact` → `donorId` (Twenty naming). | Shared `contact_id` (and optional household visibility) (`opportunities-gifts.md:56`, `donation-intake.md:30`). | Align naming across metadata; consider storing both `donor_id` (Twenty) and `contact_id` alias until metadata automation settles. |
| Staging metadata | Proxy does not attach staging envelope (`intake_source`, `source_fingerprint`). | All intake paths land in shared `gift_staging` metadata first (`donation-staging.md:1`). | Ensure ingestion pipeline records staging metadata before committing Gifts; update runbooks. |
| In-kind & extras | Fields like `is_in_kind`, `in_kind_description`, `soft_credit_contact_id`, `split_allocations[]` absent. | Detailed in `opportunities-gifts.md:79-88`. | Add progressively once core schema stabilises; gated behind feature flags. |

_Decision highlights_: standardise on minor units for cash amounts (conversion boundary sits at the proxy for now) and a single `external_id` field for idempotency/reconciliation. Revisit once Twenty publishes definitive metadata guidance.

---

## MVP Slice Candidates

1. **Gifts + Funds + Appeals (core intake)**  
   - Covers Stripe webhook path already in the service.  
   - Requires staging alignment (`docs/features/donation-staging.md`) and rollups for Appeals.

2. **Opportunities (lean pipeline)**  
   - Adds solicitation tracking for HNW/grants without touching intake.  
   - Needs rollup fields (`gifts_received_amount`) and defaults for Gift attribution.

3. **Recurring Agreements (Stripe/GoCardless)**  
   - Models agreements + webhook handlers feeding Gifts.  
   - Relies on provider token storage in core and receipting cadence from `docs/features/gift-receipts.md`.

Record deviations or additional slices here before updating the backlog; this keeps specs, data models, and tickets in sync.

---

## Open Questions

- Field naming harmony with Twenty core (`donorId` vs `contactId`, `amount_minor` vs `amountMicros`).
- Where to persist shared rollup outputs (denorm columns vs. materialized analytics views).
- How Opportunity commitments interact with finance exports when negative Gifts (refunds) enter the mix.

Track resolution steps here so backlog tickets can reference a single source of truth.

---

## References

- `docs/features/donation-intake.md`
- `docs/features/campaigns-appeals.md`
- `docs/features/opportunities-gifts.md`
- `docs/features/recurring-donations.md`
- `docs/features/donation-reconciliation.md`

## Staging Contract Alignment (WIP)

| Concern | Current behaviour | Target across Specs | Action / Notes |
| --- | --- | --- | --- |
| Ingestion entry point | Stripe/manual flows create Gifts directly in Twenty. | All intake routes write to `gift_staging` (Twenty metadata) first (`donation-staging.md`). | Add staging write step in proxy; only promote to Gift after validation/dedupe. |
| Staging fields | Not captured today. | `intake_source`, `raw_payload`, `source_fingerprint`, `validation_status`, `dedupe_status`, `gift_batch_id`, `promotion_status`, timestamps. | Define `gift_staging` metadata schema in Twenty; ensure retries/historical imports use same envelope. |
| Validation lifecycle | Inline proxy validation only; no persisted status. | Run staging validation + dedupe before commit (`donation-staging.md`). | Implement background/inline worker to process staging rows, flag exceptions, and emit audit trail. |
| Promotion to Gift | Immediate GraphQL call to `/gifts`. | After staging row approved, map to Gift schema (see table above). | Build promotion flow in Twenty metadata: statuses like `ready_for_commit`, `committed`, `commit_failed`; log Gift ID for reconciliation & rollback. Honour `gift_batch.auto_promote` when advancing rows. |
| Idempotency | Relies on immediate API responses; no persisted fingerprint. | `source_fingerprint` + `external_id` for dedupe (`donation-intake.md:44`, `…:111`). | Generate fingerprint on staging write; enforce uniqueness before promotion. |
| Error handling | Exceptions bubble up to caller; no queue. | Staging rows track `validation_status`, `error_message`. Manual remediation possible. | Extend staging table with audit columns; document remediation flow. |
