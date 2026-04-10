# Gift Aid Capability (Working Definition)

Updated: 2026-03-24  
Status: Exploratory working definition (`trial`)  
Audience: Product, engineering, and AI tooling

This document defines the current working product shape of Gift Aid as a **UK-only fundraising capability with a strongly automated happy path**.

Use it as the current reference for capability scope and operating model. Older Gift Aid references elsewhere in the repo should be treated as placeholder scaffolding unless they still fit this document.

## 1. Positioning

Gift Aid should be treated as an **operational layer over donations**, not as a separate specialist subsystem.

The intended posture is:

- the product should feel competitive with systems that automate routine Gift Aid work;
- routine cases should feel close to automatic;
- manual effort should concentrate on ambiguity, review, and approval;
- the capability should remain modular and optional because it is UK-only.

## 2. V1 Scope

### In scope

- individual-level Gift Aid declaration history;
- gift-level Gift Aid outcome derived from donor, declaration, and gift context;
- structured reason codes for claimability outcomes;
- deterministic re-evaluation when relevant donor, declaration, or gift facts change;
- lightweight auditability for system decisions and manual overrides;
- automatic inclusion of `claimable` gifts into a current draft claim;
- review/approval before submission, with safeguards against double-claiming.

### Out of scope for now

- a full HMRC claim lifecycle engine;
- heavy case-management or exception-handling workflows;
- dense declaration administration with many specialist branches;
- broad automation for exceptional scenarios such as refund clawbacks or deep retrospective back-claiming;
- large numbers of manually editable Gift Aid fields on each gift.

## 3. Operating Model

Gift Aid should behave as a **trustworthy operational layer attached to normal donation flow**.

The core pattern is:

1. a donor gives a gift;
2. the system evaluates the gift against current donor and declaration context;
3. the gift receives a current working outcome:
   - `claimable`
   - `not_claimable`
   - `needs_review`
4. only `claimable` gifts are added to the current draft claim automatically;
5. `needs_review` gifts remain outside the draft claim until resolved or manually overridden;
6. staff review and approve the draft claim before submission or export.

`needs_review` should mean "we do not currently have enough confidence to treat this as ready", not "open a specialist case".

At a minimum, `claimable` should imply:

- an identifiable individual donor;
- a usable declaration applicable to the gift;
- a sufficient home address;
- no refund, reversal, or prior claim state blocking eligibility.

### Behavioural stance

- gifts are auto-evaluated on creation;
- gifts are deterministically re-evaluated when relevant facts change;
- only `claimable` gifts are auto-added to the current draft claim;
- unresolved gifts are surfaced clearly rather than silently ignored;
- claimed gifts should not be automatically re-evaluated, so later changes do not quietly rewrite already-claimed history;
- the system should use guided automation, not opaque background behaviour for unresolved cases.

## 4. Core Data Concepts

### Declaration history

Gift Aid belongs to the **individual donor**, not to the household and not to the gift itself.

The declaration model needs to support:

- whether a person has a declaration on file;
- when it was made;
- which wording/version was used;
- whether it is currently usable;
- multiple historical declarations over time.

Important distinction:

- a declaration existing is a factual record;
- a declaration being usable is a later conclusion based on declaration state plus sufficient donor data.

### Gift Aid outcome on the gift

Each gift needs its own current Gift Aid outcome because claimability is assessed at gift level.

The gift should conceptually carry:

- `giftAidStatus`
- `giftAidReasonCode`
- `giftAidDeclarationId`
- `giftAidDecisionSource`

The aim is to store the current operational outcome, not a large amount of policy.

### Gift Aid capture on staging

`GiftStaging` should hold Gift Aid request and declaration-capture facts, not the authoritative Gift Aid outcome.

That means staging is the place to record things like:

- Gift Aid was requested;
- a declaration was captured in this flow;
- enough declaration metadata was captured to create a `GiftAidDeclaration` later if needed.

It should not be the place where the system decides a gift is truly `claimable`.

### Draft claim and submitted-claim grouping

We should preserve the operational concept of:

- one current open draft claim per workspace;
- `claimable` final gifts flow into that draft claim automatically, including later re-evaluation into `claimable`;
- the current draft is created lazily when the first `claimable` gift needs it;
- gifts that later become problematic remain visible in the draft and block submission until resolved;
- submitting a claim closes that draft and creates the next current draft claim;
- reviewed/submitted groupings that show what was claimed together;
- clear exclusion of gifts that need review;
- protection against double-claiming;
- historical stability for already-claimed gifts.

This should stay lightweight. It is an operational container, not a full specialist workflow subsystem.

## 5. Reason Codes

Use a small controlled reason-code set from day one rather than free-text explanations.

Illustrative first-pass codes:

- `valid_declaration_present`
- `no_declaration_on_file`
- `donor_data_incomplete`
- `non_individual_donor`
- `manual_review_required`
- `gift_changed_after_assessment`
- `gift_refunded_or_reversed`

The exact labels may evolve, but the principle should hold:

- machine-readable codes;
- plain-language UI explanations;
- no uncontrolled free text as the primary model.

## 6. Re-evaluation and Audit

Gift Aid should be treated as a maintained operational outcome, not a one-time manual field.

Re-evaluate when relevant facts change, including:

- declaration created, updated, superseded, or withdrawn;
- donor merged or materially corrected;
- gift created, edited, refunded, reversed, or reassigned.

Keep auditability light but sufficient to answer:

- what does the system currently think;
- why;
- what changed;
- did a person override it;
- did the gift enter or leave the draft claim;
- was the gift frozen because it had already been claimed.

## 7. Core Scenarios

### Happy path

A known individual donor gives a gift, a usable declaration exists or is captured clearly, the gift is marked `claimable`, and it is added to the draft claim automatically.

### Incomplete path

A gift records normally but is marked `needs_review` because declaration or donor context is incomplete. The UI should explain what is missing without turning donation processing into failure handling.

### Changed-after-entry path

If a gift or donor context changes after initial assessment, the outcome should be re-evaluated deterministically. Claimed gifts should not silently drift.

## 8. UX Implications

Likely surfaces:

- intake/manual entry: show declaration context and allow simple inline capture where appropriate;
- staging/review: surface unresolved Gift Aid cases before downstream actions;
- gift detail: show current status, reason, and linked declaration;
- donor/person detail: show declaration history;
- draft-claim review: show included gifts, excluded gifts, and reasons for exclusion.

### UX implementation stance

Gift Aid UI should aim for the best operational product shape first.

That means:

- reuse existing fundraising UI patterns and components where they genuinely help;
- prefer design consistency and code reuse as a secondary goal, not a hard constraint;
- treat current staging/gift-processing UI and Storybook patterns as implementation anchors and learning references, not as fixed templates;
- allow Gift Aid to refine the broader shared workflow model if it exposes a better arrangement of summary, record list, filters, and drawer review.

Current leaning:

- the first Gift Aid workspace should center on the current draft claim as the primary parent-level context;
- a secondary `Needs review` view should surface gifts that are not currently in the claim because they still need attention;
- both should try to compose the same broad record-browser shell used elsewhere in the fundraising UI, while staying free to adapt the emphasis if the Gift Aid workflow needs it.

## 9. Open Questions

- how far should retrospective re-evaluation go in v1;
- how much claim lifecycle state belongs on the claim container versus directly on gifts;
- what should happen when post-claim corrections are needed before we build richer correction workflows;
- which parts of Gift Aid should remain bundled together as one capability versus later enhancements.

## 10. Related Docs

- `docs/PROJECT_CONTEXT.md`
- `docs/features/gift-aid-implementation-shape.md`
- `docs/features/donation-intake-entry.md`
- `docs/features/recurring-donations.md`
