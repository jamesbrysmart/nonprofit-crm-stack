# Stripe Worklog For The Fundraising App

Updated: 2026-04-23
Status: Working notes
Purpose: Capture implementation notes, decisions, discoveries, validation evidence, and open questions as we build Stripe capability into the fundraising Twenty app.

Use this alongside:

- [STRIPE_IMPLEMENTATION_STAGES.md](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/STRIPE_IMPLEMENTATION_STAGES.md)
- [PILOT_APP_IMPLEMENTATION_PLAN.md](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/PILOT_APP_IMPLEMENTATION_PLAN.md)
- [PRODUCT_REVIEW.md](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/PRODUCT_REVIEW.md)

This note is for active working context.

It should capture:

- what we tried,
- what we learned,
- what we decided,
- what remains unclear,
- and what evidence we gathered about Twenty apps as the execution home.

It should not become a second high-level strategy doc.

## 1. Current Working Direction

Current agreed posture:

- keep Stripe inside Twenty apps for as long as the released app framework can support it cleanly,
- start with one-off Stripe intake to `giftStaging`,
- treat recurring as deliberate later-stage expansion rather than first-slice scope,
- and keep later opportunities such as payout / `giftPayout` integration visible rather than accidentally declaring success too early.

## 2. Active Stage

Current active stage:

- Stage 1: one-off Stripe intake to `giftStaging`

Current intent:

- prove that a real Stripe donation can enter the app through a Twenty-app-owned flow,
- persist the right staged gift facts,
- and validate the execution shape with a Stripe test account and Stripe CLI.

## 3. Stage 1 Working Checklist

Use this as the active scratchpad for the first build slice.

### 3.1 Scope lock

- [x] Confirm the first Stripe event in scope.
- [x] Confirm the minimum staged fields we must persist on `giftStaging`.
- [x] Confirm what counts as Stage 1 success.
- [x] Confirm which concerns are explicitly deferred to later stages.

### 3.2 Environment / validation

- [x] Create or confirm a dedicated Stripe test account/workspace for this work.
- [x] Confirm local validation path with Stripe CLI.
- [x] Confirm which Twenty app-dev environment/workspace is the target for Stage 1 validation.
- [x] Record any app-dev/runtime constraints that affect webhook or route testing.

### 3.3 App implementation notes

- [x] Identify the Twenty app entry point for Stripe intake.
- [x] Record any raw-body/signature-validation constraints discovered in the released toolchain.
- [x] Record proposed object writes and relation updates for the first slice.
- [x] Record idempotency approach chosen for Stage 1.

### 3.4 Evidence

- [ ] Capture first successful verified live Stripe webhook-to-staging test run.
- [x] Capture first internal app route staging test result.
- [x] Capture first replay/idempotency test result.
- [x] Capture any failure mode that suggests a real Twenty-app limitation.

## 4. Working Notes

Add dated notes under short headings.

Suggested format:

```md
### 2026-04-23

What we did:
- ...

What we learned:
- ...

Open questions:
- ...
```

### 2026-04-23

What we did:

- agreed the staged Stripe implementation approach and documented it in `STRIPE_IMPLEMENTATION_STAGES.md`
- confirmed that we want a durable place to capture build-time findings rather than leaving them in chat history
- locked the first Stage 1 event to `checkout.session.completed`
- confirmed there is no Stripe-related MCP configured in this environment
- confirmed the Stripe CLI is installed and usable, although it requires escalation when run through Codex because the CLI writes to its config path outside the sandbox

What we learned:

- the team wants to avoid treating the first working Stripe slice as the finished architecture
- Stripe payout / `giftPayout` opportunities should remain visible as later-stage expansion, not disappear behind the first donation-intake success
- the current app `giftStaging` object has the review/workflow fields we need, but does not yet have Stripe-origin intake evidence fields such as `externalId`, `sourceFingerprint`, `provider`, or `providerPaymentId`
- Stage 1 needs deliberate metadata additions rather than just wiring a route into the current object shape

Open questions:

- what is the cleanest validation path for Stripe CLI against the active Twenty app-dev environment

### 2026-04-23 Stage 1 scope lock

Working decisions for the first implementation slice:

- First Stripe event in scope: `checkout.session.completed`
- Stage 1 target outcome: create a Stripe-origin `giftStaging` record inside the Twenty app and nothing more
- Stage 1 should not commit directly to `gift`
- Stage 1 should not attempt recurring fulfillment, recurring agreement updates, payout work, refunds, or failure handling

Minimum Stage 1 staged evidence to persist:

- `intakeSource`
- `name`
- `amount`
- `giftDate`
- `donorFirstName`
- `donorLastName`
- `donorEmail` when available
- `externalId`
- `sourceFingerprint`
- `provider`
- `providerPaymentId` when available

Current working read for first-slice identifiers:

- `externalId` should represent the Stripe checkout session identity
- `sourceFingerprint` should support replay-safe Stage 1 idempotency for the webhook event
- `providerPaymentId` should represent the Stripe payment reference when available

Fields currently treated as deferred unless Stage 1 proves they are needed immediately:

- richer `providerContext`
- raw provider payload storage
- first-class intake-event object
- reconciliation/payout linkage

### 2026-04-23 first implementation slice

What we did:

- added the first Stripe-origin evidence fields to the app-owned `giftStaging` object:
  - `externalId`
  - `sourceFingerprint`
  - `provider`
  - `providerPaymentId`
- surfaced `provider`, `externalId`, and `providerPaymentId` in the gift staging index view so the first Stripe intake path has visible operator-facing evidence
- verified the app still passes `yarn lint` after the metadata/view changes

What we learned:

- the current app can absorb the first Stripe evidence fields cleanly without introducing new object relationships
- the most immediate Stage 1 app work is now shifting from metadata shape to intake route design and validation of Stripe signature/raw-body handling in the released app toolchain

Open questions:

- what is the cleanest Twenty-app-native entry point for Stripe webhook intake in this app
- whether the released app route/runtime preserves the raw body shape needed for Stripe signature verification
- whether Stage 1 should write only the minimum durable evidence fields or also retain a lightweight debug/audit payload on day one

### 2026-04-23 route probe implementation

What we did:

- added a temporary unauthenticated route probe at `/stripe/route-probe`
- configured the route to forward the `stripe-signature` header into the app handler
- made the route return only the request-shape facts we need for Stage 1:
  - header keys
  - whether the Stripe signature header arrived
  - a short signature preview
  - body type
  - body preview
  - `isBase64Encoded`
  - request method and path
- verified the app still passes `yarn lint`

What we learned:

- we now have a concrete Twenty-app-native probe path for testing Stripe CLI forwarding before building the real intake handler
- the next live validation step is no longer abstract research; it is exercising this route with Stripe CLI and inspecting the returned request shape

Open questions:

- what exact public/local URL shape will the app-dev environment expose for this route once synced
- whether Stripe webhook requests arrive with body fidelity that is good enough for signature verification without extra runtime work

### 2026-04-24 live Stripe probe results

What we did:

- synced the app into the local Twenty app-dev environment
- ran Stripe CLI forwarding to `http://localhost:2020/s/stripe/route-probe`
- triggered Stripe test events through the CLI
- called the probe route directly with a test `stripe-signature` header to inspect the returned payload shape

What we observed:

- Stripe CLI successfully forwarded webhook events to the Twenty app route
- the route returned success responses to forwarded events
- direct probe response:

```json
{
  "headerKeys": ["stripe-signature"],
  "hasStripeSignatureHeader": true,
  "stripeSignaturePreview": "test-signature",
  "bodyType": "object",
  "bodyPreview": "{\"hello\":\"world\"}",
  "isBase64Encoded": false,
  "method": "POST",
  "path": "/s/stripe/route-probe"
}
```

What we learned:

- forwarding `stripe-signature` into a Twenty app route works
- Stripe CLI to local Twenty app route transport is viable for Stage 1
- the route runtime presents the request body to the handler as a parsed object in the probe case
- `isBase64Encoded` is `false`

Current interpretation:

- app-route webhook delivery looks viable inside Twenty apps
- exact raw-body fidelity for Stripe signature verification is still unproven
- based on the probe result, the runtime appears to parse JSON before the handler sees it, which means raw-body-dependent verification may not work by default in the route handler shape we currently have

Open questions:

- does a real forwarded Stripe webhook also arrive as `bodyType: object` in the same way as the direct probe call
- is there any supported way in the released Twenty app/runtime surface to access the raw request body for signature verification
- if not, what is the narrowest acceptable Stage 1 posture while we continue testing Twenty apps rather than assuming an external runtime too early

### 2026-04-23 route/runtime findings

What we did:

- inspected the released Twenty SDK and shared types for route-triggered logic functions

What we learned:

- `RoutePayload` is backed by `LogicFunctionEvent` and includes:
  - `headers`
  - `body`

  - `isBase64Encoded`
  - request context metadata
- route manifests support `forwardedRequestHeaders`, which means forwarding `stripe-signature` into a Twenty app route is part of the supported manifest shape
- this is strong evidence that Stage 1 webhook intake belongs inside the app-first path until proven otherwise

What is still unproven:

- whether the route runtime preserves exact raw body fidelity needed for Stripe signature verification
- whether the body arrives as parsed JSON, raw string, or base64-encoded content under the webhook path we would actually use

### 2026-04-23 Stripe CLI notes

What we did:

- checked how the Stripe CLI is installed on this machine
- verified the packaged version and candidate version through `apt`

What we learned:

- the Stripe CLI is installed system-wide at `/usr/bin/stripe`
- this is the expected shape for a local developer tool and is preferable to trying to vendor it inside the app repo
- the machine was updated to `stripe version 1.40.7`
- current package candidate on this machine matched the installed version after upgrade

Practical note:

- keep Stripe CLI as a system-level tool
- document the version expectation and the commands we rely on
- update it via the system package manager rather than trying to move it into the repo

### 2026-04-24 real webhook shape + verification experiment setup

What we did:

- ran a real Stripe CLI forwarding session against the temporary Twenty app probe route
- captured app logs for forwarded Stripe events including `checkout.session.completed`
- checked the historical community Stripe app and the newer Fireflies webhook app in `services/twenty-core/packages/twenty-apps/community`
- updated the probe route to attempt Stripe signature verification against the exact payload representation visible to the handler
- added `STRIPE_WEBHOOK_SECRET` as a secret application variable for the experiment

What we learned:

- real Stripe webhook events do reach the Twenty app route successfully
- `stripe-signature` forwarding works on real forwarded events, not just a synthetic `curl` probe
- real Stripe events arrive to the handler as parsed objects with top-level Stripe event keys already materialized
- `isBase64Encoded` remained `false` on the real forwarded events we inspected
- the old community `stripe-synchronizer` app explicitly documented that signature validation was blocked in the earlier app surface because headers were not accessible
- the newer community Fireflies app shows a fallback pattern of verifying against `JSON.stringify(payload)` when raw body is unavailable, which is useful as a comparison point but not sufficient proof for Stripe

Current interpretation:

- the transport/runtime question is now largely settled in favor of app-owned intake being viable
- the remaining question is precise: does Stripe signature validation succeed against the runtime-visible payload form, or does the lack of raw-body access break it
- the next probe run should give a definitive answer without yet committing us to a production handler design

Open questions:

- does the runtime-visible payload string match Stripe's signed payload closely enough for `stripe-signature` verification to pass
- if it does not, is there any supported raw-body access path in the released Twenty app surface
- if not, what is the narrowest acceptable app-first posture for Stage 1 while keeping the platform experiment honest

### 2026-04-26 signature verification result

What we did:

- set `STRIPE_WEBHOOK_SECRET` to the live `stripe listen` session signing secret
- replayed real Stripe CLI-forwarded webhook events into the probe route
- attempted Stripe signature verification against the runtime-visible payload form inside the Twenty app route

What we learned:

- verification was attempted successfully on real events including `checkout.session.completed`
- the runtime-visible payload form was `json-stringify`
- verification failed consistently with `signature mismatch against runtime-visible payload`
- this failure was consistent across multiple Stripe event types, not isolated to a single event shape

Current interpretation:

- the released Twenty app route surface is sufficient for receiving Stripe webhooks and forwarding `stripe-signature`
- it is not, in its current runtime shape, sufficient for standard Stripe signature verification when the handler only sees the parsed JSON object form
- this is now a concrete platform boundary, not a hypothetical concern

Implication for Stage 1:

- if we require standard Stripe webhook signature verification, we should not yet treat a pure in-app route handler as production-ready without an additional raw-body-capable path or other validated platform support
- the app-first experiment remains valuable, but the security boundary is now the main decision point rather than transport or staging-model fit

Status note:

- this conclusion was correct for the `v2.1.x` app-dev/runtime path under test at that time
- it was later superseded by the `2026-05-01` `v2.2.0` validation recorded below

### 2026-04-26 local runtime/codebase verification

What we did:

- inspected the current Twenty server route-trigger implementation in `services/twenty-core/packages/twenty-server`
- compared the generic app route-trigger path with Twenty's own internal Stripe billing webhook implementation

What we learned:

- the app route-trigger builder explicitly parses request bodies before constructing the `RoutePayload`
- strings and buffers are converted via `JSON.parse(...)` when possible, otherwise wrapped as `{ raw: ... }`
- the route-trigger builder hard-sets `isBase64Encoded: false`
- the route-trigger tests also assert `isBase64Encoded === false` and ordinary object-body delivery
- Twenty's internal billing Stripe webhook takes a different path and explicitly depends on `req.rawBody` for `constructEventFromPayload(...)`

Current interpretation:

- our probe results are consistent with the current Twenty server implementation, not just a local dev quirk
- there is a meaningful platform distinction between:
  - generic app-owned route triggers, which currently expose parsed bodies
  - Twenty's internal Stripe billing webhook path, which has raw-body access
- unless there is an undocumented or newly-added app-route mode, the current released app trigger surface does not appear to offer the raw-body semantics Stripe expects for normal webhook verification

Status note:

- this interpretation matched the `v2.1.x` runtime and route-trigger code path we inspected at the time
- it should not be treated as the current final conclusion after the `v2.2.0` runtime validation recorded below

### 2026-04-26 Stage 1 one-off shape definition

What we did:

- re-read the integration-intake and staging sections of `PRODUCT_REVIEW.md`
- compared that guidance against the current `giftStaging` object shape and the existing Stripe Stage 1 note
- tightened the working definition for the first one-off Stripe staging record

Working product read:

- integration intake should stage by default
- the first Stripe shape should create a reviewable `giftStaging` row, not a committed `gift`
- we should keep only durable intake facts on `giftStaging`
- we should not import service-era metadata just because it exists
- we should still preserve enough source evidence and idempotency signal to support a production path later

Stage 1 durable facts to persist for `checkout.session.completed`:

- `intakeSource`
  - use this to label the row as Stripe-origin integration intake in the shared staging workflow
- `name`
  - short operator-facing label only; useful, but not treated as a source-of-truth integration identifier
- `amount`
  - the captured donation amount as staged gift fact
- `giftDate`
  - donation/effective date carried into the staging workflow
- `donorFirstName`
- `donorLastName`
- `donorEmail`
  - only donor evidence clearly available from the Stripe event/customer details
- `externalId`
  - authoritative donation-level Stripe identifier for the staged row
  - current working meaning: the Stripe Checkout Session id
- `sourceFingerprint`
  - authoritative first-slice idempotency fingerprint for replay-safe staging creation
  - current working meaning: based on the Stripe event id for the inbound webhook delivery
- `provider`
  - stable channel/system identity such as `STRIPE`
- `providerPaymentId`
  - provider-side payment reference when present on the event

Fields explicitly not elevated into the first durable shape unless a later decision justifies them:

- `providerContext`
- raw provider payload storage
- a first-class intake-event object
- recurring-specific fields for one-off donations
- payout/reconciliation linkage
- extra derived diagnostics that are better treated as workflow/runtime state than intake fact

Current idempotency posture:

- keep the first Stage 1 posture simple and explicit
- `sourceFingerprint` should be the first replay-protection signal
- for the first Stripe slice, the webhook event id is the cleanest candidate because it identifies the actual delivery we are ingesting
- `externalId` and `providerPaymentId` remain important source evidence, but should not be treated as interchangeable with the first event-level replay key without a deliberate later decision

Current interpretation:

- this is narrow enough to avoid overbuilding
- it still keeps the important production path concerns visible:
  - source evidence,
  - idempotency,
  - and shared staging treatment rather than a Stripe-only side workflow

### 2026-04-26 Stage 1 mapper implementation

What we did:

- added a pure Stripe one-off staging mapper in `src/stripe/stripe-one-off-staging.ts`
- kept it focused on `checkout.session.completed` only
- made it build the agreed Stage 1 durable `giftStaging` shape
- added a small `createStripeOneOffGiftStaging(...)` helper so later route/ingress work can call a stable app-local seam rather than re-embedding mapping logic
- added focused Vitest coverage for the mapper shape and validation rules

What we learned:

- the current app already has a clean `createGiftStaging` mutation shape we can reuse directly
- the mapper can stay lean while still making a few important choices explicit:
  - `externalId` = Stripe Checkout Session id
  - `sourceFingerprint` = Stripe event id
  - `provider` = `STRIPE`
  - `providerPaymentId` = payment intent id when available
  - `giftDate` = session `created` date, falling back to event `created`
- app-local mapping logic can progress independently of the unresolved raw-body/webhook verification issue

Validation note:

- `yarn lint` passed after the mapper addition
- the app's current Vitest config only includes `src/**/*.integration-test.ts` and runs heavy global app setup
- the new focused mapper test file therefore exists as coverage, but was not run through the default test script without changing the repo's current test conventions

### 2026-04-26 upstream v2.1 and GitHub connector check

What we did:

- reviewed the new `2026-04-26` snapshot in `TWENTY_EXTENSIBILITY_WATCH.md`
- inspected the newly added upstream example app `packages/twenty-apps/community/github-connector`

What we learned:

- the current upstream watch still records route-trigger raw-body fidelity as an open platform gap for Stripe-style verification
- the new GitHub connector independently confirms the same thing in its own README:
  - webhook signatures require raw body
  - Twenty currently parses JSON before handing route events to logic functions
  - the example therefore recommends either leaving webhook-secret verification unset or terminating verification at a reverse proxy until raw bytes are exposed
- the GitHub connector keeps the same app-test posture we are already seeing:
  - Vitest config still includes only `src/**/*.integration-test.ts`
  - tests run through the local app-dev container/setup path rather than a separate lightweight unit-test lane

Current interpretation:

- `v2.1` does not appear to change the Stripe webhook-verification conclusion
- the new upstream example strengthens confidence that our raw-body finding is real and current
- the testing point is worth keeping in mind, but it does not yet force a local change:
  - if we want pure mapper/unit tests to run by default later, that should be a deliberate app testing-convention choice, not an incidental one-off workaround for Stripe

### 2026-04-26 internal one-off intake seam with idempotency

What we did:

- added an authenticated internal route at `/stripe/intake/create-one-off-gift-staging`
- kept it clearly separate from the unresolved public webhook ingress question
- routed that logic through the new Stripe one-off mapper and staging-create helper
- added first-pass duplicate protection by checking existing `giftStaging` rows on `sourceFingerprint` before creating a new row
- added an integration test that:
  - submits a `checkout.session.completed` payload through the internal route,
  - verifies the created staging row fields,
  - replays the same event,
  - and confirms the second call resolves to the same staging row rather than creating a duplicate

What we learned:

- the app can now perform the core Stage 1 one-off Stripe intake behavior entirely inside the Twenty app boundary, given a trusted event payload
- the minimal replay-protection posture works cleanly for the first slice when keyed on `sourceFingerprint`
- end-to-end integration coverage for this internal seam now passes under the app's existing integration-test harness

Validation:

- `yarn lint` passed
- `yarn vitest run src/__tests__/stripe-one-off-staging.integration-test.ts` passed when run with access to the local Twenty app-dev server

### 2026-04-26 lean recurring evidence definition

What we did:

- re-read the recurring sections of `PRODUCT_REVIEW.md`
- compared that guidance against the current app-owned `recurringAgreement` object, the `giftStaging -> recurringAgreement` relation, and the current one-off Stripe shape
- defined the minimum recurring-evidence posture to carry forward while keeping recurring product meaning anchored in CRM commitment/expectation, not Stripe metadata

Working product read:

- recurring intake should be driven primarily by certainty class, not by provider-specific optimism
- the recurring agreement is the CRM commitment / expectation record
- new recurring-agreement creation from staging should require explicit reviewer intent
- fulfillment should be the primary driver of `nextExpectedAt` advancement
- provider state is important evidence, but should not silently become the product model

Minimum recurring certainty classes to use:

- confident existing agreement match
  - the system can safely link the incoming fulfillment to a known `recurringAgreement`
- recurring-related but unmatched
  - the intake clearly looks recurring-related, but there is not yet a safe existing agreement link
- weak-signal recurring
  - the intake contains hints of recurrence, but not enough to drive agreement behavior automatically

Lean recurring evidence to carry forward from Stripe intake:

- always keep the generic Stripe source evidence already established for Stage 1:
  - `provider`
  - `providerPaymentId`
  - `externalId`
  - `sourceFingerprint`
- when there is a confident existing agreement match:
  - carry the `recurringAgreement` relation
- when there is recurring-related but unmatched evidence:
  - keep the outcome review-led rather than auto-creating an agreement
  - write a staged gift only when the event is strong enough to represent real fulfillment and carries the minimum evidence needed for later reviewer-led processing
  - keep the staged row not ready by default until explicit reviewer intent exists
- when the signal is weak:
  - keep normal staging treatment
  - do not force recurring semantics just because Stripe emitted recurrence-related context

What we are intentionally not elevating yet:

- automatic creation of a new `recurringAgreement` from provider evidence alone
- broad Stripe-specific recurring metadata snapshots on staged gifts
- provider schedule updates silently driving `nextExpectedAt`
- pre-created expected installment rows
- rich `providerContext` or payment-method metadata on staged gifts unless a later step proves it is operationally necessary in the lean product
- treating recurring-related intake as a separate workflow fork rather than an extension of the shared staging/fulfillment model

Current interpretation:

- confident-match recurring fulfillment can direct-commit because the existing agreement anchors the CRM meaning
- unmatched Stripe subscription-backed fulfillment should create reviewable staging evidence because it is strong enough to indicate a likely new recurring donation
- we should still avoid broad recurring metadata on `giftStaging`; only provider-backed agreement and interval evidence should be carried when needed for later processing

### 2026-04-26 provider casing alignment and recurring path correction

What we decided:

- use `STRIPE` consistently as the durable provider value across Stripe-origin staging evidence and `recurringAgreement.provider`
- keep `stripe_webhook` as the lower-level intake source label for webhook-origin rows
- do not implement confident recurring fulfillment by creating a `giftStaging` row linked to the agreement

Why:

- `recurringAgreement.provider` is already a select with `STRIPE`, `GOCARDLESS`, `MANUAL`, and `IMPORTED`
- using lowercase `stripe` on staged rows would create an avoidable integration mismatch
- the product review says a confident existing recurring-agreement match should usually take a lighter fulfillment path and bypass gift staging by default
- creating a staged row for confident recurring fulfillment would likely encode an interim path that we expect to remove later

Current implication:

- the next recurring implementation should target direct committed-gift creation for the confident existing agreement match case
- unmatched Stripe subscription-backed fulfillment should write a staging row for review, without auto-creating a `recurringAgreement`

### 2026-04-26 confident recurring fulfillment implementation

What we did:

- added minimal Stripe source evidence fields to committed `gift` records:
  - `externalId`
  - `sourceFingerprint`
  - `provider`
  - `providerPaymentId`
- added an authenticated internal route at `/stripe/intake/create-recurring-gift`
- implemented the confident-match recurring path:
  - extract Stripe subscription id from `checkout.session.completed`
  - find an existing `recurringAgreement` with `provider = STRIPE` and matching `providerAgreementId`
  - create a committed gift linked to the agreement and donor
  - advance `nextExpectedAt` only after gift creation succeeds
  - suppress replay duplicates by `sourceFingerprint` without advancing expectation again
- initially kept unmatched recurring evidence non-mutating:
  - no gift
  - no staged row
  - no recurring agreement creation
  - later refined by the event-router path to create lean staging evidence for unmatched Stripe subscription-backed fulfillment

What we learned:

- the direct committed-gift path fits the product review better than creating a linked staged row for confident recurring fulfillment
- committed gifts need the same minimal source evidence as staged gifts when they are created directly from provider-backed intake
- replay protection matters more in this path because duplicate fulfillment would also risk advancing agreement expectation twice

Validation:

- `yarn lint` passed
- `yarn vitest run src/__tests__/stripe-recurring-fulfillment.integration-test.ts` passed with local Twenty app-dev access
- `yarn vitest run src/__tests__/stripe-one-off-staging.integration-test.ts` passed after the provider casing alignment

### 2026-04-26 Stripe event router implementation

What we did:

- added a thin trusted-event router around the two implemented paths
- added an authenticated internal route at `/stripe/intake/handle-event`
- classified `checkout.session.completed` without a Stripe subscription as one-off staging
- classified `checkout.session.completed` with a Stripe subscription as recurring fulfillment
- kept unsupported event types as explicit no-ops
- initially kept unmatched recurring evidence non-mutating, before the later staging refinement

Why:

- this lets us test the product-level Stripe event classification inside Twenty apps without pretending the public webhook/signature-verification issue is solved
- the router keeps provider-event classification separate from the actual one-off and recurring mutation logic
- the unmatched recurring branch stays aligned with the product review: reviewer intent is needed before creating or linking recurring commitments

Validation:

- `yarn lint` passed
- `yarn vitest run src/__tests__/stripe-event-router.integration-test.ts` passed with local Twenty app-dev access

### 2026-04-26 unmatched recurring staging refinement

What changed:

- added nullable `providerAgreementId` to `giftStaging`
- changed the router so Stripe subscription-backed events with no confident existing agreement match create a `giftStaging` row for review
- kept confident existing agreement matches on the direct committed-gift path
- kept the unmatched staging row lean:
  - Stripe checkout session id as `externalId`
  - Stripe event id as `sourceFingerprint`
  - Stripe payment intent as `providerPaymentId`
  - Stripe subscription id as `providerAgreementId`
  - donor evidence, amount, and gift date from the checkout session
- kept the row not ready for processing by default
- did not create a `recurringAgreement`
- did not add broad `providerContext` or Stripe-specific metadata snapshots

Why:

- the product review supports carrying recurring-related evidence through staging when creation of a CRM recurring agreement needs reviewer intent
- a Stripe `checkout.session.completed` event with a subscription id is stronger than weak recurrence evidence: it is fulfilled provider-backed payment evidence for a likely recurring donation
- `providerAgreementId` is the minimum durable reference needed so later processing can create or link a `recurringAgreement` and preserve the provider-side subscription reference

Validation:

- `yarn lint` passed
- `yarn test:unit` passed
- `yarn twenty dev --once` synced the app successfully after the metadata/route update
- `yarn stripe:fixtures` passed against `http://localhost:2020`
- observed fixture outcome for unmatched Stripe subscription-backed fulfillment:
  - action `CREATE_RECURRING_GIFT_STAGING`
  - created a `giftStaging` row
  - preserved Stripe subscription id as `providerAgreementId`
  - did not create a committed gift
  - did not create a `recurringAgreement`

### 2026-04-26 Twenty SDK 2.1 upgrade check

What we did:

- confirmed the local `services/twenty-core` packages report:
  - `twenty-sdk` `2.1.0`
  - `twenty-client-sdk` `2.1.0`
  - `create-twenty-app` `2.1.0`
- confirmed npm also publishes `twenty-sdk`, `twenty-client-sdk`, and `create-twenty-app` at `2.1.0`
- updated the nonprofit fundraising app dependency pins from `2.0.0` to `2.1.0`
- refreshed the app `yarn.lock`
- confirmed `yarn twenty --version` reports `2.1.0`

Validation:

- `yarn lint` passed after the dependency update

Testing harness note:

- a focused `yarn vitest run src/__tests__/stripe-event-router.integration-test.ts` run was attempted after the upgrade
- the first attempt exited with code `137` during the app-dev sync phase, before test assertions ran
- the retry progressed through app registration/upload/sync/API-client generation but the terminal/session crashed before completion
- this should be treated separately from the SDK upgrade itself:
  - the app is now pinned to `2.1.0`
  - the current integration harness remains heavy because `global-setup.ts` uninstalls, runs `appDevOnce`, and uninstalls again for focused test runs
  - we should not keep rerunning this path casually until we either make the harness lighter or intentionally run it as a heavier validation step

Follow-up:

- added `yarn test:unit` as a fast Vitest lane for `src/**/*.test.ts`
- left `yarn test` as the existing app-dev integration lane for `src/**/*.integration-test.ts`
- `yarn test:unit` currently runs the Stripe one-off mapper and Stripe event-router unit tests without app-dev sync

### 2026-04-26 trusted Stripe fixture runner

What we added:

- `yarn stripe:fixtures`
- a script that posts trusted representative events to `/s/stripe/intake/handle-event`
- fixture coverage for:
  - one-off `checkout.session.completed`
  - recurring `checkout.session.completed` with a seeded matching `recurringAgreement`
  - recurring `checkout.session.completed` without a matching agreement
  - unsupported event type

Why:

- this gives us a repeatable local route-level validation path without invoking the heavy app-dev Vitest integration harness
- it keeps public Stripe webhook verification separate from the trusted internal route we can currently exercise
- it makes the current router behavior easy to inspect before adding the next recurring product slice

Operational note:

- this helper mutates the app-dev workspace by creating fixture records
- it should be used deliberately for local validation, not as a production ingestion path

Validation:

- `yarn lint` passed after adding the runner
- `yarn test:unit` passed after adding the runner
- `yarn stripe:fixtures` passed against `http://localhost:2020`
- observed fixture outcomes:
  - one-off event created `giftStaging`
  - matched recurring event created committed `gift` and advanced `nextExpectedAt` to `2026-05-21`
  - unmatched recurring event created `giftStaging` for review with `providerAgreementId`
  - unsupported event returned `IGNORED`

### 2026-04-27 unmatched recurring processing design note

Current state:

- unmatched Stripe subscription-backed fulfillment now creates a `giftStaging` row for review
- that staged row carries the minimum provider evidence needed for later recurring processing:
  - `provider = STRIPE`
  - `providerPaymentId`
  - `providerAgreementId`
  - `externalId`
  - `sourceFingerprint`
- no recurring agreement is created automatically

Corrected product action:

- do not add a separate "promote recurring agreement" click for the first version
- keep the user flow aligned with staging: review donor/blockers, then process the row or batch
- processing should create the recurring agreement, committed gift, and links in one canonical operation when the staged evidence is sufficient
- failed/deferred processing is acceptable if required recurring facts are missing or ambiguous
- do not use generic ready-for-processing alone as recurring meaning, because `isReadyForProcessing` is already under refinement and may be removed or reshaped before live use
- keep donor resolution in the existing staging review flow
- keep the number of clicks low; users should not need to separately create the recurring agreement before processing

Proposed first implementation shape:

- extend the existing staging processing path to detect Stripe recurring staged rows
- load each staged row and validate:
  - `provider = STRIPE`
  - non-empty `providerAgreementId`
  - donor is linked or can be created under the normal staging processing rules
  - amount is valid
  - gift date exists
  - no existing `recurringAgreement` is already linked, unless the row has been explicitly linked during review
- create a `recurringAgreement` linked to the resolved donor when no agreement is linked
- copy only durable facts:
  - provider `STRIPE`
  - provider agreement/subscription id
  - cadence/interval from provider evidence
  - amount/currency
  - start date / expectation anchor from the staged gift date
- create the committed gift linked to that recurring agreement
- write back processed state and committed gift linkage to the staged row

Cadence posture:

- derive cadence confidently from provider evidence, not from our current test setup
- for Stripe, use subscription/price interval evidence when available
- if cadence evidence is missing or not trustworthy, defer/fail processing with a clear reason and leave the row in review
- expect further refinement here as we see more real provider payloads

Extensibility posture:

- this is being built through the Stripe path first, but the process must support future provider-backed recurring intake patterns
- direct debit mandates are a likely future case where provider evidence may arrive before or around first fulfillment
- avoid making the staging/process contract so Stripe-specific that direct debit or other recurring providers would need a separate workflow fork
- provider-specific evidence extraction can vary, but the product flow should remain: carry evidence in staging, review blockers, process once to create the canonical recurring agreement/gift records when confidence is sufficient

### 2026-04-27 unmatched recurring processing implementation

What changed:

- added generic provider interval evidence fields to `giftStaging`:
  - `providerIntervalUnit`
  - `providerIntervalCount`
- extracted Stripe subscription price interval evidence when the subscription object is available on `checkout.session.completed`
- extended batch processing so provider-backed recurring staged rows use the existing row fallback path while normal staged gifts stay on the batched REST create path
- when processing an unmatched provider-backed recurring row:
  - validate the normal staging gates first: confirmed donor, ready flag, no core issue, valid amount and gift date
  - find an existing `recurringAgreement` by `provider` and `providerAgreementId` before creating a new one
  - create a new active `recurringAgreement` only when no existing provider-backed agreement is found
  - create the committed gift linked to the recurring agreement
  - advance `nextExpectedAt` after the committed gift is created
  - write back both `committedGiftId` and `recurringAgreementId` to the staged row in the existing batched staging writeback pass
- copied source evidence from staged row to committed gift where supported:
  - `externalId`
  - `sourceFingerprint`
  - `provider`
  - `providerPaymentId`

Quality posture:

- the implementation avoids adding per-row staging writebacks during processing; successful and failed row outcomes are still persisted through the existing chunked staging writeback
- the provider agreement lookup is an intentional extra read for recurring rows to reduce duplicate agreement creation on retries
- cadence mapping is deliberately conservative:
  - Stripe/provider `week` + `1` maps to `WEEKLY`
  - `month` + `1` maps to `MONTHLY`
  - `month` + `3` maps to `QUARTERLY`
  - `year` + `1` maps to `ANNUAL`
  - missing or unsupported interval evidence fails processing with a clear row error rather than silently inventing a schedule
- this remains provider-backed rather than Stripe-only: Stripe is the first extractor, but the processor depends on generic provider evidence fields

Validation:

- `yarn lint` passed
- `yarn test:unit` passed

### 2026-05-01 Twenty app-dev v2.2.0 raw-body validation

What we did:

- treated the local environment as potentially mixed because `docker pull twentycrm/twenty-app-dev:latest` had previously been run outside the Twenty CLI flow
- confirmed the running app-dev server was still `v2.1.0` via `yarn twenty server status`
- attempted `yarn twenty server upgrade 2.2.0`
- observed that the CLI maps that directly to `twentycrm/twenty-app-dev:2.2.0`, and the registry did not publish that image tag
- ran the docs-aligned CLI upgrade path `yarn twenty server upgrade`, which recreated the `twenty-app-dev` container from `twentycrm/twenty-app-dev:latest`
- confirmed the recreated app-dev server reported `Version: v2.2.0` via `yarn twenty server status`
- re-synced the fundraising app cleanly with `yarn twenty dev --once`
- ran a real Stripe CLI forwarding session against `http://localhost:2020/s/stripe/route-probe`
- set `STRIPE_WEBHOOK_SECRET` to the active signing secret from that live `stripe listen` session
- watched structured route logs with `yarn twenty logs`

What we observed:

- the app-dev runtime on `localhost:2020` was definitively upgraded to `v2.2.0`
- the synced app continued to expose the probe route successfully after upgrade
- real forwarded Stripe events now arrived with:
  - `hasRawBody: true`
  - `verificationMethod: event-raw-body`
  - `verificationMatched: true`
  - `verificationError: null`
- parsed event access still worked at the same time:
  - `bodyType: object`
  - `bodyKeys` included top-level Stripe event fields
  - `stripeEventId`, `stripeEventType`, and `stripeObjectType` were populated
- this was observed across multiple Stripe events, including:
  - `product.created`
  - `price.created`
  - `charge.succeeded`
  - `checkout.session.completed`
  - `payment_intent.succeeded`
  - `payment_intent.created`
  - `charge.updated`

Representative result for the event type we care about most:

- `stripeEventType: checkout.session.completed`
- `stripeObjectType: checkout.session`
- `verificationMatched: true`
- `verificationError: null`

What we learned:

- the `v2.2.0` app-dev runtime clears the earlier raw-body/signature-verification platform boundary for this route-trigger path
- a Twenty app route can now:
  - receive real Stripe webhooks,
  - preserve `rawBody`,
  - validate the standard Stripe signature with the live signing secret,
  - and still expose parsed event data to the handler
- the old `v2.1.x` conclusion should now be treated as historical rather than current

Upgrade-process learning:

- `docker pull twentycrm/twenty-app-dev:latest` alone is not a sufficient upgrade signal
- `twenty-sdk` / `twenty-client-sdk` package versions do not imply a matching published `twenty-app-dev:<same-version>` image tag
- the docs-aligned CLI path that actually worked here was:
  - `yarn twenty server upgrade`
  - `yarn twenty server status`
  - `yarn twenty dev --once`
- this should still be treated as a working, docs-aligned process rather than a fully proven clean-baseline runbook, because the starting local state was not guaranteed to be clean

### 2026-05-01 Promoted public Stripe webhook route validation

What we changed:

- added a new production-shaped public Stripe webhook route at `/stripe/webhook`
- kept `/stripe/route-probe` as a diagnostic/dev route only
- moved Stripe signature verification and parsed-event handoff into the public route itself
- kept routing on the existing `routeTrustedStripeEvent(...)` path so existing idempotency and staging behavior remained unchanged

What we validated:

- ran a real Stripe test checkout / Payment Link flow rather than relying only on `stripe trigger`
- forwarded Stripe to `http://localhost:2020/s/stripe/webhook`
- set `STRIPE_WEBHOOK_SECRET` from the active `stripe listen` session
- watched the promoted route with `yarn twenty logs`

What we observed:

- Stripe delivered multiple events successfully to `/s/stripe/webhook` with `201` responses
- non-target Stripe events still flowed through safely and were logged as:
  - `charge.succeeded` -> `IGNORED`
  - `payment_intent.created` -> `IGNORED`
  - `payment_intent.succeeded` -> `IGNORED`
  - `charge.updated` -> `IGNORED`
- the real checkout completion event was received and processed as:
  - `eventType: checkout.session.completed`
  - `action: CREATE_ONE_OFF_GIFT_STAGING`

What we learned:

- the promoted public route is now the validated path, not just the probe
- real Stripe webhook delivery, signature verification, parsed event access, and staging handoff all worked together on the `v2.2.0` app-dev runtime
- the production-shaped route now closes the earlier split where verification was proven in a probe route but processing happened through a separately trusted parsed-body route
- unsupported Stripe events are safely ignored by the existing router after verification, while the supported checkout completion event reaches the expected one-off staging path

## 5. Decisions Log

Capture only concrete working decisions here.

### Dated decisions

#### 2026-04-23

- We will use the staged Stripe capability model in `STRIPE_IMPLEMENTATION_STAGES.md` as the active framing for this work.
- We will keep Stripe app-first by default and only revisit an external runtime boundary after concrete evidence, not by assumption.
- We will start from one-off Stripe intake to `giftStaging`.
- The first Stage 1 Stripe event in scope is `checkout.session.completed`.
- The first Stage 1 success condition is: a real Stripe test-mode event creates a Stripe-origin `giftStaging` row with the agreed minimum evidence set inside the Twenty app boundary.

## 6. Open Questions

- Do we need a first-class intake-event record in Stage 1 or Stage 2, or is staged-row evidence enough initially?
- Which provider/source fields belong on `giftStaging` as durable fact versus later derived or audit-only context?
- What is the right earliest point to test Stripe payout representation through `giftPayout` without derailing Stage 1?

## 7. Evidence To Keep

When available, add or link:

- Stripe CLI commands used successfully
- test event types exercised
- screenshots or notes of resulting Twenty records
- known good local validation flow
- known limitations or surprising behavior in Twenty apps
