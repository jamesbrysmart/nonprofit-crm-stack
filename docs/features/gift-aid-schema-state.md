# Gift Aid Schema And State (V1 Draft)

Updated: 2026-03-24  
Status: Exploratory design note (`trial`)  
Audience: Product, engineering, and AI tooling

This note turns the current Gift Aid product direction into a compact schema and state proposal for v1.

It assumes:

- `GiftAidClaimBatch` is a real custom object from the outset;
- Gift Aid should feel competitive with systems such as Beacon and Donorfy on the automated happy path;
- those products are reference points for product judgement, not templates to copy;
- any major divergence from that market pattern should be intentional and explainable.

Current locked decisions in this note:

- one current open draft claim per workspace in v1;
- `GiftAidClaimBatch` is the submission grouping unit and the future anchor for HMRC submission integration;
- `GiftAidClaimBatch` remains the internal workflow object and should not absorb HMRC transport lifecycle;
- `GiftAidClaimSubmission` is the lean external submission object for HMRC integration in v1;
- gifts in a `submitted` claim batch are considered `claimed`;
- submitted batches are immutable in composition and frozen for reproducibility.

Use this alongside [gift-aid.md](/home/jamesbryant/workspace/dev-stack/docs/features/gift-aid.md) and [gift-aid-implementation-shape.md](/home/jamesbryant/workspace/dev-stack/docs/features/gift-aid-implementation-shape.md).

## 1. Design Goals

The schema should support:

- automatic gift-level Gift Aid determination;
- one current open draft claim per workspace;
- automatic inclusion of `claimable` gifts into that draft claim;
- clear visibility of unresolved gifts in draft review;
- historical stability once a gift has been claimed;
- a simple upgrade path to later HMRC submission support.

## 2. Object Model

### `Gift`

`Gift` remains the operational source of truth for donation-level Gift Aid outcome.

Recommended v1 fields:

- `giftAidStatus`
  - `claimable | not_claimable | needs_review`
- `giftAidReasonCode`
- `giftAidDecisionSource`
  - `system | manual_override`
- `giftAidDeclarationId`
- `giftAidLastEvaluatedAt`
- `giftAidClaimBatchId`
  - nullable reference to the current or submitted claim batch the gift belongs to

Purpose:

- store the current Gift Aid outcome on the gift itself;
- make draft/submitted claim membership visible without reconstructing it indirectly;
- support freezing once claimed.

### `GiftStaging`

`GiftStaging` is the review surface for unresolved or incomplete Gift Aid cases before final processing.

Recommended v1 fields:

- `giftAidRequested`
- `giftAidDeclarationCaptured`
- `giftAidDeclarationDate`
- `giftAidCoverageScope`
- `giftAidDeclarationSource`
- `giftAidTextVersion`
- `giftAidDeclarationId`

Not recommended in v1:

- authoritative Gift Aid outcome fields on staging;
- claim-batch membership on staging;
- full claim-state tracking on staging records.

Why:

- staging is for donor/data resolution and declaration capture, not claim assembly;
- authoritative claimability belongs to final `Gift` records;
- claim membership should attach to final `Gift` records only.

### `GiftAidDeclaration`

`GiftAidDeclaration` is the declaration history object for an individual donor.

Recommended v1 fields:

- `personId`
- `status`
  - likely `active | insufficient | revoked | superseded`
- `statusReason`
- `declarationDate`
- `coverageScope`
- `source`
- `textVersion`
- `revokedAt`
- `notes`

Purpose:

- preserve donor-level declaration history;
- represent declaration existence separately from declaration usability;
- support per-gift applicability decisions;
- avoid overloading `Person` with historical declaration detail.

### `GiftAidClaimBatch`

`GiftAidClaimBatch` is a real custom object and represents both the current draft claim and historical submitted claims.

Recommended v1 fields:

- `status`
  - `draft | submitted`
- `periodLabel`
- `submittedAt`
- `giftCount`
- `totalAmount`
- `hasBlockingIssues`
- `blockingIssueCount`
- `notes`

Recommended v1 invariants:

- one current open `draft` batch per workspace;
- submitting a batch moves it to `submitted`;
- submission creates the next current `draft` batch;
- only `Gift` records can belong to a batch;
- once submitted, batch composition is immutable.

Purpose:

- make claim assembly operationally visible;
- distinguish active claim assembly from historical claims;
- make draft blocking visible without requiring every consumer to recalculate it ad hoc;
- provide the stable grouping unit needed for review, totals, export, and later HMRC submission.

Important HMRC-integration stance:

- keep `GiftAidClaimBatch` materially unchanged for v1 HMRC integration;
- do not put HMRC transport status, correlation IDs, or protocol metadata on the batch;
- use a separate `GiftAidClaimSubmission` object for the external submission lifecycle.

### `GiftAidClaimSubmission`

`GiftAidClaimSubmission` is the lean external lifecycle object for one HMRC submission attempt against a submitted `GiftAidClaimBatch`.

Recommended v1 fields:

- `giftAidClaimBatchId`
- `status`
  - `queued | submitted | accepted | rejected | failed`
- `environment`
  - likely `test | live`
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

Optional later field if clearly operationally useful:

- `irmark`

Recommended v1 invariants:

- one row is one submission attempt;
- a batch may have multiple submission rows over time;
- retries create new submission rows rather than mutating one row through many attempts;
- the frozen HMRC handoff payload lives on `snapshotJson` in v1;
- standard object system metadata should provide `createdAt` / `updatedAt`, so those do not need explicit custom fields.

## 3. State Ownership

### Manually recorded facts

- declaration creation, revocation, or replacement;
- manual override of a gift outcome where policy allows;
- notes explaining manual intervention;
- claim submission action.

### System-derived state

- gift-level Gift Aid outcome;
- reason code;
- applicable declaration link for a specific gift;
- whether a gift enters or leaves the current draft claim;
- claim totals on `GiftAidClaimBatch`;
- freeze from further routine drift once a gift is claimed.

## 4. Minimal Lifecycles

### Gift outcome

- `claimable`
- `not_claimable`
- `needs_review`

### Claim batch lifecycle

- `draft`
- `submitted`

For v1, `submitted` means internally finalized, frozen, and ready for HMRC export or later submission automation. It does not mean actually transmitted to HMRC.

No richer lifecycle is required in v1 unless HMRC integration later forces it.

### Claim submission lifecycle

- `queued`
- `submitted`
- `accepted`
- `rejected`
- `failed`

For v1, this lifecycle belongs on `GiftAidClaimSubmission`, not on `GiftAidClaimBatch`.

### Gift claim state

- `none`
- `in_draft`
- `claimed`

These values are the intended logical states for a gift's claim position. In v1, the preferred model is to derive them from `giftAidClaimBatchId` plus linked batch status rather than storing them directly on `Gift`. A convenience field can be added later if Twenty querying, filtering, or reporting makes that worthwhile.

## 5. Inclusion And Freeze Rules

### Auto-inclusion

- only gifts with `giftAidStatus = claimable` can be auto-added to the current draft claim;
- create the current draft claim lazily when the first `claimable` gift needs it;
- gifts with `giftAidStatus = needs_review` or `not_claimable` must be surfaced clearly in draft review.

If a gift already in the draft claim stops being `claimable` during routine re-evaluation, the important v1 rule is:

- the gift should remain in the draft claim;
- the issue must remain visible in the draft review flow;
- submission must not proceed while unresolved Gift Aid issues remain in the batch.

### Re-evaluation

Re-evaluate when relevant facts change, including:

- declaration created, changed, revoked, or superseded;
- donor merge or material donor correction;
- gift create, edit, refund, reversal, or reassignment.

### Claimed-gift freeze

Once a gift is part of a `submitted` claim batch:

- treat the gift as `claimed` because it belongs to a `submitted` batch;
- do not add or remove gifts from that submitted batch;
- freeze Gift Aid-relevant fields on included gifts for audit and export reproducibility;
- do not automatically re-evaluate it into a different current outcome as part of routine flow;
- surface later issues as explicit follow-up situations rather than silently mutating claim history.

This preserves trust before richer correction workflows exist.

Important current limitation:

- the first freeze implementation is currently service-layer only;
- it covers updates that pass through `fundraising-service`;
- it does not yet prevent direct edits to the underlying `Gift` record in the Twenty UI or through other write paths.

So the current approach is a useful managed-flow safeguard, but not yet a full immutability guarantee at the platform level.

## 6. Suggested Service Responsibilities

The Gift Aid service layer should be responsible for:

- evaluating gift-level Gift Aid outcome;
- assigning reason codes;
- resolving declaration applicability per gift;
- managing gift membership and issue visibility within the current draft claim;
- creating the next draft claim when a batch is submitted;
- maintaining claim totals;
- preventing drift for claimed gifts.

## 7. Open Questions

- do we need a stored `giftAidClaimState` convenience field later, or will derived state remain sufficient in practice;
- should manual override be able to move a `needs_review` gift directly into the draft claim, or should that require a separate explicit action;
- what exact fields will later be required for HMRC submission, and can we reserve room without adding them now.
- whether `irmark` becomes operationally useful enough to warrant a first-class field early, or should remain derivable/logged only.

## 8. Related Docs

- `docs/features/gift-aid.md`
- `docs/features/gift-aid-implementation-shape.md`
