# Gift Aid HMRC Integration Shape

Updated: 2026-04-12  
Status: Working design note (`stage-1`)  
Audience: Engineering, product, and future implementation handoff

## Purpose

This note captures the current preferred integration shape for connecting a future Twenty Gift Aid app capability to the standalone HMRC submission adapter.

It is intentionally narrower than the broader Gift Aid product docs and narrower than the Phase 1 HMRC technical spike. The goal here is to document the expected handoff and minimal v1 data shape before implementation work starts.

## Scope

This note covers:

- the intended boundary between Gift Aid product workflow and HMRC submission transport;
- the lean v1 data model for internal claim workflow vs external HMRC submission lifecycle;
- the preferred Twenty-to-adapter handoff pattern;
- the preferred adapter-to-Twenty result-return pattern.

This note does not cover:

- full HMRC XML/GovTalk implementation detail;
- final Twenty metadata field definitions;
- full correction/recovery workflows;
- live-recognition or production-operational policy.

## Evidence Base

### Grounded in current Twenty apps framework code

The current apps framework and official examples show that apps can:

- define application config with secrets and non-secret variables;
- define logic functions;
- invoke Twenty APIs from logic functions and front components;
- define front components and page layouts;
- expose HTTP route-triggered logic functions.

Primary references:

- [define-application.ts](/home/jamesbryant/workspace/dev-stack/services/twenty-core/packages/twenty-sdk/src/sdk/application/define-application.ts)
- [manifestType.ts](/home/jamesbryant/workspace/dev-stack/services/twenty-core/packages/twenty-shared/src/application/manifestType.ts)
- [hello-world.ts](/home/jamesbryant/workspace/dev-stack/services/twenty-core/packages/twenty-apps/examples/hello-world/src/logic-functions/hello-world.ts)
- [hello-world.tsx](/home/jamesbryant/workspace/dev-stack/services/twenty-core/packages/twenty-apps/examples/hello-world/src/front-components/hello-world.tsx)
- [application.config.ts](/home/jamesbryant/workspace/dev-stack/services/twenty-core/packages/twenty-apps/examples/postcard/src/application.config.ts)
- [post-install.ts](/home/jamesbryant/workspace/dev-stack/services/twenty-core/packages/twenty-apps/examples/postcard/src/logic-functions/post-install.ts)
- [card.front-component.tsx](/home/jamesbryant/workspace/dev-stack/services/twenty-core/packages/twenty-apps/examples/postcard/src/components/card.front-component.tsx)
- [route-trigger.service.ts](/home/jamesbryant/workspace/dev-stack/services/twenty-core/packages/twenty-server/src/engine/core-modules/logic-function/logic-function-trigger/triggers/route/route-trigger.service.ts)

### Informed assumptions because the apps framework is still alpha

The following are current design judgments, not framework guarantees:

- the external HMRC adapter remains the best place for HMRC-specific XML, IRmark, GovTalk, and Transaction Engine protocol logic;
- the cleanest handoff is a signed app invocation plus adapter pull of frozen claim data from Twenty;
- cloud users should be supported by a vendor-managed adapter service rather than assuming purely self-hosted runtime coupling.

## Preferred Boundary

Current preferred boundary:

- the Gift Aid app owns user-facing Gift Aid workflow and internal claim lifecycle;
- the HMRC adapter owns external submission transport and HMRC-specific protocol behavior.

This means:

- `GiftAidClaimBatch` remains the internal operational grouping object;
- `GiftAidClaimSubmission` records one external HMRC submission attempt for a batch;
- the frozen HMRC handoff payload lives on `GiftAidClaimSubmission` in v1 rather than in a separate snapshot object.

## Existing `GiftAidClaimBatch` Mapping

`GiftAidClaimBatch` is not greenfield.

The current metadata setup already provisions `GiftAidClaimBatch` in:

- [setup-schema.mjs](/home/jamesbryant/workspace/dev-stack/services/fundraising-service/scripts/setup-schema.mjs)

Current provisioned fields:

- `status`
- `periodLabel`
- `submittedAt`
- `giftCount`
- `totalAmount`
- `hasBlockingIssues`
- `blockingIssueCount`
- `notes`

Current relation wiring:

- `Gift.giftAidClaimBatch` is already provisioned as a `MANY_TO_ONE` relation to `GiftAidClaimBatch`

Current service usage is aligned to that metadata:

- [gift-aid-claim-batch.service.ts](/home/jamesbryant/workspace/dev-stack/services/fundraising-service/src/gift-aid/gift-aid-claim-batch.service.ts)

That service already assumes:

- one current `draft` batch;
- lazy creation of the current draft;
- summary maintenance on `giftCount`, `totalAmount`, `hasBlockingIssues`, and `blockingIssueCount`;
- `submitted` means internally finalized, not HMRC-transmitted.

### Current recommendation for `GiftAidClaimBatch`

Keep `GiftAidClaimBatch` materially unchanged for the lean HMRC v1 integration shape.

Minimum additions needed on the existing object:

- no new scalar lifecycle fields are required for v1 HMRC integration;
- no HMRC protocol fields should be added to the batch;
- the only structural addition should be the reverse side of the new `GiftAidClaimSubmission -> GiftAidClaimBatch` relation.

In other words:

- keep `GiftAidClaimBatch` as the internal workflow object;
- let `GiftAidClaimSubmission` carry the external HMRC lifecycle and frozen handoff payload.

## Lean V1 Data Shape

## `GiftAidClaimBatch`

Purpose:

- internal workflow object for draft review and internal finalization.

Minimum useful fields:

- `id`
- `status`
- `submittedAt`
- `giftCount`
- `totalAmount`
- `hasBlockingIssues`
- `blockingIssueCount`
- optional `periodLabel`
- optional `notes`

Minimum useful statuses:

- `draft`
- `submitted`

Important rule:

- the batch lifecycle is not the HMRC lifecycle;
- `submitted` continues to mean internally finalized and frozen, not successfully sent to HMRC.

## `GiftAidClaimSubmission`

Purpose:

- one HMRC submission attempt for a batch;
- the frozen handoff record between Twenty-side Gift Aid workflow and the HMRC adapter.

Minimum useful fields:

- `id`
- `giftAidClaimBatchId`
- `status`
- `environment`
- `submissionNumber`
- `snapshotJson`
- `snapshotHash`
- `submittedToHmrcAt`
- `lastPolledAt`
- `completedAt`
- `correlationId`
- `transactionId`
- `hmrcDocumentReference`
- `messageCodesJson`
- `errorSummaryJson`
- optional `irmark`

Minimum useful statuses:

- `queued`
- `submitted`
- `accepted`
- `rejected`
- `failed`

Status intent:

- `queued`: frozen and created, but not yet successfully handed off to HMRC;
- `submitted`: handed off to the gateway and awaiting final outcome;
- `accepted`: accepted by HMRC;
- `rejected`: HMRC or gateway returned a structured rejection outcome;
- `failed`: local adapter/auth/transport failure before a clean acceptance or rejection outcome was recorded.

## JSON-first fields for v1

To keep the v1 schema lean, richer protocol detail should stay in JSON fields unless operational use proves a need to promote them.

Use JSON for:

- `snapshotJson`: frozen claim snapshot used by the adapter for XML generation and submission;
- `messageCodesJson`: HMRC message codes and related structured response codes;
- `errorSummaryJson`: adapter failure detail, HMRC/gateway error detail, and compact parsed response summaries.

Avoid introducing in v1:

- a standalone snapshot object;
- a separate submission-event log object;
- many protocol-specific first-class fields that are not yet proven useful in list/filter/reporting views.

## Multiple submissions / retries

V1 retry model:

- a batch may have multiple `GiftAidClaimSubmission` records;
- each row is one submission attempt;
- retries create a new submission row linked to the same batch;
- `submissionNumber` increments per batch.

This preserves submission history without adding more objects.

Current v1 preference:

- do not add an `isLatest` field unless a concrete query or UI need emerges;
- derive “latest” from `submissionNumber` or timestamp ordering.

## Proposed `GiftAidClaimSubmission` metadata shape

This is the main new object needed for the lean HMRC integration shape.

Purpose:

- record one external HMRC submission attempt for a batch;
- hold the frozen handoff payload used by the adapter;
- hold the current external submission status and key result identifiers.

Suggested metadata shape:

- object name singular: `giftAidClaimSubmission`
- object name plural: `giftAidClaimSubmissions`
- label singular: `Gift Aid Claim Submission`
- label plural: `Gift Aid Claim Submissions`

Suggested relation:

- `giftAidClaimSubmission.giftAidClaimBatch`
  - `MANY_TO_ONE` to `GiftAidClaimBatch`
  - reverse side on batch can be labeled `Submissions`

Suggested v1 fields:

- `status` (`TEXT`)
- `environment` (`TEXT`)
- `submissionNumber` (`NUMBER`)
- `snapshotJson` (`RAW_JSON`)
- `snapshotHash` (`TEXT`)
- `submittedToHmrcAt` (`DATE_TIME`)
- `lastPolledAt` (`DATE_TIME`)
- `completedAt` (`DATE_TIME`)
- `correlationId` (`TEXT`)
- `transactionId` (`TEXT`)
- `hmrcDocumentReference` (`TEXT`)
- `messageCodesJson` (`RAW_JSON`)
- `errorSummaryJson` (`RAW_JSON`)

Optional but not required in the first provisioning pass:

- `irmark` (`TEXT`)

Suggested status values:

- `queued`
- `submitted`
- `accepted`
- `rejected`
- `failed`

### Why `RAW_JSON` matters here

The current setup script already uses `RAW_JSON` for fields such as:

- `GiftStaging.providerContext`
- `GiftStaging.processingDiagnostics`
- `GiftStaging.rawPayload`

So `snapshotJson`, `messageCodesJson`, and `errorSummaryJson` fit the current metadata/tooling pattern and do not require inventing a new storage convention just for HMRC integration.

### System metadata vs explicit timestamps

`GiftAidClaimSubmission` should rely on standard object system metadata for:

- `createdAt`
- `updatedAt`
- related built-in creator/updater metadata where Twenty provides it

So the custom provisioning plan should not add an explicit `createdAt` field.

The explicit timestamps that still belong on the object are domain-specific ones:

- `submittedToHmrcAt`
- `lastPolledAt`
- `completedAt`

## Preferred Twenty-to-adapter handoff

Preferred handoff model:

1. the Gift Aid app creates a `GiftAidClaimSubmission` row in `queued` status;
2. the app stores the frozen HMRC handoff payload in `snapshotJson`;
3. an app logic function invokes the external adapter with a small signed request;
4. the adapter validates the request and then pulls the submission snapshot from Twenty;
5. the adapter submits to HMRC and writes results back to Twenty.

Current preference is **pull over push**:

- the app should not push the entire frozen claim snapshot to the adapter in the invocation request;
- the adapter should fetch the authoritative frozen snapshot from Twenty after validating the request.

Why:

- keeps Twenty as the source of truth for the frozen handoff;
- keeps invocation payloads small and easier to authenticate;
- gives the adapter an idempotent re-read path for retries/polling;
- fits cloud use better than treating app invocation as the full transport boundary.

## Invocation and auth pattern

Preferred v1 pattern:

- app logic function performs an outbound HTTP `POST` to the adapter;
- request includes a small body such as:
  - `workspaceId`
  - `giftAidClaimSubmissionId`
  - `giftAidClaimBatchId`
  - `environment`
  - `issuedAt`
  - `nonce`
- request is signed with a shared secret held in app/server configuration;
- adapter validates signature, nonce, and recency;
- adapter then uses workspace-scoped Twenty credentials to fetch the submission row and its `snapshotJson`.

Grounded in current framework:

- apps can hold secrets/config;
- apps can run logic functions;
- apps can make external calls.

Current inference:

- exact signing scheme and tenant-registration model are still design choices, not framework-defined behavior.

## App logic function / adapter invocation contract

Against the real existing model, the app-side invocation should operate on `GiftAidClaimSubmission`, not directly on `GiftAidClaimBatch`.

Preferred flow:

1. internal workflow marks `GiftAidClaimBatch` as `submitted`;
2. app/server-side Gift Aid orchestration creates a linked `GiftAidClaimSubmission` row;
3. that row stores the frozen `snapshotJson` and `snapshotHash`;
4. app logic function invokes the adapter using the `GiftAidClaimSubmission` identity.

Suggested minimal invocation payload:

- `workspaceId`
- `giftAidClaimSubmissionId`
- `giftAidClaimBatchId`
- `environment`
- `issuedAt`
- `nonce`

Reason to key the invocation off `GiftAidClaimSubmission`:

- it is the right external lifecycle record;
- it lets the adapter fetch one authoritative frozen handoff row from Twenty;
- it keeps the batch free of HMRC transport semantics.

## Result return pattern

Preferred v1 pattern:

- adapter writes submission outcomes directly back into Twenty on `GiftAidClaimSubmission`;
- app UI reads status from Twenty rather than requiring a separate callback-processing layer inside the app.

Minimum result flow:

- update `status`
- set `submittedToHmrcAt`, `lastPolledAt`, `completedAt` as relevant
- persist `correlationId`, `transactionId`, `hmrcDocumentReference` when available
- persist `messageCodesJson`
- persist `errorSummaryJson`

This keeps operational state centralized in Twenty and avoids introducing a second write-back hop unless later needed.

## Minimal `setup-schema.mjs` change plan

Keep the provisioning delta as small as possible.

### Leave unchanged

- existing `GiftAidClaimBatch` object definition
- existing `Gift.giftAidClaimBatch` relation
- existing `GiftAidClaimBatch` workflow fields and statuses

### Add

1. new object: `giftAidClaimSubmission`
2. new scalar fields on that object only:
   - `status` (`TEXT`)
   - `environment` (`TEXT`)
   - `submissionNumber` (`NUMBER`)
   - `snapshotJson` (`RAW_JSON`)
   - `snapshotHash` (`TEXT`)
   - `submittedToHmrcAt` (`DATE_TIME`)
   - `lastPolledAt` (`DATE_TIME`)
   - `completedAt` (`DATE_TIME`)
   - `correlationId` (`TEXT`)
   - `transactionId` (`TEXT`)
   - `hmrcDocumentReference` (`TEXT`)
   - `messageCodesJson` (`RAW_JSON`)
   - `errorSummaryJson` (`RAW_JSON`)
3. one relation:
   - `giftAidClaimSubmission.giftAidClaimBatch`
   - `MANY_TO_ONE` to `GiftAidClaimBatch`

### Concrete patch shape inside `setup-schema.mjs`

Follow the current provisioning pattern already used for `GiftAidDeclaration`, `GiftAidClaimBatch`, `GiftPayout`, and other custom objects.

The patch should be:

1. add a new object block immediately after the existing `GiftAidClaimBatch` block
2. define `giftAidClaimSubmissionFields`
3. loop over that field list with `createField`
4. add one `ensureRelationField(...)` call in the relation-linking section

Suggested object block:

```js
console.log('--- Setting up Gift Aid Claim Submission Object ---');
const giftAidClaimSubmissionObjectId = await ensureObject({
  nameSingular: 'giftAidClaimSubmission',
  namePlural: 'giftAidClaimSubmissions',
  labelSingular: 'Gift Aid Claim Submission',
  labelPlural: 'Gift Aid Claim Submissions',
  icon: 'IconSend',
  description:
    'Represents one HMRC submission attempt for a submitted Gift Aid claim batch.',
});
```

Suggested field list:

```js
const giftAidClaimSubmissionFields = [
  { name: 'status', label: 'Status', type: 'TEXT' },
  { name: 'environment', label: 'Environment', type: 'TEXT' },
  { name: 'submissionNumber', label: 'Submission Number', type: 'NUMBER' },
  { name: 'snapshotJson', label: 'Snapshot JSON', type: 'RAW_JSON' },
  { name: 'snapshotHash', label: 'Snapshot Hash', type: 'TEXT' },
  { name: 'submittedToHmrcAt', label: 'Submitted To HMRC At', type: 'DATE_TIME' },
  { name: 'lastPolledAt', label: 'Last Polled At', type: 'DATE_TIME' },
  { name: 'completedAt', label: 'Completed At', type: 'DATE_TIME' },
  { name: 'correlationId', label: 'Correlation ID', type: 'TEXT' },
  { name: 'transactionId', label: 'Transaction ID', type: 'TEXT' },
  { name: 'hmrcDocumentReference', label: 'HMRC Document Reference', type: 'TEXT' },
  { name: 'messageCodesJson', label: 'Message Codes JSON', type: 'RAW_JSON' },
  { name: 'errorSummaryJson', label: 'Error Summary JSON', type: 'RAW_JSON' },
];
```

Suggested relation creation:

```js
await ensureRelationField({
  name: 'giftAidClaimBatch',
  label: 'Gift Aid Claim Batch',
  objectMetadataId: giftAidClaimSubmissionObjectId,
  relationCreationPayload: {
    type: 'MANY_TO_ONE',
    targetObjectMetadataId: giftAidClaimBatchObjectId,
    targetFieldLabel: 'Submissions',
    targetFieldIcon: 'IconSend',
  },
});
```

Important note:

- because `ensureRelationField` provisions the relation from the submission side, this should be the only relation patch needed;
- do not add a second relation field from `GiftAidClaimBatch` back to `GiftAidClaimSubmission` unless the metadata API proves that the reverse side is not created automatically.

### Do not add in the first provisioning pass

- any new scalar HMRC fields on `GiftAidClaimBatch`
- `isLatest`
- explicit `createdAt` / `updatedAt`
- standalone snapshot object
- standalone event log object
- app-to-adapter transport metadata fields beyond those listed above

## Concrete v1 adapter contract

The app-to-adapter invocation should be small and keyed to `GiftAidClaimSubmission`.

### App -> adapter request

Endpoint:

- `POST /gift-aid-claim-submissions`

Headers:

- `Content-Type: application/json`
- `X-Twenty-Workspace-Id: <workspaceId>`
- `X-Twenty-App-Id: <app identifier>`
- `X-Signature: <signature>`

Body:

```json
{
  "workspaceId": "workspace_123",
  "giftAidClaimSubmissionId": "submission_123",
  "giftAidClaimBatchId": "batch_123",
  "environment": "test",
  "issuedAt": "2026-04-12T12:34:56.000Z",
  "nonce": "9db0d548-0b8a-4e28-9f02-0d3a6ee2db7e"
}
```

Adapter behavior:

1. validate signature, nonce, and recency
2. validate tenant/workspace registration
3. fetch `GiftAidClaimSubmission` from Twenty
4. read `snapshotJson` and `snapshotHash`
5. perform HMRC submission / polling
6. write status/result fields back to Twenty

### Adapter -> Twenty write-back shape

Minimum write-back fields:

- `status`
- `submittedToHmrcAt`
- `lastPolledAt`
- `completedAt`
- `correlationId`
- `transactionId`
- `hmrcDocumentReference`
- `messageCodesJson`
- `errorSummaryJson`

Typical examples:

Successful initial handoff:

```json
{
  "status": "submitted",
  "submittedToHmrcAt": "2026-04-12T12:35:10.000Z",
  "correlationId": "ABC123",
  "transactionId": "TXN456",
  "messageCodesJson": ["1002"]
}
```

Terminal accepted outcome:

```json
{
  "status": "accepted",
  "lastPolledAt": "2026-04-12T12:37:00.000Z",
  "completedAt": "2026-04-12T12:37:00.000Z",
  "hmrcDocumentReference": "AB12345",
  "messageCodesJson": ["0000", "077001"],
  "errorSummaryJson": null
}
```

Terminal failure outcome:

```json
{
  "status": "failed",
  "completedAt": "2026-04-12T12:36:00.000Z",
  "messageCodesJson": ["1046"],
  "errorSummaryJson": {
    "category": "auth",
    "message": "Authentication Failure. The supplied user credentials failed validation for the requested service."
  }
}
```

## Service / orchestration plan

Keep the orchestration flow as small as possible and hang it off the existing batch workflow.

### Current `GiftAidClaimBatch` behavior to preserve

Existing service behavior already covers:

- current draft lookup/creation
- gift auto-attachment to the current draft
- draft summary refresh
- internal submit transition from `draft` to `submitted`
- next-draft creation after submit

That should remain intact.

### New orchestration step to add after internal submit

After a batch is successfully moved to `submitted`, add a narrow submission-creation step:

1. read the now-submitted `GiftAidClaimBatch`
2. read the linked gifts for that batch
3. build the frozen HMRC handoff snapshot
4. compute `snapshotHash`
5. create a `GiftAidClaimSubmission` row with:
   - linked batch id
   - `status = queued`
   - `environment`
   - `submissionNumber`
   - `snapshotJson`
   - `snapshotHash`
6. return the created submission identity to the caller or orchestration layer

### Suggested service responsibilities

Keep this split:

- `GiftAidClaimBatchService`
  - owns internal batch workflow only
  - should not absorb HMRC protocol logic
- new `GiftAidClaimSubmissionService`
  - creates and tracks submission rows
  - builds the frozen snapshot from submitted batch data
  - computes next `submissionNumber`
- HMRC adapter integration service
  - performs signed invocation to the external adapter
  - does not build the batch itself

### Submission creation timing

Current preferred timing:

- create the `GiftAidClaimSubmission` row only after the batch has already become `submitted`

Reason:

- keeps internal finalization as the first durable step;
- makes the external submission lifecycle clearly secondary to the internal batch lifecycle;
- avoids partially created submission rows for batches that never completed internal submit.

### Retry behavior

On retry:

1. do not mutate the old submission row into a new attempt
2. create a new `GiftAidClaimSubmission`
3. increment `submissionNumber`
4. freeze a fresh `snapshotJson`

That gives simple history without more objects.

## Adapter-side Twenty read/write contract

The adapter should treat Twenty as the source of truth for the submission row.

### Adapter read contract

Given:

- `workspaceId`
- `giftAidClaimSubmissionId`

the adapter should read:

- `GiftAidClaimSubmission.id`
- `GiftAidClaimSubmission.status`
- `GiftAidClaimSubmission.environment`
- `GiftAidClaimSubmission.submissionNumber`
- `GiftAidClaimSubmission.snapshotJson`
- `GiftAidClaimSubmission.snapshotHash`
- linked `GiftAidClaimBatch.id`
- linked `GiftAidClaimBatch.status`

Minimum read expectations:

- the submission row exists
- the linked batch exists
- the linked batch is `submitted`
- the submission row is still in a state that can be processed, typically `queued` or `submitted`

If those expectations fail, the adapter should not submit to HMRC and should write a compact failure summary back if appropriate.

### Adapter write contract

The adapter should patch only the submission row, not the batch, for normal transport updates.

Allowed write-back fields:

- `status`
- `submittedToHmrcAt`
- `lastPolledAt`
- `completedAt`
- `correlationId`
- `transactionId`
- `hmrcDocumentReference`
- `messageCodesJson`
- `errorSummaryJson`

### Adapter state transition expectations

Typical transition path:

- `queued` -> `submitted`
- `submitted` -> `accepted`
- `submitted` -> `rejected`
- `queued` -> `failed`
- `submitted` -> `failed`

The adapter should not:

- mutate `snapshotJson`
- mutate `snapshotHash`
- mutate batch composition or batch status

### Concurrency / idempotency posture

For v1, keep this simple:

- submission identity is `giftAidClaimSubmissionId`
- adapter should treat repeated invocation of the same submission id as idempotent where practical
- if a submission row is already terminal (`accepted`, `rejected`, `failed`), a repeated invoke should no-op or return current state rather than creating another attempt automatically

New attempts should be created by app-side orchestration, not by the adapter itself.

## Cloud and self-hosted posture

Current preferred eventual posture:

- self-hosted users can run the adapter alongside their own stack;
- cloud users should be supported by a vendor-managed adapter service;
- the app-side behavior should stay the same in both cases:
  - create submission row
  - freeze snapshot
  - invoke adapter
  - read status back from Twenty

This note treats that as the most plausible eventual product shape based on current app-framework evidence, while acknowledging that the framework is still alpha and may shift.

## Relationship to other docs

- [gift-aid.md](/home/jamesbryant/workspace/dev-stack/docs/features/gift-aid.md) remains the source for Gift Aid product scope and operating model.
- [hmrc-charities-online-phase-1.md](/home/jamesbryant/workspace/dev-stack/docs/spikes/hmrc-charities-online-phase-1.md) remains the source for the standalone HMRC technical spike and test evidence.

This note exists to connect those two areas at the integration boundary without prematurely locking the broader feature docs to a fully implemented schema.
