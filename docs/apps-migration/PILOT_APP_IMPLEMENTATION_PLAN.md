# Fundraising Pilot App Implementation Plan

Updated: 2026-04-21
Status: Working plan
Purpose: Define the first real implementation plan for the fundraising app that will support the pilot, using the spike results and the current Twenty `v2` app surface.

This plan is for implementation, not capability discovery. The spike work has already reduced enough uncertainty that the next app should be treated as phased production-quality delivery rather than an MVP shortcut.

## 1. Delivery Stance

This app should be built incrementally, but not as a compromised `v1`.

What that means:

- we are not lowering the product bar because this is the first pilot app,
- we are not rebuilding the same workflow a third time as a throwaway proof,
- we are not treating `pilot` or `v1` as permission to accept weak boundaries, poor testing, or ad hoc use of Twenty primitives.

What is true:

- we will build in phases,
- we will sequence work so value arrives early,
- we will deliberately use Twenty-native primitives where they fit,
- and we will defer only where that is a conscious product or sequencing decision, not because quality is optional.

Working standard:

- product-faithful behavior,
- production-oriented code quality,
- clear domain boundaries,
- correct use of Twenty app primitives,
- and test coverage appropriate to the workflow slice being built.

First-pass build posture:

- prioritize architectural principles first,
- keep code quality high from the beginning rather than planning a later cleanup pass,
- treat metadata as part of the product architecture, not just schema,
- and accept that some first-pass metadata may remain provisional until dedicated field-review checkpoints confirm what should stay stored versus derived.

## 2. Pilot Goal

The pilot app should deliver a practical fundraising workflow for the first customer without creating extra admin burden and without quietly weakening important product behavior.

Current pilot emphasis:

- manual donation operations,
- staging/review where it improves trust and control,
- Gift Aid,
- recurring donation workflow,
- and the integration/config surfaces that support those workflows.

The app should be judged by whether it gives the pilot customer a coherent production workflow inside Twenty, not by whether it ports every fundraising-service surface immediately.

## 3. Implementation Defaults

Use these defaults unless a slice proves they are the wrong fit.

### 3.1 Twenty-native defaults

- use Twenty-owned metadata as the primary product model,
- use front components and native command surfaces for operator workflows,
- use native host affordances for snackbars, progress, confirmation, and side-panel lifecycle,
- use variables for capability/config/runtime behavior,
- use official scaffolding and `yarn twenty add ...` for new top-level metadata entities where practical,
- use Twenty-native route logic/functions before assuming an external boundary,
- and start from Twenty primitives before building custom equivalents, but do not force product logic into them when a bounded app-local TypeScript layer gives a cleaner result.

Reference:

- [TWENTY_NATIVE_REFERENCE.md](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/TWENTY_NATIVE_REFERENCE.md)

### 3.2 Migration-source defaults

- treat `fundraising-service` as the source of truth for current product behavior and domain boundaries,
- treat `services/fundraising-service/scripts/setup-schema.mjs` as a secondary reference for fundraising metadata intent and naming, not as the authority on Twenty app metadata structure,
- treat the spike app as the reference for Twenty-native shape and viable primitive usage,
- do not copy the spike app mechanically into the production app,
- do not copy `fundraising-service` mechanically into Twenty code either.

### 3.3 Code-quality defaults

- add production-quality tests alongside each slice,
- keep fundraising-specific policy, orchestration, and state interpretation in bounded app-local TypeScript modules,
- keep front components, metadata, and route/logic-function entry points focused on platform concerns and workflow wiring,
- let those app-local modules be the place where we deliberately use TypeScript flexibility to build the best product boundary,
- keep metadata changes deliberate and scaffold-first where possible,
- and avoid reintroducing hybrid boundaries unless the platform/runtime actually forces them.

### 3.4 Architectural guardrails

- treat front components as workflow shells:
  - they should own host interaction, local UI state, and operator flow,
  - but should not become the place where fundraising policy or lifecycle rules accumulate.
- treat Twenty metadata as durable fact storage:
  - store the facts the platform and operators need to persist,
  - but derive operator-facing meaning in TypeScript unless that meaning genuinely needs to become first-class metadata.
- keep stored-metadata vs derived-state as an explicit cross-cutting question:
  - we do not want similar concepts handled differently across features without justification.
  - current leaning is to minimize metadata fields unless they are clearly justified by durable operational need.
  - this especially matters where a candidate field might become a second stored truth for something that could instead be derived from existing facts, lifecycle state, or evidence.
  - examples now under review include:
    - `ready now` / processability style concepts,
    - Gift Aid operational outcome on final gifts,
    - health / exception signals in recurring and reconciliation.
  - revisit this question deliberately as slices mature rather than letting one-off implementation convenience decide it feature by feature.
- treat app-local action modules as application services:
  - let them coordinate route calls, persistence, and workflow transitions,
  - rather than scattering business rules across mutation payloads in multiple components.
- introduce shared UI abstractions only after a pattern repeats:
  - prefer a thin shared presentation layer once two or three review surfaces want the same cards, labels, and interaction primitives,
  - but do not build a speculative internal framework first.

## 4. What The Spike Has Already De-risked

These should now be treated as credible implementation inputs rather than open capability questions.

- app-owned fundraising metadata in the app-dev workspace
- manual gift entry as a command-launched side-panel flow
- donor duplicate interruption
- explicit donor choice
- direct `person` plus app-owned `gift` creation
- staging review as a record-context/front-component workflow
- bounded batch processing with batch path, split fallback, row fallback, and chunked writeback
- Gift Aid bounded capability:
  - toggle
  - declaration object
  - gift-level outcome derivation
  - operational visibility
- claim/submission-shaped Gift Aid workflow inside the app
- variables for runtime/config/capability control
- roles as packaged app roles
- native host affordances as real operator workflow primitives

## 5. What Still Needs Care During Build

These are not blockers, but they still need deliberate handling.

### 5.1 Release/toolchain alignment

- use the actual released app toolchain in use at build time,
- verify import surfaces and runtime behavior against that release,
- and do not assume local `services/twenty-core` source and the published app toolchain are identical without checking.

### 5.2 Metadata lifecycle

- top-level metadata should be scaffolded where possible,
- `universalIdentifier`s should be treated as stable assets,
- large mixed metadata batches are riskier than small coherent additions,
- and view/layout/field changes remain migration-sensitive.

### 5.3 Data-model review discipline

- object and field additions made during implementation are not automatically treated as settled product decisions.
- where the product review left a field open as a `store vs derive` trade-off, the implementation may add a temporary first-pass field, but that field should be treated as provisional until a review pass confirms it.
- the main review question is:
  - is this field a durable fact we genuinely need to persist,
  - or is it operator-facing meaning/state that would be safer to derive in TypeScript?
- this matters especially for staging/review metadata, where fields such as donor-resolution state, readiness flags, processing status, error detail, and batch counters can easily drift into “convenient implementation state” without enough product scrutiny.
- practical rule:
  - do not stop a slice for exhaustive field debates,
  - but before treating an object shape as stable, run a dedicated field-review pass over the fields that were previously debated in [PRODUCT_REVIEW.md](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/PRODUCT_REVIEW.md).

### 5.4 Runtime boundaries

- batch execution lifecycle still needs disciplined implementation even though the bounded executor shape is credible,
- outbound integration/submission boundaries still need careful treatment,
- and provider-route/runtime validation should still be checked in the active toolchain when a workflow depends on specific webhook semantics such as signature verification.

### 5.5 Native UI adoption

- Twenty native UI should be treated as the intended direction,
- but exact runtime compatibility should still be verified in the active toolchain before broad adoption.

## 6. First App Boundary

The first pilot app should focus on the core fundraising operational workflow, not the entire future fundraising platform.

Include in the first app:

- manual gift entry
- app-owned `gift` metadata and core gift detail capture
- donor duplicate interruption and donor choice
- staging/review workflow where channel trust requires it
- batch review and bounded batch processing
- Gift Aid bounded capability
- Gift Aid claim workspace and submission-shaped lifecycle if it remains clean in the released toolchain
- capability/config variables
- operator command surfaces and host-affordance-based workflow UX

Do not assume first app scope includes:

- every historical fundraising-service surface,
- every long-tail admin/reporting workflow,
- full HMRC submission parity on day one,
- or full recurring/subledger/accounting parity before the core donation workflow is solid.

## 7. First Implementation Slices

These slices are ordered to preserve product coherence and reduce rework.

### Slice 1: App foundation

Build:

- fresh production app scaffold on the released toolchain
- metadata constants and scaffold-first structure
- testing harness aligned with Twenty’s app pattern
- default/runtime/admin role plus initial operational roles
- variables/config structure
- minimal navigation and page-layout baseline

Why first:

- this determines whether the real app starts cleanly from the correct toolchain and structural conventions.

### Slice 2: Manual gift entry

Build:

- `gift` object and minimum supporting metadata
- `New gift` command-launched side-panel flow
- duplicate-check route/function
- existing-donor and new-donor create path
- native host affordances for feedback and panel lifecycle

Carry over from spike:

- command flow shape
- duplicate interruption model
- direct `person` + `gift` creation

Quality bar:

- not a toy form
- should already be production-oriented in validation, interaction flow, and tests

### Slice 3: Staging and review

Build:

- `giftStaging`
- record-context staging drawer/review surface
- readiness/blocker model
- clear separation between staged truth and committed gift truth

Carry over from spike:

- drawer/review ergonomics
- record-context front-component pattern
- bounded domain model in app-local TypeScript

Guardrail:

- use Twenty objects, views, record pages, and host affordances for the workflow shell,
- but keep review-state derivation and product-specific policy in app-local TypeScript rather than encoding it ad hoc across UI and metadata.

Implementation note:

- staging review is difficult not because it needs "more fields", but because it needs to carry many different kinds of important information in a constrained space
- the hierarchy of what matters is real, but varies by organisation and by gift type:
  - donor ambiguity,
  - failed processing or blockers,
  - Gift Aid evidence such as declaration/address context,
  - likely new recurring donations,
  - fund/appeal coding,
  - organisational/grant context,
  - provider/source evidence
- this means the target review surface should not try to present "everything important" at once in one flat summary area
- instead, it should use a stable shell with adaptive emphasis:
  - immediate row identity/context,
  - dominant current review issue,
  - dominant next action,
  - then secondary contextual sections such as donor review, gift detail correction, and audit/support evidence
- list views are too configurable to be the main contract for this meaning; the `giftStaging` review surface itself should carry the important hierarchy
- the current working direction is to break this refinement into smaller passes rather than trying to solve the whole review surface in one UI iteration

Current experiment direction:

- the next iteration should use native Twenty record-page tabs rather than building a custom tab or drawer system inside one front-component
- `Review` should become a lighter operational landing tab:
  - donor, amount, date,
  - current state / next action,
  - main record actions,
  - batch context and an explicit `Go to batch` action
- secondary concerns should move out of one overloaded review surface so we can learn what deserves dedicated space
- the first native-tab experiment should likely test:
  - `Review`,
  - `Details`,
  - `Audit`
- dedicated domain tabs such as `Recurring` or `Gift Aid` should be treated as experiments, not assumptions:
  - `Recurring` is a good candidate when provider recurring evidence is present,
  - `Gift Aid` must respect the workspace feature toggle and should not be assumed to exist everywhere
- the immediate goal is learning:
  - whether native tabs reduce scrolling and crowding,
  - whether `Review` works better as a signpost and action surface,
  - and whether some concerns are better served by native widgets than by custom UI
- A product-level principle emerged from this experiment:
  - prefer Twenty-native widgets and smaller record-page sections where they give organisations meaningful control over their own review surface,
  - even if that means giving up some app-level custom control compared with one large bespoke review component
- Why this matters:
  - organisations may care about different review signals,
  - they may want to reorder sections, hide low-value widgets, or keep only the parts that support their operating model,
  - and native Twenty widgets/tabs make that possible in a way a single custom review component does not
- Current implication for `giftStaging`:
  - treat native `FIELDS` / `FIELD` widgets and smaller focused front-components as the first delivery path,
  - use custom UI where the workflow is genuinely product-specific, such as review-state derivation or donor-match behavior,
  - and avoid collapsing the whole review surface back into one opaque custom widget unless native composition proves insufficient
- Further refinement from runtime testing:
  - the first tab on the record page behaves more like a `Home` / landing surface than a neutral full-width working tab,
  - so it should stay lean and signposting-led rather than carrying the densest review/edit surface by default
  - in practice this means:
    - concise review state,
    - donor-match summary / entry point,
    - key actions,
    - light batch/context cues,
    - and signposts to richer sections
- `GRID` is still useful, but its value is context-sensitive:
  - in the drawer, stacked narrow widgets can feel like components-inside-components and use space poorly,
  - in the full record page, extra width makes `GRID` more valuable for side-by-side blocks
  - this makes `GRID` a better fit for wider secondary tabs or full-record contexts than for a dense drawer-first landing tab
- Product direction sharpened by this:
  - think in terms of configurable review building blocks rather than a single universal review surface
  - examples include:
    - `Review state`
    - `Donor match`
    - `Core gift fields`
    - `Processing`
    - `Gift Aid`
    - `Recurring donation`
    - `Provider evidence`
    - `Failure / diagnostics`
  - the main design question becomes the default assembly of those blocks, not a one-size-fits-all layout for every organisation

### Slice 4: Batch review and bounded processing

Build:

- `giftBatch`
- batch review entry and context surface
- native `Process batch` command
- bounded hybrid executor:
  - chunked batch create
  - split-on-failure
  - row fallback
  - chunked writeback

Carry over from spike:

- executor policy
- diagnostics
- operator-facing batch workflow

Guardrail:

- preserve the real executor decisions rather than collapsing back to a simple row loop
- do not assume the `giftBatch` record page must become the primary review workspace for larger batches
- treat `giftStaging` as the primary work unit and the filtered native `giftStaging` list as the default batch-review path
- use the batch surface to provide entry, scope, summary, and processing controls
- only build a richer custom batch workspace if native list/record flow proves operationally insufficient in practice

Implementation note:

- the current batch UX problem is structural, not merely visual; a stacked card or drawer-heavy batch page is unlikely to scale well as the main review surface
- Twenty already gives us a credible baseline through native list and record pages filtered by `giftBatch`
- the near-term goal should be to make batch-scoped entry into staged-gift review coherent before investing in a bespoke in-batch workspace

Validated baseline:

- the current app now proves a workable first operator loop:
  - `giftBatch` record as control surface,
  - native filtered `giftStaging` list as the main work surface for larger batches,
  - native `giftStaging` record review as the detailed correction/process surface
- this baseline appears strong enough to continue with, without inventing a custom batch workspace or custom back-navigation model first
- further refinement should focus on clarity, copy, and explicit relationship actions such as opening the linked batch, rather than replacing the native list/record flow

### Slice 5: Gift Aid bounded capability

Build:

- Gift Aid variables/toggle
- `giftAidDeclaration`
- Gift Aid capture facts in manual/staging flows
- gift-level outcome derivation
- operational visibility, especially `needs_review`

Carry over from spike:

- bounded Gift Aid layer
- declaration boundary
- create/process evaluation point

Guardrail:

- do not reduce this to “extra fields and a checkbox”

Current bounded-slice decisions:

- `giftAidRequested` is the preferred capture field name:
  - why:
    - it matches the current product language in [PRODUCT_REVIEW.md](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/PRODUCT_REVIEW.md),
    - and it is a clearer captured fact than a broader `intent` field.
  - deferred / revisit:
    - review whether any additional capture facts are genuinely durable product facts before expanding the model.
- capture facts belong on intake/staging, but authoritative outcome belongs on final gifts:
  - why:
    - staging/manual entry may capture request and declaration facts,
    - but Gift Aid claimability is a derived operational conclusion that should land on the committed `gift`.
  - deferred / revisit:
    - review re-evaluation triggers and whether any staging-side convenience fields have drifted too far toward derived state.
- keep `giftAidDeclaration` as donor-level history:
  - why:
    - declaration history and gift-level outcome are different concepts and should not collapse into one record shape.
  - deferred / revisit:
    - first-pass declaration-management UI can stay minimal until the broader claim workflow is in place.
- current capability gating is behavior/visibility-first, not full conditional provisioning:
  - why:
    - this preserves a real workspace capability boundary now without blocking the build on Twenty-specific provisioning mechanics.
  - deferred / revisit:
    - revisit once the app package and capability-activation model are stable enough to decide whether full conditional provisioning is worth the added complexity.
- current app-dev default keeps Gift Aid enabled even though the longer-term capability model is “optional and off by default”:
  - why:
    - it lets the bounded Gift Aid slice be exercised in the pilot/dev app before a fuller activation workflow exists.
  - deferred / revisit:
    - flip the default back to disabled once the activation/admin path is in place and the pilot no longer depends on always-on dev defaults.
- current policy/declaration layer uses bounded app-local TypeScript modules and per-invocation caching:
  - why:
    - this keeps Gift Aid logic out of front components and avoids the first-pass batch implementation re-querying the same declaration context more than necessary within a run.
  - deferred / revisit:
    - review whether broader cross-run caching or a dedicated service boundary is needed only after real Gift Aid throughput justifies it.

### Slice 6: Gift Aid claim and submission workflow

Build if Slice 5 remains clean:

- `giftAidClaimBatch`
- `giftAidClaimSubmission`
- draft/current-claim workspace
- internal submit/finalize flow
- submission snapshot/writeback model
- outbound adapter boundary inside the app

Guardrail:

- treat this as production workflow design, not just a demo button
- full HMRC protocol parity can still be sequenced after the submission-shaped lifecycle is solid

Current bounded-slice decision:

- current draft claim workspace lands before full submission lifecycle:
  - why:
    - the product review treats automatic draft assembly and current-draft / needs-review review as the first operational Gift Aid workspace,
    - and that gives us the parent-level context without prematurely coupling the app to submission-history or freeze details.
  - deferred / revisit:
    - full submit/finalize flow,
    - durable submission history,
    - snapshot/freeze enforcement,
    - and next-draft-after-submit behavior.

- first submit/finalize pass is internal finalization, not HMRC-oriented submission:
  - why:
    - this matches the product review’s current leaning that the first migrated app should treat the claim batch as internally finalized / ready for later export or automation, not transmitted to HMRC.
  - deferred / revisit:
    - external adapter boundaries,
    - transmission status history,
    - richer submission audit records.

- claim-batch lifecycle and claim-submission history stay separate:
  - why:
    - `giftAidClaimBatch.status` should remain a clean internal workflow state (`DRAFT` / `FINALIZED`),
    - while actual submission attempts belong to `giftAidClaimSubmission` history,
    - and a lightweight latest-submission summary can be synchronized onto the batch for list visibility without collapsing the two concepts back together.
  - deferred / revisit:
    - whether batch-level latest-submission state remains a stored summary or becomes a more generalized rollup/backfill pattern,
    - richer list/filter design around submission progress,
    - and any wider export/HMRC response lifecycle surfacing.

- first submit/finalize pass keeps historical-stability concerns documented, but not fully enforced:
  - why:
    - the pilot needs the draft-to-submitted transition and next-draft behavior now,
    - but robust snapshotting and platform-level freeze rules are a separate architectural concern that should not be hidden inside a rushed first implementation.
  - deferred / revisit:
    - submit-time snapshots,
    - frozen Gift Aid field enforcement on already-claimed gifts,
    - post-submit correction workflow.

### Slice 7: Recurring donation workflow

Build after the core donation/Gift Aid path is stable enough to support it cleanly.

Why later:

- recurring is pilot-important,
- but the donation/staging/Gift Aid path provides the stronger architectural base,
- and recurring should be built on top of the released Twenty app patterns rather than before those foundations are settled.

## 8. What To Carry Over From Existing Work

From `fundraising-service`:

- product boundary decisions
- lifecycle/state model where it reflects real user value
- Gift Aid policy and declaration boundaries
- batch executor policy
- recurring/product semantics where later slices need them

From the spike:

- Twenty-native workflow patterns
- host affordance usage
- command surfaces
- variable usage
- metadata shape that proved viable in the app-dev workspace
- bounded TypeScript modules where Twenty does not provide a product-domain layer
- integration testing approach for the app

Do not carry over unchanged:

- one-shot metadata accidents
- service-specific runtime assumptions unless still justified
- spike-only shortcuts or workaround patterns

## 9. Testing Expectations

This app should start with production-quality testing discipline.

Use:

- Twenty-style integration tests as the primary truth:
  - real app server
  - `global-setup.ts`
  - route/workflow assertions
- targeted unit tests for pure domain logic
- manual UI validation where front-component hosting behavior is still best checked interactively

Minimum expectation for each slice:

- metadata/schema coverage where relevant
- route/function behavior coverage
- core happy-path workflow test
- at least one important non-happy-path test where the slice has meaningful decision logic

## 10. Out Of Scope For The First Production Pass

Out of scope does not mean unimportant. It means not part of the first delivery tranche.

- full parity with every current fundraising-service surface
- low-value historical UI quirks
- broad long-tail admin/reporting polish before the core workflows are solid
- full HMRC protocol parity before the claim/submission lifecycle is clean
- canary-only SDK/tooling assumptions

## 11. First Build Sequence

Build in this order:

1. scaffold the real app on the released Twenty `v2` toolchain
2. establish metadata/testing/config foundations
3. manual gift entry
4. staging review
5. batch review and bounded processing
6. Gift Aid bounded capability
7. claim/submission workflow if still clean in the released toolchain
8. recurring workflow next

This is the recommended implementation order unless new pilot constraints clearly force a different sequence.

## 12. Working Rule For Future Sessions

When building this app:

- assume production-quality implementation is the target,
- build in slices but keep the full product model in view,
- check Twenty-native surfaces before inventing custom equivalents,
- use Twenty for the platform layer and bounded app-local TypeScript for fundraising-specific policy/orchestration/state interpretation,
- and use the spike/reference docs to avoid rediscovering already-proven patterns.

Reference set:

- [OVERVIEW.md](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/OVERVIEW.md)
- [PRODUCT_REVIEW.md](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/PRODUCT_REVIEW.md)
- [CODE_REVIEW.md](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/CODE_REVIEW.md)
- [TWENTY_APP_DEV_WORKFLOW.md](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/TWENTY_APP_DEV_WORKFLOW.md)
- [TWENTY_NATIVE_REFERENCE.md](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/TWENTY_NATIVE_REFERENCE.md)
- [twenty-app-batch-processing-design.md](/home/jamesbryant/workspace/dev-stack/docs/spikes/twenty-app-batch-processing-design.md)
