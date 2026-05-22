# Donation Forms Embedded Runtime

This note captures the current preferred lean architecture for embeddable donation forms based on what we know now.

It is a working product/architecture direction, not a locked implementation decision. Anything outside the normal Twenty UI, especially embed runtime behavior, iframe/script behavior, public config loading, Checkout Session creation, pre-payment staging behavior, and webhook handoff, should be treated as implementation experimentation.

The aim is to discover the cleanest way to create a polished donor experience with the least necessary architecture. If Twenty's app/runtime supports that cleanly, we should use it. If we hit limits around public UX, embed behavior, reliability, anti-abuse, or runtime constraints, we should preserve the option to move parts of the public donor journey into a companion runtime later.

The stable product principles are more important than the exact runtime location:

- the public donor journey should be polished
- Twenty should own the fundraising record
- `GiftStaging` should remain the first durable CRM intake record for donation intake, with processing blocked until payment is verified where the source/payment flow requires it
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
- `GiftStaging` remains the first durable CRM intake record
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

Broader intake framing:

- `DonationForm` is the first owned donation-intake surface we control end to end, not the only intake shape we expect long term
- the wider target pattern is source adapter -> `GiftStaging` -> review/processing -> canonical fundraising records
- source adapters may differ in when staging becomes durable:
  - our own `DonationForm` creates `GiftStaging` before payment confirmation because we need to preserve donor, Gift Aid, attribution, and published-form evidence before Stripe confirms payment
  - some third-party sources may only emit completed donation records, so staging will be created after a platform-completed event
  - some sources may expose a richer lifecycle where staging can begin before final payment confirmation
  - some sources may require reconciliation between platform donation data and later provider/payout evidence before staging can be treated as complete
- payment-provider data, including Stripe data, should remain evidence about the donation, not canonical donation truth
- this means future sources such as JustGiving, Raisely, Beacon, Donorbox, Givebutter, imports, or other fundraising tools may reuse the same staging/processing model while differing in exact intake timing and reconciliation needs

## 2. Agreed high-level lifecycle

The agreed lean runtime flow is:

1. Charity user creates a `DonationForm` in Twenty.
2. Charity user selects a connected Stripe/provider configuration for that form.
3. Charity user publishes the form.
4. Twenty validates publishability and exposes a publish-safe config plus a stable published version token.
5. Charity user copies an embed snippet.
6. The embed snippet is a plain iframe pointing at a public Twenty route for the donation runtime.
7. The iframe runtime loads the published `DonationForm` config.
8. The donor fills the form.
9. On submit, a Twenty app route validates the payload against the published `DonationForm`.
10. The route creates `GiftStaging` in a non-processable pre-payment state.
11. The route creates the Stripe payment session with minimal correlation metadata.
12. The donor completes card payment through Stripe Payment Element inside the iframe donation form.
13. The existing app-side Stripe webhook route verifies the raw body and Stripe signature.
14. The webhook finds and updates the existing `GiftStaging` row using provider correlation.
15. `GiftStaging` moves to confirmed-payment state and remains the record that later processing works from.
16. Existing processing creates or links `Gift`, `RecurringAgreement`, Gift Aid outcomes, and attribution outcomes.

This keeps the donor journey public-facing and payment-driven while keeping fundraising meaning inside Twenty.

Current spike preference:

- static `public-assets` are not the right browser runtime surface for HTML/JS delivery in this use case
- route-served iframe HTML is the preferred embed surface for the current mostly Twenty-native baseline
- iframe + Payment Element is currently the strongest within-Twenty baseline for the one-off donation form
- direct-DOM charity-page mounting remains a documented explored path, not the active implementation direction

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
- one explicit payment/intake lifecycle field so pre-payment state does not overload `processingStatus` or `giftReadyStatus`

`donationFormPublishedVersion` is the current preferred field name because it most clearly describes the donor-facing published configuration in effect at payment time.

Everything else should default to existing fields, `rawProviderEvidence`, `providerContext` / raw payload, or structured evidence JSON unless it later proves necessary for:

- filtering or review queues
- matching or processing logic
- dedupe or idempotency
- finance or reporting
- user/admin display

## 5. Pre-payment GiftStaging

The current preferred lean direction is to use `GiftStaging` itself as the pre-payment handoff record.

That means:

- create `GiftStaging` on validated submit
- keep it non-processable until payment is verified
- store donor, form, Gift Aid, attribution, and correlation evidence there
- create Stripe Checkout
- update the same row when the verified webhook arrives

This is preferred over a hidden temporary store because it keeps the model leaner and uses the existing uncommitted donation-intake object instead of creating staging under another name.

This should be treated as the owned-source variant of a broader intake model, not a DonationForm-only rule. Other donation sources may create `GiftStaging`:

- before payment confirmation, if they expose donor intent and we need to preserve evidence before the provider confirms payment
- only after a completed donation event, if that is the first durable source signal available
- or during reconciliation, if the source/platform and payment/payout evidence arrive separately

Guardrails:

- do not overload `processingStatus` or `giftReadyStatus` to mean awaiting payment
- pending-payment rows must be excluded from normal gift review, donor matching, processing queues, counts, and batch operations by default
- processing must never create a `Gift` unless payment has been verified
- if Stripe confirms payment but the expected pre-payment staging row cannot be found, the Stripe event/payment evidence must still be preserved and surfaced for operational review rather than silently dropped

## 6. Stripe/session creation

The v1 tactical approach is:

- the public embed submits to a Twenty app route to create the Checkout Session
- the route loads the published `DonationForm`
- the route validates trusted values server-side
- the route creates pre-payment `GiftStaging`
- the route creates the Stripe payment session using workspace/provider configuration
- the route writes only minimal correlation metadata into Stripe
- for the current spike baseline, the route-served iframe mounts Stripe Payment Element inside the donation journey so the donor stays within the charity-owned form

Current spike caveat:

- iframe + Payment Element is now the strongest within-Twenty baseline for the one-off donation form spike
- hosted Stripe Checkout remains a documented seam-validation path only, not the active product baseline
- before productising the feature, pre-productisation checks still remain around 3DS/authentication, wallets, mobile behaviour, and real CMS compatibility

Current spike findings:

- hosted Stripe Checkout proved the backend seam, but not the target embedded UX
- Stripe Embedded Checkout worked in a direct-DOM charity-page experiment while preserving the same `GiftStaging` `AWAITING_PAYMENT -> PAYMENT_CONFIRMED` lifecycle
- Payment Element / Elements also worked in a direct-DOM charity-page experiment while preserving the same `GiftStaging` `AWAITING_PAYMENT -> PAYMENT_CONFIRMED` lifecycle
- route-served iframe + Payment Element also worked while preserving the same `GiftStaging` `AWAITING_PAYMENT -> PAYMENT_CONFIRMED` lifecycle
- hosted Stripe Checkout should be treated as a proven spike path and possible contingency only if Payment Element later proves unsuitable, not as an active product fallback by default
- Embedded Checkout remains technically promising, but still feels more like a Stripe-managed checkout block inside the donation journey
- Payment Element currently looks closest to a cohesive charity donation form and should be treated as the working baseline for the target donor experience, subject to embed feasibility
- Twenty-served direct-DOM script delivery is not a clean active path in the current app framework, so the direct-DOM learnings should remain documentary rather than product-facing for now

Current productisation finding:

- for the current payment UX spike, continue using app/env-configured Stripe keys:
  - `STRIPE_SECRET_KEY`
  - `STRIPE_PUBLISHABLE_KEY`
  - `STRIPE_WEBHOOK_SECRET`
- do not build Stripe Connect or provider settings UI yet
- Twenty app Connections look like the likely foundation for a future "Connect Stripe" flow
- they may solve the per-workspace OAuth / connected-account layer
- they probably do not, by themselves, solve the full DonationForm provider-config model:
  - selected Stripe account
  - test/live mode handling
  - public runtime publishable config
  - webhook/account routing
  - connection health state
  - admin UX around connect/reconnect/disconnect

Sequencing guardrail:

- the payment UI must not be mounted for the donor until the pre-payment staging row and correlation metadata are safely persisted or otherwise recoverable

This route should remain a clean boundary:

- it can later move behind a separate public runtime without changing CRM meaning
- it should not let Stripe-specific transport concepts leak into fundraising domain meaning

The client may submit donor intent, but the server should derive trusted payment values from published form configuration and validated input.

## 7. Webhook/intake

For v1, reuse the existing proven app-side Stripe webhook route.

The webhook flow is:

1. verify raw body and Stripe signature
2. route relevant Stripe events through the event router
3. find the pre-payment staging row using correlation data
4. add Stripe payment/provider evidence
5. transition payment/intake state so normal readiness/processing can continue
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
  - a pre-payment staging row may exist
  - it should remain excluded from normal queues and can be expired/cleaned up later

- **Payment fails**
  - the pre-payment staging row should remain operationally quiet and non-processable

- **Webhook arrives twice**
  - dedupe and idempotency must ensure replay is a no-op or update

- **Webhook succeeds but staging/processing fails**
  - the staging row should remain visible with an operational error or review state

- **Expected pre-payment staging row missing or unrecoverable**
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
- exact name and options for the pre-payment `GiftStaging` lifecycle field
- whether Checkout Session ID can remain in evidence JSON / raw payload or later proves necessary as an explicit `GiftStaging` field for dedupe, support search, or review filtering
- what minimum operational visibility is needed for missing pre-payment staging rows or processing failures without introducing `DonationAttempt`
- how strictly `rawProviderEvidence` / evidence JSON should mirror explicit `GiftStaging` lifecycle fields after payment confirmation versus remaining a more historical merged evidence snapshot
