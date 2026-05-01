# Online Donation Intake Field Model

_Status: working note_  
_Updated: 2026-04-30_

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

## Working rule for this model

When deciding whether a field belongs on `giftStaging`, current leaning is:

1. promote it if it is a durable, cross-provider intake fact that downstream review or processing genuinely needs
2. keep it out of top-level metadata if it is only useful as provider-specific supporting evidence
3. prefer a small number of clear source-neutral fields over a large number of provider-specific fields
4. keep naming provisional when the product language is not yet settled
5. keep borderline additions open until real adapter or workflow pressure proves they belong in metadata

## Field buckets

## 1. Payment evidence

These fields support reconciliation, idempotency, and source tracing.

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

These are the fields most likely to remain important across Stripe, GoCardless, Donorfy-routed payments, Raisely, Givebutter, JustGiving, and import-style online donation feeds.

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
  - campaign
  - designation
  - fund / appeal intent from source

These likely matter, but they should be added deliberately once a real adapter or pilot workflow needs them.

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

## 6. Raw provider evidence

This is the clearest current model gap.

### Likely addition

- `rawProviderEvidence`
  - exact Twenty field type still to be decided based on platform support

Why:

- some provider-specific facts are useful enough to preserve
- but not important enough to promote into many top-level fields
- this gives us a place to keep:
  - raw metadata maps
  - provider-specific recurring or campaign identifiers
  - selected payload fragments needed for debugging or audit

### Why this bucket matters

Without this boundary, we will tend to either:

- drop useful evidence
- or keep creating one-off top-level fields for each new adapter

## Current assessment of the v1 model

## Strong areas

- payment evidence baseline
- Gift Aid evidence fields
- processing confidence and blocker fields

## Weak or incomplete areas

- donor contact and address evidence
- explicit donation-intent fields
- clearer separation of event id vs donation/payment id vs idempotency fingerprint
- raw provider evidence boundary

## Naming concerns

The current v1 model is workable, but some names are too generic:

- `provider`
- `externalId`
- `sourceFingerprint`

These do not necessarily require immediate metadata churn, but they should be treated as provisional names rather than settled product language.

## Keep / rename / add / defer summary

## Keep with confidence

- `amount`
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
- `rawProviderEvidence`

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
3. only then harden Stripe as the first adapter into this model

## Relationship to other notes

Use this alongside:

- [ONLINE_DONATION_INTAKE_CONTRACT.md](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/ONLINE_DONATION_INTAKE_CONTRACT.md)
- [PRODUCT_REVIEW.md](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/PRODUCT_REVIEW.md)
- [PILOT_APP_IMPLEMENTATION_PLAN.md](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/PILOT_APP_IMPLEMENTATION_PLAN.md)
- [MIGRATION_WORKING_PATTERNS.md](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/MIGRATION_WORKING_PATTERNS.md)
