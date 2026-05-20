# Donation Forms Embedded Runtime

This note captures the current preferred lean architecture for embeddable donation forms based on what we know now.

It is a working product/architecture direction, not a locked implementation decision. Anything outside the normal Twenty UI, especially embed runtime behavior, iframe/script behavior, public config loading, Checkout Session creation, temporary submission snapshots, and webhook handoff, should be treated as implementation experimentation.

The aim is to discover the cleanest way to create a polished donor experience with the least necessary architecture. If Twenty's app/runtime supports that cleanly, we should use it. If we hit limits around public UX, embed behavior, reliability, anti-abuse, or runtime constraints, we should preserve the option to move parts of the public donor journey into a companion runtime later.

The stable product principles are more important than the exact runtime location:

- the public donor journey should be polished
- Twenty should own the fundraising record
- `GiftStaging` should remain the first durable CRM intake record after verified payment
- `DonationForm` should remain the only new first-class CRM product object for v1 unless later evidence strongly justifies more

## 1. Purpose and product framing

This feature is a lean, high-quality, embeddable donation form for charities using the CRM.

It is intended to:

- feel polished and modern, in the spirit of Twenty
- let charities collect donations on their own website
- write cleanly into the CRM using existing fundraising processing

It is not intended to become:

- a full donation platform
- a drag-and-drop page builder
- a generic "Stripe form"
- a broad fundraising product covering peer-to-peer, event ticketing, donor portals, or custom field sprawl

The core architecture principle is:

- the public runtime owns the donor journey
- Twenty owns the fundraising record
- Stripe is the first payment provider and provides payment evidence, not donation truth

In this note, "public runtime" is a logical boundary first, not necessarily a separate deployed service in v1.

The core CRM/data-model principle for v1 is:

- `DonationForm` is the only new first-class CRM product object
- `GiftStaging` remains the first durable CRM intake record after verified payment
- existing downstream objects continue to own final fundraising meaning:
  - `Gift`
  - `RecurringAgreement`
  - `GiftAidDeclaration` and gift-level Gift Aid outcome
  - existing attribution fields and objects

The following are explicitly not first-class CRM objects in v1:

- `DonationAttempt`
- `ProviderSession`
- `IntakeEvent`
- `DonationFormPublication`
- `PublishedForm`

Those concepts may still exist as technical/runtime state, but not as CRM product objects.

## 2. Agreed high-level lifecycle

The agreed lean runtime flow is:

1. Charity user creates a `DonationForm` in Twenty.
2. Charity user selects a connected Stripe/provider configuration for that form.
3. Charity user publishes the form.
4. Twenty validates publishability and exposes a publish-safe config plus a stable published version token.
5. Charity user copies an embed snippet.
6. The embed snippet loads a small script that mounts an iframe-based public runtime on the charity website.
7. The public runtime loads the published `DonationForm` config.
8. The donor fills the form.
9. On submit, a Twenty app route validates the payload against the published `DonationForm`.
10. The route stores a temporary submission snapshot with TTL.
11. The route creates a Stripe Checkout Session with minimal correlation metadata.
12. The donor completes payment in Stripe Checkout.
13. The existing app-side Stripe webhook route verifies the raw body and Stripe signature.
14. The webhook combines verified Stripe evidence with the temporary submission snapshot.
15. `GiftStaging` is created or upserted.
16. Existing processing creates or links `Gift`, `RecurringAgreement`, Gift Aid outcomes, and attribution outcomes.

This keeps the donor journey public-facing and payment-driven while keeping fundraising meaning inside Twenty.

## 3. DonationForm object

`DonationForm` should be the configured fundraising surface used by staff. Its first-class fields should stay narrow and only cover what staff need to understand, manage, or filter on.

Likely first-class field categories:

- lifecycle and status
- internal name / label
- provider configuration reference
- publishing state
- current published version token
- core fundraising defaults such as default appeal/fund/source references when needed

Configuration JSON on `DonationForm` can hold the narrower runtime-facing configuration, for example:

- amount options
- recurring frequency options
- theme and presentation settings
- donor field settings
- confirmation copy
- Gift Aid wording/config snapshot
- embed/runtime settings

The split should remain disciplined:

- use first-class fields for lifecycle, admin clarity, filtering, and stable references
- use config JSON for structured runtime configuration that staff do not need to query as independent CRM fields

## 4. GiftStaging additions

`GiftStaging` already supports most of the evidence needed for donation-form intake, including:

- intake source and source fingerprint
- provider identifiers and recurring provider evidence
- donor evidence
- Gift Aid evidence
- source-side appeal/fund text evidence
- raw provider evidence
- processing and review status

The current lean proposal is to add only the explicit fields that clearly earn their place for admin display, filtering, reporting, or processing traceability:

- `donationFormId`
- `donationFormPublishedVersion`

`donationFormPublishedVersion` is the current preferred field name because it most clearly describes the donor-facing published configuration in effect at payment time.

Everything else should default to existing fields, `rawProviderEvidence`, `providerContext` / raw payload, or structured evidence JSON unless it later proves necessary for:

- filtering or review queues
- matching or processing logic
- dedupe or idempotency
- finance or reporting
- user/admin display

## 5. Temporary submission snapshot

The temporary submission snapshot is infrastructure, not a CRM product object.

Its purpose is to:

- bridge form submit -> Stripe Checkout -> webhook
- preserve trusted donor-submitted evidence before redirect
- avoid creating CRM records for abandoned checkouts
- avoid stuffing full intake evidence into Stripe metadata
- avoid relying on browser state after redirect

The temporary snapshot should include:

- `donationFormId`
- published config version
- server-validated amount, currency, and frequency
- donor evidence
- Gift Aid selection, wording version, and declaration context
- attribution, referrer, UTM, and embed context
- `sourceFingerprint` or equivalent correlation key
- Checkout Session ID
- workspace/provider reference if needed

Reliability notes:

- this should be persistent enough for realistic webhook timing and should not depend on fragile in-memory-only state
- TTL should align with Stripe Checkout expiry plus a sensible operational buffer
- Stripe metadata should still carry enough minimal correlation data to avoid silent loss
- if the snapshot is missing when the webhook arrives, that should produce an explicit operational error or review path, not silent failure
- if Stripe confirms a successful payment but the snapshot is missing, the Stripe event and payment evidence must still be preserved and surfaced for operational review rather than silently dropped
- the exact implementation of the temporary store, TTL, and persistence mechanism remains open and should be tested

## 6. Stripe/session creation

The v1 tactical approach is:

- the public embed submits to a Twenty app route to create the Checkout Session
- the route loads the published `DonationForm`
- the route validates trusted values server-side
- the route stores the temporary submission snapshot
- the route creates the Stripe Checkout Session using workspace/provider configuration
- the route writes only minimal correlation metadata into Stripe

Sequencing guardrail:

- the Checkout redirect or URL should not be returned to the donor until the temporary snapshot and correlation metadata are safely persisted or otherwise recoverable

This route should remain a clean boundary:

- it can later move behind a separate public runtime without changing CRM meaning
- it should not let Stripe-specific transport concepts leak into fundraising domain meaning

The client may submit donor intent, but the server should derive trusted payment values from published form configuration and validated input.

## 7. Webhook/intake

For v1, reuse the existing proven app-side Stripe webhook route.

The webhook flow is:

1. verify raw body and Stripe signature
2. route relevant Stripe events through the event router
3. map Stripe payment facts into canonical staging input
4. merge those facts with the temporary submission snapshot
5. create or upsert `GiftStaging`
6. run existing staging processing

Dedupe and idempotency should rely on the current evidence-first approach, including:

- `providerEventId`
- `sourceFingerprint`
- provider payment/session/agreement identifiers as appropriate

Repeated webhooks must no-op or update existing staging records, not create duplicate donation meaning.

## 8. Failure cases

- **Unpublished or archived form already embedded**
  - new loads should fail cleanly and show an unavailable state

- **Stripe disconnected**
  - publish or session creation should fail explicitly rather than producing broken donor flows

- **Donor abandons Checkout**
  - no CRM record is created in v1
  - abandoned state remains runtime/provider-side only

- **Payment fails**
  - no `GiftStaging` row is required in v1 unless later operational needs justify it

- **Webhook arrives twice**
  - dedupe and idempotency must ensure replay is a no-op or update

- **Webhook succeeds but staging/processing fails**
  - the staging row should remain visible with an operational error or review state

- **Temporary submission snapshot missing or expired**
  - this should be surfaced as an explicit operational error or review case
  - it should never silently lose a successful payment

- **Form config changes between load, submit, and payment completion**
  - checkout creation and webhook intake must bind to the published version captured at submit time, not whatever happens to be current later

## 9. Explicitly deferred

Not part of v1:

- `DonationAttempt` as a CRM object
- `ProviderSession` as a CRM object
- `IntakeEvent` as a CRM object
- hosted donation pages unless later prioritized
- drag-and-drop builder
- arbitrary custom fields
- peer-to-peer fundraising
- event ticketing
- donor portal
- abandoned checkout CRM reporting
- multi-provider orchestration UI
- advanced analytics

These may become relevant later, but they are intentionally out of scope for the lean embeddable form.

## 10. Open questions

Remaining genuine questions:

- exact `DonationForm` field vs config JSON split
- temporary submission store implementation choice and TTL
- whether Checkout Session ID can remain in evidence JSON / raw payload or later proves necessary as an explicit `GiftStaging` field for dedupe, support search, or review filtering
- what minimum operational visibility is needed for missing-snapshot or processing-failure cases without introducing `DonationAttempt`
