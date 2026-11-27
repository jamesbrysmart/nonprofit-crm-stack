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

- **Frequency:** roughly weekly while the platform is moving quickly, otherwise after major Twenty releases.
- **Steps:** check the parent and reference checkout state, fetch upstream and release tags, merge `upstream/main` into the local reference branch, then review `packages/twenty-apps`, `packages/twenty-cli`, `packages/twenty-sdk`, and related commits. Keep the superproject's recorded Twenty pointer unchanged unless explicitly requested.
- **Output:** summarize deltas here, call out likely breaking changes, and note any current-reference patterns worth mirroring in our app code or docs.

## Review Checklist (run on every upstream sync)

1. **Record the baseline**
   - Current submodule head: `git -C services/twenty-core log -1 --oneline`
   - Current image tag (if relevant): check `.env` `TAG=...` and/or release notes.
2. **Fetch + merge upstream**
   - `git -C services/twenty-core fetch upstream`
   - `git -C services/twenty-core merge upstream/main` (or rebase if that’s your policy)
3. **Scan the extensibility-relevant diff**
   - `git -C services/twenty-core diff --name-status ORIG_HEAD..HEAD -- packages/twenty-cli packages/twenty-sdk packages/twenty-client-sdk packages/twenty-ui packages/twenty-apps packages/twenty-docs/developers/extend packages/twenty-shared/src/application packages/twenty-server/src/engine/core-modules/application packages/twenty-server/src/engine/permissions packages/twenty-server/src/modules/workflow`
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

## Monthly Consolidation

At the first review after a month closes:

1. Consolidate that month's individual updates into one `Monthly Snapshot — YYYY-MM`.
2. Summarize settled capability changes, breaking-change signals, product direction, and only the implications that remain relevant.
3. Move durable present-day facts into `Current Extensibility Surface` instead of repeating them in history.
4. Delete superseded predictions, completed upgrade actions, and duplicate observations rather than preserving a release diary.
5. Keep individual snapshots only for the current month. Delete older monthly snapshots once their remaining conclusions are fully represented by the current baseline or later history.

## Current Extensibility Surface (baseline reviewed 2026-11-22)

- **twenty-cli** (packages/twenty-cli):
  - This package implements the standalone npm package `twenty`, declared at `2.61.0` on current main and the fetched `sdk/v2.61.0` tag. The dedicated `cli/*` tags alone no longer describe the newest package source; registry availability remains a separate check. The app supplies its own SDK, TypeScript compiler, and generated client dependencies.
  - It adds workspace commands for authentication, metadata, records, API requests, and diagnostics, plus `twenty app init|build|typecheck|plan|apply|dev|pull|exec|install|uninstall|publish|generate-client`, translations extraction, and function logs. Publishing supports npm or the selected Twenty server's private registry; installing uses the registered package rather than local source.
  - SDK `2.52` removes the deprecated executable and programmatic CLI exports and retires `create-twenty-app`. Our app now installs SDK/client/UI `2.59.0`, declares Twenty `>=2.59.0`, and uses `recordsPermissions`, record-event declarations and native UI. The global CLI still reports `2.57.0` on 22 November; app checks were not rerun in this review. Older CLI-migration evidence used `2.49.0`; it is not proof of the current combination.
  - Released-source Docker management uses `twenty local start|status|logs|stop|upgrade|reset`, with a separate `--test` instance on port 2021. Our installed CLI `2.57.0` exposes these commands in help; no Docker operation or runtime compatibility check was performed. Existing-container start preserves its version; upgrades are explicit, and reset deletes data.
  - Fetched `2.59` adds proxy-auth headers/refresh commands for protected servers, CSV record export with server-enforced permissions, and cascade-aware plan display. Folded dependent deletions are still deletions; inspect the named data loss and full plan rather than interpreting fewer displayed blocks as a safer migration.
  - Fetched `2.61` bounds observation of external imports during `app dev` and adds `--verbose` / NDJSON watch-scope diagnostics. Missing/excluded external paths may require correcting the import then editing an app file or restarting the watcher; this is not a reason to watch the whole workspace indiscriminately.
  - The current integration-test template uses a `run-twenty.ts` subprocess helper with JSON output and `TWENTY_API_URL`/`TWENTY_API_KEY`, rather than `twenty-sdk/cli` imports or a generated home-directory test config. `TWENTY_CLI` can select an explicit standalone executable. App authoring/build support is documented for Linux/macOS and WSL 2 on Windows.
- **twenty-sdk** (packages/twenty-sdk):
  - Current main and latest fetched SDK/runtime tags declare `2.61.0`; tag/source state does not prove npm or Docker availability. The SDK currently declares Node `^24.5.0 || ^26.5.1` and Twenty `>=2.57.0`. New capabilities can require a newer server than that minimum, notably `recordsPermissions` and full source-inventory uploads on `2.59`.
  - Authoring/runtime APIs remain under `twenty-sdk/define`, `twenty-sdk/front-component`, `twenty-sdk/logic-function`, `twenty-sdk/billing`, and `twenty-sdk/utils`. There is no root export; `twenty-sdk/ui` remains removed in favor of direct `twenty-ui` imports.
  - Released SDK `2.52` removes the executable, `twenty-sdk/cli`, `twenty-sdk/build`, and its build descriptor. Authoring/runtime exports remain. The retained renderer build helper is not a replacement for the general programmatic build API.
  - The standalone CLI uses `twenty app plan` for a read-only remote preview and `twenty app apply` for one-shot sync; `twenty app dev` watches changes. These replace the older SDK CLI command families rather than merely renaming `dev --once`.
  - Current `plan`, `apply`, and `dev` use `--no-prune` to retain omitted entities (`--no-delete` remains an alias). Normal apps still delete missing definitions by default; from `2.53`, the workspace Custom application is additive unless `--prune` is explicit. Do not assume the Custom app's safer default applies to a distributed app.
  - `twenty app pull` exports metadata, workflows, agents, skills, translations and stored dependencies/assets. `2.60` restores inventoried front-component imports/config/styles/assets; `2.61` adds logic-function definitions and local imports. Supported definition syntax and fresh, matching inventories are required; older deployments remain entry-only until reapplied/published. Source/assets/dependency files share a 12 MiB encoded-file budget. Unsupported entities, missing inventories and some widget/configuration surfaces remain gaps. Pull can overwrite files and is not a complete backup; keep checked-in source authoritative and inspect coverage plus a plan before pruning.
  - `twenty app generate-client` fetches the app-scoped GraphQL schema and regenerates the app's installed client without another sync. Apply/dev also generate it after synchronization.
  - API boundaries remain `POST /metadata` for app lifecycle, function execution, schema and upload reservation/completion, and `POST /graphql` for core records.
  - Keep `twenty-sdk` and `twenty-client-sdk` in `devDependencies`. SDK/client runtime modules are supplied by Twenty; install the standalone CLI separately and pin it explicitly in CI.
  - Renderer build helpers remain exported through `twenty-sdk/front-component-renderer/build`; their presence does not preserve the removed general programmatic build API.
- **twenty-ui** (packages/twenty-ui):
  - This is a real Twenty-owned component/theme system, not just CSS:
    - package exports include `./style.css`, theme styles, `components`, `icon`, `theme`, and grouped primitive families under `primitives/*`.
    - the current scaffold imports front-component UI from paths such as `twenty-ui/primitives/data-display` and `twenty-ui/icon`.
  - Practical read for app work: direct `twenty-ui` imports are the intended native UI surface, not `twenty-sdk/ui`. Fundraising now depends on `twenty-ui` `2.59.0`; its app-local `ActionButton` renders the native `Button` rather than the old plain-button mitigation, and package configuration opts into shared frontend dependencies. Source inspection confirms adoption, not runtime proof of a later SDK/server combination.
  - From the fetched `2.55` line, named icons stay under `twenty-ui/icon`, but dynamic `Icon`, `IconsProvider`, and `useIcons` move to `twenty-ui/icon/provider`. Front components should use individual named imports rather than bringing in the entire icon catalog through the provider entry point.
  - The `2.40` line corrected the previously published AGPL package metadata by republishing `1.0.0-alpha.2` under MIT. Stable `2.41` aligned `twenty-ui` with the SDK version and reorganized imports under `twenty-ui/primitives/*`; `2.42` and `2.43` continued separating primitives from composed components. Treat the exact package version and subpath API as a matched set when adopting it.
- **App scaffolding:**
  - Use `twenty app init` from the standalone CLI. Since `2.52`, the retained `create-twenty-app` package only prints migration instructions and exits unsuccessfully without creating files.
  - The current template root is `packages/twenty-cli/app-template`; current main separates the optional example under `example/files`, including its unit/integration setup and workflow templates. Generated packages pin SDK/client/UI versions. Do not remove product tests just because a new blank scaffold omits the example.
  - Fetched `2.59` moves the template's `.nvmrc` and upstream apps to Node `26.13.1`. Node 24 remains within the SDK's declared authoring range; the template change alone is not proof that our Node `24.9.0` must be replaced.
  - Existing apps should compare against the selected released template rather than recreating the app or regenerating identifiers. Linux/macOS are the supported build hosts; use WSL 2 on Windows.
- **Manifest/build surface (as of current code):**
  - Manifest shape in `packages/twenty-shared/src/application/manifestType.ts` is:
    `application`, `workflows`, `objects`, `fields`, `indexes`, `logicFunctions`, `frontComponents`, `permissionFlags`, `roles`, `skills`, `agents`, `connectionProviders`, `messagingProviders`, `mcpServers`, `publicAssets`, `sourceFiles`, `views`, `viewFields`, `navigationMenuItems`, `pageLayouts`, `pageLayoutTabs`, `pageLayoutWidgets`, `commandMenuItems`, `timelineActivityTypes`, `settingsMenuItems`, `relatedRecordPaths`, `validationRules`, `translations`.
    (Notably, prior `sources` entry is no longer present in this manifest type.)
  - `ApplicationManifest` in `applicationType.ts` now includes optional embedded `postInstallLogicFunction`, `preInstallLogicFunction`, `uninstallLogicFunction`, `healthCheckLogicFunction`, and legacy `settingsFrontComponent` manifests alongside `packageJsonChecksum` / `yarnLockChecksum`; these lifecycle entities are auto-detected rather than referenced in `defineApplication()`.
  - Field manifests now support `isUnique`, which matters for representing app-owned schema constraints without falling back to post-sync/manual metadata edits.
  - Fetched `2.56` adds `defineValidationRule()` and the `ruleExpression` builder, with rules packaged against app-owned or standard objects. Expressions compile to strings and sync preserves existing admin activation state. Enforcement still requires the workspace's validation-rules entitlement, but no longer the record-creation-form feature flag. See [the native reference](apps-migration/TWENTY_NATIVE_REFERENCE.md#6c-native-validation-rules) before choosing this instead of application validation.
  - `previous.<field>` / `ruleExpression.previous()` supports transition checks. From fetched `2.60`, `daysSince()` is removed: use `dateDiff(date, now, 'DAY')`; `dateAdd`, `dateTrunc`, `datePart` and relative-date ranges broaden the date surface. Date equality/ordering now compares UTC days or instants rather than timestamp spellings, which can change existing rules/trigger conditions. This remains record validation, not cross-record transaction orchestration.
  - Stable manifest fidelity also expanded with application billing configuration, connection-provider logos, object/field label-sync settings, object color and image identifiers, and richer permission flags. These are additive capabilities rather than required migrations for existing apps.
  - Fetched `2.61` adds `billing.prices` for USD recurring flat/member/connected-account prices on the workspace's Twenty subscription. Billing is off by default behind `IS_APPLICATION_PRICE_BILLING_ENABLED`; published installs retain their installed price snapshot across app upgrades. Local dev sync is not billed. This is a distribution capability to evaluate with Twenty, not evidence that paid Marketplace billing is generally available.
  - Fetched `2.59` consolidates role record access under `recordsPermissions`: all-object grants, per-object grants, unreadable/uneditable fields and nested row-level rules. Legacy flat grant properties remain accepted with warnings but cannot be mixed with the new block. Create defaults to update when omitted. Preserve retained permission identifiers and require server `>=2.59.0` when adopting the new shape; row-level enforcement remains entitlement-dependent.
  - Object restrictions use `disabledObjectPermissionActions` (`2.53`) and field restrictions `disabledFieldPermissionActions` (`2.54`). The fetched `2.55` line removes legacy readability/writability/sharing properties; `2.57` separates create/update behind `IS_CREATE_RECORDS_PERMISSION_ENABLED`. In `2.58`, old current-user `objectPermissions`/`objectsPermissions` GraphQL fields are removed: use `objectRecordsPermissions` rather than relying on the previous deprecation bridge.
  - `defineRelatedRecordPath()` declares up to three relation hops. The guide still labels permission use preview/not enforced, but fetched `2.58` source now implements known-record, listing and event access behind `IS_RELATED_RECORD_PATHS_ENABLED` and related access-group machinery. Treat this as gated implementation with stale guide wording, not generally available access or a safe substitute for explicit app grants.
  - App-owned select options now retain workspace label/color/order/activation overrides across sync; workspaces may add their own options but cannot remove app options or change their values. Metadata exposes read-only activation/ownership state. Stable option values remain domain identifiers; test custom selectors and workflow assumptions against deactivated/added options rather than expecting a sync to reset them.
  - Rich text storage moved to TipTap in runtime `2.51`. `markdown` remains a supported write/read format; `blocknote` is deprecated and converted when supplied, but is cleared by writes in another format. Apps should not depend on BlockNote reads remaining populated after a user edits a record.
  - View manifests now include first-class sort definitions (`sorts`) in addition to fields, filters, filter groups, groups, and field groups, which is a meaningful signal that list/view configuration is part of the supported app model rather than incidental server state.
  - Fetched `2.59` adds non-canonical view columns and `relationTargetFieldMetadataUniversalIdentifier`: an extra many-to-one column can display a non-relation field on the target record. `isCanonical` is creation-time state, cannot be used on the label field, and extra columns are not supported in widget views. Grouped table/list views can use `shouldDisplayGroupsAsTabs`, still behind `IS_RECORD_GROUP_TABS_ENABLED`.
  - Fetched `2.61` adds related-field sorting through `ViewSortManifest.relationTargetFieldMetadataUniversalIdentifier`. Runtime `2.60` adds native filter/sort settings to record-page relation tables, and nested one-to-many queries now honour `filter`, `orderBy` and `first`; test actual result ordering/counts, not just compilation.
  - Page layout tabs are now first-class manifest entities rather than only inline layout structure, which materially improves the “augment an existing Twenty record page” story for incremental UI migration.
  - Standalone page-layout widgets are also first-class manifest entities, allowing an app to add a widget to a tab it does not own without redefining the tab. Runtime `2.40` additionally introduces simpler inline vertical-list authoring based on array order and top-level `heightBehavior`; explicit positions and Canvas tabs remain supported but receive migration guidance.
  - Stable `2.49` exposes `defineWorkflow()` and removes the application-workflow feature flag. Apps can author manual, cron, database-event, and webhook triggers with stable identifiers. Workflows execute with the owning application's permissions; full-sync removal deletes versions and run history, while `--no-delete` preserves omitted workflows. Since `2.52`, application workflows support native send-email, draft-email and create-calendar-event steps with the corresponding tool permission flags; `2.53` adds round-tripping builder workflows. Account handles resolve workspace-shared accounts at sync time; do not hardcode another workspace's account IDs. Webhook manifests currently provide no authentication option, so they are not an authenticated intake boundary by themselves.
  - Fetched `2.56` makes workflow `CODE` steps own their source and distinguishes inline AI Generate steps from app-agent steps. Generate steps carry their own instructions/model and restrictive permission scope; agent steps reference an app agent. Existing workflow definitions need a focused comparison before adoption; fundraising currently declares neither workflows nor agents.
  - `definePageLayout()` now accepts `isFirstTabPinned: false` to start a new layout with full-width tabs. This property remains workspace-owned: later app sync preserves the workspace's setting instead of imposing the manifest value on existing layouts.
  - The old SDK build wrote `.twenty/output/manifest.json`. Standalone `twenty app build` instead reports a temporary snapshot under `.twenty/cli/snapshots` and deletes it when finished; do not assume that command leaves a deployable archive or persistent manifest at the old path.
  - Build/upload remains file-oriented, but application files and tarballs now reserve direct storage uploads and confirm them through metadata mutations rather than transiting through multipart API requests. Upstream documents npm, tarball, and server installation paths around that build output.
  - Fetched `2.59` adds a source inventory retaining entry files, reachable local helpers/types, TS config, CSS and assets at their original paths. Published file allowlists must include retained sources; source/bundle collisions fail builds. Uploading the expanded inventory with CSS/JS/images/fonts requires server `>=2.59.0`; the CLI does not silently omit these for older servers. Audit actual package contents, and do not confuse retained source with complete pull/recovery support.
  - Current build/publish docs use `twenty app build`, `twenty app publish`, and `twenty app install`, with explicit semver rules. Public npm publishing and private server registration are distinct from installing or applying local source.
- **Front component packaging:**
  - `twenty-sdk` exports `./front-component-renderer/build` in addition to `./front-component-renderer`; `./ui` has been removed.
  - Apps can opt into a checksum-addressed per-app dependency bundle through `frontComponentSharedDependencies` in `package.json`. From `2.54`, the server builds these dependencies from the app's stored lockfile; current main also preserves dependency export maps. SDK/client modules remain runtime-provided and cannot be listed there. Published packages now include `yarn.lock`, and installed dependency files/checksums are validated.
  - The front-component entry point provides action/API helpers (`navigate`, `openSidePanelPage`, `enqueueSnackbar`, etc.) alongside runtime hooks.
  - Front-component authoring/imports are now expected to use `twenty-sdk/front-component` for runtime hooks/actions and `twenty-sdk/define` for the definition wrapper, which is a meaningful packaging clarification for any app code we write locally.
  - Front-component command manifests now include `GLOBAL_OBJECT_CONTEXT`, and navigation menu items can target a specific `pageLayoutUniversalIdentifier`, which is a meaningful UI/navigation signal for app-driven record surfaces.
  - Fetched `2.56` adds native-page navigation targets, including Workflows. Fetched `2.57` exposes `currentView` (`id` and `universalIdentifier`, or `null`) in command availability/pinning expressions, enabling view-specific actions without route-string checks.
  - Fetched `2.60`/`2.61` adds sidebar tabs, sections and built-in section keys behind `IS_CUSTOMIZABLE_SIDEBAR_ENABLED`, with drag/drop, mobile tab access and restoration of hidden standard items. Manifest parenting now uses `parentUniversalIdentifier`; `folderUniversalIdentifier` is deprecated but still normalised. Sidebar tabs are not record-page layout tabs; check the target server/flag and actual placement before changing app navigation.
  - The layout surface now also supports `definePageLayoutTab()`, which lets an app attach a tab with widgets to an existing standard or app-owned page layout without replacing the whole layout.
  - Front-component widgets can reference command menu items for native widget-header actions through `headerCommandMenuItemUniversalIdentifiers`.
  - Since `2.47`, `widgetAvailability` controls layout-editor picker discovery: opt into record pages (optionally restricted to objects) or dashboards. Omitting it hides the component from pickers; existing placements, app-owned layouts, settings, commands, and timeline rendering keep working. Apps must explicitly declare the components users should be able to add themselves.
  - Front components can read the selected object's id and singular/plural names through `useSelectedObjectMetadata()`. Logic-function tools can also nominate a front component to render their calls in AI chat and expose that call through `useToolCall()`.
  - `useLocation()` exposes the host page's origin, pathname, search, and hash, returning `null` on older hosts. Use this when a widget needs the CRM URL; a worker's own `globalThis.location` is not the supported host-route API.
  - `useSelectedRecordsFilter()` represents either explicitly selected IDs or the view's filters/search minus unticked rows under Select all. Older servers return `null`. Bulk components must adopt the filter deliberately; existing ID-only handlers do not gain Select all support automatically.
  - The current docs now treat command menu items as a first-class app entity paired with front components via `defineCommandMenuItem()`, and the manifest builder emits a dedicated top-level `commandMenuItems` array. Practical read: treat embedded `command` blocks on front components as legacy/version-sensitive unless verified against the active runtime.
  - Apps can declare multiple workspace- or user-scoped settings entries with `defineSettingsMenuItem()`, each backed by a front component. The older single `defineSettingsFrontComponent()` path is deprecated but remains supported.
  - Feature-flagged App preferences now displays installed apps' USER settings pages or an automatically generated USER-variable form. Saving those variables requires `CONNECTED_ACCOUNTS` (labelled User Apps) in the effective user/app roles; `APPLICATIONS` is labelled Workspace Apps.
- **Tools/AI workflow integration:**
  - Logic-function handlers now receive a typed execution context containing retry state, workspace identity, and the triggering workspace member/user-workspace identity when one exists.
  - `CoreApiClient`, `MetadataApiClient`, and `RestApiClient` default to the triggering person's access intersected with the app role; `{ runAs: 'application' }` explicitly selects the app's own role. Runs without a person, such as cron and unauthenticated webhooks, default to app access.
  - `2.57` backfills a separate workspace-owned application grant role; `2.58` resolves runtime app authority through that grant rather than directly through the manifest's requested role. Requested and effective roles are distinct identities: include grant/permission migrations in plan and restricted-user/background execution tests, without blanket elevation.
  - When operators configure `SERVER_INTERNAL_URL`, logic functions receive `TWENTY_INTERNAL_API_URL` and native clients prefer it. Handwritten transports must distinguish private API calls from public browser/webhook URLs. Our app's manual REST wrappers warrant comparison on a future transport review, not an unconditional URL replacement.
  - Installed-application tokens are now refused for many administration operations, including app installation/distribution, registration writes, role management, membership writes, and workspace/billing changes, even when an app role includes the corresponding flag. Supported data, function execution, and selected app-owned configuration operations remain available; a broad role does not grant general workspace administration.
  - Workflow APIs are now core-only. Installed apps cannot create or edit workspace-owned workflows through records/core mutations or workflow tools; app-owned definitions belong in the manifest through `defineWorkflow()`. Reads and permitted execution of the app's own workflows remain supported.
  - Queued logic functions can throw `RetryableLogicFunctionError` to request bounded retries with exponential backoff. This is opt-in and requires idempotent handlers.
  - `enqueueJobs()` is the current background-job API and accepts up to 200 jobs per call. The preferred `jobs: [{ payload, jobId }]` shape supports caller-supplied idempotency keys and returns ordered job IDs; `getJobs()` exposes bounded recent status, attempts, failures, and timestamps. The older `payloads` shape and single-run `enqueueJob()` helper remain deprecated compatibility paths.
  - Fetched `2.58` prefers `eventTriggerSettings` with `on: 'recordEvent'`, object/field universal identifiers, action, optional condition and batching. `databaseEventTriggerSettings` remains accepted but deprecated; do not set both. Conditions can compare `previous` values, with related-record reads subject to app permissions. `batchMode: true` keeps the existing `DatabaseEventBatchPayload`; it does not automatically batch handlers written for individual events.
  - Fetched `2.61` assigns a stable `eventId` once at record-event emission and preserves it across consumers/retries. This provides a deduplication key, not automatic handler idempotency or a guarantee against duplicate business operations.
  - App-defined timeline activity types can emit from record lifecycle/link events or be created explicitly from logic functions, with optional front-component rendering. This surface first appears in the `2.34` runtime/source line rather than the published `2.33` SDK tag.
  - `skills` are now first-class app entities in shared manifest types and SDK exports (`defineSkill`), and upstream docs now document skill authoring in the Apps capability guide.
  - `agents` are now also first-class app entities in shared manifest types and docs (`defineAgent`), extending the AI/app packaging surface beyond tool-exposed logic functions.
  - Logic functions marked as tools can be surfaced via workflow tools (`list_logic_function_tools`).
  - Workflow tooling now includes updating logic-function source from tool calls (`update_logic_function_source`).
  - Apps docs describe pre-install, post-install, and uninstall logic functions plus their standalone `app exec` hook flags, improving the operational story for setup, upgrades, and external-resource cleanup.
  - `defineHealthCheck()` lets one app-owned logic function report `OK`, warning, or error state when the settings page opens. Use application-variable `isRequired` for missing values and reserve health checks for conditions Twenty cannot infer, such as revoked credentials or missing provider-side setup. The fetched `2.55` line adds `runOnUserPreferences` for member-scoped checks alongside workspace checks.
  - `sendInboxMessage()` lets application logic functions start or continue an inbox conversation with stable thread and idempotency keys, optionally including a tool call. In `2.46`, `workspaceMemberIds: string[]` replaces the single `workspaceMemberId`; the same sender/thread key shares one conversation across recipients. Use distinct keys when separate conversations are required.
  - Agents can declare cron/database-event triggers. `runAgent()` prefers `input` over deprecated `prompt`/`messages`, can continue a thread by key, accepts a response-format override, and reports `COMPLETED`, `SUSPENDED`, `FAILED`, or `RUNNING`. A call using `waitForCompletion: false`, or outlasting the wait, can return before its answer arrives in the thread.
  - Connection providers declare `scope: 'USER' | 'WORKSPACE'`, defaulting to workspace scope. In `2.51` scope is immutable: a different scope requires a new provider identifier, and removing a provider tears down its connections. The upgrade also removes previously mismatched connections. User-scoped Add/Reconnect is available through App preferences from `2.52`, and custom hosted authorization/callback flows now complement OAuth. An optional `identifyAccountLogicFunction` identifies the external account before saving and refuses reconnecting to a different account.
  - Fetched `2.59` adds `api-key` and `oauth-discovery` connection-provider types. An API-key connection stores the pasted key encrypted, returns it as `accessToken` and can validate it before saving through `identifyAccountLogicFunction`; it does not automatically refresh/revoke keys. Provider type, like scope, is immutable. This is a native credential-management option, not an automatic migration of Stripe/HMRC variables.
  - App owners can inspect aggregate runs, failures, lifecycle issues, rate limits, versions/functions, and durations. `2.52` removes the monitoring feature flag; lookback remains plan-limited and responses omit customer workspace names/IDs. Workspace app logs also carry source, version, and error-code context.
  - `sendInboxMessage()` is available in front components as well as logic functions; it now uses the normal initiating-user/application authority boundary, so member-triggered calls need the AI permission. `2.54` adds inbox record attachment/detachment and mention/reference helpers. `defineMcpServer()` and `defineMessagingProvider()` extend provider/integration packaging; these are additive, not fundraising migration requirements.
- **Reference implementations to track:**
  - Upstream: `packages/twenty-apps/examples/hello-world` (minimal end-to-end app surface).
  - Upstream integration references: current public/internal apps such as Fireflies, Slack, Call Recorder, and Partners, which exercise connections, lifecycle hooks, permissions, background jobs, and integration-heavy logic more deeply than minimal examples.
  - In this repo: `apps/core/rollup-engine` (non-trivial app logic already running in our model).
- **Gaps / limitations:**
  - The in-repo docs posture has moved forward materially: the app docs are now split into dedicated pages (`cli-and-testing`, `data-model`, `front-components`, `layout`, `logic-functions`), and the old top-level “apps are currently in alpha” warning is no longer present in `developers/extend/apps/getting-started.mdx`.
  - Marketplace filters apps by server compatibility, presents permission/capability/credit consent and shows package READMEs. Released `2.54` replaces the separate vetted flag with reviewed listing: npm discovery alone leaves an app unlisted. Review now explicitly covers native UI, security, permissions, privacy, support and provenance; existing-registration cutover remains separate work in `apps-migration/MARKETPLACE_READINESS.md`.
  - Route-trigger request events now include optional `rawBody` on `LogicFunctionEvent`, forwarded from Nest's preserved request body when available; this removes the previous likely platform gap for Stripe-style strict webhook signature verification.
  - REST permission resolution now explicitly accepts application auth context and uses the app default role, which is a positive signal for app-auth batch-path access, but we still need an end-to-end proof against the concrete batch routes we care about.
  - Application-variable visibility is now explicit: non-secret variables can be injected into front components, while secret variables remain logic-function-only. We have runtime proof that secret variables can be configured and used again after the earlier upgrade regression; continue treating accidental front-component exposure as a security failure.
  - Application variables now support `scope: 'WORKSPACE' | 'USER'`, defaulting to workspace scope. User values are encrypted and member-owned; a front component receives the viewing member's public values, and logic functions receive the triggering member's values. Runs without a member receive no user variables. Scope cannot be changed after creation, so migrating existing workspace configuration requires explicit lifecycle review.
  - Registration variable declarations are manifest-owned as of `2.44`: API clients can still set declared values, but can no longer create or delete declarations independently. Engine-reserved names such as `TWENTY_API_URL` and `TWENTY_APP_APPLICATION_ACCESS_TOKEN` are rejected in app manifests.
  - SDK tooling through `2.51` has the old grouped commands; SDK `2.52` removes them. The installed standalone `2.57.0` exposes `local` commands. App dependencies have since advanced to `2.59.0`; earlier migration checks on CLI `2.49.0` are historical, and this watch review did not run Docker or the integration lifecycle.
  - Fetched `2.56` caps normal GraphQL find-many pages at `QUERY_MAX_RECORDS` (200), even when a caller requests more. Cursor pagination is necessary for completeness; the development seeder still contains oversized one-page queries and needs a bounded follow-up before relying on it with larger fixtures.
  - Do not carry the old SDK's implicit start/upgrade behavior into the restored local commands: current main reuses an existing instance, uses explicit `local upgrade`, compares actual image `APP_VERSION` to reject downgrades, and preserves ports/volumes/environment during replacement. A successful start is still not proof of workspace app compatibility.
  - Fetched `2.59` source removes the `CUSTOM_ROLES` gate on custom-role creation/assignment. The user guide still says Organization is required, so this is a code change, not verified Cloud plan availability. Row-level security, validation rules and other capabilities retain their own entitlement boundaries; do not infer that all permission features became universally available.
  - Since `2.52`, an existing variable's `isSecret` is immutable and a manifest flip is currently ignored. Stored operator values remain outside manifest reconciliation; defaults are initialized on creation. Treat declaration changes as lifecycle work rather than expecting a sync to overwrite configured values.
  - Metadata API client usage is a first-class app pattern through `twenty-client-sdk/metadata`, with a dedicated metadata build path. New production usage should still receive a focused runtime test because metadata APIs remain an active internal refactor area.
  - Docs/examples move quickly and can drift between releases; verify against `packages/twenty-docs` and `packages/twenty-sdk/README.md` after each upstream sync, especially around CLI/scaffolder command names.

---

## Latest Snapshot — 2026-11-22

**Context:** Merged `upstream/main` `c6d94957401` into the reference checkout: `8b79afe572d` -> `1d77a57182a`, covering 465 upstream commits. Latest fetched SDK/runtime tags are `2.61.0`, both at `4bac2940dcd`; main still declares `2.61.0`. Tag containment was checked rather than inferred from the changelog's Unreleased heading. npm/Docker publication and Cloud deployment were not inspected. Familiar legacy-tag conflicts were left unchanged. No app, CLI installation, runtime, remote, deployment or parent gitlink was changed.

**Current app observation:** Fundraising now installs SDK/client/UI `2.59.0`, declares Twenty `>=2.59.0`, uses `recordsPermissions`, record-event declarations and native UI/shared dependencies. Those changes happened outside this review; last week's role/trigger/native-button migration suggestions are no longer outstanding. Installed CLI remains `2.57.0`. Source inspection is not a fresh validation or proof of what is installed remotely.

**Apps / SDK / CLI highlights**

1. **Source round-tripping makes a material step forward.** `2.60` pulls front-component local imports/config/styles/assets; `2.61` adds logic-function definitions and imports. Old/stale inventories, unsupported definitions and the shared 12 MiB encoded-file budget still produce coverage gaps; older deployments need reapply/publication to retain the inventory. This improves recovery and workspace-authored development, but does not replace Git or make an unreviewed pull safe. `app dev --verbose` now explains watched/excluded external paths. Sources: #30613, #30665, #30789-#30790; [recovery guide](../services/twenty-core/packages/twenty-docs/developers/extend/apps/operations/sync-and-recovery.mdx).

2. **There are specific breaking changes, not a blanket fundraising rewrite.** `2.60` removes `daysSince` from string/builder expressions; use `dateDiff(date, now, 'DAY')`. Generic date functions and UTC value comparisons can change existing rule/trigger results. The legacy workspace `workflowVersion` object/relations are dropped, and the metadata RLS mutation moves from predicate-tree to rule upsert. No nonprofit-app source references to these removed surfaces were found; workspace-authored rules were not inspected. Native email tools now require explicit HTML/text body format, while workflow/provider replies use serialized email documents: do not treat those as interchangeable strings. Sources: #30527, #30500, #30252, #30456.

3. **Record API and permission behaviour deserves focused runtime testing.** Nested relation `filter`/`orderBy`/`first`, aliases and nested counts now have real shared-query support; an existing query may return a different, more correctly bounded result. Stable record `eventId` provides a potential deduplication key but no automatic exactly-once processing. Permission rules now constrain relation traversal/filtering/sorting more consistently, and channel visibility gains personal-role/RLS implementation behind multiple flags. This is not a general grant to private email/calendar content. Test widget queries, restricted users and event rollups before adopting a new runtime. Sources: #30347, #30713, #30753, #30978, #31060-#31061, #31067, #31081-#31082.

4. **Marketplace pricing becomes a platform capability, still gated.** `billing.prices` supports USD recurring flat, member or connected-account prices on the workspace subscription, with install-time price snapshots retained on upgrade. Actual charging is off by default behind `IS_APPLICATION_PRICE_BILLING_ENABLED`, and dev sync is not a billing test. Existing credit-recurring charges are deprecated rather than automatically migrated. Useful to understand before commercial release, not a reason to add billing or change the app's product model now. Sources: #30745, #30781; [credits/pricing guide](../services/twenty-core/packages/twenty-docs/developers/extend/apps/logic/credits.mdx).

**Broader product / layout movement**

- **Sidebar customisation is a substantial native UI direction:** tabs, sections, built-in content, drag/drop, mobile tabs and hidden-item restoration, behind `IS_CUSTOMIZABLE_SIDEBAR_ENABLED`. Parenting moves to `parentUniversalIdentifier` with the old manifest name retained as an alias. Smoke-test app navigation and commands with the relevant flag; this is not a full-page record-layout replacement. Sources: #30543, #30566, #30612, #30701-#30703, #30721-#30725, #30860.
- **Related-record lists become more useful:** native relation-table filter/sort settings and related-field sorts complement last week's lookup columns. These are promising alternatives to bespoke worklist display, not evidence that every former widget limitation is gone. Sources: #30435, #30657.
- **Communications and meetings:** Google Meet imports native recordings, transcripts, Gemini notes and recording video; availability depends on the connected account and Google's plan/setup. Granola gains personal folder sync, inbox gains browser push notifications, and unsent email replies survive reload/full-page switching. App preferences loses its feature flag. Sources: #30632, #30728-#30735, #30806, #30906-#30907, #30802, #30501, #30494.

**Current implications:** Carry forward the app's completed `2.59` modernisation rather than reopening it. Before a later upgrade, inspect the plan and test native UI/shared-bundle loading, nested query results, navigation, restricted-user access and rollup events. New source recovery, related-record UI, pricing and channel access remain bounded adoption discussions; no app regression was reproduced and no release/client operation is authorised by this review.

---

## Snapshot — 2026-11-16

**Context:** Merged `upstream/main` `895491c6d11` into the reference checkout: `f245a10a3da` -> `8b79afe572d`, covering 409 upstream commits. Latest fetched runtime/SDK tags are both `2.59.0`; the runtime tag points to `d690a8c63e1`, and main includes a few later commits while still declaring `2.59.0`. Tag containment was checked for the changes below; npm/Docker publication and Cloud deployment were not checked. The two familiar legacy-tag conflicts were left untouched. No app dependencies, executable installation, Docker state, remotes, deployment or parent gitlink were changed. Installed CLI now reports `2.57.0`, with the `local` family confirmed in help only; SDK/client remain `2.45.0`.

**Apps / SDK / CLI highlights**

1. **Permissions are the largest pre-release compatibility topic.** `2.57` creates/backfills workspace-owned application grant roles; `2.58` runs apps through those grants and removes legacy current-user permission fields. `2.59` supports `recordsPermissions` in SDK/build/pull/server: object grants, explicit create access, field restrictions and nested row-level rules in one block. Old flat properties remain supported with warnings; mixed formats are refused. New-format apps must require server `>=2.59.0`, and an all-records grant can shadow a rule intended to restrict access. Source removes the custom-role plan gate, but the user guide still describes it: Cloud availability is not verified, and RLS remains entitlement-dependent. Fundraising still uses the legacy coarse default-role properties and has no direct references to the removed current-user fields; modernise deliberately with identifier/plan and effective-authority tests, not speculative broadening. Sources: #29480, #30145, #29965, #30303, #30427, #30432, #30497.

2. **Record triggers and validation rules can express transitions natively.** `2.58` introduces `eventTriggerSettings: { on: 'recordEvent', objectUniversalIdentifier, action, ... }`, watched-field identifiers and conditions using current/previous values. Legacy database-event declarations remain accepted, but eventual removal is explicit. Validation expressions gain `previous`, `daysSince` and relative-date functions. This offers stable bindings and fewer unnecessary handler runs; it is not permission to move financial/reconciliation logic into entitlement-dependent rules. Fundraising's rollup handlers still use the old declaration and are concrete migration candidates; retain handler payload/batching semantics and test each lifecycle event. Sources: #29718, #30115-#30116, #30126, #30128.

3. **Builds retain more source; pull remains incomplete.** `2.57` restores supported front-component entry source; `2.59` adds public assets and a build inventory of imported local helpers, types, config, CSS and assets. Pull still does not recover those helpers/styles or logic-function source, and unsupported metadata/widgets remain gaps. Expanded uploads with non-TS/JSON sources need server `2.59`; package allowlists and source/bundle collisions are now explicit checks. Plan folds cascade deletions beneath their root, but still reports dependent data loss. Inspect package contents and complete plan details before release; do not use pull as backup or overwrite our dirty authoritative tree. Sources: #29470, #30275, #30281, #30227; [publishing guide](../services/twenty-core/packages/twenty-docs/developers/extend/apps/operations/publishing.mdx).

4. **Connections and CLI operations become more complete.** `2.59` adds native API-key connections and OAuth discovery, including encrypted key storage and optional pre-save identity/credential validation. This is worth comparing before public credential/onboarding design is frozen, but replacing existing Stripe/HMRC variables requires a separate lifecycle decision. CLI adds authenticating-proxy headers and permission-aware CSV export. Native clients also gain private-server URL support for function calls; our custom REST transports should be compared before claiming compatibility with proxy-protected deployments. Sources: #30153, #30388, #30310, #30279, #29687.

**Product / layout movement**

- **Native lists can replace some custom display work.** `2.59` permits extra/non-canonical columns for the same field and a many-to-one relation column displaying a field of the related record. This could surface donor information in a gift worklist without copied display fields. It does not extend to widget views, and canonical status is creation-time state. Grouped table/list tabs arrive in `2.58` behind `IS_RECORD_GROUP_TABS_ENABLED`; this is not another full-page record-layout redesign. Sources: #30366, #30368, #30472, #29855, #30314.
- **Workspace customisation becomes more durable.** `2.59` preserves app select-option relabelling/recolouring/order/deactivation and workspace-added options across sync; app-owned values cannot be changed or removed by the workspace. Include option customisation and reapply in future install/upgrade tests. Source: #30245.
- **Messages continue broadening more than campaigns this week.** Providers choose chat/email presentation and email-style replies from `2.58`; `2.59` adds reply attachments and upstream mark-as-read callbacks, with LinkedIn as a reference. Record Messages can filter by channel; email/calendar get independent sync controls and internal calendar/room handling. Inbox mentions notify members, and apps can archive conversations they wrote. These are optional integration capabilities, not a fundraising rewrite. Sources: #29963, #30002, #29869, #29865, #30331, #30087, #30316, #30318, #30325, #29675, #29982.

**Breaking boundaries and developing main:** `2.58` removes the legacy workspace `workflow` / `workflowAutomatedTrigger` objects and relations targeting them; use core/app workflow definitions. Fundraising has no identified references to those objects. The member-health-check change #29242 is after the fetched `2.59.0` tags: metadata renames `runOnUserPreferences` to `runHealthCheckOnUserPreferences`, while the SDK health-check option stays `runOnUserPreferences`. Do not conflate that metadata rename with an app configuration migration. Related-record access now has gated implementation, although the guide still says it is not enforced; it remains unsuitable as an assumed launch dependency.

**Current implications:** Keep the Marketplace session focused on a tested released baseline, role/trigger modernisation, actual package contents and clean-install/retained-data upgrade evidence. SDK `2.59` still permits Node 24, even though the scaffold/upstream apps move to Node `26.13.1`. No current app regression was demonstrated by this source-only review. Local runtime and integration lifecycle remain untested and untouched; no public release or client operation is authorised.

---

## Snapshot — 2026-11-08

**Context:** Merged `upstream/main` `79087790c7c` into the reference checkout: `787c0e1faea` -> `f245a10a3da`, covering 337 upstream commits. Latest fetched tags are runtime `twenty/v2.56.1` and `sdk/v2.56.1`; both SDK `2.56` tags declare CLI/SDK/client/UI packages at `2.56.0`. Current main declares `2.57.0`. These are source/tag observations, not npm or Docker availability checks. Familiar legacy-tag conflicts were left untouched. The parent Twenty gitlink, app dependencies, CLI installation, runtime, remotes and deployments were not changed; installed CLI still reports `2.53.0`.

**Apps / SDK / CLI highlights**

1. **Validation rules become a portable app capability in the fetched 2.56 line.** `defineValidationRule()` packages stable rule/object identifiers, an expression, message and optional error-field identifier. `ruleExpression` is an authoring helper that produces the same string stored by the server and exported by `app pull`; the CLI can scaffold rules and validate local field references. Rules can target standard objects too. Sync preserves an admin's inactive state; missing/deactivated external fields have explicit lifecycle handling, while removing a referenced app-owned field fails validation. This supersedes our earlier workspace-only note. Enforcement remains entitlement-gated, not record-form-flag-gated. Sources: #29283, #29246; [SDK guide](../services/twenty-core/packages/twenty-docs/developers/extend/apps/data/validation-rules.mdx).

2. **Tooling and UI have useful, bounded adoption changes.** Restored `twenty local` commands are now in fetched release source, including the isolated test instance; our installed `2.53.0` still cannot run them. The icon provider entry point moved to `twenty-ui/icon/provider`, leaving named icons lightweight under `twenty-ui/icon`. Settings tabs gain optional validated URL slugs, and native-page navigation can point to Workflows. These do not require recreating the app or changing identifiers. Sources: #29301-#29302, #29386, #29355, #29567.

3. **There are concrete runtime boundaries to test, not blanket source rewrites.** Normal GraphQL list pages now clamp to 200; requests for 5,000 no longer bypass the cap. Main processing queries use bounded sizes, but the development seeder has oversized one-page reads, so fixture completeness/idempotence needs review. Workflow `CODE` steps now carry their own source; AI steps distinguish inline Generate configuration/scope from app-agent references. The latter is a breaking workflow change, but fundraising declares neither workflows nor agents. The fetched `2.56` line also gives `currentUser` record permissions a nested shape while retaining deprecated legacy fields. Sources: #29546, #29548, #29368, #29686, #29732.

4. **Developing 2.57 needs permission and front-component attention.** Create permission is separating from update behind `IS_CREATE_RECORDS_PERMISSION_ENABLED`; current manifest conversion maps app update grants to create grants. Private-record/share enforcement is also being re-gated. Do not preemptively broaden app authority or add unsupported role properties. `currentView` enables worklist-specific commands, and an object-selector infinite-rerender fix lands in the front-component execution-context hook. These changes are not in the fetched `2.56.1` tags. Sources: #29881-#29882, #29888, #29896, #29776, #29349.

**Broader product movement**

- **Forms and data quality:** record creation forms lose their feature flag. Forms can request fields needed by a validation rule rather than immediately rejecting an update; select inputs hide options a rule would reject, and metadata edits warn when they deactivate rules. Availability still depends on entitlement and the exact rule/form path. Sources: #29246, #29691, #29716, #29458.
- **Messages, not just email:** the record Emails tab becomes Messages; app conversations render as chat bubbles and gain replies, with LinkedIn providing a concrete provider implementation. Developing main adds attachment ingestion/upload and native email attachment display, realtime thread refresh, private member messaging and application-only inbox read/triage. Attachments remain feature/upgrade-gated; these are not all established `2.56` capabilities. Sources: #29343, #29326-#29327, #29526, #29578, #29773, #29853-#29854, #29477-#29478, #29583.
- **Campaigns and connected accounts:** the fetched `2.56` send/preview/cancel campaign policy requires a workspace-member context and rejects API keys or application/OAuth calls without a user. This is not a restriction on all background email. Main also fixes Outlook sent drafts and CalDAV invitations/duplicates, improves email-thread reply controls, and lets Messages choose the sending account. Sources: #29694, #29395, #29753-#29754, #29782, #29893, #29562.
- **Embedded tools:** apps can declare exact HTTPS origins for iframe camera/microphone requests. Published-app grants require approval; later updates do not silently expand access. This is an optional phone/video integration surface, not a general relaxation of the sandbox. Source: #28944.

**Current implications:** No app patch or runtime regression was demonstrated by this reference-only review. Next deliberate upgrade should check the metadata plan, pagination/fixture completeness, restricted-user create/update behavior, and component interaction/rendering. Native validation and view-specific commands are useful future requirement options; they are not automatic replacements for existing domain logic. Keep the occupied local workspace and deferred integration lifecycle untouched until separately approved.

---

## Snapshot — 2026-11-02

**Context:** Merged `upstream/main` `c5586c1a8e6` into the reference checkout: `69f45d212dc` -> `787c0e1faea`, covering 378 upstream commits. Latest fetched tags: runtime `twenty/v2.54.0` (`c75ef7bfd05`), SDK/CLI `sdk/v2.54.3` (`ced0597118b`); current main declares `2.55.0`. These are source/tag boundaries, not npm or Docker availability checks. The familiar conflicting legacy tags `v1.21.1` and `v2.5.0` were left unchanged. No app dependency, CLI installation, server, remote, or deployment was changed.

Local observation: `twenty --version` now reports `2.53.0` on Node `24.9.0`, whereas October's app checks used CLI `2.49.0`. App version remains `0.1.14`, SDK/client `2.45.0`; the current server version was not inspected.

**Released through runtime 2.54 / SDK-CLI 2.54.3**

1. **Packaging and local execution are more reproducible, but stricter**
   - Published packages now carry `yarn.lock`; the server validates stored dependency files/checksums, and shared frontend dependencies build from the app lockfile. SDK `2.52` has already removed the old CLI/build API. These are reasons to inspect a newly built release rather than reuse a historical tarball or assume the old build layout. Sources: #28998, #29001, #29018.
   - Runtime `2.53` aligns local function isolation with Lambda: only an allowlist of host environment variables is inherited, filesystem access is restricted, and execution uses a per-run directory/temp folder. The server moves to Node 26; SDK authoring still supports Node 24.5+. Test external HTTP/Stripe calls, declared variables and dependency loading on an intentional runtime upgrade. Source: #28599.
   - Slack, Call Recorder and Fireflies reference apps are moving to direct `twenty-ui` 2.x. These are more useful adoption references than the older SDK UI wrapper, but do not establish that our existing button mitigation can be removed without a bounded runtime test. Sources: #28604, #29100, #29105.

2. **App workflows and inbox integrations can replace more bespoke orchestration**
   - From `2.52`, app workflows can send/draft email and create calendar events with the matching tool permissions. Builder workflows can round-trip through source, with shared-account email handles resolved in the target workspace; hardcoded account IDs remain non-portable. Sources: #28920, #28936, #29048, #29050.
   - Inbox helpers are now available directly to front components. `sendInboxMessage()` follows normal initiating-user/application permissions rather than always using application access; `2.54` adds record attachments and mentions. This enables a conversation alongside a gift or donor record, not just an unrelated notification. Sources: #29088, #29090, #29156.

3. **Connections and Marketplace became more product-facing**
   - App preferences supports member-owned connections, and providers can implement hosted custom authorization/callback flows instead of OAuth. App-owned message folders, messaging providers and MCP-server declarations broaden integration packaging. Monitoring is no longer feature-flagged. These are optional capabilities, not a reason to redesign Stripe configuration now. Sources: #28418, #28672, #28986, #29158, #28688.
   - `2.54` replaces the separate vetted status with reviewed Marketplace listing. npm publication alone does not list an app; the review checklist now explicitly includes native `twenty-ui`, security, least privilege, privacy, support and provenance. Hand this to the Marketplace session; do not infer approval or a safe Imara registration conversion. Sources: #29187, #28842; `operations/marketplace-review.mdx`.

4. **Pull and permissions need version-aware handling**
   - `app pull` restores stored package/lockfiles as well as more metadata and workflows; it can initialize a workspace Custom app project and currently requires SDK >=2.50. It still omits source and some widgets. The Custom app applies additively unless `--prune` is explicit; ordinary apps still delete omitted definitions. `--no-prune` is the new name for `--no-delete`, which remains an alias. Do not run pull casually against our dirty, authoritative source tree. Sources: #29047, #29197, #29207.
   - Disabled object/field permission actions are available in `2.53`/`2.54`. SDK flag aliases `USER_APPS`/`WORKSPACE_APPS` preserve the old identifiers, but need CLI >=2.54 in runtime bundles; old names still work. Our app currently declares none of these restrictions or flags, so no mechanical source patch is indicated. Sources: #28985, #29084, #29194.

**Developing 2.55 only — not in the fetched 2.54.3 release**

- **Local Docker commands return:** `twenty local start|status|logs|stop|upgrade|reset`, with `--test` using a separate `twenty-app-dev-test` container and port 2021. Existing starts keep their version; upgrade is explicit, preserves configuration and rejects downgrades by actual `APP_VERSION`. Reset deletes volumes. This supersedes the *current-main* no-Docker guidance, not our installed CLI `2.53.0`. Verify publication before changing instructions or touching the occupied server. Sources: #29301, #29302.
- **A genuine permission API break:** legacy object/field `readability`, `writability`, inherited-readability and `sharingReach` are removed; `setRecordGeneralAccess` becomes `setRecordPrivate`. Related record paths can be declared but are explicitly preview/not enforced. Private-record creation by app/API-key callers requires explicit `shareWith`. Our app does not reference the removed properties, but effective access still needs restricted-user and background-creation tests. Sources: #29378, #29383, #29390, #29328.
- Standard outbound webhooks gain role-bound delivery permissions; this is not the app route-trigger/Stripe webhook API. Health checks gain user-preferences execution mode. AI can draft/preview/publish Workspace components after approval; do not equate that workflow with updating a distributed app. Sources: #29273, #29249-#29250, #28726-#28730.

**Broader product movement**

- Email campaigns lose their feature flag in `2.54`, gain AI/MCP preview/test/send/suppression tools and dedicated tracking/unsubscribe links. They remain communications campaigns, not fundraising Appeals. Sources: #28929, #29072, #28915.
- Record pages gain a Merge with command and merge proposals; relation pickers can open creation forms, note/task rich-text scrolling and TipTap spacing are fixed, and views gain locale-specific names. Current main also adds approved-origin camera/microphone support to iframe widgets. Sources: #29155, #28863, #29129, #29134, #29109, #29095, #29217-#29219.

**Current implications**

- Keep the previous local server and real integration lifecycle untouched; both remain deferred. The future `--test` instance is a promising isolation path once a released CLI is verified.
- The next app upgrade should compare its metadata plan and then test function execution/variables, restricted users, create/edit/reopen notes, front-component inputs/scrolling and layouts. No urgent app-code regression was demonstrated by source review alone.
- Continue keeping CLI, SDK/client, server and installed app versions separate. This review only updates reference code and documentation; the parent repository's recorded Twenty pointer is unchanged.

---

## Monthly Snapshot — 2026-10

**Context:** October reviews followed the `2.45` through `2.51` release lines and previewed the `2.52` CLI transition. Consolidated on 2 November; settled facts live in the baseline above rather than repeated weekly entries.

**What settled**

- **Standalone tooling became the intended path.** A separate `twenty` CLI owns build/plan/apply/dev/pull/publish/install and workspace diagnostics. Temporary build snapshots are not release artifacts. SDK `2.52` removes the old executable/programmatic APIs. Our command guidance, TypeScript project setup and integration bootstrap were migrated in October; SDK/client remain `2.45.0`, CLI `2.49.0`, with the real destructive integration lifecycle explicitly deferred. Sources: #27295, #27862, #28182-#28183, #28721.
- **Native app automation became viable.** `defineWorkflow()`, lifecycle deletion and manual/cron/database/webhook triggers settled by `2.49`. Inbox messages, member-owned variables and scoped connections create native options for automation and configuration, but are product choices rather than required rewrites. Variable/provider scope is immutable; removal and workflow-history deletion require lifecycle review. Sources: #27309, #27377, #28003, #26868-#26869, #27796, #28637.
- **UI became more flexible, with explicit opt-ins.** New layouts can unpin the first tab, `useSelectedRecordsFilter()` represents Select all, `useLocation()` exposes host location, and `widgetAvailability` controls picker discovery without removing existing placements. Renderer events, React 19 refs, popups and input reliability changed materially: keep interaction smoke tests tied to an exact runtime/toolchain. Sources: #27629, #27404, #27841, #28444, #26356.
- **Storage and authority consolidated.** `2.51` moves rich text to TipTap while accepting markdown/legacy BlockNote writes; reads must not assume BlockNote remains populated after edits. Application tokens lost broad administration powers, and custom-role cloud entitlements differ from self-hosted tests. Registration variable declarations are manifest-owned; secrets stay logic-function-only. Sources: #28485-#28488, #27241, #28218.
- **Product direction broadened.** Email campaigns gained tracking and opt-out controls, records can link mail/calendar activity, creation forms improved and App preferences separated personal accounts from workspace administration. Monitoring and Marketplace consent/version screens became more useful, but neither settled our existing-registration publication cutover.

**Remaining implications:** Preserve identifiers and provenance; inspect plan changes rather than pre-emptively rewriting business logic. Keep native UI, Select all, location hooks and note-format cleanup as bounded adoption discussions. Publication and Imara migration remain governed by the Marketplace plan, not this watch log.

---

## Monthly Snapshot — 2026-09

**Context:** Stable releases advanced from `2.37` through `2.43`, while merged main moved onto the `2.44` development line.

**Settled changes**

1. **App synchronization became safer and more explicit**
   - `plan`, `apply`, and `dev` gained deletion protection; pull/export coverage expanded across layouts, roles, permissions, and translations; and sync stopped deleting workspace state that the manifest cannot express.
   - `twenty pull` remains experimental and incomplete. Checked-in definitions remain authoritative, with `--no-delete` reserved for deliberate additive diagnostics rather than normal synchronization.

2. **Background execution, permissions, and diagnostics matured**
   - Queued jobs gained idempotency keys, batch submission, and status inspection; database-event triggers gained batching; app permission identifiers became deterministic; and application authority became more explicit.
   - Apps gained required variable declarations, multiple settings pages, and health checks for external configuration or credential failures.

3. **Native layouts, UI, and communication surfaces broadened**
   - Standalone page-layout widgets, simplified vertical-list authoring, list views, record forms, and unpinned full-width record tabs advanced, although record-form creation returned behind a feature flag by `2.43`.
   - `twenty-ui` aligned versions with the SDK and reorganized around `primitives/*`. App-owned message-channel ingestion created a beta path for importing external conversations into native message/timeline records.

4. **Build, delivery, and front-component integration hardened**
   - Application files and tarballs moved to direct storage uploads, typed-client generation became application-scoped, and front components gained selected-object metadata, widget-header commands, and AI tool-call rendering.
   - These changes reinforce matching SDK, runtime, and scaffold versions rather than assuming current-main examples work unchanged against older deployments.

**Remaining implications**

1. Keep full-manifest `plan`/`apply` as the authoritative workflow and inspect permission/layout churn during upgrades.
2. Continue treating direct `twenty-ui` adoption, native record forms, and layout cleanup as bounded product work with visual regression tests.
3. Evaluate message channels, settings pages, required variables, and health checks only where they solve a current onboarding or integration need.
4. Continue tracking Marketplace source-channel conversion separately in `MARKETPLACE_READINESS.md`.

---

## Monthly Snapshot — 2026-08

**Context:** Stable releases advanced from `2.26` through runtime `2.34`, while the fetched SDK boundary reached `2.33` and in-tree tooling moved to `2.35.0`.

**Settled changes**

1. **System metadata ownership and application authority became explicit**
   - Twenty took ownership of default index views and record-page metadata using deterministic identifiers. App actions now run within both the application's role and the initiating user's permissions, with explicit application-authority execution available when required.
   - Object and field `writability` can protect app-owned records at the server boundary, independently of UI editability.

2. **App lifecycle and background execution matured**
   - Apps gained queued jobs, retryable logic-function errors, richer execution context, connection disconnect hooks, delegated agent runs, and more reliable install/uninstall behavior.
   - Timeline activity types became a first-class app surface in runtime `2.34`, including record-event emission and optional front-component rendering.

3. **Native layouts and front-component delivery both expanded**
   - Default record pages moved into the metadata side-effect engine. Portable record-table widgets, nested relation rendering, page-layout tabs, and an early list-view type made native composition more credible.
   - Front components gained an optional shared dependency bundle, broader browser capabilities, stronger content-addressed delivery, and clearer dependency-size limits.

4. **The core product broadened around communication, AI, and workflow**
   - Email composition, connected accounts, call recording, full-page AI chat, Slack assistance, and workflow variable handling all received visible investment.
   - Practical read: Twenty is increasingly replacing integration-specific presentation with reusable native records, layouts, timelines, and workflow primitives.

**Remaining implications**

1. Smoke-test app-owned layouts and views after runtime upgrades because Twenty's system-owned defaults may be reconciled underneath them.
2. Include at least one restricted-user action in permission regression checks.
3. Keep shared front-component dependencies, writability, retries, and timeline activity types as deliberate product choices rather than automatic upgrade cleanup.

---

## Monthly Snapshot — 2026-07

**Context:** Upstream moved from the `2.22` release line through stable `2.25`, while in-tree app tooling reached `2.26.0`.

**Settled changes**

1. **Engine-owned metadata became a firm boundary**
   - Twenty moved reserved system fields, default relations, search metadata, and related side effects out of app manifests and into the metadata engine.
   - Apps reference app-owned object system fields with `getFieldUniversalIdentifier()` rather than declaring them or inventing identifiers. This helper transition was applied in `nonprofit-fundraising` and is now part of the durable baseline.

2. **App runtime lifecycle became substantially richer**
   - Apps gained isolated `kv` state, custom settings front components, connection `onConnectLogicFunction` hooks, and uninstall logic functions.
   - KV is appropriate for technical cursors, locks, caches, and external ownership claims; auditable fundraising and integration state should remain in normal Twenty records.

3. **Cloud routing, front components, and native layouts matured together**
   - `RestApiClient` gained a cloud-safe `/s/...` application-route path through the injected functions origin.
   - Front-component event coverage, content-addressed delivery, loading/error handling, CSS mirroring, and direct `twenty-ui` support improved. Native relation widgets expanded to kanban, calendar, and grouped tables, with better tab and dashboard behavior.
   - Practical read: these improvements make native surfaces more credible, but deployed front-component replacements still require runtime proof against the exact SDK/runtime pair.

4. **Twenty broadened beyond extensibility primitives into fuller CRM workflows**
   - Email campaigns, mobile record behavior, global search, onboarding AI, call recording, and workflow consistency all received visible investment.
   - Distribution also became more formal through provenance-aware publishing and retained source artifacts.

**Remaining implications**

1. Treat system metadata as server-owned and use SDK derivation helpers only for references.
2. Prefer `RestApiClient` for new authenticated app-route calls.
3. Consider custom settings UI or richer native layout widgets only when they solve a current product need.

---

## Monthly Snapshot — 2026-06

**Context:** Runtime releases advanced from `2.9` to `2.17.1`, while the in-tree app toolchain moved from `2.10` to `2.18.0`.

**Settled changes**

1. **App metadata became more granular and overridable**
   - `defineViewField()` enabled incremental extension of existing views, while views and command-menu items moved toward explicit overridable entities.
   - UI capability flags became clearer through `isUIEditable` and `isUICreatable`; navigation and standalone page-layout validation also tightened.

2. **SDK packaging and UI boundaries became explicit**
   - `twenty-client-sdk` settled as a build/typecheck dependency under `devDependencies`, and `MetadataApiClient` gained a dedicated supported package path.
   - `twenty-sdk/ui` was removed in favor of direct `twenty-ui` subpath imports. React 19, Vite 8, CSS extraction, and broader front-component build changes reinforced the need to test native UI against matched runtime/package versions.

3. **The app-dev loop became more diagnosable and repeatable**
   - Sync gained dry-run previews, metadata diffs, named migration failures, clearer summaries, and workspace locking. Docker start/upgrade gained more explicit version resolution, while command and route-trigger diagnostics improved.
   - Runtime tags, Docker images, npm packages, and repository `main` repeatedly moved at different rates, establishing explicit version recording as a permanent process requirement.

4. **Logic functions expanded into workflow and AI surfaces**
   - `runAgent()` brought app agents into logic functions, and inferred input schemas including `TwentyRecord<...>` made workflow/AI record selection more first-class.
   - Newer internal apps became more useful references than minimal scaffolds for permissions, connections, and logic-heavy integration design.

**Remaining implications**

1. Keep `twenty-sdk`, `twenty-client-sdk`, and UI/build tooling in `devDependencies`; add production dependencies only when logic functions require them at runtime.
2. Use direct `twenty-ui` imports only after runtime proof; do not reintroduce `twenty-sdk/ui`.
3. Record runtime, SDK, and deployed app versions separately during every upgrade.
4. Keep command visibility, route triggers, navigation, and page layouts in targeted post-upgrade smoke tests.

---

## Monthly Snapshot — 2026-05

**Context:** Stable releases advanced from `2.5` through `2.8.1`, while the in-tree app toolchain reached `2.9.0`.

**Settled changes**

1. **Core app entities and conventions became formalized**
   - Command menu items became explicit top-level manifest entities through `defineCommandMenuItem()`, and `defineApplicationRole()` became the canonical default-role declaration while explicit `defaultRoleUniversalIdentifier` wiring was deprecated.
   - The default scaffold expanded into an app shell with navigation, page layout, front component, and stable identifiers, aligning with the composition already emerging in `nonprofit-fundraising`.

2. **Permissions became a first-class app design boundary**
   - Permission flags and tighter application roles became normal manifest concerns, including command visibility/gating effects.
   - New integration apps demonstrated both broad and least-privilege roles, establishing permissions as a continuing product-design and regression-testing concern rather than incidental server configuration.

3. **CLI and distribution workflows converged on their current direction**
   - Grouped commands such as `docker:*`, `app:*`, `dev:*`, and `remote:*` began replacing older flat forms.
   - Tarball-oriented install/publish flows, dedicated app file storage, and clearer separation between local tooling and server-side installation laid the foundation for the current release-artifact process.

4. **Reference quality improved through real integration apps**
   - Slack, Fireflies, and Partners apps provided stronger patterns for connection providers, variables, app-owned navigation/layouts, integration-heavy logic functions, and permissions than older minimal examples.
   - Secret-variable behavior and encryption also improved materially, resolving the earlier need to treat secret variables as an unsupported app concept.

**Remaining implications**

1. Keep explicit command-menu item files and `defineApplicationRole()` as canonical patterns.
2. Treat role and permission changes as regression-sensitive and validate command visibility under realistic user roles.
3. Use current internal integration apps as reference points when adopting connections or complex lifecycle logic.

---

## Snapshot History

- Use git history: `git log -- docs/TWENTY_EXTENSIBILITY_WATCH.md`.
