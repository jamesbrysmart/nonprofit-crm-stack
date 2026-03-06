# UI Baseline (Working Draft)

Updated: 2026-03-04
Status: Working draft (`trial`)
Purpose: Give Codex and engineers a predictable baseline for custom UI work while product/UX patterns are still being discovered.

This is not a final design system or policy. Treat it as current guidance that we expect to change.

## 0. Interpretation (Important)

- This baseline is a working set of hypotheses.
- It is intentionally provisional and should be adapted when implementation evidence disagrees.
- Future sessions should not treat this as permanent project policy.
- This baseline is default guidance for consistency and delivery speed, not a hard constraint on custom workflow UI.
- Intentional divergence is allowed when it improves workflow outcomes; capture the rationale in the task brief/docs instead of forcing baseline compliance.

## 1. Source Order (Current)

Confidence: `confirmed`

When working on custom UI, use sources in this order:

1. Twenty frontend contributor docs (coding/style/architecture):
   - `services/twenty-core/packages/twenty-docs/developers/contribute/capabilities/frontend-development/style-guide.mdx`
   - `services/twenty-core/packages/twenty-docs/developers/contribute/capabilities/frontend-development/best-practices-front.mdx`
   - `services/twenty-core/packages/twenty-docs/developers/contribute/capabilities/frontend-development/folder-architecture-front.mdx`
2. Twenty Storybook (canonical visual reference):
   - `https://storybook.twenty.com`
   - `services/twenty-core/packages/twenty-docs/developers/contribute/capabilities/frontend-development/storybook.mdx`
3. Twenty UI component docs:
   - `services/twenty-core/packages/twenty-docs/twenty-ui/*`
4. Twenty app capability docs (current platform surface):
   - `services/twenty-core/packages/twenty-docs/developers/extend/capabilities/apps.mdx`
5. Project docs for domain/workflow context:
   - `docs/PROJECT_CONTEXT.md`
   - `docs/UX_UI.md`
   - `docs/features/*`

If sources conflict, flag the conflict in the task summary and treat Twenty docs as default unless project direction explicitly overrides.

## 2. Working Hypotheses

Confidence: `trial`

These are current hypotheses for workflow-heavy custom app UI (currently prototyped in `services/fundraising-service/client`).

### 2.1 Interaction and visual direction

- Match Twenty interaction patterns where possible (table rhythm, drawer behavior, status chips, form affordances).
- Match Twenty visual tone (spacing, typography, color roles) unless a task explicitly asks for a different style.
- Prefer consistency over novelty while we establish production patterns.

### 2.2 Component and state approach

- Keep components focused and readable; push workflow logic into hooks/services.
- Prefer explicit event handlers over effect-heavy control flow.
- Keep naming explicit and descriptive; avoid implicit prop spreading patterns.

### 2.3 Styling approach

- Use existing tokenized classes/patterns in the client first (`f-*` layer, existing tokens).
- Avoid introducing ad hoc visual tokens without recording why in `docs/UX_UI.md`.
- Keep new styles mappable to Twenty UI primitives where practical.

### 2.4 UX behavior minimum

- Always include loading, empty, success, and error states for new surfaces.
- Keep action labels plain and task-oriented.
- Preserve keyboard/focus basics and readable contrast for touched surfaces.
- For workflow-heavy operations, prefer in-page task completion; forcing users to leave the workflow page should be treated as UX debt unless clearly necessary.

### 2.5 Storybook usage rule

- Use Twenty Storybook as the visual behavior baseline for shared UI primitives (buttons, chips, inputs, alerts, cards, statuses, table rhythm).
- For our current implementation surface (`services/fundraising-service/client`), implement those patterns through local shared wrappers/primitives unless a portable Twenty export is confirmed.
- When Storybook visual guidance and current local styling conflict, favor Storybook intent and update local primitives/docs accordingly.

## 3. Current Assumptions (To Validate)

Confidence: `open`

- Twenty App front components will become the preferred production UI surface for this project once quality is sufficient.
- Current managed UI work should stay lift/shift-friendly, but this is not the primary decision driver for now.
- Twenty app UX capability is evolving quickly; this baseline will need frequent review.

## 4. Revisit Triggers

Confidence: `confirmed`

Re-check this baseline when any of these happen:

- Twenty Apps moves from alpha to beta/GA with new UI capability.
- We adopt a production customer-facing UI path.
- A recurring UI decision conflict appears across multiple tasks.
- We intentionally choose a product direction that diverges from Twenty defaults.

## 5. How Codex Should Use This

Confidence: `trial`

For each UI task:

1. Read this file first.
2. Read relevant Twenty docs for the pattern being changed.
3. Read project feature/workflow context (`docs/features/*`, `docs/UX_UI.md`).
4. Implement using current hypotheses.
5. If a needed decision is unclear, mark it as `open` rather than inventing final policy.
6. Prefer updating this document when new evidence emerges, instead of silently diverging.
