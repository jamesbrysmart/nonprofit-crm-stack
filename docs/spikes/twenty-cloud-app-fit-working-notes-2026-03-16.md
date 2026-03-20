# Twenty Cloud App Fit Working Notes (2026-03-16)

Status: temporary working note for the exploratory cloud-app fit spike. Keep this as the live record of what we try, what we learn, and how the plan changes. Promote durable conclusions into the main spike doc or canonical docs later.

## Purpose

- Keep the strategic spike brief stable while we iterate.
- Record attempted approaches, findings, blockers, rough edges, and changed assumptions.
- Make it easy to pause, resume, or redirect without losing the shape of the investigation.

## Working Rules

- The phased spike plan is guidance, not a rigid contract.
- We can pause, reorder, narrow, or expand based on evidence.
- If a higher-priority issue appears, capture it here and explicitly decide whether to divert.
- If the path proves smoother than expected, capture why before expanding scope.
- Prefer current SDK/Twenty primitives and reference patterns first.
- Inspect upstream code/docs before inventing local abstractions or wrappers.
- Add custom adapters only when we can point to a concrete mismatch, limitation, or missing primitive.
- Record those mismatches as spike evidence rather than silently abstracting them away.
- Do not accept duplicated app/service implementations as a casual default. If duplication starts to appear, stop and record why.

## Current Starting Point

- Superproject branch: `spike/twenty-apps-gift-staging-process`
- Strategic brief: [`docs/spikes/twenty-cloud-app-fit-spike-2026-03-16.md`](/home/jamesbryant/workspace/dev-stack/docs/spikes/twenty-cloud-app-fit-spike-2026-03-16.md)
- Current upstream baseline is reflected in [`docs/TWENTY_EXTENSIBILITY_WATCH.md`](/home/jamesbryant/workspace/dev-stack/docs/TWENTY_EXTENSIBILITY_WATCH.md)

## Current Intent

Default first move:

- pass 1 backend capability and operating model work,
- using the single-record gift staging -> processing -> gift creation flow as the learning slice.

Important open questions to keep in view:

- what changes if we assume Twenty Cloud rather than self-hosting,
- whether our current fundraising API still makes sense,
- whether our current auth layer still makes sense,
- what remains an external edge responsibility even if core workflow logic moves in-app.
- where canonical domain logic should live if this pattern is meant to apply to future modules as well.

## Notes

### 2026-03-16

- Created strategic spike brief.
- Agreed to keep the strategic framing broader than "migrate fundraising-service into Twenty Apps".
- Agreed to treat the phased plan as guidance rather than a hard sequence.
- Identified canonical logic ownership as a core spike question, not just an implementation detail.
- Rejected duplicated app/service implementations as the preferred outcome.
- Current architectural fork to evaluate is:
  - shared domain core with app and self-hosted runtime adapters, or
  - app-native canonical runtime that self-hosting would also need to respect.
- We should remain genuinely open between those two paths until the spike gives us stronger evidence.
- Built the first full-path app-side processing function for `giftStaging -> gift` using `CoreApiClient`.
- The current app-side flow now covers:
  - staging fetch,
  - processability checks,
  - raw payload parse,
  - thin donor resolution,
  - canonical gift creation,
  - staging writeback,
  - recurring agreement update.
- Local validation remains clean:
  - `yarn lint`
  - `yarn twenty app:typecheck`
- Current evidence from this first pass:
  - the workflow shape fits naturally into a Twenty logic function,
  - the app model can express the orchestration without recreating the Nest service graph,
  - metadata ownership is broad but still manageable in app-native form,
  - donor resolution is the clearest current parity gap and therefore the clearest next shared-core candidate.
- Important caution:
  - this is strong **authoring / structural** evidence,
  - not yet real runtime evidence from sync/install/execution in a clean workspace.
- Current donor-resolution gap:
  - initial app implementation used direct person lookup by email/name plus fallback person creation,
  - we then deepened the app path to call the duplicate endpoint first and only fall back to direct lookup if duplicate lookup fails,
  - this moves the app flow materially closer to the current service behavior without copying the full service graph,
  - but we still have not proven full behavioral parity of donor matching.
- Current recommendation:
  - treat donor resolution as the next focused slice,
  - use it to test whether this logic wants to become shared canonical logic or remain app-native.
- Additional evidence after deepening donor resolution:
  - the app runtime can use raw Twenty REST endpoints where the higher-level client is not the right fit,
  - this is important because not all interesting fundraising behavior maps neatly onto the generated GraphQL client alone,
  - it also means the line between "app-native" and "service-shaped" is not simply "SDK client only" versus "external service",
  - the deeper question remains whether the donor-resolution rules themselves should be shared, even if the transport path differs by runtime.

## Logic Slicing Rule For Pass 1

### Why This Matters

Before we write the first processing logic function, we need a working rule for how to treat the existing `fundraising-service` code.

The goal is not to mechanically move Nest services into the app. The goal is to learn:

- which parts of the current implementation are real domain logic,
- which parts are orchestration/runtime code,
- which parts are transport/auth/integration glue,
- and whether the path forward looks more like a shared domain core or an app-native canonical runtime.

### Current Rule

For the spike, we should:

- preserve domain rules where they are genuinely runtime-agnostic,
- rewrite orchestration and IO in the app-native style,
- avoid lifting Nest/container structure directly into the app,
- treat transport/auth/integration code as runtime-specific unless the spike proves otherwise.

### Current Classification

#### Domain Logic

This is the logic we should try hardest to preserve or extract cleanly.

- processing-state decisions such as `canProcess`
- "already processed" handling
- raw payload parsing expectations
- payload validity rules for whether a gift can be created
- gift payload shaping logic such as `buildTwentyGiftPayload`
- recurring `nextExpectedAt` calculation
- donor-resolution decision rules, if they can be separated from the current service wrappers
- receipt-policy rules, if they can be separated cleanly from current runtime services

These are the most likely candidates for a future shared core or canonical logic layer.

#### Orchestration / Runtime Code

This is workflow coordination that may differ between app and self-hosted runtimes.

- the overall `processGift(stagingId)` execution flow
- sequencing reads, decisions, writes, and follow-up updates
- deciding when to persist intermediate staging changes
- function entrypoint shape and invocation model
- app-specific trigger configuration
- error-handling flow tied to function/runtime behavior

This layer is likely to exist in both runtimes even if the domain logic converges.

#### Transport / Auth / Integration Code

This is the code we should assume is runtime-specific unless evidence shows otherwise.

- `TwentyApiService`
- Nest dependency injection and service wiring
- route/controller concerns
- current fundraising API surface
- auth middleware or service-specific authorization assumptions
- runtime-specific logging infrastructure
- direct HTTP request wrappers around Twenty endpoints

This is the least likely layer to be shared directly.

### Practical Consequence For The First Processing Function

The first app-side processing function should **not** be a direct copy of `gift-staging-processing.service.ts`.

Instead it should aim to:

- keep the processing path recognizable,
- preserve the real domain rules where possible,
- replace service/HTTP/container assumptions with app-native client usage,
- reveal whether the shared-core split feels natural or forced.

### Current Evaluation Question

As we implement the first processing function, we should keep asking:

- does this logic want to become runtime-agnostic shared domain logic,
- or does the app model make it natural for this to become app-native canonical logic instead?

If the answer remains ambiguous, that is acceptable. The spike only needs to make the trade-offs clearer than they are today.

## Donor Resolution Classification

### Why This Deserves Its Own Pass

Donor resolution is now the clearest place where the app-side implementation and the current self-hosted service risk diverging.

That makes it a strong candidate for deciding whether we are looking at:

- logic that wants to become shared canonical behavior, or
- logic that is acceptable to keep primarily app-native.

### Current Comparison

The current self-hosted path in [`person-identity.service.ts`](/home/jamesbryant/workspace/dev-stack/services/fundraising-service/src/identity-resolution/person-identity.service.ts):

- normalizes incoming contact data,
- performs duplicate lookup via `/people/duplicates`,
- selects a preferred match using explicit semantics:
  - prefer exact email match,
  - otherwise use a fallback duplicate candidate,
- returns structured match information,
- creates a person when needed,
- contains batch-oriented variants and response-shape extraction helpers.

The current app-side path in [`process-staged-gift.ts`](/home/jamesbryant/workspace/dev-stack/apps/fundraising/cloud-fit-spike/src/logic-functions/process-staged-gift.ts):

- resolves donor identity inline as part of the processing function,
- now attempts duplicate lookup first via the REST endpoint,
- falls back to direct `people` queries by email/name if duplicate lookup fails,
- creates a person when needed,
- writes the resolved donor back to staging.

### Current Classification

#### Domain Logic

This is the part most likely to want a shared canonical home.

- contact normalization
- duplicate candidate interpretation
- match-selection semantics:
  - prefer exact email match,
  - otherwise use the best fallback candidate
- decision rules for when to create a new person
- what counts as "good enough" identity confidence to proceed

These rules are not inherently tied to Nest, the app runtime, or a specific client.

#### Orchestration / Runtime Code

This is the part that may reasonably differ between app and self-hosted runtimes.

- when donor resolution is invoked in the overall processing flow
- whether staging writeback happens immediately after resolution
- how resolution failures are surfaced to the processing function
- whether a fallback query path should run if duplicate lookup is unavailable

This layer may stay runtime-specific even if the core matching rules converge.

#### Transport / Integration Code

This is the part least likely to be shared directly.

- calling `/people/duplicates`
- calling `people` queries through `CoreApiClient`
- calling `createPerson`
- handling token/base-url lookup for raw REST access
- parsing response envelopes from specific Twenty endpoints

The current app path already shows that this layer can differ while still preserving similar matching intent.

### Current Reading

Donor resolution currently looks like a **strong shared-core candidate**.

Why:

- the interesting part is the match-selection and fallback behavior, not the HTTP client code,
- the same behavior matters in both self-hosted and app-first runtimes,
- duplication risk here would lead to real behavioral drift, not just different wiring.

At the same time, the transport layer for donor resolution does **not** need to be identical across runtimes.

That suggests a plausible shape going forward:

- shared donor-resolution rules and interpretation logic,
- runtime-specific adapters for:
  - duplicate lookup,
  - person query fallback,
  - person creation,
  - staging writeback.

### Practical Implication

If we continue along this path, donor resolution is a good place to test the first small shared helper/module extraction.

Not because we need to fully refactor now, but because it is the clearest example where:

- the domain rules matter,
- the current service already contains richer behavior,
- and the app path can now express enough of the flow to make the comparison real.

### Probe Result

We ran a deliberately small shared-core probe by extracting only the donor-resolution rule layer into a plain local module inside the spike app.

What moved into the probe:

- contact normalization
- duplicate-candidate interpretation
- match-selection preference
- minimal "can lookup / can create" decision helpers

What stayed outside the probe:

- duplicate REST call
- `CoreApiClient` queries
- `createPerson`
- staging writeback
- overall processing-function orchestration

Outcome:

- the extraction stayed small and coherent,
- the app function still reads naturally,
- lint and typecheck remained clean,
- the seam did not feel artificial at this scale.

Current interpretation:

- this does **not** prove that a broader shared canonical layer is definitely the right future architecture,
- but it **does** show that the donor-resolution rule layer is a credible shared-core candidate,
- and that we can test that idea without derailing the spike or building shared infrastructure too early.

## Runtime Validation Findings

### Local Workspace Prerequisite

The first clean `v1.19` workspace validation attempt failed before app install because the workspace-level applications feature flag was disabled.

Observed failure:

- `yarn twenty app:build` reached schema sync and then failed with:
  - `Feature flag "IS_APPLICATION_ENABLED" is not enabled for this workspace`

Practical implication:

- a fresh local Twenty workspace is **not** sufficient on its own for app validation,
- local runtime validation also requires `IS_APPLICATION_ENABLED` to be enabled for the workspace.

Canonical operational reference:

- [`docs/OPERATIONS_RUNBOOK.md`](/home/jamesbryant/workspace/dev-stack/docs/OPERATIONS_RUNBOOK.md), section `Feature flags & settings toggles (AI / Applications)`

Additional local finding:

- the generic runbook `INSERT` statement is stale for the current schema because `core."featureFlag"."workspaceId"` is now required
- for the current local workspace, the applications flag had to be inserted with an explicit `workspaceId`

### Development Environment Gate

After enabling `IS_APPLICATION_ENABLED`, the next `yarn twenty app:build` attempt failed with:

- `This endpoint is only available in development or test environments`

What we verified:

- the SDK build flow calls `createDevelopmentApplication`
- `createDevelopmentApplication` is guarded by `DevelopmentGuard`
- `DevelopmentGuard` only allows `NODE_ENV=development` or `NODE_ENV=test`
- Twenty defaults `NODE_ENV` to production when it is not explicitly set
- the current local Dockerized Twenty `v1.19` stack is not setting `NODE_ENV`, so it behaves as production-mode for this endpoint

Current reading:

- local app validation is not just "run a local Twenty image and authenticate the SDK"
- the current `app:build` development flow expects a development/test-capable Twenty server environment
- our current Dockerized local stack and the SDK app-development workflow do not line up by default

Practical implication:

- a clean local `v1.19` workspace with applications enabled is still insufficient for full SDK-driven app validation
- the next validation step likely requires either:
  - a dev-capable Twenty server environment, or
  - an explicit local override to make the Dockerized server behave as a development environment for app work

### Successful Local Runtime Validation

We then introduced a dedicated local app-dev Docker override with:

- `server.NODE_ENV=development`
- `worker.NODE_ENV=development`

Result:

- `yarn twenty app:build` completed successfully against the local `v1.19` workspace
- output written to:
  - `.twenty/output`

What this proves:

- the current app metadata and logic-function package can be built and synced successfully in a real local workspace
- the spike has now moved beyond authoring/type-level evidence into real runtime validation
- the earlier blockers were meaningful environment/tooling gates, not just speculative concerns

Current local validation prerequisites now look like:

- Twenty `v1.19`
- valid SDK auth to the local workspace
- `IS_APPLICATION_ENABLED` enabled for the workspace
- development-mode Twenty server environment for the SDK app-development flow
- temporary GraphQL/REST workaround in the processing function instead of `twenty-sdk/clients`

Immediate next runtime question:

- can the synced `process-staged-gift` logic function execute successfully against a real staged record, not just build and sync?

## Spike Close-Out Path

At this point, the spike has established:

- app authoring viability,
- successful local sync/build against a real `v1.19` workspace,
- key environment/runtime prerequisites for local app validation,
- one credible shared-core candidate in donor-resolution rules,
- and one meaningful SDK/tooling blocker around `twenty-sdk/clients`.

The remaining capstone step is intentionally narrow:

- run the synced `process-staged-gift` function against one real staged record,
- inspect the resulting state changes,
- and use that result to decide whether the spike has demonstrated enough app-fit evidence for this slice.

### Capstone Runtime Result

We completed the first real end-to-end execution pass for the synced
`process-staged-gift` function against app-owned `giftStaging` records.

What this proved:

- the synced logic function can execute successfully in the local `v1.19`
  app-development environment,
- the function can move a staging record to a processed outcome,
- and the function can create a canonical `gift` record from app-owned staging
  data.

Important runtime finding:

- duplicate lookup via `POST /rest/people/duplicates?depth=0` works when called
  directly with workspace API auth,
- but the same lookup from app runtime failed with:
  - `NO_AUTHENTICATION_CONTEXT`
- the processing function therefore fell back to direct person lookup and still
  completed successfully.

Current reading:

- this is not a malformed duplicate-lookup payload issue,
- it appears to be an auth-context compatibility issue between app runtime and
  the duplicate REST endpoint,
- and the current fallback to direct person query is therefore a real spike
  adaptation, not just a temporary payload workaround.

### First Pass 2 UI Finding

After the backend path was proven, we added the thinnest possible UI surface for
`giftStaging`:

- one `INDEX` view for the `giftStaging` object,
- one linked navigation menu item in the sidebar.

What this proved:

- Twenty's metadata-first UI model for apps is real,
- object visibility depends on app-owned view and navigation definitions rather
  than only object metadata,
- and basic object/list UI can be authored and synced successfully.

Important UI-specific constraint:

- the object's label identifier field has to be the first field in the index
  view,
- for `giftStaging`, that meant `donorEmail` had to appear before
  `processingStatus` and other operator-facing fields.

Current reading:

- the current UI model is more opinionated and constrained than a blank-slate
  custom application shell,
- native object/view/navigation surfaces look possible,
- but they do **not** yet prove the level of workflow-specific UI flexibility we
  are likely to need for richer fundraising operations.

Front-component implication:

- the current docs indicate that front components are the likely route to
  richer custom UI,
- but the docs/examples still describe them as components rendered *within*
  Twenty's UI in isolated contexts,
- so we should not yet assume that apps provide a fully blank-slate frontend
  model equivalent to owning our entire `fundraising-service` UI.

Practical conclusion:

- list/view/navigation primitives are viable,
- richer operator workflow UI remains unproven,
- and a future UI-focused spike should test a front-component-driven review or
  process surface before we assume the app model is flexible enough for the
  broader module UX.

Unless that execution step uncovers a major new path worth following immediately, the expectation should be:

- treat the spike as complete after the first real end-to-end function execution pass,
- summarize findings,
- and decide what should become a follow-on spike or implementation track rather than extending this one indefinitely.

### SDK Build Blocker: `twenty-sdk/clients`

We also confirmed a separate SDK/tooling blocker while validating the first app build.

Observed failure:

- importing `CoreApiClient` from `twenty-sdk/clients` in a logic function caused `yarn twenty app:build` to fail trying to resolve:
  - `node_modules/twenty-sdk/src/clients/index.ts`

What we verified:

- the app imported the public-looking path:
  - `import { CoreApiClient } from 'twenty-sdk/clients'`
- the installed `twenty-sdk@0.7.0` package exports `./clients` via `dist/clients`
- the published package ships `dist/clients`, not `src/clients`
- current upstream SDK build code still contains a resolver that rewrites `twenty-sdk/clients` to `src/clients`

Current reading:

- this looks like a real SDK packaging/build mismatch rather than an app-level mistake,
- but the spike should still treat the final upstream-quality fix as an open question until Twenty confirms intended behavior.

Current spike workaround:

- the processing function now uses a thin direct GraphQL/REST adapter instead of `CoreApiClient`,
- this keeps the spike moving on app-fit/runtime questions without depending on the currently broken typed-client build path.

## Pass 1 Execution Note

### Current Goal

Run the smallest real backend experiment that can tell us whether a meaningful slice of the fundraising staging workflow fits naturally into a Twenty App.

### Chosen Slice

The first pass-1 experiment will focus on the **single-record staging -> process -> gift creation** path, specifically:

- read a staged gift record,
- determine whether it is processable,
- resolve donor identity as needed,
- create the canonical gift,
- write status/error/gift-id updates back to staging.

This intentionally excludes:

- batch processing,
- bulk donor matching,
- full staging queue UX,
- route/webhook ingress,
- broader admin workflow polish.

### First Implementation Target

Start from the core processing path in:

- [`services/fundraising-service/src/gift-staging/gift-staging-processing.service.ts`](/home/jamesbryant/workspace/dev-stack/services/fundraising-service/src/gift-staging/gift-staging-processing.service.ts)

Reason for choosing this first:

- it is the most informative operational path in the selected slice,
- it forces contact with app-auth, staging reads/writes, donor resolution, gift creation, and status handling,
- it should tell us quickly whether the current service/API boundary is fundamental or mostly accidental.

### Initial Architecture Hypothesis

Current working hypothesis for this first experiment:

- **Inside the app**
  - minimum staging metadata slice needed for the experiment,
  - process-gift logic function,
  - any thin adapters needed to call Twenty APIs from app context,
  - staging status/error writeback logic.

- **Possibly still external or unresolved**
  - existing bespoke fundraising API surface,
  - current service-level auth middleware,
  - connector/webhook ingress,
  - batch orchestration and high-volume operational workflows.

This hypothesis is intentionally provisional. The point of the experiment is to test it.

### Success Signals

- We can express the processing path as app logic without a major platform blocker.
- Required read/write operations work under app auth or via an acceptable in-app pattern.
- The ported code mostly needs thin reshaping rather than deep redesign.
- We end the experiment with a clearer view of which responsibilities still justify an external edge/service layer.

### Awkward-But-Useful Signals

- The path works, but only with clumsy API patterns, awkward adapters, or significant code reshaping.
- The app model appears viable in principle, but not yet attractive for broader migration.

### Blocker Signals

- App-auth cannot perform the required operations for the slice.
- The app runtime cannot credibly support the selected processing path.
- The required staging/gift operations depend on capabilities that are absent rather than merely inconvenient.

### Evidence To Capture During This Experiment

- Which exact operations work cleanly in app context.
- Which exact operations require workarounds or fail.
- Whether donor resolution logic ports naturally or reveals hidden service assumptions.
- Whether the current fundraising API/auth boundary still appears justified after touching the in-app version.
- What this implies for Twenty Cloud compatibility rather than only self-hosted viability.

## Pass 1 Minimum Metadata Slice

### Why This Matters

Metadata creation/ownership is part of the experiment, not just setup.

In the current self-hosted model we provision fundraising metadata via script. For a Twenty Cloud-compatible app model, we need to learn whether the selected workflow can own enough of its schema declaratively and survive install/update/uninstall cleanly.

### Current Recommendation

For pass 1, do **not** try to reproduce the full `giftStaging` object.

Instead, define the minimum metadata slice needed to support the single-record processing-path experiment.

### Must-Have Now

These fields/relations appear necessary for a credible processing-path experiment.

- **Object**
  - `giftStaging`

- **Core processing state**
  - `processingStatus`
  - `validationStatus`
  - `dedupeStatus`
  - `errorDetail`
  - relation to canonical `gift`

- **Payload persistence / processing source**
  - `rawPayload`
  - `processingDiagnostics`

- **Required gift payload basics**
  - `amount`
  - `giftDate`

- **Identity fields used by processing / donor resolution**
  - relation to `person` as `donor`
  - relation to `company` as `company`
  - `donorFirstName`
  - `donorLastName`
  - `donorEmail`
  - `organizationName`

- **Classification / relationship fields that may be passed through to gift creation**
  - relation to `fund`
  - relation to `appeal`
  - relation to `opportunity`
  - relation to `recurringAgreement`

- **Optional but likely useful for realistic processing**
  - `giftIntent`
  - `expectedAt`

### Can Fake Temporarily

These do not look essential for the first processing-path experiment if they slow metadata setup down.

- `intakeSource`
- `sourceFingerprint`
- `externalId`
- `paymentMethod`
- `giftAidEligible`
- `feeAmount`
- `notes`

These may still matter later, but we do not need all of them to answer the first app-fit question.

### Defer Unless Needed

These look out of scope for the first experiment.

- relation to `giftBatch`
- relation to `giftPayout`
- `provider`
- `providerPaymentId`
- `providerContext`
- `appealSegmentId`
- `trackingCodeId`
- `isInKind`
- `inKindDescription`
- `estimatedValue`
- receipt-related fields
- bulk-update/batch-upsert-oriented metadata

### Current Rationale

This recommendation is based on:

- the processing flow in [`gift-staging-processing.service.ts`](/home/jamesbryant/workspace/dev-stack/services/fundraising-service/src/gift-staging/gift-staging-processing.service.ts),
- the current staging schema in [`setup-schema.mjs`](/home/jamesbryant/workspace/dev-stack/services/fundraising-service/scripts/setup-schema.mjs),
- the staging record model in [`staging-record.model.ts`](/home/jamesbryant/workspace/dev-stack/services/fundraising-service/src/gift-staging/domain/staging-record.model.ts),
- the staging payload mapper in [`domain-to-twenty.mapper.ts`](/home/jamesbryant/workspace/dev-stack/services/fundraising-service/src/gift-staging/mappers/domain-to-twenty.mapper.ts),
- donor-resolution and gift-payload shaping in [`gift.service.ts`](/home/jamesbryant/workspace/dev-stack/services/fundraising-service/src/gift/gift.service.ts) and [`gift-payload.util.ts`](/home/jamesbryant/workspace/dev-stack/services/fundraising-service/src/gift/gift-payload.util.ts).

### Open Decision To Resolve Before Implementation

For pass 1, the current recommendation is to include the real relation fields for the selected workflow shape:

- `giftStaging -> donor`
- `giftStaging -> company`
- `giftStaging -> fund`
- `giftStaging -> appeal`
- `giftStaging -> opportunity`
- `giftStaging -> recurringAgreement`
- `giftStaging -> gift`

Reason:

- relation creation/ownership is itself part of what we need to test,
- a simplified text-id fallback would reduce the value of the metadata/app-ownership learning,
- this keeps the pass-1 slice closer to the real schema shape used by the processing path.

Still deferred unless needed for the first pass:

- `giftStaging -> giftBatch`
- `giftStaging -> giftPayout`

## Current Twenty App Model Review (Pre-Implementation)

### Why This Review Exists

Before building pass 1, we needed to verify the **current** Twenty app authoring/runtime model in the merged `services/twenty-core` codebase.

This is important because our previous app work (for example, rollup-engine) happened against an earlier alpha-era surface. The current app model has evolved, and we do not want to build pass 1 against outdated assumptions.

### Current High-Level Model

Based on current upstream code and docs, Twenty apps are authored as local TypeScript projects whose entities are detected from `export default define<Entity>(...)` calls.

Core authoring primitives:

- `defineApplication`
- `defineObject`
- `defineField`
- `defineLogicFunction`
- `definePreInstallLogicFunction`
- `definePostInstallLogicFunction`
- `defineRole`
- `defineFrontComponent`
- `defineView`
- `defineNavigationMenuItem`
- `defineSkill`

References reviewed:

- [`packages/twenty-docs/developers/extend/apps/getting-started.mdx`](/home/jamesbryant/workspace/dev-stack/services/twenty-core/packages/twenty-docs/developers/extend/apps/getting-started.mdx)
- [`packages/twenty-docs/developers/extend/apps/building.mdx`](/home/jamesbryant/workspace/dev-stack/services/twenty-core/packages/twenty-docs/developers/extend/apps/building.mdx)
- [`packages/twenty-apps/hello-world`](/home/jamesbryant/workspace/dev-stack/services/twenty-core/packages/twenty-apps/hello-world)
- [`packages/twenty-apps/internal/call-recording`](/home/jamesbryant/workspace/dev-stack/services/twenty-core/packages/twenty-apps/internal/call-recording)

### Current Trigger Model

The current logic-function model uses explicit trigger-setting properties on the function definition, not a generic catch-all trigger array as the primary authoring pattern.

Current trigger shapes in code:

- `httpRouteTriggerSettings`
- `cronTriggerSettings`
- `databaseEventTriggerSettings`

References:

- [`packages/twenty-sdk/src/sdk/logic-functions/define-logic-function.ts`](/home/jamesbryant/workspace/dev-stack/services/twenty-core/packages/twenty-sdk/src/sdk/logic-functions/define-logic-function.ts)
- [`packages/twenty-shared/src/application/logicFunctionManifestType.ts`](/home/jamesbryant/workspace/dev-stack/services/twenty-core/packages/twenty-shared/src/application/logicFunctionManifestType.ts)
- [`packages/twenty-apps/hello-world/src/logic-functions/hello-world.ts`](/home/jamesbryant/workspace/dev-stack/services/twenty-core/packages/twenty-apps/hello-world/src/logic-functions/hello-world.ts)
- [`packages/twenty-apps/fixtures/postcard-app/src/logic-functions/on-post-card-created.function.ts`](/home/jamesbryant/workspace/dev-stack/services/twenty-core/packages/twenty-apps/fixtures/postcard-app/src/logic-functions/on-post-card-created.function.ts)

Implication for pass 1:

- our processing-path experiment should be expressed in terms of the current explicit trigger settings,
- if we need manual invocation first, we may not need any trigger initially,
- if we later test ingress, we should use the current route-trigger shape rather than assuming old patterns.

### Current Client/Auth Model

The current app runtime/client model is more specific than our earlier mental model:

- `MetadataApiClient` ships with the SDK,
- `CoreApiClient` starts as a stub and is generated during `app:build` / `app:dev`,
- app code imports clients from `twenty-sdk/clients`.

Auth precedence in the generated clients is:

- explicit authorization header,
- `TWENTY_APP_ACCESS_TOKEN`,
- `TWENTY_API_KEY` (legacy fallback).

The default application role matters because it scopes what the runtime client can do.

References:

- [`packages/twenty-sdk/src/clients/index.ts`](/home/jamesbryant/workspace/dev-stack/services/twenty-core/packages/twenty-sdk/src/clients/index.ts)
- [`packages/twenty-sdk/src/clients/generated/metadata/index.ts`](/home/jamesbryant/workspace/dev-stack/services/twenty-core/packages/twenty-sdk/src/clients/generated/metadata/index.ts)
- [`packages/twenty-sdk/src/cli/utilities/client/twenty-client-template.ts`](/home/jamesbryant/workspace/dev-stack/services/twenty-core/packages/twenty-sdk/src/cli/utilities/client/twenty-client-template.ts)
- [`packages/twenty-docs/developers/extend/apps/building.mdx`](/home/jamesbryant/workspace/dev-stack/services/twenty-core/packages/twenty-docs/developers/extend/apps/building.mdx)

Implication for pass 1:

- app-auth is not just a conceptual idea; it has a concrete runtime path we must test,
- role design is part of the experiment, not an afterthought,
- any assumption that our current standalone auth layer is still required needs to be re-proven against this runtime model.

### Current Build/Dev Flow

The current app build flow is not just local packaging.

`app:build` currently:

- builds and validates the manifest,
- builds application files,
- syncs application schema,
- generates the core API client,
- typechecks,
- rebuilds with the generated client,
- syncs built files again.

References:

- [`packages/twenty-sdk/src/cli/public-operations/app-build.ts`](/home/jamesbryant/workspace/dev-stack/services/twenty-core/packages/twenty-sdk/src/cli/public-operations/app-build.ts)
- [`packages/twenty-sdk/src/cli/commands/app/app-dev.ts`](/home/jamesbryant/workspace/dev-stack/services/twenty-core/packages/twenty-sdk/src/cli/commands/app/app-dev.ts)

Implication for pass 1:

- metadata sync is part of the normal app loop,
- generated clients are part of the normal app loop,
- we should not think of pass 1 as "write files, then maybe sync later",
- this also reinforces that metadata ownership/install-update behavior is central to the spike.

### Current Relation Model

The current app relation model is more explicit than our existing `setup-schema.mjs` helper pattern.

Observed pattern in reference apps:

- relation fields are declared as explicit app fields,
- the reverse side is also declared explicitly,
- each side references the other using `relationTargetFieldMetadataUniversalIdentifier`,
- standard objects are targeted using `STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS`.

References:

- [`packages/twenty-apps/internal/call-recording/src/fields/people-on-call-recording.field.ts`](/home/jamesbryant/workspace/dev-stack/services/twenty-core/packages/twenty-apps/internal/call-recording/src/fields/people-on-call-recording.field.ts)
- [`packages/twenty-apps/internal/call-recording/src/fields/call-recording-on-person.field.ts`](/home/jamesbryant/workspace/dev-stack/services/twenty-core/packages/twenty-apps/internal/call-recording/src/fields/call-recording-on-person.field.ts)
- [`packages/twenty-apps/fixtures/postcard-app/src/fields/post-card-on-post-card-recipient.field.ts`](/home/jamesbryant/workspace/dev-stack/services/twenty-core/packages/twenty-apps/fixtures/postcard-app/src/fields/post-card-on-post-card-recipient.field.ts)
- [`packages/twenty-sdk/src/sdk/objects/standard-object-ids.ts`](/home/jamesbryant/workspace/dev-stack/services/twenty-core/packages/twenty-sdk/src/sdk/objects/standard-object-ids.ts)

Implication for pass 1:

- our staging relations may require paired field definitions rather than a single helper call,
- relation authoring is likely to be one of the most important schema-learning parts of pass 1,
- we should expect the migration path here to involve explicit universal identifiers for both sides of each relation.

### Practical Translation For Pass 1

What pass 1 currently appears to entail in **today's** app model:

- create a dedicated app project rather than treating this as just a relocated service file,
- define application config and a least-privilege default role,
- declare the minimum `giftStaging` object and required fields as app metadata,
- declare the required relation fields explicitly, likely in paired form,
- create one processing-oriented logic function,
- use `CoreApiClient` / `MetadataApiClient` from `twenty-sdk/clients`,
- validate behavior through the current build/dev/sync loop rather than assuming old alpha patterns.

### Current Confidence / Caution

This review gives us a better current implementation model, but it does **not** mean we already know pass 1 will be straightforward.

The main caution areas now look like:

- app-auth permissions in practice,
- explicit relation authoring complexity,
- how much of our current processing code depends on service-layer assumptions,
- how well the current app loop supports this kind of operational workflow in a cloud-compatible posture.

## Pass 1 Build Order

### Goal Of This Build Order

Create a concrete sequence for the first implementation attempt so we avoid thrashing between metadata, runtime, and app-structure decisions.

This is still guidance, not a rigid contract, but it is the default order we should follow unless evidence gives us a good reason to reorder.

### 1. Create The Spike App Skeleton

Create a dedicated app package for the spike rather than treating pass 1 as a loose copy of service files.

What this should give us:

- app directory structure,
- `application-config.ts`,
- `roles/default-role.ts`,
- logic-functions folder,
- a clean place for app-owned metadata and runtime code.

Current intent:

- keep the spike app in our superproject rather than embedding it directly inside upstream `services/twenty-core`,
- but structure it as a real Twenty app package so it could later be ported or packaged cleanly if the spike succeeds.

### 2. Define The Default Role First

Before writing business logic, define the least-privilege default role the app will use.

Why this comes early:

- app-auth behavior is part of the experiment,
- we need to be explicit about what the processing function is allowed to read/update/create,
- this will likely surface hidden permission assumptions early.

Initial role scope to target:

- read/update on the minimum `giftStaging` object,
- create/read on `gift`,
- read access to any standard/custom related objects needed by donor resolution and gift creation,
- only the minimum permission flags required for the app flow.

### 3. Declare The Minimum `giftStaging` Object And Core Fields

Define the custom object and the non-relation fields needed for the processing-path experiment.

Start with:

- object definition,
- processing state fields,
- payload persistence fields,
- amount/date,
- donor identity text fields,
- any minimal passthrough fields we already decided are in-scope.

This should be the smallest schema that still supports a real processing attempt.

### 4. Declare Relation Pairs Explicitly

Add the required relations in the current app-native style, including reverse-side field definitions where needed.

Priority order:

1. `giftStaging <-> donor`
2. `giftStaging <-> company`
3. `giftStaging <-> gift`
4. `giftStaging <-> fund`
5. `giftStaging <-> appeal`
6. `giftStaging <-> opportunity`
7. `giftStaging <-> recurringAgreement`

Why this is a dedicated step:

- relation authoring is one of the main metadata-learning goals,
- it is likely to be the point where our current helper-driven schema mental model diverges most from the app model,
- getting relations right affects both permissions and runtime flow.

### 5. Add One Processing Logic Function

Create one logic function centered on the single-record process path.

Initial implementation target:

- translate the core of `gift-staging-processing.service.ts`,
- prefer manual invocation first if that reduces moving parts,
- add a trigger only when we know which trigger shape best matches the experiment.

Current bias:

- begin without overcommitting to ingress,
- focus on proving that app code can read the staged row, resolve donor identity, create the gift, and write back status.

### 6. Add Thin Adapters, Not A Service Rewrite

As code is ported, create the thinnest possible app-side adapters around:

- app clients,
- metadata/runtime differences,
- any payload shape mismatches,
- relation or ID translation needs.

Avoid rewriting the whole processing model early. The spike should first tell us whether the current logic ports naturally.

### 7. Run The Current Build / Dev / Sync Loop

Use the actual current app workflow:

- `app:build` and/or `app:dev`,
- manifest generation,
- schema sync,
- generated core client,
- typecheck,
- rebuild/sync cycle.

Why this is part of the build order rather than a final verification step:

- metadata ownership/install behavior is part of the spike,
- generated client behavior is part of the spike,
- app-auth/runtime behavior is part of the spike.

### 8. Record Findings Before Expanding Scope

After the first working attempt, stop and record:

- what built cleanly,
- what sync/install behavior looked like,
- what relation setup required,
- what permissions/auth assumptions broke,
- whether the processing path feels naturally app-native or awkward.

Only after that should we decide whether to:

- deepen pass 1,
- move to pass 2 UI work,
- or divert because the evidence points somewhere else.

## App Location Recommendation

### Current Recommendation

Build the spike app in the **superproject**, not inside upstream `services/twenty-core`.

### Why

- it preserves the third-party boundary more cleanly,
- it makes our spike work easier to reason about as "our app package" rather than an upstream modification,
- it still lets us use the merged `services/twenty-core` codebase as the local source of truth for the app model,
- if the spike succeeds, we can later decide whether to package, port, or mirror the app elsewhere.

### Practical Intent

We should structure the spike app as if it is a real Twenty app package from day one:

- clear app root,
- local `twenty-sdk` usage,
- current app build/dev flow,
- app-owned metadata,
- app-owned logic functions.

That gives us the best path to eventual reuse in both:

- our superproject-based development flow,
- and a cloud-oriented Twenty app packaging/distribution path.
