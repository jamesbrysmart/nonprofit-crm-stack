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

## Current Extensibility Surface (baseline verified 2026-02-11)

- **twenty-cli** (packages/twenty-cli):
  - Now deprecated in favor of `twenty-sdk` (see `packages/twenty-cli/README.md`).
  - Command name stays `twenty`, but install guidance now points to `npm install -g twenty-sdk`.
- **twenty-sdk** (packages/twenty-sdk):
  - Current package version in-tree: `0.5.0`.
  - CLI commands exposed in README and command registry: `auth:login`, `auth:logout`, `auth:status`, `auth:list`, `auth:switch`, `app:dev`, `app:generate`, `app:uninstall`, `entity:add`, `function:logs`, `function:execute`.
  - API split is explicit:
    - `POST /metadata` for app sync/install lifecycle and logic-function execution.
    - `POST /graphql` for log streaming (`logicFunctionLogs`) and app file uploads.
- **create-twenty-app** (packages/create-twenty-app):
  - Current package version in-tree: `0.5.0`.
  - Scaffolds Yarn scripts aligned with current SDK commands (notably `entity:add`; no separate `app:sync` script in scaffold output).
  - Creates `public/` plus `src/application-config.ts`, `src/logic-functions/*`, `src/front-components/*`, `src/roles/*`.
- **Manifest/build surface (as of current code):**
  - Manifest shape in `packages/twenty-shared/src/application/manifestType.ts` is:
    `application`, `objects`, `fields`, `logicFunctions`, `frontComponents`, `roles`, `publicAssets`, `sources`.
  - Manifest output path remains `.twenty/output/manifest.json`.
  - Build/upload path is file-oriented (built logic/front-component files, dependencies, and public assets uploaded through `uploadApplicationFile`).
- **Front component packaging:**
  - Remote DOM/front-component runtime and generated host/remote registries now live under `packages/twenty-sdk/src/front-component/*`.
  - `twenty-sdk` exports dedicated `./front-component` and `./ui` entrypoints.
- **Tools/AI workflow integration:**
  - Logic functions marked as tools can be surfaced via workflow tools (`list_logic_function_tools`).
  - Workflow tooling now includes updating logic-function source from tool calls (`update_logic_function_source`).
- **Reference implementations to track:**
  - Upstream: `packages/twenty-apps/hello-world` (minimal end-to-end app surface).
  - In this repo: `apps/core/rollup-engine` (non-trivial app logic already running in our model).
- **Gaps / limitations:**
  - No published marketplace installer yet; everything is still CLI-driven.
  - Many docs/examples lag behind the CLI and manifest changes; verify against `packages/twenty-docs` and `packages/twenty-sdk/README.md` after each upstream sync.

---

## Latest Snapshot — 2026-02-11

**Context:** Updated `services/twenty-core` from `1976ad58c4` to `45ed1fb90c` (merge of `upstream/main` on 2026-02-11).

**Highlights**

1. **SDK/scaffolder release cadence moved again (`0.5.0`)**
   - `twenty-sdk` and `create-twenty-app` both moved to `0.5.0`.
   - Command surface in current docs/code converges on `app:dev` + `entity:add` + `function:*`; older references to `app:sync` / `app:create-entity` are now drift-prone.

2. **Front-component packaging consolidated in SDK**
   - Front-component host/remote runtime code moved from shared internals into `packages/twenty-sdk/src/front-component/*`.
   - Remote DOM generation, SDK/UI globals handling, and storybook fixtures landed in SDK tooling.

3. **Application sync path refactored around manifest-driven metadata migration**
   - Server application sync code now routes manifest entity sync through dedicated migration services/utilities and standardized metadata-name constants.
   - Package/dependency and artifact handling remains upload-first (`uploadApplicationFile`) with manifest checksums retained.

4. **Schema boundary hardening between `/metadata` and `/graphql`**
   - Recent server work explicitly tightened separation between metadata and GraphQL schemas.
   - This reinforces our need to keep gateway/proxy support correct for both channels (metadata mutations and GraphQL SSE/file upload).

5. **Workflow + logic-function tooling expanded**
   - Workflow tools now include listing logic functions marked as tools and updating logic-function source.
   - Logic-function action/code-step fixes landed in the workflow executor path, indicating active investment in this surface.

**Actions for our stack**

1. Keep the explicit “watch and prepare” posture from `D-0019`; do not treat this snapshot as a migration go-signal.
2. Continue command/runbook drift cleanup (`app:dev`, `entity:add`, `function:*` naming).
3. Reconfirm extensibility traffic support in gateway/proxy (`POST /metadata`, `POST /graphql` SSE/upload).

---

## Hypothetical Migration Readiness (planning only)

Baseline timestamp: **2026-02-11**

Use this matrix to track readiness for a future move from `services/fundraising-service` into Twenty Apps.  
This is intentionally a **readiness tracker**, not an implementation plan.

Interpretation key:
- `green`: mostly migration effort (code movement), no major platform blocker identified.
- `amber`: platform appears viable, but a targeted spike/proof is still needed.
- `red`: currently blocked by a capability that appears absent (or no active signal).

| Area | Existing code asset (today) | Likely lift path into Apps | True unknown/blocker to validate | End-of-Feb watch signal | Status | Evidence pointers |
| --- | --- | --- | --- | --- | --- | --- |
| Metadata lifecycle | We already provision full fundraising objects/fields/relations via `setup-schema.mjs`. | Move schema ownership from script to app manifests (`objects`, `fields`, `roles`, relation fields), keep IDs stable. | Full parity test for install/update/uninstall across the complete fundraising schema. | Manual fallback steps still required for core flows after app manifest trials. | `amber` | `services/fundraising-service/scripts/setup-schema.mjs`, `docs/METADATA_RUNBOOK.md`, `services/twenty-core/packages/twenty-shared/src/application/manifestType.ts`, `services/twenty-core/packages/twenty-shared/src/application/fieldManifestType.ts` |
| Core API logic (gift/staging/batch) | Large existing domain code already in service classes (`gift.service.ts`, `gift-staging.service.ts`, batch services) plus pure logic modules. | Lift service methods into app logic-function handlers with thin adapters; keep most business logic files near-identical. | Throughput behavior under heavy concurrency when run as logic functions vs service processes. | Batch/retry behavior cannot match current outcomes without major rewrites. | `amber` | `services/fundraising-service/src/gift/gift.service.ts`, `services/fundraising-service/src/gift-staging/gift-staging.service.ts`, `services/fundraising-service/src/gift-batch/gift-batch-processing.service.ts`, `services/fundraising-service/src/gift-batch/gift-batch-donor-match.service.ts` |
| Webhook & route ingress | Existing Stripe/GoCardless handlers already isolate ingestion logic and mapping. | Re-host webhook endpoints as route-triggered logic functions, forwarding only needed signature headers. | Raw-body fidelity for strict signature validation (Stripe-style) needs an explicit spike in route-trigger payload handling. | Signature validation cannot be proven without relaxing security checks. | `amber` | `services/fundraising-service/src/stripe/stripe-webhook.controller.ts`, `services/fundraising-service/src/stripe/stripe-webhook.service.ts`, `services/twenty-core/packages/twenty-shared/src/types/LogicFunctionEvent.ts`, `services/twenty-core/packages/twenty-server/src/engine/core-modules/logic-function/logic-function-trigger/triggers/route/utils/build-logic-function-event.util.ts` |
| Runtime/dependencies | Existing app precedent already ships non-trivial code (`apps/core/rollup-engine`); platform supports dependency layers and configurable function timeouts. | Mirror rollup-engine pattern for fundraising domains; package shared domain modules and runtime config as app variables. | Need empirical limits profile for longest batch paths and worst-case retries. | Function timeout or dependency packaging limits force major logic redesign. | `green` | `apps/core/rollup-engine/serverlessFunctions/calculaterollups/src/index.ts`, `services/twenty-core/packages/twenty-server/src/engine/metadata-modules/logic-function/logic-function.entity.ts`, `services/twenty-core/packages/twenty-server/src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda.driver.ts` |
| UI surface | Existing UI is a service-hosted Vite admin app; Twenty front components and page-layout widgets are actively evolving. | Phase migration: API/runtime first; migrate UI slices to front components where ergonomics are proven. | Multi-screen fundraising admin UX parity (navigation/layout patterns) needs a concrete spike, not assumption. | Core workflows cannot be represented without unacceptable UX regression. | `amber` | `services/fundraising-service/src/main.ts`, `services/twenty-core/packages/twenty-docs/developers/extend/capabilities/apps.mdx`, `services/twenty-core/packages/twenty-server/src/engine/metadata-modules/page-layout-widget/dtos/front-component-configuration.dto.ts` |
| Auth/security/compliance | Current service auth is middleware-based; app runtime issues scoped short-lived app tokens with role permissions and supports secret app variables. | Use app-role least-privilege model for logic functions; keep webhook auth/signature validation explicit per route. | Operational pattern for secret rotation + webhook auth hardening must be codified in runbooks. | Security model remains implicit/manual by end-Feb. | `amber` | `services/fundraising-service/src/auth/auth.utils.ts`, `services/fundraising-service/src/auth/fundraising-auth.middleware.ts`, `services/twenty-core/packages/twenty-docs/developers/extend/capabilities/apps.mdx`, `services/twenty-core/packages/twenty-server/src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service.ts` |
| Ops/observability/cutover | Strong current structured logs + runbooks; no phased cutover doc yet. | Define phased strangler plan (endpoint-by-endpoint), with reversible gates and parity checks. | Need a minimal phase plan + measurable cutover criteria before any migration start. | No agreed cutover gates by end-Feb. | `amber` | `docs/OPERATIONS_RUNBOOK.md`, `services/fundraising-service/src/logging/structured-logger.service.ts`, `docs/DECISIONS.md` (D-0017, D-0019) |

Notes for next reviews:
- Keep this matrix at planning level until D-0019 triggers indicate we should start concrete migration design.
- On each upstream sync, update only rows with new evidence (do not churn unchanged rows).
- Treat “code movement required” separately from “platform capability missing.” We only escalate `red` for the latter.

### What would count as truly missing (not just “not migrated yet”)?

- Inability to verify webhook signatures safely with route-trigger payload shape.
- Inability to represent critical fundraising UI workflows in supported front-component/page-layout surfaces.
- Runtime/dependency limits that force a fundamental redesign of existing batch/ingestion logic.

---

## Snapshot History

- Use git history: `git log -- docs/TWENTY_EXTENSIBILITY_WATCH.md`.
