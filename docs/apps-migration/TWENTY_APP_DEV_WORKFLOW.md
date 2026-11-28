# Twenty App Development Workflow

Updated: 2026-11-22
Status: Working note
Purpose: Define the repo-local standalone CLI workflow and distinguish app tooling, server management and workspace validation.

This note is intentionally narrow. It does not replace Twenty's official app setup/build docs, and it does not yet try to be a full runbook.

If you need to know where Twenty-native UI, host affordances, commands, variables, or triggers live before building a custom equivalent, use:

- [TWENTY_NATIVE_REFERENCE.md](TWENTY_NATIVE_REFERENCE.md)

## 1. Source Of Truth

Verify app scaffolding, authentication, build and sync against the checked-out
standalone CLI and official docs:

- [CLI README](../../services/twenty-core/packages/twenty-cli/README.md)
- [CLI commands](../../services/twenty-core/packages/twenty-cli/docs/commands.md)
- [Local-server guidance](../../services/twenty-core/packages/twenty-docs/developers/extend/apps/getting-started/local-server.mdx)

This doc records only the repo-local workflow split and the implications for our migration work.

Current local reference point:

- treat the checked-out `services/twenty-core` package versions as the local source of truth for the current SDK/tooling line under review, rather than hardcoding a version in this note
- use `twenty-sdk/define` and `twenty-sdk/front-component` for SDK imports; native UI primitives now come directly from `twenty-ui` subpaths because `twenty-sdk/ui` has been removed
- `services/fundraising-service/scripts/setup-schema.mjs` should still be treated as a useful reference for fundraising metadata intent and field naming, but not as the source of truth for Twenty app metadata shape or current app-scaffold conventions

### Command And Connection Baseline

Use the global standalone executable directly. Earlier CLI-migration evidence
used `2.49.0`. On 27 November the global executable reported `2.61.0`.
The app pins SDK/client/UI `2.59.0` and declares Twenty `>=2.59.0`.
Check the target server version separately before an installed-app check.

```bash
twenty --version
twenty --help
twenty app typecheck
twenty app build
```

Use direct `twenty` commands for this repo's standalone workflow. The earlier
Yarn-shadowing warning applied to SDK `2.45.0`; SDK `2.59.0` no longer ships
that legacy executable. The retained package script does not install or pin
the standalone CLI; inspect its version separately.

For workspace operations, choose an explicit saved remote rather than changing
the default. These commands are examples for an approved test target, not
instructions to use the currently occupied local workspace:

```bash
twenty auth login --url http://localhost:2020 --name local
twenty auth status --remote local
twenty app plan --remote local
twenty app apply --create --remote local
twenty app dev --remote local
```

`auth login` saves credentials; `app plan` previews without applying; `app apply`
and `app dev` change the workspace. Missing definitions imply deletions by
default, so inspect the plan, identifiers and layout changes before applying.
Only use `--create` when registration/installation is intended.

Automation can instead supply `TWENTY_API_URL` and `TWENTY_API_KEY`; do not mix
those with `TWENTY_REMOTE`. `--remote` explicitly selects a saved connection
instead of environment credentials. Never assume localhost or a default remote
identifies the intended workspace without checking.

`app build` validates a temporary snapshot and discards it; it does not leave
a deployable release tarball. Release packaging/publication remains a separate,
approved operation under the [deployment runbook](APP_DEPLOYMENT_RUNBOOK.md).
Do not treat build success as publication or install verification.

## 2. Environment Split

App authoring and server operation are separate concerns.

### Twenty app-dev environment

Use this for:

- `twenty app plan`, `twenty app apply` and `twenty app dev`
- app registration / development application creation
- front-component development
- workflow-shape spikes inside Twenty apps

Use a server that supports the intended development flow. The installed
standalone CLI `2.61.0` exposes `twenty local
start|status|logs|stop|upgrade|reset`, including an isolated `--test` instance.
Only version/help output was checked: no Docker operation or compatibility
validation has been performed here. The earlier app-validation CLI `2.49.0`
did not manage Docker. See the
[extensibility watch](../TWENTY_EXTENSIBILITY_WATCH.md) for version boundaries.
Standard self-hosting remains an alternative; `services/twenty-core` stays
reference-only rather than becoming our runtime.

Our existing `localhost:2020` container was created through the legacy SDK
tooling. Leave it in place: it is currently used for another app. This
migration does not recreate, upgrade or reset it. When dedicated runtime work
resumes, review the released local-command behavior or an explicit self-hosted
configuration separately. Do not assume it inherits the old SDK's start/reset
semantics or run it against the occupied server merely to test command names.

The root Compose `TAG` concerns the legacy integrated runtime, not that
existing container. Do not repoint Compose or reuse its volumes as part of
this CLI migration. Any destructive operation requires separate approval.

### `dev-stack` integrated environment

Use this for:

- gateway behavior
- fundraising-service integration
- metadata scripts and local stack wiring
- legacy hybrid-runtime validation only when explicitly requested

This is not the default fundraising runtime or a disposable integration-test
target. See the legacy operations runbook only when working on that runtime.

## 3. Upgrade Posture

Treat app upgrades as three separate concerns, because they do not move together automatically:

- app package upgrade
  - the app's `twenty-sdk` / `twenty-client-sdk` dependency versions and lockfile
- app-dev runtime upgrade
  - the independently managed server image/container and database version
- workspace app sync / upgrade
  - the actual installed app in the `localhost:2020` workspace and the behavior it exposes after sync

Why this matters:

- updating `package.json` alone does not prove the local app-dev server is running the intended version
- pulling a Docker image alone does not prove the existing container was recreated from that image
- a recreated server alone does not prove the app was re-synced successfully or that the target runtime behavior changed in practice

Repo-local rule:

- use the guidance for the installed tooling version; local-upgrade is now exposed by the installed CLI but its Docker/runtime behavior has not been tested here
- avoid treating `docker pull twentycrm/twenty-app-dev:latest` as a sufficient upgrade procedure by itself
- prefer explicit target versions over `latest` when validating behavior or preparing repeatable client-facing guidance

Practical implication:

- use the official Twenty docs/CLI as canonical for the exact commands
- in repo-local notes and session summaries, record separately:
  - the app package version line under test,
  - the app-dev server version reported by the CLI/runtime,
  - and whether the app successfully re-synced and exposed the behavior we were testing

Current caution:

- this upgrade posture should currently be treated as a working process, not yet a fully proven clean-baseline runbook
- in local environments where Docker images or containers may already have been manipulated outside the Twenty CLI flow, treat results as potentially mixed-state until the package state, running server state, and app sync state have each been checked explicitly
- until we have repeated this flow successfully from a clearly known baseline, document upgrade sessions as:
  - docs-aligned,
  - preferred,
  - but not yet fully confirmed as the final repeatable client-environment process

## 4. Working Default

Current working default:

1. Develop and pressure-test Twenty app workflow shape in the app-dev environment.
2. Keep app code and tests app-local; use Twenty core as a read-only reference.
3. Use the old integrated runtime only for explicitly requested legacy work.

This keeps workflow-shape questions separate from self-host/integration questions.

### Spike Discipline

For migration spikes whose purpose is to test **what Twenty apps itself can support**, stay inside the Twenty app/runtime boundary by default:

- prefer app-owned metadata, front components, command surfaces, and app logic functions,
- prefer Twenty-native object/API interactions where they can answer the product question,
- do **not** call back into `fundraising-service`, gateway routes, or other hybrid repo services unless that hybrid boundary is the explicit thing being tested.

If a proposed implementation would cross out of the Twenty app runtime into an existing repo service, that should be surfaced and agreed explicitly before building it.

## 5. Why This Split Matters

We hit a real boundary while testing app sync:

- authentication against our local Twenty server could succeed,
- but `createDevelopmentApplication` was rejected unless the target server satisfied Twenty's development/test guard.

That means "local Twenty is running" is not enough. The relevant question is whether it is the right kind of local environment for the app-dev flow.

## 6. Current Practical Reading

- The standalone CLI and app-local tests are the default for Twenty app development.
- Server lifecycle management is separate; the current occupied local server is not part of this migration.
- Full contributor/source setup is not required to author apps and is not the chosen runtime for this reference checkout.
- For upgrades, the smallest durable repo-local proof should usually include:
  - package version state,
  - app-dev server version state,
  - a successful app sync,
  - and one targeted behavior check for the thing the upgrade was meant to unlock.

## 7. Open Questions

These still need practical verification:

- the migrated integration lifecycle against a disposable test workspace; deliberately deferred while another app uses the local server, as tracked in the [hardening backlog](APP_HARDENING_BACKLOG.md#deferred-integration-lifecycle-validation)
- the next SDK/runtime combination and its metadata plan before any apply or release
- separately reviewed server management before replacing the existing legacy-created container; the installed CLI's `local start --test` path may provide isolation without repurposing that workspace, but has not been exercised
- activation of real monorepo CI, if wanted; the app's nested workflows are inactive reference templates, not deployed automation

## 8. Current Observations

These are early working observations, not fixed rules.

- The minimal official scaffold has now synced successfully against the app-dev environment on `http://localhost:2020`.
- This is the first clean confirmation that the app-dev environment split is operationally real, not just a documentation distinction.
- The published example apps (`hello-world`, `postcard`) introduced additional scaffold/example drift during testing, so they are currently a weaker baseline for migration spikes than a minimal scaffold.
- The `http://localhost:2020` app-dev workspace should be treated as its own metadata world. Objects and relations available in the integrated/local workspace on `http://localhost:3000` do not exist there unless the app creates them.
- Iterating on app-owned metadata is not just a code-authoring problem; it also has a manifest-identity lifecycle. In practice, synced `views`, `viewFields`, page-layout widgets, and similar entities need stable `universalIdentifier` discipline across revisions.
- A historical symptom was `INVALID_VIEW_DATA` during legacy dev sync, typically because a changed manifest tried to recreate a field/widget that already existed in the workspace under an earlier stable identity. This remains an identity warning, not a reason to retain the old command.
- Practical implication for spikes: treat object/field IDs as durable, and be especially careful when reshaping views/layouts after they have already synced. Additive change or a clean rebuild is often safer than reusing/remapping existing manifest IDs mid-spike.
- Manual gift entry has now been proven at a narrow but meaningful level inside Twenty apps:
  - global command -> side-panel flow,
  - donor duplicate interruption via app route/function,
  - explicit donor choice,
  - direct `person` / app-owned `gift` creation in the `2020` workspace.
- The important constraint behind that proof is metadata-first: the gift slice only worked once the app itself created the minimal fundraising metadata needed in the app-dev workspace, rather than assuming the `3000` workspace schema was already present.
- Twenty’s default testing shape is now clearer:
  - Vitest,
  - real app-server integration,
  - `global-setup.ts` using the standalone CLI for uninstall / `app apply --create` / uninstall, with environment-provided test credentials rather than writing a CLI config file (fundraising harness migrated 2026-10-26),
  - and assertions through `MetadataApiClient`, `CoreApiClient`, and app routes.
- Current cost/risk: even focused `yarn vitest run <single-file>` executions using the integration config can perform a full app uninstall/apply/uninstall cycle, deleting app data. Use only a disposable test workspace; see the [app validation instructions](../../apps/fundraising/nonprofit-fundraising/README.md#local-validation). During the earlier Stripe SDK upgrade check, the old harness exited once with code `137` and then crashed the terminal/session on retry, so treat this as a heavier integration validation step rather than a cheap default check.
- The scaffold/example guidance is shallow by default, so product apps should expect to add stronger route/workflow integration tests rather than relying only on install/schema checks.
- Application/server variables look useful for:
  - feature visibility,
  - runtime behavior,
  - route/action enablement,
  - and capability toggles such as Gift Aid.
- Variables are not yet proven as the right mechanism for conditional metadata provisioning. Current working assumption: metadata should stay static per app version, while variables control visibility/behavior.
- The source tree now clearly shows a real native Twenty UI layer (`twenty-ui`) that front components import directly through package subpaths; treat this as the intended native path for host-consistent controls, layout, and theming.
- The remaining caution is no longer “apps are alpha,” but simple release verification: confirm exact runtime behavior in the scaffolded app/toolchain you are actively building against before broad adoption.
- Raw app `yarn typecheck` should stay part of the local development loop for app-touching work.
- Current repo-local understanding:
  - app-owned type drift can be reduced materially with local cleanup,
  - and the fundraising app should keep its proven app-local button primitive until direct `twenty-ui` imports are deliberately tested against the exact runtime and SDK combination being deployed.
- Practical implication:
  - keep running raw `yarn typecheck`,
  - do not replace it with a filtered or custom-ignore variant,
  - and re-test direct `twenty-ui` adoption on future SDK/tooling upgrades rather than assuming earlier front-component results still apply.
- For now, the safest practical starting point for Twenty app spikes is:
  - minimal official scaffold,
  - official app-dev server flow,
  - then incremental addition of the spike-specific workflow surface.
- Twenty appears to assume a `scaffold first, then customize` workflow more strongly than our early spike process did:
  - `twenty app init` generates initial universal identifiers into source,
  - `twenty app add ...` generates stable IDs for new top-level entities such as objects, views, navigation items, logic functions, front components, roles, and page layouts,
  - and those IDs are then expected to remain stable in source rather than being assigned by the server at sync time.
- Practical implication:
  - prefer Twenty scaffolding commands for creating new top-level metadata entities,
  - then customize the generated files,
  - and avoid freehand creation of new metadata files where the CLI can scaffold them.
- This does not remove the need for metadata discipline later:
  - view fields, layout widgets, relation pairs, and other nested metadata still have an identity lifecycle,
  - so `twenty app add` reduces creation-time risk but does not replace careful migration/edit discipline after sync.
- Caution as the app grows:
  - even when scaffolding first, metadata changes appear safer when introduced in small, coherent groups rather than large mixed batches,
  - existing `universalIdentifier`s should be treated as stable assets and only changed with intent,
  - and when sync failures are ambiguous, it is usually better to isolate by metadata slice before touching IDs.

## 9. Cross-app Lessons from Gift Aid

The Gift Aid rehearsal used Twenty 2.59.2, SDK 2.59.0 and CLI 2.61.0.
Use its [setup and validation notes](../../apps/fundraising/gift-aid/SETUP.md)
for the app-specific details.

- Install the app that owns the base metadata first. Keep its shared object,
  field and view IDs stable. Gift Aid reads committed capture evidence on
  Fundraising's Gift, listens to Gift events and owns its derived records and
  relationships. Use `twenty app plan` to check deletions before changing
  ownership, then test core alone and the installed pair in that order.
- Regenerate the typed client for each installed app. The application-scoped
  client could read Gift and Person, but its Person type omitted Fundraising's
  custom mailing address. The extension reads that field through the SDK's
  workspace REST client only when building a submission snapshot.
- Check app roles on the target Twenty version. In the rehearsal, creating a
  declaration required update permission on that extension-owned object
  because Twenty used update permissions when separate create permissions
  were off. Verify real record events, persisted outcomes and expected
  refusals with small fixtures.
- Use the available native layout surfaces. Gift Aid contributes standalone
  view fields to the existing Gift Details view and a relation table to
  the standard Person layout. It owns the claim layout and action widget.
  Treat adding a new tab to another app's record page as a separate platform
  capability to verify.
