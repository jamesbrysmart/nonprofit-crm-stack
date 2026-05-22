# Embedded Donation Form Runtime Spike

Updated: 2026-05-20  
Status: In progress (`trial`)  
Audience: Product, engineering, and future implementation review

## Purpose

This spike exists to validate the smallest meaningful end-to-end seam for an embeddable donation form.

It is grounded in:

- [docs/apps-migration/DONATION_FORMS_EMBEDDED_RUNTIME.md](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/DONATION_FORMS_EMBEDDED_RUNTIME.md)
- current `GiftStaging`-based intake and processing
- the existing proven app-side Stripe webhook path

This is not a feature-complete implementation plan.

It is a focused experiment intended to answer whether the lean preferred architecture works cleanly enough in practice, especially around the public donor journey and the submit -> payment -> webhook -> `GiftStaging` handoff.

## Why this spike exists

The current preferred architecture is intentionally lean:

- `DonationForm` is the only new first-class CRM product object for v1
- `GiftStaging` remains the first durable CRM intake record
- no `DonationAttempt`, `ProviderSession`, or `IntakeEvent` CRM objects are introduced up front

That model is product-led and disciplined, but it leaves several runtime assumptions to prove:

- can a form be created and published cleanly
- can an iframe-based embed runtime load publish-safe config cleanly
- can a public submit route create Stripe payment sessions safely
- can `GiftStaging` itself bridge submit -> payment -> webhook cleanly without hidden temporary persistence
- can the existing webhook path create `GiftStaging` with form/version provenance

This spike is the smallest practical way to test those assumptions before broadening scope.

## Product baseline for the spike

The spike should preserve these product principles:

- the donor-facing experience should be capable of becoming polished
- Twenty should own the fundraising record
- Stripe provides payment evidence, not donation truth
- `GiftStaging` should remain the first durable CRM intake record for this intake path, with processing blocked until payment is verified
- `DonationForm` should remain the only new first-class CRM product object unless the spike proves that assumption unworkable

Broader intake framing:

- this spike is about the first owned online donation intake surface, not the only intake shape we expect long term
- the wider target pattern is source adapter -> `GiftStaging` -> review/processing -> canonical fundraising records
- `DonationForm` creates `GiftStaging` before payment confirmation because we control the donor form submission and need to preserve donor, Gift Aid, attribution, and published-form evidence before Stripe confirms payment
- future sources such as JustGiving, Raisely, Beacon, Donorbox, Givebutter, imports, or other fundraising tools may differ:
  - some may emit only completed donation records
  - some may expose donation-intent and donation-succeeded style lifecycle events
  - some may bundle payment evidence into the source event
  - some may require reconciliation between source donation data and payment or payout evidence
- the common design aim is still that source-specific evidence lands in `GiftStaging`, then downstream processing creates canonical fundraising meaning

## Spike scope

This spike is intentionally narrow.

Included:

- one `DonationForm` object with minimal publishable configuration
- publish state plus published version token
- one embeddable iframe-based runtime path
- one-off Stripe card payment only
- public submit route that validates against published form config
- pre-payment `GiftStaging` creation on validated submit
- reuse of existing app-side Stripe webhook verification and event routing
- `GiftStaging` update path with:
  - `donationFormId`
  - `donationFormPublishedVersion`

Not included:

- recurring / monthly donations
- hosted donation pages
- drag-and-drop builder
- arbitrary custom fields
- advanced theming
- anti-abuse hardening
- abandoned checkout CRM reporting
- donor portal
- analytics / funnel reporting
- multi-provider support
- new CRM objects for attempts, sessions, or event logs

## Main hypotheses to test

### 1. Twenty can own the publish/config boundary cleanly enough

We should be able to:

- create a `DonationForm`
- publish it
- expose a public-safe config plus published version token
- generate a simple embed snippet

without inventing more CRM product structure than is needed.

### 2. An iframe runtime is a viable first embed shape

We should be able to:

- load the form from a charity site
- fetch publish-safe config
- render a minimal donation flow

without immediate blocking issues around host-page styling, runtime bootstrapping, or workspace/form identification.

### 3. The submit -> payment -> webhook seam works by using `GiftStaging` as the pre-payment handoff record

We should be able to:

- validate donor intent server-side
- create `GiftStaging` in a non-processable pre-payment state
- create the Stripe payment session
- recover and update the same staging row at webhook time
- allow normal staging processing only after verified payment

without introducing `DonationAttempt`, hidden persistence, or similar extra objects up front.

### 4. The current Stripe webhook path can remain the verified intake edge for the first seam test

We should be able to reuse the existing app-side webhook path and prove that:

- raw-body verification remains intact
- event routing remains clean
- form/version provenance can be added to staging

without rewriting the payment ingress boundary first.

## Minimal spike slice

The intended vertical slice is:

1. create a minimal `DonationForm`
2. publish it
3. generate a basic embed snippet
4. load the embed snippet into a test page
5. fetch publish-safe config in an iframe runtime
6. submit a one-off donation payload
7. validate the payload against published form config
8. create pre-payment `GiftStaging`
9. create the Stripe payment session
10. complete a Stripe test card payment
11. receive verified webhook
12. recover and update the same staging row
13. add verified payment/provider evidence
14. verify `donationFormId` and `donationFormPublishedVersion`

## Pre-payment GiftStaging requirements

The most important runtime seam in this spike is the pre-payment `GiftStaging` row.

The current preferred direction is:

- create `GiftStaging` on validated submit
- keep it operationally quiet until payment is verified
- update it in place when Stripe confirms payment

This avoids introducing a hidden technical store that would largely duplicate staging under another name.

This should be read as the controlled-source version of a broader staging model, not as a rule that every future source must create staging at the same point in its lifecycle.

The spike should prove that the pre-payment staging row can safely hold:

- `donationFormId`
- published version token
- server-validated amount and currency
- donor evidence
- Gift Aid selection and wording context when enabled
- attribution/referrer/embed context
- source fingerprint / correlation identifier
- Checkout Session ID once available

The smallest safe lifecycle change is likely one explicit payment/intake state field on `GiftStaging`, rather than overloading `processingStatus` or `giftReadyStatus`.

## Acceptance criteria

The spike is successful if all of the following are true:

- a `DonationForm` can be created with minimal configuration
- the form can be published and given a stable published version token
- an embed snippet can be produced from that form
- an iframe runtime can load publish-safe config from that snippet
- a public submit route can validate payload against the published form
- the route can create a pre-payment `GiftStaging` row before redirect
- the route can create the Stripe payment session
- the existing verified webhook path can find and update that staging row
- the webhook path can transition it into a confirmed-payment state
- the resulting staging row includes:
  - `donationFormId`
  - `donationFormPublishedVersion`

Negative-path acceptance check:

- if Stripe confirms a successful payment but the expected pre-payment staging row is missing or unrecoverable, the webhook path must surface an explicit operational error rather than silently dropping the event

## Sequencing guardrail

The payment UI must not be mounted for the donor until the pre-payment staging row and correlation metadata are safely persisted or otherwise recoverable.

If this cannot be enforced cleanly, that is a spike finding, not an implementation detail to gloss over.

## Likely implementation surface

This is not a locked file plan, but the spike will likely touch:

- `apps/fundraising/nonprofit-fundraising/src/objects/`
  - new `DonationForm` object
  - `GiftStaging` updates
- `apps/fundraising/nonprofit-fundraising/src/logic-functions/`
  - publish-safe config route
  - Checkout Session creation route
- app public route or equivalent embed runtime surface
  - minimal iframe runtime
- `apps/fundraising/nonprofit-fundraising/src/stripe/`
  - staging mapper updates for form/version provenance
  - staging lookup / update helper if needed
- existing Stripe webhook logic
- tests around:
  - published config loading
  - pre-payment staging creation
  - successful one-off staging update after webhook
  - missing-staging negative path

## Key risks and unknowns

The spike should actively watch for:

- whether the Twenty app/runtime is comfortable enough for iframe/public-config loading
- whether public route behavior feels clean or awkward in practice
- whether pre-payment staging state can stay operationally quiet and coherent
- whether app-side Checkout creation becomes awkward under public traffic assumptions
- whether the webhook path can preserve operational visibility cleanly when pre-payment staging recovery fails

The goal is not to avoid those questions. The goal is to find them early and document them clearly.

## Decision this spike should inform

This spike is meant to inform one primary decision:

- can the initial embeddable donation form seam stay mostly Twenty-native, or do we hit enough friction that a companion public runtime should be introduced earlier

It should also inform a secondary decision:

- is the "use `GiftStaging` as the pre-payment handoff record" approach robust enough for v1 without hidden persistence or extra CRM lifecycle objects

## What to document as the spike progresses

As work proceeds, update this note with:

- what worked cleanly
- what felt awkward in the Twenty app/runtime
- what assumptions proved false
- where pre-payment staging state was harder than expected
- whether the embed/runtime boundary still looks viable
- whether the webhook/staging path stayed clean

Prefer recording concrete findings over broad impressions.

## Findings log

### 2026-05-20: initial publish/config seam

- Added a minimal `DonationForm` object with:
  - lifecycle status
  - public id
  - provider reference key
  - published version token
  - published config snapshot
- Added a publish route and public config route inside the fundraising app.
- Added a script-plus-iframe embed proof that can load publish-safe config from Twenty.
- Early finding:
  - the publish/config seam feels comfortable inside the current Twenty app/runtime
  - this still needed a real submit and payment seam before we could trust it as more than a static proof

### 2026-05-20: pre-payment GiftStaging seam

- Pivoted away from a hidden temporary submission snapshot store.
- Current preferred spike direction is to use `GiftStaging` itself as the pre-payment handoff record.
- Added explicit `paymentState` gating so donation-form rows can sit in `AWAITING_PAYMENT` without overloading:
  - `processingStatus`
  - `giftReadyStatus`
- Kept existing non-payment-gated staging channels working by treating `paymentState = null` as "not payment gated".
- Early finding:
  - using `GiftStaging` directly is cleaner than introducing hidden persistence that would largely duplicate staging under another name
  - this does require deliberate queue and processing guards so pending-payment rows stay operationally quiet

### 2026-05-20: submit -> Checkout -> webhook correlation

- Added a public submit route that:
  - loads published `DonationForm`
  - validates one-off donation input server-side
  - creates pre-payment `GiftStaging`
  - creates a real Stripe Checkout Session
- Added `stripe` as an app dependency because the fundraising app needs to create Checkout Sessions directly for this seam test.
- Current correlation model:
  - `sourceFingerprint` = submit-time correlation key
  - `providerEventId` = Stripe webhook replay identity
  - `externalId` = Stripe Checkout Session id
- Added webhook update flow so verified Stripe completion updates the same pre-payment staging row instead of creating a new one.
- Added explicit operational error handling for the negative path where Stripe confirms payment but the expected pre-payment staging row cannot be found.
- Important finding:
  - webhook updates must merge provider evidence onto the existing pre-payment staging evidence
  - overwriting `rawProviderEvidence` would lose referrer / attribution / submit-time context captured before redirect

### 2026-05-21: `public-assets` are the wrong browser runtime surface, route-served iframe HTML works

- The first browser-host embed test showed that Twenty `public-assets` are served with `Content-Disposition: attachment` for both `.html` and `.js` in this app.
- That caused the asset-based `donation-form-embed.js` / `donation-form-frame.html` approach to behave like downloadable files rather than a dependable embed runtime surface.
- We then replaced the asset-based embed contract with:
  - a public Twenty route that returns the iframe HTML directly
  - a plain iframe embed snippet pointing at that route
- Host-network verification confirmed that `/s/donation-forms/embed-frame?...` returns:
  - `HTTP 200`
  - `Content-Type: text/html; charset=utf-8`
- Manual browser testing confirmed that the iframe runtime now loads successfully inside the host-page fixture.

- Important finding:
  - the problem was the `public-assets` delivery surface, not the `DonationForm`, `GiftStaging`, Checkout, or webhook seam
  - a Twenty public route can serve browser-renderable iframe HTML cleanly enough for the initial embed seam
  - a plain iframe snippet is a viable v1-friendly embed shape while the spike remains mostly Twenty-native

### 2026-05-21: hosted Stripe Checkout requires top-level redirect from the iframe

- Stripe Checkout cannot run inside the embedded iframe context.
- For the spike, the iframe runtime now redirects the top-level window to the hosted Stripe Checkout URL rather than trying to navigate only the iframe.
- This is acceptable for the spike because it allows the end-to-end `DonationForm` -> submit -> Stripe -> webhook -> `GiftStaging` seam to be validated.

- Important product finding:
  - this is not acceptable as the intended client-facing embedded donation experience
  - the donor should not feel like they are leaving the charity website for payment
  - before productising the feature, we need to evaluate an embedded payment approach such as Stripe Embedded Checkout (`ui_mode: embedded`) or Stripe Payment Element / Elements
  - that payment-surface decision is a follow-up product/runtime decision, not part of this spike unless hosted Checkout prevents the seam test from completing

### 2026-05-21: end-to-end seam confirmed through verified webhook update

- Completed the full browser flow:
  - route-served iframe runtime loaded on the host-page fixture
  - validated submit created pre-payment `GiftStaging`
  - top-level redirect reached hosted Stripe Checkout
  - Stripe test payment completed
  - verified `checkout.session.completed` webhook returned `201`
  - webhook action was `UPDATE_DONATION_FORM_GIFT_STAGING`
- Verified the latest `GiftStaging` row in Twenty with:
  - `paymentState = PAYMENT_CONFIRMED`
  - `donationFormId` populated
  - `donationFormPublishedVersion` populated
  - `externalId` set to the Stripe Checkout Session ID
  - `providerEventId` set to the Stripe event ID
  - merged `rawProviderEvidence` preserving both submit-time context and Stripe completion evidence

- Important finding:
  - the initial mostly Twenty-native seam works end to end for the embedded donation form spike
  - older interrupted test rows remain in `AWAITING_PAYMENT`, which is acceptable for the current spike but reinforces the need for a quiet pending-payment posture and later expiry/cleanup policy

### 2026-05-21: direct-DOM host page plus Stripe Embedded Checkout also works

- Added a second charity-page fixture that mounts the donation runtime directly into the page DOM instead of using our own iframe wrapper.
- Kept the existing proven backend seam:
  - validated submit creates pre-payment `GiftStaging`
  - Stripe Checkout Sessions remain the payment backend
  - verified webhook updates the same staging row to `PAYMENT_CONFIRMED`
- Stripe Embedded Checkout completed successfully in this direct-DOM experiment, and the webhook again chose:
  - `UPDATE_DONATION_FORM_GIFT_STAGING`

- Important findings:
  - the `GiftStaging` create-then-update model is not tied to hosted Checkout or to the iframe wrapper
  - the current public route surface works cross-origin from a separate charity-page host
  - a higher-quality embedded payment experience is technically viable without introducing `DonationAttempt`, `ProviderSession`, or hidden temporary persistence
  - this moves the payment-surface question forward, but does not settle it
  - the next useful comparison is a narrow Payment Element / Elements experiment to judge:
    - donor feel relative to Embedded Checkout
    - implementation complexity
    - embedding ease and host-page compatibility

### 2026-05-21: direct-DOM host page plus Stripe Payment Element also works

- Added a second direct-DOM charity-page experiment using Stripe Checkout Sessions in `ui_mode: elements`.
- Kept the same proven backend model:
  - validated submit creates pre-payment `GiftStaging`
  - payment happens after that
  - verified webhook updates the same staging row to `PAYMENT_CONFIRMED`
- Payment completed successfully, and the webhook again chose:
  - `UPDATE_DONATION_FORM_GIFT_STAGING`

- Important findings:
  - Hosted Checkout remains useful as a proven seam-validation path, but feels too external for the intended embedded donation product
  - Embedded Checkout works, but still feels like a Stripe checkout block inside the wider donation journey
  - Payment Element currently feels closest to a cohesive charity donation form and should be treated as the working baseline for target donor experience, subject to embed feasibility
  - this shifts the next spike question away from payment orchestration and toward embed delivery quality:
    - what the charity pastes into the website
    - how the direct-DOM script is served
    - CSS/JS isolation and host-page compatibility
    - whether direct-DOM is reliable enough before any alternative embed path is justified

### 2026-05-21: Twenty Connections are promising for future Stripe account connection, but not part of the current payment UX spike

- Local `twenty-core` docs and code confirm that Twenty apps now support third-party OAuth connection providers via `defineConnectionProvider({ type: 'oauth', ... })`.
- That capability is distinct from:
  - OAuth/CLI login into Twenty itself
  - the automatic app-to-Twenty auth that logic functions already get via `TWENTY_APP_ACCESS_TOKEN`
- Twenty Connections look like the likely foundation for a future "Connect Stripe" flow because they provide:
  - per-workspace/user connected accounts
  - built-in OAuth callback handling
  - token refresh on read
  - app settings UI with "Add connection"
- However, they do not by themselves solve the full DonationForm provider-config story. Product-ready Stripe setup will still likely need app-side modeling or logic for:
  - selected Stripe account
  - test/live mode
  - publishable-key/runtime config exposure
  - webhook/account routing
  - health/reconnect state
  - admin UX around connection state

- Current spike stance:
  - do not build Stripe Connect or provider settings yet
  - the direct-DOM payment UX experiment used env/app-configured keys only:
    - `STRIPE_SECRET_KEY`
    - `STRIPE_PUBLISHABLE_KEY`
    - `STRIPE_WEBHOOK_SECRET`

### 2026-05-21: route-served iframe plus Payment Element works and is now the strongest within-Twenty baseline

- Updated the active iframe runtime to mount Stripe Payment Element inside the donation journey instead of redirecting to hosted Checkout.
- Kept the same proven backend model:
  - validated submit creates pre-payment `GiftStaging`
  - payment happens after that
  - verified webhook updates the same staging row to `PAYMENT_CONFIRMED`
- Live payment completed successfully, and the webhook again chose:
  - `UPDATE_DONATION_FORM_GIFT_STAGING`

- Important findings:
  - iframe remains credible for a lean v1 because the donor still experiences our donation form while Stripe stays mostly invisible as the payment rail
  - Payment Element is now the strongest tested donor/payment UX inside the current Twenty-hosted delivery surface
  - Twenty-served direct-DOM script delivery remains a documented finding, but it is no longer part of the active app surface for this spike
  - the publish UI and active runtime should now focus on iframe embed + Payment Element only
  - 3DS/authentication, wallets, mobile behaviour, and CMS compatibility remain important pre-productisation checks, but are not the immediate next task

### Expected first entries

Add entries here as the spike progresses, for example:

- whether `DonationForm` publish/config shape felt naturally modelled
- whether route-served iframe loading stays clean through full submit and Checkout
- whether session creation route ergonomics were acceptable
- whether pre-payment staging creation/update felt coherent
- whether missing-staging handling was operationally clear

## Unexpected challenges

Track implementation surprises here, especially if they affect future product shape:

- runtime limitations
- public asset vs public route delivery constraints
- staging lifecycle friction
- Stripe metadata limitations
- operational visibility gaps

## Follow-up questions after the spike

Likely follow-up questions once this seam is tested:

- whether recurring should remain the next spike
- whether Checkout Session ID should stay in evidence JSON or become explicit
- whether pending-payment staging rows need a more explicit operational surface
- whether the public runtime should remain inside Twenty for the near term or move sooner
