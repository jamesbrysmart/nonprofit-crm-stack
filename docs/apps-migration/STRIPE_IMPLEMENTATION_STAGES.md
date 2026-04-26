# Stripe Implementation Stages For The Fundraising App

Updated: 2026-04-26
Status: Working implementation note
Purpose: Define a staged implementation approach for Stripe inside the Twenty fundraising app so we can learn incrementally without accidentally treating the first working slice as the finished architecture.

This note is intentionally narrower than the broader migration docs.

It does not decide the full long-term integration architecture.

It does:

- define the intended staged build posture for Stripe,
- keep the product target visible beyond the first delivered slice,
- make explicit which parts of Stripe behavior each stage is trying to prove inside Twenty apps,
- and create a shared frame for deciding when a limitation is truly a Twenty-app boundary versus just an untested capability.

## 1. Why This Note Exists

Stripe is one of the clearest places where we could make two opposite mistakes:

- stop too early once a basic Stripe path works,
- or assume too early that later Stripe complexity must live outside Twenty apps.

We want neither.

The working posture for this migration is:

- build Stripe in stages,
- make each stage useful and learnable,
- treat later stages as intended capability expansion rather than optional polish,
- and only conclude that a boundary belongs outside Twenty apps after we have tried the relevant shape inside the released app framework first.

## 2. Working Product Direction

Current working direction from product review and migration discussion:

- manual entry should commit directly by default,
- integration intake should stage by default,
- one-off Stripe donations should create `giftStaging` records,
- recurring Stripe donations should remain aligned with the same staging/committed-gift lifecycle while also updating recurring-agreement truth where needed,
- and recurring complexity should be introduced in deliberate layers rather than bundled into the first Stripe slice.

This note assumes the first implementation target is app-first:

- prefer Twenty-app-owned metadata,
- prefer Twenty route/logic-function handling,
- prefer app-local TypeScript policy/orchestration modules,
- and avoid introducing a separate service/runtime layer unless a later stage gives strong evidence that Twenty apps are the wrong execution home for that concern.

## 3. Stage Design Rules

Every Stripe stage should state:

- the product outcome it delivers,
- the Twenty app capability it is trying to prove,
- the Stripe events/flows it covers,
- which app objects it creates or updates,
- what it deliberately does not handle yet,
- and what evidence would justify moving to the next stage.

Every stage should also avoid a common failure mode:

- the first stage should not quietly harden into the permanent architecture just because it works.

## 4. Stage 1: One-Off Stripe Intake To Gift Staging

### Goal

Prove that a real Stripe donation can enter the fundraising app through a Twenty-app-owned integration path and create a reviewable `giftStaging` record with the correct source/provider evidence.

### Product outcome

- a one-off Stripe donation appears in the staging workflow,
- staff can review it through the same active-work model as other lower-trust intake,
- and Stripe becomes a first-class staged intake channel rather than a special-case side path.

### Capability we are trying to prove in Twenty apps

- provider webhook handling or equivalent provider-triggered intake can live inside the Twenty app boundary,
- signature-validated event ingestion is viable in the released toolchain,
- and the app can persist the required staging facts without depending on fundraising-service-owned endpoints.

### Initial scope

- Stripe test-mode account
- Stripe CLI for local forwarding and event replay
- `checkout.session.completed` as the first event in scope for one-off donation success
- creation of a `giftStaging` record only

### Expected object writes

- create `giftStaging`

Expected first-slice evidence on the staged row:

- `intakeSource`
- `externalId`
- `sourceFingerprint`
- provider identity and provider payment reference
- donor evidence available from the Stripe event
- amount and gift date
- only lightweight durable facts that clearly earn their place in `giftStaging`

Current Stage 1 working read:

- `externalId` should identify the Stripe checkout session for the donation-level record we are staging
- `sourceFingerprint` should support replay-safe event handling for the first webhook slice
- `providerPaymentId` should capture the Stripe payment reference if one exists on the event
- richer provider context should be treated cautiously until we prove it is truly needed as durable metadata rather than just convenient debug state

### Explicitly deferred

- direct commit from Stripe
- recurring agreement creation/update
- recurring success events such as `invoice.payment_succeeded`
- recurring fulfillment events
- failure/refund lifecycle
- payout/reconciliation behavior
- full webhook/intake-event log object unless Stage 1 proves it is immediately necessary

### Validation posture

Use a dedicated Stripe test account and Stripe CLI-driven local event flow as part of the stage itself, not as an afterthought.

The purpose is not only to test our mapping code. It is also to test whether the real Stripe-to-Twenty-app execution shape is viable in practice.

## 5. Stage 2: Hardened One-Off Stripe Intake

### Goal

Make one-off Stripe staging trustworthy enough that we are no longer only proving the happy path.

### Product outcome

- Stripe one-off intake is operationally usable for pilot learning,
- retries and duplicate deliveries do not create accidental duplicate staging rows,
- and staff can understand Stripe-origin rows in the staging workspace without raw provider payloads becoming the primary workflow surface.

### Capability we are trying to prove in Twenty apps

- Twenty apps can support a credible idempotent intake path,
- app-local logic can hold the intake policy without needing an external normalization layer,
- and we can add enough auditability for support/debugging without prematurely building a separate integration platform.

### Scope expansion

- idempotency rules for one-off Stripe events
- replay-safe handling
- clearer provider/source evidence on staging rows
- error handling and operator-visible failure posture
- validation of whether Stage 1 needs a first-class intake-event record or whether staged-row evidence remains sufficient for now

### Expected object writes

- create or upsert `giftStaging`
- optional lightweight intake/audit object only if needed to keep the model correct

### Explicitly deferred

- recurring subscription lifecycle
- delinquency/recovery handling
- refunds and disputes
- donor self-serve portal behavior

## 6. Stage 3: Stripe Recurring Fulfillment Into The App Model

### Goal

Add the first real recurring Stripe fulfillment path without pretending that all recurring lifecycle questions are solved at once.

### Product outcome

- recurring Stripe payments with a confident existing `RecurringAgreement` match create committed gifts linked to that agreement,
- unmatched or ambiguous recurring-related intake remains review-led rather than auto-promoted,
- and recurring agreement expectation state remains coherent enough for operators to trust it.

### Capability we are trying to prove in Twenty apps

- the app can coordinate provider-linked gift staging and recurring-agreement updates together,
- recurring fulfillment does not automatically require an external runtime,
- and the app can carry the core recurring commitment/fulfillment model inside Twenty objects and logic functions.

### Scope expansion

- recurring Stripe success events that represent actual fulfillment
- agreement lookup/linking rules for confident existing agreement matches
- direct committed-gift creation for confident existing recurring fulfillment
- update of `RecurringAgreement.nextExpectedAt` and related recurring-core state where appropriate
- review-led staged handling for unmatched Stripe subscription-backed fulfillment, without auto-promoting to a recurring agreement
- continued caution around weaker or ambiguous recurring evidence until the reviewer action is designed

### Expected object writes

- create `gift` for confident existing agreement matches
- update `recurringAgreement` after fulfilled gift creation
- create or update `giftStaging` only for unmatched, ambiguous, or hard-stop review cases

### Important guardrail

This stage should preserve the recurring-core model, not reintroduce Stripe-specific behavior as product truth.

The recurring agreement remains the CRM commitment/expectation layer.
Stripe events are provider evidence and fulfillment triggers, not the conceptual owner of the recurring product model.

Confident existing agreement matches should not be forced through staging just because one-off Stripe intake starts there.
Staging is reserved for uncertainty and review, not as the default path for recurring fulfillment that the CRM can already anchor safely.

### Explicitly deferred

- failure/dunning parity
- cancellations and schedule amendments
- refunds/disputes
- complete recurring provider-sync surface

## 7. Stage 4: Stripe Recurring Lifecycle And Exception Handling

### Goal

Handle the recurring events that make the system operationally credible beyond the success path.

### Product outcome

- failed payments, recovery, cancellation, and provider-driven status changes update recurring state coherently,
- operators can understand when a recurring issue is merely late provider behavior versus a real recurring-integrity problem,
- and the app starts to prove whether Twenty apps can hold the full recurring operations loop rather than only the fulfillment slice.

### Capability we are trying to prove in Twenty apps

- more complex recurring state transitions can still be held inside app-local orchestration,
- event-driven recurring integrity does not automatically force a service boundary,
- and operator-facing recurring health can be derived and surfaced from app-owned metadata plus provider evidence.

### Scope expansion

- payment failure events
- payment recovery/success-after-failure
- subscription pause/cancel/update events where relevant
- recurring agreement status transitions such as `ACTIVE`, `DELINQUENT`, `CANCELED`
- exception surfacing and recurring-integrity checks

### Expected object writes

- create or update `giftStaging`
- update `recurringAgreement`
- optional exception/audit records if needed by the workflow

### Explicitly deferred

- full donor self-serve recurring management
- full finance reconciliation workflow
- broad payout ingestion beyond targeted Stripe proof work
- advanced receipting policy

### Stretch opportunity within this stage

If Stage 4 recurring/event handling is proving strong inside Twenty apps, this is also a credible point to test an adjacent Stripe opportunity:

- representing Stripe payouts as `giftPayout` records and linking Stripe-origin gifts or staged gifts into the early reconciliation model.

Why here:

- by this point we should already have richer Stripe provider evidence, recurring/event handling, and a better sense of whether app-local orchestration is holding up;
- payout representation is not just "more intake", it starts to test a broader operational loop that connects provider data, staged gifts, committed gifts, and finance review;
- and it is exactly the kind of further opportunity we do not want to miss just because the first donation-intake slice happened to work.

This should be treated as a stretch capability test, not a requirement to finish the whole reconciliation feature during Stage 4.

The narrower question to test is:

- can the app represent Stripe payout/deposit truth through `giftPayout` well enough that later reconciliation work has a credible Twenty-app-native foundation?

## 8. Stage 5: Broader Stripe Operational Depth

### Goal

Test the next layer of product potential without treating it as guaranteed part of the first pilot cut.

Possible candidates:

- refunds/disputes
- Stripe payout ingestion and `giftPayout` creation
- payout and reconciliation linkage
- richer provider audit/event history
- recurring self-serve flows
- receipt triggers tied to authoritative Stripe/commit success

This stage is intentionally open-ended because the right next expansion depends on what we learn from the earlier stages.

The important rule is:

- Stage 5 should be chosen by product value plus learning value, not just by whatever is easiest after Stage 4.

## 9. Validation And Learning Rules

For Stripe specifically, every stage should include real validation with:

- a dedicated Stripe test account,
- Stripe CLI-driven local forwarding and replay,
- a small fixture set of representative one-off and recurring scenarios,
- and explicit notes on what this stage teaches us about Twenty apps.

The Stripe CLI is not just a convenience here.
It is part of the capability-validation method because it lets us:

- forward real webhook traffic locally,
- replay specific events during iteration,
- and exercise retry/idempotency behavior with less guesswork.

If an MCP integration later helps with Stripe setup, fixture creation, or event inspection, that is useful too, but it should support the same staged learning model rather than replace it.

## 10. Decision Rule For Leaving Twenty Apps

We should not move a Stripe concern outside Twenty apps because it is:

- complex,
- inconvenient,
- or traditionally service-shaped.

We should only seriously consider moving a concern outside Twenty apps when a stage gives concrete evidence that:

- the released Twenty app/runtime surface cannot support the required execution shape cleanly,
- the workaround would materially weaken product boundaries or operational safety,
- and the concern is better described as transport/adapter/runtime execution than as app-owned product workflow.

Even then, the burden should be to preserve app-owned product truth and keep any external runtime narrow.

## 11. Relationship To Other Docs

- [PRODUCT_REVIEW.md](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/PRODUCT_REVIEW.md)
  - source for the current target posture that integration intake stages by default and recurring needs deliberate review.
- [PILOT_APP_IMPLEMENTATION_PLAN.md](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/PILOT_APP_IMPLEMENTATION_PLAN.md)
  - source for the phased production-quality posture of the fundraising app.
- [TWENTY_APP_DEV_WORKFLOW.md](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/TWENTY_APP_DEV_WORKFLOW.md)
  - source for how we should validate app behavior in the proper app-dev environment.
- [service-layer-integration-runtime.md](/home/jamesbryant/workspace/dev-stack/docs/spikes/service-layer-integration-runtime.md)
  - exploratory note on when a separate runtime might be justified later, if the app-first path genuinely proves insufficient.

## 12. Current Working Reading

If we summarize this note in one sentence:

- build Stripe inside Twenty apps in capability stages, assume more is worth testing after the first working slice, and only narrow the architecture after we have learned from those stages in practice.
