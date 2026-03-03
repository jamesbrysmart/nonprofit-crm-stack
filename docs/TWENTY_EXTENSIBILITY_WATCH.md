# Twenty Extensibility Watch

_Living log of notable changes inside `services/twenty-core` that affect the future partner-module strategy._

## Scope (important)

- This document tracks Twenty’s extensibility surface and our readiness signals.
- It is **not** a migration plan for moving `services/fundraising-service` into Twenty Apps right now.
- Current posture remains aligned with `docs/DECISIONS.md` (`D-0017`, `D-0019`): long-term **app-first** target, current **hybrid** implementation until required UX/ops primitives are stable.

## Cadence & Process

- **Frequency:** every ~2 weeks (or after major Twenty releases).
- **Steps:** `git fetch upstream`, check out `upstream/main`, skim `packages/twenty-apps`, `packages/twenty-cli`, `packages/twenty-sdk`, and related commits; capture highlights and open questions below.
- **Output:** summarize deltas here and bubble any required actions into ADRs/blueprints. The packaging/architecture implications are tracked as a pending ADR in `docs/DECISIONS.md` (D-0019).

## Review Checklist (run on every upstream sync)

1. **Record the baseline**
   - Current submodule head: `git -C services/twenty-core log -1 --oneline`
   - Current image tag (if relevant): check `.env` `TAG=...` and/or release notes.
2. **Fetch + merge upstream**
   - `git -C services/twenty-core fetch upstream`
   - `git -C services/twenty-core merge upstream/main` (or rebase if that’s your policy)
3. **Scan the extensibility-relevant diff**
   - `git -C services/twenty-core diff --name-status ORIG_HEAD..HEAD -- packages/twenty-sdk packages/create-twenty-app packages/twenty-docs/developers/extend packages/twenty-shared/src/application packages/twenty-server/src/engine/core-modules/application packages/twenty-server/src/engine/metadata-modules/logic-function packages/twenty-server/src/modules/workflow`
4. **Answer the “what changed?” questions (capture in the snapshot below)**
   - **CLI surface:** command names, auth/workspace profiles, dev/sync/logs/execute behavior.
   - **Manifest schema:** any additions/renames/breaking changes in `ApplicationManifest` / triggers / roles.
   - **Build pipeline:** new requirements for built artifacts, checksums, output dirs, bundling rules.
   - **UI surface:** any movement on front components / packaged UI / layouts.
   - **Tools/AI:** new “functions as tools” support (schemas, permissions, exposure).
5. **Update project implications**
   - Add/refresh a snapshot in this doc.
   - Review `docs/DECISIONS.md` D-0019 and adjust “pending” posture if a capability becomes reliably available.
   - If the CLI endpoints change (`/metadata` vs `/graphql`/subscriptions), confirm our gateway routing still supports them.

## Weekly Update Mode (lightweight)

When updating this doc in regular syncs, keep it lightweight:

1. Capture upstream delta (new `services/twenty-core` head + date).
2. Update only changed rows in the readiness matrix.
3. Add 2-4 bullet highlights (what materially changed for us).
4. Record only blockers or risk shifts; skip deep design discussion.

## Provisional architecture notes (don’t lock in)

- Treat “Fundraising as an App” as the long-term packaging target, but keep implementation hybrid until Twenty Apps cover required UX + operational primitives (tracked in `docs/DECISIONS.md` D-0019).
- In SaaS, the “edge layer” is still possible: it becomes a vendor-managed multi-tenant service integrating with each workspace via Twenty APIs/webhooks; customers don’t run code.

## Current Extensibility Surface (baseline verified 2026-03-03)

- **twenty-cli** (packages/twenty-cli):
  - Now deprecated in favor of `twenty-sdk` (see `packages/twenty-cli/README.md`).
  - Command name stays `twenty`, but install guidance now points to `npm install -g twenty-sdk`.
- **twenty-sdk** (packages/twenty-sdk):
  - Current package version in-tree: `0.6.0`.
  - CLI commands exposed in README and command registry: `auth:login`, `auth:logout`, `auth:status`, `auth:list`, `auth:switch`, `app:dev`, `app:typecheck`, `app:uninstall`, `entity:add`, `function:logs`, `function:execute`.
  - `app:generate` is no longer part of the CLI command surface; typed client generation is expected via `app:dev` (with `app:typecheck` added for local TS verification).
  - `entity:add` now covers a wider app surface (`object`, `field`, `function`, `front-component`, `role`, `view`, `navigation-menu-item`, `skill`, `page-layout`) with scaffolding support for related UI entities.
  - API split remains explicit in code:
    - `POST /metadata` for app lifecycle/sync operations, logic-function execution, application token operations, and multipart `uploadApplicationFile`.
    - `POST /graphql` for log streaming (`logicFunctionLogs` via SSE) and client schema access / generated client defaults.
- **create-twenty-app** (packages/create-twenty-app):
  - Current package version in-tree: `0.6.0`.
  - Scaffolder now supports `--exhaustive` (default), `--minimal`, and `--interactive` example modes.
  - Scaffolds a single Yarn entrypoint script (`yarn twenty <command>`) instead of many per-command wrappers.
  - Default scaffold now includes a post-install logic function (`src/logic-functions/post-install.ts`) and can generate examples for objects, fields, views, navigation menu items, and skills in addition to logic functions/front components.
  - Template dependency currently uses `twenty-sdk: latest` (watch for docs/runtime drift when reproducing examples across versions).
- **Manifest/build surface (as of current code):**
  - Manifest shape in `packages/twenty-shared/src/application/manifestType.ts` is:
    `application`, `objects`, `fields`, `logicFunctions`, `frontComponents`, `roles`, `skills`, `publicAssets`, `views`, `navigationMenuItems`, `pageLayouts`.
    (Notably, prior `sources` entry is no longer present in this manifest type.)
  - `ApplicationManifest` in `applicationType.ts` now includes optional `postInstallLogicFunctionUniversalIdentifier` and `apiClientChecksum` in addition to `packageJsonChecksum` / `yarnLockChecksum`.
  - Manifest output path remains `.twenty/output/manifest.json`.
  - Build/upload path remains file-oriented (built logic/front-component files, dependencies, and public assets uploaded through `uploadApplicationFile`).
  - Manifest checksum generation now also computes an aggregate API client checksum when generated client artifacts are present.
- **Front component packaging:**
  - Front-component runtime internals were reorganized into `packages/twenty-sdk/src/front-component-renderer/*` (host/remote runtime, generated registries, worker helpers, story examples).
  - `twenty-sdk` now exports `./front-component-renderer` (with `./ui`) rather than the older `./front-component` package entrypoint.
  - Root SDK exports also expanded front-component action/API helpers (`navigate`, `openSidePanelPage`, `enqueueSnackbar`, etc.), indicating a richer packaged UI interaction surface.
- **Tools/AI workflow integration:**
  - `skills` are now first-class app entities in shared manifest types and SDK exports (`defineSkill`), and upstream docs now document skill authoring in the Apps capability guide.
  - Logic functions marked as tools can be surfaced via workflow tools (`list_logic_function_tools`).
  - Workflow tooling now includes updating logic-function source from tool calls (`update_logic_function_source`).
  - Apps docs now also describe post-install logic functions and `function:execute --postInstall`, improving the operational story for one-time app setup tasks.
- **Reference implementations to track:**
  - Upstream: `packages/twenty-apps/hello-world` (minimal end-to-end app surface).
  - In this repo: `apps/core/rollup-engine` (non-trivial app logic already running in our model).
- **Gaps / limitations:**
  - No published marketplace installer yet; everything is still CLI-driven.
  - Docs/examples move quickly and can drift between releases; verify against `packages/twenty-docs` and `packages/twenty-sdk/README.md` after each upstream sync, especially around CLI/scaffolder command names.

---

## Latest Snapshot — 2026-03-03

**Context:** Updated `services/twenty-core` from `e3ab3304e2` to `792c8a3c28` (merge commit on 2026-03-03; upstream parent merged: `2f09fb8c04`).

**Highlights**

1. **SDK + scaffolder moved to `0.6.0` and changed the default app workflow**
   - `twenty-sdk` and `create-twenty-app` both moved to `0.6.0`.
   - CLI surface now uses `app:typecheck` (new) and no longer exposes `app:generate`.
   - Scaffolder guidance now converges on `yarn twenty <command>` and `app:dev` auto-generates the typed client.

2. **App manifest surface expanded beyond the prior baseline**
   - Shared manifest types now include `skills`, `views`, `navigationMenuItems`, and `pageLayouts` as first-class manifest arrays.
   - `ApplicationManifest` adds `postInstallLogicFunctionUniversalIdentifier` and `apiClientChecksum`.
   - This is a meaningful readiness signal for future in-Twenty UI/navigation packaging, but not yet proof of Fundraising UX parity.

3. **Application sync/install plumbing deepened on the server**
   - Application sync code adds broad "universal flat entity" mapping utilities for newly syncable app entities (views/page layouts/navigation/etc.).
   - Server-side app paths now include more installation/runtime support (e.g., app token DTOs/resolvers and workspace migration DTOs), indicating active investment in app lifecycle operations.
   - Build dependency handling also expanded (seeded dependency/Yarn engine assets under application module constants).

4. **Front-component runtime/export model refactored again**
   - SDK runtime internals shifted from `src/front-component/*` to `src/front-component-renderer/*`.
   - Package exports now expose `./front-component-renderer` (plus `./ui`) and root SDK action helpers for front components.
   - Remote component surface expanded (including media/iframe elements), suggesting continued UI/runtime maturation.

5. **API channel split remains, but one important detail changed**
   - `logicFunctionLogs` subscriptions still use `/graphql` SSE.
   - `uploadApplicationFile` is now posted to `/metadata` (multipart GraphQL upload), so our previous snapshot note that uploads were on `/graphql` is stale.
   - This reinforces the need to validate both endpoint routing and multipart handling through our gateway/proxy.

6. **Tools/AI/app authoring docs are converging on a richer app surface**
   - Apps docs now explicitly cover skills, post-install functions, tool-marked logic functions (`isTool`, `toolInputSchema`), and the newer command flow.
   - Workflow + logic-function source editing tooling remains active in server/workflow modules, consistent with the "apps + AI tooling" direction we are watching.

**Actions for our stack**

1. Keep the explicit “watch and prepare” posture from `D-0019`; do not treat this snapshot as a migration go-signal.
2. Update any internal notes/runbooks/spikes that still assume `app:generate` or per-command Yarn wrappers; upstream examples now expect `yarn twenty ...` + `app:dev` + `app:typecheck`.
3. Reconfirm extensibility traffic support in gateway/proxy for:
   - `POST /metadata` JSON GraphQL
   - `POST /metadata` multipart upload (`uploadApplicationFile`)
   - `/graphql` SSE subscriptions (`logicFunctionLogs`)
4. Use the newly visible app entities (`views`, `navigationMenuItems`, `pageLayouts`, `skills`) as evidence inputs for the next D-0019 re-review, but require an actual UI parity spike before changing status.

---

## Hypothetical Migration Readiness (planning only)

Baseline timestamp: **2026-02-24**

Use this matrix to track readiness for a future move from `services/fundraising-service` into Twenty Apps.  
This is intentionally a **readiness tracker**, not an implementation plan.

Interpretation key:
- `green`: mostly migration effort (code movement), no major platform blocker identified.
- `amber`: platform appears viable, but a targeted spike/proof is still needed.
- `red`: currently blocked by a capability that appears absent (or no active signal).

| Area | Existing code asset (today) | Likely lift path into Apps | True unknown/blocker to validate | End-of-Feb watch signal | Status | Evidence pointers |
| --- | --- | --- | --- | --- | --- | --- |
| Metadata lifecycle | We already provision full fundraising objects/fields/relations via `setup-schema.mjs`. | Move schema ownership from script to app manifests (`objects`, `fields`, `roles`, relation fields), keep IDs stable. | Full parity test for install/update/uninstall across the complete fundraising schema. | Manifest coverage expanded again (views/navigation/page layouts now modeled), but full fundraising schema lifecycle parity is still unproven. | `amber` | `services/fundraising-service/scripts/setup-schema.mjs`, `docs/METADATA_RUNBOOK.md`, `services/twenty-core/packages/twenty-shared/src/application/manifestType.ts`, `services/twenty-core/packages/twenty-shared/src/application/fieldManifestType.ts` |
| Core API logic (gift/staging/batch) | Large existing domain code already in service classes (`gift.service.ts`, `gift-staging.service.ts`, batch services) plus pure logic modules. | Lift service methods into app logic-function handlers with thin adapters; keep most business logic files near-identical. | Throughput behavior under heavy concurrency when run as logic functions vs service processes; plus confirm app-auth can use core REST batch endpoints end-to-end. | REST batch endpoints exist, but current REST permission resolution appears to handle only user/api-key auth contexts (not app auth) in `rest-api-base.handler`; treat as a likely current gap until proven otherwise. | `amber` | `services/fundraising-service/src/gift/gift.service.ts`, `services/fundraising-service/src/gift-staging/gift-staging.service.ts`, `services/fundraising-service/src/gift-batch/gift-batch-processing.service.ts`, `services/fundraising-service/src/gift-batch/gift-batch-donor-match.service.ts`, `services/twenty-core/packages/twenty-server/src/engine/api/rest/core/controllers/rest-api-core.controller.ts`, `services/twenty-core/packages/twenty-server/src/engine/api/rest/core/handlers/rest-api-base.handler.ts`, `services/twenty-core/packages/twenty-server/src/engine/core-modules/auth/strategies/jwt.auth.strategy.ts` |
| Webhook & route ingress | Existing Stripe/GoCardless handlers already isolate ingestion logic and mapping. | Re-host webhook endpoints as route-triggered logic functions, forwarding only needed signature headers. | Raw-body fidelity for strict signature validation (Stripe-style) needs an explicit spike in route-trigger payload handling. | Current route-trigger event builder normalizes/parses body and does not expose preserved raw bytes in `LogicFunctionEvent`; treat strict signature verification as a likely real gap until route payload support changes. | `amber` | `services/fundraising-service/src/stripe/stripe-webhook.controller.ts`, `services/fundraising-service/src/stripe/stripe-webhook.service.ts`, `services/twenty-core/packages/twenty-shared/src/types/LogicFunctionEvent.ts`, `services/twenty-core/packages/twenty-server/src/engine/core-modules/logic-function/logic-function-trigger/triggers/route/utils/build-logic-function-event.util.ts` |
| Runtime/dependencies | Existing app precedent already ships non-trivial code (`apps/core/rollup-engine`); platform supports dependency layers and configurable function timeouts. | Mirror rollup-engine pattern for fundraising domains; package shared domain modules and runtime config as app variables. | Need empirical limits profile for longest batch paths and worst-case retries. | Function timeout or dependency packaging limits force major logic redesign. | `green` | `apps/core/rollup-engine/serverlessFunctions/calculaterollups/src/index.ts`, `services/twenty-core/packages/twenty-server/src/engine/metadata-modules/logic-function/logic-function.entity.ts`, `services/twenty-core/packages/twenty-server/src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda.driver.ts` |
| UI surface | Existing UI is a service-hosted Vite admin app; Twenty front components and page-layout widgets are actively evolving. | Phase migration: API/runtime first; migrate UI slices to front components where ergonomics are proven. | Multi-screen fundraising admin UX parity (navigation/layout patterns) needs a concrete spike, not assumption. | Signal improved: app manifests/SDK now include views + navigation items + page layouts, but workflow-level UX parity is still unproven. | `amber` | `services/fundraising-service/src/main.ts`, `services/twenty-core/packages/twenty-docs/developers/extend/capabilities/apps.mdx`, `services/twenty-core/packages/twenty-server/src/engine/metadata-modules/page-layout-widget/dtos/front-component-configuration.dto.ts` |
| Auth/security/compliance | Current service auth is middleware-based; app runtime issues scoped short-lived app tokens with role permissions and supports secret app variables. | Use app-role least-privilege model for logic functions; keep webhook auth/signature validation explicit per route. | Operational pattern for secret rotation + webhook auth hardening must be codified in runbooks. | App token generation/renewal surface is more explicit in SDK/server code, but our operational hardening model is still not codified. | `amber` | `services/fundraising-service/src/auth/auth.utils.ts`, `services/fundraising-service/src/auth/fundraising-auth.middleware.ts`, `services/twenty-core/packages/twenty-docs/developers/extend/capabilities/apps.mdx`, `services/twenty-core/packages/twenty-server/src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service.ts` |
| Ops/observability/cutover | Strong current structured logs + runbooks; no phased cutover doc yet. | Define phased strangler plan (endpoint-by-endpoint), with reversible gates and parity checks. | Need a minimal phase plan + measurable cutover criteria before any migration start. | No agreed cutover gates by end-Feb. | `amber` | `docs/OPERATIONS_RUNBOOK.md`, `services/fundraising-service/src/logging/structured-logger.service.ts`, `docs/DECISIONS.md` (D-0017, D-0019) |

Notes for next reviews:
- Keep this matrix at planning level until D-0019 triggers indicate we should start concrete migration design.
- On each upstream sync, update only rows with new evidence (do not churn unchanged rows).
- Treat “code movement required” separately from “platform capability missing.” We only escalate `red` for the latter.

### Blocker review status (assumption vs actual gap)

Use this classification to avoid mixing platform gaps with our own migration work.

- **Likely actual platform gaps (current code evidence)**
  - **Route-trigger raw-body fidelity** for Stripe-style signature verification appears unavailable in current `LogicFunctionEvent` construction (parsed/normalized body, no raw bytes exposed).
  - **App-auth access to core REST batch endpoints** may be incomplete today: app tokens are recognized by auth, but REST base handler permission resolution currently branches on user/api-key auth contexts only.
- **Needs proof (not proven platform gaps yet)**
  - Full fundraising metadata lifecycle parity (install/update/uninstall) across our complete schema.
  - Batch throughput/retry parity under our production-style workloads, once app-auth path is confirmed.
  - UI/navigation/page-layout ergonomics for selected fundraising workflows (if/when we choose to test UX migration slices).
- **Primarily our migration/ops work (not Twenty platform blockers)**
  - Secret rotation and webhook hardening runbooks.
  - Phased cutover plan, rollback criteria, and parity checks.
  - Operational observability/cutover policy for hybrid-to-app migration.

### Validation timing (intentional deferral)

- We are **not** running these validation spikes yet.
- Defer app-migration proof work until the Twenty team indicates the Apps surface is ready for external testing.
- Until then, keep collecting code-level evidence in this doc and maintain the hybrid delivery path for beta.

### What would count as truly missing (not just “not migrated yet”)?

- Inability to verify webhook signatures safely with route-trigger payload shape.
- Inability for app-authenticated logic functions to use required high-throughput core APIs (for example `/rest/batch/*`) with app-role permissions.
- Inability to represent critical fundraising UI workflows in supported front-component/page-layout surfaces.
- Runtime/dependency limits that force a fundamental redesign of existing batch/ingestion logic.

---

## Snapshot History

- Use git history: `git log -- docs/TWENTY_EXTENSIBILITY_WATCH.md`.
