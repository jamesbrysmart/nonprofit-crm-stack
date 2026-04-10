# Gift Aid Service Behaviour (V1 Draft)

Updated: 2026-03-24  
Status: Exploratory design note (`trial`)  
Audience: Product, engineering, and AI tooling

This note defines the expected runtime behaviour of the Gift Aid service layer for v1.

Use it alongside:

- [gift-aid.md](/home/jamesbryant/workspace/dev-stack/docs/features/gift-aid.md)
- [gift-aid-implementation-shape.md](/home/jamesbryant/workspace/dev-stack/docs/features/gift-aid-implementation-shape.md)
- [gift-aid-schema-state.md](/home/jamesbryant/workspace/dev-stack/docs/features/gift-aid-schema-state.md)

The aim is to keep the operational model deterministic, automated on the happy path, and easy to reason about.

## 1. Service Responsibilities

The Gift Aid service should be responsible for:

- evaluating gift-level Gift Aid outcome;
- resolving declaration applicability for a specific gift;
- assigning reason codes;
- adding or removing gifts from the current draft claim;
- maintaining draft-claim totals;
- finalizing a draft claim into a submitted claim;
- enforcing freeze behaviour for submitted claims and claimed gifts;
- emitting enough audit/history information to explain what changed.

It should not become a specialist case-management subsystem in v1.

## 2. Evaluation Triggers

The service should evaluate or re-evaluate a gift when relevant facts change, including:

- gift creation;
- gift update;
- staging creation or update;
- staging processing into a final gift;
- declaration creation;
- declaration update, revocation, or supersession;
- donor merge;
- material donor correction relevant to Gift Aid;
- gift reassignment;
- gift refund or reversal.

The general rule is:

- when a fact changes that could affect claimability, the service should recalculate deterministically;
- when no Gift Aid-relevant fact has changed, the service should not churn state unnecessarily.

## 3. Gift Evaluation Rules

For a given gift, the service should:

1. identify the relevant donor context;
2. resolve whether an applicable declaration exists for that specific gift;
3. derive the gift's current outcome:
   - `claimable`
   - `not_claimable`
   - `needs_review`
4. assign a structured reason code;
5. persist the current outcome on the gift.

Important behaviour:

- declaration history belongs to the individual, but applicability is evaluated per gift;
- `needs_review` should be used when the service lacks confidence, not as a generic failure bucket;
- the service should prefer explicit outcomes over silent omission.

### Determination rules

For v1, the service should use the following lean determination split.

`claimable`:

- donor resolves to an individual person;
- a usable declaration exists;
- the declaration is applicable to the gift date;
- the donor has a sufficient home address;
- the gift is not refunded or reversed;
- the gift has not already been claimed.

`not_claimable`:

- donor is a company or organisation rather than an individual;
- there is no identifiable individual donor;
- the gift has been refunded or reversed;
- the gift has already been claimed;
- the declaration was revoked before the gift date.

`needs_review`:

- declaration exists but address is missing or incomplete;
- Gift Aid is indicated but no usable declaration is currently available;
- declaration timing or coverage is ambiguous;
- multiple declarations could plausibly apply;
- donor identity resolution is incomplete;
- a merge, reassignment, or later edit has made applicability unclear.

Important clarification:

- a declaration alone is not enough for `claimable`;
- a sufficient home address is part of the minimum claimable rule set;
- missing address should normally be treated as `needs_review`, not `not_claimable`, unless the record is clearly unrecoverable.

For retrospective coverage, the working v1 rule should be:

- a declaration applies when its date is on or before the gift date; or
- it explicitly supports retrospective coverage and the gift falls inside that retrospective window.

### First implementation scope

For the first implemented determination pass, the service should actively enforce:

- individual vs non-individual donor distinction;
- identifiable donor requirement;
- declaration applicability for the specific gift;
- sufficient home address as part of the minimum `claimable` rule.

For the same first pass, the following should remain explicitly deferred even though they still belong to the broader Gift Aid model:

- refund or reversal effects on claimability;
- already-claimed exclusion until claim-batch behaviour is in place;
- richer ambiguity handling where multiple declarations may apply;
- deeper retrospective edge cases beyond the lean retrospective-coverage rule;
- sponsorship treatment;
- Gift Aid Small Donations Scheme handling.

## 4. Draft-Claim Inclusion Rules

### Auto-add

If a final `Gift` evaluates to `claimable` and is not already part of a submitted claim:

- create the current open draft claim if one does not already exist;
- add it to the current open draft claim;
- link it to that draft claim;
- update draft totals.

This should happen whenever a final gift becomes `claimable`, including:

- initial final gift creation after staging processing or direct final creation;
- later deterministic re-evaluation when a previously unresolved gift becomes `claimable`.

### Exclusion

If a gift evaluates to `needs_review` or `not_claimable`:

- ensure the issue is visible through normal operational surfaces;
- do not allow unresolved Gift Aid issues to disappear silently from draft review.

### Removal from draft

If a gift is currently in the draft claim and routine re-evaluation changes it away from `claimable`, the service must:

- keep the gift in the current draft claim;
- flag it clearly as problematic in draft review;
- block submission until the issue is resolved or explicitly addressed.

The current draft claim should behave as a review-first working queue, not as a silently self-cleaning set.

## 5. Staging Behaviour

Staging is the main review surface for donor and data resolution before final gift creation.

The service should:

- capture Gift Aid request and declaration facts needed for later processing;
- avoid attaching staging records to draft claims;
- re-run Gift Aid evaluation when a staging record is processed into a final gift.

Staging should remain the home for donor-resolution and intake exceptions, not the place users manually assemble claims.

Important distinction:

- staging Gift Aid signals should be treated as speculative or advisory;
- authoritative Gift Aid determination should happen only after donor resolution, at or after the point the record is marked ready for processing into a final gift.

In practice, this means:

- staging should use intake and payload information to capture Gift Aid request and declaration facts;
- staging should not be required to derive a fully trusted `claimable` outcome while donor identity and donor record linkage are still unsettled;
- final `Gift` records, not staging rows, should carry the authoritative Gift Aid outcome used for claim preparation.

Operational implication:

- early staging should avoid unnecessary Gift Aid-specific lookup work;
- donor resolution may still happen as part of staging because that is core to the staging queue itself;
- declaration lookups and fuller donor-context checks become more justified later, once the Gift Aid result is operationally meaningful.

Declaration-specific clarification:

- declaration existence is not the same as declaration usability;
- a `GiftAidDeclaration` may exist but still be insufficient until donor identity, donor address, or other required declaration facts are complete;
- final gift determination should therefore depend on a usable declaration, not simply on declaration presence.

## 6. Submission Behaviour

When a user submits the current draft claim, the service should:

- change the batch status from `draft` to `submitted`;
- stamp `submittedAt`;
- freeze batch composition;
- freeze Gift Aid-relevant fields on included gifts for audit and export reproducibility;
- treat those gifts as `claimed`;
- create the next current open draft claim for future eligible gifts.

For v1, `submitted` means:

- internally finalized;
- immutable;
- ready for HMRC export or later submission automation;
- not yet actually sent to HMRC.

Current backend surface:

- a read-only `current-draft` workflow endpoint can return the current draft batch or `null` if none exists yet;
- a submit workflow endpoint can finalize a clean draft batch and return the submitted batch plus the next draft batch;
- these are workflow endpoints, not a full generic claim-batch CRUD surface.

## 7. Freeze Rules

Once a gift belongs to a submitted claim:

- routine Gift Aid re-evaluation must not silently rewrite its claim history;
- routine processing must not add it to a different draft claim;
- routine processing must not remove it from the submitted claim;
- routine processing must not mutate Gift Aid-relevant fields that were frozen on submission.

If later information suggests a submitted claim contains an issue:

- surface that as explicit follow-up work;
- do not mutate the submitted claim as part of normal background processing.

Current implementation limitation:

- the first freeze implementation is enforced in `fundraising-service` update flows;
- it protects against routine drift through our managed backend paths;
- it does not yet guarantee immutability if a user edits the underlying `Gift` record directly in the Twenty UI or through another write path outside this service layer.

This means the v1 freeze model is operationally useful but not yet a complete platform-level control. Later iterations will likely need stronger protection through submit-time snapshotting, UI restrictions, or both.

## 8. Audit Expectations

The service should record enough information to explain:

- why a gift has its current Gift Aid outcome;
- when a gift entered the draft claim;
- when a gift was removed from the draft claim and why;
- when a draft claim was submitted;
- which gifts became frozen as part of submission.

Audit in v1 should stay lightweight. The goal is operational explainability, not a full compliance event engine.

## 9. What Routine Processing Must Not Do

Routine service behaviour in v1 must not:

- create multiple concurrent draft claims for the same workspace;
- auto-add `needs_review` gifts to the draft claim;
- edit submitted batch composition;
- silently mutate claimed gifts after submission;
- imply that `submitted` means transmitted to HMRC.

## 10. Open Questions

- which exact gift fields should be considered "Gift Aid-relevant" and therefore frozen on submission;
- whether manual override should also move a gift into the current draft claim, or whether that requires a separate explicit action;
- what level of audit detail is sufficient without over-modeling the event history;
- whether any recalculation paths should be deferred or asynchronous in the first implementation.

## 11. Related Docs

- `docs/features/gift-aid.md`
- `docs/features/gift-aid-implementation-shape.md`
- `docs/features/gift-aid-schema-state.md`
