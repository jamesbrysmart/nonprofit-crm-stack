# Online Donation Intake Field Model

_Status: working note_  
_Updated: 2026-05-28_

## Purpose

This note records the **current preferred field model** for online donation intake in the Twenty fundraising app.

It sits underneath the broader adapter contract in:

- [ONLINE_DONATION_INTAKE_CONTRACT.md](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/ONLINE_DONATION_INTAKE_CONTRACT.md)

The purpose here is more specific:

- describe which facts we currently want to promote into app metadata
- describe which facts should remain source-specific evidence
- explain why particular fields exist, are missing, or remain provisional

This note is intentionally provisional.

- It is not a final schema spec.
- It should change if pilot needs, adapter experience, or platform constraints change.
- If we later add, rename, or remove fields, update the reasoning here so the model does not drift silently.

## Current posture

Current leaning:

- use `giftStaging` as the canonical intake boundary for lower-trust online donations
- promote durable cross-provider facts into top-level staging metadata
- avoid turning provider-specific details into first-class fields unless they clearly support downstream processing or operator review
- keep enough explanation here that future sessions understand why a field was added, renamed, deferred, or rejected

Important context:

- the current app metadata is intentionally still **v1**
- there are no active production users on this model yet
- this is the right time to improve names, add missing fields, or remove weak choices before they harden accidentally
- but it is **not** the right time to add every plausible field speculatively just because we can

## Relationship to the current `giftStaging` object

The current metadata definition in:

- [gift-staging.object.ts](/home/jamesbryant/workspace/dev-stack/apps/fundraising/nonprofit-fundraising/src/objects/gift-staging.object.ts)

already gives us a workable first-pass intake shape.

The main question now is not whether we need a staging model at all. We do.

The question is:

- which fields in the current model are already strong
- which are acceptable v1 placeholders
- which should be renamed or reframed
- which important intake facts are still missing

For fundraising context specifically, current modelling direction is:

- `Fund` and `Appeal` are distinct concepts and should not be conflated,
- `giftStaging` should ultimately use real relations to those core objects where the product slice implements them,
- `AppealSource` is the current child attribution object for canonical source/page/channel/segment detail under an appeal,
- source evidence fields such as `sourceAppealName`, `sourceFundName`, and `rawProviderEvidence` remain evidence rather than canonical attribution,
- and source/channel/page/send/platform detail should not automatically be forced into appeal hierarchy just because richer attribution objects are not implemented yet.

## Working rule for this model

When deciding whether a field belongs on `giftStaging`, current leaning is:

1. promote it if it is a durable, cross-provider intake fact that downstream review or processing genuinely needs
2. keep it out of top-level metadata if it is only useful as provider-specific supporting evidence
3. prefer a small number of clear source-neutral fields over a large number of provider-specific fields
4. keep naming provisional when the product language is not yet settled
5. keep borderline additions open until real adapter or workflow pressure proves they belong in metadata

## Field buckets

## 1. Payment evidence

These fields support source tracing, payment interpretation, and later reconciliation.

Current product intent:

- `Gift.amount` remains the donor-facing charitable amount
- `Gift` should carry a small durable set of structured payment fields
- `giftStaging` should carry the intake-time version of those same structured fields plus richer source evidence
- future payout grouping and settlement complexity should sit in a later `GiftPayout` concept rather than being forced onto `Gift`

### Payment evidence principles

- preserve the charitable gift amount separately from payment/platform economics
- store enough structured payment evidence that committed `Gift` records can stand alone for reporting, debugging, and audit
- preserve richer source/provider/import evidence in one bounded JSON field rather than proliferating provider-specific metadata
- treat payout references as a bridge to later payout modelling, not as the payout model itself

### Candidate structured financial fields

These are now the preferred v1 fields for donation/payment economics on both `giftStaging` and `Gift`.

- `amount`
  - charitable gift amount credited to the donor/supporter
  - this is the main donor-facing donation amount
- `coveredFeeAmount`
  - donor-added amount intended to help cover processing/platform fees, where known
  - this is donor-facing and fundraising-relevant, so it should be first-class rather than hidden only in source evidence
- `grossPaymentAmount`
  - provider-reported total payment amount before known provider deductions
  - this may differ from `amount` when fee cover, tips, or provider-specific payment structures are involved
- `processingFeeAmount`
  - known provider/platform deductions attributed to this payment/gift
  - this is intentionally broader and simpler than trying to separate gateway fee, platform fee, and every other deduction in v1
- `netReceivedAmount`
  - provider-reported net amount attributable to this payment/gift after known deductions
  - optional at intake time; many sources will only know this later or not at all
- `providerPaymentId`
  - provider-side transaction/payment reference
- `providerPayoutReference`
  - provider-side payout/deposit/batch reference when available
  - useful as a future bridge to `GiftPayout`, but not sufficient as the payout model on its own

### Naming guidance

Preferred field names:

- `amount`
- `coveredFeeAmount`
- `grossPaymentAmount`
- `processingFeeAmount`
- `netReceivedAmount`
- `providerPaymentId`
- `providerPayoutReference`

Avoid in v1:

- `paymentAmount`
  - too ambiguous against `amount` and `grossPaymentAmount`
- `feeAmount`
  - too vague once provider/platform/donor-covered distinctions appear
- accounting-heavy settlement language on `Gift`
  - we want fundraising/operations-friendly names rather than pretending `Gift` is a ledger

Suggested UI labels:

- `Amount`
- `Covered fees`
- `Payment total`
- `Processing fees`
- `Net received`
- `Provider payment ID`
- `Payout reference`

### What belongs in structured fields vs source evidence

Keep as structured first-class fields:

- `amount`
- `coveredFeeAmount`
- `grossPaymentAmount`
- `processingFeeAmount`
- `netReceivedAmount`
- `providerPaymentId`
- `providerPayoutReference`

Keep in source evidence JSON for now:

- provider/platform tip or contribution amounts
- split gateway-fee vs platform-fee detail
- payout-level adjustments
- chargeback/dispute detail
- rich refund event detail
- source-specific settlement or currency structures
- any provider/import fields that help explain the transaction but are not yet stable cross-source metadata

### Current Stripe recurring lifecycle

Current Stripe recurring donation-form behaviour is intentionally two-step:

- `checkout.session.completed`
  - records recurring setup/agreement evidence on the original `giftStaging` row
  - should not be expected to populate first-payment economics for recurring donations
- `invoice_payment.paid`
  - provides the recurring payment anchor used to populate:
    - `providerPaymentId`
    - `grossPaymentAmount`
    - `processingFeeAmount`
    - `netReceivedAmount`

Implementation note:

- recurring correlation still resolves back to the original donation-form row using linked invoice metadata
- recurring payment economics are expected to appear later than checkout completion
- one-off Stripe donations remain different: their checkout completion path can still populate economics immediately

### Durable source evidence field

Current preferred product intent is one general evidence field:

- `sourceEvidenceJson`

Purpose:

- integrations:
  - preserve relevant provider payload/evidence, metadata, enrichment outputs, and source-specific clues
- donation forms:
  - preserve pre-payment submission context plus later payment-confirmation or enrichment evidence
- CSV/report imports:
  - preserve original row values, unmapped columns, and import metadata

This is preferable to separate `rawProviderEvidence` and import-specific evidence fields because the underlying product purpose is the same:

- preserve original source evidence in a bounded durable shape without turning every source quirk into first-class metadata

Implementation note:

- current app code still uses `rawProviderEvidence`
- this note now treats `sourceEvidenceJson` as the preferred product intent / future naming direction

### Staging vs committed gift durability decision

Current leaning:

- `giftStaging` should hold the richest intake-time evidence
- committed `Gift` should always carry the structured payment fields above
- committed `Gift` should not automatically become a full JSON evidence dump

Open durability decision we should keep visible:

- if `giftStaging` records are retained durably enough for audit/debugging, `Gift` may only need:
  - structured payment fields
  - stable source references
- if `giftStaging` records may later be deleted or archived away from normal access, we will need either:
  - a compact `sourceEvidenceSnapshotJson` on `Gift`
  - or a separate durable source-evidence record linked from `Gift`

For now, product intent should assume:

- `Gift` must stand alone for structured reporting/debugging
- full source evidence durability should remain an explicit architectural decision, not an accidental dependency on staging surviving forever

### Keep

- `amount`
  - core donation fact
  - cross-provider
- `giftDate`
  - core donation fact
  - currently the best available payment/donation date carried into staging
- `providerPaymentId`
  - useful provider-side payment reference
- `providerAgreementId`
  - useful recurring/subscription/mandate evidence across multiple providers
- `coveredFeeAmount`
  - first-class donor-facing fee-cover evidence when known
- `grossPaymentAmount`
  - useful transaction-level payment total evidence
- `processingFeeAmount`
  - useful transaction-level deducted-fee evidence when known
- `netReceivedAmount`
  - useful transaction-level net-received evidence when known
- `providerPayoutReference`
  - useful bridge to later payout grouping

### Keep, but treat the current names as provisional

- `provider`
  - preferred concept: `providerName`
  - current name is workable but vague
- `externalId`
  - preferred concept: `externalDonationId`
  - current name is too generic for long-term product language
- `sourceFingerprint`
  - preferred concept: `sourceEventFingerprint` or `sourceIdempotencyKey`
  - current field is doing useful work, but the name does not clearly signal that role

### Likely additions

- `providerEventId`
  - many sources have an event id distinct from payment or donation id
  - we should not rely only on a derived fingerprint if the source gives us a stable event identifier
- `paymentProviderCustomerId` or `providerDonorId`
  - some providers identify the payer/donor separately from the payment or donation
  - useful for future adapters and repeated-donor tracing

### Why this bucket matters

These are the fields most likely to remain important across Stripe, GoCardless, Donorfy-routed payments, Raisely, Givebutter, JustGiving, Enthuse, Beacon-style imports, and import-style online donation feeds.

### Required vs optional rules

Required on intake for any donation:

- `amount`
- `giftDate`
- enough donor evidence for the intake path

Optional and source-dependent:

- `coveredFeeAmount`
- `grossPaymentAmount`
- `processingFeeAmount`
- `netReceivedAmount`
- `providerPaymentId`
- `providerPayoutReference`
- `sourceEvidenceJson`

Working rule:

- if the source gives one of these values clearly, preserve it
- if the source does not, leave it blank rather than inventing or weakly inferring it

### Staging-to-gift carry-through

Structured fields that should carry from `giftStaging` onto committed `Gift` when present:

- `amount`
- `coveredFeeAmount`
- `grossPaymentAmount`
- `processingFeeAmount`
- `netReceivedAmount`
- `providerPaymentId`
- `providerPayoutReference`
- existing source-identification fields already used for traceability

Reason:

- committed `Gift` should not depend on transient staging records for basic reporting, audit, or debugging of payment economics

### Stripe population lifecycle

Current preferred lifecycle for Stripe donation-form / one-off intake:

1. Form submission / pre-payment staging creation
   - populate:
     - `amount`
     - `coveredFeeAmount` if explicitly captured by the form/config
     - `sourceEvidenceJson` with donation-form submission context
   - do not require:
     - `providerPaymentId`
     - `grossPaymentAmount`
     - `processingFeeAmount`
     - `netReceivedAmount`
     - `providerPayoutReference`

2. Payment confirmation
   - populate when available:
     - `providerPaymentId`
     - `grossPaymentAmount`
   - merge/payment-confirmation evidence into `sourceEvidenceJson`

3. Balance transaction enrichment
   - populate when available:
     - `processingFeeAmount`
     - `netReceivedAmount`
   - Stripe-specific note:
     - these should remain optional because Stripe fee/net truth generally comes from balance-transaction evidence rather than the initial Checkout Session

4. Payout enrichment
   - populate when available:
     - `providerPayoutReference`
   - this creates the bridge to a future `GiftPayout` without implying Stripe payout modelling is already complete

### CSV / report import handling

For CSV/report imports:

- map the small shared top-level fields when the import clearly provides them
- preserve original row values, unmapped columns, and import metadata in `sourceEvidenceJson`
- do not require CSV imports to behave like webhook payloads
- do not promote every import column into first-class metadata just because it exists once

This keeps CSV aligned with the same evidence contract as integrations:

- small shared structured fields
- one bounded source evidence JSON field
- later operator review or enrichment where needed

## 2. Donor identity and contact evidence

These fields carry incoming donor evidence before donor resolution is complete.

### Keep

- `donorFirstName`
- `donorLastName`
- `donorEmail`

Why:

- these are core cross-provider intake facts
- they are needed for donor resolution, duplicate prevention, and gift creation

### Likely additions

- `donorMailingAddress`
  - preferred name
  - likely `ADDRESS` type
  - online donation forms often capture address
  - Gift Aid evaluation may depend on it
  - donor resolution may benefit from it
  - the incoming address should not only exist later on the linked `person`
- `donorPhone`
  - only if a real adapter clearly needs it
  - useful, but not yet obviously pilot-critical

### Why this bucket matters

This bucket should describe the donor as captured by intake, not the final resolved donor record.

## 3. Donation intent

These fields describe what kind of donation the donor appears to have made.

### Keep for now

- `intakeSource`
  - useful v1 field
  - currently signals the lower-trust source that created the staging row
  - however, it is likely doing two jobs at once:
    - ingestion channel
    - operational source label
- `providerAgreementId`
- `providerIntervalUnit`
- `providerIntervalCount`

Why:

- these fields are already useful for recurring unmatched-review and later recurring-agreement promotion

### Likely additions or conceptual replacements

- `donationType`
  - likely values such as `ONE_OFF` / `RECURRING`
  - only worth adding if treated as an explicit normalized intake fact, not just a convenience label inferred from other fields
- `sourceChannel`
  - examples:
    - `ONLINE_FORM`
    - `WEBHOOK`
    - `IMPORT`
    - `MANUAL`
  - potentially useful, but currently more speculative than core intake evidence

### Reconsider later

- broader attribution/designation fields
  - raw source-supplied campaign/page/channel labels
  - fund intent / designation from source
  - appeal intent / attribution from source

These likely matter, but they should be added deliberately once a real adapter or pilot workflow needs them.

Working distinction to preserve:

- if the source is telling us where the money should be designated, that points toward `Fund`,
- if the source is telling us which fundraising effort should get attribution, that points toward `Appeal`,
- if the source is telling us the execution detail under that effort, that likely points toward `AppealSource` or stays as evidence until that object exists,
- and none of those should default to "create more appeal hierarchy" without a separate product decision.

### Why this bucket matters

This bucket should describe donor intent and recurring evidence in source-neutral terms, even if the first adapter is Stripe.

## 4. Gift Aid evidence

This is the strongest existing evidence bucket after payment evidence.

### Keep

- `giftAidRequested`
- `giftAidDeclarationCaptured`
- `giftAidDeclarationDate`
- `giftAidCoverageScope`
- `giftAidDeclarationSource`
- `giftAidTextVersion`

Why:

- these are donation-shaped intake facts, not provider-specific quirks
- they support later declaration creation/resolution and final Gift Aid evaluation
- they preserve the important boundary between:
  - `Gift Aid was requested`
  - and
  - `we have enough declaration evidence to treat this as captured`

### Why this bucket matters

The schema is already in a good place here. The current gap is more in adapter mapping than in field design.

## 5. Processing confidence and blockers

These fields support review and safe commit.

### Keep

- `donorResolutionState`
- `hasCoreGiftIssue`
- `isReadyForProcessing`
- `processingStatus`
- `errorDetail`

Why:

- they make ambiguity and failure visible before commit
- they support the review/process boundary directly

### Reconsider later

- `hasCoreGiftIssue`
  - useful now
  - but broad
  - may later want to become more structured diagnostics rather than a single boolean

### Why this bucket matters

This bucket is already close to the desired first-pass processing model.

## 6. Source evidence JSON

This is now the preferred general evidence boundary.

### Preferred field

- `sourceEvidenceJson`
  - exact Twenty field type still to be decided based on platform support

Why:

- some source-specific facts are useful enough to preserve
- but not important enough to promote into many top-level fields
- this gives us one durable place to keep:
  - provider metadata maps
  - provider-specific recurring or campaign identifiers
  - donation-form submission context
  - CSV/report row values and unmapped columns
  - later enrichment evidence such as balance-transaction or payout details
  - selected fragments needed for debugging or audit

### Why this bucket matters

Without this boundary, we will tend to either:

- drop useful evidence
- or keep creating one-off top-level fields for each new adapter/import path

### Durability note

This field is primarily staging/source-intake evidence.

If later we conclude that staging is not durable enough for audit/debugging needs, we should:

- either add a compact snapshot field to `Gift`
- or introduce a separate durable source-evidence record

We should not silently rely on staging permanence without making that an explicit product/ops decision.

## 7. Future GiftPayout path

Current intent:

- do not introduce full payout modelling into `Gift` or `giftStaging` v1
- do keep enough gift-level payment evidence that a later `GiftPayout` object has a clean bridge

`providerPayoutReference` is useful because it can later support:

- grouping gifts/payments into a provider payout or bank deposit
- importing payout files and linking them back to gifts
- highlighting variance between transaction-level gift/payment evidence and payout-level settlement truth

But it is not enough on its own for full correctness where:

- one payout contains many gifts plus fees, refunds, chargebacks, or adjustments
- fees are only known at payout level
- settlement currency differs from payment currency
- later payout files revise or clarify transaction economics

That future complexity should live on `GiftPayout`, not on `Gift`.

## Current assessment of the v1 model

## Strong areas

- payment evidence baseline
- Gift Aid evidence fields
- processing confidence and blocker fields

## Weak or incomplete areas

- donor contact and address evidence
- explicit donation-intent fields
- clearer separation of event id vs donation/payment id vs idempotency fingerprint
- final decision on `sourceEvidenceJson` durability versus a later evidence record
- future `GiftPayout` bridge and payout enrichment lifecycle

## Naming concerns

The current v1 model is workable, but some names are too generic:

- `provider`
- `externalId`
- `sourceFingerprint`

These do not necessarily require immediate metadata churn, but they should be treated as provisional names rather than settled product language.

## Keep / rename / add / defer summary

## Keep with confidence

- `amount`
- `coveredFeeAmount`
- `grossPaymentAmount`
- `processingFeeAmount`
- `netReceivedAmount`
- `providerPayoutReference`
- `giftDate`
- `donorFirstName`
- `donorLastName`
- `donorEmail`
- all current Gift Aid intake evidence fields
- `donorResolutionState`
- `isReadyForProcessing`
- `processingStatus`
- `errorDetail`

## Keep, but treat as provisional naming

- `provider`
- `externalId`
- `sourceFingerprint`
- `intakeSource`

## Add when justified by the next real adapter or workflow

- `providerEventId`
- `paymentProviderCustomerId` or `providerDonorId`
- `donorMailingAddress`
- `sourceEvidenceJson`

These are currently the strongest candidates because they look most like durable intake facts or bounded source evidence rather than convenience metadata.

## Keep open and add only if the product pressure becomes clear

- `donationType`
- `sourceChannel`

These may still be right later, but they are more likely to drift into interpretation or classification metadata if we add them too casually.

## Defer until a real adapter or workflow demands them

- `donorPhone`
- attribution/designation/campaign fields
- richer structured blocker diagnostics replacing `hasCoreGiftIssue`

## Suggested next review pass

Before hardening the next adapter:

1. decide which current staging fields should be:
   - kept as-is
   - renamed in metadata
   - kept in metadata but conceptually renamed in adapter/model code first
2. decide whether to add now, keep open, or continue to defer:
   - donor mailing address
   - provider event id
   - provider customer/donor id
   - raw provider evidence
   - donation type
   - source channel
3. only then harden Stripe and other adapters into this model, including:
   - when payment-evidence fields arrive
   - which evidence stays only in `sourceEvidenceJson`
   - and what must survive from staging onto committed `Gift`

## Relationship to other notes

Use this alongside:

- [ONLINE_DONATION_INTAKE_CONTRACT.md](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/ONLINE_DONATION_INTAKE_CONTRACT.md)
- [PRODUCT_REVIEW.md](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/PRODUCT_REVIEW.md)
- [PILOT_APP_IMPLEMENTATION_PLAN.md](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/PILOT_APP_IMPLEMENTATION_PLAN.md)
- [MIGRATION_WORKING_PATTERNS.md](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/MIGRATION_WORKING_PATTERNS.md)
