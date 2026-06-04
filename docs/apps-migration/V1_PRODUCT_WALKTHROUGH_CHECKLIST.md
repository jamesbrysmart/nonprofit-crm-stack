# V1 Product Walkthrough Checklist

_Status: working note_  
_Updated: 2026-06-01_

## Purpose

This note is the working checklist for walking the current fundraising app as a coherent v1 product rather than only as a set of pilot scenarios or implementation slices.

It is intended to support:

- structured UI walkthrough testing
- comparison between current code and intended product behavior
- identification of bugs, UX rough edges, and unresolved product gaps
- later pilot-specific overlays such as Crossroads or Imara validation

This is not a feature spec and not a test script yet.

It is the top-level workflow map we use before drilling into:

- expected behavior
- detailed walkthrough steps
- acceptance checks
- current confidence status

## How to use this note

For each workflow area, we should progressively do four things:

1. confirm the intended product scope
2. compare current implementation against product notes/docs
3. define expected behavior clearly enough to test
4. run UI walkthroughs and record:
   - working
   - rough edge
   - bug
   - unresolved product question

This note starts with the high-level workflow map only.

## Current v1 workflow map

The current working view is that the fundraising app v1 now covers these major product areas.

### 1. Donation form creation and publishing

This area covers the admin-side workflow for configuring, previewing, publishing, and managing first-party donation forms.

Current subareas:

- donation form configuration
- preview behavior
- publish flow
- published version tracking
- form workspace/admin controls

Why it matters:

- if form creation/publishing is confusing or unreliable, intake quality suffers before a donor even submits anything
- this is a distinct product surface from donation review/processing
- it defines what a charity can safely expose publicly

Key transitions:

- draft form -> previewable form
- draft form -> published form
- published form -> new published version

### 2. First-party donation form intake

This area covers intake where we control the user-facing donation form and the initial staged row creation before provider confirmation completes.

Current subareas:

- donation form submission
- pre-payment staged gift creation
- payment-state gating
- Stripe one-off payment confirmation
- intake-time source and Gift Aid evidence capture

Why it matters:

- this is the clearest example of multi-step intake timing in the app
- it tests whether pre-payment rows are safe, reviewable, and not accidentally processable
- it is the front door for our own first-party online giving experience once a form is published

Key transitions:

- form submission -> `giftStaging`
- `AWAITING_PAYMENT` -> `PAYMENT_CONFIRMED`
- pre-payment evidence -> enriched staged row

### 3. External and import intake

This area covers lower-trust intake from external platforms, CSV imports, reports, and other non-form sources.

Current subareas:

- provider/webhook-created staged gifts
- CSV/report import into `giftStaging`
- source evidence preservation
- imported appeal/fund cues
- payment/provider references from external sources

Why it matters:

- this is where source variability is highest
- it defines whether the app preserves enough evidence without over-modeling every provider
- it is the main path for CSV-style operational cleanup and review
- it is also where we pressure-test whether the product is genuinely extensible beyond Stripe and our own form flow

Key transitions:

- external source or import -> `giftStaging`
- source evidence captured -> reviewable staged row
- import grouping -> `giftBatch` work surface where relevant

### Current validation split

This workflow area should be treated as two distinct review tracks:

- new donation-platform integration review
- CSV/report import pressure test

The product questions overlap, but the validation methods differ enough that
they should not be treated as a single walkthrough.

### New donation-platform integration review

This is less a UI walkthrough and more a product/intake-model validation
exercise.

What we want to confirm:

- a third-party fundraising platform can land data in `giftStaging` without
  schema changes
- source evidence can be preserved without provider-specific field sprawl
- we have a stable idempotency approach for repeated syncs
- broader campaign/page context can map into `Appeal` / `AppealSource`
  without forcing premature canonical modeling
- incomplete donor identity or anonymous donations do not break the intake path

Current status:

- not yet practically validated
- provisional design note written for JustGiving as the first reference case:
  - [JUSTGIVING_INTEGRATION_SPIKE.md](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/JUSTGIVING_INTEGRATION_SPIKE.md:1)

To do:

- use the JustGiving spike note as the first external-platform review case
- validate the product-level questions, not only the JustGiving-specific ones:
  - can a provider supply page/campaign/donation data that fits the current
    `giftStaging` contract?
  - do `Appeal` and `AppealSource` give us a clean place for broader campaign
    vs individual page attribution?
  - is `rawProviderEvidence` sufficient for full source retention in the short
    term?
  - do idempotency, pagination, missing donor data, and source evidence look
    robust enough for a client-specific connector spike?

### CSV/report import pressure test

This remains the more directly walkable UI/operational path:

- import platform-exported data into `giftStaging`
- review field clarity and source evidence survival
- pressure-test donor resolution, coding, and readiness
- confirm that the staging/review workflow can absorb messy third-party exports

Current status:

- not yet fully walked through

### 4. Gift batch control surface

This area covers `giftBatch` as an operational surface for grouped intake rather than just a passive grouping object.

Current subareas:

- batch summary and worklist navigation
- batch donor match
- batch readiness check
- batch processing
- batch appeal/fund coding
- batch-size guardrails

Why it matters:

- grouped intake is a first-class workflow for CSV/import-style operations
- `giftBatch` now has meaningful behavior and not just metadata
- if we under-test it, we will miss important operational UX and state-management issues

Key transitions:

- batch created -> rows available for grouped review
- batch coding / checking / donor match -> row-level review state changes
- batch processed -> committed gifts and batch outcome updates

### 5. Gift staging review

This area covers the review surface for staged gifts before they are processed into committed gifts.

Current subareas:

- review state / summary
- donor evidence visibility
- payment-state visibility
- source evidence visibility
- Gift Aid evidence visibility
- correction of staged gift facts

Why it matters:

- this is the main safety boundary before canonical gift creation
- it is where staff interpret and resolve ambiguity
- it is the operational home for lower-trust intake

Key transitions:

- unreviewed -> needs review
- needs review -> ready to process
- ready to process -> processed
- failed -> retried / corrected

### 6. Donor resolution

This area covers how incoming donor evidence becomes a linked donor or a safe new donor path.

Current subareas:

- single-record donor review
- donor match
- explicit confirmed donor choice
- ambiguous donor handling
- unmatched new-donor path
- donor-creation safety checks

Why it matters:

- donor mistakes are among the highest-cost data problems
- the app’s explicit review model is one of its main product differentiators

Key transitions:

- unreviewed -> confirmed donor
- unreviewed -> ambiguous donor
- unreviewed -> new donor path

### 7. Readiness and processing

This area covers the system decision about whether a staged gift is safe to process and the final commit boundary into `Gift`.

Current subareas:

- single-record readiness check
- batch readiness check
- selected-row readiness check
- processing a single staged row
- processing selected rows
- processing a batch
- writebacks after success/failure

Why it matters:

- this is the core operational trust boundary
- it determines whether the app creates clean committed gifts or leaks unresolved ambiguity through the pipeline

Key transitions:

- `NEEDS_REVIEW` -> `READY_TO_PROCESS`
- `NOT_PROCESSED` -> `PROCESSED`
- `NOT_PROCESSED` -> `PROCESS_FAILED`

### 8. Appeal and fund coding

This area covers fundraising coding on staged gifts, committed gifts, and grouped workflows.

Current subareas:

- single staged-gift coding
- committed gift coding
- batch coding
- source appeal/fund evidence review
- appeal default-fund behavior

Why it matters:

- coding is operationally important without being globally blocking
- source evidence now meaningfully interacts with readiness/review behavior
- this is one of the newer areas where product coherence matters more than isolated implementation success

Key transitions:

- uncoded -> coded
- source evidence present -> resolved canonical coding
- batch-level coding -> row-level ready-to-process state

### 9. Manual gift entry

This area covers the direct-create trusted path for gifts that do not need staging first.

Current subareas:

- manual one-off gift entry
- duplicate interruption
- Gift Aid capture
- appeal/fund coding
- direct committed gift creation

Why it matters:

- it is the cleanest “known-good” path in the app
- it provides a benchmark for how much complexity the system asks the user to handle directly

Key transitions:

- draft manual entry -> committed gift
- donor ambiguity -> explicit donor choice

### 10. Gift Aid

This area covers declaration capture, gift-level outcome, and claim-batch preparation.

Current subareas:

- declaration capture during intake/manual entry
- declaration creation/resolution
- gift-level Gift Aid outcome
- reason code / decision source
- draft claim batch workflow

Why it matters:

- it is one of the most operationally valuable fundraising features in the app
- it combines intake evidence, donor context, and downstream workflow consequences

Key transitions:

- Gift Aid requested -> declaration captured or missing
- committed gift -> claimable / needs review / not claimable
- claimable gift -> claim batch inclusion

### 11. Recurring donation handling

This area covers the recurring-specific parts of intake and committed records.

Current subareas:

- recurring evidence in staging
- recurring agreement creation rules
- recurring gift linkage
- recurring tracking / status visibility

Why it matters:

- recurring giving is central to real fundraising operations
- recurring logic is more sensitive than simple one-off gift creation
- this area touches both intake and later donor/finance expectations

Key transitions:

- recurring evidence captured -> recurring agreement link or review
- recurring gift -> agreement-linked committed gift

### 12. Committed gift review and correction

This area covers what users can do once a canonical `Gift` exists.

Current subareas:

- gift summary / audit visibility
- appeal/fund correction
- Gift Aid state visibility
- refund handling
- payment-evidence visibility and future durability concerns

Why it matters:

- a committed gift must be trustworthy but still correctable
- this area defines the long-term product feel more than staging alone

Key transitions:

- committed gift -> corrected committed gift
- committed active gift -> refunded state

### 13. Finance handoff and payment evidence

This area covers what the CRM can explain to finance/admin users about money received versus donor-facing gift value.

Current subareas:

- export/handoff of committed gifts
- staged vs committed distinction
- payment references
- fee/net evidence
- future payout-link bridge

Why it matters:

- pilot confidence depends partly on finance trusting the CRM enough to use its outputs
- this area is broader than accounting, but narrower than a full reconciliation system

Key transitions:

- committed gift -> finance-visible reporting/export record
- transaction-level payment evidence -> future payout linkage

## Working review order

Suggested order for deeper walkthrough preparation:

1. donation form creation and publishing
2. first-party donation form intake
3. external and import intake
4. gift batch control surface
5. gift staging review
6. donor resolution
7. readiness and processing
8. appeal and fund coding
9. manual gift entry
10. Gift Aid
11. recurring donation handling
12. committed gift review and correction
13. finance handoff and payment evidence

Reason:

- the first eight areas now form the core day-to-day donation operations workflow
- manual entry and Gift Aid are important but easier to interpret once the main intake/processing model is clear
- recurring and finance/payment evidence benefit from grounding in the earlier operational flows first

## What this note does not yet include

This first pass does not yet define:

- detailed walkthrough steps per workflow area
- expected UI states
- acceptance criteria
- current confidence status
- bug log or rough-edge log

Those should be added in the next pass once we review and agree this high-level workflow map.

## Detailed walkthrough preparation

This section is where we progressively expand one workflow area at a time before live UI testing.

The shape for each expanded area should be:

- intended scope
- current build / implementation shape
- expected behavior
- what to verify in the UI
- likely rough-edge zones

## 1. Donation form creation and publishing

### Intended scope

This workflow area is about the admin/staff experience of preparing a usable public donation form.

It does not yet cover:

- donor submission through the form
- staged-gift creation after submission
- Stripe confirmation and later intake enrichment

Those belong to the separate `first-party donation form intake` walkthrough area.

The scope here is:

- editing the saved draft form config
- previewing the saved draft
- publishing the draft into a live form
- understanding whether the live form matches the current draft
- retrieving the live link and embed snippet

### Current build / implementation shape

Current product surface:

- a `DonationForm` record page with tabs:
  - `Configure`
  - `Preview`
  - `Publish`
  - `Notes`

Current implementation references:

- record page layout:
  - [donation-form-record.page-layout.ts](/home/jamesbryant/workspace/dev-stack/apps/fundraising/nonprofit-fundraising/src/page-layouts/donation-form-record.page-layout.ts:1)
- configure surface:
  - [donation-form-workspace.front-component.tsx](/home/jamesbryant/workspace/dev-stack/apps/fundraising/nonprofit-fundraising/src/front-components/donation-form-workspace.front-component.tsx:1)
- preview surface:
  - [donation-form-preview.front-component.tsx](/home/jamesbryant/workspace/dev-stack/apps/fundraising/nonprofit-fundraising/src/front-components/donation-form-preview.front-component.tsx:1)
- publish surface:
  - [donation-form-publish.front-component.tsx](/home/jamesbryant/workspace/dev-stack/apps/fundraising/nonprofit-fundraising/src/front-components/donation-form-publish.front-component.tsx:1)
- publishability validation:
  - [donation-form-config.ts](/home/jamesbryant/workspace/dev-stack/apps/fundraising/nonprofit-fundraising/src/donation-forms/donation-form-config.ts:1)

Important current product behavior:

- `Configure` edits a saved draft, not the live form directly
- `Preview` reflects the saved draft, not unsaved changes
- `Publish` publishes the saved draft and produces:
  - live public link
  - iframe embed snippet
  - published version metadata
- the publish surface also shows whether:
  - there is only a draft
  - the draft matches the live published form
  - a newer saved draft is ready to publish

### Expected behavior

At a product level, a staff user should be able to:

1. create or open a donation form record
2. edit the draft configuration safely
3. understand when they have unsaved changes
4. save the draft explicitly
5. preview the saved draft in a believable donor-facing way
6. publish the draft only when the form is publishable
7. understand whether the published form is in sync with the current saved draft
8. retrieve the live form link and embed snippet without confusion

The expected conceptual model should be:

- `Configure` = editing the draft
- `Preview` = previewing the saved draft
- `Publish` = controlling the live published version

The app should make that distinction obvious enough that a non-technical user does not accidentally assume:

- unsaved draft edits are already live
- preview is showing transient unsaved local edits
- publish is a one-time action with no later versioning consequence

### What to verify in the UI

During walkthrough, verify at least these points:

#### Configure

- saving the draft is explicit
- unsaved/saved state is clear
- field edits behave predictably
- validation does not feel arbitrary or hidden
- the form can represent:
  - internal/admin identity
  - donor-facing title and copy
  - amount options / mode
  - Gift Aid-related configuration where enabled
  - attribution defaults where present

#### Preview

- preview makes it clear it is showing the saved draft
- preview is credible enough to validate the donor-facing shape
- viewport switching is understandable
- one-off vs recurring preview state is understandable where applicable
- Gift Aid preview state is understandable where enabled

#### Publish

- publish state badges/summaries are understandable
- first publish works as a distinct action
- republish/update behavior is understandable after draft edits
- live URL and embed snippet are visible enough to use
- published version metadata is clear enough to support later debugging

### Likely rough-edge zones

These are the areas most likely to contain either bugs or UX ambiguity during walkthrough:

- saved-draft vs unsaved-local-edit distinction
- preview not matching what the user expected because they forgot to save
- publishability validation feeling too technical or not clearly tied to visible fields
- publish state messaging:
  - draft only
  - published and in sync
  - saved draft not published
- whether the live link, embed snippet, and published version feel understandable to a non-technical admin user
- whether recurring mode, Gift Aid mode, and amount-option behavior feel coherent across `Configure`, `Preview`, and `Publish`

### Working status

Current state before walkthrough:

- implementation exists
- expected behavior is now defined at a high level
- live UI validation still needed

The next step after reviewing this section should be:

- walk the `DonationForm` UI together
- record outcomes as:
  - working
  - rough edge
  - bug
  - unresolved product question

## 2. First-party donation form intake

### Intended scope

This workflow area is about what happens after a published donation form is used by a donor.

It covers:

- published form submission
- validation of donation-form input
- pre-payment staged gift creation
- payment-state gating
- payment confirmation enrichment
- how the resulting staged gift enters the wider review/processing model

It does not yet cover:

- broader external/import intake
- recurring downstream hardening beyond the current one-off-first path
- payout or fee enrichment beyond the current staged evidence contract

### Current build / implementation shape

Current implementation references:

- donation-form checkout-session creation:
  - [create-donation-form-checkout-session.ts](/home/jamesbryant/workspace/dev-stack/apps/fundraising/nonprofit-fundraising/src/donation-forms/create-donation-form-checkout-session.ts:1)
- donation-form runtime and published-config guidance:
  - [DONATION_FORMS_EMBEDDED_RUNTIME.md](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/DONATION_FORMS_EMBEDDED_RUNTIME.md:1)
- Stripe one-off staging update path:
  - [stripe-one-off-staging.ts](/home/jamesbryant/workspace/dev-stack/apps/fundraising/nonprofit-fundraising/src/stripe/stripe-one-off-staging.ts:760)
- processability gate:
  - [gift-staging-processability.ts](/home/jamesbryant/workspace/dev-stack/apps/fundraising/nonprofit-fundraising/src/gift-staging-review/gift-staging-processability.ts:1)
- readiness gate:
  - [gift-ready-status.ts](/home/jamesbryant/workspace/dev-stack/apps/fundraising/nonprofit-fundraising/src/gift-staging-review/gift-ready-status.ts:1)

Current product shape:

1. donor submits a published donation form
2. the app validates the request against the published form config
3. a pre-payment `giftStaging` row is created with:
   - donor evidence
   - amount
   - donation type
   - Gift Aid capture facts if present
   - source appeal/fund evidence if present
   - payment state = `AWAITING_PAYMENT`
4. a Stripe session is created and correlated back to that staged row
5. when Stripe confirms payment, the same `giftStaging` row is updated
6. only then can the row later become processable in the normal review flow

Important current product rule:

- `AWAITING_PAYMENT` rows are intentionally not processable
- rows with no payment-state concept, such as some CSV/manual imports, remain allowed through the existing staging model

### Expected behavior

At a product level, a first-party donation-form submission should feel like:

1. donor enters details into a published form
2. the app captures a durable staged record before money is fully confirmed
3. payment verification enriches that same row rather than creating an unrelated duplicate
4. staff later review one coherent staged gift, not disconnected fragments
5. processing remains blocked until payment is confirmed

The intended system meaning is:

- the donation form owns donor-facing capture
- `giftStaging` becomes the first durable CRM intake record
- Stripe provides payment evidence, not donation truth
- the normal staging review/processing workflow remains the commit boundary

### What to verify in the UI

During walkthrough, verify at least these points:

#### Published form behavior

- a published form can actually be opened from the live/public link
- donor-facing choices like one-off/monthly, amount selection, and Gift Aid feel coherent enough
- required-field behavior is understandable

#### Submission and pre-payment staging

- a submission creates a staged gift before final payment confirmation
- the staged gift carries the expected donor and source evidence
- payment state is visible enough for staff to understand why it is not yet processable

#### Payment confirmation and enrichment

- payment confirmation updates the same staged row rather than creating a second row
- provider payment identifiers and source evidence enrichment survive onto that row
- the row can later move through normal check/process workflow once payment is confirmed

#### Safety / gating

- `AWAITING_PAYMENT` rows remain in `Needs review`
- they do not accidentally appear as ready to process
- they cannot be processed early through batch or row-level actions

### Likely rough-edge zones

These are the areas most likely to contain bugs, confusing behavior, or weak UX during walkthrough:

- published-form config and actual donor runtime diverging
- pre-payment staging rows being hard to distinguish from “ordinary” staged gifts
- payment-state messaging being technically correct but not obvious enough in the review UI
- duplicate or repeated submission behavior
- source appeal/fund evidence arriving but not feeling clearly connected to later coding
- Gift Aid capture feeling coherent at submit time but less clear once it reaches staging review
- recurring mode appearing in the donor form before the downstream recurring path feels equally mature

### Working status

Current state before walkthrough:

- implementation exists
- the payment-state safety gate is implemented
- expected behavior is now defined at a high level
- live end-to-end donor/intake validation still needed

The next step after reviewing this section should be:

- walk a published donation form and the resulting staged-gift behavior
- record findings as:
  - working
  - rough edge
  - bug
  - unresolved product question

### Walkthrough findings

- `donor-form validation issue`
  - the live/published form does perform validation, but only when the donor clicks `Continue to secure payment`, and the feedback currently appears field-by-field rather than as a stronger in-form validation experience
  - likely impact:
    - malformed email or phone input is not challenged early enough
    - the form feels less polished and less guided than expected
    - donors may have to hunt through the form for errors instead of being helped proactively
- `likely bug`
  - enabling custom amount in form configuration does not appear to make the custom-amount input render in the donor-facing form
  - likely impact:
    - published runtime does not match configured form behavior
    - donor amount choice is more restricted than staff intended
    - weakens trust in the form builder because a visible saved setting is not reflected in the live form
- `payment-step product question`
  - the `Continue to secure payment` step and subsequent checkout experience may be technically credible and secure, but it does not yet clearly feel like one coherent donation action
  - likely impact:
    - the donor may feel they are moving into a payment flow rather than completing a donation flow
    - trust may be acceptable while emotional/interaction continuity is weaker than desired
    - this likely needs a more deliberate review of the transition between the form and Stripe-owned secure fields rather than a quick UI tweak
- `important product / operational gap`
  - the first-party intake flow needs a more robust model for failed, abandoned, or half-finished donation attempts so we do not accumulate stranded ambiguous `giftStaging` records
  - likely impact:
    - incomplete donor submissions may leave operational debris in staging
    - staff may later see rows that are real enough to confuse but not complete enough to process meaningfully
    - this needs deliberate lifecycle design rather than a narrow hotfix, while still staying lean for v1
- `likely bug`
  - checkout/payment confirmation currently appears to fail when Stripe requires a phone number but the flow has not supplied it correctly, returning:
    - `A phone number is required to confirm this Checkout Session. Provide a phone number using updatePhoneNumber() or pass phoneNumber to confirm().`
  - likely impact:
    - donor can reach a broken payment step even when the form itself looks otherwise valid
    - the first-party donation path may fail inconsistently depending on the phone-number requirements of the Stripe session/runtime
    - this needs investigation in the Stripe confirmation/runtime handoff rather than only in staging or review UI
  - likely root-cause direction:
    - current implementation appears to enable Stripe `phone_number_collection` when `collectPhone` is enabled on the form, while the embedded confirmation flow does not yet seem to complete the corresponding Stripe-side phone handling correctly
    - this may reflect implementation drift from the intended product model where phone capture should remain primarily in our own form rather than unexpectedly breaking payment confirmation
- `likely bug`
  - checkout/payment confirmation can also fail when Stripe requires a billing address but the embedded confirmation flow has not supplied it correctly, returning:
    - `A billing address is required to confirm this Checkout Session. Provide a billing address using updateBillingAddress() or use the Address Element.`
  - likely impact:
    - donors can reach a broken payment step when address collection is enabled or required
    - the first-party donation path may fail inconsistently depending on checkout/address configuration
  - likely root-cause direction:
    - current implementation appears to enable Stripe-side address requirements while the embedded confirmation flow does not yet complete the corresponding Stripe-side billing-address handoff robustly
    - this suggests a broader alignment issue between our form-field model and the Stripe confirmation/runtime model, not just a one-off address bug
- `likely bug`
  - the configured thank-you message does not appear to render after successful submission / confirmation
  - likely impact:
    - the donor journey ends without the expected acknowledgement or completion message
    - form configuration appears to have no visible effect at a key moment in the journey
    - weakens confidence that published donor-facing content is being respected consistently at runtime
  - update:
    - this turned out to be an embedded payment-flow issue rather than missing thank-you content
    - for the current iframe + Payment Element path, the stable embedded behavior is:
      - keep Stripe `return_url` configured
      - confirm with `redirect: 'if_required'`
      - show the thank-you panel in-place for normal card confirmations
    - this now appears to work in live testing, but should be rechecked in a later regression pass because the success-state behavior depends on the exact Stripe embedded confirmation flow
- `product / configuration question`
  - the donation flow currently appears to default to `GBP`, which may be acceptable for some charities but not enough as a general long-term currency model
  - likely impact:
    - users may not understand whether the form is intentionally single-currency or just defaulting silently
    - charities that do want other currencies may not feel supported clearly enough
    - charities that only want to accept one currency still need that restriction to feel deliberate and well-controlled rather than incidental
- `likely bug`
  - a successfully processed donation-form gift came through with `Payment type = Bank Transfer` on the committed `Gift`
  - likely impact:
    - committed gift records can misrepresent how the donation was actually paid
    - reporting and user trust in payment-method data are weakened
    - this appears broader than the donation-form UX itself and may reflect a more general payment-type mapping/default issue in gift creation or processing
- `cross-cutting refinement area`
  - record `Name` values created through our automated intake/processing flows currently feel solid enough to function, but not yet refined enough to feel intentional and product-grade
  - likely impact:
    - list views and record navigation may feel noisier or less informative than they should
    - similar records created through different flows may not feel consistently named
    - this is likely worth reviewing as a broader naming policy across staging and committed records rather than patching one workflow at a time

## 3. External and import intake

### Intended scope

This workflow area covers intake where the donation does not originate from our own first-party form builder.

It includes:

- CSV or report import into `giftStaging`
- external platform or provider intake that lands in `giftStaging`
- preservation of source-side evidence and context
- early grouping into `giftBatch` where relevant
- the transition from imported/raw source material into a reviewable staged gift

It does not yet cover:

- full payout or bank reconciliation
- provider-specific automation beyond the current staging/evidence contract
- downstream staging review/process behavior in detail, except where intake quality directly affects it

In practical v1 terms, the main intake entry points here are:

- CSV import
- third-party donation platform / integration intake
- manual gift entry

Important context:

- CSV import uses Twenty's native import tooling, so our review here is less about bespoke import UX and more about:
  - ease of batch creation
  - clarity of mapped fields once rows land in staging
  - whether staged rows preserve enough context to review and process safely
- integration intake depends heavily on the external platform and the quality/shape of source data provided
- this means the main product question is not whether every integration looks identical in the UI, but whether `giftStaging` gives us enough flexible fields and evidence surfaces to handle source variation without becoming Stripe-shaped
- manual gift entry sits adjacent to this area because it is another non-form intake path, but it is still more controlled than CSV or external platform intake and will likely deserve more detailed review in its own later section

### Current build / implementation shape

Current implementation references:

- batch review / grouping model:
  - [gift-batch-review.data.ts](/home/jamesbryant/workspace/dev-stack/apps/fundraising/nonprofit-fundraising/src/gift-batch-review/gift-batch-review.data.ts:1)
  - [gift-batch-review.model.ts](/home/jamesbryant/workspace/dev-stack/apps/fundraising/nonprofit-fundraising/src/gift-batch-review/gift-batch-review.model.ts:1)
- batch processing and readiness support:
  - [batch-processing.preflight.ts](/home/jamesbryant/workspace/dev-stack/apps/fundraising/nonprofit-fundraising/src/batch-processing/batch-processing.preflight.ts:1)
  - [batch-processing.executor.ts](/home/jamesbryant/workspace/dev-stack/apps/fundraising/nonprofit-fundraising/src/batch-processing/batch-processing.executor.ts:1)
- current source-coding evidence approach:
  - [gift-staging.object.ts](/home/jamesbryant/workspace/dev-stack/apps/fundraising/nonprofit-fundraising/src/objects/gift-staging.object.ts:1)
  - [gift-staging-coding.front-component.tsx](/home/jamesbryant/workspace/dev-stack/apps/fundraising/nonprofit-fundraising/src/front-components/gift-staging-coding.front-component.tsx:1)
- Stripe one-off external intake as a reference adapter:
  - [stripe-one-off-staging.ts](/home/jamesbryant/workspace/dev-stack/apps/fundraising/nonprofit-fundraising/src/stripe/stripe-one-off-staging.ts:1)
- intake and payment evidence intent:
  - [ONLINE_DONATION_INTAKE_FIELD_MODEL.md](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/ONLINE_DONATION_INTAKE_FIELD_MODEL.md:1)

Current product shape:

1. an external file, report, or provider event produces a staged row rather than a committed gift
2. the staged row should preserve:
   - donor-facing donation amount
   - source evidence needed for later interpretation
   - provider/payment references where available
   - source appeal/fund cues when present
3. imported rows may be grouped into a `giftBatch` for later batch-level work
4. the row then enters the same donor resolution, readiness, coding, and processing flow as other staged gifts

Important current product rule:

- external/import intake should preserve enough evidence to support human review
- but should not aggressively auto-map or over-trust low-confidence source data

### Expected behavior

At a product level, external/import intake should feel like:

1. source data lands in staging without being overcommitted into canonical CRM truth
2. staff can still understand where the row came from and what evidence supports it
3. key imported fields survive clearly enough for later donor matching, coding, and processing
4. batch/grouped workflows become available where they meaningfully help

The intended system meaning is:

- `giftStaging` is the controlled intake boundary for lower-trust source data
- external/import evidence should be preserved generously enough to review later
- canonical `Gift` creation still happens only after review and processing

### What to verify in the UI

During walkthrough, verify at least these points:

#### Intake visibility

- imported or externally created staged rows are easy to distinguish from other intake origins
- source/provider context is visible enough to explain where the row came from
- payment/provider references are visible where expected

#### Source evidence and coding cues

- `sourceAppealName` / `sourceFundName` appear where helpful during review
- source-side cues feel useful without being mistaken for canonical coding
- rows with unresolved source coding evidence remain clearly review-oriented rather than silently ready

#### Batch/grouped intake behavior

- imported rows are grouped into a usable `giftBatch` where appropriate
- batch summary feels credible enough to support later review work
- batch-level navigation helps rather than obscures individual row quality

#### Safety / data quality

- lower-trust import data is staged rather than committed directly
- key evidence survives onto the row instead of being lost in import
- rows that still need human interpretation are kept in a reviewable state

### Likely rough-edge zones

These are the areas most likely to contain bugs, confusing behavior, or weak UX during walkthrough:

- imported source data not feeling clearly connected to later staging review
- evidence preserved in the model but not surfaced clearly enough in the UI
- CSV/import rows carrying too little source context to support confident review later
- batch grouping being technically present but not operationally legible
- source appeal/fund cues helping in some workflows but disappearing in others
- payment/provider references being present in raw evidence but not visible enough for operators

### Working status

Current state before walkthrough:

- implementation exists in parts and has expanded significantly during recent product work
- the intended evidence-preserving staging model is clearer than before
- live end-to-end walkthrough of import/external intake is still needed

The next step after reviewing this section should be:

- walk an external/import intake example and the resulting staged/batch behavior
- record findings as:
  - working
  - rough edge
  - bug
  - unresolved product question

Testing note:

- this area is important but harder to validate purely from the UI because some of its quality depends on upstream source shape and import-tool constraints
- so the walkthrough should focus on:
  - whether imported/external rows are legible and workable once in staging
  - whether batches and source cues support human review well
  - whether the current field model feels flexible enough without being overfit to Stripe

### Walkthrough findings

- none captured yet

### Walkthrough findings

- `rough edge`
  - suggested amounts currently feel too low-level because they are entered as a free-text field rather than a structured amount list
  - likely impact:
    - easy to mistype
    - weakens trust in the form-builder experience
    - makes a core donor-facing setting feel more like raw config than product UI
- `product ambiguity`
  - `Monthly only` does not currently feel self-explanatory as a donor-form mode for a first-time admin user
  - likely impact:
    - user may not understand whether this is a realistic charity use case or just an internal implementation artifact
    - weakens confidence in the form-mode model
    - suggests the need either for clearer explanation of when to use each mode or for simplification of the available mode choices
- `product / data-model concern`
  - `Default appeal name` and `Default fund name` currently feel wrong as free-text inputs; a first-time admin user would reasonably expect relation-driven selection of canonical `Appeal` / `Fund` records
  - likely impact:
    - weakens trust that the form is connected to the CRM’s real coding model
    - risks introducing naming drift or text values that later still need manual mapping
    - makes a canonical defaulting concept look like source evidence capture instead of true default coding
- `ui integration issue`
  - `Internal name` currently feels redundant inside the custom Configure surface because the record name is already visible/editable through the surrounding Twenty record UI
  - likely impact:
    - duplicate editing surface for the same concept
    - avoidable confusion about which name is authoritative
    - makes the custom form workspace feel less native to Twenty
- `product / terminology ambiguity`
  - enabling Gift Aid currently exposes a `Gift Aid text version` field that is not self-explanatory to a first-time admin user
  - likely impact:
    - user does not know what value to enter
    - unclear whether it links to legal wording, a template, a compliance record, or an internal note
    - makes Gift Aid setup feel more technical and less guided than it should
- `preview ux concern`
  - the `Preview` surface currently feels busy, and the `Preview notes` section may not earn its space relative to the main job of judging the donor-facing form
  - likely impact:
    - visual noise competes with the actual preview
    - reduces confidence in what the user should focus on
    - risks turning preview into an explanatory dashboard rather than a clear donor-form check
- `preview interaction opportunity`
  - preview may need to behave more like a lightweight interactive donor form rather than a mostly static frame controlled by external toggles
  - likely impact:
    - switching donation type from inside the preview could feel more natural than a separate `Preview donation type` control
    - toggling Gift Aid from inside the preview could feel more natural than a separate `Gift Aid preview state` control
    - if preview becomes more self-demonstrating, some of the current preview chrome could potentially be removed to reduce clutter
- `likely bug / publish ux issue`
  - publish currently allows the user to click through to a server-side failure when provider configuration is missing, returning:
    - `Provider config key is required before publishing`
  - likely impact:
    - required publish preconditions are surfaced too late
    - the error feels technical rather than product-guided
    - first-time users are not clearly told what must be configured before publish is possible
  - additional concern:
    - this appears to be more than messaging; the required provider config key does not currently seem editable in the form workflow at all
    - if `paymentProvider` defaults to `STRIPE`, the corresponding provider-config requirement likely needs either:
      - a sensible default path
      - or an explicit editable field/config surface before publish
- `publish-surface ux concern`
  - the `Publish` tab currently feels dry and the primary `Publish form` action is easy to miss
  - likely impact:
    - the user may not immediately understand this as the key transition from draft to live
    - the page may undersell the importance of publish state, live link, and embed readiness
    - visual hierarchy may not be strong enough for a first-time admin workflow
