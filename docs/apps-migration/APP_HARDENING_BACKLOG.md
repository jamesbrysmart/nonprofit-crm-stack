# Twenty App Hardening Backlog

Updated: 2026-10-26
Status: Working note
Purpose: Track technical hardening for the current app. Marketplace sequencing, evidence and product boundaries are owned by [MARKETPLACE_READINESS.md](MARKETPLACE_READINESS.md).

Use this alongside:

- [REVIEW_POSTURE.md](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/REVIEW_POSTURE.md)
- [APP_HARDENING_REVIEW_RUBRIC.md](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/APP_HARDENING_REVIEW_RUBRIC.md)

This note is not a full findings report.

The 13 October current-code review supersedes the May refactor order. Earlier notes below remain context only where current source still supports them; do not repeat already completed extractions or treat old `fix now` labels as release requirements.

## 1. Current Backlog Ordering

1. Batch A implementation/unit checks complete: unclassified batch creation retries removed (R1), known recovery IDs retained, and claim pagination fixed (R2). Normal build/runtime validation remains.
2. Validate the implemented Stripe replay protection (R3) against Twenty with concurrent deliveries.
3. Make integration lifecycle tests safe (R4), check app/test TypeScript projects, and add missing financial failure-path tests (R5).
4. Address relevant native transport/authority/schema changes identified in the July–October compatibility map.
5. Resolve public fixture seeding, diagnostic exposure and mock submission presentation (R6) with explicit review of installation/product effects.
6. Validate the release in a clean local workspace; defer layout conversion, broad component refactors and refresh-policy expansion unless a concrete regression requires them.

See [readiness sections 7–9](MARKETPLACE_READINESS.md#7-bounded-tooling-compatibility-assessment)
for the original findings and release gates. R1 and R2 were reproduced and
corrected with unit evidence. R3 now uses deterministic record IDs and has
concurrent replay coverage with test doubles. Real-Twenty validation remains
open. The [product findings below](#6-product-findings-from-testing) track
related workflow questions for review.

### Deferred Integration Lifecycle Validation

As of 2026-10-26, the TypeScript configuration and standalone CLI integration
bootstrap have been migrated. Source-and-test typecheck, standalone CLI
typecheck, lint and 216 unit tests pass, including isolated lifecycle and
subprocess tests. The real uninstall / apply / uninstall lifecycle has not
been exercised, so this is not yet end-to-end validation of the new harness.

This check is deliberately deferred, not a current priority: the local Twenty
workspace is being used to test another app. Do not reset, repurpose or run
the fundraising integration suite against that workspace.

Resume when a disposable test workspace is available. Confirm the target URL
and credentials, standalone CLI executable, and SDK/runtime versions before
running `yarn test` from the fundraising app directory. The suite deletes the
fundraising app and its data. Follow the [app validation instructions](../../apps/fundraising/nonprofit-fundraising/README.md#local-validation)
and record the real lifecycle result before treating the harness as proven.

The 27 November testing review validated focused offline scenarios and used
scoped fixtures on the installed app. The core integration suite still needs
a full lifecycle run on a verified disposable Twenty workspace. The
[Gift Aid extension rehearsal](../../apps/fundraising/gift-aid/SETUP.md#validation)
verified the core upgrade and refusal of refunds on finalised claims. See the
[product findings below](#6-product-findings-from-testing) for the open
failed-payment, attribution and refund-recovery issues.

## 2. Structural Follow-ups Reconciled Against Current Code

### 2.1 Stabilize Shared App Transport Helpers

Status:

- `helpers extracted; review native SDK transport in batch C`

Why:

- the app is already reimplementing the same route-call and REST-call patterns in multiple places
- this is becoming accidental infrastructure
- stabilizing it early reduces drift and makes later refactors safer

What to do:

- shared app-route and REST helpers already exist in src/app-api; evaluate the installed twenty-client-sdk/rest contract before extending custom transport
- preserve domain error messages while testing route/auth/refresh behaviour
- keep the helpers narrow and explicit rather than building a broad generic client layer

Current examples:

- [manual-gift-entry.api.ts](/home/jamesbryant/workspace/dev-stack/apps/fundraising/nonprofit-fundraising/src/manual-gift-entry/manual-gift-entry.api.ts)
- [batch-processing.api.ts](/home/jamesbryant/workspace/dev-stack/apps/fundraising/nonprofit-fundraising/src/batch-processing/batch-processing.api.ts)
- [gift-staging-processing.api.ts](/home/jamesbryant/workspace/dev-stack/apps/fundraising/nonprofit-fundraising/src/gift-staging-review/gift-staging-processing.api.ts)
- [gift-refund.api.ts](/home/jamesbryant/workspace/dev-stack/apps/fundraising/nonprofit-fundraising/src/gift-lifecycle/gift-refund.api.ts)
- [gift-staging-bulk-writeback.ts](/home/jamesbryant/workspace/dev-stack/apps/fundraising/nonprofit-fundraising/src/gift-staging/gift-staging-bulk-writeback.ts)
- [donor-rollups.ts](/home/jamesbryant/workspace/dev-stack/apps/fundraising/nonprofit-fundraising/src/donor-rollups/donor-rollups.ts)

### 2.2 Centralize Batch Loaders And Query Shapes

Status:

- `shared loaders exist; address concrete query completeness defects`

Why:

- batch summary and row-loading logic is already duplicated
- query shapes are drifting between UI and logic-function code
- this is a maintainability and correctness risk

What to do:

- use existing batch-loaders.ts and separate claim-batch query module; inspect remaining duplication before proposing extraction
- centralize queue-scope query param construction
- centralize repeated gift-staging row field selections where practical

Current examples:

- [gift-batch-summary.front-component.tsx](/home/jamesbryant/workspace/dev-stack/apps/fundraising/nonprofit-fundraising/src/front-components/gift-batch-summary.front-component.tsx)
- [gift-batch-actions.front-component.tsx](/home/jamesbryant/workspace/dev-stack/apps/fundraising/nonprofit-fundraising/src/front-components/gift-batch-actions.front-component.tsx)
- [gift-batch-worklists.front-component.tsx](/home/jamesbryant/workspace/dev-stack/apps/fundraising/nonprofit-fundraising/src/front-components/gift-batch-worklists.front-component.tsx)
- [use-gift-batch-review.ts](/home/jamesbryant/workspace/dev-stack/apps/fundraising/nonprofit-fundraising/src/gift-batch-review/use-gift-batch-review.ts)
- [process-batch.ts](/home/jamesbryant/workspace/dev-stack/apps/fundraising/nonprofit-fundraising/src/logic-functions/process-batch.ts)
- [run-batch-donor-match.ts](/home/jamesbryant/workspace/dev-stack/apps/fundraising/nonprofit-fundraising/src/logic-functions/run-batch-donor-match.ts)
- [check-batch.ts](/home/jamesbryant/workspace/dev-stack/apps/fundraising/nonprofit-fundraising/src/logic-functions/check-batch.ts)

### 2.3 Remove Multi-Write Staging Review Actions Where Possible

Status:

- `target confirmed correctness risks; generic consolidation deferred`

Why:

- some operator actions perform multiple writes to reach one logical outcome
- that creates transient inconsistent state and multiple invalidation events
- this is a correctness and operator-trust issue, not just code cleanup

What to do:

- review staging review actions for multi-step record mutations
- collapse to one write where possible
- if a second step is unavoidable, make the intermediate state clearly non-visible or tightly controlled

Current example:

- [gift-staging-review.actions.ts](/home/jamesbryant/workspace/dev-stack/apps/fundraising/nonprofit-fundraising/src/gift-staging-review/gift-staging-review.actions.ts)

### 2.4 Split `new-gift.front-component.tsx` By Responsibility

Status:

- `initial extraction implemented; no new release task identified`

Current source check: the front component is a 61-line shell with manual-entry sections/hooks/helpers outside it. The original monolithic-file diagnosis below is historical and does not justify repeating the extraction.

Original rationale (superseded by completed extraction):

- the component now mixes UI rendering, duplicate detection, search orchestration, validation, and payload assembly
- future changes to manual gift entry will become increasingly expensive in this form

Original extraction scope (already implemented):

- extract a workflow hook or controller layer
- extract payload/validation helpers
- extract presentational sections where that makes the component easier to reason about

Current file:

- [new-gift.front-component.tsx](/home/jamesbryant/workspace/dev-stack/apps/fundraising/nonprofit-fundraising/src/front-components/new-gift.front-component.tsx)

### 2.5 Split `gift-aid-claim-batch.ts` Into Clearer Layers

Status:

- `queries/rollups already extracted; pagination correctness takes priority`

The [extension](../../apps/fundraising/gift-aid/SETUP.md) now owns the claim
workflow, with separate queries, rollups and finalisation. Return to
claim-specific hardening when extension work resumes.

Original rationale (superseded by completed extraction):

- the module currently combines REST transport, rollup calculation, draft-batch lifecycle, workspace loading, and finalization logic
- the code still works, but the file is now too mixed to scale comfortably

Original extraction scope (already implemented):

- separate transport helpers
- separate rollup and summary logic
- separate workspace loading from mutation/finalization actions

Current file:

- [gift-aid-claim-batch.ts](../../apps/fundraising/gift-aid/src/gift-aid-claims/gift-aid-claim-batch.ts)

### 2.6 Split `batch-processing.executor.ts` Into Internal Submodules

Status:

- `support/effects already extracted; fix commit/retry boundary first`

Current source check: executor.support.ts and executor.effects.ts exist. More splitting alone would not fix retries after successful gift creation.

Original rationale (superseded by support/effects extraction):

- the executor now combines payload building, fallback donor creation, recurring-agreement helpers, batch-create strategy, writeback persistence, and post-processing side effects
- this is the kind of file that becomes hard to extend safely if left too long

Original extraction scope (review any remaining duplication only as needed):

- separate payload construction
- separate donor fallback/enrichment
- separate recurring-agreement support
- separate batch-create and fallback execution strategy
- separate post-processing effects such as donor-rollup recompute

Current file:

- [batch-processing.executor.ts](/home/jamesbryant/workspace/dev-stack/apps/fundraising/nonprofit-fundraising/src/batch-processing/batch-processing.executor.ts)

### 2.7 Decide A Stale-Widget Refresh Policy And Apply It Selectively

Status:

- `policy agreed, apply selectively`

Why:

- some widgets are clearly using explicit invalidation already
- other record widgets still load once and do not refresh while open
- the important question is which surfaces require live operator trust versus snapshot-at-open behavior

What to do:

- classify surfaces by operator trust requirement rather than implementation similarity
- add refresh/invalidation only where the displayed state directly drives the next user action
- leave audit/history/detail surfaces snapshot-at-open by default unless stale data is proven harmful
- prefer narrow record-scoped invalidation over broader reactive patterns
- treat `reactive by default` as a cost to justify, not a hygiene improvement

Current candidates:

- [use-recurring-agreement-review-record.ts](/home/jamesbryant/workspace/dev-stack/apps/fundraising/nonprofit-fundraising/src/recurring/use-recurring-agreement-review-record.ts)

Current working classification:

- `giftStaging` review widgets: live-trust
- `giftBatch` summary/actions/worklists: live-trust
- recurring review surfaces: classify from actual workflow semantics, not component similarity

Why this remains product-adjacent:

- it depends partly on how much real-time trust or progress visibility the product expects from each record surface
- do not make this decision purely from technical neatness

### 2.8 Gift Record Integrity (Potential Enhancements)

Added 2026-11-18 after the modernisation review. Gifts should be created through New Gift, gift staging and payment intake, which apply donor and coding defaults, optional declaration capture and rollups. The Gift object now sets `isUICreatable: false`, hiding Twenty's native create paths in the UI. CSV import (to verify), the API and workflows can still create gifts directly.

Before the [rollup consolidation](ROLLUP_CONSOLIDATION_DESIGN.md#8-decisions-agreed-2026-11-25), gift creation initialises reporting fields but has no dedicated rollup trigger. A reporting writeback can refresh rollups indirectly through an update event. On app-dev v0.1.14 on 2026-11-27, a directly created €12 gift with its reporting fields already correct left Company, Appeal and Appeal source rollups empty. Changing its gift date populated all three. In the same baseline, changing a processed gift to gift in kind removed it from Person totals but left Appeal and Appeal source totals stale. Both behaviours are intended fixes in the consolidation.

Directly created gifts also skip core's capture and coding defaults. When the app acts for a user, Twenty records that user as creator (`MANUAL`), so `createdBy` cannot distinguish app-created gifts.

Follow-up options:

1. **Safety net.** The consolidation design agrees a batched gift `created` trigger for rollups. Still to decide whether to stamp app-created gifts with an origin field, flag unstamped gifts for review or evaluate Gift Aid on them automatically.
2. **Lock committed financial data.** Use field-level `disabledFieldPermissionActions: ['canUpdateFieldValue']` on finance-critical gift fields (amount, date, currency, donor, payment and gift type, fund/appeal coding, refund and Gift Aid fields). The server then refuses edits from every user, API key, agent and workflow, and corrections go through the app's own actions. Constraints from the 2.59 source:
   - The exemption applies only when the app writes as itself, so affected logic functions need `runAs: 'application'`. Each authenticated route must then check that the calling user may perform the action.
   - Gifts would be attributed to the app, so record who entered or processed each gift in an app field.
   - Check upgrade behaviour against existing workspace roles that grant gift edits.
   - Object-level `disabledObjectPermissionActions` is not suitable yet: disabling create also requires disabling all updates.
3. **Finance posting (feature).** Add an exported/posted state and block or track changes after posting, for example with validation rules using `previous.` values.

### 2.9 Currency Defaults On App-Owned Fields (Platform Limitation)

Added 2026-11-19. `REPORTING_CURRENCY` is the organisation's reporting and default currency. App-built entry points use it: New gift, donation forms, batch setup and missing-currency fallbacks. Twenty's native currency inputs cannot follow it.

- A currency field's default comes from the app manifest. It is fixed at build time and is the same in every workspace.
- `defaultValue` is not a workspace-overridable field property (2.59 source). App sync rebuilds each app field from the manifest and writes back differences, so a default an administrator sets on an app-owned field is reset by the next apply or upgrade. Confirmed on 2021 (2026-11-19): after Appeal → Goal amount was set to EUR, `twenty app plan` showed `defaultValue … 'EUR' -> null`. Opportunity → Amount, a standard field, was not affected.
- An app could re-apply defaults from a post-install hook with `shouldRunOnVersionUpgrade: true`, but this needs the broad `DATA_MODEL` permission flag. Rejected for v1 as disproportionate for a Marketplace app.

Affected app-owned entry fields, which default to USD in native inputs:

- Opportunity → Awarded amount (an app field on a standard object)
- Appeal → Goal amount and Budget amount
- Recurring agreement → Amount
- Gift staging → Amount
- Gift batch → Expected total amount

Workspace-owned standard fields, such as Opportunity → Amount, are configured by administrators in Settings → Data model and belong in setup documentation.

Decision (v1): accept the limitation and raise it upstream. Do not document administrator changes to app-owned defaults as a setup step.

Upstream request (draft):

> **Workspace-specific currency defaults for app-owned fields.** Apps cannot give a currency field a per-workspace default. A field's `defaultValue` is fixed in the manifest, and app sync resets any change an administrator makes, because `defaultValue` is not workspace-overridable. International apps therefore cannot preselect an organisation's currency, and native inputs fall back to USD. Either of these would solve it, without the broad `DATA_MODEL` permission: (1) a workspace default currency that currency fields without an explicit default use; or (2) `defaultValue` as a workspace-overridable property for app fields, preserved across sync like labels and select options.

### 2.10 Public Donation Form Routes (Platform Constraints)

Added 2026-11-24. Constraints on the public donation form routes that the app cannot change. Raise them upstream alongside the rate-limit questions.

- **Sandboxed route pages.** Since SDK 2.59, Twenty sends every route response with `Content-Security-Policy: sandbox allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-modals allow-downloads`. The embed page therefore has an opaque origin: no cookies or storage, requests back to the server are cross-origin, and `postMessage` arrives with origin `null`. The checkout request still works through the server's CORS fallback, but **Stripe.js refuses to run** (confirmed 2026-11-25, also on an emulated public domain). **Resolved for app custom domains in Twenty v2.65.1:** pages there run unsandboxed with a real origin. Donation forms therefore require an app custom domain, which needs Cloudflare or manual setup on self-hosted instances. Validated locally 2026-11-28; see `DONATION_FORMS_EMBEDDED_RUNTIME.md` §8c.
- **Limited response headers.** On `/s/`, routes may only set `content-type`, `content-language`, `content-disposition`, `cache-control` and `retry-after`. On an app custom domain (v2.65.1), all headers are kept, so the app could send its own `Content-Security-Policy` or `frame-ancestors` to restrict which sites embed a form. Not pursued for now.
- **No per-caller limits.** Unauthenticated routes share the workspace's logic-function budget (1,000 runs a minute), and their API calls count against the application's limit across every workspace. Public traffic at one charity can slow processing elsewhere.
- **No visitor IP.** Not yet confirmed whether a reliable client IP can be forwarded to a route; it would allow a simple per-visitor limit.

The app's own mitigations are the signed form token and honeypot (see `DONATION_FORMS_EMBEDDED_RUNTIME.md` §8a), plus Stripe's own card-testing controls. Turnstile is deferred.

## 3. Document And Watch, Not Refactor Now

These areas should stay visible but do not currently justify hardening refactor by themselves:

- front-component app-variable behavior via `process.env`
- `BroadcastChannel` invalidation as a provisional widget-sync pattern
- other version-sensitive Twenty runtime edges already tracked in:
  - [TWENTY_EXTENSIBILITY_WATCH.md](/home/jamesbryant/workspace/dev-stack/docs/TWENTY_EXTENSIBILITY_WATCH.md)
  - [MIGRATION_WORKING_PATTERNS.md](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/MIGRATION_WORKING_PATTERNS.md)

## 4. Pass 3: API And Operational Efficiency

This pass is not mainly about correctness bugs.

It is about making bounded pressure shapes explicit so we know what is:

- acceptable for the pilot,
- worth tightening now,
- or likely to need redesign before materially larger data volumes or more clients.

### 4.1 Treat Current `giftBatch` Processing Limits As Explicit Pilot Boundaries

Status:

- `document and watch`

Why:

- current `giftBatch` processing is already deliberately bounded
- it uses hard caps, chunking, writeback batching, and delay-based pacing
- those choices are sensible for current testing, but they define a pressure envelope rather than a general high-volume solution

Current limits:

- `MAX_BATCH_SIZE = 60`
- `GIFT_CREATE_CHUNK_SIZE = 30`
- `WRITEBACK_CHUNK_SIZE = 60`
- `CHUNK_DELAY_MS = 700`
- loader-level `first: 200` row fetches in batch contexts

Working implication:

- treat `60` rows as a meaningful current operating boundary, not just an implementation detail
- treat `100` rows as a real next pressure regime rather than "slightly more of the same"

### 4.2 Validate Batch Failure Outcomes Before Retaining Recursive Fallback

Status:

- `automatic failure fallback removed and unit-checked; runtime validation/recovery remain`

Why:

- the former catch retried uncertain writes by splitting chunks or invoking row creation; regression tests reproduced duplicates after committed-response loss
- the initial donor-update hypothesis was too broad: actual enrichment helpers already catch/log mutation failures, and their success-preservation regression passed before the fix
- malformed/duplicate response IDs cannot safely correlate input rows to committed gifts
- normal processing already excludes PROCESS_FAILED; use that existing review boundary instead of assuming a failed response means rollback

Working implication:

- first fix implemented: no automatic alternate creation after an unclassified outcome; errors explicitly require reconciliation before retry
- preserve confirmed gift IDs and reconcile staging separately; batch writeback errors now include known staging:gift mappings
- future recursive isolation/retry requires proof the rejected attempt did not commit, or a supported idempotency mechanism; do not reintroduce it as a performance-only change
- do not add exception filters, blind retries or compatibility fallbacks to conceal uncertainty
- prove one financial record per input through targeted executor tests; preserve existing operator semantics

### 4.3 Avoid Adding More Full-Workspace Auto-Refresh Patterns Without Clear Need

Status:

- `leave alone unless new feature work touches it`

Why:

- current invalidation-driven workspace reloads are acceptable and simple
- but they reload full record/workspace shapes rather than narrower slices
- that is a reasonable trust-first tradeoff today, not a pattern we should expand casually

Current examples:

- `giftStaging` review record reload

Working implication:

- prefer correctness and simplicity on current live-trust surfaces
- but do not default future widgets to full-workspace refetch if a narrower shape would do

### 4.4 Gift Aid Claim Workspace

The [extension](../../apps/fundraising/gift-aid/SETUP.md) replaced core's claim
workspace with native relation tables and a small action widget. Revisit
claim-specific refresh behaviour with the extension.

### 4.5 Manual Gift Entry Is Chatty But Acceptable

Status:

- `leave alone`

Why:

- duplicate checks, recurring searches, opportunity searches, and final duplicate-gift checks all create front-component read traffic
- but this is a user-driven path, not a high-volume batch path
- the current tradeoff appears acceptable for now

Working implication:

- do not treat manual gift entry as an immediate pressure problem
- just avoid casually adding more background checks or polling behavior

### 4.6 Batch Donor Match Is Grouped, But Still Query-Multiplying

Status:

- `document and watch`

Why:

- grouping rows by donor evidence reduces duplicate work
- but the current donor-match pass still issues one `people` query per grouped donor-name cluster
- that will scale with name variability even if total row count stays bounded

Working implication:

- acceptable for current bounded batches
- keep visible as a likely pressure multiplier if batch size or donor variance grows

## 5. Working Execution Posture

When implementing this backlog:

- prefer small, compositional refactors over broad rewrites
- prioritise financial correctness and relevant runtime compatibility before optional structural cleanup
- keep product-adjacent questions explicit rather than burying them inside refactors
- and avoid chasing newer Twenty patterns unless they clearly reduce current risk or code complexity

## 6. Product Findings From Testing

Open questions for the product and Marketplace review. The entries cite source
and offline evidence and identify installed-app observations where available.

| Finding | Current behaviour and impact | Question for product review |
| --- | --- | --- |
| Processing a single staged row can commit a failed payment | On app-dev v0.1.14, the single-row action committed one gift from a dedicated row with `PAYMENT_FAILED` and a stale `READY_TO_PROCESS` flag. The row still showed `PAYMENT_FAILED` afterward. The loader used by single-row and selected-row actions omits `paymentState`, which the eligibility check treats as payment not required. Whole-batch processing loads the field. [Selected-row loader](../../apps/fundraising/nonprofit-fundraising/src/batch-processing/batch-loaders.ts#L368) · [Payment gate](../../apps/fundraising/nonprofit-fundraising/src/gift-staging-review/gift-staging-processability.ts#L34) | Verify the payment gate across all processing entry points and decide how the workspace should expose a failed payment when an older readiness flag is still present. |
| Batch readiness can erase recovery details | On app-dev (app v0.1.14), Check readiness cleared a synthetic error message on a dedicated failed row. The subsequent Process batch call left that row failed and created no gift for it. A fundraiser can lose the explanation needed to reconcile a blocked gift. [Readiness and processing service](../../apps/fundraising/nonprofit-fundraising/src/gift-staging-review/gift-ready-check.service.ts#L87) | Which details should remain visible until reconciliation, and where should operators see them? |
| Rate-limit guidance and retry eligibility disagree | A rate-limited create tells the operator it is safe to process again and stores the row as failed. Normal processing skips failed rows. [Executor failure handling](../../apps/fundraising/nonprofit-fundraising/src/batch-processing/batch-processing.executor.ts#L178) · [Processing eligibility](../../apps/fundraising/nonprofit-fundraising/src/gift-staging-review/gift-ready-check.service.ts#L125) | How should a confirmed pre-write refusal become eligible for a safe retry while uncertain outcomes stay in reconciliation? |
| Manual gift entry can advance another donor’s agreement | On app-dev v0.1.14, the create route accepted a gift for one dedicated donor with a different donor’s agreement ID. It persisted both links and advanced the second donor’s next expected payment. This can make an unpaid agreement appear fulfilled. [Gift linkage and schedule update](../../apps/fundraising/nonprofit-fundraising/src/logic-functions/create-manual-gift.ts#L483) | Should the route reject mismatches before any write, and is there a supported workflow for payments made on another donor’s behalf? |
| A recurring gift can commit before its schedule advances | A lost create response can be recognised as a committed gift before the schedule update runs. If the schedule write itself fails, a later delivery also finds the gift and exits early. This protects the gift from duplication but can leave a paid agreement showing as due. [Replay confirmation](../../apps/fundraising/nonprofit-fundraising/src/stripe/stripe-event-record.ts#L23) · [Recurring fulfilment](../../apps/fundraising/nonprofit-fundraising/src/stripe/stripe-recurring-fulfillment.ts#L382) | How should recovery finish an incomplete schedule update once, or surface it for reconciliation? |
| Matched Stripe recurring gifts omit agreement coding | Agreements can carry a fund, appeal and appeal source. The matched Stripe lookup reads the donor but does not load that coding. The resulting gift links the donor and agreement only. A rollup can count the gift once it has the relevant links. [Agreement record](../../apps/fundraising/nonprofit-fundraising/src/recurring/recurring.service.ts#L163) · [Stripe fulfilment](../../apps/fundraising/nonprofit-fundraising/src/stripe/stripe-recurring-fulfillment.ts#L215) | Should renewal gifts inherit agreement coding, and which coding should take precedence if the payment has its own? |
| Recurring donation-form invoices can reuse the initial staging row | Invoice payment handling can match a later invoice to the existing row by metadata or subscription ID. It updates that row's payment evidence without creating another gift in this path. A later payment can replace the original reference or economics in staging and be absent from committed income. [Invoice correlation and update](../../apps/fundraising/nonprofit-fundraising/src/stripe/stripe-donation-form-staging.ts#L375) | Which renewal flows are in scope, and how should each payment be recorded without replacing earlier evidence? |
| New gift can show two matches for one committed contribution | On app-dev v0.1.14, checking the amount, date, currency and donor of a batch-processed gift returned both the committed gift and its linked `PROCESSED` staging row. The warning presents each match separately, so a fundraiser can read one contribution as two. [Duplicate check](../../apps/fundraising/nonprofit-fundraising/src/logic-functions/check-manual-gift-duplicates.ts#L186) · [Warning list](../../apps/fundraising/nonprofit-fundraising/src/manual-gift-entry/new-gift-feedback-sections.tsx#L31) | Should a committed gift appear once with its batch provenance, and how should the warning present unresolved staged rows? |
| Batch defaults can override unresolved provider attribution | On app-dev v0.1.14, a batch default assigned a different source to a row that already carried a uniquely resolvable external source ID. Readiness accepted the new link and processing committed the gift to the default source. The original external ID stayed on staging, but the resolver skips rows with a source link. [Batch defaults](../../apps/fundraising/nonprofit-fundraising/src/logic-functions/update-batch-gift-coding.ts#L153) · [External ID resolution](../../apps/fundraising/nonprofit-fundraising/src/appeal-sources/appeal-source-external-id-resolution.ts#L90) | Should defaults wait for source evidence to resolve, and should disagreements be shown for review? See the [working attribution rule](../product/FUNDRAISING_WORKING_GUIDE.md#batch-level-coding). |
| An appeal source can hide the parent appeal’s default fund | On app-dev v0.1.14, a direct Appeal query returned the assigned default fund. The nested Appeal source query did not return that default. New gift inherited the fund from an appeal selected alone, while source-driven entry, batch processing and a coding correction with no explicit fund left it blank. [Source lookup](../../apps/fundraising/nonprofit-fundraising/src/appeal-sources/appeal-source-integrity.ts#L15) · [Batch parent lookup](../../apps/fundraising/nonprofit-fundraising/src/appeal-sources/appeal-source-processing-resolution.ts#L29) | Which supported Twenty lookup should supply a reliable default in each workflow, and when is a blank fund an explicit choice? |
| External source matching and batch defaults omit fundraiser credit | On app-dev v0.1.14, New gift derived credit from the selected source’s fundraiser. A batch gift resolved to the same source through its external ID but carried no credit. Applying a batch source default also left credit blank. An explicit staging credit did survive the commit. [Manual credit derivation](../../apps/fundraising/nonprofit-fundraising/src/logic-functions/create-manual-gift.ts#L325) · [Batch payload](../../apps/fundraising/nonprofit-fundraising/src/batch-processing/batch-processing.executor.support.ts#L361) | When should a canonical source link derive credit, and how should import or operator overrides take precedence? |
| A coding correction can replace an explicit soft credit | On app-dev v0.1.14, changing a source replaced a manually recorded Introducer with the new source’s company fundraiser. The correction form sends appeal, source and fund but has no soft-credit fields. A fundraiser can lose independently assigned credit while making a coding correction. [Correction form](../../apps/fundraising/nonprofit-fundraising/src/gift-record/overview/gift-coding-section.tsx#L225) · [Derivation order](../../apps/fundraising/nonprofit-fundraising/src/soft-credits/fundraiser-soft-credit.ts#L151) | Should automatic replacement apply only to previously derived credit, and how should an intentional override or clear be represented? |
| A refused Opportunity payment can leave behind a new Company | On app-dev v0.1.14, selecting a different existing Company was refused with no gift written. Requesting a new Company with the same Opportunity was also refused, but the new Company persisted. The route resolves or creates the Company before it validates the Opportunity link. [Company resolution](../../apps/fundraising/nonprofit-fundraising/src/logic-functions/create-manual-gift.ts#L279) · [Opportunity validation](../../apps/fundraising/nonprofit-fundraising/src/logic-functions/create-manual-gift.ts#L346) | Which combinations of Company choice and Opportunity link are supported, and can invalid combinations be refused before creating records? |
| Opportunity payment totals exclude payments in other currencies | On app-dev v0.1.14, an Opportunity with a €1,000 award accepted linked payments of €300 and £100 with a €115 reporting value. Company lifetime giving reached €415. The Opportunity payment component sums original amounts in the award currency, which gives €300 received and €700 remaining on these records. This follows from the calculation in source. [Received amount calculation](../../apps/fundraising/nonprofit-fundraising/src/front-components/opportunity-record-payment.front-component.tsx#L109) · [Remaining amount calculation](../../apps/fundraising/nonprofit-fundraising/src/front-components/opportunity-record-payment.front-component.tsx#L248) | Should the payment summary use converted values when available, or should the workflow restrict currency or identify payments excluded from the balance? |
| Reassigning a paid Opportunity separates the award from its donor receipts | On app-dev v0.1.14, reassigning the Opportunity moved its €1,000 award to the new Company’s rollup. Both payments retained their original Company and Opportunity links, and €415 in lifetime giving stayed with the original Company. This may preserve donor history while leaving a cross-company relationship that new payments cannot create. [Payment link validation](../../apps/fundraising/nonprofit-fundraising/src/logic-functions/create-manual-gift.ts#L209) | Should reassigning a paid Opportunity preserve and explain the split, require an explicit correction, or be restricted? |
| Full refund leaves the recurring schedule advanced | On app-dev v0.1.14, recording a full refund left the agreement’s advanced next expected date intact. The original gift and its EUR reporting value also remained in gross giving, consistent with the current rollup decision. An operator reviewing overdue payments may still see the instalment as fulfilled. [Refund route](../../apps/fundraising/nonprofit-fundraising/src/logic-functions/record-gift-refund.ts#L134) · [Gross reporting decision](ROLLUP_CONSOLIDATION_DESIGN.md#8-decisions-agreed-2026-11-25) | When should a partial or full refund reopen a recurring instalment, and how should that interact with any later payments? |
| A refund can commit before its draft claim summary refreshes | Core saves the refund. The extension's record event then detaches the gift from its draft and refreshes totals. The installed rehearsal verified this sequence. [Extension gift processing](../../apps/fundraising/gift-aid/src/gift-aid/process-gifts.ts) | Verify retry and recovery for a late or failed summary refresh when Gift Aid work resumes. |
| Authority of restricted callers on app routes needs verification | App-dev rejected signed-out donor lookup and refund requests with HTTP 403. This establishes authentication. Local Twenty source creates a delegated runtime token only when a triggering user is present, and uses the application token otherwise. The effective record permissions for a scoped API key on these routes have yet to be verified. [Route authentication](../../services/twenty-core/packages/twenty-server/src/engine/core-modules/logic-function/logic-function-trigger/triggers/route/route-trigger.service.ts#L290) · [Token selection](../../services/twenty-core/packages/twenty-server/src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service.ts#L561) | Which user and API key roles may call read and write actions? Verify a restriction with dedicated fixtures in a disposable workspace and read back the records after a denied write. |
| Gift Aid submission snapshots use live gift data | The extension validates current linked gifts when building the submission snapshot. An overlapping finalisation and refund produced a claim that submission validation blocked. [Extension hardening notes](../../apps/fundraising/gift-aid/SETUP.md#deferred-hardening) | Review operator recovery and which facts must be frozen at finalisation when Gift Aid work resumes. See the existing [freeze rules](../features/gift-aid-service-behaviour.md#7-freeze-rules). |
