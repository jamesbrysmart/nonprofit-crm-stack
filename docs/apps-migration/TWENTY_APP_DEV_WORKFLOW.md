# Twenty App Development Workflow

Updated: 2026-05-01
Status: Working note
Purpose: Capture the current repo-local understanding of how Twenty app development should be approached alongside our existing `dev-stack` environment.

This note is intentionally narrow. It does not replace Twenty's official app setup/build docs, and it does not yet try to be a full runbook.

If you need to know where Twenty-native UI, host affordances, commands, variables, or triggers live before building a custom equivalent, use:

- [TWENTY_NATIVE_REFERENCE.md](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/TWENTY_NATIVE_REFERENCE.md)

## 1. Source Of Truth

For app scaffolding, setup, auth, server management, build, and sync flow, use Twenty's official docs as canonical:

- `https://docs.twenty.com/developers/extend/apps/getting-started`
- `https://docs.twenty.com/developers/extend/apps/building`
- `https://docs.twenty.com/developers/contribute/capabilities/local-setup`

This doc records only the repo-local workflow split and the implications for our migration work.

Current local reference point:

- treat the checked-out `services/twenty-core` package versions as the local source of truth for the current SDK/tooling line under review, rather than hardcoding a version in this note
- split imports (`twenty-sdk/define`, `twenty-sdk/front-component`, `twenty-sdk/ui`) should be treated as the current native app surface in source
- `services/fundraising-service/scripts/setup-schema.mjs` should still be treated as a useful reference for fundraising metadata intent and field naming, but not as the source of truth for Twenty app metadata shape or current app-scaffold conventions

## 2. Environment Split

We currently need to treat two local environments as doing different jobs.

### Twenty app-dev environment

Use this for:

- `yarn twenty dev`
- app registration / development application creation
- front-component development
- workflow-shape spikes inside Twenty apps

This environment must satisfy Twenty's app-dev expectations, including a Twenty server running in development or test mode.

Treat Twenty's official getting-started doc as canonical for app-dev server commands:

- `https://docs.twenty.com/developers/extend/apps/getting-started`

Repo-local clarification:

- the `localhost:2020` app-dev runtime is managed by the Twenty SDK CLI, not by this repo's `docker-compose.yml`
- the `TAG` variable in the root `.env` controls the integrated `twentycrm/twenty:${TAG}` Compose runtime, not the SDK-managed `twenty-app-dev` container
- if `yarn twenty server start` reuses an existing stale app-dev container after the SDK/tooling has moved forward, prefer the official stop/start flow first, then use the narrow non-destructive recovery of removing only the stopped app-dev container and starting again from the current app folder
- avoid `yarn twenty server reset` unless wiping app-dev data/volumes is intentional

### `dev-stack` integrated environment

Use this for:

- gateway behavior
- fundraising-service integration
- metadata scripts and local stack wiring
- broader system and pilot validation

This environment should not be assumed to be a valid target for Twenty app dev sync.

## 3. Upgrade Posture

Treat app upgrades as three separate concerns, because they do not move together automatically:

- app package upgrade
  - the app's `twenty-sdk` / `twenty-client-sdk` dependency versions and lockfile
- app-dev runtime upgrade
  - the local `twenty-app-dev` server image/container version managed by the Twenty CLI
- workspace app sync / upgrade
  - the actual installed app in the `localhost:2020` workspace and the behavior it exposes after sync

Why this matters:

- updating `package.json` alone does not prove the local app-dev server is running the intended version
- pulling a Docker image alone does not prove the existing container was recreated from that image
- a recreated server alone does not prove the app was re-synced successfully or that the target runtime behavior changed in practice

Repo-local rule:

- prefer Twenty's documented CLI/server flow for app-dev upgrades rather than hand-rolling Docker steps
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
2. Bring work back into `dev-stack` only when we need integration or broader system validation.

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

- The existing `dev-stack` Docker setup remains the right default for integrated local work.
- The official Twenty app-dev flow should be treated as the right default for Twenty app development.
- Full contributor/source setup is likely only needed when we have to inspect or debug Twenty itself, rather than just build against the supported app workflow.
- For upgrades, the smallest durable repo-local proof should usually include:
  - package version state,
  - app-dev server version state,
  - a successful app sync,
  - and one targeted behavior check for the thing the upgrade was meant to unlock.

## 7. Open Questions

These still need practical verification:

- how cleanly the official app-dev server flow works in our day-to-day environment,
- how much app work can remain isolated before it needs integration back into `dev-stack`,
- and what the smallest durable repo-local upgrade checklist should be once this workflow settles.

## 8. Current Observations

These are early working observations, not fixed rules.

- The minimal official scaffold has now synced successfully against the app-dev environment on `http://localhost:2020`.
- This is the first clean confirmation that the app-dev environment split is operationally real, not just a documentation distinction.
- The published example apps (`hello-world`, `postcard`) introduced additional scaffold/example drift during testing, so they are currently a weaker baseline for migration spikes than a minimal scaffold.
- The `http://localhost:2020` app-dev workspace should be treated as its own metadata world. Objects and relations available in the integrated/local workspace on `http://localhost:3000` do not exist there unless the app creates them.
- Iterating on app-owned metadata is not just a code-authoring problem; it also has a manifest-identity lifecycle. In practice, synced `views`, `viewFields`, page-layout widgets, and similar entities need stable `universalIdentifier` discipline across revisions.
- The most common symptom so far is `INVALID_VIEW_DATA` during `yarn twenty dev`, typically because a changed manifest tries to recreate a field/widget that already exists in the workspace under an earlier stable identity.
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
  - `global-setup.ts` running `appDevOnce`,
  - and assertions through `MetadataApiClient`, `CoreApiClient`, and app routes.
- Current cost/risk: even focused `yarn vitest run <single-file>` executions can perform a full app uninstall/dev-sync/uninstall cycle. During the earlier Stripe SDK upgrade check, this path exited once with code `137` and then crashed the terminal/session on retry, so treat it as a heavier integration validation step rather than a cheap default check.
- The scaffold/example guidance is shallow by default, so product apps should expect to add stronger route/workflow integration tests rather than relying only on install/schema checks.
- Application/server variables look useful for:
  - feature visibility,
  - runtime behavior,
  - route/action enablement,
  - and capability toggles such as Gift Aid.
- Variables are not yet proven as the right mechanism for conditional metadata provisioning. Current working assumption: metadata should stay static per app version, while variables control visibility/behavior.
- The source tree now clearly shows a real native Twenty UI layer (`twenty-ui`) that front components can target through `twenty-sdk/ui`; treat this as the intended native path for host-consistent controls, layout, and theming.
- The remaining caution is no longer “apps are alpha,” but simple release verification: confirm exact runtime behavior in the scaffolded app/toolchain you are actively building against before broad adoption.
- For now, the safest practical starting point for Twenty app spikes is:
  - minimal official scaffold,
  - official app-dev server flow,
  - then incremental addition of the spike-specific workflow surface.
- Twenty appears to assume a `scaffold first, then customize` workflow more strongly than our early spike process did:
  - `create-twenty-app` generates initial universal identifiers into source,
  - `yarn twenty add ...` generates stable IDs for new top-level entities such as objects, views, navigation items, logic functions, front components, roles, and page layouts,
  - and those IDs are then expected to remain stable in source rather than being assigned by the server at sync time.
- Practical implication:
  - prefer Twenty scaffolding commands for creating new top-level metadata entities,
  - then customize the generated files,
  - and avoid freehand creation of new metadata files where the CLI can scaffold them.
- This does not remove the need for metadata discipline later:
  - view fields, layout widgets, relation pairs, and other nested metadata still have an identity lifecycle,
  - so `twenty add` reduces creation-time risk but does not replace careful migration/edit discipline after sync.
- Caution as the app grows:
  - even when scaffolding first, metadata changes appear safer when introduced in small, coherent groups rather than large mixed batches,
  - existing `universalIdentifier`s should be treated as stable assets and only changed with intent,
  - and when sync failures are ambiguous, it is usually better to isolate by metadata slice before touching IDs.
