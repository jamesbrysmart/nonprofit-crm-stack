# Gift Aid Field Schema Proposal (V1 Draft)

Updated: 2026-03-24  
Status: Exploratory design note (`trial`)  
Audience: Product, engineering, and AI tooling

This note proposes a field-by-field v1 schema target for Gift Aid.

It is intended to bridge:

- the current placeholder schema in [setup-schema.mjs](/home/jamesbryant/workspace/dev-stack/services/fundraising-service/scripts/setup-schema.mjs)
- the intended product and service model defined in the Gift Aid docs

Use it alongside:

- [gift-aid.md](/home/jamesbryant/workspace/dev-stack/docs/features/gift-aid.md)
- [gift-aid-implementation-shape.md](/home/jamesbryant/workspace/dev-stack/docs/features/gift-aid-implementation-shape.md)
- [gift-aid-schema-state.md](/home/jamesbryant/workspace/dev-stack/docs/features/gift-aid-schema-state.md)
- [gift-aid-service-behaviour.md](/home/jamesbryant/workspace/dev-stack/docs/features/gift-aid-service-behaviour.md)

This proposal is intended to guide the next design and provisioning pass, not to freeze every field forever. We should review the field set again before final implementation, especially once relation-field practicality and HMRC-adjacent requirements are clearer.

## 1. Scope

This proposal covers Gift Aid fields on:

- `Gift`
- `GiftStaging`
- `GiftAidDeclaration`
- `GiftAidClaimBatch`

It does not attempt to define:

- HMRC-specific fields beyond what v1 structurally needs;
- full Twenty relation metadata details;
- UI layout;
- implementation sequencing.

## 2. Field Design Principles

The schema should:

- store current operational state explicitly where staff need to see it;
- separate donor declaration history from gift outcome;
- support a review-first draft-claim model;
- keep submitted claims reproducible and immutable;
- leave room for later HMRC integration without forcing v1 complexity.

## 3. `Gift` Field Proposal

`Gift` is the final operational record and should hold the current Gift Aid outcome plus claim linkage.

### Recommended Gift Aid fields

| Field | Type | Purpose | Notes |
| --- | --- | --- | --- |
| `giftAidStatus` | `TEXT` | Current Gift Aid outcome | Expected values: `claimable`, `not_claimable`, `needs_review` |
| `giftAidReasonCode` | `TEXT` | Structured reason for current outcome | Small controlled set |
| `giftAidDecisionSource` | `TEXT` | Whether outcome is system-derived or manually overridden | Expected values: `system`, `manual_override` |
| `giftAidDeclaration` | `RELATION` | Supporting declaration for this gift | Preferred over text ID fields |
| `giftAidLastEvaluatedAt` | `DATE_TIME` | Last time Gift Aid logic evaluated this gift | Useful for audit/debug |
| `giftAidClaimBatch` | `RELATION` | Draft/submitted claim batch membership | Primary linkage to `GiftAidClaimBatch` |

### Proposed deprecation posture

| Existing field | Recommendation |
| --- | --- |
| `giftAidEligible` | Treat as placeholder to replace with `giftAidStatus` and related fields |

### Why these belong on `Gift`

- staff need current Gift Aid state on the final donation record;
- claim review and later HMRC submission need stable gift-level linkage;
- submitted-claim freezing depends on the final gift carrying the relevant state.

## 4. `GiftStaging` Field Proposal

`GiftStaging` should capture Gift Aid request and declaration facts before a final gift is processed.

### Recommended Gift Aid fields

| Field | Type | Purpose | Notes |
| --- | --- | --- | --- |
| `giftAidRequested` | `BOOLEAN` | Gift Aid was requested or indicated in this flow | Replaces vague `giftAidEligible` meaning |
| `giftAidDeclarationCaptured` | `BOOLEAN` | A declaration was explicitly captured in this flow | Distinct from request alone |
| `giftAidDeclarationDate` | `DATE` | Date attached to the captured declaration | Used when creating `GiftAidDeclaration` |
| `giftAidCoverageScope` | `TEXT` | Scope of donations covered by the captured declaration | e.g. single / future / retrospective coverage |
| `giftAidDeclarationSource` | `TEXT` | Where the captured declaration came from | e.g. manual, form, import |
| `giftAidTextVersion` | `TEXT` | Declaration wording/version captured | Useful for auditability |
| `giftAidDeclaration` | `RELATION` | Linked declaration if a real record already exists | Optional at staging time |

### Not recommended on `GiftStaging`

| Field | Reason |
| --- | --- |
| `giftAidStatus` | Authoritative outcome belongs to final `Gift`, not staging |
| `giftAidReasonCode` | Reason codes belong with authoritative outcome |
| `giftAidDecisionSource` | Staging should not imply authoritative determination |
| `giftAidClaimBatch` | Claim membership belongs to final gifts, not staging records |
| claim lifecycle fields | Staging is for review, not claim assembly |

### Relationship to `processingDiagnostics`

`processingDiagnostics` may still hold deeper technical detail, but visible Gift Aid review state should not rely on raw JSON alone.

### Proposed deprecation posture

| Existing field | Recommendation |
| --- | --- |
| `giftAidEligible` | Replace with clearer request/capture fields, especially `giftAidRequested` |

## 5. `GiftAidDeclaration` Field Proposal

`GiftAidDeclaration` should be the declaration history object for donor-level facts.

### Recommended fields

| Field | Type | Purpose | Notes |
| --- | --- | --- | --- |
| `person` | `RELATION` | Donor this declaration belongs to | Canonical donor linkage |
| `status` | `TEXT` | Declaration state | Expected values likely `active`, `insufficient`, `revoked`, `superseded` |
| `statusReason` | `TEXT` | Why the declaration is currently insufficient or unavailable | Optional but useful for explainability |
| `declarationDate` | `DATE` | When declaration was made | Core operational fact |
| `coverageScope` | `TEXT` | How broadly this declaration applies across the donor's gifts | Expected to capture whether the declaration covers past gifts, future gifts, or both |
| `source` | `TEXT` | Where declaration came from | e.g. manual, form, import |
| `textVersion` | `TEXT` | Wording/version used | Important for auditability |
| `revokedAt` | `DATE_TIME` | When declaration was revoked, if applicable | Optional |
| `notes` | `TEXT` | Lightweight operational note | Avoid using as primary state model |

`coverageScope` is intended to answer a practical question during gift evaluation: does this declaration apply only from the declaration date forward, or can it also support past gifts according to the declaration wording and operating rules. We do not need to lock the exact value set yet, but that is the purpose of the field.

### Not recommended in v1

| Field | Reason |
| --- | --- |
| file attachment linkage | Useful later, not needed for first slice |
| dense validation/case fields | Pushes too quickly toward specialist admin tooling |

## 6. `GiftAidClaimBatch` Field Proposal

`GiftAidClaimBatch` should represent both the current draft claim and historical submitted claims.

### Recommended fields

| Field | Type | Purpose | Notes |
| --- | --- | --- | --- |
| `status` | `TEXT` | Claim batch lifecycle | Expected values: `draft`, `submitted` |
| `periodLabel` | `TEXT` | Human-readable batch/period label | Keep flexible for v1 |
| `submittedAt` | `DATE_TIME` | When the draft became submitted | In v1, submission means internally finalized |
| `giftCount` | `NUMBER` | Count of gifts currently in the batch | Derived summary |
| `totalAmount` | `CURRENCY` | Total claimable amount in the batch | Derived summary |
| `hasBlockingIssues` | `BOOLEAN` | Whether the current draft contains gifts that block submission | Derived from linked gift state |
| `blockingIssueCount` | `NUMBER` | Count of linked gifts currently blocking submission | Derived from linked gift state |
| `notes` | `TEXT` | Lightweight operational note | Optional |

### Recommended invariants

- one current open `draft` batch per workspace;
- a submitted batch is immutable in composition;
- gifts in a submitted batch are treated as claimed;
- lightweight blocking summary should make the draft usable as a real review queue without adding a heavy lifecycle model;
- `GiftAidClaimBatch` is the future anchor for HMRC submission integration.

### Not recommended in v1

| Field | Reason |
| --- | --- |
| HMRC submission ID | Out of scope until actual gateway/export work |
| accepted/rejected/paid fields | Later lifecycle extension |
| export/transmission timestamps beyond `submittedAt` | `submittedAt` is sufficient for v1 |

## 7. Controlled Value Sets

### `giftAidStatus`

- `claimable`
- `not_claimable`
- `needs_review`

### `giftAidDecisionSource`

- `system`
- `manual_override`

### `GiftAidClaimBatch.status`

- `draft`
- `submitted`

### Initial `giftAidReasonCode` set

- `valid_declaration_present`
- `no_declaration_on_file`
- `donor_data_incomplete`
- `non_individual_donor`
- `manual_review_required`
- `gift_changed_after_assessment`
- `gift_refunded_or_reversed`

These should remain a small controlled set in v1.

## 8. Placeholder Replacement Map

| Current placeholder | Intended replacement |
| --- | --- |
| `Gift.giftAidEligible` | `giftAidStatus`, `giftAidReasonCode`, `giftAidDecisionSource`, `giftAidDeclaration`, `giftAidLastEvaluatedAt`, `giftAidClaimBatch` |
| `GiftStaging.giftAidEligible` | `giftAidRequested`, `giftAidDeclarationCaptured`, `giftAidDeclarationDate`, `giftAidCoverageScope`, `giftAidDeclarationSource`, `giftAidTextVersion`, `giftAidDeclaration` |
| `RecurringAgreement.giftAidDeclarationId` | De-emphasize as placeholder; do not treat as primary model |

## 9. Open Decisions Kept Deliberately Out Of The Provisioning Target

- whether `Gift` later needs a stored `giftAidClaimState` convenience field;
- exact controlled values for `coverageScope`;
- which specific Gift Aid fields are frozen on submitted gifts, beyond the general rule that Gift Aid-relevant fields should not drift.

## 10. Practical Next Step

Use this field proposal to produce:

1. a concrete `setup-schema.mjs` change plan
2. a DTO/type update plan for gift and staging payloads
3. a service-scaffolding plan for Gift Aid evaluation and claim-batch handling

### Suggested implementation sequence

To reduce churn, the likely order is:

1. provision new objects and fields in `setup-schema.mjs`
2. leave existing placeholder fields in place temporarily where needed for compatibility
3. update DTOs/types and staging/gift mapping to the new Gift Aid field shape
4. add Gift Aid service scaffolding and claim-batch behaviour
5. remove or de-emphasize placeholder fields once the new path is working

This sequence should be reviewed once more immediately before implementation, but it is a reasonable default path from the current codebase to the intended model.
