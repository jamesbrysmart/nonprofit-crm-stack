# Migration Working Patterns

This note captures working patterns that have emerged during the Twenty app migration.

It is intentionally provisional.

- It is not a locked architecture spec.
- It should be updated as we learn more.
- If we find a better approach, replace the older pattern rather than trying to preserve it for its own sake.

The purpose of this doc is to preserve useful migration context between sessions so we do not keep rediscovering the same patterns from scratch.

It should also be treated as the main place to capture cross-cutting implementation constraints and "do not assume X" guidance that future sessions need in order to avoid introducing workflow bugs while simplifying the app.

## Unexpected Or Unresolved Behaviors

Use this doc as the main place to record behaviors we observe in the app or in testing that are:

- unexpected
- not yet fully explained
- potentially a Twenty Apps/platform behavior
- potentially an app bug or test mistake on our side
- worth re-checking later as Twenty evolves or more evidence appears

The point is not to turn every oddity into architecture. The point is to avoid rediscovering the same behavior repeatedly, or "fixing" something later without realizing it was already investigated.

When adding one of these notes, keep it short and use this shape:

- `Observation`
- `Current understanding`
- `Impact on app code or tests`
- `What to re-check later`

Current example:

- `Observation`
  - in the Stripe one-off staging path, the app-side builder now produces `providerAgreementId: null` for "no subscription", but persisted `giftStaging` reads in integration tests currently return `providerAgreementId: ''`
- `Current understanding`
  - write-side intent should remain `null`
  - the empty string appears to be a current read/persistence behavior of the platform for this nullable text field, not business meaning we want to preserve in app code
- `Impact on app code or tests`
  - unit tests should assert the app builder contract (`null`)
  - integration tests that read the persisted `giftStaging` record should currently expect `''`
- `What to re-check later`
  - verify this behavior on future Twenty updates
  - if the platform starts round-tripping nullable text fields as `null`, simplify the integration expectation and remove the special note
  - if we find broader evidence of nullable text fields normalizing to empty string, treat that as a platform-wide read-model constraint rather than a one-off test quirk

Current example:

- `Observation`
  - raw app `yarn typecheck` now surfaces only `Module '"twenty-sdk/ui"' has no exported member 'Button'` errors, even though `Button` is part of Twenty's documented front-component UI surface and exists at runtime
- `Current understanding`
  - this is a current upstream SDK type-surface mismatch rather than a reason to rewrite app UI away from `twenty-sdk/ui`
- `Impact on app code or tests`
  - keep raw `yarn typecheck` in the session loop for app-touching work
  - do not replace it with a filtered command, baseline file, or custom ignore rule just because this one upstream mismatch exists
  - future sessions should report whether typecheck fails only on this known mismatch or whether new app-owned errors have appeared
- `What to re-check later`
  - rerun raw `yarn typecheck` on Twenty SDK/tooling upgrades
  - remove this note if the upstream type surface is corrected
  - if Twenty publishes a more standard query/typecheck workflow, prefer that over local convention

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

Rollup maintenance policy for the fundraising app:

- app-owned gift creation paths should explicitly refresh affected rollups once per affected set;
- bulk gift processing should coalesce rollup side effects after committed gift creation rather than relying on one row-level trigger per created gift;
- `gift.updated`, `gift.deleted`, and `gift.restored` database-event triggers are integrity backstops for native edits and out-of-band changes;
- do not register `gift.created` rollup triggers for v1 unless native/out-of-band gift creation becomes a supported create path;
- if a route mutation updates a committed gift field already covered by a database-event trigger, avoid also running the same rollup recompute inside the route unless testing shows the trigger does not fire for app route writes;
- full recompute routes remain repair/backfill tools, not the normal hot path.

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

Current platform boundary for workspace customization:

- if the fundraising app manifest defines a metadata entity, app sync/update may reapply that definition later;
- client/workspace edits to the same app-owned entity should not be treated as durable configuration unless Twenty ships and we verify a native override/precedence model;
- this applies especially to page layouts, page-layout tabs/widgets, views/view fields, and `SELECT`/enum option lists.

Current understanding from Twenty:

- native app/workspace override ownership is still under active design;
- apps do not currently have a stable native way to declare "default, but preserve workspace override" behavior;
- enum options are expected to become syncable entities in a future release, but that is not a current contract we should depend on.

Practical rule for v1:

- use app-owned layouts as product defaults, not as client-owned customization surfaces;
- if clients need persistent local layout changes, prefer separate client-created layouts/views/tabs where possible rather than editing the app-owned ones;
- use app-owned `SELECT` fields only for closed workflow state owned by the product, such as processing status, readiness state, or submission status;
- avoid app-owned `SELECT` for client-extensible or integration-extensible values such as providers, source categories, and local fundraising taxonomies;
- for client-configurable concepts, prefer records such as `Appeal`, `AppealSource`, and `Fund`, or use text fields when the value is provider/integration supplied.

What to re-check later:

- whether Twenty adds a native app override API or workspace-level configuration-as-code model;
- whether syncable enum options allow safe app-owned defaults plus workspace-owned additions;
- whether deployment tooling can preserve or report client edits to app-owned metadata before applying updates.

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

## 10. Keep Raw Typecheck In The Loop

Current leaning:

- run raw app `yarn typecheck` during app-touching sessions often enough that type drift does not build up unnoticed
- treat it as a current working guardrail, not a once-in-a-while cleanup exercise
- do not hide known upstream SDK issues inside filtered commands or custom ignore layers

Why:

- the app can stay functionally "working" while query contracts, nullability assumptions, or refactors drift underneath it
- once drift compounds across multiple features, the cleanup cost grows much faster than the individual fixes would have
- a raw signal is more useful than a locally-sanitized one when Twenty itself is still evolving

Current practical rule:

- for app code changes, run raw `yarn typecheck` and report the outcome
- if it fails only on a currently known upstream mismatch, note that explicitly
- if any new non-upstream errors appear, treat that as real follow-up work rather than noise
- when Twenty releases change the SDK/tooling, re-check the known mismatch before assuming local workarounds are still justified

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

## 12. Operational Surfaces Need Fresh State, Not Universal Reactivity

Current leaning:

- classify widgets and record surfaces by operator trust requirement
- refresh operational decision surfaces explicitly
- leave audit/detail surfaces snapshot-at-open by default unless stale data is proven harmful
- treat `reactive by default` as a cost to justify, not a hygiene improvement

Why:

- some surfaces are operational control loops where stale state can change the user's next action
- other surfaces are primarily inspection/history views where second-by-second freshness adds complexity without real product value
- blanket reactivity increases coordination complexity and frontend fragility without necessarily improving trust

Working classification:

- `live-trust surface`
  - the user may take immediate action based on the displayed state
  - stale data could lead to the wrong operator decision
  - explicit refresh or invalidation is required
- `snapshot-at-open surface`
  - the user is mainly inspecting, reviewing history, or reading details
  - stale-while-open is acceptable unless a concrete workflow shows otherwise

Current examples:

- `giftStaging` review widgets: live-trust
- `giftBatch` summary/actions/worklists: live-trust
- `gift-aid-claim-submission-record.front-component.tsx`: snapshot-at-open by default
- recurring review widgets: decide from actual workflow semantics, not component similarity

Working implication:

- prefer narrow record-scoped invalidation over global reactivity
- do not standardize on always-live widgets
- when a new surface is built, ask whether stale data could change the next user action

## 13. Multi-Widget Record Pages Need Explicit Sync

Problem:

- front-component widgets on the same record page should be treated as isolated by default
- a mutation in one widget does not automatically refresh sibling widgets showing related state
- this creates a front-end state problem: keeping the page coherent after a record update

Options considered:

- rely on Twenty to provide page-level refresh or shared record invalidation
- use an app-owned browser-level invalidation signal between widgets
- build a richer shared client-side state layer across widgets

Current choice:

- use a narrow `BroadcastChannel` invalidation pattern for record-scoped widget refresh
- keep the payload minimal, ideally object + record scoped
- use it only to trigger local refetch, not to share durable UI state

Why:

- each front-component widget is rendered separately and currently runs in its own worker runtime
- one widget mutating a record does not automatically refresh sibling widgets on the same page
- `BroadcastChannel` has worked as a lightweight same-record refresh mechanism in the current runtime
- it keeps the state of truth in Twenty rather than moving workflow logic into the browser
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
- do not assume internal Twenty frontend state tools such as `Jotai` are part of the app contract unless the app SDK exposes them

## 14. Some Objects Are Workflow-Owned, Not Natively Mutable

Current leaning:

- treat some application objects as workflow-owned rather than generally editable through Twenty's native create/edit surfaces
- where that is the case, prefer explicit app actions and logic functions over generic native object mutation
- do not assume every object that exists in Twenty should remain normally creatable/editable through the default UI

Why:

- Twenty's native `New record` path creates the record first and then opens the ordinary record page or side panel
- for workflow-heavy objects, that means users can bypass the intended guided entry path and land in a review-oriented surface that is not designed as a create flow
- object-level permissions can hide the native create affordance, but they are currently too blunt to express "allow this object to be created through app workflows but not through the generic native create UI"
- in practice, this can make it safer to disable broad native mutation for some objects and replace it with explicit app-owned actions

Current example:

- `Gift` is increasingly behaving like a workflow-owned object
- the custom `New gift` entry path already uses app API calls and logic functions rather than Twenty's native record creation flow
- if we remove broad native edit/update access for `Gift`, the native `New record` affordance disappears, but the app-owned `New gift` workflow can still remain the supported creation path
- this is not "ordinary CRUD with a nicer shortcut"; it is a deliberate product boundary:
  - generic native mutation is restricted
  - supported mutation happens through explicit workflows such as:
    - manual gift creation
    - refund actions
    - later app-owned amendment/review actions where needed

Working implication:

- future sessions should not casually suggest "let the user just edit the `Gift` record" without first checking whether that object is intended to remain natively mutable
- when an object is workflow-owned, ask:
  - should users create this through Twenty's generic `New record` path?
  - should users update it through ordinary field editing?
  - or should mutation happen only through explicit app workflows/actions?
- if the answer is workflow-owned, design the user action as an app workflow first and treat native object editing as secondary or intentionally unavailable

Scope note:

- this is not a claim that every fundraising object should become locked down
- it is a warning against assuming that Twenty's native object mutation model is always the right product model for operational records
- likely candidates for this treatment are system- or workflow-owned records such as:
  - `Gift`
  - potentially `GiftAidClaimSubmission`
  - any future object where uncontrolled native create/edit would bypass important workflow rules or create misleading states

## 15. `giftBatch` And Bulk Selection Solve Different Problems

Current leaning:

- support both persisted batch-scoped staging workflows and unbatched bulk actions over selected `giftStaging` rows
- do not assume every intake source should create a `giftBatch`
- do not assume bulk multi-select makes `giftBatch` unnecessary

Why:

- a `giftBatch` is a persisted operational grouping
- bulk multi-select is an ad hoc user selection
- those support different workflows even when the underlying row actions are similar

Working distinction:

- use `giftBatch` when the intake source naturally represents a durable set that users need to return to as a unit
  - examples:
    - CSV import
    - file-style provider import
    - reconciliation or payout-style grouped intake
- use bulk selection when rows arrive or are reviewed as a broader queue and the grouping is temporary rather than intrinsic
  - examples:
    - trickle webhook intake
    - ad hoc cleanup/review work over staging rows from mixed sources

Important implication:

- integrations may legitimately use either model
- that choice should be made from intake shape and workflow need, not implementation convenience
- do not hardcode a rule that all integrations batch, and do not hardcode a rule that none do

What future sessions should not assume:

- `giftBatch` is not just "multi-record processing"
- bulk selection is not a replacement for persisted provenance, reconciliation scope, or expected count/total metadata
- when designing a new intake path, decide explicitly whether it needs:
  - a persisted operational scope (`giftBatch`)
  - or an unbatched staging flow plus bulk actions

Current expected direction:

- both paths are now intentionally supported:
  - persisted `giftBatch` workflows
  - unbatched `giftStaging` workflows with bulk selected-row actions
- integration-by-integration classification should still remain explicit rather than hardcoded globally
- current expected default:
  - real-time direct integrations such as Stripe one-off intake should normally enter as unbatched `giftStaging`
  - naturally grouped imports or sync sets should normally use `giftBatch`
- this is an expected default, not a hard rule:
  - organisations or future integration designs may still choose differently where the operational workflow clearly warrants it

Action-semantics guardrail:

- the same action name should mean the same thing at every scope:
  - one `giftStaging` row
  - many selected `giftStaging` rows
  - rows inside a `giftBatch`
- `Run donor match`, readiness checks, and processing should therefore reuse the same core semantics across:
  - single-record actions
  - selected-row bulk actions
  - batch actions
- only scope-specific differences should vary:
  - `giftBatch` adds persisted grouping, provenance, and optional expected count/total semantics
  - bulk selection does not

## 16. Use A Hybrid `CoreApiClient` Result-Typing Pattern

Current leaning:

- do not treat fully schema-typed `CoreApiClient` usage as an immediate repo-wide requirement
- do not keep expanding ad hoc `result?.field?.edges` access and mutation-result assumptions either
- use a small hybrid pattern that improves safety now and stays compatible with a stronger future typing model

Why:

- the generated Twenty client can type some query shapes well, but current app code and current internal Twenty apps still mix strict typing, local row types, and `as any`
- a full migration to schema-driven query typing would be a real refactor stream, not a small tidy-up
- leaving the current loose result-access pattern unchecked would keep spreading query-boundary drift through the app

Current working pattern:

- keep query shapes local rather than letting raw client results leak broadly
- where the generated client is ergonomic, prefer:
  - query helper functions
  - result types derived from `Awaited<ReturnType<typeof queryHelper>>`
- where connection-heavy result access is awkward, prefer the app helper in:
  - [core-api-results.ts](/home/jamesbryant/workspace/dev-stack/apps/fundraising/nonprofit-fundraising/src/core-api/core-api-results.ts)
- use small helpers such as:
  - `extractConnection`
  - `extractConnectionNodes`
  - `extractQueryRecord`
  - `extractMutationRecord`

What future sessions should not do by default:

- do not add fresh downstream `result?.x?.edges` chains when the helper pattern would do
- do not scatter new `as any` plus property access through loaders/services if a local extraction boundary is easy to add
- do not invent a large custom wrapper around `CoreApiClient` unless the small helper pattern has clearly stopped being enough

Why this is acceptable:

- it already hardens core workflows without changing product behavior
- it reduces drift between query results and local TypeScript assumptions
- it keeps open a future path toward stricter schema-derived typing if Twenty's client ergonomics improve or we decide to invest in a deeper migration later

Current proof points in `nonprofit-fundraising`:

- batch processing loaders and fallback create paths
- Gift Aid claim query/submission loaders
- donor and appeal rollups
- supporting query helpers such as appeal-source resolution and donor-viability lookups
