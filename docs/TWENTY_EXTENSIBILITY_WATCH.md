# Twenty Extensibility Watch

_Living log of notable changes inside `services/twenty-core` that affect how Twenty Apps is evolving and where breaking changes are likely to appear._

## Scope (important)

- This document tracks Twenty’s extensibility surface, direction of travel, and likely breaking-change signals.
- It is **not** a migration plan for moving `services/fundraising-service` into Twenty Apps.
- It is also **not** the primary home for current `nonprofit-fundraising` review guidance; use `docs/apps-migration/REVIEW_POSTURE.md`, `APP_HARDENING_REVIEW_RUBRIC.md`, and `APP_HARDENING_BACKLOG.md` for that.
- For app scaffolding and day-to-day app setup/build workflow, treat the official Twenty docs as canonical and use this log only for version-sensitive observations, drift, and migration implications:
  - `https://docs.twenty.com/developers/extend/apps/getting-started`
  - `https://docs.twenty.com/developers/extend/apps/building`
- Keep CRM/runtime versioning separate from app-tooling versioning in this log. The Docker/runtime image tag and the SDK/scaffolder/CLI version may move independently and should not be treated as the same version signal.

## Cadence & Process

- **Frequency:** every ~2 weeks (or after major Twenty releases).
- **Steps:** `git fetch upstream`, check out `upstream/main`, skim `packages/twenty-apps`, `packages/twenty-cli`, `packages/twenty-sdk`, and related commits; capture highlights and open questions below.
- **Output:** summarize deltas here, call out likely breaking changes, and note any current-reference patterns worth mirroring in our app code or docs.

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
   - If the CLI endpoints change (`/metadata` vs `/graphql`/subscriptions), confirm our gateway routing still supports them.

## Weekly Update Mode (lightweight)

When updating this doc in regular syncs, keep it lightweight:

1. Capture upstream delta (new `services/twenty-core` head + date).
2. Refresh only the baseline details or snapshot sections that materially changed.
3. Add 2-4 bullet highlights on direction, drift, or breaking-change signals.
4. Record only current implications; skip deeper migration design discussion.

## Current Extensibility Surface (baseline verified 2026-06-05)

- **twenty-cli** (packages/twenty-cli):
  - Now deprecated in favor of `twenty-sdk` (see `packages/twenty-cli/README.md`).
  - Command name stays `twenty`, but install guidance now points to `npm install -g twenty-sdk`.
- **twenty-sdk** (packages/twenty-sdk):
  - Current package version in-tree: `2.10.0` (current merged repo head is ahead of the latest release tag `v2.9.0`, so repo head, runtime tag, and published package version still need to be treated as distinct signals).
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
  - Current package version in-tree: `2.10.0`.
  - Scaffolder now defaults to a minimal app plus test scaffold; richer starting points are example-based (`--example hello-world`, `--example postcard`) rather than `--exhaustive` / `--minimal` mode selection.
  - Scaffolds a single Yarn entrypoint script (`yarn twenty <command>`) instead of many per-command wrappers.
  - Default scaffold now includes application config, a default role, schema/integration test scaffolding with dedicated test-instance setup, and local CI/CD workflow templates; scaffolded source now uses the split SDK import paths (`twenty-sdk/define`, `twenty-sdk/front-component`) consistently.
  - Scaffolder guidance now offers to start a local Twenty dev server automatically, and the documented manual path uses `yarn twenty server start` plus `yarn twenty remote add --local`.
  - Template dependency currently uses `twenty-sdk: latest` (watch for docs/runtime drift when reproducing examples across versions).
  - Newer scaffold direction now includes a more opinionated app shell by default: a standalone page layout, a front component, a navigation menu item, and the supporting universal identifiers for those entities.
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
  - CLI naming is still evolving: newer `twenty-sdk` docs and code now prefer colon-style command groups (`docker:*`, `app:*`, `dev:*`, `remote:*`) while older flat commands remain available as deprecated wrappers. Treat repo-local runbooks and prompts as version-sensitive here.
  - Recent SDK changes are now more about package shape, import boundaries, OAuth/registration plumbing, and install/validation ergonomics than about obvious new fundraising-specific platform primitives.
  - Docs/examples move quickly and can drift between releases; verify against `packages/twenty-docs` and `packages/twenty-sdk/README.md` after each upstream sync, especially around CLI/scaffolder command names.

---

## Latest Snapshot — 2026-06-05

**Context:** Updated `services/twenty-core` from merge commit `ca3e3aea8f` to merge commit `128d2d394d` (local merge on 2026-06-05; fetched upstream head: `cd540098f1`; local tags now include `v2.9.0`; in-tree `twenty-sdk`, `create-twenty-app`, and `twenty-client-sdk` package versions are `2.10.0`).

**Highlights**

1. **View augmentation became more granular**
   - Upstream added `defineViewField()`, which lets apps add fields to existing views without redefining whole views.
   - Practical read: this is one of the strongest incremental UI-extension signals we have seen so far, especially for app slices that want to augment existing record/list surfaces rather than replace them.

2. **Agents are moving closer to normal logic-function workflows**
   - The SDK now includes `runAgent()` for calling app agents from logic functions.
   - Practical read: Twenty is continuing to converge agents, skills, and logic functions into one app-authoring surface rather than leaving agents as a separate novelty feature.

3. **HTTP trigger control is still evolving**
   - Upstream added more control on HTTP triggers/routes.
   - Practical read: route-trigger ergonomics are still changing, so app HTTP/webhook flows remain an area where we should expect ongoing surface drift between releases.

4. **Command-menu and conditional-availability behavior are still active change areas**
   - This range includes command-menu display refinements plus docs clarifying `RECORD_SELECTION` semantics.
   - It also tightens conditional-availability usage so certain variables are no longer valid at runtime.
   - Practical read: command visibility, placement, and gating should continue to be treated as regression-test targets after upgrades.

5. **The in-tree app toolchain has moved on again beyond the latest release tag**
   - Runtime/release line: `v2.9.0`
   - In-tree app-tooling line: `2.10.0`
   - Practical read: version drift is now normal enough that runtime choice and app package choice need to stay explicit rather than inferred from the checked-out repo alone.

6. **New reference apps keep arriving**
   - A new internal People Data Labs app landed in this range.
   - Practical read: the best current app examples continue to be the internal apps rather than older scaffolds alone.

**Current implications**

1. Treat `defineViewField()` as the most interesting new app primitive in this range.
2. Keep command-menu and conditional-availability behavior on the short list of post-upgrade regression checks.
3. Keep HTTP-trigger/webhook flows in the “expect drift, verify in practice” bucket.
4. Continue treating runtime tags and published app package versions as separate decisions.

---

## Latest Snapshot — 2026-05-29

**Context:** Updated `services/twenty-core` from merge commit `671cd5e32b` to merge commit `ca3e3aea8f` (local merge on 2026-05-29; fetched upstream head: `10c0bed462`; local tags now include `v2.8.0` and `v2.8.1`; in-tree `twenty-sdk`, `create-twenty-app`, and `twenty-client-sdk` package versions are `2.9.0`).

**Highlights**

1. **Permission flags are now a first-class breaking-change surface**
   - `v2.8.0` and `v2.8.1` continue the permission-flag transition, including a new system for apps to define permission flags and a default-command-menu gating change.
   - Practical read: this is the most important structural signal in the new release line for `nonprofit-fundraising`, because it affects app privilege shape directly rather than just runtime ergonomics.

2. **Command-menu behavior is getting more explicit and more visible**
   - The release notes now call out better command-menu display in the right panel and default command-menu item gating by permission flag.
   - Practical read: our explicit `defineCommandMenuItem()` wiring remains the right pattern, but we should keep watching for visibility/gating shifts in newer app toolchains.

3. **App file storage is now split out more clearly**
   - The upstream app surface added a dedicated application file storage service.
   - Practical read: that is a meaningful platform direction signal for uploaded app assets and anything that stores or serves app-owned files, even if it doesn’t change our current fundraising flows immediately.

4. **Install/publish flow is still moving toward tarball-first distribution**
   - Release notes and docs now emphasize install via tarball download instead of `yarn install` for app distribution.
   - Practical read: this reinforces that the local app toolchain and the server-side install path are continuing to separate, so our docs/runbooks should stay version-sensitive here.

5. **The package/tooling surface has moved on again, but the app-shape direction is consistent**
   - `twenty-sdk`, `create-twenty-app`, and `twenty-client-sdk` are all now `2.9.0` in-tree.
   - The same core themes continue: explicit command menu items, richer app shell scaffolding, clearer permission boundaries, and newer internal apps as better reference points.

**Current implications**

1. Treat permission flags as the main item to watch in this release line.
2. Keep command-menu-item files as the canonical pattern and watch for visibility/gating behavior changes.
3. Keep app-file storage and tarball install flow in mind when reviewing anything that touches uploaded assets or distribution mechanics.
4. Update local notes that still assume `2.7.x` tooling; the in-tree app packages are now on `2.9.0`.

---

## Latest Snapshot — 2026-05-23

**Context:** Updated `services/twenty-core` from merge commit `b1c6338ed2` to merge commit `671cd5e32b` (local merge on 2026-05-23; fetched upstream head: `452433a9ae`; local tags now include `v2.5.4`, `v2.6.1`, and `v2.7.0`; in-tree `twenty-sdk` and `create-twenty-app` package versions are `2.7.0`).

**Highlights**

1. **The app CLI is standardizing around colon-style command groups**
   - Upstream now documents and implements grouped commands such as `twenty docker:start`, `twenty docker:upgrade`, `twenty app:publish`, `twenty app:install`, `twenty dev:build`, `twenty dev:fn-exec`, and `twenty remote:add`.
   - The older flat commands still appear to exist as deprecated wrappers.
   - Practical read: for current local workflows, keep using whatever is already proven in this repo, but expect docs/examples and future support to keep shifting toward the colon-style command families.

2. **The default scaffold is becoming a fuller “app shell”, not just a minimal manifest**
   - `create-twenty-app` now scaffolds a standalone page layout, a front component, a navigation menu item, and the supporting universal identifiers by default.
   - Practical read: Twenty is leaning harder into an opinionated native landing-page/app-shell model for new apps.
   - For `nonprofit-fundraising`, this is mostly reassuring because our newer donation-form/navigation/layout work already follows the same composition style.

3. **Role and permission-flag evolution is still the main structural area to watch**
   - This range includes an explicit breaking-change commit: `3bda05ea57 [Breaking change] Prepare non-system permission flags`.
   - New internal apps show a mixed pattern:
     - some apps still use broad application roles
     - others now use much tighter `objectPermissions` and empty `permissionFlags`
   - Practical read: this is the one area where a future pre-v1 hardening pass could still pay off materially for our app, because it affects long-term privilege shape rather than just UI/runtime ergonomics.

4. **New internal apps provide better reference points than the older generic examples**
   - New internal apps such as `twenty-slack`, `twenty-fireflies`, and `twenty-partners` now demonstrate:
     - connection-provider usage
     - secret/server variable usage
     - app-owned navigation/layout structure
     - logic-function-heavy integrations
   - Practical read: when we need current reference patterns, these newer internal apps are now higher-signal than some of the older hello-world style examples.

5. **No new immediate platform signal forces a structural rewrite of our app**
   - Donation-form layout/navigation composition looks aligned with current scaffold direction.
   - Secret-variable handling is now materially better than in the `v2.4.0` period.
   - Command-menu-item direction continues to reinforce the explicit top-level command pattern we already adopted.
   - The main remaining “watch carefully” topic is role/permission evolution, not the broader app shape.

**Current implications**

1. Keep the watch doc focused on latest upstream direction and version drift, not current app recommendations.
2. Treat colon-style CLI commands as the likely future canonical form, but only migrate repo-local runbooks when there is a clear benefit.
3. Use the newer internal apps as reference when reviewing:
   - role/permission shape
   - server/application variable usage
   - connection-provider structure
   - app-owned page/navigation composition
4. Keep role/permission hardening as the most likely pre-v1 structural question worth revisiting.

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

**Current implications**

1. Use `v2.5.0` code as a reference point for the structural app review, not as an automatic runtime-upgrade target.
2. Prefer explicit `defineCommandMenuItem()` files anywhere we still rely on command-like front-component wiring.
3. Keep secret application variables in the “upstream behavior still moving” bucket until Twenty confirms or we prove the current fix path against our exact repro.
4. During review, separate “must align now because Twenty is clearly standardizing here” from “interesting new platform capability but not worth churn before v1”.

---

## Snapshot History

- Use git history: `git log -- docs/TWENTY_EXTENSIBILITY_WATCH.md`.
