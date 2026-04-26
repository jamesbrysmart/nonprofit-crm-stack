# Twenty Native Reference

Updated: 2026-04-21
Status: Working note
Purpose: Give future build sessions a small, code-first map to Twenty-native UI, host affordances, and app surfaces so they can look in the right place before inventing custom equivalents.

This note is intentionally a reference map, not a tutorial.

## 1. How To Use This Note

Use this in the following order:

1. Start from the active released app toolchain you are actually building against.
2. Use the paths and `rg` queries below to verify the current surface in code.
3. Prefer Twenty-native surfaces where they are both available and appropriate.
4. Treat anything marked `version-sensitive` as something to verify in the active release before depending on it.

Important rule:

- Do not assume the Docker/runtime version, the published scaffolder/SDK version, and the in-repo `services/twenty-core` source are all on the same surface. Verify the current app toolchain before copying examples.
- Current local reference point: `services/twenty-core` is now on `twenty-sdk` / `create-twenty-app` `2.0.0`, so the split import surface (`twenty-sdk/define`, `twenty-sdk/front-component`, `twenty-sdk/ui`) should be treated as the current native shape unless the active published toolchain proves otherwise.

## 2. Confidence Labels

- `proven`: exercised in our spike app and should be treated as real working guidance.
- `source-visible`: clearly present in Twenty source/examples, but not fully exercised in our spike.
- `version-sensitive`: visible and likely intended, but exact imports/runtime support may depend on the current released app toolchain.

## 3. Native UI

Use for:

- host-consistent buttons, tags, layout primitives, themed UI, and general front-component presentation

Current confidence:

- `source-visible`
- `version-sensitive` only for exact runtime compatibility and React-version alignment in the active release

Look here first:

- [services/twenty-core/packages/twenty-ui](/home/jamesbryant/workspace/dev-stack/services/twenty-core/packages/twenty-ui)
- [services/twenty-core/packages/twenty-sdk/package.json](/home/jamesbryant/workspace/dev-stack/services/twenty-core/packages/twenty-sdk/package.json)
- [services/twenty-core/packages/twenty-front-component-renderer/scripts/front-component-stories/build-source-examples.ts](/home/jamesbryant/workspace/dev-stack/services/twenty-core/packages/twenty-front-component-renderer/scripts/front-component-stories/build-source-examples.ts)
- [apps/fundraising/staging-review-minimal/src/front-components/new-gift.tsx](/home/jamesbryant/workspace/dev-stack/apps/fundraising/staging-review-minimal/src/front-components/new-gift.tsx)

Search queries:

```bash
rg -n "twenty-sdk/ui|twenty-ui-example|ThemeProvider|H2Title|Tag|Button" services/twenty-core/packages apps/fundraising/staging-review-minimal
```

Practical read:

- `twenty-ui` is not just CSS. It is Twenty's native component/theme system.
- Treat `twenty-sdk/ui` as the intended native UI surface for front components.
- Prefer it over hand-rolled UI primitives unless the active release proves a concrete compatibility problem.
- Verify the exact runtime behavior in the scaffolded app you are building against before broad adoption.
- Current repo-local finding in the released `v2` runtime:
  - `twenty-sdk/ui` worked once the app was aligned to React 18.x,
  - while the initial app scaffold had React 19.x in local dev dependencies,
  - so verify React version alignment before treating `twenty-sdk/ui` runtime errors as a platform bug.

## 4. Host Affordances

Use for:

- command UX
- side-panel lifecycle
- native confirmations
- progress display
- snackbars
- record-context awareness

Current confidence:

- `proven` for `enqueueSnackbar`, `closeSidePanel`, `unmountFrontComponent`, `updateProgress`, `useRecordId`
- `source-visible` for broader command helpers such as `openCommandConfirmationModal`, `openSidePanelPage`, and `navigate`

Look here first:

- [services/twenty-core/packages/twenty-sdk/src/sdk/front-component/index.ts](/home/jamesbryant/workspace/dev-stack/services/twenty-core/packages/twenty-sdk/src/sdk/front-component/index.ts)
- [apps/fundraising/staging-review-minimal/src/front-components/new-gift.tsx](/home/jamesbryant/workspace/dev-stack/apps/fundraising/staging-review-minimal/src/front-components/new-gift.tsx)
- [apps/fundraising/staging-review-minimal/src/front-components/process-gift-batch-command.tsx](/home/jamesbryant/workspace/dev-stack/apps/fundraising/staging-review-minimal/src/front-components/process-gift-batch-command.tsx)
- [apps/fundraising/staging-review-minimal/src/front-components/staging-review-record.tsx](/home/jamesbryant/workspace/dev-stack/apps/fundraising/staging-review-minimal/src/front-components/staging-review-record.tsx)
- [apps/fundraising/staging-review-minimal/src/front-components/gift-batch-record.tsx](/home/jamesbryant/workspace/dev-stack/apps/fundraising/staging-review-minimal/src/front-components/gift-batch-record.tsx)

Search queries:

```bash
rg -n "enqueueSnackbar|updateProgress|openCommandConfirmationModal|closeSidePanel|unmountFrontComponent|openSidePanelPage|navigate|useRecordId|useFrontComponentExecutionContext" services/twenty-core/packages apps/fundraising/staging-review-minimal
```

Practical read:

- This is one of the most valuable native layers to lean on.
- Prefer these helpers over app-specific toasts/modals/progress wrappers unless Twenty is missing a required behavior.
- Use them for workflow shell behavior, not domain logic.
- In `v2.0.0`, these should be treated as part of the intended front-component model, not as incidental internal helpers.

## 5. Commands And Command Contexts

Use for:

- global actions
- record-context actions
- selection-context actions
- side-panel launched operator workflows

Current confidence:

- `proven` for global command and record-selection command patterns in the spike
- `source-visible` for the broader command surface and command helper components

Look here first:

- [apps/fundraising/staging-review-minimal/src/front-components/process-gift-batch-command.tsx](/home/jamesbryant/workspace/dev-stack/apps/fundraising/staging-review-minimal/src/front-components/process-gift-batch-command.tsx)
- [apps/fundraising/staging-review-minimal/src/front-components/new-gift.tsx](/home/jamesbryant/workspace/dev-stack/apps/fundraising/staging-review-minimal/src/front-components/new-gift.tsx)
- [services/twenty-core/packages/twenty-sdk/src/sdk/front-component/command](/home/jamesbryant/workspace/dev-stack/services/twenty-core/packages/twenty-sdk/src/sdk/front-component/command)
- [services/twenty-core/packages/twenty-apps/examples/hello-world](/home/jamesbryant/workspace/dev-stack/services/twenty-core/packages/twenty-apps/examples/hello-world)

Search queries:

```bash
rg -n "availabilityType|GLOBAL|RECORD_SELECTION|SINGLE_RECORD|GLOBAL_OBJECT_CONTEXT|command:" services/twenty-core/packages apps/fundraising/staging-review-minimal
```

Practical read:

- Prefer native command surfaces before adding custom in-component action chrome.
- The operator workflow should feel like a Twenty command when that pattern fits.
- Treat the split between command surface and front-component content as part of the current app model, not an experiment-specific pattern.

## 6. Variables

Use for:

- feature flags
- capability enablement
- runtime behavior
- integration config
- environment-specific tuning

Current confidence:

- `proven` for behavior/visibility/runtime toggles
- `not proven` for conditional metadata provisioning

Look here first:

- [apps/fundraising/staging-review-minimal/src/application-config.ts](/home/jamesbryant/workspace/dev-stack/apps/fundraising/staging-review-minimal/src/application-config.ts)
- [services/twenty-core/packages/create-twenty-app](/home/jamesbryant/workspace/dev-stack/services/twenty-core/packages/create-twenty-app)
- [docs/apps-migration/TWENTY_APP_DEV_WORKFLOW.md](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/TWENTY_APP_DEV_WORKFLOW.md)

Search queries:

```bash
rg -n "applicationVariables|serverVariables|process.env|GIFT_AID_ENABLED|HMRC_SUBMISSION" apps/fundraising/staging-review-minimal services/twenty-core/packages
```

Practical read:

- Default to variables for configuration and capability toggles.
- Do not assume variables are the right mechanism for creating or removing metadata.
- This is strong enough to use confidently for feature flags, integration config, and environment-specific behavior.

## 7. Logic Function Triggers

Use for:

- route-triggered app logic
- scheduled logic
- event-driven logic

Current confidence:

- `proven` for route-trigger logic
- `source-visible` for cron and database-event triggers

Look here first:

- [apps/fundraising/staging-review-minimal/src/logic-functions](/home/jamesbryant/workspace/dev-stack/apps/fundraising/staging-review-minimal/src/logic-functions)
- [services/twenty-core/packages/twenty-shared/src/application/manifestType.ts](/home/jamesbryant/workspace/dev-stack/services/twenty-core/packages/twenty-shared/src/application/manifestType.ts)
- [services/twenty-core/packages/twenty-sdk](/home/jamesbryant/workspace/dev-stack/services/twenty-core/packages/twenty-sdk)

Search queries:

```bash
rg -n "httpRouteTriggerSettings|cronTriggerSettings|databaseEventTriggerSettings|routePath|logicFunction" services/twenty-core/packages apps/fundraising/staging-review-minimal
```

Practical read:

- Route logic is safe to rely on from this spike.
- Treat cron and database-event triggers as things to verify in the active release before designing around them.
- The trigger model itself is part of the supported app surface; the remaining question is which trigger types we have personally exercised.

## 8. Metadata Scaffolding

Use for:

- creating new top-level app entities safely

Current confidence:

- `proven` as the safest default process guidance

Look here first:

- [services/twenty-core/packages/create-twenty-app](/home/jamesbryant/workspace/dev-stack/services/twenty-core/packages/create-twenty-app)
- [services/twenty-core/packages/twenty-sdk/src/cli/utilities/entity](/home/jamesbryant/workspace/dev-stack/services/twenty-core/packages/twenty-sdk/src/cli/utilities/entity)
- [docs/apps-migration/TWENTY_APP_DEV_WORKFLOW.md](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/TWENTY_APP_DEV_WORKFLOW.md)

Search queries:

```bash
rg -n "yarn twenty add|defineObject|defineField|defineFrontComponent|defineRole|defineNavigationMenuItem|definePageLayout" services/twenty-core/packages docs/apps-migration
```

Practical read:

- Prefer `create-twenty-app` and `yarn twenty add ...` over freehand creation for top-level entities.
- Keep `universalIdentifier`s stable.
- Treat large metadata reshapes as migration-sensitive.

## 9. Spike References

Use for:

- examples of how these surfaces looked in a real fundraising-shaped proof

Look here first:

- [apps/fundraising/staging-review-minimal](/home/jamesbryant/workspace/dev-stack/apps/fundraising/staging-review-minimal)
- [docs/spikes/twenty-app-batch-processing-design.md](/home/jamesbryant/workspace/dev-stack/docs/spikes/twenty-app-batch-processing-design.md)
- [docs/apps-migration/TWENTY_APP_DEV_WORKFLOW.md](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/TWENTY_APP_DEV_WORKFLOW.md)
- [docs/TWENTY_EXTENSIBILITY_WATCH.md](/home/jamesbryant/workspace/dev-stack/docs/TWENTY_EXTENSIBILITY_WATCH.md)

Practical read:

- Use the spike to understand product shape.
- Use Twenty source and the active released toolchain to verify the current native surface before coding.
