# Fundraising To Twenty Apps Code Review

Updated: 2026-04-07
Status: Working guide (`stage-2`)
Purpose: Review the current fundraising-service codebase to decide what is worth lifting, what should be refactored first, and what should not be migrated as-is.

## 1. Review Method

Review code against `PRODUCT_REVIEW.md`, not in isolation.

For each major workflow:

- identify the product use cases it currently supports,
- inventory the metadata, UI, and logic that implement those use cases,
- separate reusable product behavior from current local implementation shape,
- identify what can be lifted, what should be refactored first, and what should be redesigned before migration.

Code review should not decide product value by itself. Product review decides whether a use case matters; code review decides whether the current implementation is a good migration source.

## 2. Major UI / Product Areas

- Shared UI layers.
- Workflow-specific pages.
- Drawers and detail surfaces.
- State and data shaping.
- Storybook assets.

## 3. Gift Processing / Staging

Reference use cases: `PRODUCT_REVIEW.md` section `2.2 Gift Processing / Staging Use Cases`.

### 3.1 First-Pass Finding

Gift processing / staging is materially more defined than a simple list or temporary holding table.

Current implementation already has:

- dedicated `giftStaging` and `giftBatch` metadata objects,
- explicit staging-to-committed-gift lifecycle,
- donor snapshot fields alongside confirmed donor/company links,
- status fields for processing, validation, and dedupe state,
- processing diagnostics, error detail, raw payload, and provider context,
- queue/list UI with active-work filtering, search, sort, batch scope, and record actions,
- review drawer with donor, details, and audit views,
- record-level processing and batch-level processing runs,
- batch donor-match runs and selected create-donor runs in backend logic.

The migration review should assume the workflow is a real product capability and should not collapse it into a raw Twenty object list.

### 3.2 Metadata Inventory

Primary setup source:

- `services/fundraising-service/scripts/setup-schema.mjs`

Key objects:

- `giftStaging`: temporary staging record for gifts prior to processing.
- `giftBatch`: admin-defined batch of gifts for review, bulk actions, and processing.

Key `giftStaging` fields:

- Intake/source: `source`, `intakeSource`, `sourceFingerprint`, `externalId`.
- Amount/date/payment: `amount`, `feeAmount`, `paymentMethod`, `giftDate`, `expectedAt`.
- Status: `validationStatus`, `dedupeStatus`, `processingStatus`, `autoProcess`.
- Donor evidence: `donorFirstName`, `donorLastName`, `donorEmail`, `donorAddress`, `organizationName`.
- Provider evidence: `provider`, `providerPaymentId`, `providerContext`.
- Gift Aid capture: `giftAidRequested`, `giftAidDeclarationCaptured`, `giftAidDeclarationDate`, `giftAidCoverageScope`, `giftAidDeclarationSource`, `giftAidTextVersion`.
- Diagnostics/audit: `notes`, `errorDetail`, `processingDiagnostics`, `rawPayload`.
- Intent/coding: `giftIntent`, `isInKind`, `inKindDescription`, `estimatedValue`.

Key `giftStaging` relations:

- `giftBatch`, `donor`, `company`, `opportunity`, `fund`, `appeal`, `recurringAgreement`, `gift`, `giftAidDeclaration`, `giftPayout`.

Key `giftBatch` fields:

- Source/status: `source`, `status`, `trustPosture`.
- Expected/actual counts and amounts: `expectedCount`, `expectedAmount`, `totalCount`, `processedCount`, `totalAmount`, `processedAmount`.
- Notes: `notes`.

Migration implication:

- the metadata is not just storage; it encodes the product boundary between intake, review, processing, and committed gifts,
- several fields likely need rigorous review because they were created speed-first, but the overall staging/batch model is a serious migration source.

### 3.3 Backend Inventory

Primary files:

- `services/fundraising-service/src/gift/gift.service.ts`
- `services/fundraising-service/src/gift/gift.types.ts`
- `services/fundraising-service/src/gift/gift-payload.util.ts`
- `services/fundraising-service/src/gift-staging/gift-staging.controller.ts`
- `services/fundraising-service/src/gift-staging/gift-staging.service.ts`
- `services/fundraising-service/src/gift-staging/gift-staging-processing.service.ts`
- `services/fundraising-service/src/gift-staging/domain/staging-record.model.ts`
- `services/fundraising-service/src/gift-staging/dtos/gift-staging-list.dto.ts`
- `services/fundraising-service/src/gift-staging/mappers/domain-to-twenty.mapper.ts`
- `services/fundraising-service/src/gift-staging/mappers/twenty-to-domain.mapper.ts`
- `services/fundraising-service/src/gift-staging/utils/payload-merger.util.ts`
- `services/fundraising-service/src/gift-batch/gift-batch.controller.ts`
- `services/fundraising-service/src/gift-batch/gift-batch.service.ts`
- `services/fundraising-service/src/gift-batch/gift-batch-processing.service.ts`
- `services/fundraising-service/src/gift-batch/gift-batch-processing.logic.ts`
- `services/fundraising-service/src/gift-batch/gift-batch-donor-match.service.ts`
- `services/fundraising-service/src/gift-batch/gift-batch-donor-match.logic.ts`

Current behavior:

- `GiftService.normalizeCreateGiftStagingPayload` prepares staged payloads without resolving contacts immediately.
- `GiftService.buildProcessingDiagnostics` computes eligibility, blockers, warnings, and identity confidence.
- `GiftStagingService.stageGift` creates the staging record, stores the raw payload, and sets initial processing/dedupe status.
- `GiftStagingService.listGiftStaging` exposes cursor-based list access with status, intake source, search, sort, recurring agreement, and batch filters.
- `GiftStagingService.updateGiftStagingPayload` merges user edits back into both staging fields and the stored raw payload.
- `GiftStagingProcessingService.processGift` is the record-level processing boundary.
- `GiftStagingProcessingService.canProcess` currently treats `ready_for_process` and `process_failed` as the only processable states; reviewer intent is the main gate.
- `GiftBatchProcessingService` supports async batch processing runs with progress, outcomes, batch status updates, hybrid batch create, row fallback, retry/resume semantics, and explicit row fallback for recurring-linked rows until batch parity exists.
- `GiftBatchDonorMatchService` supports async donor-match runs and backend create-donor runs for selected staging rows.

Important migration observation:

- the backend is already split between product-level staging concepts and current runtime mechanics,
- the product concepts are likely worth carrying forward,
- the in-memory run tracking and polling model should be reviewed before recreating it in Twenty apps.

### 3.4 UI Inventory

Primary files:

- `services/fundraising-service/client/src/components/gift-staging/StagingQueue.tsx`
- `services/fundraising-service/client/src/components/gift-staging/StagingQueueSummary.tsx`
- `services/fundraising-service/client/src/components/gift-staging/StagingQueueTable.tsx`
- `services/fundraising-service/client/src/components/gift-staging/GiftStagingDrawer.tsx`
- `services/fundraising-service/client/src/components/gift-staging/DrawerReviewSection.tsx`
- `services/fundraising-service/client/src/components/gift-staging/DrawerDetailsSection.tsx`
- `services/fundraising-service/client/src/components/gift-staging/DrawerStatusSummary.tsx`
- `services/fundraising-service/client/src/components/gift-staging/stagingQueueUtils.ts`
- `services/fundraising-service/client/src/components/gift-staging/processingDiagnosticsUtils.ts`
- `services/fundraising-service/client/src/hooks/useStagingQueueController.ts`
- `services/fundraising-service/client/src/hooks/useGiftStagingDrawerController.ts`
- `services/fundraising-service/client/src/api/giftStaging.ts`
- `services/fundraising-service/client/src/api/giftBatches.ts`

Current behavior:

- `StagingQueue` composes the queue summary, table, pagination, and drawer.
- `StagingQueueSummary` owns status metrics, batch scope/workspace scope, filters, search, sort, column toggles, batch inbox, batch diagnostics, batch donor-match runs, and batch processing runs.
- `StagingQueueTable` renders the active queue with donor state, amount, gift date, eligibility/next step, context, and record actions.
- `GiftStagingDrawer` provides a three-tab review surface: donor, details, and audit.
- `DrawerReviewSection` handles donor review, donor search, linked donor display, possible matches, and staged donor detail editing.
- `DrawerDetailsSection` handles staged gift detail review/editing and uses the shared `GiftDetailsForm` for core fields.
- `DrawerStatusSummary` provides the drawer's immediate status, donor, amount, date, review summary, and action feedback.
- `useStagingQueueController` keeps the active-work model: default excludes processed rows, supports batch scope, high-value and duplicate filters, active-work metrics, pagination, donor-match run polling, and batch process run polling.
- `useGiftStagingDrawerController` handles save, mark-ready, process-now, and donor assignment actions.

Important migration observation:

- the queue and drawer already encode the intended user workflow clearly,
- some UI structure is still local and dense, especially the summary/control area,
- this should inform shared record-list/view and review-drawer requirements rather than be blindly recreated.

### 3.5 Use-Case Mapping

| Product use case | Current support | Migration read |
| --- | --- | --- |
| Controlled holding area for incoming gifts | Dedicated `giftStaging` object, raw payload, statuses, explicit processing boundary, relation to committed `gift`. | Preserve the first-class staging concept. Review field shape, not the existence of the layer. |
| Identify what prevents safe processing | `processingDiagnostics`, `errorDetail`, status fields, queue review summaries, drawer audit/review summaries. | Preserve user-actionable blockers/warnings; simplify how diagnostics are grouped and displayed if needed. |
| Confirm, change, or create the correct donor | Donor snapshot fields, donor/company links, dedupe diagnostics, drawer donor review/search/assignment, batch donor-match and create-donor backend runs. | Preserve donor resolution as first-class. Validate whether create-donor run needs UI exposure in migration. |
| Detect duplicates or conflicts before commit | `dedupeStatus`, dedupe diagnostics in raw payload, donor-match logic, source fingerprint/external id fields, duplicate indicators in queue/drawer. | Preserve duplicate visibility. Review whether dedupe evidence should remain embedded in raw payload or become a clearer diagnostics contract. |
| Review and correct core gift details | Drawer details form updates amount/date/fund/appeal/opportunity/intent/in-kind/notes and merges edits back into raw payload. | Preserve pre-commit correction. Review field grouping and the future shared `GiftDetailsForm` boundary. |
| Decide whether a single gift is ready | `ready_for_process` status, mark-ready action, process-now action, processing guard in backend. | Preserve explicit reviewer decisioning. Review whether status naming and validation semantics should be tightened. |
| Work through staged gifts as a queue | Active-work statuses, filters, search, sort, pagination, queue table, drawer selection, processed exclusion by default. | Preserve queue operating model. Align with the shared record-list/view requirements before rebuilding in Twenty apps. |
| Switch from workspace review to batch-level work | `giftBatch` object/relation, batch inbox, batch scope filter, batch diagnostics, back-to-workspace action. | Preserve batch scope as a first-class mode. Avoid treating it as only a hidden filter. |
| Trigger record-level or batch-level processing actions | Record-level process/retry, batch process/resume, async runs, progress/outcomes, batch status updates. | Preserve deliberate actions and outcome visibility. Review runtime model for Twenty apps before recreating in-memory runs. |
| Investigate failed or blocked records | `process_failed`, `errorDetail`, diagnostics, raw payload audit tab, retry path, batch fallback error persistence. | Preserve investigation path but keep raw/debug detail secondary. Tighten user-actionable next steps during migration. |

### 3.6 Refactor / Redesign Candidates

Refactor first:

- `StagingQueueSummary` is carrying many product concerns in one component: metrics, scope, batch inbox, filters, fields, diagnostics, and run status.
- Donor-match/create-donor backend behavior is richer than the current UI exposure; clarify intended user flow before porting.
- Dedupe diagnostics are partly in raw payload and partly in processing diagnostics / status fields; define the migration diagnostics contract.
- Status naming and semantics should be reviewed before migration: `pending`, `processing`, `ready_for_process`, `process_failed`, `processed`, `validationStatus`, and `dedupeStatus` overlap in user-facing meaning.
- Batch run state is currently in-memory; this may not be acceptable for a Twenty-app migration if run state must survive restarts or be shared across workers.

Likely preserve:

- staging as a review boundary before committed gifts,
- batch as an operational scope,
- donor resolution as a first-class review task,
- pre-commit gift detail editing,
- explicit mark-ready and process actions,
- queue-to-drawer operating model,
- secondary audit/raw-payload access.

Open:

- whether the future implementation is a single shared record-list/view component, a headless list model plus staging-specific renderer, or a composition contract,
- whether batch donor creation should be exposed as a user-facing workflow in the migrated UI,
- whether current Gift Aid and receipt metadata belong in the main staging review flow or should become secondary capability modules,
- how much of the batch runner should remain in fundraising-service backend logic versus move into a Twenty-app-compatible runtime/service layer.

## 4. Integration Intake Layer

Reference product review: `PRODUCT_REVIEW.md` section `2.3 Integration Intake And Staging`.

### 4.1 First-Pass Finding

Integration intake is present, but uneven.

Current implementation includes:

- a service-owned Stripe webhook controller and service,
- a skeleton GoCardless webhook controller and service,
- a generic gift creation path that accepts source/provider fields and may stage then auto-process,
- trust-level and auto-processing logic keyed from `intakeSource`,
- source/provider metadata on `giftStaging`,
- docs that still describe an n8n-normalized Stripe flow rather than the current service-owned Stripe webhook handler.

The migration review should not treat the current Stripe implementation as the full integration model. It is useful evidence for source mapping, provider context, trust decisions, and recurring-agreement updates, but the target Twenty-app integration shape still needs explicit review.

### 4.2 Backend Inventory

Primary files:

- `services/fundraising-service/src/stripe/stripe-webhook.controller.ts`
- `services/fundraising-service/src/stripe/stripe-webhook.service.ts`
- `services/fundraising-service/src/stripe/stripe.module.ts`
- `services/fundraising-service/src/gocardless/gocardless-webhook.controller.ts`
- `services/fundraising-service/src/gocardless/gocardless-webhook.service.ts`
- `services/fundraising-service/src/gocardless/gocardless.module.ts`
- `services/fundraising-service/src/gift/gift.controller.ts`
- `services/fundraising-service/src/gift/gift.service.ts`
- `services/fundraising-service/src/gift/gift.validation.ts`
- `services/fundraising-service/src/gift/gift.types.ts`
- `services/fundraising-service/src/auth/auth.utils.ts`

Current behavior:

- `StripeWebhookController` handles `POST /webhooks/stripe` and passes raw body plus `stripe-signature` into `StripeWebhookService`.
- `StripeWebhookService` validates the Stripe signature, only handles `checkout.session.completed`, maps the checkout session into a gift payload, and calls `GiftService.createGift`.
- Stripe payload mapping includes amount, gift date, payment method, `externalId`, `intakeSource: stripe_webhook`, `sourceFingerprint`, `autoProcess`, donor contact evidence, `provider: stripe`, `providerPaymentId`, and `providerContext`.
- Stripe recurring metadata can update a linked `RecurringAgreement` and add `recurringAgreementId` / `expectedAt` to the gift payload.
- `GoCardlessWebhookController` handles `POST /webhooks/gocardless`, but `GoCardlessWebhookService` currently only logs summarized event data and does not create or update staged gifts.
- `GiftService.createGift` is the shared create path for Manual Gift Entry and Stripe webhook intake; when staging is enabled it stages first and may continue into committed gift creation based on diagnostics and `autoProcess`.
- `GiftService.resolveTrustLevel` treats `manual_ui` as high trust, `csv_import` as low trust, and all other sources as medium trust.
- `isAuthExemptRequest` exempts all `/webhooks` routes from normal fundraising-service auth, so provider-level signature validation and replay protection become part of the integration contract.

Important migration observation:

- the source/provider metadata and trust/auto-process decisioning are likely reusable product concepts,
- the exact controller/service-owned webhook shape may not be the right target for Twenty apps,
- GoCardless is not yet implemented enough to validate the intended direct-debit lifecycle,
- idempotency/replay/audit need closer review before migration because the current model mainly uses payload/source fields rather than a first-class intake-event log.

### 4.3 Refactor / Redesign Candidates

Refactor first:

- Align `docs/INTEGRATIONS.md` with the current implementation or the intended target: it still describes Stripe webhook to n8n normalizer to `/gifts`, while the code has a direct Stripe webhook service.
- Separate reusable integration-intake product behavior from Stripe-specific first implementation details.
- Decide whether `autoProcess` should be controlled by per-record payload flags, provider/channel policy, org/admin settings, or a combination.
- Define the idempotency contract for provider retries before migrating provider intake into Twenty apps.
- Decide whether a first-class webhook/intake event log is needed for replay, audit, and support.
- Review Twenty apps integration/connector patterns before preserving fundraising-service webhook controllers as the target implementation.

Likely preserve:

- source/provider evidence on staged gifts,
- provider payment identifiers for dedupe/reconciliation,
- provider context as secondary/audit metadata,
- signature validation for provider-owned webhook paths,
- trust-aware auto-processing as a product concept, if retained after product review.

Open:

- whether Stripe remains service-owned, moves behind a connector layer, or becomes a Twenty-app-owned integration path,
- how GoCardless events should map into staging and recurring-agreement state,
- whether n8n remains a pilot connector option or is superseded by service/app-owned connectors,
- whether integration health needs a user/admin surface during the first migration slice.

## 5. Portable / Refactor First / Do Not Migrate As-Is

- Portable now.
- Refactor first.
- Do not migrate as-is.
- Open questions.

## 6. Code Risks

- Duplication.
- Local shell assumptions.
- Page-specific styling.
- Overgrown workflow components.
- Areas likely to fight Twenty apps.

## 7. Recommendations

- What to carry forward.
- What to redesign before migrating.
- What to leave behind.
