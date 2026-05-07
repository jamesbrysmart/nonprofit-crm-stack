# Operational Component Patterns

Updated: 2026-05-04
Status: Working guide (`stage-2`)
Purpose: Define the recurring component shapes we use for custom operational UI while Twenty SDK UI is still evolving.

This doc sits between:

- `docs/UX_UI.md` for stable UX principles,
- `docs/ui/TWENTY_APPS.md` for migration-aware posture,
- app-local style references for concrete implementation details and current primitive confidence.

Use this doc to keep custom UI consistent without pretending the current Twenty SDK surface is final.

## 1. Scope

This doc is authoritative for:

- recurring operational component shapes,
- the intended job and hierarchy of those patterns,
- when to prefer native widgets versus custom front components,
- how to think about evolving Twenty SDK UI without rewriting our pattern language each time.

This doc is not authoritative for:

- spacing/token details,
- app-specific workflow meaning,
- final SDK primitive availability,
- Storybook process.

## 2. Working Model

Separate these concerns:

- `Pattern`
  - the job a UI block serves and the shape it should have.
- `Primitive`
  - the current Twenty or local implementation piece used to render it.
- `Trial status`
  - whether we have actually tested that primitive in the relevant app surface.

Patterns should stay relatively stable.

Primitives may improve or change as Twenty SDK UI evolves.

App-local docs should record what is currently proven, trial-use, or still uncertain.

## 3. General Defaults For Constrained Operational UI

These defaults apply broadly to custom operational UI, not only to review surfaces.

### 3.1 Space Is A First-Class Cost

In constrained operational UI, vertical space is scarce.

Default to:

- the smallest padding that preserves scanability,
- the fewest containers needed for clarity,
- the shortest visible path to the primary action or state.

Do not treat extra breathing room as free. In narrow panels and compact widgets, generous padding quickly turns into avoidable scrolling.

Record-page implication:

- treat this as especially important for first-tab content on full desktop record pages, because Twenty can pin that first tab into a narrower left-side column under the summary card
- do not design first-tab operational blocks as if they live in the main wide working area

### 3.2 Prefer Structure Over Container Chrome

Default to:

- spacing,
- alignment,
- dividers,
- compact label/value rows,
- lightweight section headers.

Do not default to:

- stacked bordered cards,
- nested visible panels,
- subsection boxes for short supporting facts.

Visible containers should be used sparingly and usually only when:

- a block has distinct interaction weight,
- a message needs exceptional emphasis,
- or the host product already uses a clearly similar treatment.

### 3.3 One Block Should Not Behave Like A Mini Page

A compact custom component should not recreate a full page hierarchy inside itself.

Avoid:

- repeated internal headings when the host surface already provides one,
- multiple co-equal subsections for low-complexity content,
- summary blocks that expand into full detail surfaces.

Default to one dominant focal area and subordinate supporting context.

### 3.4 Helper Text Must Earn Its Space

Inline explanation is expensive in constrained operational UI.

Default to:

- zero or one short helper line,
- concise status text,
- nearby actions or metadata doing part of the explanatory work.

Avoid defaulting to both:

- a reason paragraph,
- and a next-action paragraph,

unless both are truly necessary for first-pass understanding.

If explanation is useful but not essential for scanning, prefer:

- tooltip,
- info affordance,
- expandable detail,
- secondary/supporting section,
- or a dedicated audit/support tab.

### 3.5 Use Width Before Height

When the host surface allows it, prefer:

- inline metadata,
- compact multi-column fact rows,
- adjacent action placement,

before adding more stacked vertical sections.

This is especially important for top-of-surface summary blocks and compact action surfaces.

### 3.6 Use Operator Language, Not System Language

Custom front components should speak in the language of the operational user, not the internal model.

Default to:

- donation-admin language,
- task-oriented labels,
- outcome wording that explains what happened for the user,
- terms that match what the operator is trying to do next.

Avoid defaulting to internal or technical terms such as:

- `evidence`,
- `context`,
- `linked`,
- `committed`,
- `unresolved`,
- implementation-centric status reasoning.

Prefer:

- `donor details` over `donor evidence`,
- `selected donor` over `linked donor`,
- `gift record` over `committed gift`,
- `review later` or similarly plain operator language over internal workflow-state jargon.

When writing helper text:

- describe the user’s situation plainly,
- describe the next action in human terms,
- avoid explaining the system’s reasoning unless that reasoning is itself the thing the user needs to act on.

This is especially important for:

- status summaries,
- action buttons,
- confirmation/error toasts,
- small metadata labels that appear repeatedly across operational surfaces.

## 4. Current Pattern Set

### 4.1 Review Landing Block

Job:

- orient the operator quickly,
- expose the current review state,
- show the next meaningful action or destination.

Include:

- current state,
- reason/context,
- next action,
- nearby links or handoff actions.

Avoid:

- turning this into the full working surface,
- repeating all downstream evidence fields,
- large decorative emphasis.

Prefer native widgets when:

- core editable fields can be shown cleanly via `FIELD` or `FIELDS`,
- the custom block only needs to provide status and signposting around them.

### 4.2 Editable Evidence Block

Job:

- let an operator correct or confirm bounded evidence inside the current workflow.

Include:

- a small set of related fields,
- local save/check actions,
- any confidence or match state needed to interpret the edit.

Avoid:

- mixing unrelated evidence domains in one block,
- burying the primary edit action,
- expanding into a full record-details surface.

Prefer native widgets when:

- the required fields are simple and do not need custom interaction logic.

Prefer a custom front component when:

- the block needs local validation, duplicate checking, derived guidance, or workflow-specific actions.

### 4.3 Action And Control Block

Job:

- expose workflow-changing actions clearly and safely.

Include:

- current readiness/processability context,
- primary and secondary actions,
- concise supporting explanation when the action meaning is not self-evident.

Avoid:

- hiding important state needed to understand the action,
- mixing too many unrelated actions into one cluster,
- using decoration instead of hierarchy to signal importance.

Prefer this as a separate block when:

- the action semantics deserve their own operator attention,
- the workflow can be clearer when actions are grouped away from evidence editing.

### 4.4 Audit And Supporting Context Block

Job:

- expose secondary evidence, provenance, diagnostics, or supporting context without crowding the main review flow.

Include:

- raw/supporting facts,
- diagnostics,
- provenance fields,
- secondary explanatory copy where useful.

Avoid:

- pulling primary workflow actions into this block,
- treating secondary evidence as if it were the operator’s main workspace.

Prefer native widgets when:

- the surface is mostly record facts with little custom logic.

### 4.5 Linked Entity / Match Selection Block

Job:

- help the operator choose, confirm, or inspect a linked entity safely.

Include:

- current link state,
- candidate list or summary,
- clear confirm/select action,
- enough supporting context to distinguish choices.

Avoid:

- introducing a full search/browse workspace unless necessary,
- overcompressing candidate context so choices feel blind.

Prefer custom implementation when:

- the selection logic is workflow-specific,
- confidence/match semantics need to be surfaced explicitly.

### 4.6 Native Field Group

Job:

- keep straightforward record editing or display native where possible.

Use this for:

- core facts,
- compact editable record sections,
- lower-risk details that do not need custom workflow behavior.

Prefer native `FIELD` / `FIELDS` assembly when:

- the fields are stable,
- the interaction is ordinary record editing,
- custom UI would mainly duplicate host behavior.

## 5. Composition Defaults

Current default for custom operational review surfaces:

1. review landing block
2. one or more bounded working blocks
3. native field group where host widgets are sufficient
4. audit/supporting context in a secondary tab or lower-priority section

This is a default, not a rigid layout law.

The key rule is:

- keep the first working surface high-signal and operational,
- do not let secondary detail crowd the main review flow.

## 6. SDK Evolution And Trial Notes

Do not rewrite this doc every time Twenty adds or improves a primitive.

Instead:

- keep the pattern definitions stable unless the product shape actually changes,
- record primitive confidence and trial outcomes in app-local references,
- promote primitive usage only after it has worked in a real app surface.

Useful app-local categories:

- `proven in this app`
- `visible in docs/source, verify before broad use`
- `do not assume yet`

If a primitive becomes clearly good enough to change the preferred implementation of a pattern, update:

1. the app-local style reference first,
2. this doc only if the pattern recommendation itself has changed.

## 7. Maintenance Rule

When a new custom operational component is introduced, check:

- which existing pattern it most resembles,
- whether the divergence is genuinely task-driven,
- whether native widgets could handle more of it,
- whether the implementation choice is proven or still provisional.

Capture new patterns here only when:

- they recur,
- they have a clear job,
- and documenting them will reduce future drift.

Do not add patterns here just because a one-off component exists.
