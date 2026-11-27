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
- Stripe Link / “save my information for faster checkout” UI is Stripe-owned behavior inside the Payment Element flow
- disabling Link in Stripe-side settings materially improved the donor experience in live testing, so the current baseline should assume:
  - Payment Element remains the default payment UI
  - Link can be disabled in Stripe settings if it adds visible friction or duplicates donor-detail capture unhelpfully
- Express Checkout Element looks like a plausible future enhancement, not a replacement decision:
  - likely first target would be one-off donations only
  - strongest candidate shape is additive: express buttons above the existing Payment Element, not a new donation-form architecture
  - the biggest open question is payment-method availability inside embedded cross-origin iframe contexts on real charity websites, especially Apple Pay / Google Pay wallet behavior
  - do not assume recurring monthly support or iframe wallet behavior is production-ready until it is prototyped in the real embed model

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

Stripe product-assumption check:

- this fundraising app is not currently a marketplace or payout-routing platform
- the target v1 shape is closer to:
  - one charity workspace
  - one charity-owned Stripe account
  - direct charges into that charity's own Stripe account
  - no platform fee routing
  - no seller payout orchestration
  - no broader Connect account-lifecycle product
- because of that, we should distinguish three different Stripe setup models:

1. direct/manual integration
   - the workspace stores Stripe credentials directly
   - the app uses those credentials to create Checkout Sessions, verify webhook events, and fetch payment evidence
   - this can use full secret keys or restricted API keys
2. plugin/extension-style "Connect Stripe" onboarding
   - the workspace clicks a product-facing "Connect Stripe" flow
   - the goal is cleaner onboarding and less manual secret handling
   - the donation/webhook model can still stay workspace-local
3. full Stripe Connect platform / marketplace architecture
   - the product manages broader connected-account lifecycle and often centralises platform concerns such as routing, transfers, and payout responsibilities
   - this is a larger product/architecture commitment than the current fundraising v1 needs

Current preferred interpretation:

- do not assume Stripe Connect platform docs are automatically the right product model for this app
- the hardest v1 requirement is still safe direct payment + webhook handling for a charity-owned Stripe account
- cleaner onboarding is desirable, but it should not force a platform/marketplace architecture if the product does not need one

Restricted-key note:

- Stripe's API key model supports restricted API keys, which can be limited to only the resources the integration needs
- for a near-v1 charity-owned account model, restricted keys may be a better fit than OAuth/Connect if:
  - we want to reduce blast radius
  - we are comfortable with manual admin setup
  - we do not yet need a polished self-serve "Connect Stripe" UX
- webhook signing secrets remain separate from API keys and still need their own workspace-level configuration

Stripe Apps note:

- Stripe Apps and restricted-API-key app patterns are conceptually relevant because they model "install an integration into your own Stripe account with constrained permissions"
- however, a Stripe App is a Stripe-Dashboard-native product surface, not a Twenty app surface
- so the concept is useful, but it is not a direct implementation path inside Twenty today

Simplest safe v1 setup:

- one charity workspace uses its own Stripe account
- workspace stores:
  - a Stripe publishable key
  - a Stripe restricted or secret API key for server-side calls
  - a Stripe webhook signing secret
- the webhook URL stays workspace-specific:
  - `<app functions URL>/stripe/webhook`. The functions URL is the app's public domain where one applies (Twenty Cloud: `https://<workspace>.withtwenty.com`, or a custom domain bound to the app), otherwise `<server>/s`; the app's Settings page shows it
- this remains the lowest-complexity model until we decide that self-serve "Connect Stripe" onboarding is important enough to justify extra integration work

Near-v1 Stripe connection direction:

- if we pursue a near-v1 "Connect Stripe" path, keep the current proven webhook/event model:
  - `checkout.session.completed` for setup/agreement evidence
  - `invoice_payment.paid` for recurring payment economics
- treat OAuth / Twenty Connections primarily as a cleaner workspace onboarding and credential-management layer, not as a webhook architecture rewrite
- do not assume this automatically means a full Stripe Connect platform architecture
- prefer one workspace-shared Stripe connection per workspace
- prefer one Stripe account per workspace for v1
- keep workspace-specific webhook URLs for v1, for example:
  - `<app functions URL>/stripe/webhook`. The functions URL is the app's public domain where one applies (Twenty Cloud: `https://<workspace>.withtwenty.com`, or a custom domain bound to the app), otherwise `<server>/s`; the app's Settings page shows it
- keep the webhook signing secret as a workspace-scoped `applicationVariable` for now:
  - `STRIPE_WEBHOOK_SECRET`
- if the app remains in a direct-integration model, a restricted API key may still be the better near-term credential than OAuth
- use app registration `serverVariables` for Stripe OAuth client credentials only if we explicitly choose the "Connect Stripe" onboarding route:
  - `STRIPE_CLIENT_ID`
  - `STRIPE_CLIENT_SECRET`
- use the workspace Stripe `ConnectedAccount` for outbound Stripe API access only if that model proves compatible with the Stripe account shape we need
- likely keep `STRIPE_PUBLISHABLE_KEY` as a workspace-scoped variable in the first OAuth-enabled cut unless we prove a cleaner way to source it from the connection model

Current empirical note on Twenty Connections:

- a real Stripe OAuth connection was completed successfully in app-dev
- this proves the basic Twenty app Connection flow is viable enough to create a connected Stripe account
- however, the current app-facing connection surface still appears generic rather than Stripe-specific:
  - access token and scopes are the main usable fields
  - Stripe-specific account identity such as `acct_...`, publishable-key metadata, and other provider-specific fields are not yet clearly surfaced to the app in a first-class way
- because of that, OAuth/Connections should currently be treated as an interesting early capability rather than the v1 credential model for this app
- recommended posture:
  - keep the direct charity-owned key model for v1
  - treat OAuth/Connections as a candidate to retest once Twenty app Connections have matured further
  - revisit in a few months rather than pushing the current early surface deeper into the payment architecture

This keeps the v1 design intentionally cautious:

- workspace routing is still solved by the normal workspace domain/subdomain model
- webhook verification still uses a workspace-owned secret
- a direct restricted-key model remains a valid v1 option
- Connections improve admin/client onboarding and reduce manual secret handling if we choose that route
- central cross-workspace Stripe webhook routing remains out of scope unless later evidence justifies it

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

Near-v1 Stripe connection note:

- if we adopt Stripe OAuth/Connections, the webhook route should stay workspace-specific rather than centralised
- the route should continue to resolve its workspace from the normal Twenty workspace domain/subdomain context
- verification should continue to use the workspace-owned `STRIPE_WEBHOOK_SECRET`
- the workspace Stripe `ConnectedAccount` should only be needed after verification for outbound Stripe API lookups
  - e.g. fetching invoice, invoice payment, payment intent, charge, or balance transaction details

Local development fallback:

- local app-dev can continue to use env/app-configured Stripe credentials while the OAuth/Connections path is being introduced
- expected local values remain:
  - `STRIPE_SECRET_KEY`
  - `STRIPE_PUBLISHABLE_KEY`
  - `STRIPE_WEBHOOK_SECRET`
- local webhook testing still requires a Stripe listener forwarding to the app route, for example:
  - `stripe listen --forward-to http://localhost:2020/s/stripe/webhook`
- do not treat the local fallback as the desired long-term client setup UX; it is a development convenience and migration bridge

Repeated webhooks must no-op or update existing staging records, not create duplicate donation meaning.

## 8. Failure cases

- **Unpublished or archived form already embedded**
  - new loads should fail cleanly and show an unavailable state

- **Stripe disconnected**
  - publish or session creation should fail explicitly rather than producing broken donor flows

- **Donor abandons Checkout**
  - a pre-payment staging row may exist
  - v1 lifecycle contract:
    - donation-form rows are created as `paymentState = AWAITING_PAYMENT`
    - `AWAITING_PAYMENT` rows are hidden from the default actionable `GiftStaging` workflow
    - a simple nightly cleanup job should convert donation-form rows still in `AWAITING_PAYMENT` to `PAYMENT_EXPIRED`
    - this cleanup should be based on our own rule, not on Stripe event coverage
    - later Stripe success evidence may still overwrite an expired row to `PAYMENT_CONFIRMED`

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

## 8a. Donor page implementation (2026-11-24)

- **Client code.** The browser script is TypeScript in `src/donation-forms/embed-client/`, type-checked and linted with the app. `yarn build:donation-form-client` bundles it with esbuild into the committed module `donation-form-client-script.generated.ts`, which the embed route inlines. The step runs only during development: `twenty app build` and published bundles need nothing extra. A unit test fails if the generated module is out of date. Form data travels in a separate `application/json` block and is never interpolated into code.
- **Donor experience.**
  - Native radio groups for amount and frequency, and fieldsets with legends.
  - `autocomplete` on every donor field.
  - Inline errors plus a focused error summary.
  - Focus moves to each step's heading and to the thank-you.
  - The checkout route returns error codes that the page maps to donor wording; technical messages stay in the logs.
  - Layout works down to 320 px, and reduced motion is respected.
- **Embedding.** The page reports its height with `postMessage`. The embed snippet includes a small host script that resizes the matching iframe; it matches frames on `event.source`, because the sandboxed page's origin is `null`. Without the script, the iframe keeps a fixed 880 px height.
- **Lightweight protections.** These are invisible to donors and need no charity setup:
  - **Signed token.** The embed page carries a token signed with a key derived from `STRIPE_SECRET_KEY`. It is bound to the form and valid for two hours; an expired token asks the donor to reload.
  - **Honeypot.** An off-screen field, hidden from assistive technology and the tab order.

  Both are checked before any database or Stripe call. **Limits:** they stop blind scripted requests and naive bots, but not a bot driving a real browser, and a token can be reused until it expires. Turnstile remains deferred.

## 8b. Status (2026-11-25): parked on a Twenty platform issue

**Blocker.** Since SDK/server 2.59 (#30413), every route response carries `Content-Security-Policy: sandbox …` without `allow-same-origin`, and apps cannot override it. Stripe.js refuses to run in that sandbox ("Stripe.js requires 'allow-same-origin' if sandboxed"), and its fraud-signal requests fail with origin `null`. The embedded Payment Element therefore cannot load. Confirmed on 2021 both under `/s/` and on an emulated Cloud public domain (`PUBLIC_DOMAIN_URL` set, legacy-route cutoff, HTTPS edge), so it is not caused by our configuration.

**Twenty architecture (from source and PRs).**
- #20360 (May 2026): public domains can be bound to an app.
- #22045 (June 2026): HTTP functions are served on an isolated `*.withtwenty.com` "user content domain" so they can return any header, `Set-Cookie` included. `/s/` is phased out for new functions on Cloud (`LOGIC_FUNCTION_LEGACY_ROUTE_CUTOFF`, which returns 410).
- #30413 (Nov 2026): the sandbox applies everywhere, public domains included. It gives pages an opaque origin, which conflicts with June's stated goals.
- Isolated domains are effectively Cloud-only (Cloudflare). Self-hosters serve app routes under `/s/`.
- Minor: the front end builds `https://<workspace>.<domain>` and ignores any scheme or port in `PUBLIC_DOMAIN_URL`; logic functions use the full URL.
- Serving JavaScript from a route is anticipated in #30413's description but neither tested nor documented.

**Done regardless of the outcome.** Public form URLs come from `TWENTY_FUNCTIONS_URL` via `RestApiClient.resolveUrl` (`21756f78`).

**Options considered** (see the 2026-11-25 assessment):
1. Twenty-hosted form, inline payment. One document for standalone (app public domain) and embedded (iframe) use. Needs a Twenty opt-in for `allow-same-origin` on isolated domains. Preferred target.
2. The same form with a Stripe-hosted payment step. Works today everywhere, but embedded donors leave the site to pay.
3. A script widget rendered in the charity's page. Works today and is best for wallets, but weaker isolation of donor data, higher maintenance, and relies on undocumented script serving.

Backend decisions (pre-payment staging, webhook, evidence, versions) are unaffected. `payment_method_types: ['card']` should give way to Stripe-configured methods (wallets, Bacs Direct Debit) whichever option is chosen.

**Twenty's answer (2026-11-27).** Sent the message below. Twenty will keep the sandbox on the workspace domain (`/s/`, which protects self-hosted session cookies) and on the shared `*.withtwenty.com` domain (which keeps apps apart). It will lift the sandbox for **custom domains registered for the app**, so an app can serve a Stripe page through Twenty on its own domain. A subdomain per app per workspace is a possible longer-term option. The release was expected the next afternoon.

**What it means.**
- **Option 1 stays.** The form is served through Twenty on an app custom domain such as `give.charity.org`. The backend, payment flow and donor page don't change.
- **URLs need no change.** `TWENTY_FUNCTIONS_URL` already becomes `https://<app primary public domain>` when the app has one (`logic-function-executor.service.ts` `buildFunctionsBaseUrl`, `workspace-domains.service.ts` `buildPublicFunctionBaseUrl`), so `21756f78` covers it.
- **Registering an app custom domain needs Cloudflare** (`dns-manager.service.ts` `registerHostname`). Cloud has it; a typical self-hosted instance doesn't.
- **Priority: Twenty Cloud** (user decision, 2026-11-27). For now, self-hosted forms need a Cloudflare-configured instance or the option 2 fallback. Revisit if Twenty adds a non-Cloudflare path or per-app subdomains.

**Expected follow-ups, after testing.**
- Admin setup state: say a custom domain is required instead of offering a snippet that fails at payment.
- Remove `payment_method_types: ['card']`.
- Check that the admin screen's displayed links also use the custom domain.
- Setup documentation: the app domain and DNS, and registering the domain with Stripe for wallets. Confirm whether wallets in an iframe also need the charity's own domain registered.

**Testing plan once released.**
- 2021 first, with the app domain row added directly to the database plus the nip.io and HTTPS proxy setup. This is disposable and reversible, and proves the sandbox is lifted and Stripe.js loads.
- Then a Twenty Cloud workspace end to end, with real DNS, Stripe test mode and wallets.

**Possible follow-up questions for Twenty:**
- a non-Cloudflare path for self-hosters;
- whether the domain must be validated before the sandbox is lifted;
- the release or PR;
- whether framing headers on those responses change.

**Draft message to Twenty** (sent):

> **Route sandbox prevents payment SDKs on isolated public domains: intended?**
>
> We're building Fundraising for Twenty, a Marketplace app whose public donation forms are served from HTTP routes and embedded on charity websites. Card payments use Stripe's Payment Element (Stripe.js).
>
> **Our understanding of the intended architecture:**
> - #20360 (May): public domains can be bound to an app, for public-facing apps such as partner portals and lead collection.
> - #22045 (June): HTTP functions are served from an isolated, cookieless `*.withtwenty.com` "user content domain", so they can safely return arbitrary headers, including `Set-Cookie`. `/s/` remains the strict same-site path and is phased out for new functions.
> - #30413 (November): every route response carries `Content-Security-Policy: sandbox …` without `allow-same-origin`. Functions can't override it, including on public domains (both policies are sent).
>
> We've moved our app to `TWENTY_FUNCTIONS_URL` and `RestApiClient.resolveUrl` accordingly.
>
> **What we observe** (v2.59.2, with `PUBLIC_DOMAIN_URL` and the legacy-route cutoff set to emulate Cloud): the form is served from the workspace's public domain with the sandbox header, and our route calls work. But Stripe.js refuses to run ("Stripe.js requires 'allow-same-origin' if sandboxed"), and Stripe's fraud-signal requests fail because the origin is `null`. The same happens on `/s/`.
>
> **The apparent inconsistency:** June's change gives function pages their own origin so they can safely do more. November's change gives every page an opaque origin, so cookies, storage and any SDK that needs a real origin (Stripe.js; probably PayPal and bot-protection widgets too) can't work there. We couldn't tell whether that effect on isolated domains was intended.
>
> **Questions:**
> 1. Is an opaque origin intended for pages on isolated or app-bound public domains? If the main risk is the Twenty app session, could apps opt in to `allow-same-origin` there, perhaps per route? Without it, an app can't host a payment page on Twenty.
> 2. If the sandbox must stay, what's your recommended way for an app to offer embedded payments?
> 3. Is serving JavaScript from a route (`application/javascript`, loaded by a third-party site) a supported use?
> 4. Isolated domains seem to be Cloud-only (they depend on Cloudflare). What do you recommend for self-hosters' public pages? A minor related point: the front end builds the functions URL as `https://<workspace>.<domain>` and ignores any scheme or port in `PUBLIC_DOMAIN_URL`, while logic functions use the full URL.
> 5. Will embed URLs already pasted into websites keep working, both `/s/` URLs from before the cutoff and `*.withtwenty.com` URLs long term?
>
> It would also help to mention the sandbox in the HTTP route documentation.

Optional extra evidence before sending: a static page served with Twenty's exact policy (Stripe fails) and with `allow-same-origin` added (Stripe works). The repro used 2026-11-25 was a scratch script; it is quick to recreate.

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
