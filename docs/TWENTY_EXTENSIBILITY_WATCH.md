# Twenty Extensibility Watch

_Living log of notable changes inside `services/twenty-core` that affect the future partner-module strategy._

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
   - `git -C services/twenty-core diff --name-status ORIG_HEAD..HEAD -- packages/twenty-sdk packages/create-twenty-app packages/twenty-docs/developers/extend packages/twenty-shared/src/application packages/twenty-server/src/engine/core-modules/application packages/twenty-server/src/engine/metadata-modules/logic-function`
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

## Provisional architecture notes (don’t lock in)

- Treat “Fundraising as an App” as the long-term packaging target, but keep implementation hybrid until Twenty Apps cover required UX + operational primitives (tracked in `docs/DECISIONS.md` D-0019).
- In SaaS, the “edge layer” is still possible: it becomes a vendor-managed multi-tenant service integrating with each workspace via Twenty APIs/webhooks; customers don’t run code.

## Current Extensibility Surface (rolling baseline)

- **twenty-cli** (packages/twenty-cli):
  - Now deprecated in favor of `twenty-sdk` (see `packages/twenty-cli/README.md`).
  - Command name stays `twenty`, but install guidance now points to `npm install -g twenty-sdk`.
- **twenty-sdk** (packages/twenty-sdk):
  - The CLI talks to two endpoints: app install/sync/uninstall via `POST /metadata` (`syncApplication` mutation) and function log tailing via a GraphQL subscription on `POST /graphql` (`logicFunctionLogs`, used by `twenty function:logs`).
- **create-twenty-app** (packages/create-twenty-app):
  - New scaffolder with prewired scripts (now aligned to the `twenty-sdk` namespaced commands like `auth:login`, `app:dev`, `app:sync`, `function:logs`, `app:uninstall`) to wrap the `twenty` CLI.
  - Ships with typed client generation (`yarn app:generate`) and guided entity creation (`yarn app:create-entity`).
- **What gets packaged today:** `ApplicationManifest` is produced from your app source tree and includes application metadata, objects/fields, roles, logic functions, front components, public assets, and bundled sources (with build outputs/checksums and `.twenty/output/manifest.json`).
- **Sample apps (packages/twenty-apps):**
  - `hello-world`: provisions a `postCard` custom object, deploys a `create-new-post-card` serverless function, and wires both an HTTP route trigger and a `people.created` database trigger. Note: sample READMEs may lag behind CLI renames (`auth:login`, `app:sync`, etc.).
  - `hacktoberfest-2025/*`: showcase multi-function apps (Fireflies, Mailchimp sync, etc.) but remain hackathon quality.
  - `rollup-engine`: early managed rollup example packaged as a Twenty app to prove serverless rollup execution.
- **Gaps / limitations:**
  - No published marketplace installer yet; everything is still CLI-driven.
  - Many docs/examples lag behind the CLI and manifest changes; verify against `packages/twenty-docs` and `packages/twenty-sdk/README.md` after each upstream sync.

---

## Latest Snapshot — 2026-02-01

**Context:** Updated `services/twenty-core` by merging `upstream/main` up to `1976ad58c4` (previous head `33bd59ef8e`).

**Highlights**

1. **Serverless functions → logic functions rename (SDK + metadata + GraphQL)**
   - SDK and metadata modules are now “logic functions,” and GraphQL subscriptions use `logicFunctionLogs` (CLI still exposes `function:logs` / `function:execute`).
   - Workflow support lands for logic-function actions (`packages/twenty-server/src/modules/workflow/workflow-executor/workflow-actions/logic-function`).

2. **Front components move toward remote DOM packaging**
   - New `twenty-shared/src/front-component` host/remote worker scaffolding plus remote DOM generators.
   - Front components now carry built paths + checksums in the manifest, aligned with the SDK build pipeline.

3. **Public assets + manifest output standardization**
   - Apps can ship `public/` assets that upload during sync (`packages/twenty-docs/developers/extend/capabilities/apps.mdx`).
   - Manifest output is standardized at `.twenty/output/manifest.json` and now includes `publicAssets`, `packageJson`, and `yarnLock` metadata.

4. **Marketplace scaffolding appears**
   - Server adds marketplace resolver/service that reads app manifests from GitHub and surfaces `marketplaceData` (author/category/logo/screenshots) in `ApplicationManifest`.

**Actions for our stack**

- Audit any references to `serverlessFunctionLogs` and update gateway rules if we rely on log streaming; the subscription name is now `logicFunctionLogs`.
- If we want UI extensibility in the app framework, track the remote DOM/front-component pipeline as a potential packaging surface (still early/experimental).
- Ensure any app packaging scripts account for `.twenty/output/manifest.json` and `public/` asset uploads.

---

## Snapshot — 2026-01-23

**Context:** Updated `services/twenty-core` by merging `upstream/main` up to `c02227472e` (fetched from `06d0ac13c4`).

**Highlights**

1. **Twenty SDK CLI command reshuffle + workspace switching**
   - Commands move to a namespaced `:` style (`auth:login`, `app:dev`, `app:sync`, `function:logs`, etc.), and add `auth:list` / `auth:switch` to make multi-workspace usage first-class (`packages/twenty-sdk/README.md`).
   - New `function:execute` runs a serverless function against the current workspace using a JSON payload (draft version by default).

2. **Manifest/build pipeline becomes explicit (checksums + built artifacts)**
   - Introduces `app:build` and build/watch machinery that compiles serverless handlers and updates the manifest with per-file checksums (`builtHandlerChecksum`, `builtComponentChecksum`).
   - Manifest generation is now a dedicated “build” step (`runManifestBuild`) that can write output under `.twenty/output/` and then `app:sync` submits the manifest.

3. **`ApplicationManifest` schema is a breaking change**
   - The manifest model now includes `packageJson`, renames `serverlessFunctions` → `functions`, and adds `objectExtensions` plus `frontComponents` alongside `roles`/`sources` (`packages/twenty-shared/src/application/applicationManifestType.ts`).
   - Serverless functions now carry both source and built paths (`sourceHandlerPath`, `builtHandlerPath`) + checksum, and route/database triggers gain extra fields (`forwardedRequestHeaders`, `updatedFields`) (`packages/twenty-shared/src/application/serverlessFunctionManifestType.ts`).

4. **Serverless functions as “tools”**
   - Adds `toolInputSchema` + `isTool` to `core.serverlessFunction` and sync logic, plus a tool-provider that can surface serverless functions to AI/tooling flows (`packages/twenty-server/.../tool-provider`).

5. **Scaffolder/docs update to match new conventions**
   - `create-twenty-app` and docs switch to a `src/app/` convention with file-suffix discovery (`*.object.ts`, `*.function.ts`, `*.role.ts`), and update Yarn scripts to match the new CLI command names (`packages/twenty-docs/developers/extend/capabilities/apps.mdx`).

**Actions for our stack**

- Update any internal runbooks/scripts that still reference `twenty app dev/sync/logs` to the new `app:dev` / `app:sync` / `function:logs` naming (or confirm aliases exist).
- If we rely on log streaming through the gateway, ensure `/graphql` subscriptions are routed correctly (CLI uses GraphQL SSE for `serverlessFunctionLogs`).

---

## Snapshot History

- Use git history: `git log -- docs/TWENTY_EXTENSIBILITY_WATCH.md`.
