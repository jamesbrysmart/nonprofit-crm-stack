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

## Current Limitation

On the current Twenty app-dev upgrade line under test, secret
`applicationVariables` appear to break app settings loading and logic-function
startup before values can be entered in the UI.

As a temporary local workaround, the app-level secret variables for:

- `STRIPE_WEBHOOK_SECRET`
- `HMRC_CHARITIES_CONFIG_JSON`

have been removed from the manifest. Until that upstream issue is resolved,
expect Stripe webhook verification and HMRC submission/config-driven Gift Aid
flows to remain unavailable in this app-dev setup.

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
