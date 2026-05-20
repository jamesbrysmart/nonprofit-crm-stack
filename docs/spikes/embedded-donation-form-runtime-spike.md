# Embedded Donation Form Runtime Spike

Updated: 2026-05-20  
Status: Planned spike (`trial`)  
Audience: Product, engineering, and future implementation review

## Purpose

This spike exists to validate the smallest meaningful end-to-end seam for an embeddable donation form.

It is grounded in:

- [docs/apps-migration/DONATION_FORMS_EMBEDDED_RUNTIME.md](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/DONATION_FORMS_EMBEDDED_RUNTIME.md)
- current `GiftStaging`-based intake and processing
- the existing proven app-side Stripe webhook path

This is not a feature-complete implementation plan.

It is a focused experiment intended to answer whether the lean preferred architecture works cleanly enough in practice, especially around the public donor journey and the submit -> Checkout -> webhook -> `GiftStaging` handoff.

## Why this spike exists

The current preferred architecture is intentionally lean:

- `DonationForm` is the only new first-class CRM product object for v1
- `GiftStaging` remains the first durable CRM intake record after verified payment
- no `DonationAttempt`, `ProviderSession`, or `IntakeEvent` CRM objects are introduced up front

That model is product-led and disciplined, but it leaves several runtime assumptions to prove:

- can a form be created and published cleanly
- can an iframe-based embed runtime load publish-safe config cleanly
- can a public submit route create Stripe Checkout Sessions safely
- can temporary submission state bridge redirect/webhook reliably without becoming a CRM object
- can the existing webhook path create `GiftStaging` with form/version provenance

This spike is the smallest practical way to test those assumptions before broadening scope.

## Product baseline for the spike

The spike should preserve these product principles:

- the donor-facing experience should be capable of becoming polished
- Twenty should own the fundraising record
- Stripe provides payment evidence, not donation truth
- `GiftStaging` should remain the first durable CRM intake record after verified payment
- `DonationForm` should remain the only new first-class CRM product object unless the spike proves that assumption unworkable

## Spike scope

This spike is intentionally narrow.

Included:

- one `DonationForm` object with minimal publishable configuration
- publish state plus published version token
- one embeddable iframe-based runtime path
- one-off Stripe card payment only
- public submit route that validates against published form config
- temporary submission snapshot durable enough for realistic webhook recovery
- reuse of existing app-side Stripe webhook verification and event routing
- `GiftStaging` creation or upsert with:
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

### 3. The submit -> Checkout -> webhook seam works without a pre-payment CRM record

We should be able to:

- validate donor intent server-side
- persist a temporary submission snapshot outside the CRM product model
- create Stripe Checkout
- recover the snapshot at webhook time
- create `GiftStaging`

without introducing `DonationAttempt` or similar objects up front.

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
8. persist temporary submission snapshot
9. create Stripe Checkout Session
10. complete a Stripe test card payment
11. receive verified webhook
12. recover snapshot
13. create or upsert `GiftStaging`
14. verify `donationFormId` and `donationFormPublishedVersion`

## Temporary submission snapshot requirements

The temporary snapshot is the most important runtime seam in this spike.

It is infrastructure, not a CRM product object.

The spike should test a temporary store that is:

- durable enough to survive redirect + webhook timing
- not process-memory-only
- keyed by correlation ID and/or Checkout Session ID
- TTL-based
- recoverable by the webhook path

The temporary snapshot should preserve at least:

- `donationFormId`
- published version token
- server-validated amount and currency
- donor evidence
- Gift Aid selection and wording context when enabled
- attribution/referrer/embed context
- source fingerprint / correlation identifier
- Checkout Session ID once available

The implementation can be tactical, but it should be realistic enough that success in the spike is meaningful.

## Acceptance criteria

The spike is successful if all of the following are true:

- a `DonationForm` can be created with minimal configuration
- the form can be published and given a stable published version token
- an embed snippet can be produced from that form
- an iframe runtime can load publish-safe config from that snippet
- a public submit route can validate payload against the published form
- the route can persist the temporary submission snapshot before redirect
- the route can create a Stripe Checkout Session
- the existing verified webhook path can recover the snapshot
- the webhook path can create or upsert `GiftStaging`
- the resulting staging row includes:
  - `donationFormId`
  - `donationFormPublishedVersion`

Negative-path acceptance check:

- if Stripe confirms a successful payment but the temporary snapshot is missing or unrecoverable, the webhook path must surface an explicit operational error rather than silently dropping the event

## Sequencing guardrail

The Checkout redirect or URL must not be returned to the donor until the temporary snapshot and correlation metadata are safely persisted or otherwise recoverable.

If this cannot be enforced cleanly, that is a spike finding, not an implementation detail to gloss over.

## Likely implementation surface

This is not a locked file plan, but the spike will likely touch:

- `apps/fundraising/nonprofit-fundraising/src/objects/`
  - new `DonationForm` object
  - `GiftStaging` updates
- `apps/fundraising/nonprofit-fundraising/src/logic-functions/`
  - publish-safe config route
  - Checkout Session creation route
- app public assets or equivalent embed runtime surface
  - minimal script + iframe runtime
- `apps/fundraising/nonprofit-fundraising/src/stripe/`
  - staging mapper updates for form/version provenance
  - snapshot lookup / merge helper if needed
- existing Stripe webhook logic
- tests around:
  - published config loading
  - snapshot persistence/recovery
  - successful one-off staging creation
  - missing-snapshot negative path

## Key risks and unknowns

The spike should actively watch for:

- whether the Twenty app/runtime is comfortable enough for iframe/public-config loading
- whether public route behavior feels clean or awkward in practice
- whether the temporary snapshot seam is easy to make reliable
- whether app-side Checkout creation becomes awkward under public traffic assumptions
- whether the webhook path can preserve operational visibility cleanly when recovery fails

The goal is not to avoid those questions. The goal is to find them early and document them clearly.

## Decision this spike should inform

This spike is meant to inform one primary decision:

- can the initial embeddable donation form seam stay mostly Twenty-native, or do we hit enough friction that a companion public runtime should be introduced earlier

It should also inform a secondary decision:

- is the "no pre-payment CRM object" approach robust enough for v1 when backed by a durable temporary submission snapshot

## What to document as the spike progresses

As work proceeds, update this note with:

- what worked cleanly
- what felt awkward in the Twenty app/runtime
- what assumptions proved false
- where the temporary snapshot seam was harder than expected
- whether the embed/runtime boundary still looks viable
- whether the webhook/staging path stayed clean

Prefer recording concrete findings over broad impressions.

## Findings log

### Expected first entries

Add entries here as the spike progresses, for example:

- whether `DonationForm` publish/config shape felt naturally modelled
- whether iframe/public asset loading worked cleanly
- whether session creation route ergonomics were acceptable
- whether snapshot persistence felt reliable enough
- whether missing-snapshot handling was operationally clear

## Unexpected challenges

Track implementation surprises here, especially if they affect future product shape:

- runtime limitations
- public route constraints
- persistence gaps
- Stripe metadata limitations
- operational visibility gaps

## Follow-up questions after the spike

Likely follow-up questions once this seam is tested:

- whether recurring should remain the next spike
- whether Checkout Session ID should stay in evidence JSON or become explicit
- whether missing-snapshot review needs a more explicit operational surface
- whether the public runtime should remain inside Twenty for the near term or move sooner
