This is the nonprofit fundraising application for [Twenty](https://twenty.com).

## Getting Started

Use the globally installed standalone `twenty` CLI, separately from the app's
SDK dependencies. Our locally checked CLI baseline is `2.49.0`:

```bash
npm install -g twenty@2.49.0
twenty --version
twenty --help
```

Run app commands directly, not through `yarn twenty`: the installed SDK
`2.45.0` still exposes a legacy binary that Yarn can select instead. The
retained `twenty` package script matches the scaffold but is not the migrated
command entrypoint while that SDK binary remains installed.

From this app directory, `twenty app typecheck` and `twenty app build` are local
checks. For connections, plan/apply/dev, server management and the boundary
between a build snapshot and a release artifact, see the
[app workflow guide](../../../docs/apps-migration/TWENTY_APP_DEV_WORKFLOW.md).
CLI `2.49.0` does not start or upgrade Docker containers. Current upstream main
is restoring local-server commands for a later release; check the workflow
guide's version boundary before using them.

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

Use `yarn typecheck` to check application source and tests together through
`tsconfig.spec.json`, without emitting JavaScript or declarations. The root
configuration follows Twenty's scaffold module resolution and target, with
ES2021 library definitions for the app's existing `String.replaceAll()` usage.

Use `yarn test:unit` for fast TypeScript/domain checks that do not need a running Twenty app-dev server.

Use `yarn test` only against a disposable Twenty test workspace. The global
setup uninstalls the app and its data, runs `twenty app apply --create`, and
uninstalls again during teardown. Never point this suite at Imara or another
workspace whose app data must be preserved.

The harness uses the globally installed standalone Twenty CLI, not the SDK's
bundled binary. Check `twenty --version` outside Yarn, or set `TWENTY_CLI` to
the standalone executable's absolute path. The suite only runs against a
target set explicitly in `TWENTY_INTEGRATION_API_URL` and
`TWENTY_INTEGRATION_API_KEY`; there is no default workspace, and generic
`TWENTY_API_URL` / `TWENTY_API_KEY` values are ignored. Unset `TWENTY_REMOTE`
to avoid conflicting target selection. No saved remote is changed and no
`~/.twenty/config.test.json` is written.

Lifecycle and subprocess unit tests use mocked commands or temporary fake
executables, so `yarn test:unit` does not install or uninstall the app.

The real migrated lifecycle is currently unverified and deferred while the
local workspace is being used for another app. Track resumption in the
[hardening backlog](../../../docs/apps-migration/APP_HARDENING_BACKLOG.md#deferred-integration-lifecycle-validation).

## Stripe Intake Fixtures

Use this for a lightweight manual check of the trusted internal Stripe intake
route without invoking the integration-test harness. Set `TWENTY_API_URL` and
`TWENTY_API_KEY` explicitly for the intended disposable workspace first:

```bash
yarn stripe:fixtures
```

The script posts representative trusted events to `/s/stripe/intake/handle-event`:

- one-off `checkout.session.completed`,
- recurring `checkout.session.completed` with a seeded matching `recurringAgreement`,
- recurring `checkout.session.completed` without a matching agreement,
- unsupported event type.

This is a local validation helper, not a public Stripe webhook path. It mutates the app-dev workspace by creating fixture records for the matched recurring case and by exercising the one-off/recurring intake paths.

It does not read saved CLI remotes or credential files. Signing in with the
CLI does not configure this script; provide the two environment variables.

## Local Seed Data

This app includes a small idempotent `post-install` seed for local development.

- It creates a few duplicate-donor scenarios for manual entry.
- It creates a couple of `giftBatch` records.
- It creates a handful of `giftStaging` rows across the main review states we currently support.

To invoke the deployed seed hook explicitly when you want local fixtures:

```bash
twenty app exec --post-install --remote local
```

The seed is intended to be safe to rerun as new workflow slices are added.
These `app exec` commands require browser sign-in and Twenty 2.46 or later.
Check `twenty auth status --remote local` first; `local` must refer to the
intended test workspace. Do not seed the workspace currently testing another
app.

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
twenty app exec --name seed-plunkett-demo --remote local
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
- [Standalone CLI reference](../../../services/twenty-core/packages/twenty-cli/docs/commands.md)
- [Discord](https://discord.gg/cx5n4Jzs57)

The app-local `.github/workflows` files are inactive reference templates in
this monorepo. CI installs a pinned standalone CLI; CD is manual-only. Do not
move them to the repository root or enable publication/deployment without a
separate review of paths, target workspace, runtime version and release policy.
