This is a [Twenty](https://twenty.com) application bootstrapped with [`create-twenty-app`](https://www.npmjs.com/package/create-twenty-app).

## Getting Started

Run `yarn twenty help` to list all available commands.

## Local Conventions

This app is being built as phased production-quality code for the pilot, not as a throwaway MVP.

Current structural conventions:

- app-level identifiers live in `src/constants/`,
- roles live in `src/roles/`,
- shared integration-test helpers live in `src/__tests__/`,
- future product slices should add domain code under dedicated feature folders rather than pushing logic into front components directly.

Planned first slices:

1. narrow app foundation
2. manual gift entry
3. staging/review
4. bounded batch processing
5. Gift Aid

Current capability note:

- `GIFT_AID_ENABLED` is modeled as an application variable.
- The longer-term capability posture is “optional and off by default”, but the current app-dev/pilot build keeps it enabled so the bounded Gift Aid slice can be exercised before a fuller activation flow exists.

## Local Validation

Use `yarn test:unit` for fast TypeScript/domain checks that do not need a running Twenty app-dev server.

Use `yarn test` for Twenty app integration tests. This runs the app-dev sync lifecycle through the test global setup, so treat it as a heavier validation step rather than the default check for pure mapper/router changes.

## Stripe Intake Fixtures

Use this for a lightweight manual check of the trusted internal Stripe intake route without invoking the app-dev integration-test harness:

```bash
yarn stripe:fixtures
```

The script posts representative trusted events to `/s/stripe/intake/handle-event`:

- one-off `checkout.session.completed`,
- recurring `checkout.session.completed` with a seeded matching `recurringAgreement`,
- recurring `checkout.session.completed` without a matching agreement,
- unsupported event type.

This is a local validation helper, not a public Stripe webhook path. It mutates the app-dev workspace by creating fixture records for the matched recurring case and by exercising the one-off/recurring intake paths.

## Local Seed Data

This app includes a small idempotent `post-install` seed for local development.

- It creates a few duplicate-donor scenarios for manual entry.
- It creates a couple of `giftBatch` records.
- It creates a handful of `giftStaging` rows across the main review states we currently support.

Because Twenty does not run post-install automatically in `yarn twenty dev`, trigger it manually when you want a fresh local fixture set:

```bash
yarn twenty exec --postInstall
```

The seed is intended to be safe to rerun as new workflow slices are added.

## Current Configuration Note

The application manifest currently defines both public and secret
`applicationVariables`, including Stripe and HMRC-related settings. Treat
`src/application-config.ts` as the current source of truth for which variables
exist.

If app-dev/runtime behavior around secret variables regresses on a future
Twenty line, record that as a version-specific runtime note rather than
assuming the variables have been removed from the manifest.

## Stripe Local Dev Note

The current working Stripe runtime still depends on real webhook delivery for
payment enrichment.

That means a local donation test is not complete unless Stripe events are being
forwarded to the app-dev webhook route:

```bash
stripe listen --forward-to http://localhost:2020/s/stripe/webhook
```

Without the listener:

- checkout/session creation can still succeed,
- but one-off and recurring payment fields may remain blank because the app
  never receives the follow-up Stripe webhook events.

Current local Stripe variables remain:

- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`

Current Stripe connection note:

- a real app-dev Stripe OAuth connection has now been tested successfully
- that makes Twenty Connections worth revisiting later, but not the chosen v1
  path yet
- current working v1 posture remains:
  - `STRIPE_SECRET_KEY`
  - `STRIPE_PUBLISHABLE_KEY`
  - `STRIPE_WEBHOOK_SECRET`
- keep local env/app-variable Stripe config in place for now
- revisit Stripe OAuth/Connections once the Twenty app connection surface has
  matured further and exposes a clearer Stripe-specific account model

## CRM Demo Seed

For stakeholder demos that need standard Twenty CRM records alongside the
fundraising app data, there is a separate idempotent seed logic function:

```bash
yarn twenty exec --functionName seed-plunkett-demo
```

This creates a small fictional set of:

- companies,
- linked contacts,
- opportunities across corporate partnerships, grants, and major gifts.

It is intentionally separate from `post-install` so normal app-dev fixture runs
do not always add CRM demo records.

Before adding a custom UI, command flow, trigger pattern, or config model, check the repo reference notes in:

- `docs/apps-migration/TWENTY_NATIVE_REFERENCE.md`
- `docs/apps-migration/PILOT_APP_IMPLEMENTATION_PLAN.md`

## Learn More

- [Twenty Apps documentation](https://docs.twenty.com/developers/extend/apps/getting-started)
- [twenty-sdk CLI reference](https://www.npmjs.com/package/twenty-sdk)
- [Discord](https://discord.gg/cx5n4Jzs57)
