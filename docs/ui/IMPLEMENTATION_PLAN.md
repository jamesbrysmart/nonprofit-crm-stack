# Custom UI Implementation Plan (Working)

Updated: 2026-03-11
Status: Exploratory plan (`trial`)
Scope: UI/UX implementation approach for workflow-heavy custom app pages, starting with Gift Staging.

This is an implementation experiment, not final design policy. We expect to iterate.

## 0. Interpretation (Important)

- This document captures current hypotheses for improving UI consistency and quality.
- It should not be read as permanent rules.
- If implementation evidence contradicts a section, update the section instead of forcing compliance.
- This process explicitly includes learning from Twenty Apps evolution as that surface matures.

## 1. Goal

Establish a reusable, minimal, Twenty-aligned custom UI foundation for workflow-heavy custom app pages that need more flexibility than standard list/detail interactions.

Initial anchor flow:
- Gift staging / batch / dedupe / processing.

Target follow-on flows:
- Case management.
- Membership management (applications, memberships, payments, donor links).

Scope note:
- This baseline is intended for cross-domain custom app workflows, not only fundraising flows.
- Use it when users triage many records and execute defined multi-step actions.
- Do not force this pattern onto simple CRUD/detail pages where native Twenty interactions are sufficient.

## 2. Foundation Pattern (Current Hypothesis)

Use a common page shell:

1. `Summary band` (top): key metrics, scoped controls, high-signal actions.
2. `Record surface` (main): queue/table, list, or card surface depending on workflow.
3. `Action drawer` (right): record-specific workspace where that improves continuity.
4. `Feedback lane`: clear action outcomes (inline + toast) where useful.

Notes:
- Drawer is usually the task workspace for the selected record, not the full record page.
- Keep diagnostics/details progressively disclosed to avoid clutter.
- This shell is the current baseline candidate for consistency, not a strict boundary; extend or diverge when workflow-specific UX requires it, and record why.
- For workflow-heavy operations, optimize for single-page completion; navigating out to separate record pages should be an exception when in-page context is insufficient.

Working interpretation:
- The original `queue + drawer` shell is now better understood as one operational variant inside a broader record-browser family.
- Gift staging remains the anchor example for the operational variant.
- Appeals and similar views may share the same top-of-page operating model without needing to look like a literal queue.

## 3. Candidate Component Set

These are the reusable building blocks we will shape while refactoring Gift Staging:

- `MetricCard`
- `FilterChipGroup`
- `SearchBar`
- `DataQueueTable`
- `RowActionCell`
- `DrawerHeader`
- `DrawerSection`
- `ActionFooter`
- `InlineAlert`
- `Toast` (existing lane/behavior reuse)
- `EmptyState`
- `ErrorState`

Optional (defer until needed):
- `StatusTimeline` (light activity log in drawer).

## 4. Twenty Alignment Strategy (Working)

Current default: `Twenty-first, local fallback`.

1. Check whether a suitable Twenty UI primitive exists.
2. Use/adapt with thin wrappers when practical.
3. Use local primitive only for confirmed gaps.

Important:
- We are not blocking on perfect parity before iteration.
- We keep styling/tone close to Twenty by default.

### 4.1 Availability Audit Snapshot (`trial`, 2026-03-04)

Observed constraints:
- `twenty-ui` is currently private and workspace-coupled (`twenty-shared: workspace:*`), so direct reuse from fundraising-service is not plug-and-play.
- Some Twenty docs show usage via internal app aliases (`@/ui/...`) that are not public `twenty-ui/*` package exports.
- Several useful primitives (notably `Select`, table stack, right-drawer footer) exist in `twenty-front` internal modules, not in a portable package surface we can consume directly today.

Working mapping (for this experiment):

| Candidate primitive | Twenty candidate | Current decision |
| --- | --- | --- |
| `FilterChipGroup` | `twenty-ui/components` `Chip` | Keep local now; shape props so we can wrap later. |
| `SearchBar` | `twenty-ui/input` `SearchInput` | Keep local now; align behavior/copy with Twenty search patterns. |
| `MetricCard` | `twenty-ui/layout` `Card` (+ `Tag`/`Pill`) | Keep local now; maintain Twenty-like spacing and tone. |
| `InlineAlert` | `twenty-ui/display` `Callout` / `Banner` | Keep local now; preserve plain, action-oriented copy. |
| `EmptyState` / `ErrorState` | `twenty-ui/layout` `AnimatedPlaceholder` (+ `Callout`) | Keep local now; optional visual parity pass later. |
| `DataQueueTable` | No clear exported table primitive | Keep local. |
| `RowActionCell` | No clear exported table-cell action primitive | Keep local. |
| `DrawerSection` / `ActionFooter` / `ActionDrawer` | Right-drawer parts exist in `twenty-front` internals | Keep local. |

Result:
- Continue with local reusable primitives as the baseline.
- Preserve a thin abstraction layer so later Twenty wrapping is feasible once app-surface reuse is practical.

### 4.2 Storybook Reference Mode (`confirmed`, 2026-03-04)

- Twenty Storybook is the canonical visual/interaction reference source for our shared operational primitives.
- Current implementation path stays local (`operationsVisual` + shared wrappers) until direct `twenty-ui` consumption is practical.
- Visual reviews should compare changed primitives against Twenty Storybook patterns first, then tune local wrappers.

## 5. Clutter Guardrails (First Pass)

- One primary action per zone (summary, row, drawer footer).
- Keep summary band to 3-5 key metrics by default.
- Secondary actions move to drawer sections or less-prominent controls.
- Advanced diagnostics behind explicit expand/reveal controls.
- Preserve whitespace and hierarchy over dense control stacks.

## 6. Implementation Phases

### Phase 0: Current-State Baseline (Gift Staging) (`completed`)

Capture and preserve existing behavior while changing UI structure:
- Summary controls and filters.
- Queue list actions.
- Drawer edit/review/process flow.
- Loading/empty/error/success states.

### Phase 1: Introduce Reusable Shell + Primitives (`completed`)

- Add/shape shared shell and UI primitives in the fundraising client.
- Keep behavior stable while swapping presentation structure.

### Phase 2: Refactor Gift Staging To Shell (`in progress`)

- Recompose staging summary/table/drawer with reusable parts.
- Preserve workflow logic and API behavior.
- Apply clutter guardrails.
- Immediate polish applied in-flight:
  - Drawer footer actions hidden when selected record detail is unavailable.
  - Donor helper copy adapts to linked vs unlinked donor state.

### Phase 3: Twenty Primitive Mapping (`completed`)

- Confirm which reusable primitives can be sourced from `twenty-ui` now vs later.
- Record constraints and avoid coupling to `twenty-front` internal-only modules.
- Use output to drive near-term local component strategy.

### Phase 4: Validation and Polish (`in progress`)

- Validate desktop and compact widths.
- Validate loading/empty/error/success states.
- Validate basic keyboard/focus flow in drawer interactions.
- Validate visual consistency across summary, queue, drawer.
- Completed so far:
  - Shared `ActionDrawer` now sets initial focus, traps `Tab` navigation, restores focus on close, supports `Escape`, and supports backdrop-click close.
  - Queue empty-state messaging now distinguishes filtered-empty results from true-empty data.
  - Summary batch action CTA text is now compact-width safe (batch name moved to tooltip/title, not button body).
  - Visual baseline translation is now code-backed via shared `operationsVisual` style maps (shell, metric cards, queue table, chips, alerts) and applied to staging queue.
  - Local Storybook scaffold is in place for `fundraising-service` so shared operations primitives can be reviewed independently from end-to-end flows.

### Phase 5: Reuse Proof On One Additional Flow (`pending`)

- Apply the broader shell model to one additional page and use the outcome to tune the shared contract before broader rollout.
- This does not require the second page to mirror the queue-first surface exactly.

### Phase 6: Storybook Workflow Coverage Plan (`pending`)

Use Storybook as a workflow review lab across active fundraising custom UI slices, not only primitive/component snapshots.

Principles:
- Storybook stories should render real shared components and realistic states, not disconnected mock-only UI.
- Behavior lives in product code; Storybook is the review/testing harness for behavior and UX states.
- Keep this exploratory: stories guide decisions, they do not lock permanent policy by default.
- Pattern stories should be the main place where shared interaction models are shaped.
- Workflow stories should mostly demonstrate how a workflow consumes those models.

Coverage packs (first pass):
1. Gift staging:
- Summary band (workspace + parent scope), queue states, drawer task variants, feedback outcomes.
2. Manual gift entry:
- Donor resolution variants, duplicate warning variants, success/failure submission states.
3. Recurring donations:
- Exception triage states (overdue/paused/delinquent), action outcomes, empty/error views.
4. Household creation/addition:
- Search/select/create flow variants, relationship state transitions, conflict/error states.
5. Appeals:
- Record-browser variants for appeal review, edit, and snapshot flows, plus empty/error/loading variants.
6. Reconciliation:
- Payout queue states, add/update payout drawer states, exception handling outcomes.

Expected output per workflow pack:
- One composed story (workflow-level view).
- Key state stories (`loading`, `empty`, `filtered-empty`, `error`, `success`, and at least one edge case).
- One interactive playground story with controls/args for high-impact inputs.

Review cadence:
- Run Storybook review before major UI refactors and before demo milestones.
- Capture approved examples as named baseline stories (e.g., `.../ApprovedBaseline`) for regression comparison.
- Record open UX questions from story reviews in `docs/ui/PATTERNS.md` rather than forcing early hard rules.

### Phase 6A: Immediate Story Tasks (`in progress`)

Implement the next two workflow packs first so Storybook coverage expands beyond staging before deeper visual hardening.

Pack 1: Manual gift entry (story file target: `client/src/stories/ManualGiftEntryWorkflow.stories.tsx`)
- `ComposedWorkflow`:
  - Manual intake drawer/header + grouped cards + submission status area.
- `DonorResolutionStates`:
  - exact match, partial match, no match/new donor.
- `DuplicateStates`:
  - no duplicate warning, warning present, reviewed/override path.
- `SubmitOutcomeStates`:
  - idle, submitting, success, recoverable failure.
- `Playground` controls:
  - donor state, duplicate state, recurring toggle, submit outcome.

Pack 2: Reconciliation (story file target: `client/src/stories/ReconciliationWorkflow.stories.tsx`)
- `ComposedWorkflow`:
  - summary metrics + filters/search + payout table + drawer action path.
- `QueueStates`:
  - loading, empty, filtered-empty, error.
- `StatusFilterStates`:
  - pending/partial/reconciled/variance emphasis and mixed-source filter examples.
- `DrawerStates`:
  - payout detail open, update in progress, update success/failure feedback.
- `Playground` controls:
  - row volume, unresolved count, pending staging count, source mix, error/refreshing toggles.

Definition of done for each pack:
- Stories compile and render in local Storybook.
- At least one composed workflow story + key state stories + one controls playground.
- Story naming reflects intent (reviewable by product without code context).
- Open UX questions discovered during review are captured in `docs/ui/PATTERNS.md`.

## 7. Out of Scope (For This Plan)

- Final, rigid interaction contracts.
- Finalized long-term app-surface migration design.
- Full design-system formalization.
- Large schema changes for deep audit history.

## 8. Decision Checkpoints

Before coding:
- Keep custom UI component work on local wrappers unless a portable Twenty export is confirmed.

After Gift Staging refactor:
- Confirm shell is reusable with acceptable clutter level.
- Confirm whether `StatusTimeline` should be added now or deferred.

After second-flow reuse:
- Confirm foundation is stable enough for broader rollout.

## 9. Next Steps (Immediate)

1. Continue Gift Staging Storybook refinement using the control-driven summary/queue/drawer stories.
2. Build the next two workflow packs in Storybook (`Manual gift entry`, `Reconciliation`) using the Phase 6 output format.
3. Run a Storybook-led review pass for those packs and capture open UX questions in `docs/ui/PATTERNS.md`.
4. Re-anchor Storybook so canonical pattern stories are easier to distinguish from workflow examples.
5. After review evidence, decide whether additional shared primitives or pattern adjustments are needed before broader rollout.

## 10. Experiment Exit Conditions

This plan should be revised when:

- The shell fails to improve consistency across at least two flows.
- The clutter guardrails materially hurt task completion speed.
- Twenty App UI capabilities make a better baseline available.
