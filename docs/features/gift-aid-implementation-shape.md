# Gift Aid Implementation Shape (V1, Exploratory)

Updated: 2026-03-24  
Status: Exploratory implementation draft (`trial`)  
Audience: Product, engineering, and AI tooling

This document translates [gift-aid.md](/home/jamesbryant/workspace/dev-stack/docs/features/gift-aid.md) into a provisional implementation shape for v1.

The aim is to support a **lean but competitive** Gift Aid model: automated on the happy path, clear on exceptions, and simple enough to extend later.

## 1. Assumptions

For v1, assume:

- Gift Aid is a workspace-optional capability and is off by default;
- it should affect normal donation handling rather than creating a separate back-office island;
- straightforward claimable gifts should flow into a current draft claim automatically;
- unresolved cases should surface in existing review flows;
- HMRC submission should be an obvious later addition, but not a required v1 dependency.

## 2. Provisional Object Model

### `Gift`

`Gift` remains the final operational donation record.

Recommended Gift Aid fields:

- `giftAidStatus`
- `giftAidReasonCode`
- `giftAidDecisionSource`
- `giftAidDeclarationId`
- `giftAidLastEvaluatedAt`
- a draft-claim linkage or claim-state field once the first claim flow is locked

Why:

- the gift needs an explicit current operational outcome;
- staff should not have to infer claimability from donor records alone;
- automatic draft-claim assembly is hard to reason about without stored outcome fields.

### `GiftStaging`

`GiftStaging` remains the review boundary for uncertain or incomplete records.

Recommended Gift Aid fields:

- `giftAidRequested`
- `giftAidDeclarationCaptured`
- `giftAidDeclarationDate`
- `giftAidCoverageScope`
- `giftAidDeclarationSource`
- `giftAidTextVersion`
- `giftAidDeclarationId`

Current leaning:

- explicit Gift Aid request/capture fields on staging;
- no authoritative Gift Aid outcome on staging;
- diagnostics only for deeper technical detail.

### `GiftAidDeclaration`

Current recommendation: introduce a dedicated custom object for declaration history in v1.

Provisional fields:

- `personId`
- `status`
- `statusReason`
- `declarationDate`
- `coverageScope`
- `source`
- `textVersion`
- `notes`
- `revokedAt`

Why:

- declaration history is distinct from gifts;
- multiple declarations over time should be possible from the start;
- declaration existence and declaration usability need to be separable;
- a dedicated object keeps imports and auditability cleaner than overloading `Person`.

### `GiftAidClaimBatch` or equivalent

Current recommendation: represent the draft claim explicitly rather than treating it as an invisible export side effect.

Provisional fields:

- `status`
- `exportedAt`
- `periodLabel`
- `notes`
- `giftCount`
- `totalAmount`

Working interpretation:

- one current open batch acts as the draft claim for the workspace;
- submitting that batch closes it and the next draft claim becomes the current open batch;
- reviewed/submitted batches provide the history of what was claimed together.

This does not need to be a full claim workflow object. A minimal lifecycle is enough:

- `draft`
- `submitted`

It only needs to support:

- automatic draft-claim assembly;
- review/export/submission handoff;
- double-claim prevention;
- freezing of already-claimed gifts from routine drift.

### `Person`

Keep `Person` lean. Do not store full declaration history there.

Possible later summary fields:

- `hasActiveGiftAidDeclaration`
- `activeGiftAidDeclarationId`

These are convenience fields, not the canonical model.

### `RecurringAgreement`

Treat existing Gift Aid linkage on recurring agreements as placeholder only.

Current recommendation:

- recurring agreements may reference a declaration later if operationally useful;
- they should not become the primary home of Gift Aid logic.

## 3. Behaviour Rules

### Core statuses

Working values:

- `claimable`
- `not_claimable`
- `needs_review`

`giftAidReasonCode` should use a small controlled set. `giftAidDecisionSource` should distinguish at least:

- `system`
- `manual_override`

### Manually recorded vs system-derived

Humans should record facts:

- declaration creation or revocation;
- manual overrides where policy allows;
- notes explaining manual intervention.

The system should derive:

- current gift-level Gift Aid outcome;
- reason code;
- linked declaration where applicable to that specific gift;
- whether the gift should join the current draft claim;
- re-evaluation after defined trigger events.

### Recalculation

Current recommendation for v1:

- evaluate on gift create;
- evaluate on staging create/update;
- re-evaluate on staging processing;
- re-evaluate on gift update;
- re-evaluate on refund or reversal;
- re-evaluate on donor merge where feasible;
- re-evaluate when declaration context changes.

Where the result is straightforward and claimable:

- add or keep the gift in the current draft claim automatically;
- remove or hold it back when a later change creates uncertainty.

Where the result is `needs_review`:

- keep the gift outside the current draft claim until resolved or manually overridden.

Once a gift has been claimed:

- do not allow ordinary automatic re-evaluation to silently rewrite claim history;
- treat later corrections as explicit follow-up work.

### Behavioural stance

Current leaning for v1:

- guided automation, not passive flagging;
- deterministic re-evaluation when known facts change;
- no hidden automation for unresolved ambiguity.

## 4. Operational Surfaces

### Intake

When the capability is enabled:

- show current declaration context if available;
- allow simple inline declaration capture where the intake flow already supports it;
- avoid dense Gift Aid-specific data entry in the core form.

### Staging

Staging should be the primary review surface for unresolved Gift Aid cases.

Why:

- it already exists as the review boundary for messy data;
- it is the most understandable place for exceptions;
- it avoids inventing a second exception-handling subsystem too early.

Important refinement:

- staging should be the home for exceptions;
- it should not become the place staff manually assemble ordinary claims.

### Final record views

Gift and Person views should show Gift Aid context clearly, but should not become the main review workflow in v1.

### Draft-claim review

The first claim surface should let staff:

- see which gifts are in the current draft claim;
- see which gifts are excluded and why;
- review totals;
- approve/export/submit the draft claim.

Current UX leaning:

- treat the current draft claim as the primary entry point;
- provide a secondary `Needs review` view for unresolved gifts outside the claim;
- prefer the existing parent/workspace record-browser shell if it fits cleanly;
- do not force Gift Aid into the current staging layout if a better summary/list/drawer balance emerges.

## 5. Service and Integration Shape

### Gift Aid service/module

Current recommendation:

- add a focused Gift Aid service/module inside `fundraising-service`.

Responsibilities:

- derive current gift outcome;
- apply reason codes;
- resolve linked declaration where possible;
- determine draft-claim inclusion;
- expose recalculation helpers;
- create lightweight audit/history entries if modeled directly;
- support approval/export handoff for the claim container.

This should be a focused policy/orchestration service, not a large subsystem.

### Architectural separability

## 6. UI implementation principle

Gift Aid should actively look for reuse of the existing fundraising UI shell and shared operational primitives, including:

- scoped summary bands;
- parent/workspace-level record views;
- small predefined filter-chip sets;
- record lists with in-context drawer review.

But this is a product-quality goal second to the actual workflow need.

So the implementation rule should be:

- start from the current shared fundraising UI concepts;
- reuse code and interaction patterns where that improves consistency and implementation speed;
- do not treat current staging UI or Storybook examples as frozen rules;
- allow Gift Aid to adapt or refine the shared pattern if that produces a clearer draft-claim review workflow.

In practice, this means current staging should be treated as the strongest implementation reference we have so far, not as the final design system.

Even before we implement formal capability activation, Gift Aid should stay architecturally separable.

That means:

- core donation and staging flows should call into a bounded Gift Aid layer at orchestration boundaries;
- declaration lookup and Gift Aid policy should live inside that layer rather than being spread through generic gift-processing code;
- removing or bypassing Gift Aid later should not require untangling core fundraising behaviour.

### Current implementation notes

The current implementation has started to make this separation concrete:

- `GiftAidPolicyService` is attached at gift-preparation and staging-processing boundaries rather than embedded throughout core services;
- declaration resolution now happens inside the Gift Aid layer, which makes Gift Aid evaluation asynchronous at those boundaries because declaration context may need to be fetched from Twenty;
- this is acceptable for the current slice because those flows are already asynchronous overall and the goal is to keep Gift Aid-specific I/O inside the bounded capability layer.

Execution-order clarification:

- staging is primarily a donor-resolution and data-resolution queue, not the authoritative Gift Aid queue;
- staging should capture request and declaration facts, not a final Gift Aid outcome;
- authoritative Gift Aid determination should happen later, at or after the point the record is marked ready and processed into a final `Gift`;
- the Gift Aid claim queue should depend on final gift state, not on speculative staging state.

Important follow-up:

- if Gift Aid evaluation expands into bulk final-gift review, claim assembly, or broad re-evaluation flows, we should expect to add batched declaration-resolution and donor-context paths rather than relying on one lookup per record.

That batching concern is not a blocker for the current slice, but it should be treated as a likely next-level optimisation before broader Gift Aid automation is added.

Working rule:

- core donation processing should still make sense without Gift Aid logic present;
- Gift Aid behaviour should be attached at clear orchestration points, not scattered through generic code as inline special cases;
- shared batch/review flows should not assume Gift Aid is always active;
- if we later need workspace-level capability activation, the main work should be enabling or bypassing a focused Gift Aid layer, not untangling Gift Aid from core fundraising behaviour.

### Likely integration points

- gift normalization/create path;
- gift update path;
- staging create/update path;
- staging processing path;
- draft-claim batch update path;
- future refund/reversal paths;
- recurring agreement flows only where declaration linkage is genuinely helpful.

### Existing useful seams

The current architecture already gives us:

- metadata-backed custom fields provisioned through setup scripts;
- a service layer that normalizes and enriches gift payloads;
- staging as a proven review boundary;
- workflow-oriented custom UI patterns for manual entry and queue/drawer review.

Older Gift Aid-specific fields such as `giftAidEligible` and `giftAidDeclarationId` on recurring agreements should be treated as placeholders, not binding design constraints.

## 6. Open Implementation Questions

- should declaration history definitely start as its own object in the first slice;
- how much claim state belongs on the claim object versus directly on gifts;
- should staging use dedicated Gift Aid fields only, or also rely on `processingDiagnostics`;
- how far should retrospective recalculation go in v1;
- what is the cleanest workspace-level activation path for the capability;
- is HMRC submission a direct v1 concern or a fast-follow layer on top of the same draft/submitted claim model.

## 7. Related Docs

- `docs/features/gift-aid.md`
- `docs/spikes/toggleable-capabilities-architecture.md`
