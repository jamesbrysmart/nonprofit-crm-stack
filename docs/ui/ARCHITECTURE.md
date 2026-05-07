# UI Architecture

Updated: 2026-04-02
Status: Working guide (`stage-2`)
Purpose: Define the canonical shared UI model, decision process, and reuse rules for custom UI work in this project.

This is now the primary UI architecture and reuse doc. Older UI docs still remain during consolidation, but this file is the current source of truth for shared UI structure and evaluation rules.

## 1. Scope

This doc is authoritative for:

- the shared UI model we use across workflow-heavy pages,
- how we evaluate repeated UI patterns,
- what is currently shared versus intentionally local,
- which UI questions are still open.

This doc is not authoritative for:

- general UX principles and copy/tone,
- Storybook taxonomy and review process,
- Twenty-app migration guidance.

Related docs:

- `docs/UX_UI.md`: stable UX and interaction principles.
- `docs/ui/OPERATIONAL_COMPONENT_PATTERNS.md`: recurring shapes for custom operational components and their intended job/hierarchy.
- `docs/ui/STORYBOOK.md`: Storybook process and review harness guidance.
- `docs/ui/TWENTY_APPS.md`: migration-aware UI guidance.
- `docs/ui/components/`: requirement docs for high-value repeated UI components/patterns.

## 2. Confidence Model

- `Confirmed`
  - stable rule or decision we intend to keep unless evidence changes materially.
- `Current default`
  - what we do now unless there is a clear reason to diverge.
- `Open`
  - still being evaluated; not locked in.

## 3. Core Principles

- Shared seams should not drift arbitrarily across similar workspaces.
- Reuse should improve clarity and consistency, not just move complexity around.
- Workflow-specific deviation is allowed when it improves the task model.
- Live product behavior outranks idealized examples.
- We should document decision criteria earlier than exact implementation outcomes.

## 4. Shared UI Model

Current known shared seams:

- `Confirmed`: workspace header
- `Confirmed`: controls row
- `Confirmed`: results-surface framing
- `Current default`: pagination placement as part of the results surface
- `Current default`: drawer/detail surface as the main review space for list-driven workflows where in-page continuity matters

What counts as a shared seam:

- users perceive it as the same part of the workflow across multiple pages,
- the rules are stable enough to describe clearly,
- sharing it reduces visible drift and repeated page assembly.

What usually stays local:

- record-specific renderers,
- workflow-specific operational controls,
- domain modules that materially change the task model.

## 5. Shared Pattern Evaluation

When repeated UI appears, evaluate whether it should become:

- a shared component,
- a shared composition contract,
- a shared headless model,
- or remain page-specific.

Evaluation criteria:

- user-facing consistency value,
- duplicated code,
- clarity of shared rules,
- legitimate workflow deviation,
- portability to Twenty apps/front components,
- whether the abstraction simplifies or merely relocates complexity.

Do not decide this only from aesthetics. Prefer shared implementation where the workflow rules are genuinely common, and keep local implementations where the abstraction would become incoherent.

## 6. Current Defaults

Record/workspace composition defaults:

- header
- metrics when they add decision value
- controls
- applied state
- results surface
- pagination
- review/detail surface when appropriate

State expectations:

- loading, empty, error, and success states should be intentional on all meaningful workflow surfaces,
- results-state framing should be consistent before inner renderers are generalized,
- Storybook can help compare these states, but it does not settle the architecture by itself.

Default stance on flow:

- prefer compositional shared layers over a monolithic shell,
- prefer in-page completion for workflow-heavy admin tasks unless the workflow clearly benefits from leaving context.

## 7. Open Architectural Questions

- Shared record-list/view component or contract:
  - this remains an active architectural question, not a pre-rejected idea,
  - it is worth evaluating because this project repeatedly needs list-driven record views,
  - the tradeoff is between stronger consistency/reuse and forcing unlike workflows into an awkward abstraction.
- Which shared seams are mature enough to promote from `Current default` to `Confirmed`.

## 8. Workspace Variants

Current working variants:

- calmer browser/list workspaces such as recurring, reconciliation, and appeals,
- operational queue variants such as gift processing/staging.

Expected specialization areas:

- workflow-specific controls,
- domain-specific result renderers,
- workflow-specific detail modules.

## 9. UI Task Brief Checklist

Minimal checklist for non-trivial UI work:

- workflow summary,
- states,
- APIs/data shape,
- shared-pattern references,
- intended divergence.

## 9.1 High-Value Repeated Components

When a repeated UI pattern is important enough that high-level guidance alone is insufficient, capture its requirements in `docs/ui/components/`.

Current component-requirements docs:

- `record-list-view.md`
- `review-drawer.md`

Use these docs to define:

- the problem,
- shared requirements,
- expected variation points,
- success criteria,
- open questions,
- implementation options and tradeoffs.

## 10. Superseded Inputs

These older docs feed this one during consolidation:

- `docs/ui/PATTERNS.md`
- `docs/ui/IMPLEMENTATION_PLAN.md`
- `docs/ui/BASELINE.md`
- `docs/ui/BRIEF_TEMPLATE.md`

These are transitional references only and should not be treated as authoritative once consolidation is complete.
