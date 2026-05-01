# Online Donation Intake Contract

_Status: working note_  
_Updated: 2026-04-30_

## Purpose

This note defines the **canonical CRM-side intake contract** for online donations entering the fundraising app.

It is deliberately **source-neutral**.

The goal is not to model Stripe, Donorfy, Raisely, Givebutter, GoCardless, JustGiving, or any other provider directly as the product model.

The goal is to define the internal donation-shaped contract that source adapters should map into before records reach `giftStaging`, processing, and final CRM objects.

This note is intentionally provisional:

- it is not a final integration spec
- it should evolve as new adapters and real pilot requirements appear
- if a better contract shape becomes clear, replace the weaker version rather than preserving it for consistency's sake

## Canonical flow

Use this as the target flow:

`donation source adapter`
→ `canonical online donation intake contract`
→ `giftStaging`
→ `processing`
→ `Gift / RecurringAgreement / Gift Aid outcome`

Do **not** treat a provider event shape as the core product model.

## Why this matters

Without an explicit contract, it is easy to drift into:

- Stripe-shaped staging records
- one provider's metadata naming leaking into product fields
- weak portability to GoCardless, Donorfy, Raisely, Givebutter, JustGiving, CSV imports, or other future online sources

The app should instead work from:

- durable intake facts
- source-specific raw evidence kept at the edge
- consistent downstream processing and review logic

## Contract buckets

The canonical online donation intake contract should separate the following categories.

### 1. Payment evidence

Examples:

- `providerName`
- `providerEventId`
- `providerPaymentId`
- `providerDonorId` or `paymentProviderCustomerId`
- `providerAgreementId`
- `externalDonationId`
- `amount`
- `currency`
- `paymentDate`
- payment status when available

Purpose:

- identify and reconcile the payment event
- support idempotency / replay protection
- preserve enough source evidence for audit and investigation

### 2. Donor identity and contact evidence

Examples:

- first name
- last name
- email
- mailing address
- phone or other contact detail if available

Purpose:

- carry the incoming donor evidence without forcing an early donor match
- support duplicate prevention, donor resolution, and later Gift Aid evaluation

### 3. Donation intent

Examples:

- `donationType`: one-off vs recurring
- recurring setup/cadence evidence
- source channel
- campaign/fund/designation metadata where available

Purpose:

- represent what the donor appears to have intended, independent of provider transport details
- preserve recurring-related evidence before final recurring agreement linkage or creation is safe

### 4. Gift Aid evidence

Examples:

- Gift Aid requested / selected
- declaration captured or not
- declaration date
- declaration source
- declaration wording or text version
- coverage scope where known

Purpose:

- preserve what the intake channel actually captured
- support later declaration creation/resolution and final Gift Aid evaluation

Important boundary:

- a vague Gift Aid flag is **not** the same thing as a valid declaration
- intake should preserve the evidence, not silently over-interpret it

### 5. Processing confidence and blockers

Examples:

- ready to process
- needs donor resolution
- missing amount/date
- unsupported recurring cadence evidence
- insufficient declaration evidence
- missing donor address/contact evidence where later policy depends on it

Purpose:

- make uncertainty and blockers explicit before commit
- support review surfaces and safe processing

### 6. Raw provider evidence snapshot

Examples:

- selected raw provider payload fragments
- provider metadata map
- provider-specific recurring or campaign identifiers

Purpose:

- keep source-specific evidence available without promoting every provider detail into first-class product metadata

Important boundary:

- raw provider evidence is supporting context
- it should not become the default operator-facing model

## What belongs in `giftStaging`

Current leaning:

- `giftStaging` should hold the **canonical intake facts** and the **review/processability state** needed before commit
- it should not become a dumping ground for every provider-specific field unless that field is genuinely needed downstream

That suggests:

- common top-level staging fields for payment evidence, donor evidence, donation intent, Gift Aid evidence, and processing state
- source-specific details kept either in:
  - clearly named generic provider fields, or
  - a bounded raw/provider evidence field if/when that is justified

## What should remain provider-specific

Adapters can preserve provider-specific concepts, but they should remain at the adapter/evidence layer unless they clearly deserve broader product status.

Examples:

- Stripe subscription object shape
- GoCardless mandate payload specifics
- Donorfy embedded form internals
- Raisely campaign field naming

These may still matter for:

- debugging
- audit
- mapping
- provider-specific certainty logic

But they should not define the product-facing intake model.

## Practical implications for current work

For the current pilot, the most important use of this note is:

1. define the canonical contract first
2. map current Stripe intake into that contract
3. harden missing high-priority evidence in that shared model

Current likely gaps in the first Stripe adapter:

- Gift Aid evidence capture
- donor mailing address / richer contact evidence
- wider donation-intent metadata such as designation or campaign context where available

## Relationship to the product review

This note is implementation-facing, but it follows the same broad posture as the product review:

- preserve durable facts
- keep provider-specific logic bounded
- avoid letting one source shape define the fundraising product model
- use staging as the controlled boundary between lower-trust intake and final committed CRM records

Use this note alongside:

- [PRODUCT_REVIEW.md](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/PRODUCT_REVIEW.md)
- [PILOT_APP_IMPLEMENTATION_PLAN.md](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/PILOT_APP_IMPLEMENTATION_PLAN.md)
- [MIGRATION_WORKING_PATTERNS.md](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/MIGRATION_WORKING_PATTERNS.md)

## Next step

The next practical task after this note should be:

- review the current Stripe adapter against this contract
- identify which fields are already mapped
- identify which pilot-critical facts are missing
- then harden the Stripe mapping as the **first adapter implementation** of this shared intake layer
