This is the nonprofit fundraising application for [Twenty](https://twenty.com).

## Getting Started

Use the standalone `twenty` CLI from this app directory. Check the executable
and version with:

```bash
twenty --version
twenty --help
```

See the [app workflow guide](../../../docs/apps-migration/TWENTY_APP_DEV_WORKFLOW.md)
for the CLI baseline, connections, plan/apply/dev and server management.

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

Use the [fundraising testing strategy](../../../docs/TESTING.md) to choose
checks. Run these commands from this app directory.

- `yarn lint` checks the app with Oxlint.
- `yarn typecheck` checks application and test sources without emitting files.
- `yarn test:unit` runs the offline suite. Append a test path to focus the run.
- `twenty app typecheck` and `twenty app build` check local CLI tooling and bundling.

### Check an installed app

Use Twenty's CLI to query records and call the installed app's HTTP routes.
Select the intended saved remote explicitly. For example, confirm the
workspace and app on the `fundraising-local` remote with:

```bash
twenty api graphql --remote fundraising-local --metadata --no-input \
  --query '{ currentWorkspace { id } findManyApplications { name universalIdentifier } }'
```

Use `twenty api rest` for app routes on that instance and `twenty api graphql`
to read back the outcome. For a write check, create clearly labelled fixture
records with unique references and scope every subsequent call to those
records. Check the route's side effects first. For example, claimable Gift Aid
can attach to the current shared draft, so exercise that workflow in isolation.
Record any fixtures left behind and the app revision if known.

### Disposable integration suite

**`yarn test` and `yarn test:watch` use destructive integration setup, even
when focused on one file.** Setup uninstalls the app and deletes its data,
then runs `twenty app apply --create`. Teardown uninstalls the app again.
Use only an approved disposable workspace.

Use isolated runs to verify clean installs, post-install behaviour and the
uninstall lifecycle. Use a separate populated rehearsal for a forward upgrade.

Set `TWENTY_INTEGRATION_API_URL` and `TWENTY_INTEGRATION_API_KEY` for that
target. The current harness requires explicit credentials and relies on the
operator to verify that the workspace is disposable. Generic
`TWENTY_API_URL` and `TWENTY_API_KEY` are ignored as inputs. Unset
`TWENTY_REMOTE` to avoid conflicting target selection. The harness uses the
standalone CLI on `PATH` or the absolute executable path set in `TWENTY_CLI`.
See the [hardening backlog](../../../docs/apps-migration/APP_HARDENING_BACKLOG.md#deferred-integration-lifecycle-validation)
for runtime validation status.

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
