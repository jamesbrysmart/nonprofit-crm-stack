# Migration Working Patterns

This note captures working patterns that have emerged during the Twenty app migration.

It is intentionally provisional.

- It is not a locked architecture spec.
- It should be updated as we learn more.
- If we find a better approach, replace the older pattern rather than trying to preserve it for its own sake.

The purpose of this doc is to preserve useful migration context between sessions so we do not keep rediscovering the same patterns from scratch.

## 1. Native First, Custom Where It Matters

Current leaning:

- prefer native Twenty lists, views, tabs, `FIELDS` widgets, and layout tools first
- add custom front components where workflow-specific logic or review guidance is genuinely needed
- do not build custom UI just because we can if Twenty already provides a credible surface

Why:

- native surfaces are easier for organisations to configure
- users can often reorder, hide, or promote widgets without app-specific code
- this reduces the risk of building one rigid opinionated workspace too early

Examples from the pilot:

- `giftBatch` as a control surface, linking into native filtered `giftStaging` worklists
- `GiftAidClaimBatch` as a control surface, linking into native filtered `gift` worklists
- smaller custom blocks for review guidance, donor matching, and processing actions

## 2. Control Surface vs Work Surface

Current leaning:

- use one record/page as the control surface when the user needs summary, metrics, and batch-level actions
- use a native list or record surface as the work surface when the user needs to inspect or correct many individual records

Why:

- trying to make one page do both usually leads to dense card stacks, too much scrolling, and weak navigation
- larger batches or queues are handled better by native lists than by custom drawers pretending to be workspaces

Examples from the pilot:

- `giftBatch` coordinates donor matching and processing, but detailed work happens in `giftStaging`
- `GiftAidClaimBatch` coordinates draft-claim work, but detailed gift review happens in `gift`

## 3. The First Tab Often Behaves Like Home

Current leaning:

- treat the first record tab as a lean landing or signposting surface unless we have strong evidence it should carry dense working UI

Why:

- on full desktop record pages, the first visible tab is rendered differently from later tabs
- when more than one tab is visible, Twenty pins the first tab into a left-side column under the native summary card rather than leaving it in the main tab strip
- in drawer context, denser layouts can feel constrained
- `GRID` layouts become more valuable in full record view than in narrow side-panel space

What this suggests:

- keep the first tab short, high-signal, and operational
- use it for status, next action, summary, and signposts
- move fuller review/edit/detail surfaces into later tabs where needed
- treat efficient use of space as especially important on the first tab because width is structurally constrained there on desktop record pages
- treat second and later tabs as the better home for denser working layouts, side-by-side review blocks, and heavier `GRID` usage

Scope note:

- this pinned-first-tab behavior matters most on full desktop record pages
- it does not apply in the same way in the side panel, on mobile, or when there is only one visible tab

## 4. Prefer Building Blocks Over Monoliths

Current leaning:

- break review surfaces into smaller blocks where possible
- let Twenty layout assemble those blocks
- avoid one large custom component that tries to explain and control everything

Why:

- different organisations have different priorities
- different gift types make different secondary information important
- smaller blocks are easier to reorder, hide, or replace

Examples under active use:

- `Review state`
- `Donor match`
- `Processing`
- `More to review`
- potential Gift Aid blocks such as `Gift Aid state`, `Gift Aid declaration`, and `Gift Aid donor context`

This does not mean every small thing should become its own widget.

The point is to define meaningful blocks with clear responsibility, not fragment the UI unnecessarily.

## 5. Thin TypeScript Model Layer Between Raw Records And UI

Current leaning:

- use TypeScript to normalize raw Twenty records into review-oriented shapes before rendering
- derive operator-facing meaning in code rather than forcing front components to interpret raw record fields inline

Why:

- this keeps UI components simpler
- it gives us a place to express review logic without immediately promoting it into persisted metadata
- it helps us preserve consistent meaning across views, actions, and components

Examples:

- `staging-review-minimal/src/staging-review/staging-review.model.ts`
- `nonprofit-fundraising/src/gift-staging-review/gift-staging-review.model.ts`
- `nonprofit-fundraising/src/gift-batch-review/gift-batch-review.model.ts`
- `nonprofit-fundraising/src/recurring/recurring.model.ts`

This pattern is especially useful where we are still deciding whether a concept should remain derived or become stored metadata.

## 6. Be Careful About Promoting Derived Meaning Into Metadata

This remains an open cross-cutting question rather than a settled rule.

Current leaning:

- minimise metadata fields unless they are clearly justified
- prefer durable facts plus TypeScript-derived operational meaning where possible
- revisit borderline cases deliberately rather than letting similar concepts drift into different patterns accidentally

Why this matters:

- if operator-facing conclusions are stored too early, they can become stale or misleading
- if everything is only derived at render time, some workflows may become harder to filter, report on, or operationalize

Examples we should keep reviewing consistently:

- processing readiness and review meaning
- Gift Aid operational outcome
- recurring health or operational status
- reconciliation or matching signals

Supporting context already exists in:

- [PRODUCT_REVIEW.md](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/PRODUCT_REVIEW.md)
- [PILOT_APP_IMPLEMENTATION_PLAN.md](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/PILOT_APP_IMPLEMENTATION_PLAN.md)

Current working clarification:

- if the main value of a summary is page-local operator interpretation, keep it in the TypeScript model layer by default;
- if the value must support native filtering, sorting, segmentation, or reporting, materialized fields can be justified;
- when materialized summaries are justified, keep the recompute logic in a shared module and prefer set-aware orchestration boundaries over row-level trigger fan-out.

Current example:

- donor giving summaries on `person` in `nonprofit-fundraising` now use materialized fields for `lastGiftDate`, `lifetimeGiftAmount`, and `lifetimeGiftCount`,
- with a shared recompute module called from manual gift creation, batch processing, and a manual rebuild route,
- plus a daily cron reconciliation path for import/setup repair and ongoing drift correction,
- while narrow `databaseEvent` triggers act as integrity backstops for out-of-band edits rather than the main maintenance path.

## 7. Capability Boundaries Should Stay Visible, Even If Not Fully Solved Yet

Current leaning:

- treat optional capabilities such as Gift Aid as bounded parts of the product
- avoid letting optional concerns leak everywhere by default
- but do not disappear into implementation rabbit holes before we understand the user-facing building blocks

Why:

- Twenty may offer several ways to hide, show, or configure capability-specific UI
- we can often keep capabilities modular in practice before we fully solve activation and packaging

This means we should aim for:

- modular capability-specific blocks
- bounded record tabs or work surfaces where appropriate
- a strong default layout that does not assume every organisation wants every capability equally prominent

## 8. Update This Note As We Learn

This doc is only useful if it stays honest.

When a pattern changes:

- update the note rather than layering a contradictory aside onto it
- replace weak patterns with better ones
- keep examples grounded in the pilot app work we have actually done

If a pattern turns out not to hold, the correction is more valuable than preserving old wording.

## 9. Treat Tab Identity As Real Runtime State

Current leaning:

- when a record tab changes structural shape materially, prefer a fresh tab identity over mutating an older tab in place

Why:

- Twenty can preserve older full-tab/runtime behavior even when the page-layout code now declares a multi-widget tab
- this has already shown up in pilot work where an existing single-widget tab did not reliably become a normal multi-widget tab until we created a fresh replacement

Examples:

- `giftStaging` `Review` vs `Review v2`
- `gift` `Gift Aid` vs `Gift Aid v2`

Working implication:

- treat tab identity as part of the runtime behavior, not just a cosmetic label
- if a tab is moving from one full-tab widget to multiple widgets, assume a fresh tab is the safer path unless proven otherwise

## 10. Multi-Widget Record Pages Need Explicit Sync

Current leaning:

- treat sibling front components on the same record page as isolated by default

## 11. Prefer Nested Relation Writes

Current leaning:

- prefer nested relation writes such as `record: { connect: { where: { id } } }` when assigning or changing relations in app mutations
- treat flat join-column writes such as `recordId` or `personId` as supported but secondary
- allow flat `...Id` writes where they are clearly simpler and intentional, especially:
  - single-parent create flows where the meaning is obvious
  - clearing a relation with `...Id: null`
  - filters/selects where the join column is the natural query surface

Why:

- nested relation writes match the GraphQL mutation shape more explicitly
- they are easier to read when a mutation touches several relations at once
- they keep relation intent clearer than a mix of payload fields that can look like ordinary scalar data

Scope note:

- this is a working preference, not a claim that flat join-column writes are invalid
- Twenty exposes join columns for many-to-one relations, so both styles can work
- the goal is consistency and readability across sessions, not refactoring working code for style alone
- if multiple widgets on the same record need to stay coherent after mutations, add an explicit sync strategy
- prefer narrow record-scoped invalidation over broad page-wide refreshes

Why:

- each front-component widget is rendered separately and currently runs in its own worker runtime
- one widget mutating a record does not automatically refresh sibling widgets on the same page
- this can leave the most important summary widgets visibly stale immediately after a user action

What we have tested so far:

- on `giftStaging` record review, separate widgets were loading their own copies of the record and drifting out of sync
- a browser-level `BroadcastChannel` invalidation signal appears to work as a lightweight same-record refresh mechanism across sibling widgets

Important caveat:

- `BroadcastChannel` is not a documented Twenty front-component feature
- it is a browser/runtime-level experiment that appears viable in the current worker-based front-component runtime
- treat it as a provisional app pattern, not a stable Twenty contract

Working implication:

- keep this pattern scoped to operational multi-widget record pages where coherence matters
- use it for invalidation only, not general widget-to-widget messaging
- keep the payload narrow, ideally object + record scoped
- reassess if Twenty later provides native page-level invalidation or shared record refresh support
