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
- For fundraising migration work, these helpers are also the main surface to test when evaluating whether a workflow can stay close to native record/list/page behavior rather than becoming a custom workspace.
- Current example worth testing deliberately: launching users from a batch context into batch-filtered staged-gift review, including whether `navigate(...)`, record pages, side panels, or a standalone page give the cleanest operator flow.
- Current validated read from the fundraising app:
  - batch-to-filtered-record-list navigation is a viable native pattern,
  - it is worth preferring this before building a custom review workspace,
  - and later refinements should stay lightweight unless native navigation/worklist flow proves insufficient
- Current native layout experiment worth testing next on `giftStaging`:
  - record-page tabs as the main secondary-information splitter rather than custom tabs inside one review widget,
  - a lighter `Review` tab used for summary, state, actions, and signposting,
  - separate native tabs for `Details` and `Audit`,
  - and selective testing of richer host features such as `GRID` layouts, multiple widgets in one tab, and built-in widgets like `FIELDS`, `FIELD`, `VIEW`, or `RECORD_TABLE` where they can replace custom UI cleanly

## 4a. Record Page Layouts And Widgets

Use for:

- structuring record-detail UX with native Twenty tabs
- separating custom workflow UI from standard field presentation
- testing whether native widgets can replace some custom surfaces

Current confidence:

- `proven` for custom record-page tabs with front-components
- `source-visible` for broader widget and layout options

Look here first:

- [services/twenty-core/packages/twenty-docs/developers/extend/apps/layout.mdx](/home/jamesbryant/workspace/dev-stack/services/twenty-core/packages/twenty-docs/developers/extend/apps/layout.mdx)
- [apps/fundraising/nonprofit-fundraising/src/page-layouts/gift-staging-record.page-layout.ts](/home/jamesbryant/workspace/dev-stack/apps/fundraising/nonprofit-fundraising/src/page-layouts/gift-staging-record.page-layout.ts)
- [services/twenty-core/packages/twenty-apps/internal/call-recording/src/page-layouts/call-recording-record-page-layout.ts](/home/jamesbryant/workspace/dev-stack/services/twenty-core/packages/twenty-apps/internal/call-recording/src/page-layouts/call-recording-record-page-layout.ts)
- [services/twenty-core/packages/twenty-shared/src/types/page-layout/page-layout-widget-configuration.type.ts](/home/jamesbryant/workspace/dev-stack/services/twenty-core/packages/twenty-shared/src/types/page-layout/page-layout-widget-configuration.type.ts)

Practical read:

- `Review` / `Fields` on the current `giftStaging` page are native Twenty record-page tabs defined by the app, not a custom tab system.
- Native layout options worth testing before building custom UI include:
  - tab layout modes: `CANVAS`, `VERTICAL_LIST`, `GRID`
  - multiple widgets inside one tab
  - built-in widgets such as `FIELDS`, `FIELD`, `VIEW`, `RECORD_TABLE`, `TIMELINE`, `TASKS`, `NOTES`, and `FILES`
- For fundraising migration work, the most interesting question is not just "more tabs", but how far a mixed native/custom record page can go:
  - `Review` as a light custom operational tab,
  - `Details` using more native field presentation where possible,
  - `Audit` combining custom summaries with native widgets if useful
- Product principle validated by the `giftStaging` experiments:
  - native widget composition is valuable not only as a technical shortcut, but because it gives organisations meaningful control over the review surface
  - smaller native widgets/sections can be reordered or hidden in workspace layout tooling
  - one large custom review component gives the app more control, but gives the organisation less control
- This makes native `FIELDS` / `FIELD` widgets worth preferring as an early product path where they are good enough, especially for secondary review/edit surfaces
- Additional runtime observation:
  - the first tab on a record page may behave more like a `Home` / landing tab than a neutral full-width workspace
  - in the fundraising experiments, the first tab remained visually compressed in record view in ways later tabs did not
  - this makes the first tab a better place for concise state, actions, and signposting than for the densest field-heavy review layout
- `GRID` should be treated as context-sensitive rather than universally beneficial:
  - in narrow drawer contexts it can collapse into stacked widget chrome and feel wasteful,
  - in the full record page it becomes much more valuable because width is available for real side-by-side layout
  - use this when deciding which tabs deserve `GRID` and which should stay closer to simple vertical/native field presentation
- Separate runtime lesson:
  - persisted page-layout/tab state may survive app iterations in ways that make an older tab behave differently from a freshly introduced tab
  - in the `giftStaging` experiments, adding a fresh `Review v2` tab produced the expected multi-widget behavior where the older `Review` tab did not
  - when native layout behavior appears contradictory, test with a fresh tab/widget identity before concluding that the underlying primitive is unsupported
- Product framing improved by these tests:
  - do not assume there must be one universal review surface for every organisation
  - prefer defining review building blocks that can be assembled and reordered:
    - review state,
    - donor match,
    - core gift fields,
    - processing,
    - Gift Aid,
    - recurring donation,
    - provider evidence,
    - failure / diagnostics
  - then choose a strong default assembly rather than overfitting the first layout to every organisation's priorities

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

## 6a. Metadata Field Types

Use for:

- choosing the correct Twenty field type before creating new metadata
- avoiding ad hoc field-type guesses during app sessions
- reviewing whether existing v1 fields were created with the right Twenty primitive

Current confidence:

- `proven` for the field types visible in the Twenty UI and exercised in the fundraising apps

Working rule:

- check this list before searching source or guessing field types
- if the intended field does not fit cleanly into one of these types, stop and decide whether the model is wrong rather than forcing it

Current field types exposed in the UI:

- `Text`
- `Number`
- `True/False`
- `Date and Time`
- `Date`
- `Select`
- `Multi-select`
- `Rating`
- `Files`
- `Currency`
- `Emails`
- `Links`
- `Phones`
- `Full Name`
- `Address`
- `Rich Text`
- `Relation`
- `JSON`
- `Array`

Current fundraising guidance:

- prefer `Address` over prematurely decomposing address into many text fields
- prefer `Select` for small normalized classifications that are expected to remain queryable and stable
  only when the vocabulary is intentionally controlled by the product or team
- do not default to `Select` for auto-populated external/provider/source values
  if new values may appear from CSVs, integrations, or upstream systems before we have updated the option list
- for external or lower-trust ingest values, prefer `TEXT` unless we are confident the value set is bounded and operationally maintained
- where both concerns matter, split them:
  store the raw incoming value as `TEXT`, and store any internal normalized classification separately as `Select`
- prefer `JSON` for bounded provider-specific evidence snapshots rather than exploding many one-off top-level fields
- use `Relation` only when the related object is genuinely part of the implemented product slice
- be cautious with `Phones`, `Emails`, `Links`, and other richer composite types if the workflow only needs one simple intake evidence value

Important note:

- some current v1 fundraising fields may have been created before we had this clearer reference point
- we should plan a later review of existing field types to confirm they still match the intended product model rather than assuming the first choice was correct

## 6b. Metadata Field Definition Shape

When creating fields in the app, do not rely only on the field-type name.

The field definition files have a specific format and should stay consistent.

Look here first:

- [mailing-address-on-person.field.ts](/home/jamesbryant/workspace/dev-stack/apps/fundraising/nonprofit-fundraising/src/fields/mailing-address-on-person.field.ts)
- [recurring-agreement-on-gift-staging.field.ts](/home/jamesbryant/workspace/dev-stack/apps/fundraising/nonprofit-fundraising/src/fields/recurring-agreement-on-gift-staging.field.ts)
- [gift-staging.object.ts](/home/jamesbryant/workspace/dev-stack/apps/fundraising/nonprofit-fundraising/src/objects/gift-staging.object.ts)

Current practical split:

- use `defineField(...)` in `src/fields/` when adding standalone fields to existing objects, especially standard objects and relations
- use object-local field definitions inside `defineObject(...)` when the fields are part of an app-defined object's core schema

Typical `defineField(...)` shape:

- exported stable `universalIdentifier`
- `objectUniversalIdentifier`
- `type`
- `name`
- `label`
- `description`
- `icon`
- nullability/default settings where needed

Additional relation-field requirements:

- `relationTargetObjectMetadataUniversalIdentifier`
- `relationTargetFieldMetadataUniversalIdentifier`
- `universalSettings` with relation type, delete behavior, and join-column name when needed

Working rule:

- before adding a new field, check an existing example of the same category:
  - simple scalar field
  - composite field such as `Address`
  - relation field
- do not invent the structure from memory if an existing example already exists in the app

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
## Tab Identity And Structural Changes

Observed runtime lesson:

- changing an existing record tab from a single full-tab front-component surface into a multi-widget tab may not apply cleanly in the workspace
- Twenty can continue treating that tab as the older persisted/full-tab shape even when the page-layout code now declares multiple widgets

What worked better in practice:

- create a fresh tab identity when changing a tab's structural model
- especially when moving from:
  - one full-tab front component
  - to a true multi-widget tab

Examples from the pilot:

- `giftStaging`: `Review` vs fresh `Review v2`
- `gift`: `Gift Aid` vs fresh `Gift Aid v2`

Working implication:

- do not assume an in-place tab-structure mutation is a reliable migration path for an already-existing workspace tab
- when the structural model changes materially, prefer a fresh tab and fresh widget identities

## Front-Component Runtime Sync

Use for:

- understanding how multiple front components behave on the same record page
- deciding whether a modular multi-widget page needs an explicit refresh/invalidation pattern

Current confidence:

- `proven` that sibling widgets do not automatically stay in sync after mutations
- `proven` that each widget is rendered in its own worker runtime in the current local Twenty app stack
- `experimental` that browser-level `BroadcastChannel` invalidation works as a practical app-side workaround

What we verified locally:

- the public front-component SDK currently exposes a small host API:
  - `useRecordId`
  - navigation
  - snackbar / side-panel helpers
  - progress / unmount helpers
- it does not expose a native sibling refresh, shared record cache, or page-level invalidation primitive
- each front-component widget is rendered separately and spins up its own worker runtime

Why this matters:

- modular record pages are good for configurability, but widget isolation means one widget mutating a record can leave sibling widgets stale
- this matters most on operational review pages, where a summary block should reflect donor/process/review changes immediately

Current practical workaround:

- use a narrow browser-level invalidation signal such as `BroadcastChannel`
- scope the message to the record being invalidated
- let each affected widget decide whether to refetch

Important caveat:

- this is not a documented Twenty feature
- it is a browser/runtime experiment that appears to work in the current worker-based front-component sandbox
- if Twenty later provides native page-level refresh or shared record invalidation, prefer the native mechanism

Suggested usage pattern:

- use this only on operational multi-widget record pages
- treat it as invalidation only, not a general event bus
- avoid broad messages that would cause many unrelated widgets to refetch
