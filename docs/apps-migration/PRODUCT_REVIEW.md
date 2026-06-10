# Fundraising To Twenty Apps Product Review

Updated: 2026-04-07
Status: Working guide (`stage-2`)
Purpose: Review the current fundraising-service product surface so we can decide what should be preserved, simplified, redesigned, or dropped before migration.

This doc is for product review during the migration into Twenty apps. It is not a historical inventory of everything currently built.

## 1. Review Method

Use the following classifications:

- `Preserve`
- `Simplify`
- `Redesign`
- `Open`

Current working assumption:

- it is unlikely that major fundraising capabilities will be dropped entirely,
- but some current workflows, fields, and behaviors will likely be simplified or redesigned,
- especially where the current product surface reflects speed-first delivery, duplicated logic, or local implementation accidents.

Review each area by asking:

- what user value does this workflow actually provide,
- what parts of the workflow are strategic versus accidental,
- what should survive the migration,
- what should be simplified or reshaped before we recreate it in Twenty apps.

## 1.1 Review Structure

Use a consistent three-part structure for each major workflow under review:

1. `Workflow summary`
   - a short statement of what the workflow is for and why it matters in the migration,
   - not a full feature description.
2. `Use cases`
   - concrete user-job statements,
   - these are the main product reference and can later support testing scenarios.
3. `Scenario reviews`
   - the detailed analysis layer,
   - use this for lifecycle scenarios, process questions, state-model questions, and overlapping workflow questions,
   - each scenario review should use the same shape:
     - `Scenario`
     - `Why it matters`
     - `Current behavior`
     - `Key metadata / UI / logic`
     - `Open questions`
     - `Migration read`

Do not introduce new section types lightly. The default expectation is that new review work should fit into this structure.

## 1.2 Why This Structure

This structure is intentional.

We agreed it because earlier review passes started to accumulate too many parallel formats:

- workflow lists,
- use-case lists,
- lifecycle prompts,
- detailed issue sections,
- cross-workflow notes,
- summary tables.

Those formats were individually useful, but together they made the document harder to read and harder to extend consistently.

The aim of this structure is to keep the document:

- understandable at product level,
- useful for migration planning,
- specific enough to anchor code review,
- and concrete enough to support future testing scenarios.

This structure should be treated as the working default for this migration review.

It is acceptable to challenge or refine it if a workflow clearly does not fit, or if a simpler and more durable alternative emerges.

But future sessions should not invent new document shapes casually. Any deviation should be deliberate and justified against the same goals: clarity, consistency, and reuse.

## 1.2.1 Current Priority

Until this document reaches a useful migration-ready baseline, the priority is to build out the document itself rather than dive too early into the hardest design decisions.

That means:

- first, capture enough workflow, scenario, metadata, UI, and logic detail to support migration planning,
- then, use that fuller reference to decide where simplification, redesign, or deeper product decisions are actually needed.

Future sessions should avoid getting stuck too early in narrow design debates if the surrounding migration reference is still incomplete.

Detailed design discussion is still expected, but it should usually follow the creation of a sufficiently complete migration picture rather than replace it.

## 1.3 One-Shot Build Context

Parts of the current fundraising product and metadata were created in a one-shot, speed-first way so we could ship and validate the broader direction quickly.

That includes:

- metadata provisioned through `services/fundraising-service/scripts/setup-schema.mjs`,
- workflow and UI decisions made to support immediate delivery,
- schema and field choices that have not yet been reviewed as long-term product commitments.

That was appropriate for the stage of the project, but it means this migration is also the first rigorous review of some of the product, schema, and workflow choices we made while moving quickly.

## 1.4 Design Input Caveat

Earlier feature and UI docs helped guide the design and implementation of the current fundraising-service product.

They should be treated as design inputs, not automatically validated product truth.

This migration review is the point where we assess:

- which of those decisions still represent the product we want,
- which should be tightened or simplified,
- which were useful scaffolding but should not be carried forward as part of the longer-term Twenty-app implementation.

## 1.5 Migration Default

For this migration review, `fundraising-service` should be treated as the main source of truth for:

- current product contracts,
- current workflow behavior,
- and the parts worth preserving, refining, or simplifying.

It should **not** be treated as the default implementation target for migration spikes.

The default migration question is:

- how do we re-express this product need inside Twenty apps as cleanly as possible?

not:

- how do we call back into the existing service from a Twenty app?

Hybrid/service boundaries may still be the right answer for some areas, but they should be treated as explicit architectural conclusions reached after review, not as the silent default just because the current service already does the job.

## 2. Current Workflows

- Gift processing / staging.
- Gift intake / manual gift entry.
- Recurring.
- Reconciliation.
- Appeals.
- Gift Aid.
- Supporting donor/person actions and other relevant surfaces.

This document should not automatically promote every UI surface to a major workflow.

Supporting donor/person actions should be reviewed at the level needed for migration. For example, Households has product/schema/API/UI behavior to review, but currently sits closer to a donor/person-level action-to-drawer flow than a standalone fundraising operations queue.

### 2.0 Donation Intake Channel Map

Donation intake is an umbrella product concern, not a single screen.

During migration, keep these intake channels visible and make an explicit target-path decision for each one:

- Manual gift entry: current local form posts to the generic gift creation API and currently asks for high-trust auto-processing.
- Twenty CSV import: target direction is to use Twenty's import tooling and route imported gifts into the agreed staging / committed-gift lifecycle rather than rebuilding a separate CSV importer in the fundraising app.
- Provider integrations / webhooks: current Stripe webhook is partly implemented as a fundraising-service-owned connector; current GoCardless webhook is only a logging skeleton.
- Generic API / connector-normalized intake: current gift creation and staging APIs accept source/provider evidence; the future contract should not depend accidentally on one Stripe mapping.
- Hosted/future donation forms: not reviewed here as a current UI, but should follow the same donor identity, source evidence, Gift Aid, recurring, appeal/fund coding, staging/trust, and idempotency decisions.

The detailed reviews below are still split by workflow / scenario.

Use "Manual Gift Entry" for the staff-entered form surface, "Integration Intake And Staging" for provider/API intake, and "Gift Processing / Staging" for the controlled review/processing lifecycle that intake channels may feed.

### 2.1 Gift Processing / Staging Workflow Summary

Gift processing / staging is the controlled intake, review, and processing workflow for gifts before they become committed CRM records.

It is currently one of the most mature and most reviewed parts of the fundraising product.

Unlike some other areas, the main goal here is not to rediscover the workflow from scratch.

The migration goal is to preserve the core workflow while reviewing one-shot metadata, lifecycle state, and local UI/runtime details that may need simplification or redesign.

### 2.2 Gift Processing / Staging Use Cases

Use these user jobs as the basis for reviewing gift processing / staging during migration:

1. A user needs a controlled holding area for incoming gifts so unreviewed records do not become committed CRM records immediately.
2. A user needs to identify what is preventing a staged gift from being safely processed.
3. A user needs to confirm, change, or create the correct donor before processing a gift.
4. A user needs to detect potential duplicates or conflicts before committing a gift.
5. A user needs to review and correct core gift details such as amount, date, fund, appeal, or related coding before processing.
6. A user needs to decide whether a single gift is ready to process now, should remain in review, or needs further intervention.
7. A user needs to work through many staged gifts efficiently as a queue, not only as isolated records.
8. A user needs to switch from broad workspace review to focused batch-level work when processing a related set of gifts.
9. A user needs to trigger record-level or batch-level processing actions and understand the outcome clearly.
10. A user needs to investigate failed or blocked records, understand why they failed, and take the next corrective step without losing context.

These use cases should be treated as the primary product reference when reviewing both the current workflow and the code that supports it.

### 2.3 Gift Processing / Staging Scenario Reviews

Use scenario reviews for the detailed analysis layer of gift processing / staging.

Each scenario review should capture:

- `Why it matters`
- `Current behavior`
- `Key metadata / UI / logic`
- `Open questions`
- `Migration read`

Scenario reviews can cover lifecycle transitions, overlapping workflow processes, and state-model questions, but should all use the same overall shape.

The sections below are the current scenario-review set for gift processing / staging. Additional scenarios can be added as the review continues, but new section types should not be introduced casually.

Work through the gift processing / staging scenario reviews in this order unless there is a clear reason to deviate:

1. Manual intake and staging
2. Integration intake and staging
3. CSV / import batch intake
4. Editing staged donor or gift details
5. Queue / drawer active-work review
6. Working in batch scope
7. Marking a gift ready
8. Processing a single staged gift
9. Batch donor match
10. Batch processing
11. Failed or deferred processing
12. Already-processed gift
13. Staging state model simplification

Use this ordered list to avoid jumping around, leaving lifecycle gaps, or turning one hard design topic into a substitute for the broader migration review.

#### Scenario: Manual Intake And Staging

Scope note: this scenario reviews the handoff from Manual Gift Entry into the staging / processing lifecycle. The `Gift Intake / Manual Gift Entry` workflow later in this document reviews the staff-facing form itself.

Why it matters:

- Manual entry overlaps heavily with the staging lifecycle and sets the pattern for how high-trust intake relates to review-first processing.
- This decision affects whether intake routing feels coherent across the product or drifts into hidden, trust-flag-driven branching.

Current behavior:

- Manual Gift Entry currently submits through the gift creation path, not the explicit gift-staging creation path.
- The client builds a `GiftCreatePayload` and sets `autoProcess: true`.
- `GiftService.createGift` stages first when gift staging is enabled, then may continue to committed gift creation when trust and diagnostics allow.
- `GiftStagingController.createGiftStaging` is a separate forced-staged path and sets `autoProcess = false`.

Current target posture:

- Intake routing should be channel-based rather than hidden "bypass staging" behavior.
- Manual entry should create a committed gift directly by default.
- A batch-context manual-entry exception remains open for review, but if it exists later it should be explicit and not weaken the standard direct-create mental model.
- CSV / bulk import should create staged gifts by default.
- Integration intake should create staged gifts by default.
- Manual-entry-to-staging should not be part of the initial product shape unless later evidence shows a repeated concrete need.

Key metadata / UI / logic:

- Metadata: `giftStaging.autoProcess` records whether the staged record was intended to process automatically.
- Metadata: `giftStaging.intakeSource` supports trust/source-specific behavior such as `manual_ui` versus lower-trust intake sources.
- Metadata: `giftStaging.processingStatus` records whether the staged record remains pending or moves toward processing.
- Metadata: channel/source fields should distinguish manual UI, CSV import, integration/webhook intake, generic API / connector intake, and future hosted forms.
- UI: `useManualGiftEntryController` submits through `createGift` and sets `autoProcess: true`.
- API: `client/src/api/gifts.ts` posts Manual Gift Entry payloads to `/api/fundraising/gifts`.
- Logic: `GiftService.createGift` stages first when staging is enabled, then may create the committed gift.
- Logic: `GiftService.applyAutoProcessDecision` and `GiftService.resolveTrustLevel` decide whether auto-processing is allowed.
- Logic: `GiftStagingController.createGiftStaging` is a separate explicit staging path and forces `autoProcess = false`.

Open questions:

- Should manual entry ever stage in the initial product model, or should it remain a direct-commit path only?
- If manual-entry-to-staging ever exists later, what concrete operational cases justify it strongly enough to earn a place in the product?
- Should intake routing be expressed entirely at intake-type level, or is there any early case for narrow per-integration exceptions?
- What user-facing success/outcome state should distinguish committed gifts from staged-only acknowledgements in the channels that do stage?

Migration read:

- Product posture: `Redesign` with current leaning `Manual entry -> direct commit by default`.
- The Twenty-app implementation should replace hidden trust/auto-process branching with an explicit channel-based intake-routing model.
- Do not preserve the current endpoint distinction or `autoProcess` behavior by accident if the desired product model is channel-owned defaults.
- This decision should align manual entry, CSV import, and integration intake under one coherent routing story.

#### Scenario: Integration Intake And Staging

Why it matters:

- Integration intake needs to feed the same staging/review lifecycle without each provider inventing its own workflow.
- This area also intersects directly with Twenty apps integration patterns, idempotency, and recurring-agreement updates.

Current behavior:

- Integration intake is broader than the current Stripe/GoCardless implementation. It should cover provider webhooks, connector-normalized events, and future provider-specific intake that creates or updates staged gifts.
- The current build proves only part of that surface.
- Stripe has a service-owned webhook endpoint for `checkout.session.completed`.
- Stripe webhook intake builds a gift payload with source/provider evidence and forwards it into `GiftService.createGift`.
- Stripe webhook intake currently sets `intakeSource: stripe_webhook` and starts with `autoProcess: true`, then downgrades auto-process when no usable contact evidence exists.
- GoCardless has a webhook endpoint, but the current service is a skeleton handler that logs summarized event data and does not yet create or update staged gifts.
- The generic gift creation API accepts integration/source fields such as `intakeSource`, `sourceFingerprint`, `provider`, `providerPaymentId`, and `providerContext`.
- Webhook routes are currently authentication-exempt at the fundraising-service auth layer, so provider-specific validation is part of the intake contract.

Current target posture:

- Integration intake should stage by default.
- Any future direct-commit integration path should have to justify itself as a narrow, explicit channel/policy exception rather than inherit manual-entry behavior or the current generic `createGift` flow by accident.

Key metadata / UI / logic:

- Metadata: `giftStaging.intakeSource`.
- Metadata: `giftStaging.sourceFingerprint`.
- Metadata: `giftStaging.externalId`.
- Metadata: `giftStaging.provider`.
- Metadata: `giftStaging.providerPaymentId`.
- Metadata: `giftStaging.providerContext`.
- Metadata: `giftStaging.autoProcess`.
- Metadata: `giftStaging.processingDiagnostics`.
- Metadata: future webhook-event or intake-event metadata may be needed for idempotency, replay, and audit.
- API: `StripeWebhookController` handles `POST /webhooks/stripe`.
- API: `GoCardlessWebhookController` handles `POST /webhooks/gocardless`.
- UI: staging queue intake-source filters and source labels.
- UI: staging drawer audit/source evidence presentation.
- UI: recurring agreement surfaces for provider-linked gifts and installments.
- UI: reconciliation surfaces that use provider/source evidence.
- UI: future integration health or webhook-event review surface is still an open target.
- Logic: `StripeWebhookService.handleIncomingEvent` validates Stripe webhook signatures and ignores unsupported event types.
- Logic: `StripeWebhookService.handleCheckoutSessionCompleted` maps a Stripe checkout session into a gift payload and calls `GiftService.createGift`.
- Logic: `StripeWebhookService.enrichWithRecurringAgreement` adds `provider`, `providerPaymentId`, `providerContext`, `recurringAgreementId`, `expectedAt`, and updates the linked recurring agreement when metadata is present.
- Logic: `GoCardlessWebhookService.handleWebhook` currently only logs a skeleton event summary.
- Logic: `GiftService.createGift`.
- Logic: `GiftService.applyAutoProcessDecision`.
- Logic: `GiftService.resolveTrustLevel` treats `manual_ui` as high trust, `csv_import` as low trust, and other sources such as `stripe_webhook` as medium trust.
- Logic: `GiftService.buildProcessingDiagnostics`.
- Logic: recurring-agreement update logic triggered by provider webhooks.
- Logic / platform: Twenty apps integration/connector patterns, because the target implementation may not mirror fundraising-service webhook controllers.
- Docs: `docs/INTEGRATIONS.md` still describes a planned Stripe webhook to n8n normalizer to fundraising-service `/gifts` path, while the current code has a service-owned Stripe webhook handler.
- Docs: `docs/features/recurring-donations.md` describes Stripe and GoCardless webhook behavior that is only partially implemented today.

Open questions:

- Should provider webhooks be service-owned endpoints, connector/n8n-normalized events, or both depending on provider and deployment?
- In Twenty apps, should integration intake live inside app/server actions, an external connector layer, fundraising-service-compatible endpoints, or a hybrid?
- Which provider events should create staged gifts versus only update existing recurring agreements, installments, or audit state?
- Should any integration source be allowed to direct-commit in the first product model, or should all integrations stage by default?
- What is the intended GoCardless lifecycle: create a staged gift on payment-created, process on payment-confirmed, and fail/cancel on provider failure events, or a simpler first version?
- Which parts of the current Stripe implementation are reusable product behavior, and which are only a convenient first implementation?
- Should `autoProcess` be a per-record flag from integration payloads, or should integration automation be driven by channel policy and explicit org/admin settings?
- What idempotency key should be authoritative: provider event ID, provider payment ID, source fingerprint, or a separate intake-event record?
- Do we need a first-class webhook/intake event log before migration, or can source evidence remain on `giftStaging` for the first apps version?

Migration read:

- Product posture: `Preserve + simplify` with current leaning `stage by default`.
- The Twenty-app migration should not blindly preserve the current split where Stripe is partly implemented and GoCardless is a logging skeleton.
- Integration intake needs a clear target contract before migration: source evidence, trust level, idempotency, auto-processing policy, and recurring-agreement behavior.
- Review how Twenty apps expect integrations/connectors to be implemented before choosing whether direct fundraising-service webhook controllers remain the target shape.
- Keep the integration intake path aligned with CSV/import and manual intake decisions so the staging lifecycle does not fork by source accidentally.
- Resolve the documentation/code mismatch around n8n versus service-owned Stripe intake before treating the integration architecture as settled.
- Preserve a common staged-gift intake boundary as the default integration model.
- Do not treat the current Stripe auto-process path as product truth; it is useful implementation evidence, not a settled target model.
- Leave room for narrow, explicit routing/bypass exceptions later where confidence and operational needs clearly justify direct commit for a specific integration path.
- Keep any such bypass behavior as an explicit channel/policy decision, not an accidental inheritance from generic gift-create logic.
- Keep the service/runtime-layer question in view here as a migration consideration, not a conclusion: integration intake may be one of the places where provider-specific behavior, recurring-enrichment logic, or client-specific operational preferences still justify an adapter/service boundary.

#### Scenario: CSV / Import Batch Intake

Why it matters:

- CSV import is a bulk intake channel; importing many gifts can create many donor/gift/staging decisions at once.
- The user still needs a clear path after import: either the gifts are committed, or they appear in gift processing / staging for review.
- This should not become a parallel fundraising-specific CSV importer if Twenty's import tooling covers the file-upload/mapping job.

Current behavior:

- This product-review pass is not treating CSV import as a custom fundraising-service UI to migrate.
- Current target direction is to use Twenty's CSV import functionality rather than rebuilding a separate CSV importer inside the fundraising app.
- The migration still needs a product path for imported gift-like rows: how they map to gift staging or committed gift records, and what the user reviews after the import completes.
- Current local code review of Twenty (v2.2-line) suggests the standard object-level `Import records` path is still a generic front-end spreadsheet import that maps rows to object fields and then batch creates/upserts records.
- On current evidence, that means native `Import records` should be treated as a lower-control intake path than app-managed integrations: it does not appear to route rows through our fundraising-specific intake logic by default.
- The same local review suggests Twenty's richer spreadsheet-import hooks exist inside Twenty front-end code, but are not clearly exposed through the supported Twenty app SDK surface we use at runtime. This should be treated as current verified understanding, not a permanent platform guarantee.

Current target posture:

- CSV / bulk import should stage by default.
- The first product model should not treat CSV import as a direct-commit channel.
- Supported gift CSV imports should create or attach to a `giftBatch` by default so users land in focused batch review rather than the broader staging queue.

Key metadata / UI / logic:

- Metadata: likely target object for imported rows: `giftStaging` or committed `gift`.
- Metadata: intake/source value such as `csv_import`.
- Metadata: optional gift-batch relation if import should produce a focused batch-review scope.
- UI: Twenty CSV import tool.
- UI: gift-processing workspace as possible post-import review surface.
- Logic: target import mapping / post-import lifecycle is still open for migration.

Open questions:

- Should imported gift rows ever direct-commit in the first product model, or should CSV import remain a staged-review channel only?
- Should each gift CSV import create or select a `giftBatch` so users can open focused batch scope afterwards?
- What minimal gift / staging fields must be present in the first supported import template?
- How should donor identity / dedupe review happen after Twenty import?
- If we later need CSV import to behave more like integration intake, do we need:
  - upstream Twenty support for app-level spreadsheet-import customization,
  - or a bespoke fundraising import wrapper built outside the stock `Import records` flow?

Migration read:

- Product posture: `Preserve + simplify` with current leaning `stage by default`.
- Use Twenty's CSV import capability; do not rebuild a separate fundraising CSV importer by default.
- Keep CSV/import aligned with the same intake/staging/committed-gift lifecycle decisions as manual and integration intake.
- Preserve a clear post-import next step, especially when imported rows need donor/dedupe/detail review before processing.
- Preserve staging as the post-import boundary and batch-first review as the default operating model for imported gifts.
- Be firmer here than the current generic runtime logic: CSV should not inherit auto-process behavior by accident.
- Make post-import batch scope explicit by default so donor-match, batch processing, and blocker-first review happen inside a focused review container rather than the broader staging queue.
- Near-term working assumption: native `Import records` may not reliably auto-create/attach a `giftBatch` or run fundraising-specific post-import logic for us. If that capability becomes important, it should be treated as a focused future spike rather than assumed available.

#### Scenario: Editing Staged Donor Or Gift Details

Why it matters:

- Users need to correct obvious errors before a staged gift is processed into a committed CRM record.
- The primary risk is incorrect donor linkage or accidentally creating a donor who already exists.
- Other field edits matter, but they are secondary to preventing duplicate donors and unsafe gift creation.

Current behavior:

- The staging drawer allows users to edit donor-related details and core gift details before processing.
- Current implementation now treats surfaced staging fields as the authoritative editable truth for processing.
- Donor correction and gift-detail correction currently sit in the same overall review workflow, but are exposed in separate drawer sections.
- The review workflow distinguishes incoming donor evidence from confirmed CRM donor linkage.
- Users can review likely matches, search donors, assign or change the linked donor, or leave the donor unresolved for further review.

Key metadata / UI / logic:

- Metadata:
  - donor evidence is stored on staged gifts through `donorFirstName`, `donorLastName`, `donorEmail`, `donorAddress`, and `organizationName`
  - confirmed CRM linkage is stored separately through `donor` / `donorId` and `company` / `companyId`
  - staged gift details include `amount`, `feeAmount`, `giftDate`, `fund`, `appeal`, `opportunity`, `recurringAgreement`, `giftIntent`, in-kind fields, Gift Aid capture fields, and `notes`
- UI:
  - `DrawerReviewSection` handles donor evidence, likely matches, donor search, and donor assignment
  - `DrawerDetailsSection` handles core gift-detail editing and uses `GiftDetailsForm`
  - lower-frequency gift fields currently sit behind a `More fields` disclosure
  - the drawer keeps primary review separate from lower-level audit/raw-payload evidence
- Logic:
  - `GiftStagingService.updateGiftStagingPayload` updates staged fields directly and no longer rewrites `rawPayload`
  - `GiftStagingProcessingService.processGift` now rebuilds the processing payload from staged fields rather than reparsing editable `rawPayload`
  - `rawPayload` remains available as audit/reference evidence rather than the editable processing source of truth
  - `buildTwentyGiftPayload` strips staging-only fields before committed gift creation
  - `GiftService.resolveDonorFromStagingPayload` now respects staged-review intent:
    - if `donorId` is already linked, processing uses that donor
    - if no donor is linked, processing creates a new donor rather than silently re-matching to an existing one

Open questions:

- Should donor correction and gift-detail correction keep the same overall review flow but use simpler underlying update rules?
- Which edits should be treated as truly review-critical versus secondary coding/categorisation changes?
- Should donor creation remain a processing-boundary fallback for unresolved rows, or should the review UI become the clearer primary place where the user decides "link existing donor" versus "create new donor" before processing?

Migration read:

- Product posture: `Simplify`.
- Preserve the correction step before commit, especially around donor identity and duplicate prevention.
- The earlier raw-payload merge complexity has already been simplified toward the target model:
  - staged fields are the editable truth,
  - processing rebuilds from staged fields,
  - raw payload remains secondary audit/reference evidence.
- Keep donor correction prominent and explicit; processing should respect review-time donor linkage decisions rather than silently rematching to an existing donor.
- Treat fund/appeal/opportunity and similar coding edits as important but secondary during high-volume review.
- Keep staging review and manual entry distinct in purpose, but prefer shared relational-entry patterns/components where the user need overlaps unless a workflow-specific reason justifies divergence.

#### Scenario: Queue / Drawer Active-Work Review

Why it matters:

- Gift processing is a workspace for moving through active staged gifts, not just a record detail form.
- Users need to scan, prioritize, filter, select, review in context, act, and then continue through the active queue.
- This scenario is one of the main product inputs for reusable record-list / review-drawer patterns.
- The queue and drawer need a strong division of labor:
  - the queue is primarily a triage / work-selection surface,
  - the drawer is the main diagnosis / resolution surface.

Current behavior:

- The gift-processing workspace presents active staged gifts in a queue and opens a review drawer for the selected row.
- The active queue defaults away from processed rows.
- Users can search, filter by intake/source or attention-oriented state, sort, paginate, switch between workspace and batch scope, open rows in the drawer, and trigger row actions.
- Queue rows combine donor state, amount/date, eligibility, next-step/review summary, context, and available actions.
- The drawer has review/detail/audit sections and keeps raw payload / diagnostics secondary to primary review.
- The current implementation is already more blocker/review-driven than older solution docs implied:
  - row meaning is heavily derived from diagnostics, donor linkage, and current record facts,
  - raw payload is already secondary audit/reference context rather than the main review surface.
- The remaining noise appears to come mainly from mixed state models and weak signal hierarchy rather than from raw payload complexity alone.
- Caveat: the current client exposes `giftDate` sort options, while the backend DTO review previously showed only `createdAt`, `updatedAt`, and `amount.amountMicros` as allowed sort fields; verify before migrating sort behavior.

Key metadata / UI / logic:

- Metadata: `giftStaging.processingStatus`, `dedupeStatus`, `validationStatus`, and diagnostics/evidence fields currently combine runtime truth with review interpretation.
- Metadata: intake/source fields.
- Metadata: batch, donor, gift, appeal/fund/opportunity/recurring relations used for context.
- UI: `StagingQueue`, `StagingQueueSummary`, `StagingQueueTable`, `GiftStagingDrawer`.
- UI: `stagingQueueUtils.ts` converts statuses/diagnostics/linkage into row-level review summaries, donor-state labels, and alert flags.
- UI: the queue summary currently privileges top-level buckets like `Needs attention`, `Ready`, and `Failed`, while the table rows already carry richer derived review meaning.
- UI: the drawer already keeps primary review ahead of audit/raw payload, with donor review first and detail/audit secondary.
- Logic: `GiftStagingListQueryDto` query options.
- Logic: `GiftStagingService.listGiftStaging`.
- Logic: `useStagingQueueController` active-work model.
- Logic: current noise is partly structural:
  - stored workflow states still shape the top-level queue more strongly than the derived row-level review model,
  - secondary/contextual signals can still compete too directly with primary blockers in the table.

Open questions:

- What list/review/drawer behavior is shared with appeals, reconciliation, recurring, Gift Aid, and future Twenty-native record views?
- What queue behavior is staging-specific and should not leak into a generic record-list primitive?
- Which active-work slices should be first-class in the migrated queue, with the current strongest candidates being:
  - needs donor review,
  - has blockers,
  - failed processing,
  - ready now as a derived operational slice rather than durable workflow truth?
- Should active-work inclusion be driven only by lifecycle state, or also by derived blocker / duplicate / missing-donor state?
- Which sorts/filters are actually supported and product-important for the migrated queue?
- Which queue-level signals should be configurable per workspace/module in line with the shared list-view direction, especially where signals like receipts or Gift Aid may be organisation-specific rather than universally default-visible?

Migration read:

- Product posture: `Preserve + simplify`.
- Preserve the active-work queue-to-drawer operating model.
- Preserve the queue primarily as a triage / work-selection surface and the drawer as the main diagnosis / resolution surface.
- Preserve the stronger parts of the current implementation:
  - blocker/review-driven row meaning,
  - raw payload and audit information kept secondary,
  - drawer-first resolution in context.
- Simplify the remaining mixed model:
  - reduce reliance on overlapping stored review states where possible,
  - avoid letting secondary/contextual signals compete with blockers at queue level,
  - avoid reintroducing `ready` as durable workflow truth through migration wording or design drift.
- Keep first-class active-work buckets few and distinct.
- Migrate this through the shared list/review/drawer direction where possible, but keep staging-specific status/action/processing behavior explicit.
- Keep queue-level visible data/signals configurable and consistent with the reusable list-view direction rather than assuming one hardcoded signal set is right for every organisation/workspace.
- Verify client/backend sort and filter parity before treating the current controls as migration requirements.

#### Scenario: Working In Batch Scope

Why it matters:

- Users need to switch from broad gift-processing workspace review to focused work on one related import/intake batch.
- Batch scope changes orientation, available actions, diagnostics, progress, and "what is left to do".
- This should remain visible product behavior, not disappear into an invisible filter.
- Batch scope is one of the clearest ways the product supports high-volume review without flattening everything into one generic staging queue.

Current behavior:

- `giftBatch` is a dedicated object and staged gifts can link to a batch.
- The staging workspace can operate in workspace scope or active batch scope.
- Batch scope filters the staging queue to the selected batch.
- Batch scope exposes batch-relevant diagnostics and actions such as donor match and processing.
- The UI gives the user a way back from batch scope to workspace scope.
- The current implementation makes batch scope more than a hidden filter:
  - the header switches between workspace scope and batch scope,
  - batch scope exposes explicit donor-match and process/resume actions,
  - batch scope shows aggregate blocker/warning diagnostics and active async run status,
  - the workspace can surface a "new batches" inbox to enter focused batch work.
- Batch behavior has also been shaped by operational/runtime constraints from earlier batch-processing work:
  - API limits and write pressure,
  - retry / resume behavior,
  - chunking / batching strategy,
  - correlation safety,
  - and avoiding unnecessary per-row status churn in bulk flows.
- The current summary / control UI owns a lot of this scope-switching behavior and should be reviewed before porting directly.

Key metadata / UI / logic:

- Metadata: `giftBatch`.
- Metadata: `giftStaging.giftBatchId` / gift-batch relation.
- Metadata: gift batch source/status/trust/expected/actual fields.
- UI: `StagingQueueSummary` workspace / batch scope.
- UI: batch inbox / batch cards where present.
- UI: batch diagnostics summary and run-status summaries currently sit in the same high-level summary area as workspace metrics and filters.
- Logic: `useStagingQueueController` active batch state.
- Logic: `GiftStagingService.listGiftStaging` batch filter.
- Logic: `GiftBatchService` list/create/get/update behavior.
- Logic:
  - `GiftBatchDonorMatchService` owns async donor-match runs per batch and writes identity-resolution outcomes back to staging rows
  - `GiftBatchProcessingService` owns async process/resume runs per batch, batch preflight/readiness summaries, and batch status updates
  - the client polls active donor-match/process runs in batch scope and refreshes the queue when runs complete
- Logic: current batch scope is already helping reduce row-level noise by surfacing some operational meaning in aggregate batch diagnostics rather than only as per-row clutter.
- Logic: current batch processing/donor-match behavior already reflects a lower-write, retry-aware, bulk-safe runtime shape rather than a naive per-row action model.

Open questions:

- What should the migrated entry point be for batch work: batch record page, gift-processing workspace batch picker, imported-file completion screen, or all of these?
- Which batch diagnostics belong in the header/summary versus the list rows versus a batch review drawer/page?
- How should users navigate back to the imported/created batch after leaving the workspace?
- Which batch fields are real operational state versus one-shot summary metadata?
- How much of the current batch summary/header should become reusable workspace structure versus staging-specific batch controls?

Migration read:

- Product posture: `Preserve + simplify`.
- Preserve batch scope as a clear working mode within gift processing.
- Preserve the strongest current product behaviors:
  - batch scope is an explicit mode, not just a hidden filter,
  - users can clearly enter and leave focused batch work,
  - donor match and process/resume actions are available in the batch context they operate on,
  - aggregate batch diagnostics help users understand the shape of the work before opening rows one by one.
- Keep batch scope aligned with the wider migration direction:
  - CSV/import review should naturally land users in batch-first work where possible,
  - queue-level triage remains useful, but batch scope should remain the focused operational container for related staged gifts.
- Keep runtime constraints explicit during migration:
  - preserve or consciously revalidate the current bulk-processing safeguards around API efficiency, retry/resume, chunking, correlation safety, and low write-churn,
  - do not redesign batch behavior only around cleaner workspace/UI ideas if that would weaken the proven high-volume processing shape.
- Simplify the current implementation shape:
  - do not migrate one oversized summary/header component as the target architecture,
  - separate reusable workspace/list-shell concerns from staging-specific batch controls and run summaries,
  - review which batch metadata truly drives operator decisions versus acting as one-shot summary detail.
- Rebuild the scope/orientation deliberately; do not migrate a large all-purpose summary/header component as the target architecture.

#### Scenario: Marking A Gift Ready

Why it matters:

- "Ready" is useful operational language for admins working through a staging queue.
- The product still needs to make it clear when a record appears processable now versus when it still needs attention.
- This matters because the migrated workflow should preserve review confidence without forcing a second stored truth underneath actual processability.

Current behavior:

- Users can mark a staged gift ready from the drawer once they are satisfied with the review.
- Current implementation writes `processingStatus = ready_for_process`.
- Current implementation also writes `validationStatus = passed`.
- Later processing checks primarily whether the staged gift is in a processable status rather than running through a richer separate validation-state model.

Current target posture:

- "Ready" should remain available as a useful queue/review concept if it helps operators.
- In the lean target model, processability should be derived from current lifecycle state plus current record facts and diagnostics rather than stored as a separate backend truth.
- If the UI continues to expose "ready now", it should ideally be a derived slice/label rather than a persisted workflow gate unless a later concrete workflow proves a stored approval state is necessary.
- The useful value of `Mark ready` appears to be operator-facing:
  - a row no longer needs active review,
  - it belongs in the processable set,
  - and the queue can treat it differently.
- That value does not currently justify preserving a separate stored approval truth by default.

Key metadata / UI / logic:

- Metadata:
  - `giftStaging.processingStatus`
  - `giftStaging.validationStatus`
- UI:
  - `useGiftStagingDrawerController.handleMarkReady` marks the record ready from the drawer action area
  - queue and drawer status summaries surface `ready_for_process` as a distinct state
- Logic:
  - `updateGiftStagingStatus` is used to write the ready state
  - `GiftStagingProcessingService.canProcess` currently treats `ready_for_process` and `process_failed` as the main processable states

Open questions:

- Does the migrated workflow need an explicit stored mark-ready action at all, or only a clear derived "ready now" slice in the UI?
- Is there any later concrete human-signoff / handoff / freeze workflow that would genuinely justify reintroducing a stored approval gate distinct from derived processability?

Migration read:

- Product posture: `Redesign`.
- Preserve the useful operator-facing distinction between "ready now" and "needs attention".
- Do not preserve `ready_for_process` as durable backend workflow truth by default in the target model.
- Treat `validationStatus` as especially weak and outside the lean target model unless a later concrete workflow proves it is needed.
- Replace the current dual-state write (`ready_for_process` plus `validationStatus = passed`) with derived processability unless a later explicit approval workflow genuinely requires stored review state.
- Do not preserve a stored reviewer gate by default unless a later concrete workflow proves it is necessary.

#### Scenario: Processing A Single Staged Gift

Why it matters:

- Single-record processing is the direct path from reviewed staging work into a committed CRM gift.
- It is where the product needs to be clear about what happens on success, what happens on deferral or failure, and what gets written back to the staging record.
- This step also exposes how much logic currently sits at the processing boundary rather than during earlier review.

Current behavior:

- Users can trigger `Process now` from the staging drawer.
- The backend first checks whether the staged record is processable; if not, processing is deferred.
- When processing proceeds, the service builds the payload from the current staged fields, creates the committed gift in Twenty, and then writes the outcome back to the staging record.
- If a donor is already linked on staging, processing uses that donor.
- If no donor is linked, processing creates a new donor.
- Processing no longer silently rematches an unresolved staged row to an existing donor at processing time.
- If processing fails, the staging record stays in the queue with failure detail for later retry/review.

Current target posture:

- This scenario is largely settled and should be treated as a documentation-alignment point rather than a fresh design question.
- Processing should use the current staged fields as the source of truth for committed gift creation.
- Processing should not behave like a second review layer or broad hidden cleanup pass.
- If blockers still exist, processing should defer/fail clearly rather than improvising or silently fixing review-time ambiguity.

Key metadata / UI / logic:

- Metadata:
  - `giftStaging.processingStatus`
  - `giftStaging.errorDetail`
  - current staged donor/gift fields as the processing truth
  - `giftStaging.rawPayload` as audit/reference context rather than editable truth
  - relation from staged gift to committed `gift`
  - recurring-agreement and Gift Aid linkage fields that may be updated at processing time
- UI:
  - `GiftStagingDrawer` action footer exposes `Process now`
  - `useGiftStagingDrawerController.handleProcessNow` shows processed, deferred, or failed outcomes back to the user
  - queue and drawer status summaries surface processed/failed state and next actions such as retry
- Logic:
  - `GiftStagingProcessingService.processGift` is the main record-level processing boundary
  - `GiftStagingProcessingService.canProcess` gates processing based on processable status
  - processing now rebuilds its payload from staged fields rather than reparsing editable `rawPayload`
  - donor behavior is now explicit:
    - linked donor -> use that donor
    - no linked donor -> create a new donor
    - no silent late-stage rematch to an existing donor
  - processing may still apply bounded runtime enrichment such as receipt / Gift Aid handling, but it should not reinterpret ambiguous review-time decisions
  - `markProcessedById` writes the processing outcome back to staging after committed gift creation
  - processing can return `processed`, `deferred`, or `error`

Open questions:

- Which deferred or failed outcomes should be treated as user-facing review issues versus lower-level system errors?
- Does any remaining processing-boundary enrichment still belong here, or should more of it be made explicit earlier in review/intake over time?

Migration read:

- Product posture: `Preserve + align`.
- Preserve the explicit single-record processing action and clear outcome feedback.
- Preserve the settled processing contract:
  - staged fields are the source of truth,
  - linked donor means use that donor,
  - unresolved donor means create a new donor,
  - no silent rematch to an existing donor at processing time.
- Do not let processing become a second hidden review layer:
  - do not quietly match to an existing donor after review left the row unresolved,
  - do not fill in missing appeal/fund/opportunity meaning by guesswork,
  - do not reinterpret ambiguous data and push it through anyway,
  - do not clear blockers/warnings behind the scenes.
- Keep success, deferred, and failed outcomes understandable to users without exposing unnecessary implementation detail.

#### Scenario: Batch Donor Match

Why it matters:

- Batch donor match is one of the main tools for reducing duplicate donors and speeding up high-volume staging review.
- It lets users resolve many records at once instead of repeating the same donor review row by row.
- This step directly supports the primary product goal of preventing donor-identity errors before processing.

Current behavior:

- Donor match can be run for the active batch from the staging workspace.
- The backend creates an async donor-match run for that batch and processes candidate staging rows.
- Outcomes include auto-linked rows, rows requiring review, rows with no match, insufficient-identity rows, and errors.
- The current runtime has now been tightened so exact email matches do not auto-link when duplicate lookup returns multiple existing donor candidates; those rows stay review-required.
- Donor match no longer owns a separate donor-creation run; unmatched rows remain unresolved until later processing.

Current target posture:

- This scenario should be treated as genuinely open product design rather than a straight preserve/simplify pass.
- Batch donor match should survive as a first-class high-volume identity-resolution tool, but its exact product shape should be redesigned deliberately.
- The conservative first migrated boundary is:
  - auto-link only when first name + last name + email produce one clear existing donor match,
  - route anything weaker, or anything with multiple plausible candidates, to review,
  - leave insufficient identity or no suitable candidate unresolved.
- Batch auto-link should remain stricter than manual-entry matching by default.
- Batch donor match should deliberately review and align with useful existing manual-entry match patterns/language where that improves consistency, without inheriting manual-entry looseness for auto-link decisions.
- Duplicate existing donor records should block safe auto-link and route to review rather than being silently resolved.
- A major part of the product value is not only auto-linking clear cases, but accelerating review-required cases through a guided batch matching surface rather than forcing pure row-by-row donor review.
- Donor match should not create donors:
  - it should link an existing donor where safe,
  - otherwise leave the row unresolved,
  - with donor creation left to the separate processing contract.
- Batch donor match may surface useful duplicate-cleanup opportunities in the donor database, but donor merge / duplicate cleanup should remain adjacent capability rather than being silently collapsed into donor match.

Key metadata / UI / logic:

- Metadata:
  - `giftBatch` provides the operational scope for the donor-match run
  - staging rows persist donor-match outcomes through fields such as `donorId`, `dedupeStatus`, `processingDiagnostics`, and `errorDetail`
- UI:
  - `StagingQueueSummary` exposes `Run donor match` in batch scope
  - `useStagingQueueController` starts the batch donor-match run and polls run status
  - batch scope surfaces the number of rows still needing donor match
  - the migrated workflow should likely include a focused guided review surface for review-required matches at batch scope, even if the exact UI shape remains open
- Logic:
  - `GiftBatchDonorMatchService.startRun` creates an async donor-match run per batch
  - donor-match runs track status, progress, and row-level outcomes such as `auto_linked`, `partial_match_review`, `no_match`, and `insufficient_identity`
  - `GiftBatchDonorMatchService` persists identity-resolution outcomes back to staging rows
  - current implementation is useful evidence for redesign, not product truth on its own

Open questions:

- What exact outcome categories should the migrated product keep first-class: auto-linked, review required, unresolved, no suitable match, insufficient identity, error?
- How should the conservative auto-link boundary be expressed to users, and how closely should it align with manual-entry match language without inheriting manual-entry looseness?
- What is the best guided review surface for review-required matches at batch scope: queue-to-drawer, dedicated batch review drawer, or another focused review flow?
- How should likely duplicate existing donors be surfaced so they help future cleanup work without turning donor match into an implicit donor-merge workflow?

Migration read:

- Product posture: `Redesign`.
- Preserve batch donor match as a first-class high-volume review action.
- Use the current implementation as evidence, but do not treat its exact outcome model as settled product truth.
- Stage 1 runtime alignment is already worth carrying forward:
  - ambiguous duplicate-candidate sets no longer auto-link,
  - tighter auto-linking reduces bad-link risk before the broader redesign is done.
- Preserve the core product purpose:
  - resolve donor identity safely at volume,
  - reduce row-by-row review where confidence is genuinely high,
  - avoid silent bad links in batch.
- Keep the first migrated auto-link rule conservative by default:
  - exact first name + exact last name + exact email,
  - one clear existing donor candidate,
  - otherwise route to review or unresolved.
- Keep batch donor match stricter than manual-entry review suggestions unless later evidence justifies loosening it.
- Deliberately align useful match language/patterns with manual-entry matching where that improves consistency, while keeping batch auto-link more conservative.
- Preserve the product need for a guided batch review surface for ambiguous matches; batch donor match should speed up review-required cases as well as clear auto-link cases.
- Do not let donor match drift into hidden donor creation or donor finalization:
  - unmatched rows remain unresolved,
  - donor creation belongs to the later processing contract, not donor match itself.
- Treat donor merge / duplicate cleanup as relevant adjacent migration concern, but do not silently absorb it into batch donor match without explicit product design.

#### Scenario: Batch Processing

Why it matters:

- Batch processing is the high-volume counterpart to single-record processing.
- It determines how the product turns a reviewed batch into committed gifts while handling not-ready rows, partial failures, and outcome visibility.
- This is also one of the clearest places where current runtime mechanics may need redesign for migration.

Current behavior:

- Users can trigger processing for the active batch from batch scope in the staging workspace.
- The backend creates an async processing run for that batch and loads candidate staged rows.
- Current implementation supports both row-by-row processing and a hybrid batch executor, with row fallback where needed.
- The run can finish as `completed`, `completed_with_errors`, or `failed`, and batch status is updated accordingly.
- Rows that are not ready or cannot be processed cleanly can be deferred or fall back to row-level handling instead of blocking the whole batch.

Current target posture:

- Batch processing should remain an explicit batch action rather than a hidden background side effect.
- It should remain async/run-based in product terms.
- It should preserve partial progress:
  - safely process what can be processed,
  - defer what is not safely processable,
  - and avoid collapsing the whole batch because some rows are not ready.
- It should report outcomes clearly enough that operators can trust what happened.
- It should support retry/resume.
- The current executor shape under the hood is useful implementation evidence, but not itself the product contract.

Key metadata / UI / logic:

- Metadata:
  - `giftBatch.status`
  - `giftBatch` progress/summary fields
  - staging-row `processingStatus`, error detail, and committed-gift writeback
- UI:
  - `StagingQueueSummary` exposes batch processing actions in batch scope
  - `useStagingQueueController.processActiveBatch` starts the batch run and polls for status
  - the client surfaces interruption/resume messaging when a run disappears or completes with issues
- Logic:
  - `GiftBatchProcessingService.startRun` creates an async run and moves the batch into `processing`
  - `GiftBatchProcessingService` computes candidate rows, identity readiness, execution metrics, and run outcomes
  - current execution supports `row` and `hybrid` modes, including chunked batch creation and row fallback for parity gaps
  - batch completion can end in `processed`, `processed_with_issues`, or `process_failed`
  - runtime mechanics such as hybrid execution, row fallback, chunking, and correlation handling are important migration constraints, but should not be treated as product requirements by name unless they leak into visible operator behavior

Open questions:

- What level of progress and outcome detail do users actually need during a batch run?
- What run state must persist reliably in the migrated runtime?
- How visible should in-progress / deferred / completed-with-issues state be in the main batch workspace versus a secondary run detail surface?

Migration read:

- Product posture: `Preserve + simplify`.
- Preserve batch processing as a first-class bulk action.
- Preserve the visible operator contract:
  - explicit process/resume action,
  - async batch run,
  - partial progress,
  - deferred rows do not collapse the whole batch,
  - clear enough outcomes to trust what happened.
- Keep batch processing aligned with the single-record processing contract:
  - no hidden donor rematch,
  - no broad hidden cleanup,
  - no silent reinterpretation of review-time ambiguity.
- Keep operational/runtime constraints explicit during migration:
  - API efficiency,
  - retry/resume reliability,
  - chunking/batching strategy,
  - correlation safety,
  - and low write-churn at volume.
- Preserve the safety/reliability characteristics at batch scale without locking the product review to the exact current executor implementation.

#### Scenario: Failed Or Deferred Processing

Why it matters:

- Failed and deferred processing are not edge cases; they are part of the normal review lifecycle for staged gifts.
- Users need to understand whether a gift can be retried immediately, needs more review, or failed because of a deeper system/runtime problem.
- This scenario is where the product has to distinguish user-actionable review issues from lower-level processing/runtime failures.

Current behavior:

- Record-level processing can return `deferred` with reasons such as `not_ready`, `locked`, or `missing_payload`.
- Record-level processing failures write `processingStatus = process_failed` and populate `errorDetail`.
- Batch processing records deferred and error outcomes at row level and can leave the overall batch in `completed_with_errors` or `process_failed`.
- The UI surfaces failed rows as `Process failed`, keeps them in the active queue, and exposes retry or further review.

Current target posture:

- `Deferred` and `Failed` should remain distinct operator-facing outcomes.
- The user-facing meaning should stay simple:
  - `Deferred` = processing did not proceed because the row was not ready yet,
  - `Failed` = processing was attempted, but the attempt itself failed.
- The expected next action should also stay distinct:
  - deferred -> return to review, fix/complete what is needed, then try again,
  - failed -> inspect the error, retry if appropriate, or escalate/investigate if it looks systemic.
- Detailed runtime/system reasons still matter, but mainly as supporting explanation and "what next?" guidance rather than as many equal first-class workflow states.

Key metadata / UI / logic:

- Metadata:
  - `giftStaging.processingStatus`
  - `giftStaging.errorDetail`
  - `giftStaging.processingDiagnostics`
  - batch-run deferred/error counts and batch status where applicable
- UI:
  - `GiftStagingDrawer` shows failed-state messaging, recommendations, and error detail
  - `stagingQueueUtils.ts` and queue status summaries label `process_failed` distinctly
  - `useGiftStagingDrawerController.handleProcessNow` and `useStagingQueueController.processNow` surface deferred/error outcomes back to the user
  - queue-level retry behavior currently routes through mark-ready then process
- Logic:
  - `GiftStagingProcessingService.processGift` returns `deferred` for `not_ready`, `locked`, and `missing_payload`
  - `setProcessingError` writes `processingStatus = process_failed` and `errorDetail`
  - `GiftBatchProcessingService` accumulates deferred/error row outcomes and can move the batch to `completed_with_errors` or `process_failed`
  - some low-level reasons may reflect current runtime history more than target-model product language and should be reviewed before being preserved in migration wording

Open questions:

- How much runtime/system failure detail should be surfaced directly to users versus kept as secondary audit/support information?
- Should retry remain a simple user action, or should some failure states require more explicit re-review before retrying?
- Do legacy/internal reason labels such as `missing_payload` still belong in the target model now that staged fields are the processing truth?

Migration read:

- Product posture: `Preserve + simplify`.
- Preserve failed and deferred processing as explicit, recoverable product states.
- Preserve the clear operator distinction:
  - deferred = review/fix first,
  - failed = inspect/retry/escalate.
- Keep the user-facing workflow focused on “what should I do next?” rather than exposing raw implementation detail.
- Simplify the explanation model so detailed reasons support the next action rather than becoming a broad first-class state machine.
- Review whether the current mix of `processingStatus`, `errorDetail`, diagnostics, and batch-run outcome reporting can be simplified while preserving clear recovery paths.

#### Scenario: Already-Processed Gift

Why it matters:

- The workflow needs a clear terminal state for staged gifts that have already become committed CRM gifts.
- Users should not be able to accidentally reprocess the same staging record and create duplicate committed gifts.
- The product also needs to surface the fact that processing already happened and, where possible, the resulting committed gift linkage.

Current behavior:

- Record-level processing short-circuits when a staging record is already marked `processed` and has a linked `giftId`.
- Successful writeback marks the staging record as processed and stores the committed gift relation.
- Processed records are treated as terminal from the staging perspective and are not part of the default active-work queue.

Current target posture:

- This scenario is largely settled and should be treated as a clarification/alignment pass rather than a fresh product design question.
- The meaningful terminal product truth is:
  - this staged row has already produced a committed gift,
  - it should not be processed again,
  - it should link back to the created gift where possible,
  - and it should no longer appear in active work by default.
- `processed + giftId` should be treated as the primary terminal contract rather than broad status normalization baggage.

Key metadata / UI / logic:

- Metadata:
  - `giftStaging.processingStatus`
  - `giftStaging.giftId`
  - `giftStaging.validationStatus` / `dedupeStatus` are also set to `passed` on successful writeback today
- UI:
  - queue status summaries treat `processed` as a distinct success state
  - processed rows are excluded from active work by default unless explicitly included
  - drawer and status summaries can reflect the processed state rather than offering the same next actions as review/failed rows
- Logic:
  - `GiftStagingProcessingService.handleAlreadyProcessed` returns `processed` immediately when the record is already processed and linked to a gift
  - `GiftStagingService.markProcessedById` writes `processingStatus = processed`, `validationStatus = passed`, `dedupeStatus = passed`, and `giftId`
  - batch candidate loading skips rows already marked `processed`

Open questions:

- How much of the current processed writeback shape is real product state versus cleanup of the current state model?
- How explicitly should the migrated UI link users from the processed staging record to the committed gift?
- Are there any scenarios where a processed staging record should re-enter review, or should corrections always happen on the committed gift instead?
- Are `validationStatus = passed` and `dedupeStatus = passed` still serving a real runtime purpose after successful processing, or are they now mainly residual normalization?

Migration read:

- Product posture: `Preserve + simplify`.
- Preserve processed as a clear terminal staging state with duplicate-processing protection.
- Preserve committed-gift linkage where possible.
- Treat `processed + giftId` as the meaningful terminal truth in the lean target model.
- Review whether the current writeback of multiple “passed” fields is more complexity than the product needs once the state model is simplified.
- Keep correction of post-processing mistakes on the committed gift side rather than reprocessing the staging record.

#### Scenario: Staging State Model Simplification

Why it matters:

- The staged gift state model cuts across nearly every lifecycle step and is one of the strongest candidates for simplification before migration.
- This is also where one-shot metadata and UI-derived state may have drifted into overlapping fields.

Current behavior:

- Staged gifts currently carry multiple state/evidence fields: `processingStatus`, `validationStatus`, `dedupeStatus`, `processingDiagnostics`, `errorDetail`, and `autoProcess`.
- `processingStatus` is the main lifecycle field used for active queue inclusion, ready/process/failed/processed behavior, and processing eligibility.
- `validationStatus` appears to overlap with reviewer readiness because marking a record ready also sets validation to `passed`.
- `dedupeStatus` supports donor/duplicate review states, but its boundary overlaps with donor linkage and diagnostics.
- `processingDiagnostics` carries structured blockers, warnings, identity confidence, and batch donor-match evidence.
- `errorDetail` carries failure explanations for failed processing or donor-match errors.
- `autoProcess` carries intake automation intent, but becomes less central if intake routing is owned primarily at channel level.

Current target posture:

- This scenario should now be read as the synthesis of the decisions above it rather than as a standalone abstract state-model exercise.
- Staging should become a simpler review/process workspace, mainly for imports and integrations rather than a universal intake model.
- Intake routing should stay channel-based:
  - manual entry -> direct commit by default,
  - CSV/import -> stage by default,
  - integrations -> stage by default unless a later narrow explicit exception is justified.
- The backend should store actual lifecycle/runtime truth plus the facts/evidence needed to derive queue meaning.
- Processability should be derived from current lifecycle state plus current record facts and diagnostics, not stored as a separate backend truth such as `ready_for_process`.
- "Ready now" can still exist as a useful operational concept in the UI, but as a derived slice/label rather than a persisted workflow state.
- The main durable lifecycle meaning should stay concentrated in `processingStatus`, while review meaning should come mostly from diagnostics, donor linkage, duplicate evidence, and current record facts.
- `validationStatus` now looks outside the lean target model unless a later concrete workflow proves otherwise.
- `errorDetail` should stay focused on failure explanation rather than broader workflow meaning.
- `autoProcess` becomes much weaker if routing is owned at intake-channel level rather than hidden per-record automation.
- This simplification is also intended to protect operational efficiency: avoid reintroducing per-row writes, re-computation, or workflow-state churn that would increase API pressure in high-volume queue and batch-processing flows.

Runtime-truth caution:

- This is a target posture, not a full description of current behavior.
- Current runtime truth is already partly simplified:
  - async donor-match and batch-processing flows already try to minimize write churn and API pressure,
  - diagnostics already carry much of the meaningful review evidence.
- Stage 1 runtime alignment has already moved meaningfully toward the target model:
  - staged fields are now the editable truth for processing,
  - processing no longer silently rematches unresolved donor rows to an existing donor,
  - ambiguous duplicate-candidate sets no longer auto-link in batch donor match.
- But current runtime still depends more heavily on stored `processingStatus` gates than this target posture implies, and manual/integration create-time paths are still relatively chatty compared with the batch-path simplification direction.

Key metadata / UI / logic:

- Metadata:
  - `giftStaging.processingStatus`, `giftStaging.validationStatus`, `giftStaging.dedupeStatus`, `giftStaging.processingDiagnostics`, `giftStaging.errorDetail`, and `giftStaging.autoProcess` are all staged-record fields.
- UI:
  - `useStagingQueueController` defaults the active queue to `pending`, `processing`, `ready_for_process`, and `process_failed`.
  - `useGiftStagingDrawerController.handleMarkReady` sets `processingStatus` to `ready_for_process` and `validationStatus` to `passed`.
  - `stagingQueueUtils.ts` combines `processingStatus`, `validationStatus`, `dedupeStatus`, diagnostics, donor linkage, and error detail into row summaries.
- Logic:
  - `GiftStagingProcessingService.canProcess` only allows `ready_for_process` and `process_failed` records to process.
  - `GiftService.buildProcessingDiagnostics` derives eligibility, blockers, warnings, and identity confidence from the normalized payload.
  - `GiftBatchDonorMatchService` writes identity-resolution outcomes into `processingDiagnostics` and may update `dedupeStatus`.
  - The current review focus is now the interaction between:
    - channel-based intake routing,
    - donor/dedupe matching runs,
    - derived queue slices,
    - record-level and batch processing contracts,
    - failure/deferred handling,
    - terminal processed writeback,
    - and any remaining create-time automation/state churn.

Open questions:

- What is the minimum durable lifecycle state the migrated model actually needs under `processingStatus`?
- Does `dedupeStatus` still earn a first-class field, or should donor/duplicate review meaning move further toward donor linkage + diagnostics + derived queue slices?
- How stable/structured does `processingDiagnostics` need to be to support queue meaning, batch review, and failure guidance without turning back into a second hidden state model?
- Does `autoProcess` survive at all beyond transitional/runtime compatibility, or should channel-based routing remove the need for it?
- Is there any remaining concrete workflow that truly requires a stored human-review outcome distinct from derived processability?

Migration read:

- Product posture: `Redesign` with current leaning `derived processability + simpler lifecycle state`.
- The Twenty-app migration should not recreate the current overlapping state model without review.
- The target model should stay aligned with the decisions already made above:
  - channel-based intake routing,
  - queue meaning derived from facts/evidence,
  - `ready now` as workspace language rather than durable truth,
  - conservative donor-match behavior,
  - explicit processing contracts,
  - clear failed/deferred/processed operator outcomes.
- The target model should be lean enough for CSV/import and integration flows that may create or update many records under API limits.
- Avoid requiring multiple per-row writes at creation time for state that can be derived or written by explicit batch actions.
- Keep the simplified state model compatible with current queue and batch-processing efficiency goals rather than reintroducing expensive logic in a cleaner-looking form.
- Preserve user-visible clarity around ready-now, needs-attention, processing, failed, and processed queue slices even if only lifecycle/runtime truth is stored durably.

### 2.4 Gift Intake / Manual Gift Entry Workflow Summary

Gift intake / manual gift entry is the user-facing workflow for recording a gift directly in the CRM, either against a donor, an organisation, an opportunity, a fund, an appeal, a recurring agreement, or a batch.

It overlaps with gift processing / staging, but it is not the same workflow.

Scope note: this workflow reviews the staff-facing form experience. The `Manual Intake And Staging` scenario above reviews the backend / lifecycle handoff after that form submits.

The migration goal is to preserve the useful guided-entry behavior while deciding explicitly whether each intake channel creates a committed gift immediately, creates a staged gift for review, or uses a high-trust auto-processing path.

This workflow also needs to stay lean. Manual entry should help users record a gift accurately, avoid obvious duplicate donors/gifts, and connect the gift to the right fundraising context without becoming a second gift-processing workspace.

Current leaning:

- Standard manual entry remains a direct-create workflow by default.
- A batch-aware manual-entry context remains an explicit open exception under review, but should not blur the default direct-create model unless it is deliberately designed as a distinct context.

Section synthesis:

- Standard manual entry is a direct-create workflow by default.
- Duplicate-donor checking should interrupt submit and force an explicit donor choice when likely matches exist.
- Duplicate-gift protection is a real user need, but the implementation remains open/redesign-heavy.
- Richer fundraising context during entry remains open and should be reviewed through workflow speed and standard-path simplicity rather than assumed from the current all-in-one form.
- A batch-aware manual-entry context remains open, but should be treated as an explicit contextual variation rather than something that blurs the default direct-create model.
- Success/outcome language should stay explicit and should not hide routing differences behind ambiguous create/stage/process wording.

### 2.5 Gift Intake / Manual Gift Entry Use Cases

Use these user jobs as the basis for reviewing manual gift entry during migration:

1. A user needs to manually record a gift received outside an automated integration.
2. A user needs to decide whether the gift is from an individual donor, an organisation, a grant/legacy/corporate context, or an in-kind contribution.
3. A user needs to find and use an existing donor where possible instead of accidentally creating a duplicate donor.
4. A user needs to create a gift for a new donor when no suitable existing donor exists.
5. A user needs to record core gift details such as amount, currency, date, name, fund, and appeal.
6. A user needs to connect the gift to the right opportunity, company, recurring agreement, or batch where relevant.
7. A user needs to create or choose a gift batch when manually entering gifts that should be reviewed or processed together.
8. A user needs to understand whether the gift was created, staged, blocked, or failed.

### 2.6 Gift Intake / Manual Gift Entry Scenario Reviews

Use the same scenario-review shape for manual entry. Keep these reviews focused on the manual-entry product surface; staging lifecycle details should remain in the gift processing / staging reviews unless the intake decision itself is being discussed.

Work through the manual entry scenario reviews in this order unless there is a clear reason to deviate:

1. Entering a standard individual gift
2. Choosing an existing donor versus creating a new donor
3. Detecting possible duplicate staged gifts
4. Entering organisation, grant, legacy, corporate, or in-kind gift context
5. Coding the gift to fund, appeal, opportunity, recurring agreement, or batch
6. Creating or selecting a batch during entry
7. Understanding create/stage/process outcome

#### Scenario: Entering A Standard Individual Gift

Why it matters:

- Manual gift entry is a common high-trust intake path.
- The migrated app needs a fast, understandable way to enter the minimum viable gift without forcing users into the full staging-review workspace every time.

Current behavior:

- Manual Gift Entry is a local form in the fundraising-service client.
- The default flow is `giftIntent: standard`.
- For the donor flow, first name and last name are required; email is optional.
- Amount is required; currency defaults to `GBP`; gift date defaults to today's date.
- Form submit builds a `GiftCreatePayload` and posts to `/api/fundraising/gifts`.
- The client sets `autoProcess: true`.
- The current backend/runtime may still stage first internally before committed gift creation depending on feature flag, trust, diagnostics, and donor evidence, but that is not the intended standard product model for users.

Current target posture:

- This scenario is now effectively settled as a direct-create workflow rather than an open routing question.
- Standard manual entry should remain a fast, high-trust path for creating a committed gift now.
- It should feel like "create gift", not "submit into a staging/review pipeline".
- Duplicate donor prevention remains part of this flow, but as a guardrail inside direct entry rather than a shift into a different workflow model.
- The remaining product work here is mainly about field scope and clear success/outcome language, not manual-entry routing design.

Key metadata / UI / logic:

- Metadata: committed gift fields for amount, date, name, donor/contact, fund, appeal, opportunity, batch, recurring agreement, gift intent, in-kind details.
- Metadata: staging fields may also be written first if gift staging is enabled.
- UI: `ManualGiftEntry`.
- UI: `GiftTypeCard`, `DonorContactCard`, `GiftBasicsCard`, `ManualGiftStatus`.
- UI: shared `GiftDetailsForm`.
- Logic: `useManualGiftEntryController`.
- Logic: `buildGiftPayload`.
- Logic: `createGift` client API.
- Logic: backend `GiftService.createGift`.

Open questions:

- Which fields belong in the fast default manual-entry path versus secondary detail / drawer review?
- How minimal should the standard default path be before users move into more contextual/coded/manual variants?
- Does the current API/implementation need further cleanup so the form no longer depends on hidden stage/process branching under the hood?

Migration read:

- Product posture: `Preserve + simplify`.
- Preserve the ability to enter a standard manual gift quickly.
- Preserve the direct-create mental model for standard manual entry.
- Preserve minimal required donor + amount/date fields in the default path.
- Keep duplicate donor prevention inside this workflow as a quality guardrail rather than a reason to blur it back into staging.
- Simplify the create/stage/process outcome so users and future implementers do not have to infer what happened from endpoint behavior.
- Keep success/outcome language clearly in "gift created" territory for the standard path.

#### Scenario: Choosing An Existing Donor Versus Creating A New Donor

Why it matters:

- Avoiding duplicate donors is the most important quality-control goal during gift intake.
- Manual entry needs a clear user choice when a possible donor already exists.

Current behavior:

- The form runs a debounced person duplicate lookup once first name and last name are long enough.
- On submit, the controller performs another duplicate lookup before creating the gift.
- If duplicates are found, submit pauses and shows a duplicate-selection panel.
- The user can select an existing donor, search donors in a modal, use the existing contact, or create with a new contact.
- Selecting an existing donor sends `contactId`.
- Creating a new donor sends an embedded `contact` object.

Current target posture:

- The core product contract here should be preserved firmly:
  - when likely duplicate donors are found, submit pauses,
  - and the user must make an explicit donor decision before the gift is created.
- This should not be reduced to a passive warning or hint that is easy to ignore.
- Manual entry is the right place for this interruption because the user is present and able to resolve donor identity in the moment.
- What remains open is the migrated interaction shape:
  - what threshold counts as a likely duplicate,
  - what evidence is shown,
  - how the decision surface should look in Twenty apps,
  - and how explicit the "create new donor" path should feel.

Key metadata / UI / logic:

- Metadata: `contactId` / donor relation on committed or staged gift payload.
- Metadata: staged donor identity fields where staging is used.
- UI: `DonorSelectionPanel`.
- UI: `DuplicatePanel`.
- UI: `DonorSearchModal`.
- Logic: `useManualGiftEntryController.handleSubmit`.
- Logic: `handleUseExistingContact`.
- Logic: `handleCreateWithNewContact`.
- Logic: `findPersonDuplicates`.
- Logic: `buildDuplicateLookupPayload`.

Open questions:

- What threshold should count as a likely duplicate strongly enough to interrupt submit?
- What evidence/candidate detail should be shown to support the donor decision?
- Should duplicate donor review happen inline in the manual entry form, through Twenty's native record selection patterns, or through another explicit decision surface?
- When a user deliberately chooses "create new", what confirmation or retained evidence should make that choice feel explicit enough?

Migration read:

- Product posture: `Preserve + simplify`.
- Preserve explicit existing-donor versus new-donor choice.
- Preserve the interrupt-and-choose quality-control boundary when likely duplicate donors are found.
- Review whether the current duplicate-panel/search-modal implementation should migrate, or whether Twenty-native record selection covers the same product need more cleanly.
- Do not weaken this into a passive warning-only pattern in the migrated manual-entry flow.

#### Scenario: Detecting Possible Duplicate Staged Gifts

Why it matters:

- Even when the donor is correct, users can accidentally enter the same gift twice.
- This is a lightweight intake guardrail; it should not become a second reconciliation system.

Current behavior:

- When a donor is selected, the controller checks recent staged gifts.
- It compares selected donor, amount, and gift date.
- If it finds a close match, it shows a warning that a staged gift with the same donor, amount, and date already exists.
- Lookup failures are ignored in the manual-entry form.

Current target posture:

- The user need here should be preserved strongly:
  - protect manual-entry users from accidentally creating a duplicate gift that may already exist through another intake path.
- The current implementation should not be treated as product truth:
  - it is a lightweight client-side heuristic,
  - it only checks staged gifts,
  - it ignores lookup failures,
  - and it is not an authoritative duplicate-detection model.
- Manual entry should likely keep a meaningful duplicate-gift guardrail because this is one of the last moments before a duplicate is created.
- But the migrated implementation should deliberately review:
  - what record set is checked,
  - how strong the warning/confirmation should be,
  - and how actionable the duplicate signal needs to be for the user.
- This should not automatically become a hard block unless the duplicate signal is genuinely strong.

Key metadata / UI / logic:

- Metadata: staged gift donor, amount, and gift date.
- UI: duplicate message surfaced through `DonorSelectionPanel`.
- Logic: `useManualGiftEntryController` calls `fetchGiftStagingList({ limit: 50 })`.
- Logic: comparison is client-side against selected donor, amount, and date.

Open questions:

- What record set should duplicate-gift checking cover in the migrated model: staged gifts, committed gifts, or both?
- Should manual entry surface a soft warning, a stronger confirmation step, or a hard block only for the clearest duplicate cases?
- How actionable should the duplicate warning be: just an alert, or a route into the likely matching record(s)?
- Should this become explicit product/backend logic rather than a local client-side lookup heuristic?

Migration read:

- Product posture: `Redesign`.
- Preserve the user need to avoid accidental duplicate gift entry across the intake system.
- Do not preserve the current client-side staged-only heuristic as product truth.
- Treat manual entry as an important place to surface duplicate-gift risk, because the user is actively about to create a new gift.
- Redesign the implementation around the real open questions:
  - what record set to check,
  - how strong the intervention should be,
  - and how actionable the result should be.

#### Scenario: Entering Organisation, Grant, Legacy, Corporate, Or In-Kind Gift Context

Why it matters:

- Not all fundraising income is a simple individual donation.
- The current manual-entry form attempts to route users into individual, organisation, opportunity, legacy, grant, corporate, and in-kind context from one surface.

Current behavior:

- The user selects `giftIntent`.
- Grant and corporate in-kind intent switch the form into an organisation-led flow.
- Organisation flow requires a linked company.
- Standard / legacy donor flow keeps the donor contact card visible.
- Opportunity search filters by selected donor, selected company, search term, and gift intent.
- Corporate in-kind and explicit in-kind toggle can send in-kind description and estimated value.

Current target posture:

- The need to capture richer fundraising contexts here should clearly survive migration:
  - organisation-linked gifts,
  - grants,
  - legacies,
  - corporate/in-kind context,
  - and related opportunity/company linkage.
- But the exact manual-entry shape should remain genuinely open for product review.
- The main design question is not simply "one surface or separate flows".
- The more useful product tradeoff is:
  - how to keep manual entry fast for mixed real-world gift entry,
  - without making the standard case feel bloated or confusing.
- Viable product shapes may include:
  - one unified surface with better progressive disclosure,
  - one surface with a strong context switch that reconfigures efficiently,
  - a lean default path plus quick context pivots,
  - or separate flows only if the added navigation cost is clearly worth it.

Key metadata / UI / logic:

- Metadata: `giftIntent`.
- Metadata: `companyId`.
- Metadata: `opportunityId`.
- Metadata: `isInKind`, `inKindDescription`, `estimatedValue`.
- UI: `GiftTypeCard`.
- UI: `OrganisationDetailsCard`.
- UI: `OpportunityCompanyCard`.
- Logic: `useManualGiftEntryController` derives `isOrganisationFlow`.
- Logic: `searchCompanies`.
- Logic: `searchOpportunities`.
- Logic: `buildGiftPayload`.

Open questions:

- What product shape best balances workflow speed for mixed manual entry against simplicity of the standard path?
- Which intent-specific fields are essential during first entry versus better handled in secondary detail, later editing, or related records?
- How much click-cost/navigation overhead is acceptable before a "cleaner" split-flow model becomes worse than a denser unified surface?
- How should Twenty-native record pickers replace the current local search/cards without slowing down repetitive manual entry work?

Migration read:

- Product posture: `Open`.
- Preserve the underlying need to capture different fundraising contexts.
- Do not treat the current all-in-one form shape as settled product truth.
- Do not prematurely assume the answer is aggressive flow-splitting either.
- Review this area through the lens of workflow speed, density, click-cost, and standard-path clarity before choosing the migrated shape.

#### Scenario: Coding The Gift To Fund, Appeal, Opportunity, Recurring Agreement, Or Batch

Why it matters:

- Users often need gifts coded to the right fundraising context at entry time.
- But overloading the intake form can slow down the simple case.
- Manual entry and staging review are different workflows, but they have overlapping relational-entry requirements that should not drift into two parallel bespoke solutions during migration.

Current behavior:

- The gift basics section exposes amount, currency, date, fund, and appeal through shared `GiftDetailsForm`.
- Opportunity lookup and selection are displayed in the gift context area.
- The user can toggle recurring gift association and select a recurring agreement.
- The user can select an existing gift batch.
- The payload can include `fundId`, `appealId`, `opportunityId`, `recurringAgreementId`, and `giftBatchId`.

Current target posture:

- The underlying need to code gifts to the right fundraising objects should survive migration.
- This scenario is mainly about field scope and default visibility, not whether coding matters at all.
- Manual entry should stay lean enough for fast direct-create use.
- It remains open whether any of these coding relationships are universally default-visible across orgs, or whether they all belong in one optional/contextual layer surfaced efficiently when needed.
- But migration should also explicitly look for shared patterns/components between manual entry and staging review where they solve similar relational-entry problems:
  - donor/company matching language,
  - related-record selection,
  - progressive disclosure for extra context,
  - and efficient low-click relational entry.
- The goal is not to collapse the two workflows together.
- The goal is to avoid inventing two separate bespoke interaction models for very similar relational-entry requirements unless there is a strong workflow-specific reason to diverge.

Key metadata / UI / logic:

- Metadata: `fundId`.
- Metadata: `appealId`.
- Metadata: `opportunityId`.
- Metadata: `recurringAgreementId`.
- Metadata: `giftBatchId`.
- UI: `GiftDetailsForm`.
- UI: `OpportunityCompanyCard`.
- UI: `RecurringAssociationsCard`.
- UI: `RecurringAgreementSelector`.
- Logic: `useAppealOptions`.
- Logic: `useFundOptions`.
- Logic: `fetchRecurringAgreements`.
- Logic: `buildGiftPayload`.

Open questions:

- Which coding fields should be visible by default for manual entry?
- Which coding fields should be optional detail, drawer content, or editable after creation?
- Should recurring agreement selection live in manual gift entry, a recurring-agreement workflow, or both?
- Which relational-entry interactions should be shared between manual entry and staging review rather than solved twice?
- Are fund/appeal/opportunity/recurring/batch all better treated as the same optional/contextual layer unless a later org-specific/product-specific reason justifies promoting one by default?

Migration read:

- Product posture: `Preserve + simplify`.
- Preserve coding to the major fundraising objects.
- Review the form layout and default visibility before porting.
- Keep manual entry and staging review distinct in purpose, but deliberately look for shared relational-entry patterns/components where the user need overlaps.
- Do not force a universal default-field hierarchy here before migration evidence justifies it.
- For the more current working direction on `Opportunity` as a lightweight funding / bid / award pipeline object before payment, see [OPPORTUNITY_FUNDING_PIPELINE_MODEL.md](docs/apps-migration/OPPORTUNITY_FUNDING_PIPELINE_MODEL.md).

#### Scenario: Creating Or Selecting A Batch During Entry

Why it matters:

- Users sometimes enter multiple gifts that should be reviewed or processed together.
- Batch association is useful, but inline batch creation during manual entry may duplicate batch-management behavior elsewhere.

Current behavior:

- Manual entry loads recent gift batches.
- The user can choose no batch, an existing batch, or "Create new batch".
- Creating a new manual batch collects batch name, optional expected count, and optional expected amount.
- The client calls `createGiftBatch` before creating the gift and then includes `giftBatchId` in the gift payload.

Current target posture:

- Batch association should remain available as a concept in manual entry.
- But inline batch creation inside the default manual-entry form is not currently settled as the right product shape.
- Creating a batch may be a relatively low-frequency setup action, while entering multiple gifts within an existing batch context is a different usage pattern where speed and grouping matter more.
- The key open direction is not necessarily "separate workflow or not?".
- The more useful question is whether manual entry should support a batch-aware context where the same core entry experience behaves differently:
  - batch already selected,
  - repeated entry within that context,
  - possible shared/defaulted/locked coding,
  - and different expectations around speed, grouping, or later review.
- This should stay open without implying that batch-aware manual entry must become a completely separate surface or component.

Key metadata / UI / logic:

- Metadata: `giftBatch` relation / `giftBatchId`.
- Metadata: gift batch `source`, `status`, `trustPosture`, expected count, expected amount.
- UI: gift batch select inside `ManualGiftEntry`.
- UI: inline batch-name / expected-count / expected-amount fields.
- Logic: `fetchGiftBatches`.
- Logic: `resolveGiftBatchId`.
- Logic: `createGiftBatch`.

Open questions:

- Does manual entry need inline batch creation, or is batch selection/context enough?
- Should batch in manual entry be modeled primarily as a per-gift field, or as a higher-level batch-aware entry context for moderate-volume offline entry?
- What, if anything, should change about the same core entry experience when the user is working within a batch context?
- How should this interact with Twenty CSV import and batch-level staging/review?

Migration read:

- Product posture: `Open`.
- Preserve batch association as a concept.
- Do not treat inline batch creation in the default manual-entry form as settled.
- Keep open the idea that manual entry may support a batch-aware context without implying that this must become a completely separate workflow/component.

#### Scenario: Understanding Create / Stage / Process Outcome

Why it matters:

- The user needs to know whether their submitted gift is now a committed CRM gift, a staged item awaiting review, or an error needing correction.
- This is currently the same product ambiguity discussed in gift processing, but manual entry is where the user first sees it.

Current behavior:

- Manual Gift Entry treats a successful response from `/api/fundraising/gifts` as success.
- The success message currently says the gift was processed in Twenty and includes the returned gift id.
- Client status only distinguishes idle, submitting, error, and success with `giftId`.
- The client does not model a separate "staged for review" success state.

Current target posture:

- Manual entry should be a direct-commit workflow by default.
- In the initial standard product shape, manual entry should not present staging as a second normal outcome.
- The user should understand the standard manual-entry path as "create gift", not "submit into an intake router".
- The key principle is no hidden ambiguity:
  - standard manual entry should have a clear direct-create outcome model,
  - and any later batch-context exception should have its own explicit outcome language rather than silently sharing the standard success model.

Key metadata / UI / logic:

- Metadata: response `createGift.id`.
- Metadata: staging status fields if staging was used.
- UI: `ManualGiftStatus`.
- Logic: `createGiftForContact`.
- Logic: `handleSuccess`.
- Logic: backend `GiftService.createGift`.

Open questions:

- Should manual-entry success simply confirm committed gift creation and link to the created record?
- If batch-context manual entry later stages rather than commits, how should that be expressed without weakening the default direct-commit model?
- Does the current API/response model need to be simplified so manual entry no longer depends on hidden stage/process branching?

Migration read:

- Product posture: `Redesign`.
- Preserve clear success/error feedback, but redesign manual entry around direct gift creation as the primary standard outcome.
- Do not carry forward the current ambiguous "create / stage / process" interpretation into the migrated standard manual-entry flow.
- If batch-context manual entry later proves to need a staged outcome, make that an explicit contextual exception with its own clear success language rather than a hidden variation inside the default path.

### 2.7 Recurring Workflow Summary

Recurring is the workflow for representing an ongoing donor commitment, monitoring agreement health, linking gifts/installments to that agreement, and keeping provider-backed agreement state understandable.

Unlike gift processing / staging, this workflow has had limited product iteration so far. Much of the current shape comes from the one-shot object/schema pass and from lightweight operational UI added around recurring agreements.

The migration goal is to preserve the core concept of a recurring agreement and its relationship to gifts, while treating many details as open for review: lifecycle states, provider linkage, expected-payment tracking, agreement creation/editing, annual receipt metadata, default coding, and whether the current agreement-exception workspace is the right long-term surface.

This review has now established a stronger recurring posture than the earlier summary implied:

- the recurring agreement is primarily the CRM's commitment / expectation record, not just provider metadata;
- recurring health/status review is likely the main operator-facing surface in this version;
- provider-backed recurring intake should be handled mainly by certainty class:
  - confident existing agreement match -> lighter fulfillment path,
  - recurring-related but unmatched -> controlled staging/promotion path,
  - weak-signal recurrence -> user-judgment-led review path;
- creation of a new tracked recurring agreement from staging should require explicit reviewer intent, after which processing can complete canonical record creation/linking automatically;
- `nextExpectedAt` remains a real operator-facing expectation field, with fulfillment as the primary advancement moment and provider updates as a secondary reconciliation/correction path.

What remains more open is the exact lifecycle/control shape around agreement creation/editing, the final treatment of one-shot metadata/defaults, and how much of the current recurring workspace should survive as custom app UI versus ordinary Twenty record detail.

### 2.8 Recurring Use Cases

Use these user jobs as the basis for reviewing recurring during migration:

1. A user needs to see that a donor has an ongoing recurring commitment, not only isolated gifts.
2. A user needs each recurring gift/installment to be linked back to the correct recurring agreement.
3. A user needs to know whether a recurring agreement is active, paused, canceled, completed, delinquent, overdue, or otherwise needs attention.
4. A user needs to know when the next installment is expected and whether that expectation has been missed.
5. A user needs provider-backed recurring donations to update CRM agreement state without hiding source/provider evidence.
6. A user needs to manually associate a gift with an existing recurring agreement when the payment was not matched automatically.
7. A user needs enough agreement context to review exceptions: donor, amount, cadence, next expected date, provider reference, payment method reference, and current health.
8. A user needs recurring defaults such as fund, appeal, Gift Aid declaration, and receipt policy to be reviewed before migration, because some currently exist mostly as metadata.

### 2.9 Recurring Scenario Reviews

Use the same scenario-review shape for recurring. Treat these as a first migration-reference pass; a later product/design review should decide which agreement lifecycle behaviors survive.

Work through the recurring scenario reviews in this order unless there is a clear reason to deviate:

1. Representing a recurring agreement
2. Creating / recognizing / promoting a recurring agreement
3. Reviewing recurring agreement health and exceptions
4. Linking a manually entered gift to a recurring agreement
5. Linking an integration-created gift to a recurring agreement
6. Advancing next expected date after processing
7. Reviewing one-shot recurring metadata

#### Scenario: Representing A Recurring Agreement

Why it matters:

- Recurring fundraising needs a durable agreement/commitment record that is separate from any one gift.
- The agreement object anchors later installments, provider references, expected dates, defaults, and user review.

Current behavior:

- `setup-schema.mjs` provisions a `recurringAgreement` object.
- The fundraising-service exposes thin CRUD/list proxy endpoints for recurring agreements.
- Gifts and gift-staging records can relate to a recurring agreement.
- Recurring agreement records can relate to a donor/person.
- There is not currently a fully guided agreement creation/editing workflow in the fundraising-service UI.

Current target posture:

- The recurring agreement should currently be treated as the CRM's operational commitment / expectation layer, not primarily as provider metadata or a full billing-control surface.
- Its main product meaning is:
  - this donor has an ongoing recurring commitment,
  - the CRM expects future fulfillment over time,
  - and related gifts/payments should link back to that commitment.
- The agreement should help operators answer practical questions such as:
  - is this commitment still live / expected?
  - what should have happened most recently, and what should happen next?
  - what evidence do we have that it is being fulfilled?
  - does anything look wrong, late, paused, broken, or unclear?
  - what context explains the current state?
  - does someone need to do anything now?
  - how easily can a real incoming gift be associated back to this agreement?
  - if an expected payment has not arrived, how is that surfaced clearly without a speculative installment model?
- Provider linkage is important operational evidence, and may drive updates, but it is secondary to the agreement's CRM meaning as commitment + expectation.
- The current leaning is to keep the lean core free of pre-created expected installment rows; missed/late fulfillment should be inferred from agreement expectation plus actual gift/payment history.

Key metadata / UI / logic:

- Metadata: `recurringAgreement.status`, `cadence`, `intervalCount`, `amount`, `startDate`, `endDate`, `nextExpectedAt`.
- Metadata: `recurringAgreement.autoProcessEnabled`.
- Metadata: `recurringAgreement.provider`, `providerAgreementId`, `providerPaymentMethodId`, `mandateReference`, `providerContext`, `source`.
- Metadata: relation from committed gift to `recurringAgreement`.
- Metadata: relation from staged gift to `recurringAgreement`.
- Metadata: relation from recurring agreement to donor/person.
- UI: Twenty-native recurring agreement object can be opened through `/objects/recurringAgreements`.
- Logic: `RecurringAgreementController`.
- Logic: `RecurringAgreementService`.
- Logic: `RecurringAgreementPayload`.

Open questions:

- What is the minimum recurring agreement record we need for migration?
- Should agreement creation/editing be handled mostly through Twenty record pages, a custom app workflow, provider sync, or a combination?
- Are current status and cadence values sufficient and product-approved?
- Which provider fields are user-facing evidence versus background integration detail?
- How much of recurring agreement management should be understanding/exception handling in CRM versus direct billing-control actions owned by providers?

Migration read:

- Product posture: `Open`.
- Preserve the recurring agreement concept and gift/agreement relationship.
- Treat the recurring agreement primarily as a commitment / expectation record in CRM terms.
- Keep provider linkage as supporting operational evidence rather than the primary product meaning of the record.
- Do not let the one-shot schema or provider-driven implementation details define the product role prematurely.
- Current leaning: avoid a speculative expected-installment model in the lean core; use agreement expectation plus actual fulfillment history instead.

#### Scenario: Creating / Recognizing / Promoting A Recurring Agreement

Why it matters:

- The system may encounter recurring-related evidence before it is actually safe to instantiate the final CRM recurring agreement record.
- Without a clear product stance here, later scenarios about linkage, health, and expectation updates can accidentally smuggle in conflicting agreement-creation assumptions.
- This is especially important for integration-led recurring flows, new-donor/staging-first intake, and lower-signal recurring types such as standing orders.

Current target posture:

- "Creation" should not be treated as a single universal moment.
- The product should distinguish between:
  - recognition / carriage of recurring-related evidence,
  - and promotion into a recurring agreement record in CRM.
- Recognition / carriage may happen earlier:
  - the system may know incoming data looks like a new recurring setup,
  - an existing recurring commitment,
  - or recurring-related fulfillment with unclear status.
- Promotion should happen only when the CRM has enough confidence that:
  - a real ongoing commitment exists,
  - and that commitment can be anchored safely in CRM terms.
- New-donor / staging-first flows should not be bypassed just because recurring evidence arrives early.
- Different recurring types may reach promotable confidence in different ways, so the product should avoid one universal creation rule.

Key metadata / UI / logic:

- Metadata:
  - recurring-related evidence may arrive through staged/committed gift links, provider fields, `expectedAt`, and provider context before final agreement creation/linking is safe.
- UI:
  - no fully worked recurring-agreement creation workflow is currently established in the fundraising-service UI.
- Logic:
  - provider/webhook flows, staging-first review, manual/admin creation, and later agreement-linking behavior all contribute evidence but do not yet define one settled recurring-agreement creation model.

Open questions:

- What are the legitimate ways a recurring agreement can come into existence in CRM terms:
  - explicit admin/manual creation,
  - provider-confirmed setup promotion,
  - or promotion from recurring evidence in staging after review?
- When is recurring evidence strong enough to be carried forward, but not yet strong enough to justify creating/linking the final CRM agreement?
- Which recurring types justify earlier agreement promotion, and which should remain more cautious?
- When should the system refuse promotion and surface an explicit exception/confirmation path instead?
- What exact review-time mechanism should carry the explicit reviewer signal that a staged recurring-related gift should become a new tracked recurring commitment?

Migration read:

- Product posture: `Open`.
- Capture the distinction between recognition/carriage of recurring evidence and promotion into a recurring agreement record.
- Do not force a single universal agreement-creation rule across all recurring types and intake paths.
- Keep recurring evidence visible through intake/staging where needed, but only promote once the CRM can represent the commitment safely and meaningfully.
- Current use-case pressure test suggests:
  - provider-backed recurring fulfillment with a confident existing agreement match is becoming relatively well understood as a lighter-path case,
  - recurring-related intake with no existing agreement match is becoming the main staged promotion/creation case,
  - and weak-signal cases such as standing-order-style recurrence should remain much more user-judgment-led.
- Keep intentionally open the case where direct-debit setup may be known before first fulfillment; the right creation/promotion moment there may depend on integration shape rather than one universal product rule.
- Settle the boundary that new recurring-agreement creation from staging should require explicit reviewer intent.
- Once that explicit review-time signal exists, processing should be allowed to complete the canonical record work in one go:
  - donor/contact creation or resolution in the normal staging way,
  - gift creation,
  - recurring agreement creation,
  - gift/agreement linking,
  - attachment of stable external recurring identifiers where present,
  - and carry-through of core provider/context evidence needed for future matching.
- Keep the exact UX/control shape for that explicit signal open; the settled product point is that review decides the recurring meaning, and processing completes the canonical record creation.

#### Scenario: Reviewing Recurring Agreement Health And Exceptions

Why it matters:

- The product value is not only storing agreements; users need to know which agreements require attention.
- Exception review should help users find missed, paused, canceled, delinquent, or provider-problem agreements without turning recurring into a separate reporting product too early.

Current behavior:

- The `RecurringAgreementList` workspace is labelled around agreement exceptions.
- It loads up to 50 agreements through `/api/fundraising/recurring-agreements`.
- It computes summary counts for total, overdue, paused/canceled, delinquent, and active.
- Overdue is currently derived client-side from `nextExpectedAt` being before today and status being `active`.
- Users can filter all / overdue / paused-canceled / delinquent, search, sort, paginate the local list, refresh, review in a drawer, open the donor record, and open the agreement record.
- The review drawer shows health message, amount, status, next expected, auto-process, donor, provider, provider agreement, and payment method.

Current target posture:

- Recurring agreement remains the core product object.
- The main operator-facing recurring surface in this version is likely best understood as a health/status workspace with exception-focused value, not a pure exception queue.
- That workspace should help operators understand states such as:
  - expected payment appears missed / overdue,
  - agreement is no longer currently expected to fulfill because it is paused / canceled / completed,
  - agreement appears at risk / delinquent because fulfillment is repeatedly not happening as expected,
  - or the current state is unclear enough that an operator may need to investigate.
- Supporting reasons/evidence such as unclear provider state, missing next expected date, or weak fulfillment linkage matter because they explain why the agreement state is unclear or concerning.
- The workspace should not flatten all of those into one generic "exception" concept.

Key metadata / UI / logic:

- Metadata: `status`.
- Metadata: `nextExpectedAt`.
- Metadata: amount / cadence / interval count.
- Metadata: donor relation.
- Metadata: provider and payment-method identifiers.
- UI: `RecurringAgreementList`.
- UI: `ActionDrawer` inside recurring agreement review.
- UI: recurring summary metric cards, exception filter chips, search, sort, table, drawer.
- Logic: `useRecurringAgreementBrowser`.
- Logic: `isOverdueAgreement`, `isPausedAgreement`, `isDelinquentAgreement`, `getDayDelta`.
- Logic: `fetchRecurringAgreements`.

Open questions:

- Is a health/status workspace with exception-focused value the right primary operator-facing surface for this version?
- Should overdue / delinquent / paused be computed client-side, stored as status, generated by provider sync, or surfaced through tasks/alerts?
- What actions should a user take from this workspace beyond open donor / open agreement / review context?
- Does recurring need the same reusable record-list and review-drawer patterns as gift staging, reconciliation, Gift Aid, and appeals?

Migration read:

- Product posture: `Open`.
- Preserve the need to monitor recurring agreement health.
- Treat health/status review as the likely main operator-facing recurring surface in this version without reducing recurring itself to only an exceptions queue.
- Review the current exception-dashboard shape before recreating it in Twenty apps.

#### Scenario: Linking A Manually Entered Gift To A Recurring Agreement

Why it matters:

- Some gifts/installments may be entered manually or corrected manually, but still need to count as part of a recurring commitment.
- This overlaps with Manual Gift Entry; recurring should define what the association means after the gift is created/processed.

Current behavior:

- Manual Gift Entry can toggle "Part of a recurring agreement".
- When toggled, the user must select an existing recurring agreement before submitting.
- The selector searches the first loaded recurring agreements client-side by agreement id, contact id, and status.
- Submit includes `recurringAgreementId` in the gift payload.
- The manual-entry UI does not currently create a new recurring agreement.

Current target posture:

- The ability to associate a manually entered gift with an existing recurring agreement should survive.
- But generic manual gift entry should be treated as a supporting/fallback path for this, not automatically as the primary recurring-fulfillment workflow.
- For repetitive manually administered recurring payments, the more natural operator job may be agreement-led fulfillment capture:
  - start from an existing recurring commitment / expectation context,
  - carry agreement/default context through,
  - record real fulfillment efficiently,
  - without requiring speculative installment rows.
- This should stay distinct from saying that recurring requires pre-created expected installment records.
- The open product question is therefore not only where users can link a gift to an agreement, but what the primary manual recurring-fulfillment workflow should be.

Key metadata / UI / logic:

- Metadata: gift / staged gift relation to `recurringAgreement`.
- Metadata: `recurringAgreementId` in create-gift payload.
- UI: `RecurringAssociationsCard`.
- UI: `RecurringAgreementSelector`.
- Logic: `useManualGiftEntryController` loads agreements with `fetchRecurringAgreements({ limit: 100 })`.
- Logic: `handleToggleRecurring`, `handleSelectRecurring`, `createGiftForContact`.
- Logic: `buildGiftPayload`.

Open questions:

- Should users be able to link gifts to recurring agreements during manual entry, staging review, on the committed gift, or all three?
- Is generic manual entry only a fallback/supporting path, with agreement-led fulfillment capture the better primary workflow for repetitive manual recurring payments?
- Should a new recurring agreement be creatable from manual entry?
- What should happen to agreement totals, paid installment count, last paid date, next expected date, or status when a manually linked gift is processed?

Migration read:

- Product posture: `Open`.
- Preserve the ability to link gifts and recurring agreements.
- Treat the current manual-entry selector as useful supporting behavior, not necessarily the primary recurring-fulfillment workflow.
- Keep open a more agreement-led fulfillment capture model for repetitive manual recurring payments.
- Repeated non-integrated recurring fulfillment is one of the strongest current motivations for that lighter agreement-led workflow, because repeated generic manual entry plus per-gift association may be too clunky in practice.
- Keep lightweight duplicate-prevention / double-processing protection in view for manual recurring-fulfillment paths, even if the product avoids a heavy review workflow there.
- Review the current manual-entry selector and the post-processing agreement updates before migration.

#### Scenario: Linking An Integration-Created Gift To A Recurring Agreement

Why it matters:

- Recurring provider payments should arrive through integration intake and connect to the existing CRM agreement rather than creating orphaned gifts.
- Provider evidence is useful, but the user-facing model should remain the donor's agreement and installments.

Current behavior:

- Stripe checkout webhook intake enriches the gift payload with provider, provider payment id, provider context, and recurring status when a subscription is present.
- If Stripe metadata includes `recurringAgreementId` / `recurring_agreement_id`, the webhook sets `recurringAgreementId` on the gift payload.
- Stripe webhook can set `expectedAt` on the gift payload from metadata.
- Stripe webhook patches the linked recurring agreement with active status, provider refs/context, payment method, subscription/provider agreement id, and next expected date.
- GoCardless webhook handling currently logs received events; it does not yet implement comparable recurring-agreement updates.

Key metadata / UI / logic:

- Metadata: `recurringAgreement.provider`, `providerAgreementId`, `providerPaymentMethodId`, `providerContext`.
- Metadata: staged/committed gift provider fields and `recurringAgreement` relation.
- Metadata: `gift.recurringStatus` / `gift.recurringMetadata` snapshots currently exist on the gift object.
- UI: staged-gift queue and drawer can show recurring association.
- UI: recurring agreement workspace can show provider reference.
- Logic: `StripeWebhookService.enrichWithRecurringAgreement`.
- Logic: `RecurringAgreementService.updateAgreement`.
- Logic: `GoCardlessWebhookService` placeholder.

Open questions:

- What is the target Twenty-app / connector pattern for recurring provider events?
- Should recurring-related intake be handled differently depending on certainty class:
  - confident existing recurring-agreement match,
  - recurring-related but no existing agreement match,
  - or ambiguous / low-confidence recurring evidence?
- Which events create staged gifts, which update agreement state, and which are audit-only?
- How much provider context should be visible to users?

Migration read:

- Product posture: `Redesign`.
- Preserve provider-backed recurring linkage, but do not migrate the current Stripe-specific metadata contract as the final integration architecture.
- Drive intake behavior primarily from certainty in recurring-agreement match and other material processing uncertainties, not from abstract assumptions about "first" versus "later" recurring gifts.
- Lean working posture:
  - confident existing recurring-agreement match should usually take a lighter fulfillment path and bypass gift staging by default;
  - recurring-related intake with no confident existing agreement match should go through the controlled gift-staging path, with recurring evidence carried forward and safe agreement creation/linking happening later during processing once explicit reviewer intent exists if appropriate;
  - ambiguous or low-confidence recurring evidence should follow the normal review path, with weak hints preserved if useful but recurring treatment driven mainly by user/admin judgment rather than system automation.
- In the confident-match case, reserve gift staging for narrow hard-stop conditions such as:
  - unsafe agreement-linkage conflict,
  - inability to create a valid canonical gift,
  - or a hard duplicate/payment-level conflict.
- Treat softer recurring anomalies such as expectation mismatch, date drift, paused/canceled agreement with payment still arriving, or changed provider metadata primarily as recurring health/status signals rather than default staging triggers.
- When no confident agreement match exists, the purpose of staging is to resolve the remaining uncertainty and safely create/link the right canonical records; it should not force the user to repeat a weaker version of the same agreement-ID lookup the system has already attempted.

#### Scenario: Advancing Next Expected Date After Processing

Why it matters:

- A recurring agreement is operational only if the system can show what is expected next and whether expected installments have arrived.
- Updating that expectation at the wrong time can make the workspace falsely look healthy.

Current behavior:

- During staged-gift processing, if the staging record has `recurringAgreementId`, `GiftStagingProcessingService` calculates a next expected date from the staging record.
- After the gift is created and staging writeback succeeds, it patches the recurring agreement with `nextExpectedAt` and status `active`.
- If that patch fails, gift processing can still return processed and logs a warning.
- Stripe webhook can also update `nextExpectedAt` from metadata before the staged/committed gift lifecycle completes.

Key metadata / UI / logic:

- Metadata: `recurringAgreement.nextExpectedAt`.
- Metadata: `recurringAgreement.status`.
- Metadata: staging `recurringAgreementId`, `expectedAt`, provider context.
- UI: `RecurringAgreementList` health / overdue logic uses `nextExpectedAt`.
- Logic: `GiftStagingProcessingService.calculateNextExpectedAt`.
- Logic: `GiftStagingProcessingService.processGiftStaging` agreement update after mark-processed.
- Logic: `StripeWebhookService.enrichWithRecurringAgreement` agreement update.

Open questions:

- Which provider-driven changes should be allowed to update `nextExpectedAt` directly, and which should update only agreement health/status?
- How should the CRM reconcile provider schedule updates with its own fulfillment history when they disagree?
- How should recurring-integrity issues surface when gift fulfillment succeeds but agreement expectation update fails?
- Should totals/counts/last paid be updated in the same lifecycle step?

Migration read:

- Product posture: `Preserve + redesign lifecycle`.
- Preserve the user-facing expectation model.
- Treat `nextExpectedAt` as a real operator-facing field whose meaning must stay consistent with the recurring agreement as the CRM's commitment / expectation layer.
- The primary advancement moment should be safely recorded fulfillment against the agreement, not provider schedule updates on their own.
- Advancement should usually follow the agreement's schedule logic rather than the raw payment date; late fulfillment should not silently redefine the recurring schedule.
- Provider-driven updates should be a secondary path:
  - they may update expectation when they genuinely change what is now expected next, such as pause / cancel / completion or a provider-confirmed schedule change;
  - they should otherwise update health/status or reconciliation context rather than silently becoming the primary expectation driver.
- If CRM fulfillment history and provider schedule/state disagree, treat that as a reconciliation / health issue rather than silent background behavior.
- If gift fulfillment succeeds but agreement expectation update fails, treat that as a real recurring-integrity problem, not just harmless logging noise.
- Current leaning: redesign or substantially simplify the lifecycle before migrating the current update side effects, while preserving fulfillment as the primary expectation-advance trigger.

#### Scenario: Reviewing One-Shot Recurring Metadata

Why it matters:

- The recurring agreement schema currently includes fields for future policy, reporting, provider sync, receipts, defaults, and financial rollups.
- Some of these may be strategic; others may be premature metadata that should not shape the app UI yet.

Current behavior:

- The schema includes default appeal/fund id, default soft-credit JSON, Gift Aid declaration id, annual receipt status/sent-at/period/policy, total received amount, paid installment count, last paid at, canceled/completed/status-updated timestamps, and provider context.
- The client list API normalizes only part of the agreement record.
- The recurring workspace uses an even smaller subset.
- Some agreement state may be patched from provider intake or processing, but there is not yet a comprehensive recurring-agreement domain service.

Key metadata / UI / logic:

- Metadata: `defaultAppealId`, `defaultFundId`, `defaultSoftCreditJson`.
- Metadata: `giftAidDeclarationId`.
- Metadata: `annualReceiptStatus`, `annualReceiptSentAt`, `annualReceiptPeriod`, `annualReceiptPolicy`.
- Metadata: `totalReceivedAmount`, `paidInstallmentCount`, `lastPaidAt`.
- Metadata: `canceledAt`, `completedAt`, `statusUpdatedAt`.
- UI: most of these fields are not currently surfaced in the recurring agreement workspace.
- Logic: recurring API proxy accepts raw payloads and forwards to Twenty.

Open questions:

- Which current recurring-agreement metadata belongs in the lean recurring-core product, and which should remain ordinary record detail?
- Which fields are conceptually owned elsewhere (for example receipting, Gift Aid, broader coding/defaulting, provider/audit records) even if they currently sit on the recurring agreement object?
- Which fields look like one-shot or premature baggage because they do not clearly support commitment/expectation, fulfillment linkage, health/status, or explanation of state?
- Should annual receipt policy belong to recurring agreements, Gift Aid / receipting, donor preferences, or elsewhere?

Migration read:

- Product posture: `Simplify`.
- Do not blindly migrate the full one-shot recurring schema into app-specific UI or treat the current object shape as product truth.
- Classify current metadata into four buckets:
  - lean recurring-core metadata that directly supports commitment / expectation, fulfillment linkage, health/status, and enough provider evidence to explain state;
  - ordinary record detail that can remain on the agreement without shaping recurring workflow/UI by default;
  - metadata that conceptually belongs elsewhere;
  - and suspect / premature baggage that should not survive without stronger justification.
- Current leaning:
  - provider identifiers/context needed for matching and explaining state remain clearly relevant;
  - core lifecycle timestamps mostly remain valid where they explain agreement state;
  - a small number of fulfillment summary fields such as `lastPaidAt` are easier to justify than broader rollups;
  - annual receipt / Gift Aid fields do not currently look like recurring-core metadata;
  - default coding fields may remain as ordinary record defaults, but should not automatically become first-class recurring-product concepts.
- The recurring agreement record may remain broader than the lean recurring product, but only metadata that clearly supports the agreement's actual recurring role should be elevated into migrated recurring workflow/UI.

### 2.10 Reconciliation Workflow Summary

Reconciliation is the workflow for reviewing processor payouts or bank deposits, linking committed gifts to those payouts, identifying unmatched or pending items, explaining variances, and confirming finance review.

The current implementation is centered on the `giftPayout` object. It is a useful first surface for payout review, but it should not yet be treated as a complete automated reconciliation system.

The migration goal is to preserve the user need to compare deposited money with gifts in the CRM, while reviewing how payouts are created, how gifts are suggested/matched, how payout rollups are calculated, and how much of the current drawer-based workflow belongs inside a Twenty app versus ordinary Twenty records.

### 2.11 Reconciliation Use Cases

Use these user jobs as the basis for reviewing reconciliation during migration:

1. A user needs to record or receive a processor payout / bank deposit that should be reconciled against gifts.
2. A user needs to see payouts by status, source, date, reference, amount, unresolved state, pending staging count, and variance.
3. A user needs to open a payout and understand deposit gross, fees, net, matched net, variance, expected item count, matched gift count, and pending staging count.
4. A user needs to see committed gifts already linked to a payout.
5. A user needs to find likely committed gift candidates for a payout.
6. A user needs to link or unlink gifts to the payout when matching cannot be automated.
7. A user needs to record reconciliation status, variance reason, internal note, and confirmation timestamp.
8. A user needs the relationship between provider payout data, staged gifts, committed gifts, fees, receipts, and finance confirmation to be clear.

### 2.12 Reconciliation Scenario Reviews

Use the same scenario-review shape for reconciliation. Keep this as a first migration-reference pass; do not assume the current manual payout/drawer implementation is the target product.

Work through the reconciliation scenario reviews in this order unless there is a clear reason to deviate:

1. Representing a payout / deposit
2. Reviewing payout list and reconciliation status
3. Opening payout detail and summary
4. Linking committed gifts to a payout
5. Suggesting candidate gifts
6. Updating reconciliation status, note, variance, and confirmation
7. Reviewing reconciliation rollups and automation gaps

#### Scenario: Representing A Payout / Deposit

Why it matters:

- Reconciliation needs a parent record for the money that reached the bank or was paid out by a provider.
- Gifts can then be linked to that payout/deposit so finance review is anchored to a real settlement event.

Current behavior:

- `setup-schema.mjs` provisions a `giftPayout` object.
- Gift and gift-staging records can relate to `giftPayout`.
- The fundraising-service exposes create/list/get/update endpoints for gift payouts.
- The Add Payout drawer creates a payout manually.
- The current UI does not appear to import provider payout records automatically.

Key metadata / UI / logic:

- Metadata: `giftPayout.sourceSystem`, `payoutReference`, `depositDate`, `status`.
- Metadata: `depositGrossAmount`, `depositFeeAmount`, `depositNetAmount`, `expectedItemCount`.
- Metadata: gift relation to `giftPayout`.
- Metadata: gift-staging relation to `giftPayout`.
- UI: `AddPayoutDrawer`.
- UI: `ReconciliationView` add-payout action.
- Logic: `GiftPayoutController`.
- Logic: `GiftPayoutService.createGiftPayout`.
- Logic: `createGiftPayout` client API.

Open questions:

- Should payouts normally be entered manually, imported from providers/connectors, created from bank feeds, or all three?
- Should a payout/deposit be the only parent record for reconciliation, or do we need separate provider payout / bank deposit / reconciliation session concepts?
- Which payout fields are required for a lean migration?

Migration read:

- Product posture: `Open`.
- Preserve the payout/deposit parent concept.
- Review intake/creation of payouts before rebuilding a custom add-payout drawer.

#### Scenario: Reviewing Payout List And Reconciliation Status

Why it matters:

- Users need a finance operations queue: what payouts exist, which are unresolved, which have variance, and which still have staging work pending.

Current behavior:

- `ReconciliationView` loads up to 50 gift payouts.
- The workspace is titled "Payout review".
- It shows summary cards for payouts in view, unreconciled, pending staging, and variance.
- Users can filter by payout status and source system, search by reference or payout id, sort, paginate, refresh, open an Add Payout drawer, and open a Review drawer.
- Status filter options are pending, partially reconciled, reconciled, and variance.

Key metadata / UI / logic:

- Metadata: `giftPayout.status`.
- Metadata: `giftPayout.pendingStagingCount`.
- Metadata: `giftPayout.sourceSystem`.
- Metadata: `giftPayout.payoutReference`.
- UI: `ReconciliationView`.
- UI: `PayoutTable`.
- UI: summary metrics, status/source filter chips, search, sort, pagination.
- Logic: `useGiftPayouts`.
- Logic: `fetchGiftPayouts`.

Open questions:

- Which payout statuses are product-approved?
- Should pending staging be derived from staged gifts, stored on payout, or replaced by a direct filtered list of linked staged items?
- Should reconciliation share the same reusable list/review patterns as gift processing, recurring, appeals, and Gift Aid?

Migration read:

- Product posture: `Preserve + simplify`.
- Preserve payout review as an operational queue.
- Simplify around the core question: which payouts need finance review and what action should happen next?

#### Scenario: Opening Payout Detail And Summary

Why it matters:

- A payout reviewer needs to understand the settlement at a glance before linking, unlinking, confirming, or investigating variance.

Current behavior:

- Selecting a payout opens `PayoutDrawer`.
- The drawer shows payout reference/id, source system, deposit date, deposit net, matched net, calculated variance, expected items, matched gifts, pending staging, linked gifts, suggested gifts, editable status, variance reason, internal note, and confirmation state.
- Deposit net and matched net are calculated in UI helper functions from payout amount fields.
- The drawer does not appear to load staged gifts linked to the payout; it focuses on linked committed gifts and candidate committed gifts.

Key metadata / UI / logic:

- Metadata: deposit gross/fee/net.
- Metadata: matched gross/fee/count.
- Metadata: pending staging count.
- Metadata: variance amount / variance reason.
- UI: `PayoutDrawer` summary section.
- Logic: drawer-local `computeNet`.
- Logic: drawer-local variance calculation.

Open questions:

- Which payout summary numbers should be computed server-side, stored in Twenty fields, derived in the app, or imported from provider/bank data?
- Should payout detail include linked staged gifts as well as committed gifts?
- Should receipt status be part of reconciliation review or a separate gift/receipt workflow?

Migration read:

- Product posture: `Open`.
- Preserve a payout review drawer/detail surface.
- Review summary calculations and linked staging visibility before migration.

#### Scenario: Linking Committed Gifts To A Payout

Why it matters:

- The reconciliation decision is the relationship between settlement money and committed CRM gift records.
- Manual correction is needed when automation is unavailable or wrong.

Current behavior:

- Payout detail loads linked gifts by fetching gifts filtered by `giftPayoutId`.
- Users can type one or more gift IDs and link them to the payout.
- Users can unlink an already linked gift.
- Server link/unlink loops through gift ids and patches each gift with `giftPayoutId` or null.
- The link/unlink endpoint does not appear to update payout rollup fields itself.

Key metadata / UI / logic:

- Metadata: `gift.giftPayoutId` / gift relation to payout.
- UI: `PayoutDrawer` linked gifts section.
- UI: manual Gift IDs input.
- Logic: `fetchGifts({ giftPayoutId })`.
- Logic: `linkGiftsToPayout`, `unlinkGiftsFromPayout`.
- Logic: `GiftPayoutService.linkGifts`, `unlinkGifts`, `applyGiftPayout`.

Open questions:

- Should users ever need to type gift IDs, or should linking happen through record pickers / suggested matches / staging review?
- Should link/unlink trigger automatic payout rollup recalculation?
- How should bulk linking behave if one gift update fails?

Migration read:

- Product posture: `Simplify`.
- Preserve explicit link/unlink capability.
- Replace ID-entry as the primary user experience unless there is a clear operational reason to keep it.

#### Scenario: Suggesting Candidate Gifts

Why it matters:

- Reconciliation is slow if the user must know exact gift IDs.
- Suggested matches can reduce manual work, but poor matching can create finance errors.

Current behavior:

- Payout detail loads up to 200 committed gifts and filters to gifts with no `giftPayoutId`.
- Candidate suggestions are filtered client-side.
- If payout has an amount, gifts above that amount are excluded.
- If payout has a deposit date, gifts more than five days away are excluded.
- If source-system matches are found in `gift.intakeSource`, the candidate list is narrowed to those source matches.
- User can select suggested candidates and link selected gifts.

Key metadata / UI / logic:

- Metadata: gift amount, gift date, intake source, giftPayout relation.
- Metadata: payout deposit amount, deposit date, source system.
- UI: `PayoutDrawer` suggested gifts section.
- Logic: `PayoutDrawer.loadCandidateGifts`.
- Logic: `fetchGifts({ limit: 200, sort: 'giftDate:desc' })`.

Open questions:

- Is payout/gift matching based on provider payout id, source fingerprint, payment id, gift payout relation, amount/date/source heuristics, or a dedicated matching record?
- Should suggestions include staged gifts, committed gifts, or both?
- Should suggestions be computed server-side / in a connector rather than client-side over the first 200 gifts?

Migration read:

- Product posture: `Redesign`.
- Preserve the user need for suggested matching.
- Do not migrate the current client-side candidate heuristic as the final reconciliation logic.

#### Scenario: Updating Reconciliation Status, Note, Variance, And Confirmation

Why it matters:

- Finance users need to record where a payout stands and why a variance exists.
- The status should be meaningful and not drift away from the linked gifts / matched totals.

Current behavior:

- Payout drawer lets the user edit status, variance reason, and internal note.
- Saving sends a PATCH to the payout.
- If status is changed to `reconciled` and `confirmedAt` was empty, the UI writes `confirmedAt` as the current timestamp.
- The status update is independent from gift linking/unlinking.

Key metadata / UI / logic:

- Metadata: `giftPayout.status`.
- Metadata: `giftPayout.varianceReason`.
- Metadata: `giftPayout.note`.
- Metadata: `giftPayout.confirmedAt`.
- UI: `PayoutDrawer` edit form.
- Logic: `updateGiftPayout`.
- Logic: `PayoutDrawer.handleSave`.

Open questions:

- What statuses should the user set manually versus the system derive?
- Should confirmation be a deliberate "confirm reconciliation" action instead of a side effect of selecting status?
- Should variance reason be required when status is variance or when calculated variance is non-zero?

Migration read:

- Product posture: `Open`.
- Preserve finance review notes / variance explanation / confirmation.
- Review status and confirmation semantics before migration.

#### Scenario: Reviewing Reconciliation Rollups And Automation Gaps

Why it matters:

- Reconciliation can become misleading if stored payout rollups, linked gifts, staged gifts, and visual variance are not kept in sync.
- This is a good candidate for simplification: either make the derived numbers reliable, or reduce what the UI promises.

Current behavior:

- Payout metadata includes matched gross amount, matched fee amount, matched gift count, pending staging count, variance amount, variance reason, deposit gross/fee/net.
- The payout list/table and drawer display matched / variance / pending-staging fields.
- Link/unlink patches committed gifts but does not appear to recalculate payout matched fields.
- Payout drawer calculates a display variance from payout fields, not by summing currently linked gifts.
- Integration/provider payout creation is not yet a completed flow in the code reviewed for this pass.

Key metadata / UI / logic:

- Metadata: `matchedGrossAmount`, `matchedFeeAmount`, `matchedGiftCount`, `pendingStagingCount`, `varianceAmount`.
- Metadata: linked committed gifts via `giftPayoutId`.
- Metadata: staged gifts can link to payout via `giftPayoutId`.
- UI: `PayoutTable` deposit/matched/variance columns.
- UI: `PayoutDrawer` summary metrics.
- Logic: link/unlink API does not recalculate these rollups in the reviewed service.

Open questions:

- Which payout fields are source-of-truth, which are cached rollups, and which are display-only derived values?
- Should reconciliation process staged rows before linking committed gifts, or should payout review wait until gifts are committed?
- How should processor fees flow from staging/gift records into payout reconciliation?
- What is the minimum reliable reconciliation workflow for the first Twenty-app migration?

Migration read:

- Product posture: `Redesign`.
- Preserve the payout-to-gifts reconciliation concept.
- Review rollup ownership and provider/bank intake before migrating the current summary metrics as-is.

### 2.13 Appeals Workflow Summary

Appeals is the workflow for setting up fundraising appeals, coding gifts to those appeals, reviewing appeal performance, tracking solicitation baselines, and understanding whether an appeal is live, at risk, closed, or meeting goal.

The current implementation is more than a lookup list: it includes appeal create/edit, appeal browser, performance cards, appeal review drawer, solicitation snapshot logging, and links from gift intake / staging / committed gifts to an appeal.

The migration goal is to preserve appeals as a fundraising attribution and performance concept, while reviewing which performance values are stored, derived, or imported; how gifts update appeal totals; and whether the custom appeal browser should exist inside Twenty apps or be replaced partly by Twenty record pages / list views.

Important modelling direction for future sessions:

- treat the old `fundraising-service` appeal/fund schema as current-behavior prior art, not as the target app data model,
- treat `Fund` and `Appeal` as distinct core concepts:
  - `Fund` is the destination/designation/restriction of money,
  - `Appeal` is the fundraising effort / attribution bucket,
- use real relations from `gift` and `giftStaging` to `Fund` and `Appeal` rather than long-lived text placeholders,
- treat source/channel/send/page/platform detail as a likely `AppealSource` concern rather than the default job of appeal hierarchy,
- keep `Event` conceptually separate from `Appeal`,
- and do not assume a generic `CampaignMember` / `AppealRecipient` model is part of the core appeal design at this stage.

### 2.14 Appeals Use Cases

Use these user jobs as the basis for reviewing appeals during migration:

1. A user needs to create or edit an appeal with name, type, description, date window, default fund, goal, budget, and solicited target.
2. A user needs to code manually entered, staged, imported, or integration-created gifts to an appeal.
3. A user needs to browse appeals, search, filter, sort, and quickly identify live appeals, appeals needing attention, and appeals that reached goal.
4. A user needs to open an appeal and review raised amount, goal, gift count, donor count, response rate, cost per pound, last gift, default fund, dates, and health message.
5. A user needs to understand progress against a financial goal.
6. A user needs to log solicitation snapshots so response-rate review has a clear baseline.
7. A user needs to understand whether appeal performance metrics are current, derived, manually maintained, or stale.

### 2.15 Appeals Scenario Reviews

Use the same scenario-review shape for appeals. Keep this as a first migration-reference pass; do not treat the current appeal performance dashboard as product-approved reporting until the rollup/source-of-truth model is reviewed.

Work through the appeals scenario reviews in this order unless there is a clear reason to deviate:

1. Representing an appeal
2. Creating and editing appeal setup
3. Coding gifts and staged gifts to an appeal
4. Browsing appeals as an operational list
5. Reviewing appeal performance in the drawer
6. Logging and reviewing solicitation snapshots
7. Reviewing appeal rollups and performance metrics

#### Scenario: Representing An Appeal

Why it matters:

- Appeals are a core fundraising attribution object.
- The same appeal can appear in manual gift entry, staged gift review, committed gift records, reporting/performance review, and solicitation history.

Current behavior:

- In `fundraising-service`, `setup-schema.mjs` provisions an `appeal` object and related solicitation/default-fund metadata as part of the current product surface.
- In the current Twenty app, dedicated `Fund` / `Appeal` objects now exist and `gift` / `giftStaging` use real appeal relations rather than long-lived free-text appeal placeholders.
- Gifts and gift-staging records need first-class appeal attribution in the target app model.
- `fundraising-service` appeal API endpoints list, create, get, and update appeal records.

Key metadata / UI / logic:

- Target-model direction:
  - distinct core objects for `fund` and `appeal`,
  - real relations from `gift` and `giftStaging` to `appeal`,
  - future source/channel/execution detail likely living in a separate `AppealSource` object rather than child appeals by default,
  - no current assumption of a generic recipient/member junction model for ordinary appeals.
- Current service metadata prior art: `appealType`, `description`, `startDate`, `endDate`.
- Current service metadata prior art: `goalAmount`, `targetSolicitedCount`, `budgetAmount`.
- Current service metadata prior art: relation from appeal to default fund.
- Current service metadata prior art: relation from solicitation snapshot to appeal.
- Target app relation direction: relation from gift to appeal.
- Target app relation direction: relation from staged gift to appeal.
- UI: Twenty-native appeal object can be opened as an ordinary record/list outside the fundraising-service UI.
- Logic: `AppealController`.
- Logic: `AppealService`.
- Logic: `fetchAppeals`.

Open questions:

- What is the minimal appeal record needed for the first Twenty-app migration?
- Which appeal setup fields belong in a solid v1 `Appeal` object versus later performance/reporting slices?
- Should appeal performance / rollup fields remain on appeal, be calculated from gifts/snapshots, or move to a reporting layer?
- Should appeal type remain free text / select options, or a more explicit product model?

Migration read:

- Product posture: `Preserve + simplify`.
- Preserve `Appeal` as a core fundraising attribution object that is distinct from `Fund`.
- Preserve the need for gift/staging/solicitation links, but do not treat the current service schema as the target object shape.
- Review performance metadata before assuming every current appeal field should become custom-app UI or stored app metadata.
- Treat temporary free-text appeal capture in the current app as a transition concern to retire, not as the desired long-term product model.

#### Scenario: Creating And Editing Appeal Setup

Why it matters:

- Appeals need enough setup to support gift coding and later performance review.
- Setup should be lightweight; users should not have to maintain reporting-derived values by hand.

Current behavior:

- AppealsView has a "New appeal" action.
- Create and edit both use `AppealForm`.
- The form captures name, type, default fund, start date, end date, description, goal amount, goal currency, budget, budget currency, and target solicited count.
- Backend validation requires name on create; update must include at least one recognized appeal setup field.
- Backend validation normalizes money inputs and date strings before forwarding to Twenty.

Key metadata / UI / logic:

- Metadata: setup fields named above.
- UI: `AppealForm`.
- UI: `AppealsView` create / edit drawer modes.
- Logic: `createAppeal`, `updateAppeal`.
- Logic: `validateCreateAppealPayload`, `validateUpdateAppealPayload`.
- Logic: `useFundOptions` for default fund select.

Open questions:

- Which setup fields are essential during create versus edit later?
- Should a future `Appeal.defaultFund` relation be added only once actual defaulting behavior is designed, rather than as a passive field that implies unsupported behavior?
- Should budget/target/goal be required for particular appeal types?

Migration read:

- Product posture: `Preserve + simplify`.
- Preserve create/edit for appeal setup.
- Keep room for a future `defaultFund` relation, but do not treat it as part of the required first-pass app model unless the defaulting behavior is also designed.
- Prefer Twenty-native record controls / relation pickers where they cover the need cleanly.

#### Scenario: Coding Gifts And Staged Gifts To An Appeal

Why it matters:

- Appeal value depends on gifts being attributed consistently.
- Appeal coding overlaps with manual entry, staging detail edits, CSV import, integration intake, and committed gift records.

Current behavior:

- In `fundraising-service`, Manual Gift Entry exposes appeal selection through the shared `GiftDetailsForm`.
- In `fundraising-service`, gift staging drawer detail edits expose appeal selection through the same shared `GiftDetailsForm` path.
- In the current Twenty app, manual gift, staging, and committed-gift coding now use real appeal relations rather than free-text appeal placeholders.
- In the current Twenty app, `AppealSource` now exists as the optional child attribution object under `Appeal`.
- Create-gift payloads can include `appealId`.
- Create-gift payloads can now also include `appealSourceId`.
- Staged gift payload/update paths can include `appealId`.
- Staged gift payload/update paths can now also include `appealSourceId`.
- Batch processing carries staging row `appealId` into the committed gift payload.
- Batch processing now carries `appealSourceId` through when it remains compatible with the parent appeal.

Key metadata / UI / logic:

- Target-model direction: gift relation to appeal / `appealId`.
- Target-model direction: optional gift relation to appeal source / `appealSourceId`.
- Target-model direction: staged gift relation to appeal / `appealId`.
- Target-model direction: optional staged gift relation to appeal source / `appealSourceId`.
- Current modelling rule: `Appeal` remains the primary attribution/reporting bucket and `AppealSource` is an optional child attribution unit beneath it.
- Current modelling rule: selecting an `AppealSource` can populate a blank `Appeal`, but should not silently replace an already selected top-level `Appeal`.
- UI: `GiftDetailsForm`.
- UI: `ManualGiftEntry`.
- UI: `DrawerDetailsSection`.
- Logic: `buildGiftPayload`.
- Logic: `useGiftStagingDrawerController`.
- Logic: `GiftBatchProcessingService` row payload construction.
- Logic: `GiftService` preserves `appealId` in gift creation payload.

Open questions:

- Should appeal coding be defaulted from opportunity, recurring agreement, manual choice, import column, provider metadata, or appeal default rules?
- Should users correct appeal coding primarily in manual entry, staging review, gift record edit, or appeal workspace?
- What happens to appeal rollups when a committed gift's appeal is changed later?

Migration read:

- Product posture: `Preserve + simplify`.
- Preserve appeal attribution on gifts and staged gifts.
- Prefer real relations over long-lived text placeholders for appeal attribution in the Twenty app.
- Keep coding UI consistent with the future shared gift-detail / record-editing pattern.

#### Scenario: Browsing Appeals As An Operational List

Why it matters:

- Users need to find appeals and quickly understand which ones are active, performing, or need attention.
- This overlaps with the broader record-list consistency work.

Current behavior:

- AppealsView renders an "Appeal browser" workspace.
- It fetches up to 100 appeals sorted by name.
- It shows summary metrics for appeals in view, live now, raised total, and gifts tracked.
- Users can filter all / live now / needs attention / goal reached, search, sort, page, and open an appeal review drawer.
- Appeal cards show name, type, date range, health label, description, raised, gifts, goal pace, response rate, last gift, and review action.

Key metadata / UI / logic:

- Metadata: appeal setup fields plus performance/rollup fields.
- UI: `AppealsView`.
- UI: `SummaryBand`, `RecordWorkspaceControls`, `RecordResultsSurface`, appeal cards, `ActionDrawer`.
- Logic: `useAppealsBrowser`.
- Logic: `getAppealHealth`, `getAppealLifecycle`, `getGoalProgress`.

Open questions:

- Should the migrated Appeals app use a card browser, a reusable record list/table, Twenty's native list view, or a focused dashboard?
- Which filters and sort modes are product-critical versus local convenience?
- Should appeal health be a stored status, derived signal, or simply UI guidance?

Migration read:

- Product posture: `Open`.
- Preserve appeal discovery and review.
- Review the list/card/dashboard shape alongside the shared high-value component work before recreating this UI.

#### Scenario: Reviewing Appeal Performance In The Drawer

Why it matters:

- Appeal review should help users answer whether the appeal is working and what context explains performance.
- It should not imply precision if rollup metrics are not reliably maintained.

Current behavior:

- Opening an appeal shows review mode in a wide `ActionDrawer`.
- Drawer shows type chip, health chip/message, description, raised, goal, gifts, donors, progress bar, response rate, cost per pound, last gift, default fund, start/end dates, solicitation history, and actions to log snapshot or edit appeal.
- Goal progress is derived client-side from `raisedAmount.value / goalAmount.value`.
- Health is derived client-side from goal progress, date lifecycle, gift count, target solicited count, days until end, and whether goal has been reached.

Key metadata / UI / logic:

- Metadata: `raisedAmount`, `goalAmount`, `giftCount`, `donorCount`, `responseRate`, `costPerPound`, `lastGiftAt`.
- Metadata: appeal date window and target solicited count.
- UI: `AppealsView` review drawer.
- UI: `MetricCard`, `InlineAlert`, progress bar, operating-context section.
- Logic: `getGoalProgress`.
- Logic: `getAppealHealth`.
- Logic: `getAppealLifecycle`.

Open questions:

- Are raised/gift/donor/response/cost/last-gift metrics maintained by Twenty automation, fundraising-service code, imported reporting, manual updates, or currently just expected record fields?
- Which metrics must be trustworthy in the first migrated app?
- Should appeal review include a gift list / donor list / solicitation list, or link to native Twenty record tabs?

Migration read:

- Product posture: `Open`.
- Preserve performance review as a user goal.
- Review metric ownership and the drawer content before migrating the current performance UI.

#### Scenario: Logging And Reviewing Solicitation Snapshots

Why it matters:

- Response rate only makes sense when the system knows how many people were solicited.
- A snapshot history can preserve changing solicitation baselines without pretending there is one permanent target count.

Current behavior:

- `setup-schema.mjs` provisions `solicitationSnapshot`.
- Appeal review drawer loads snapshots for the selected appeal.
- The review drawer shows solicitation history table and a health alert for no baseline / stale snapshot / current snapshot.
- The user can open a "Log snapshot" drawer mode and submit solicited count, source, and captured-at timestamp.
- Backend validation requires count greater than zero and supplies captured-at default if omitted.

Key metadata / UI / logic:

- Metadata: `solicitationSnapshot.countSolicited`, `source`, `capturedAt`, `notes`.
- Metadata: relation from solicitation snapshot to appeal.
- UI: solicitation history section inside Appeals review drawer.
- UI: Appeals snapshot drawer mode.
- Logic: `useAppealSnapshots`.
- Logic: `fetchSolicitationSnapshots`, `createSolicitationSnapshot`.
- Logic: `validateCreateSolicitationSnapshotPayload`.

Open questions:

- Should solicitation snapshots remain a separate object or be replaced by campaign/segment membership data from Twenty?
- Should response rate use latest snapshot, target solicited count, a real audience segment, or another denominator?
- Is manual snapshot logging valuable enough for the first migrated app?

Migration read:

- Product posture: `Open`.
- Preserve the problem: response rate needs a denominator.
- Review snapshot object and manual logging workflow before migrating it as-is.

#### Scenario: Reviewing Appeal Rollups And Performance Metrics

Why it matters:

- Appeal performance can become misleading if raised amount, gift count, donor count, response rate, cost per pound, and last gift do not update from actual gift/solicitation activity.

Current behavior:

- Appeal metadata includes raised amount, gift count, donor count, response rate, cost per pound, and last gift timestamp.
- The client reads and displays these values.
- This pass did not find fundraising-service code that recalculates those appeal rollups when gifts are created, edited, processed, or re-coded.
- Gift creation/processing can set appeal relation on a gift, but appeal performance updates appear to be outside the reviewed local workflow.

Key metadata / UI / logic:

- Metadata: appeal performance/rollup fields named above.
- Metadata: gift relation to appeal.
- Metadata: solicitation snapshot records.
- UI: appeal browser cards and review drawer performance sections.
- Logic: client-side health/progress calculation uses values returned from Twenty.
- Logic: no local rollup recalculation path identified in this breadth-first pass.

Open questions:

- What owns appeal rollups in the migrated product: Twenty rollup fields, workflows, app code, backend service, warehouse/reporting, manual fields, or a smaller first version?
- Should rollup fields be displayed only when known fresh?
- Should appeal review initially focus on setup + linked gifts rather than performance metrics?

Migration read:

- Product posture: `Redesign`.
- Preserve appeal attribution and appeal review.
- Do not migrate the current performance dashboard without deciding how appeal metrics stay correct.

### 2.16 Gift Aid Workflow Summary

Gift Aid is a UK-specific fundraising capability for capturing declaration facts, deriving gift-level claimability, assembling claimable gifts into the current draft claim, reviewing blockers, and submitting/finalizing an internally reviewed claim batch.

Important migration constraint: Gift Aid is intended to be a **toggleable workspace-level capability that is off by default**. It is relevant for UK charities, but should not leak fields, UI, navigation, backend evaluation, claim assembly, or review burden into workspaces where the capability is not enabled.

That toggleable-capability model has been discussed and documented, but it is not fully implemented today. The current schema/setup script already provisions Gift Aid fields/objects, and the current service/UI already runs Gift Aid-oriented logic. Migration into Twenty apps should therefore treat capability activation as part of the Gift Aid product/architecture review, not as an afterthought.

The current product direction is documented in `docs/features/gift-aid.md` and related Gift Aid design notes. Treat those as design inputs for the migration, while still validating the as-built fundraising-service implementation before porting.

### 2.17 Gift Aid Use Cases

Use these user jobs as the basis for reviewing Gift Aid during migration:

1. An admin needs to enable Gift Aid for an eligible UK-charity workspace and keep it hidden/inactive elsewhere.
2. A user needs the system to record whether Gift Aid was requested and whether declaration facts were captured during intake/staging.
3. A user needs donor-level Gift Aid declaration history, including declaration date, coverage, source, wording/text version, status, revocation, and link to person.
4. A user needs final gift records to carry a current Gift Aid outcome: claimable, not claimable, or needs review, with reason code and linked declaration where applicable.
5. A user needs routine claimable gifts to enter the current draft claim automatically.
6. A user needs a current draft claim workspace showing included gifts, total/value, blocking issues, and submit readiness.
7. A user needs a needs-review view for Gift Aid gifts that require donor/declaration/gift correction.
8. A user needs to finalize a clean draft claim without implying it has been transmitted to HMRC, while still seeing latest submission progress separately.
9. A user needs already-submitted claims and claimed gifts protected from ordinary silent drift.
10. A user needs unresolved Gift Aid questions to be visible in normal donation operations without turning Gift Aid into a heavyweight case-management subsystem.

### 2.18 Gift Aid Scenario Reviews

Use the same scenario-review shape for Gift Aid. Keep this section as the migration-facing bridge between the current product review and the dedicated Gift Aid design docs.

Work through the Gift Aid scenario reviews in this order unless there is a clear reason to deviate:

1. Enabling Gift Aid as a workspace capability
2. Capturing Gift Aid request and declaration facts during intake/staging
3. Representing donor declaration history
4. Evaluating Gift Aid outcome on final gifts
5. Auto-assembling the current draft claim
6. Reviewing current draft claim and needs-review gifts
7. Submitting a claim batch
8. Protecting submitted claim history
9. Reviewing current implementation against the toggleable target

#### Scenario: Enabling Gift Aid As A Workspace Capability

Why it matters:

- Gift Aid is UK-specific and should not be a default global fundraising concern.
- If optional capability state is not first-class, Gift Aid will spread across core donation processing, metadata, navigation, forms, staging, gift records, claims, services, and tests in ways that are hard to untangle before the Twenty-app migration.

Current behavior:

- Gift Aid is documented as workspace-optional and off by default in the current working design notes.
- The current `setup-schema.mjs` provisions Gift Aid fields and objects as part of the broader fundraising schema setup.
- The current fundraising-service module wires Gift Aid policy/declaration/claim-batch services into gift creation and staging processing paths.
- The current fundraising-service app exposes a Gift Aid workspace in navigation.
- A single authoritative workspace-level capability state has been discussed in docs, but this pass has not verified a completed runtime toggle controlling provisioning, behavior, and visibility.

Key metadata / UI / logic:

- Metadata: Gift Aid fields on `Gift`.
- Metadata: Gift Aid capture fields on `GiftStaging`.
- Metadata: `GiftAidDeclaration` and `GiftAidClaimBatch` objects.
- UI: app navigation entry for Gift Aid.
- UI: `GiftAidClaimView`.
- Logic: `GiftAidPolicyService`, `GiftAidDeclarationService`, `GiftAidClaimBatchService`.
- Docs: `docs/features/gift-aid.md`.
- Docs: `docs/spikes/toggleable-capabilities-architecture.md`.

Open questions:

- What is the authoritative capability-state source in the Twenty-app migration?
- Is Gift Aid implemented as an internal Fundraising app capability, a separate installed Gift Aid app/module, or another packaging shape?
- Should Gift Aid metadata be conditionally provisioned when enabled, pre-provisioned but hidden/inactive, or split between always-present relations and optional capability-specific metadata?
- What exactly is hidden/inactive when Gift Aid is disabled?

Migration read:

- Product posture: `Redesign`.
- Preserve Gift Aid as an optional fundraising-owned capability.
- Do not migrate current always-provisioned / always-visible Gift Aid behavior without designing capability activation for Twenty apps.

#### Scenario: Capturing Gift Aid Request And Declaration Facts During Intake / Staging

Why it matters:

- Intake and staging can capture facts needed later, but staging should not become the authoritative claimability decision point while donor identity is still unresolved.
- This boundary keeps Gift Aid separable from core gift processing.

Current behavior:

- `GiftStaging` metadata includes Gift Aid request/capture fields.
- Gift create/update payloads support Gift Aid capture and outcome fields.
- `GiftAidPolicyService.normalizeGiftAidCapture` normalizes request/declaration capture fields and strips outcome fields before re-deriving outcome when required.
- Staging processing calls `GiftAidDeclarationService.ensureDeclarationForPayload`, persists a resolved declaration id back to staging if one was created/resolved, then calls `GiftAidPolicyService.applyGiftAidMetadata` at the processing boundary.
- Manual Gift Entry is not currently treated in this review as a complete Gift Aid declaration-capture UX.

Key metadata / UI / logic:

- Metadata: `giftStaging.giftAidRequested`, `giftAidDeclarationCaptured`, `giftAidDeclarationDate`, `giftAidCoverageScope`, `giftAidDeclarationSource`, `giftAidTextVersion`.
- Metadata: staging relation/link to `giftAidDeclaration`.
- UI: staging drawer / detail may surface Gift Aid-related detail where implemented.
- Logic: `GiftAidPolicyService.normalizeGiftAidCapture`.
- Logic: `GiftStagingProcessingService` Gift Aid declaration/evaluation boundary.
- Logic: `GiftAidDeclarationService.ensureDeclarationForPayload`.

Open questions:

- What Gift Aid prompt/capture should exist in manual gift entry, hosted donation intake, CSV/import mapping, integration intake, and staging review?
- Which capture facts belong on staging, and which should be captured directly as `GiftAidDeclaration` records?
- When Gift Aid is disabled, should intake payloads ignore Gift Aid fields, reject them, or preserve raw evidence without evaluation?

Migration read:

- Product posture: `Open`.
- Preserve capture of request/declaration facts.
- Keep authoritative claimability on final gifts / Gift Aid service, not staging rows.

#### Scenario: Representing Donor Declaration History

Why it matters:

- A declaration is donor-level history, while claimability is a gift-level conclusion.
- The system needs declaration existence, usability, applicability to gift date, wording/version, status, and revocation history without overloading `Person`.

Current behavior:

- `setup-schema.mjs` provisions `giftAidDeclaration`.
- Declaration records include status, status reason, declaration date, coverage scope, source, text version, revoked at, notes, and person relation.
- `GiftAidDeclarationService.ensureDeclarationForPayload` can create a declaration for a donor when a payload indicates Gift Aid requested + declaration captured and no declaration id is already present.
- The service may create an `active` or `insufficient` declaration depending on donor identity/address context.
- `GiftAidDeclarationService.resolveApplicableDeclaration` can respect an explicit declaration id or list declarations for a person and choose an applicable/recent declaration.

Key metadata / UI / logic:

- Metadata: `giftAidDeclaration.status`, `statusReason`, `declarationDate`, `coverageScope`, `source`, `textVersion`, `revokedAt`, `notes`.
- Metadata: relation from declaration to person.
- Logic: `GiftAidDeclarationService`.
- Logic: `GiftAidDonorContextService`.
- Logic: declaration lookup / applicability date / coverage logic.

Open questions:

- What is the first migrated UI for seeing, creating, revoking, or replacing declarations?
- Should declaration capture live in donor/person record UI, gift intake, staging review, a dedicated Gift Aid surface, or several targeted surfaces?
- What controlled values should be locked for status and coverage scope?

Migration read:

- Product posture: `Preserve + simplify`.
- Preserve dedicated declaration history.
- Review declaration-management UI before migrating service-only declaration creation.

#### Scenario: Evaluating Gift Aid Outcome On Final Gifts

Why it matters:

- Staff need a clear current operational outcome per gift.
- The outcome should be deterministic, reason-coded, and attached to the final gift rather than inferred indirectly from donor/declaration records every time.

Current behavior:

- `GiftAidPolicyService.applyGiftAidMetadata` derives status/reason/source and sets `giftAidLastEvaluatedAt`.
- Current statuses are `claimable`, `not_claimable`, and `needs_review`.
- Current derivation handles obvious non-individual donor cases, declaration donor mismatch, insufficient declaration, applicable declaration with sufficient individual/address context, requested-without-declaration, and incomplete donor data.
- Gift creation path calls declaration ensure + policy apply before creating the final gift.
- Staging processing calls declaration ensure + policy apply before creating the final gift.

Key metadata / UI / logic:

- Metadata: `gift.giftAidStatus`, `giftAidReasonCode`, `giftAidDecisionSource`, `giftAidDeclarationId`, `giftAidLastEvaluatedAt`.
- Logic: `GiftService.createGift`.
- Logic: `GiftStagingProcessingService.processGiftStaging`.
- Logic: `GiftAidPolicyService.applyGiftAidMetadata`.
- Logic: `GiftAidDeclarationService.resolveApplicableDeclaration`.

Open questions:

- Which evaluation triggers are in scope for the first migrated Twenty-app implementation: create only, edit, donor merge, donor address update, declaration update, gift reassignment, refund/reversal?
- Will evaluation run in a Twenty app function/action, a backend service, workflow automation, external connector, or another runtime?
- How should users trigger re-evaluation manually when they fix donor/declaration data?

Migration read:

- Product posture: `Preserve + simplify`.
- Preserve gift-level outcome/reason.
- Review runtime trigger coverage before assuming the current create/process hooks are enough.

#### Scenario: Auto-Assembling The Current Draft Claim

Why it matters:

- The intended happy path is automated: straightforward claimable gifts should appear in the current draft claim without staff manually assembling ordinary claims.
- The claim batch is also the grouping unit for review, export/submission handoff, totals, and history.

Current behavior:

- `GiftAidClaimBatchService.attachGiftToCurrentDraftIfClaimable` attaches a gift to the current draft if the authoritative payload is `claimable` and the gift is not already in a claim batch.
- The service lazily creates a draft `giftAidClaimBatch` when the first claimable gift needs one.
- It links gifts by patching `giftAidClaimBatchId`.
- It refreshes draft-batch summary from gifts in the batch.
- Gift creation and staging processing call the auto-attach path after successful gift creation.

Key metadata / UI / logic:

- Metadata: `giftAidClaimBatch.status`, `periodLabel`, `submittedAt`, `giftCount`, `totalAmount`, `hasBlockingIssues`, `blockingIssueCount`, `notes`.
- Metadata: gift relation/link to Gift Aid claim batch.
- Logic: `GiftAidClaimBatchService.getOrCreateCurrentDraftBatch`.
- Logic: `attachGiftToCurrentDraftIfClaimable`.
- Logic: `refreshDraftBatchSummary`.

Open questions:

- Should a workspace always have an open draft after enabling Gift Aid, or should it remain lazily created?
- Does removing a gift from a draft claim require reason/audit, or is unlink enough for first migration?
- How should `needs_review` gifts that were already in the draft be surfaced and blocked?

Migration read:

- Product posture: `Preserve + simplify`.
- Preserve automatic draft assembly for claimable final gifts.
- Keep unresolved gifts visible; do not silently auto-clean the draft.

#### Scenario: Reviewing Current Draft Claim And Needs-Review Gifts

Why it matters:

- Staff need one place to review the current claim, blockers, and excluded Gift Aid review items before submission/export.
- This workspace should be hidden when the capability is disabled.

Current behavior:

- `GiftAidClaimView` has current-claim and needs-review modes.
- `useGiftAidClaimWorkspace` loads the current draft claim, gifts in that batch, and gifts with `giftAidStatus=needs_review`.
- Current-claim summary shows draft/no draft, claimable gift count, claim value, and needs-review/blocking count.
- Needs-review mode shows unresolved gifts outside the current claim.
- Row review opens a drawer with donor, amount, gift date, status, reason, linked declaration id, explanatory copy, next-step copy, and optional remove-from-claim action.
- The UI can remove a gift from a claim by updating `giftAidClaimBatchId` to null through the gift update API.

Key metadata / UI / logic:

- UI: `GiftAidClaimView`.
- UI: `GiftAidClaimDrawer`.
- UI: `useGiftAidClaimWorkspace`.
- API: `fetchCurrentGiftAidClaimBatch`, `submitGiftAidClaimBatch`, `fetchGifts`, `updateGift`.
- Logic: gift list filtering by claim batch and Gift Aid status.

Open questions:

- Is current-claim / needs-review the right primary split for the migrated app?
- Should needs-review include staged gifts, final gifts, declarations, donor records, or only final gifts?
- What should the drawer actions be once Twenty-native gift/person/declaration pages are available?

Migration read:

- Product posture: `Preserve + simplify`.
- Preserve current draft review and needs-review concepts.
- Recreate the UI using shared list/drawer primitives where possible, while respecting Gift Aid-specific claim context.

#### Scenario: Finalizing A Claim Batch And Tracking Submission Progress

Why it matters:

- Internal finalization is the point where a draft claim becomes history and the included gifts should stop drifting through ordinary background re-evaluation.
- The product must avoid implying that internal finalization is the same as HMRC transmission unless that integration exists.
- Users still need list-level visibility of whether a finalized claim has actually been queued/responded/failed without reopening the batch record.

Current behavior:

- Backend exposes a current-draft workflow endpoint.
- Backend finalization refreshes draft summary, blocks if the draft has blocking issues, patches batch status to `finalized`, sets the internal finalization timestamp, reloads the finalized batch, and creates/returns the next draft.
- Submission queueing is a separate step that creates a `GiftAidClaimSubmission` history record from a finalized batch.
- Latest submission status can be summarized back onto the batch for list visibility, while full attempt history remains on the submission object.
- Current design docs explicitly say v1 batch finalization means internally finalized / ready for export or later HMRC automation, not actually sent to HMRC.

Key metadata / UI / logic:

- Metadata: claim batch status, finalized timestamp, and latest submission status summary.
- UI: current-claim / claim-batch finalization action plus separate submission queueing/follow-up surface.
- Logic: `GiftAidClaimBatchController`.
- Logic: `GiftAidClaimBatchService.submitBatch`.
- Logic: `useGiftAidClaimWorkspace.submitCurrentClaim`.

Open questions:

- Should first migration keep internal finalize + queue-submission only, add export, or wait for fuller HMRC-oriented data requirements?
- What submit-time snapshot/freeze is needed for audit reproducibility?
- Does the next draft need to be eagerly created after submission or lazily created on next claimable gift?

Migration read:

- Product posture: `Preserve + simplify`.
- Preserve review-before-finalize and no-HMRC-claim-unless-implemented.
- Keep batch lifecycle separate from submission-history lifecycle.
- Review submit-time freeze/snapshot requirements before expanding the lifecycle.

#### Scenario: Protecting Submitted Claim History

Why it matters:

- Claim history and included gifts need historical stability.
- Ordinary gift updates should not silently rewrite what was reviewed/finalized.

Current behavior:

- `GiftAidClaimBatchService.isSubmittedBatch` checks batch status.
- `GiftService.updateGift` can reject updates that touch frozen Gift Aid fields when the gift belongs to a submitted claim batch.
- Gift update also refreshes related draft-batch summaries when Gift Aid status/claim linkage changes.
- Docs note the current freeze is operationally useful through managed fundraising-service update paths, but is not a complete platform-level immutability guarantee if users edit underlying records through another Twenty path.

Key metadata / UI / logic:

- Metadata: gift claim-batch relation.
- Metadata: claim batch status.
- Logic: `GiftService.updateGift`.
- Logic: `GiftAidClaimBatchService.isSubmittedBatch`.
- Logic: `GiftAidClaimBatchService.refreshRelatedDraftBatchSummaries`.
- Docs: `docs/features/gift-aid-service-behaviour.md`.

Open questions:

- What exact gift/declaration/donor/claim fields are frozen on internal submission?
- How can Twenty-app/native-record edits respect the same freeze rule?
- Is submit-time snapshotting required for the first migration?

Migration read:

- Product posture: `Open`.
- Preserve the principle that submitted claim history should not silently drift.
- Review platform-level enforcement / snapshotting before relying on service-layer update guards alone.

#### Scenario: Reviewing Current Implementation Against The Toggleable Target

Why it matters:

- The target product is optional/off by default, but the current implementation is interwoven into gift processing paths and schema setup.
- Migration is the right moment to set a cleaner boundary rather than simply port all Gift Aid hooks into the core fundraising app.

Current behavior:

- Gift Aid metadata exists in core gift and staging schema today.
- Gift processing invokes Gift Aid policy/declaration/claim-batch services.
- Gift Aid has its own claim workspace UI.
- The dedicated service/module boundary is helpful, but behavior/visibility/provisioning are not yet proven to be controlled by one workspace-level capability state.

Key metadata / UI / logic:

- Provisioning: `setup-schema.mjs`.
- Behavior: `GiftService`, `GiftStagingProcessingService`, Gift Aid services.
- Visibility: navigation + `GiftAidClaimView` + Gift Aid-related form/record fields.
- Docs: `docs/spikes/toggleable-capabilities-architecture.md`.

Open questions:

- What is the smallest capability contract we need before migrating: settings record, app setting, install-state check, env bridge, or another workspace config?
- Which core gift paths call Gift Aid only when enabled?
- Should Gift Aid remain fundraising-owned but separately installable/packageable in Twenty apps?

Migration read:

- Product posture: `Redesign`.
- Preserve the bounded Gift Aid service/product layer.
- Before/while migrating, introduce a clear capability-state boundary covering provisioning expectation, backend behavior, and UI visibility.

### 2.19 Households / Donor Grouping Workflow Summary

Households are a supporting donor/person workflow for grouping individual contacts, managing shared mailing context, selecting a primary contact, and supporting future household-level rollups / stewardship.

This should not be migrated as a standalone fundraising queue.

The migration goal is to preserve the lightweight contact-grouping concept, keep individuals as the donor/source-of-truth for gifts, declarations, receipts, and consent, and decide where household membership actions belong in Twenty apps: likely as contact/person or household record actions that open a right-hand drawer.

The current product direction is documented in `docs/features/households.md`. Treat it as design input: some current guidance is broader than the fundraising-service implementation.

### 2.20 Households / Donor Grouping Use Cases

Use these user jobs as the basis for reviewing households during migration:

1. A user needs to see whether an individual donor belongs to a household without treating the household as the donor of record.
2. A user needs to create a simple household from one or more existing people.
3. A user needs to search for an existing household before creating a new one.
4. A user needs to add an existing person to an existing household.
5. A user needs to remove a person from a household.
6. A user needs to choose or update the household primary contact.
7. A user needs shared mailing fields: envelope name, formal/informal salutation, and mailing address.
8. A user needs an explicit action to copy household mailing address to a member when appropriate.
9. A user needs warning/context when selected contacts already belong to another household.
10. A user eventually needs household-level giving rollups and mail-dedupe context, but this should not displace person-level donor history.

### 2.21 Households / Donor Grouping Scenario Reviews

Use the same scenario-review shape, but keep this section compact unless Households becomes an active migration slice.

Work through the household scenario reviews in this order unless there is a clear reason to deviate:

1. Representing a lean household
2. Creating a household from existing people
3. Searching and opening an existing household
4. Managing household membership and primary contact
5. Managing shared mailing fields and address copy
6. Reviewing household rollups / future stewardship context
7. Positioning the household action in Twenty apps

#### Scenario: Representing A Lean Household

Why it matters:

- Households help mail/steward related people together, but the individual person remains the donor of record.
- If households become an alternative donor identity too early, giving history, Gift Aid, receipts, consent, dedupe, and merge behavior become harder to reason about.

Current behavior:

- `setup-schema.mjs` provisions a `household` object.
- `setup-schema.mjs` adds `mailingAddress` to person.
- Person membership is represented through a person-level `householdId`.
- Household metadata currently includes mailing/salutation fields and several rollup-looking fields.
- Backend household endpoints are thin proxies around Twenty records plus person membership patches.

Key metadata / UI / logic:

- Metadata: `household`.
- Metadata: person `householdId`.
- Metadata: person `mailingAddress`.
- Metadata: household `primaryContactId`, `envelopeName`, `salutationFormal`, `salutationInformal`, `mailingAddress`.
- Metadata: household rollup fields such as `lifetimeGiftAmount`, `lifetimeGiftCount`, `firstGiftDate`, `lastGiftDate`, `yearToDateGiftAmount`, `yearToDateGiftCount`, `lastGiftMemberName`.
- Docs: `docs/features/households.md`.

Open questions:

- Are households provisioned/enabled for all migrated fundraising workspaces, or treated as an optional supporting capability?
- Which household fields survive first migration, and which rollup fields wait for a proven rollup path?
- How does this interact with Twenty native people/company/account UX?

Migration read:

- Product posture: `Open` with current leaning `Preserve + simplify`.
- Preserve simple household grouping.
- Preserve the principle that individual people remain the source of truth for gifts, Gift Aid declarations, receipts, and consent.
- Review rollup metadata before migrating it as if totals are already maintained.

#### Scenario: Creating A Household From Existing People

Why it matters:

- Creating a household changes donor/person structure; it should be a deliberate user action, not silent automation.
- The user needs a fast guided flow from the contact/person context.

Current behavior:

- `HouseholdManager` has a create mode.
- User queues existing contacts by search/selection.
- UI defaults the household name from the first queued person's last name when possible.
- UI can build an envelope name from a selected person.
- UI can copy mailing address from the selected primary pending member into the new household form.
- On submit, client creates the household, then calls add-member for each pending member.
- The UI checks pending members for existing `householdId` values and loads duplicate/previous households for warning/context.

Key metadata / UI / logic:

- UI: `HouseholdManager`.
- UI: `HouseholdCreateSection`.
- UI: contact search used inside household manager.
- API: `createHousehold`.
- API: `addHouseholdMember`.
- Logic: `HouseholdService.createHousehold`.
- Logic: `HouseholdService.addMember`.

Open questions:

- In Twenty apps, should "create household" start from a person record action, a household record page, an intake/dedupe prompt, or more than one entry point?
- Should first migration allow creating empty households, or require at least one selected person as now?
- What warning/confirmation is required before moving someone from an existing household?

Migration read:

- Product posture: `Preserve + simplify`.
- Preserve guided household creation from existing people.
- Avoid automatic household inference as a first migration behavior.

#### Scenario: Searching And Opening An Existing Household

Why it matters:

- Users need to find an existing household before creating a duplicate and need a small management surface after selection.

Current behavior:

- `HouseholdManager` search mode calls `fetchHouseholds({ search, limit: 25 })`.
- Client also filters returned households by household name containing the search term.
- Opening a household loads both the household record and members.
- Selected household mode lets the user edit mailing/salutation fields, review members, add members, remove members, and copy address to members.

Key metadata / UI / logic:

- UI: `HouseholdSearchSection`.
- UI: `SelectedHouseholdSection`.
- API: `fetchHouseholds`, `fetchHousehold`, `fetchHouseholdMembers`.
- Logic: `HouseholdService.listHouseholds`, `getHousehold`, `listMembers`.

Open questions:

- Should household search be a drawer-local helper only, or should household records be browsable in a normal Twenty list too?
- Which search fields matter for first migration: name only, address, member name, external id, or other?

Migration read:

- Product posture: `Preserve + simplify`.
- Preserve find-before-create.
- Prefer Twenty native record search/list where it is enough; use a drawer flow for guided membership changes.

#### Scenario: Managing Household Membership And Primary Contact

Why it matters:

- Household membership affects mail dedupe, stewardship context, rollups, and future merge/dedupe decisions.
- The primary contact is useful for salutation/mailing defaults, but must not imply all individual donor identity moved onto the primary.

Current behavior:

- Members are people whose `householdId` equals the household id.
- Backend add-member patches `/people/:id` with `householdId`.
- If `makePrimary` is true, backend also patches household `primaryContactId`.
- Backend remove-member patches `/people/:id` with `householdId: null`.
- If the currently selected primary is removed in the UI, local selected household state clears the primary contact id.

Key metadata / UI / logic:

- Metadata: person `householdId`.
- Metadata: household `primaryContactId`.
- UI: member list and add/remove/member-primary controls in `SelectedHouseholdSection`.
- Logic: `HouseholdService.addMember`.
- Logic: `HouseholdService.removeMember`.

Open questions:

- Should "make primary" be a separate explicit action on an existing household member?
- Should removing the primary require selecting a new primary?
- What audit/history is required for membership changes during or after migration?

Migration read:

- Product posture: `Preserve + simplify`.
- Preserve derived membership from person relation.
- Tighten primary-contact UX before adding more complex person-person relationship graphs.

#### Scenario: Managing Shared Mailing Fields And Address Copy

Why it matters:

- Shared household mail is useful only if address and salutation are understandable and controlled.
- Address propagation can damage data if it silently overwrites an individual's correct address.

Current behavior:

- Household create/update supports envelope name, formal salutation, informal salutation, and mailing address.
- Selected household edit mode patches household mailing/salutation fields.
- UI exposes a copy-address action per member.
- Backend copy-address patches the selected person with the household mailing address and the household id.
- The current implementation is an explicit copy action, not automatic continuous sync.

Key metadata / UI / logic:

- Metadata: household `envelopeName`, `salutationFormal`, `salutationInformal`, `mailingAddress`.
- Metadata: person `mailingAddress`.
- UI: selected household edit form.
- UI: copy household address to member action.
- API: `copyHouseholdAddressToMember`.
- Logic: `HouseholdService.copyAddressToContact`.

Open questions:

- Should migrated v1 keep explicit copy-only behavior, prompt on household address update, or attempt automatic sync?
- How should we show when member address differs from household address?
- Which salutation/envelope fields are user-edited versus generated defaults?

Migration read:

- Product posture: `Preserve + simplify`.
- Preserve explicit user-controlled address copy for first migration.
- Do not introduce silent address sync before address/conflict UX is designed.

#### Scenario: Reviewing Household Rollups / Future Stewardship Context

Why it matters:

- Household rollups are valuable for stewardship and print-mail decisions, but they require trustworthy aggregation across members.
- Migration should not port display fields that look authoritative unless we know how they are maintained in Twenty apps.

Current behavior:

- `setup-schema.mjs` provisions household rollup-looking fields.
- A separate rollup-engine app has household rollup references.
- This breadth-first product review has not verified the current runtime pathway that keeps household rollups correct in the fundraising-service UI.

Key metadata / UI / logic:

- Metadata: household giving rollup fields.
- Related code: `apps/core/rollup-engine`.
- Related docs: `docs/features/households.md`.

Open questions:

- Are household rollups in scope for the first fundraising app migration?
- Are household totals maintained by Twenty, rollup-engine, app action/function, backend service, scheduled job, or report/query?
- Where should household-level giving context appear: person record, household record, donation list, receipt/mail workflows, or all of those?

Migration read:

- Product posture: `Open`.
- Preserve the product need for household giving context.
- Review rollup ownership before migrating rollup fields/display.

#### Scenario: Positioning The Household Action In Twenty Apps

Why it matters:

- Households crosses donor identity, person records, mail, Gift Aid boundary, dedupe, and rollups, but it is not itself the primary gift-processing workflow.
- The user experience should be a consistent action button -> right drawer flow where the action is contextual.

Current behavior:

- Current local shell exposes a `HouseholdManager` surface.
- Storybook includes a household drawer workflow example.
- Current implementation can search, create, select, edit, add/remove members, copy address, and review basic conflicts.
- It is not currently reviewed here as a native Twenty person-page action.

Key metadata / UI / logic:

- UI: `HouseholdManager`.
- UI/story: household drawer workflow.
- API: `services/fundraising-service/client/src/api/households.ts`.
- Backend: `HouseholdController`, `HouseholdService`, `PeopleService.getPerson`.

Open questions:

- What is the first migrated entry point: person record action, donor drawer action, household record action, donation-intake prompt, dedupe prompt, or another route?
- What belongs in a compact action drawer versus normal Twenty record pages?
- Does this need a dedicated app/workspace at all, or only record actions and record pages?

Migration read:

- Product posture: `Open` with current leaning `Preserve + simplify`.
- Treat household management as a supporting donor/person action until product review proves a dedicated workspace is needed.
- Keep the drawer/action interaction consistent with the broader migration UI principles.

### 2.19 Gift Record Layout Working Direction

This is a working product/layout reference for the canonical `Gift` record during migration. It is not a locked final UI contract.

Important caveats:

- the current `Gift` object is still pre-v1;
- more first-party fields will likely be added over time;
- customer custom fields also need to fit the model;
- so this should guide layout/control direction rather than become a permanent whitelist.

Why it matters:

- The `Gift` record should not become one flat editable object with no distinction between ordinary maintenance, sensitive correction, system-owned state, and future lifecycle actions.
- The layout should use Twenty-native field widgets where they work well, while reserving custom components for interpretation, signposting, controlled correction, and domain-specific workflows such as Gift Aid.
- Gift Aid is also organisation-specific. For some orgs, the cleanest product model may be to add or remove a `Gift Aid` tab through layout composition rather than forcing capability-specific visibility logic into one universal record layout.

Current behavior:

- The current `Gift` record page still has a stale split between an older `Gift Aid` tab and a newer `Gift Aid v2` tab.
- `Home` is currently mostly native fields.
- The newer `Gift Aid v2` direction uses three custom widgets:
  - `Gift Aid state`
  - `Gift Aid declaration`
  - `Gift Aid donor context`
- Current discussion also points toward a broader distinction between:
  - lower-risk/contextual maintenance fields,
  - sensitive correction fields,
  - system/downstream-owned fields,
  - explicit lifecycle-action territory.

Current working field pattern:

- Lower-risk / contextual examples:
  - `appeal` relation
  - `opportunity`
  - `fund` relation
- Sensitive correction examples:
  - donor/company linkage
  - donor/company identifying facts
  - amount
  - gift date
  - payment type
  - recurring linkage
  - Gift Aid-relevant facts
- System-/downstream-owned examples:
  - derived Gift Aid outcome fields
  - Gift Aid claim-batch linkage
  - source/provenance/provider identifiers
- Transitional compatibility examples to retire from the target model:
  - legacy free-text appeal/source placeholders where real `appeal` / `appealSource` relations are the intended long-term fit
- Future lifecycle-action territory:
  - refund
  - chargeback
  - void / reversal
  - failed payment after creation

Important nuance:

- field sensitivity is only half the model;
- the other half is the gift's downstream posture:
  - no downstream use yet
  - partially used downstream
  - clearly relied on downstream
- downstream posture should influence how open or controlled the sensitive-correction path feels, rather than relying only on a static field list.

Current working layout direction:

- `Home`
  - compact summary / signposting surface
  - record-level signal for downstream posture or editing posture
  - small set of everyday high-signal fields
- `Details`
  - native `FIELDS` widgets
  - ordinary record maintenance
  - main growth home for contextual fields and future custom fields
- `Gift Aid`
  - optional layout-driven tab rather than a universally forced surface
  - best current direction is one refined tab built from the `v2` widgets, not parallel old/new tabs
- `Corrections`
  - keep conceptual for now; do not force a full correction subsystem into the first migration pass before the controlled-correction behavior is clearer
- `Lifecycle` / `History`
  - also conceptual for now; use explicit actions rather than quiet field edits when those workflows become real

Use of Twenty primitives:

- Prefer native `FIELDS` widgets where the job is ordinary data maintenance and extensibility matters.
- Prefer custom front components where the job is:
  - interpreted/derived operational state,
  - downstream posture signalling,
  - controlled correction,
  - Gift Aid review logic,
  - future lifecycle actions.

Open questions:

- Should `Home` remain mostly native in the first migration pass, or should it gain one compact custom summary/signposting block?
- Which core fields belong on `Home` versus `Details` in the first workable version?
- How early should downstream posture become visible on the record if the full correction/lifecycle model is not yet built?
- Should non-UK or Gift Aid-disabled orgs simply omit the `Gift Aid` tab through layout composition rather than relying on runtime conditional visibility inside a shared record layout?

Migration read:

- Product posture: `Redesign` with current leaning:
  - native fields for ordinary maintenance,
  - custom widgets for operational interpretation,
  - optional domain tabs such as `Gift Aid` composed at layout level when relevant.
- Do not preserve the stale `Gift Aid` / `Gift Aid v2` split.
- Use the `Gift` record as a place to establish a cleaner separation between ordinary maintenance, sensitive correction, and service-/downstream-owned state, even if the full corrections/lifecycle model lands later.
