# Twenty Extensibility Watch

_Living log of notable changes inside `services/twenty-core` that affect the future partner-module strategy._

## Scope (important)

- This document tracks Twenty’s extensibility surface and our readiness signals.
- It is **not** a migration plan for moving `services/fundraising-service` into Twenty Apps right now.
- Current posture remains aligned with `docs/DECISIONS.md` (`D-0017`, `D-0019`): long-term **app-first** target, current **hybrid** implementation until required UX/ops primitives are stable.
- For app scaffolding and day-to-day app setup/build workflow, treat the official Twenty docs as canonical and use this log only for version-sensitive observations, drift, and migration implications:
  - `https://docs.twenty.com/developers/extend/apps/getting-started`
  - `https://docs.twenty.com/developers/extend/apps/building`
- Keep CRM/runtime versioning separate from app-tooling versioning in this log. The Docker/runtime image tag and the SDK/scaffolder/CLI version may move independently and should not be treated as the same version signal.

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
- In SaaS, an “edge layer” or vendor-managed runtime is still possible, but should be treated as a hedge or possible complement rather than a target shape. It may prove useful for some specialized integrations, or it may turn out to be compensating for app/runtime gaps that narrow over time.
- Do not use service/runtime thinking here as a reason to slow the app-first migration posture. The main open question is boundary placement once the released Twenty apps framework can be tested properly.

## Current Extensibility Surface (baseline verified 2026-05-14)

- **twenty-cli** (packages/twenty-cli):
  - Now deprecated in favor of `twenty-sdk` (see `packages/twenty-cli/README.md`).
  - Command name stays `twenty`, but install guidance now points to `npm install -g twenty-sdk`.
- **twenty-sdk** (packages/twenty-sdk):
  - Current package version in-tree: `2.4.2` (current merged repo head also includes release tag `v2.5.0`, so repo tag and in-tree package version are no longer the same signal).
  - CLI command registry now includes: `remote add`, `remote list`, `remote remove`, `remote status`, `remote switch`, `build`, `deploy`, `dev`, `publish`, `install`, `typecheck`, `uninstall`, `add`, `logs`, `exec`, `catalog-sync`, plus `server start|status|logs|stop|reset`.
  - `dev` now explicitly supports `--once` for one-shot build/sync/typed-client generation without a long-running watcher.
  - Local server management now also supports a separate `--test` instance, which gives the app workflow a cleaner isolated integration-test story.
  - Older `auth:*`, `app:*`, `entity:add`, and `function:*` command names were replaced by the flatter command surface above.
  - The default local-dev story now expects a local Twenty dev server managed by the SDK plus OAuth-based remote auth, not only API-key-first login.
  - The CLI/auth flow is getting more explicit about separating Twenty CLI auth from app-registration auth: config now distinguishes `twentyCLI*` tokens from app access tokens, and registration setup can recover a claimed app by locating the registration and rotating its client secret.
  - The package surface is now split more explicitly by concern:
    - `twenty-sdk/define` for app-definition APIs (`defineApplication`, `defineObject`, `defineLogicFunction`, `defineFrontComponent`, etc.)
    - `twenty-sdk/front-component` for runtime hooks/functions used inside front components
    - `twenty-sdk/logic-function` for runtime-facing logic-function types and future runtime helpers
    - `twenty-sdk/billing` for credit-charging helpers
    - `twenty-sdk/ui`, `twenty-sdk/cli`, and the front-component-renderer exports remain separate
    - There is still no root `"."` export, so root-level `from 'twenty-sdk'` imports should be treated as stale unless explicitly reintroduced upstream.
  - Upstream templates/examples now import from `twenty-sdk/define` and `twenty-sdk/front-component`, so older `from 'twenty-sdk'` examples should be treated as version-sensitive/stale unless verified.
  - `deploy` now carries the direct-to-server install path, while `publish` is npm publication only.
  - `add` still covers a wide app surface (`object`, `field`, `function`, `front-component`, `role`, `view`, `navigation-menu-item`, `skill`, `agent`, `page-layout`), and the underlying CLI templates now also explicitly support record page layouts and page-layout-tab scaffolding paths.
  - API split remains explicit in code:
    - `POST /metadata` for app lifecycle/sync operations, logic-function execution, application token operations, multipart `uploadApplicationFile`, app tarball upload/install, metadata schema introspection, and `logicFunctionLogs` subscriptions.
    - `POST /graphql` remains the core data API / generated client target for workspace data access.
  - The package now depends directly on `twenty-client-sdk` and exposes a narrower `front-component-renderer` surface plus `front-component-renderer/build`, reinforcing the separation between app authoring APIs and front-component build/runtime internals.
- **twenty-ui** (packages/twenty-ui):
  - This is a real Twenty-owned component/theme system, not just CSS:
    - package exports include `./style.css`, `./theme-light.css`, `./theme-dark.css`, plus component subpackages such as `components`, `input`, `layout`, `navigation`, `feedback`, `display`, and `theme`.
    - the front-component renderer explicitly aliases `twenty-sdk/ui` to Twenty UI for example builds, and the built-in front-component story set includes `twenty-ui-example.front-component`.
  - Practical read for app work: treat `twenty-sdk/ui` as the intended native UI surface for front components when the active app-tooling version supports it, but keep the current published app scaffold/version as the compatibility baseline until the version gap closes.
- **create-twenty-app** (packages/create-twenty-app):
  - Current package version in-tree: `2.4.2`.
  - Scaffolder now defaults to a minimal app plus test scaffold; richer starting points are example-based (`--example hello-world`, `--example postcard`) rather than `--exhaustive` / `--minimal` mode selection.
  - Scaffolds a single Yarn entrypoint script (`yarn twenty <command>`) instead of many per-command wrappers.
  - Default scaffold now includes application config, a default role, schema/integration test scaffolding with dedicated test-instance setup, and local CI/CD workflow templates; scaffolded source now uses the split SDK import paths (`twenty-sdk/define`, `twenty-sdk/front-component`) consistently.
  - Scaffolder guidance now offers to start a local Twenty dev server automatically, and the documented manual path uses `yarn twenty server start` plus `yarn twenty remote add --local`.
  - Template dependency currently uses `twenty-sdk: latest` (watch for docs/runtime drift when reproducing examples across versions).
- **Manifest/build surface (as of current code):**
  - Manifest shape in `packages/twenty-shared/src/application/manifestType.ts` is:
    `application`, `objects`, `fields`, `logicFunctions`, `frontComponents`, `roles`, `skills`, `agents`, `connectionProviders`, `publicAssets`, `views`, `navigationMenuItems`, `pageLayouts`, `pageLayoutTabs`, `commandMenuItems`.
    (Notably, prior `sources` entry is no longer present in this manifest type.)
  - `ApplicationManifest` in `applicationType.ts` now includes optional embedded `postInstallLogicFunction` and `preInstallLogicFunction` manifests alongside `packageJsonChecksum` / `yarnLockChecksum`; install hooks are auto-detected rather than referenced by universal identifier in `defineApplication()`.
  - Field manifests now support `isUnique`, which matters for representing app-owned schema constraints without falling back to post-sync/manual metadata edits.
  - Role manifests now support object permissions, field permissions, and permission flags, which gives apps a richer least-privilege packaging surface than the prior coarse role shape.
  - View manifests now include first-class sort definitions (`sorts`) in addition to fields, filters, filter groups, groups, and field groups, which is a meaningful signal that list/view configuration is part of the supported app model rather than incidental server state.
  - Page layout tabs are now first-class manifest entities rather than only inline layout structure, which materially improves the “augment an existing Twenty record page” story for incremental UI migration.
  - Manifest output path remains `.twenty/output/manifest.json`.
  - Build/upload path remains file-oriented (built logic/front-component files, dependencies, and public assets uploaded through `uploadApplicationFile`), but upstream now also documents npm/tarball/server publication paths around that build output.
  - Build/publish docs now treat `build`, `deploy`, `publish`, `install`, and `catalog-sync` as a coherent distribution lifecycle with explicit semver rules for deploy/install/upgrade.
- **Front component packaging:**
  - `twenty-sdk` now exports `./front-component-renderer/build` in addition to `./front-component-renderer` and `./ui`, while more renderer internals have moved out of the root SDK surface.
  - Root SDK exports still provide the higher-level front-component action/API helpers (`navigate`, `openSidePanelPage`, `enqueueSnackbar`, etc.), indicating a richer packaged UI interaction surface while runtime plumbing gets separated.
  - Front-component authoring/imports are now expected to use `twenty-sdk/front-component` for runtime hooks/actions and `twenty-sdk/define` for the definition wrapper, which is a meaningful packaging clarification for any app code we write locally.
  - Front-component command manifests now include `GLOBAL_OBJECT_CONTEXT`, and navigation menu items can target a specific `pageLayoutUniversalIdentifier`, which is a meaningful UI/navigation signal for app-driven record surfaces.
  - The layout surface now also supports `definePageLayoutTab()`, which lets an app attach a tab with widgets to an existing standard or app-owned page layout without replacing the whole layout.
  - The current docs now treat command menu items as a first-class app entity paired with front components via `defineCommandMenuItem()`, and the manifest builder emits a dedicated top-level `commandMenuItems` array. Practical read: treat embedded `command` blocks on front components as legacy/version-sensitive unless verified against the active runtime.
- **Tools/AI workflow integration:**
  - `skills` are now first-class app entities in shared manifest types and SDK exports (`defineSkill`), and upstream docs now document skill authoring in the Apps capability guide.
  - `agents` are now also first-class app entities in shared manifest types and docs (`defineAgent`), extending the AI/app packaging surface beyond tool-exposed logic functions.
  - Logic functions marked as tools can be surfaced via workflow tools (`list_logic_function_tools`).
  - Workflow tooling now includes updating logic-function source from tool calls (`update_logic_function_source`).
  - Apps docs now also describe pre-install and post-install logic functions plus `exec --preInstall` / `exec --postInstall`, improving the operational story for one-time setup and upgrade tasks.
- **Reference implementations to track:**
  - Upstream: `packages/twenty-apps/examples/hello-world` (minimal end-to-end app surface).
  - In this repo: `apps/core/rollup-engine` (non-trivial app logic already running in our model).
- **Gaps / limitations:**
  - The in-repo docs posture has moved forward materially: the app docs are now split into dedicated pages (`cli-and-testing`, `data-model`, `front-components`, `layout`, `logic-functions`), and the old top-level “apps are currently in alpha” warning is no longer present in `developers/extend/apps/getting-started.mdx`.
  - Marketplace/catalog and asset support are moving forward, but the practical install story is still not something we should treat as broadly production-proven for our use case without targeted validation.
  - Route-trigger request events now include optional `rawBody` on `LogicFunctionEvent`, forwarded from Nest's preserved request body when available; this removes the previous likely platform gap for Stripe-style strict webhook signature verification.
  - REST permission resolution now explicitly accepts application auth context and uses the app default role, which is a positive signal for app-auth batch-path access, but we still need an end-to-end proof against the concrete batch routes we care about.
  - App variable semantics are still moving: docs now explicitly say non-secret `applicationVariables` are injected into front components while secret ones remain logic-function-only, and upstream included a recent `Fix application variable issue` commit (`7ade9e3aab`) that is directly relevant to the secret-variable bootstrap/decryption problem we saw locally. Treat this as promising but not yet proven for our exact repro.
  - Recent SDK changes are now more about package shape, import boundaries, OAuth/registration plumbing, and install/validation ergonomics than about obvious new fundraising-specific platform primitives.
  - Docs/examples move quickly and can drift between releases; verify against `packages/twenty-docs` and `packages/twenty-sdk/README.md` after each upstream sync, especially around CLI/scaffolder command names.

---

## Latest Snapshot — 2026-05-14

**Context:** Updated `services/twenty-core` from merge commit `31a1c21546` to merge commit `b1c6338ed2` (local merge on 2026-05-14; fetched upstream head/tag: `a941f6fe01`, tagged `v2.5.0`; in-tree `twenty-sdk` and `create-twenty-app` package versions remain `2.4.2`).

**Highlights**

1. **Command menu items now look like a distinct, first-class app surface rather than incidental front-component metadata**
   - The docs now explicitly say front components should be surfaced by pairing them with `defineCommandMenuItem()`.
   - The manifest shape includes a dedicated top-level `commandMenuItems` array.
   - The SDK CLI scaffolds `command-menu-item` files directly, and the manifest builder reads explicit `defineCommandMenuItem()` exports as their own entity type.
   - Practical read: for app review and future refactors, treat explicit command menu item files as the canonical pattern and embedded `command` blocks on front components as legacy/version-sensitive.

2. **The role/app-config direction is now clearer and more formal**
   - The docs now explicitly position `defineApplicationRole()` as the default-role path.
   - `defaultRoleUniversalIdentifier` on `defineApplication()` is still supported, but clearly deprecated.
   - Practical read: the structural cleanup we just made in `nonprofit-fundraising` is aligned with current Twenty direction, not just warning suppression.

3. **There is an upstream signal that application-variable handling is still being actively repaired**
   - Upstream commit `7ade9e3aab` is literally titled `Fix application variable issue`.
   - Docs now explicitly state that non-secret `applicationVariables` are injected into front components, while secret ones remain logic-function-only.
   - We should not overclaim what `7ade9e3aab` fixes without a targeted runtime proof, but it is directly relevant to the secret-variable bootstrap/decryption failure we hit locally.

4. **Security and runtime plumbing continued to mature, but mostly below the app-authoring abstraction**
   - `v2.5.0` includes more encryption work (`ENCRYPTION_KEY`, versioned envelope, connected-account token encryption, TOTP secret migration).
   - That is good platform hardening, but for our app review it is more of a “watch behavior around secrets/connections” signal than a new migration primitive.

5. **Version signals are now easier to confuse, so this doc should keep calling them apart**
   - Repo tag / runtime line: `v2.5.0`
   - In-tree app-tooling package versions: `2.4.2`
   - Practical read: do not assume the checked-out repo tag, the Docker runtime line, and the published app package versions are the same number.

**Actions for our stack**

1. Use `v2.5.0` code as a reference point for the structural app review, not as an automatic runtime-upgrade target.
2. Prefer explicit `defineCommandMenuItem()` files anywhere we still rely on command-like front-component wiring.
3. Keep secret application variables in the “upstream behavior still moving” bucket until Twenty confirms or we prove the current fix path against our exact repro.
4. During review, separate “must align now because Twenty is clearly standardizing here” from “interesting new platform capability but not worth churn before v1”.

---

## Latest Snapshot — 2026-04-30

**Context:** Updated `services/twenty-core` from merge commit `09abddba2b` to merge commit `e813ed295d` (local merge on 2026-04-30; fetched upstream head: `85752f8a61`, includes release tag `v2.2.0`).

**Highlights**

1. **The Stripe-style raw-body blocker moved from "likely platform gap" to "available, now prove it in our flow"**
   - Upstream commit `3db1af9a17` added optional `rawBody?: string` to `LogicFunctionEvent`.
   - The route-trigger event builder now reads Nest's preserved `request.rawBody` and forwards it into the logic-function event.
   - Upstream also updated the community GitHub webhook verifier to prefer `event.rawBody` and added tests that cover the end-to-end signature-verification path.
   - This is the concrete platform primitive we were missing for strict HMAC verification; the old blanket warning in this doc is now stale.

2. **This landed in the `v2.2.0` line, not only in an unreleased branch**
   - `twenty-sdk` now reports `2.2.0`.
   - `create-twenty-app` now reports `2.2.0`.
   - The raw-body forwarding commit is contained by `v2.2.0`, and our local merge brought that release line plus a small number of later `upstream/main` commits into the fork.

3. **The implementation shape is the one we actually need**
   - `packages/twenty-server/src/engine/core-modules/logic-function/logic-function-trigger/triggers/route/utils/build-logic-function-event.util.ts` now forwards both parsed `body` and exact `rawBody`.
   - `packages/twenty-shared/src/types/LogicFunctionEvent.ts` now models `rawBody?: string`.
   - `packages/twenty-apps/community/github-connector/src/modules/github/connector/webhook-signature.ts` now prefers `event.rawBody`, while retaining fallback behavior for older runtimes.
   - Practical read: Twenty route triggers now have the right payload shape for Stripe/GitHub-style signature verification, assuming the route declaration forwards the required signature headers.

4. **Our posture should narrow from platform skepticism to app-level proof work**
   - This does not by itself prove our exact Stripe intake flow works end-to-end inside the fundraising app.
   - It does remove the strongest code-level reason to assume route-trigger webhook ingress was blocked.
   - The next useful proof is now narrower: confirm our app route receives the signature header we need and verify Stripe signatures against `event.rawBody` in a real fundraising logic function.

**Actions for our stack**

1. Stop describing strict webhook signature verification as a likely missing Twenty capability.
2. Keep webhook ingress in the readiness matrix as `amber`, but for app-proof reasons rather than missing raw-body support.
3. Prioritize a focused Stripe route-trigger proof in `apps/fundraising/nonprofit-fundraising` using `event.rawBody` plus the forwarded Stripe signature header.
4. Keep the batch/auth proof as the more important remaining platform-validation item after this fix.

---

## Latest Snapshot — 2026-04-26

**Context:** Updated `services/twenty-core` from merge commit `3c78a93d9c` to merge commit `09abddba2b` (local merge on 2026-04-26; fetched upstream head: `89ad87aa64`, nearest upstream tag `v2.1.0`).

**Highlights**

1. **The app tooling moved forward again to `v2.1.0`**
   - `twenty-sdk` now reports `2.1.0`.
   - `create-twenty-app` now reports `2.1.0`.
   - This is not just a patch-level release train; the app surface continued to evolve in code after the `v2.0.0` milestone.

2. **Incremental record-page UI augmentation got materially better**
   - `pageLayoutTabs` are now first-class manifest entities.
   - The SDK now exports `definePageLayoutTab()` and related types.
   - The layout docs now explicitly describe attaching a custom tab to an existing standard or app-owned record page layout.
   - For our migration strategy, this is the clearest positive change in this range because it supports “add one fundraising tab to an existing record page” rather than requiring a full layout takeover.

3. **The SDK surface is becoming more intentionally segmented**
   - `twenty-sdk/logic-function` now exists as a runtime-facing barrel for logic-function types.
   - `twenty-sdk/billing` now exists for credit-charging helpers.
   - The split package direction is therefore getting stronger, not weaker; app proof code should keep following the explicit subpath model rather than expecting a consolidated root SDK API.

4. **List/view modeling also became a bit richer**
   - `ViewManifest` now carries additional view-shape fields such as calendar-specific metadata alongside the already-added `sorts`.
   - This reinforces the idea that app-defined record lists are a native Twenty view configuration surface, not a custom front-component-owned primary list screen.

5. **The key blockers still did not move in this window**
   - This merge window still did not touch the route-trigger raw-body path we care about for Stripe-style signature verification.
   - It also still did not touch the REST auth handler path we use as the batch-path watch signal.
   - So the practical read is: better migration shape for UI embedding, but no new proof that webhook ingress or app-auth batch access concerns are resolved.

**Actions for our stack**

1. Treat `definePageLayoutTab()` as a preferred primitive for the first UI migration slice where the goal is augmentation, not full replacement.
2. Keep targeting explicit SDK subpaths (`twenty-sdk/define`, `twenty-sdk/front-component`, and now `twenty-sdk/logic-function` where appropriate).
3. Keep the first proof scoped around native Twenty views, navigation, and record-page tabs rather than bespoke standalone app-shell assumptions.
4. Continue treating route-trigger raw-body fidelity and concrete batch-path validation as explicit acceptance criteria.

---

## Latest Snapshot — 2026-04-21

**Context:** Updated `services/twenty-core` from merge commit `8a9ce37328` to merge commit `3c78a93d9c` (local merge on 2026-04-21; fetched upstream head: `30b8663a74`, nearest upstream tag `v2.0.0`).

**Highlights**

1. **This is a real `v2.0.0` app-tooling milestone, not just docs wording**
   - `twenty-sdk` now reports `2.0.0` in-tree.
   - `create-twenty-app` also now reports `2.0.0`.
   - That matters because it confirms the version jump in the shipped package surface, not only in release notes or marketing framing.

2. **The canonical app-authoring surface remains the split SDK imports**
   - `twenty-sdk/define` is still the app-definition entrypoint.
   - `twenty-sdk/front-component` remains the runtime/front-component entrypoint.
   - `twenty-sdk` still does not export a root `"."` entry, so older root-import examples remain stale rather than newly revalidated by `v2.0.0`.

3. **The docs posture moved forward in a way that matters for our process**
   - The app docs were split into more explicit pages for CLI/testing, data model, front components, layout, and logic functions.
   - The in-repo `getting-started` page no longer carries the old top-level alpha warning.
   - That is a meaningful signal that Twenty is presenting Apps as a more formal product surface now, even if we still need proof for the specific fundraising blockers.

4. **View/list configuration became more explicit in the manifest model**
   - `ViewManifest` now includes first-class `sorts`, and the SDK `define` surface exports the corresponding view manifest types.
   - That is useful for our mental model of app-owned list UX: app-defined record lists are still primarily “views + navigation”, but that surface is becoming more explicit and portable.

5. **Our blocker posture still should not be relaxed without proof**
   - This merge window did not touch the route-trigger raw-body path we track for Stripe-style signature verification.
   - It also did not introduce a new decisive signal on the concrete REST batch-path proof question.
   - So `v2.0.0` changes the framing and the urgency of running a real migration slice, but it does not by itself close the remaining technical gates.

**Actions for our stack**

1. Treat `v2.0.0` as the point where app proof work should target current package/docs reality, not older canary-era examples.
2. Keep using `twenty-sdk/define` and `twenty-sdk/front-component` in any local proof app code.
3. Use the improved docs and explicit view-manifest surface to narrow the first migration slice around native Twenty list/detail/navigation primitives rather than bespoke app-shell assumptions.
4. Keep route-trigger raw-body fidelity and concrete batch-path validation as explicit acceptance criteria for the first migration proof.

---

## Latest Snapshot — 2026-04-20

**Context:** Updated `services/twenty-core` from merge commit `afeb9dbf16` to merge commit `8a9ce37328` (local merge on 2026-04-20; fetched upstream head: `46aedcf133`, nearest upstream tag `v1.23.5`).

**Highlights**

1. **The biggest change is SDK packaging, not a new platform capability**
   - `twenty-sdk` and `create-twenty-app` moved again, now showing `1.23.0-canary.1` in-tree while the repo has tags through `v1.23.5`.
   - App-definition APIs are now clearly organized under `twenty-sdk/define`.
   - Front-component runtime hooks/actions are now clearly organized under `twenty-sdk/front-component`.
   - This is a meaningful breaking-shape change for examples, templates, and any local app code we write, even if it does not materially change the migration-readiness posture by itself.

2. **Examples, scaffolds, and CLI templates now consistently use the split import surface**
   - `create-twenty-app` template files now import from `twenty-sdk/define`.
   - Example apps and generated entity templates moved the same way, and front-component runtime usage in examples now imports hooks/actions from `twenty-sdk/front-component`.
   - For our stack, this means any app proof code should align with the new import boundaries from the start rather than copying older root-import examples.

3. **There are some useful operational improvements around registration and OAuth discovery**
   - Application registration handling continues to get more explicit, including syncing registration variable schemas from manifest `serverVariables`.
   - OAuth discovery metadata got more careful about issuer/resource URLs and host handling, which is a positive signal for mixed frontend/API/custom-domain environments.
   - Install/dev error handling also looks more structured, especially around manifest validation errors.

4. **The underlying app model still looks broadly the same**
   - This merge window did not introduce an obviously new app primitive on the scale of “apps can now do X” for our fundraising migration questions.
   - It looks more like release-hardening, package-surface cleanup, and operational polish ahead of broader app rollout.

5. **Our two core watch items still do not show a decisive change here**
   - This range did not touch the route-trigger raw-body code path we care about for Stripe-style verification.
   - It also did not change the already-recorded REST auth handler signal enough to alter the batch-path assessment.
   - So the posture remains: useful progress, proof environment improving, but the remaining questions are still proof questions.

**Actions for our stack**

1. Treat `twenty-sdk/define` and `twenty-sdk/front-component` as the canonical import surface for any new local app proof work.
2. Update any local notes or spike code that still assumes root `twenty-sdk` imports for definition/runtime APIs.
3. Keep route-trigger raw-body fidelity and concrete batch-path validation as the key proof gates; do not mistake SDK/package cleanup for those gates being resolved.
4. Given the stated app release timing, increase review cadence temporarily, but bias future updates toward lightweight snapshots unless one of the blocker areas actually moves.

---

## Latest Snapshot — 2026-04-15

**Context:** Updated `services/twenty-core` from merge commit `0d680c1d2d` to merge commit `afeb9dbf16` (local merge on 2026-04-15; fetched upstream head: `0c4a194c7a`, nearest upstream tag `v1.22.0`).

**Highlights**

1. **The app toolchain moved into the `v1.22.0` era, but the change is mostly developer ergonomics rather than platform posture**
   - `twenty-sdk` and `create-twenty-app` now report `1.22.0-canary.6` in-tree alongside the repo’s `v1.22.0` tag.
   - This window is not another broad reshaping of the app model; it is a tightening pass on auth, testability, and entity surface details.
   - That means it matters more for our first migration proof workflow than for the high-level “is apps the long-term direction?” question.

2. **The local dev and test story improved in a directly useful way for migration proofs**
   - Docs and CLI now support a separate `yarn twenty server ... --test` instance on port `2021`, with isolated container and volumes.
   - The scaffolded app test shape also moved toward dedicated test setup and schema/integration checks rather than only the older install-test framing.
   - Upstream publishing docs now document scaffolded CI/CD workflows more explicitly, including ephemeral test-instance usage in CI.

3. **App registration/auth flow looks more resilient for repeated local sync and proof work**
   - The SDK now distinguishes CLI OAuth credentials from app-registration credentials in config naming.
   - `ensureAppRegistration` can recover when a universal identifier is already claimed by locating the existing registration and rotating the client secret rather than failing hard.
   - That does not change production capability, but it reduces friction for repeated app-dev iterations, which matters now that we are close to a real migration proof.

4. **There are a few real app-surface additions, especially around schema and UI wiring**
   - Field manifests now support `isUnique`.
   - Front-component command manifests now include `GLOBAL_OBJECT_CONTEXT`, which slightly broadens where commands can appear.
   - Navigation menu items can now point at a specific `pageLayoutUniversalIdentifier`, which is a meaningful signal that app-owned navigation and record-surface wiring are getting more explicit.

5. **The core blockers still look materially unchanged**
   - This merge window did not touch the route-trigger raw-body path or the REST auth handler areas we track as blockers/watch items.
   - So the high-level posture remains the same: the app surface looks increasingly usable, but our real migration questions are still proof questions, not “docs say it exists” questions.

**Actions for our stack**

1. Keep the explicit “watch and prepare” posture from `D-0019`, but treat the proof environment as materially more ready than it was in early March.
2. Update local notes that still assume `0.9.0` era package versions or the older scaffolded test-file names.
3. Use the new `--test` server support and scaffolded CI/test patterns as the default environment shape for the first migration proof.
4. Keep route-trigger raw-body fidelity as the clearest unresolved platform blocker, and keep batch-path validation in the “must prove, don’t assume” bucket.

---

## Latest Snapshot — 2026-04-10

**Context:** Updated `services/twenty-core` from merge commit `213d75d900` to merge commit `0d680c1d2d` (local merge on 2026-04-10; fetched upstream head: `217957f2a1`, nearest upstream tag `v1.21.1`).

**Highlights**

1. **SDK + scaffolder moved to `0.9.0` and hardened the non-interactive workflow**
   - `twenty-sdk` and `create-twenty-app` both moved from `0.8.0-canary.1` to `0.9.0`.
   - `yarn twenty dev --once` is now a first-class one-shot sync path for CI, hooks, and scripted workflows instead of “watch mode only” semantics.
   - The docs and CLI read more like a stable app authoring workflow now: scaffold, local server/OAuth auth, `dev`, `build`, `deploy` / `publish`, `install`.

2. **Scaffolding shifted from mode-based templates to minimal-by-default plus examples**
   - `create-twenty-app` now documents a minimal default app with test scaffolding and local CI/CD workflow templates.
   - Richer starting points moved to named examples (`hello-world`, `postcard`) under `packages/twenty-apps/examples/*`.
   - This is useful for us because the canonical “small proof app” story is clearer and easier to copy for targeted fundraising spikes.

3. **Manifest and permission surface expanded in ways that matter operationally**
   - Install hooks are now modeled as `preInstallLogicFunction` / `postInstallLogicFunction` manifests rather than only identifier references, and docs say they are auto-detected from source.
   - Role manifests now include object permissions, field permissions, and permission flags, which gives app packaging a more realistic least-privilege shape for future fundraising proofs.
   - Publish/install docs now spell out semver-enforced deploy/install/upgrade behavior, `catalog-sync`, and marketplace metadata more concretely than the March baseline.

4. **One previous blocker got weaker: REST auth now explicitly handles application context**
   - `rest-api-base.handler.ts` now branches for application auth context and uses `authContext.application.defaultRoleId` when present.
   - That is a meaningful positive signal for app-authenticated access to core REST endpoints, including the batch-path question we care about.
   - It is still not a migration go-signal because we have not proven our actual fundraising batch flows end-to-end under app auth, but it should no longer be described as a likely gap based only on missing application-context support in that handler.

5. **The route-trigger raw-body blocker still looks unchanged**
   - This merge window did not touch the route-trigger event builder or `LogicFunctionEvent` shape that our Stripe-style webhook concern depends on.
   - So raw-body fidelity remains the cleaner “likely actual platform gap” in the watch posture.

**Actions for our stack**

1. Keep the explicit “watch and prepare” posture from `D-0019`; this merge improves app maturity but is still not a migration decision.
2. Update local notes that still refer to `0.8.0-canary.1`, `--exhaustive` / `--minimal` scaffolder modes, or install-hook identifiers in `defineApplication()`.
3. Downgrade the app-auth REST batch-path concern from “likely current gap” to “needs proof,” and plan any future fundraising spike accordingly.
4. Keep route-trigger raw-body fidelity as the clearest unresolved platform blocker for Stripe-style ingress.

---

## Latest Snapshot — 2026-03-30

**Context:** Updated `services/twenty-core` from merge commit `6ae867744a` to merge commit `213d75d900` (local merge on 2026-03-30; fetched upstream head: `d246b16063`, nearest upstream tag `v1.19.11`).

**Highlights**

1. **Applications are no longer feature-flagged**
   - Upstream removed `IS_APPLICATION_ENABLED`.
   - Application registration, development, install, manifest, upgrade, marketplace, and OAuth paths no longer sit behind the feature flag guard.
   - For our stack, any local notes that still treat Applications as opt-in via feature flag should now be treated as stale until revalidated.

2. **Application assets and marketplace metadata moved forward materially**
   - The upstream `Provide application assets` change touched the SDK, scaffolder, docs, frontend application settings screens, application registration entities/services, and marketplace/catalog utilities.
   - Asset URL resolution and richer application detail surfaces are now more explicit in both backend and frontend code.
   - This is a real maturity signal for the app packaging/distribution surface, even if it does not change our fundraising migration posture by itself.

3. **SDK + scaffolder workflow shifted again**
   - `twenty-sdk` now exposes additional commands such as `install` and `catalog-sync`.
   - `create-twenty-app` continues moving toward programmatic local-server/OAuth setup rather than shelling out through wrapper scripts.
   - The app-dev workflow is still changing quickly enough that we should continue treating docs and command names as version-sensitive rather than stable assumptions.

4. **The generated client/runtime packaging story changed underneath the SDK**
   - Generated metadata client source files were removed from `packages/twenty-sdk/src/clients/generated/*`.
   - The runtime now leans more clearly on the separate `twenty-client-sdk` provisioning path plus server-provided assets/application package data.
   - This matters for future fundraising-app proofs because it changes where we should look when debugging generated client or front-component runtime behavior.

5. **No clear evidence yet that our two main blockers are resolved**
   - This merge review did not show a convincing signal that route-trigger raw-body fidelity for Stripe-style signature verification has landed.
   - It also did not provide a proof that app-authenticated logic functions now have the batch-path access guarantees we would need for full fundraising migration.
   - So this merge is valuable fork-maintenance and evidence gathering, not a migration go-signal.

**Actions for our stack**

1. Keep the explicit “watch and prepare” posture from `D-0019`; this merge still does not justify a migration decision.
2. Update local notes/runbooks that still assume Applications must be enabled via `IS_APPLICATION_ENABLED`.
3. Reconfirm our gateway/runtime assumptions around the current app control plane after this merge:
   - `POST /metadata` JSON GraphQL
   - `POST /metadata` multipart upload / app asset flows
   - `/metadata` log/app lifecycle traffic where applicable
   - `/graphql` for generated core data clients
4. Keep route-trigger raw-body fidelity and app-auth batch-path access as explicit blocker watch items until we run a proof that says otherwise.

---

## Latest Snapshot — 2026-04-16

**Context:** Local app-dev spike work in `apps/fundraising/staging-review-minimal` against the SDK-managed Twenty app-dev workspace on `http://localhost:2020`.

**Highlights**

1. **Twenty apps can now credibly host a command-launched manual entry flow**
   - A global `New gift` command opening a side-panel front component proved to be a natural Twenty-native surface for manual gift entry.
   - The flow now supports donor + gift basics, explicit duplicate interruption, explicit donor choice, and final create inside the Twenty app/runtime boundary.

2. **The duplicate-check route/function pattern is strong enough for a first donor-resolution proof**
   - An app route/function can evaluate exact first-name / last-name duplicate cases against `person` records and return a transient resolution result cleanly to the front component.
   - This is a meaningful proof of an app-owned server-side decision boundary, even though it is still intentionally narrower than full donor-resolution logic.

3. **Metadata ownership in the app-dev workspace matters more than we first assumed**
   - The SDK-managed app-dev workspace on `http://localhost:2020` does not inherit fundraising metadata from the separate integrated/local workspace on `http://localhost:3000`.
   - The manual-entry proof only worked once the app itself created the minimal fundraising metadata slice it needed there, including an app-owned `gift` object plus relation to standard `person`.

4. **The first failed manual-entry commit was useful because it exposed the wrong migration boundary**
   - Calling back out from the app route to `fundraising-service` was the wrong default for this spike, even though it was closer to the current product implementation.
   - The better migration question is: how much of that product contract can be re-expressed inside Twenty apps before a hybrid boundary is truly required?

**Actions for our stack**

1. Treat `fundraising-service` as the source of truth for current product behavior, but default migration spikes to app-owned metadata + logic in the `2020` workspace unless a hybrid boundary is explicitly under test.
2. Reduce concern around Twenty apps supporting the core bounded batch executor shape:
   - batch-scoped processing, chunked batch create, split fallback, row fallback, and chunked writeback now look credible inside the app/runtime boundary.
3. Keep the remaining batch risk focused on execution lifecycle and robustness rather than basic batch API strategy:
   - longer-running bounded execution,
   - live operator trust during processing,
   - interruption/retry behavior,
   - and frontend host stability during heavy record updates.
4. Treat the current batch result as “partially proven, keep stress-testing” rather than either:
   - “still likely blocked,”
   - or “fully production-proven.”
5. Variables now look like a credible Twenty-native control surface for optional product capabilities:
   - feature visibility,
   - runtime behavior,
   - and enable/disable posture such as Gift Aid.
   They are still not proven as the right way to conditionally provision metadata.
6. Route-trigger webhook behavior is now clearer:
   - forwarded headers are supported when explicitly declared,
   - but route bodies are still parsed/normalized rather than preserved as clean raw bytes,
   - so Stripe-style strict signature verification remains a likely real platform constraint even though route-based intake itself looks viable.
2. Continue treating command-launched side-panel flows as a promising Twenty-native pattern for operator workflows that are not naturally record-page-first.
3. Keep future fundraising proofs metadata-first in the app-dev workspace; do not assume objects present in the `3000` workspace also exist in the SDK-managed app workspace.

---

## Latest Snapshot — 2026-03-23

**Context:** Updated `services/twenty-core` from merge commit `e7cd728154` to merge commit `6ae867744a` (local merge on 2026-03-23; fetched upstream head: `93de331428`).

**Highlights**

1. **SDK + scaffolder moved again, now to `0.8.0-canary.1`**
   - `twenty-sdk` and `create-twenty-app` both moved from `0.7.0` to `0.8.0-canary.1`.
   - The CLI surface was flattened again: `app:*` moved to `build` / `dev` / `publish` / `deploy` / `typecheck` / `uninstall`, `entity:add` became `add`, and `function:*` became `logs` / `exec`.
   - The old `auth:*` workspace-profile flow was replaced by `remote *` commands plus a local OAuth flow.

2. **The preferred app-dev workflow is now “local server + OAuth”, not “API key + remote workspace”**
   - Upstream docs and scaffolder output now assume a local Twenty dev server managed by the SDK.
   - New server commands (`server start|status|logs|stop|reset`) make the all-in-one local dev instance part of the official app workflow.
   - This matters operationally because it is a stronger signal about how the team expects app development to happen before broader hosted/app marketplace maturity.

3. **The app API surface is broader and more explicitly centered on `/metadata`**
   - SDK app operations now explicitly cover development app creation, application registration lookup/creation, tarball upload/install, application token generation, file upload, logic-function execution, and metadata schema introspection through `/metadata`.
   - `logicFunctionLogs` also appears in the metadata schema and the updated SDK now subscribes via `/metadata`, so our prior note that log streaming stayed on `/graphql` is stale.
   - `/graphql` still matters for generated core data clients, but the “app control plane” is now more clearly concentrated on `/metadata`.

4. **Manifest/app surface changed again, but mostly at the edges**
   - Navigation menu items now carry explicit `type`.
   - Command menu item manifests now support `shortLabel`.
   - These are real surface changes, but they do not materially change the fundraising-readiness posture by themselves.

5. **The main blocker for Stripe-style in-app webhook ingress still appears unchanged**
   - Route-trigger request events still normalize/parse the body into `LogicFunctionEvent.body` and do not expose preserved raw request bytes.
   - That means strict Stripe signature verification still looks like a likely real platform gap for a pure route-trigger implementation.
   - This upstream merge is useful for understanding Twenty’s direction, but it does not look like the missing raw-body primitive landed in this window.

**Actions for our stack**

1. Keep the explicit “watch and prepare” posture from `D-0019`; this is still not a migration go-signal.
2. Update internal notes that still assume `auth:*`, `app:*`, `entity:add`, `function:*`, or API-key-first local setup as the current app workflow.
3. Reconfirm gateway/proxy support for the effective app control-plane traffic shape:
   - `POST /metadata` JSON GraphQL
   - `POST /metadata` multipart upload (`uploadApplicationFile`, app tarball upload)
   - `/metadata` subscriptions / SSE for `logicFunctionLogs`
   - `/graphql` for generated core data clients
4. Keep treating route-trigger raw-body fidelity as a real watch item for Stripe and similar providers; do not assume this upstream merge removed that blocker.
5. The “related proof artifact” links in the previous snapshot are currently missing locally; either restore those spike docs or replace the links on the next cleanup pass so this watch log does not point at non-existent files.

---

## Latest Snapshot — 2026-03-16

**Context:** Updated `services/twenty-core` from `792c8a3c28` to merge commit `e7cd728154` (local merge on 2026-03-16; fetched upstream target: `5dfdc1d81d`).

**Highlights**

1. **SDK + scaffolder moved again, now to `0.7.0`**
   - `twenty-sdk` and `create-twenty-app` both moved to `0.7.0`.
   - The CLI now includes `app:publish` alongside `app:build`, `app:dev`, and `app:typecheck`.
   - Generated client imports moved toward `twenty-sdk/clients`, with docs positioning `MetadataApiClient` as SDK-shipped and `CoreApiClient` as generated during app build/dev.

2. **Distribution story is becoming more explicit**
   - Upstream docs now split Apps guidance into `getting-started`, `building`, and `publishing`.
   - `app:publish` supports npm publication or direct publish/install to a Twenty server.
   - Server-side application development/install plumbing looks more registration-aware, which suggests app lifecycle/distribution is becoming a more formal product surface rather than just local dev sync.

3. **Manifest/app surface expanded again with first-class agents**
   - Shared manifest types and syncable entities now include `agents` in addition to `skills`, `views`, `navigationMenuItems`, and `pageLayouts`.
   - The docs now describe both `defineSkill()` and `defineAgent()`, reinforcing the AI-assisted app surface as a packaging concern rather than only a workflow concern.
   - This is another readiness signal, but still not evidence that our fundraising UX/runtime requirements are ready to move in-app.

4. **The build/dev workflow remains a little easy to misread**
   - Documentation and command descriptions now emphasize build/publish/distribution more strongly.
   - However, the current `app:build` implementation still performs sync/generate/typecheck/rebuild/sync work, so it should not be treated as a purely local packaging command.
   - We should keep treating upstream app command semantics as something to verify in code, not infer from naming alone.

5. **No posture change yet, but the reasons are getting narrower**
   - The direction is still clearly toward richer packaged apps, packaged UI, and more formal install/publish flows.
   - The remaining blockers we care about still look like route-trigger raw-body fidelity, app-auth access to required REST/batch paths, and real UI/workflow parity for fundraising admin flows.
   - That means D-0019 still stays in “watch and prepare,” but with growing evidence that a future proof spike will be worth scheduling when the upstream surface stabilizes further.

**Actions for our stack**

1. Keep the explicit “watch and prepare” posture from `D-0019`; this is still not a migration go-signal.
2. Update internal notes that still refer to `twenty-sdk/generated`, `--interactive` scaffolding, or a pre-`app:publish` command surface.
3. Preserve the warning that gateway/proxy routing must continue to support both `/metadata` upload/sync paths and `/graphql` SSE log streaming.
4. Use the addition of `agents` plus the more explicit publish/install story as inputs for the next D-0019 re-review, without changing the readiness matrix status yet.

---

## Previous Snapshot — 2026-03-03

**Context:** Updated `services/twenty-core` from `e3ab3304e2` to `792c8a3c28` (merge commit on 2026-03-03; upstream parent merged: `2f09fb8c04`).

**Highlights**

1. **SDK + scaffolder moved to `0.6.3` and changed the default app workflow**
   - `twenty-sdk` and `create-twenty-app` both moved to `0.6.3`.
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

**Related proof artifact**

- A focused cloud-app fit spike was completed on branch `spike/twenty-apps-gift-staging-process`.
- That spike proved backend viability for the single-record `giftStaging -> process -> gift` path and captured the operational/runtime caveats discovered along the way.
- The detailed record lives in:
  - [`docs/spikes/twenty-cloud-app-fit-spike-2026-03-16.md`](/home/jamesbryant/workspace/dev-stack/docs/spikes/twenty-cloud-app-fit-spike-2026-03-16.md)
  - [`docs/spikes/twenty-cloud-app-fit-working-notes-2026-03-16.md`](/home/jamesbryant/workspace/dev-stack/docs/spikes/twenty-cloud-app-fit-working-notes-2026-03-16.md)
- Before starting a follow-on proof pass, return to that branch/docs rather than re-deriving the same baseline from scratch.

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
| Core API logic (gift/staging/batch) | Large existing domain code already in service classes (`gift.service.ts`, `gift-staging.service.ts`, batch services) plus pure logic modules. | Lift service methods into app logic-function handlers with thin adapters; keep most business logic files near-identical. | Throughput behavior under heavy concurrency when run as logic functions vs service processes; plus confirm app-auth can use core REST batch endpoints end-to-end. | REST permission resolution now explicitly handles application auth context via the app default role in `rest-api-base.handler`, so the remaining question is end-to-end behavior on the batch routes we actually need rather than obvious missing handler support. | `amber` | `services/fundraising-service/src/gift/gift.service.ts`, `services/fundraising-service/src/gift-staging/gift-staging.service.ts`, `services/fundraising-service/src/gift-batch/gift-batch-processing.service.ts`, `services/fundraising-service/src/gift-batch/gift-batch-donor-match.service.ts`, `services/twenty-core/packages/twenty-server/src/engine/api/rest/core/controllers/rest-api-core.controller.ts`, `services/twenty-core/packages/twenty-server/src/engine/api/rest/core/handlers/rest-api-base.handler.ts`, `services/twenty-core/packages/twenty-server/src/engine/core-modules/auth/strategies/jwt.auth.strategy.ts` |
| Webhook & route ingress | Existing Stripe/GoCardless handlers already isolate ingestion logic and mapping. | Re-host webhook endpoints as route-triggered logic functions, forwarding only needed signature headers. | End-to-end proof for our exact Stripe route flow, including required forwarded signature headers and verification against `event.rawBody`. | Route-trigger events now expose optional `rawBody` in `LogicFunctionEvent`, so the previous likely raw-body platform gap has been removed; the remaining question is app-level proof and route/header wiring. | `amber` | `services/fundraising-service/src/stripe/stripe-webhook.controller.ts`, `services/fundraising-service/src/stripe/stripe-webhook.service.ts`, `services/twenty-core/packages/twenty-shared/src/types/LogicFunctionEvent.ts`, `services/twenty-core/packages/twenty-server/src/engine/core-modules/logic-function/logic-function-trigger/triggers/route/utils/build-logic-function-event.util.ts`, `services/twenty-core/packages/twenty-apps/community/github-connector/src/modules/github/connector/webhook-signature.ts` |
| Runtime/dependencies | Existing app precedent already ships non-trivial code (`apps/core/rollup-engine`); platform supports dependency layers and configurable function timeouts. | Mirror rollup-engine pattern for fundraising domains; package shared domain modules and runtime config as app variables. | Need empirical limits profile for longest batch paths and worst-case retries. | Function timeout or dependency packaging limits force major logic redesign. | `green` | `apps/core/rollup-engine/serverlessFunctions/calculaterollups/src/index.ts`, `services/twenty-core/packages/twenty-server/src/engine/metadata-modules/logic-function/logic-function.entity.ts`, `services/twenty-core/packages/twenty-server/src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda.driver.ts` |
| UI surface | Existing UI is a service-hosted Vite admin app; Twenty front components and page-layout widgets are actively evolving. | Phase migration: API/runtime first; migrate UI slices to front components where ergonomics are proven. | Multi-screen fundraising admin UX parity (navigation/layout patterns) needs a concrete spike, not assumption. | Signal improved: app manifests/SDK now include views + navigation items + page layouts, but workflow-level UX parity is still unproven. | `amber` | `services/fundraising-service/src/main.ts`, `services/twenty-core/packages/twenty-docs/developers/extend/apps/building.mdx`, `services/twenty-core/packages/twenty-server/src/engine/metadata-modules/page-layout-widget/dtos/front-component-configuration.dto.ts` |
| Auth/security/compliance | Current service auth is middleware-based; app runtime issues scoped short-lived app tokens with role permissions and supports secret app variables. | Use app-role least-privilege model for logic functions; keep webhook auth/signature validation explicit per route. | Operational pattern for secret rotation + webhook auth hardening must be codified in runbooks. | App token generation/renewal surface is more explicit in SDK/server code, and REST permission resolution now recognizes application auth context, but our operational hardening model is still not codified. | `amber` | `services/fundraising-service/src/auth/auth.utils.ts`, `services/fundraising-service/src/auth/fundraising-auth.middleware.ts`, `services/twenty-core/packages/twenty-docs/developers/extend/apps/building.mdx`, `services/twenty-core/packages/twenty-server/src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service.ts` |
| Ops/observability/cutover | Strong current structured logs + runbooks; no phased cutover doc yet. | Define phased strangler plan (endpoint-by-endpoint), with reversible gates and parity checks. | Need a minimal phase plan + measurable cutover criteria before any migration start. | No agreed cutover gates by end-Feb. | `amber` | `docs/OPERATIONS_RUNBOOK.md`, `services/fundraising-service/src/logging/structured-logger.service.ts`, `docs/DECISIONS.md` (D-0017, D-0019) |

Notes for next reviews:
- Keep this matrix at planning level until D-0019 triggers indicate we should start concrete migration design.
- On each upstream sync, update only rows with new evidence (do not churn unchanged rows).
- Treat “code movement required” separately from “platform capability missing.” We only escalate `red` for the latter.

### Blocker review status (assumption vs actual gap)

Use this classification to avoid mixing platform gaps with our own migration work.

- **Needs proof (not proven platform gaps yet)**
  - Route-trigger webhook ingress for our exact Stripe flow, including forwarded signature headers and verification against `event.rawBody`.
  - Full fundraising metadata lifecycle parity (install/update/uninstall) across our complete schema.
  - Batch throughput/retry parity under our production-style workloads, including end-to-end proof that app-authenticated logic functions can use the concrete core REST batch paths we need.
  - UI/navigation/page-layout ergonomics for selected fundraising workflows (if/when we choose to test UX migration slices).
- **Primarily our migration/ops work (not Twenty platform blockers)**
  - Secret rotation and webhook hardening runbooks.
  - Phased cutover plan, rollback criteria, and parity checks.
  - Operational observability/cutover policy for hybrid-to-app migration.

### Validation timing (intentional deferral)

- We are moving out of pure deferral mode and toward a first focused migration proof.
- Keep proof work narrow and evidence-driven: validate one bounded functionality slice rather than treating an early spike as a platform-wide green light.
- Continue collecting code-level evidence in this doc while maintaining the hybrid delivery path until that first proof is convincing.

### What would count as truly missing (not just “not migrated yet”)?

- Inability for app-authenticated logic functions to use required high-throughput core APIs (for example `/rest/batch/*`) with app-role permissions.
- Inability to represent critical fundraising UI workflows in supported front-component/page-layout surfaces.
- Runtime/dependency limits that force a fundamental redesign of existing batch/ingestion logic.

---

## Snapshot History

- Use git history: `git log -- docs/TWENTY_EXTENSIBILITY_WATCH.md`.
