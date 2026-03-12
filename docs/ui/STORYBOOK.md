# Storybook Guide (Working)

Updated: 2026-03-11
Status: Working guide (`trial`)
Purpose: Define how we use Storybook to improve custom UI quality and consistency across workflows.

This guide is exploratory. It sets working defaults for review and implementation speed, not rigid rules.

## 0. Core Use

Storybook is our UX review harness for real UI code:

- Real behavior/components live in product code.
- Storybook renders those components in controlled scenarios.
- We use it to review clarity, hierarchy, and state handling before hardening full screens.

Working interpretation:
- Storybook is useful as a UI lab, a review surface for composed states, and a reference library once something is explicitly promoted to baseline.
- A story existing does not, by itself, make a pattern or workflow “decided.”

## 1. Taxonomy

Use this hierarchy for all stories:

1. `Foundations`
- Visual/interaction primitives and shared styling references.
- Example: buttons, alerts, cards, input treatments.

2. `Patterns`
- Reusable page/interaction structures.
- Example: summary band, record-browser shell, queue+drawer variant.

3. `Workflows`
- End-to-end user workflows that consume the shared patterns.
- Example: gift processing, manual gift entry, reconciliation.

4. `Modules`
- Embedded capability units that are not full workflows.
- Example: household drawer flow.

Interpretation:
- `Foundations` should not quietly define workflow structure.
- `Patterns` are the main place to shape and compare reusable interaction models.
- `Workflows` should usually demonstrate how a workflow uses a pattern, not redefine the pattern from scratch.

## 2. Workflow Pack Standard

Every workflow pack should include:

1. `ComposedWorkflow`
- The workflow assembled as users experience it.

2. `StateCoverage`
- At minimum: `loading`, `empty`, `filtered-empty`, `error`, `success`, plus one edge case.

3. `Playground`
- Controls/args for high-impact inputs and states.

Optional:
- `ApprovedBaseline` after product sign-off.
- explicit status labels such as `exploratory`, `review-ready`, `baseline candidate`, `approved baseline` when useful.

## 3. Review Checklist

Use this checklist during story review:

1. Purpose clarity:
- Is it obvious what this screen/workflow is for within a few seconds?

2. Action hierarchy:
- Is the primary action obvious? Are secondary actions de-emphasized?

3. State confidence:
- In each state, is it clear what happened and what to do next?

4. Consistency:
- Does it feel consistent with the rest of the product and Twenty-aligned tone?

5. Single-page effectiveness:
- Can users complete most operational tasks without leaving context?

## 4. Current Coverage Map

Legend: `not-started` | `in-progress` | `review-ready` | `approved-baseline` | `deferred`

| Area | Type | Status | Storybook group |
| --- | --- | --- | --- |
| Shared primitives | Foundations/Patterns | `review-ready` | `Foundations/Primitives` |
| Record browser shell | Patterns | `review-ready` | `Patterns/Record Browser Shell` |
| Queue table example | Patterns | `review-ready` | `Patterns/Record Browser Shell/Queue Table Example` |
| Queue+drawer variant | Patterns | `review-ready` | `Patterns/Record Browser Shell/Queue + Drawer Variant` |
| Summary and scope pattern | Patterns | `review-ready` | `Patterns/Record Browser Shell/Summary and Scope` |
| Manual gift entry | Workflow | `review-ready` | `Workflows/Manual Gift Entry` |
| Reconciliation | Workflow | `review-ready` | `Workflows/Reconciliation` |
| Household drawer | Workflow | `review-ready` | `Workflows/Household Drawer` |
| Gift processing (full workflow pack) | Workflow | `review-ready` | `Workflows/Gift Processing` |
| Recurring donations | Workflow | `not-started` | (to be added under `Workflows`) |
| Appeals | Workflow | `review-ready` | `Workflows/Appeals` or equivalent review story once aligned to shared shell |

## 5. Workflow for Sessions

1. Add or update story pack for the target workflow/module.
2. Run Storybook and review with controls (`Playground`) first.
3. Record outcomes as:
- keep,
- refine now,
- open question.
4. Capture open UX questions in `docs/ui/PATTERNS.md`.
5. Promote to `ApprovedBaseline` only when product explicitly signs off.

## 5.1 Record Browser Shell Baseline

Use `Patterns/Record Browser Shell` as the current fundraising baseline for list-driven pages.

It defines the shared contract for:

- summary band + page actions,
- search,
- filter scope,
- sort placement,
- active filter/search chips,
- pagination,
- record review in a right-side drawer.

Allowed record surfaces:

- dense table,
- card list.

Expectation:

- pages may choose `table` or `card list` based on workflow needs, but the control model should stay consistent.
- richer inspection and record actions should usually happen in the drawer.
- pagination is part of the current baseline candidate, not an optional afterthought.
- `Patterns/Queue + Drawer Shell` should be treated as an operational variant of this broader model, not a separate competing baseline.

## 6. Commands

- Dev: `npm -C services/fundraising-service run storybook`
- Build: `HOME=/tmp npm -C services/fundraising-service run storybook:build`

## 7. Workflow Review Contracts (Testing Baseline)

Use these as comparison baselines during Storybook review. These are guidance contracts, not rigid rules.

### 7.1 Gift Processing

- Purpose:
  - Triage and resolve staged gift records efficiently, then process confidently.
- Critical actions:
  - scope queue (workspace or parent),
  - review record in drawer,
  - resolve blockers,
  - process row/batch.
- Must-handle states:
  - loading list, empty, filtered-empty, error, ready-to-process, process failed/success.
- Single-page expectation:
  - review, resolve, and process should stay in one operational surface by default.
- Demo-quality checks:
  - clear urgency hierarchy,
  - obvious next action per row,
  - low-friction drawer workflow.

### 7.2 Manual Gift Entry

- Purpose:
  - Capture manual gifts with low error risk and clear donor/duplicate resolution.
- Critical actions:
  - set gift intent,
  - confirm/select donor,
  - resolve duplicate warnings,
  - submit to staging.
- Must-handle states:
  - donor selected/unselected,
  - duplicate suggested/blocking,
  - submit idle/submitting/success/error.
- Single-page expectation:
  - donor/duplicate decision and submission should complete in one flow.
- Demo-quality checks:
  - donor confidence is explicit,
  - duplicate handling is understandable,
  - submit outcomes are unambiguous.

### 7.3 Reconciliation

- Purpose:
  - Review payouts, reconcile linked gifts, and resolve variance safely.
- Critical actions:
  - filter/search payout queue,
  - open payout review drawer,
  - update status/actions,
  - confirm reconciliation.
- Must-handle states:
  - loading, empty, filtered-empty, error,
  - unresolved/variance emphasis,
  - drawer action success/failure.
- Single-page expectation:
  - payout review and reconcile actions should remain in one page context.
- Demo-quality checks:
  - payout health is obvious,
  - variance cases are prominent,
  - drawer actions feel deliberate and safe.

### 7.4 Household Drawer

- Purpose:
  - Create/find households and manage membership actions without breaking parent workflow context.
- Critical actions:
  - search/select household,
  - create household,
  - add/move member,
  - resolve membership conflict.
- Must-handle states:
  - no search results,
  - pending members,
  - conflict warning,
  - save success/error.
- Single-page expectation:
  - household membership tasks should run as in-drawer module actions.
- Demo-quality checks:
  - conflict handling is clear,
  - member move implications are explicit,
  - primary action is always obvious.

### 7.5 Recurring Donations (`draft`)

- Purpose:
  - Triage recurring agreement exceptions and take corrective actions quickly.
- Critical actions:
  - filter by exception bucket,
  - review agreement details,
  - apply status/action updates.
- Must-handle states:
  - overdue/paused/delinquent buckets,
  - empty/error states,
  - action success/failure.
- Single-page expectation:
  - exception triage should complete in one operational context where possible.
- Demo-quality checks:
  - exception priority is clear,
  - actions map clearly to outcomes.
- Open questions:
  - Which recurring actions are mandatory for MVP Storybook coverage?
  - What minimum agreement context is needed in drawer/panel to avoid navigation out?

### 7.6 Appeals (`working`)

- Purpose:
  - Monitor and maintain appeal performance context (list + detail + snapshots).
- Critical actions:
  - select appeal,
  - review metrics,
  - create/edit appeal,
  - log solicitation snapshot.
- Must-handle states:
  - list loading/empty/error,
  - no selection,
  - no snapshots,
  - create/edit/snapshot error states.
- Single-page expectation:
  - use the shared record-browser shell with a surface that suits appeal review; detailed review and edit should stay in-context where possible.
- Demo-quality checks:
  - metric clarity and orientation remain strong.
- Open questions:
  - Which appeal record surface works best: denser table, card-list, or hybrid?
  - How much summary context should stay above the Appeals list versus move into reusable shell slots?
