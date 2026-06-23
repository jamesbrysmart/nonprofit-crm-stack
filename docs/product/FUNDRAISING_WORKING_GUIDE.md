# Fundraising Working Guide

## Purpose

This document is a working product guide for the fundraising app.

It exists to help us:

- explain the product as an admin or user would encounter it,
- validate current workflow behavior through realistic walkthroughs,
- capture important product rules and constraints in one place,
- and build the source material for later polished user-facing documentation.

This is not yet final end-user documentation.

## Status

Treat this as current working guidance for first deployment preparation.

It should describe:

- current as-built behavior,
- current intended workflow guidance,
- important platform or product constraints,
- and open points still being refined through testing.

It should not drift into:

- deployment or operational runbook steps,
- deep implementation detail,
- or speculative future behavior presented as if it already exists.

## How To Use This Guide

Use this document when:

- walking through the product as a user or admin,
- checking whether a workflow is understandable and coherent,
- deciding what behavior should later become formal user documentation,
- or capturing product-level rules that should not stay buried in code or pilot notes.

When a workflow area needs more detail, this guide should go into that detail.

When behavior is still under review, say so explicitly rather than presenting it as settled policy.

## Core Workflow Areas

The main workflow sections in this guide should be built around how the product is actually used.

Initial areas to capture:

- Gift Staging and batch processing
- Donor matching and donor review
- Attribution using Appeal, Appeal Source, and Fund
- Grants and opportunities
- Gift Aid

## Important Product Rules And Constraints

This guide should capture cross-cutting rules that materially affect how the product works.

Examples:

- what the system can auto-link safely,
- what must be reviewed before processing,
- what Twenty platform constraints affect our workflow design,
- and what the app will deliberately block rather than guess.

One concrete example already identified for future expansion here:

- Twenty does not allow duplicate `Person.emails.primaryEmail` values.
- That means a staged gift with an email already used by another donor cannot safely proceed as a new donor without review.

## Configuration Notes

This guide can include lightweight admin/configuration notes where configuration materially changes user workflow.

Examples:

- default views and queues,
- workspace-specific layout choices,
- pipeline/stage configuration,
- and where the app provides guidance but the workspace owns final setup.

## Open Points

Keep an explicit running section for workflow areas still under review.

This is important so that:

- unresolved behavior is not mistaken for final product policy,
- walkthrough findings can be captured quickly,
- and later polished documentation can distinguish settled behavior from earlier exploration.

## Next Step

Populate this document iteratively through final walkthroughs before first deployment.

Start by capturing the most operationally important workflow areas first, especially where:

- users must understand why the system paused for review,
- admins need to know what is configurable versus fixed,
- or platform constraints materially shape the workflow.

## Workflow: Importing A CSV Batch Of Donations

This section assumes a user has a CSV containing around 100 donations from another system and wants to bring them into the CRM safely.

### What This Workflow Is For

The purpose of the Gift Staging workflow is:

- to accept imported donation rows before they become committed Gifts,
- to allow donor matching and gift coding review,
- to stop rows that need human review,
- and to let confident rows be processed into canonical fundraising records.

Gift Staging is intentionally a short-lived operational workspace, not the final home of donation data.

Once a row has been processed successfully, the main long-term record is the Gift.

### High-Level Flow

The expected user journey is:

1. Create a Gift Batch for the import.
2. Import the CSV into Gift Staging and link each row to that Gift Batch.
2. Review the batch at a high level.
3. Run donor match.
4. Review rows that still need attention.
5. Run batch readiness check.
6. Process rows that are ready.
7. Use the committed Gift records as the final source of truth.

### Creating The Gift Batch First

At the start of a CSV import workflow, the user should first create a `Gift Batch`.

The batch gives the import a clear operational container and allows the user to record reconciliation information such as:

- expected item count,
- expected total value,
- and other batch-level context that may help later review.

### Importing Rows Into Gift Staging

The next step is to import rows into `Gift Staging` using Twenty's native CSV import tool.

In current use, this import is started from the `Gift Staging` object rather than from inside the `Gift Batch` record itself.

Each imported `Gift Staging` row must be linked to the `Gift Batch` that was just created.

In the current Twenty import model, that linkage needs to come from the imported row data itself. In practice, that means the batch identifier must be included and mapped during the CSV import.

This is an important current workflow constraint.

We have reviewed this flow and have not yet identified a cleaner product-level approach within the current native Twenty CSV import surface.

This should therefore be treated as a real operational limitation of the current workflow, not as a hidden implementation detail and not as an assumed future fix.

### Practical Import Notes

When we later turn this into user-facing documentation, this workflow will likely need a practical checklist for the CSV itself.

Important areas to capture:

- which `Gift Staging` fields are most important to map for a standard donation import,
- which fields are required before a row can be processed,
- which fields are optional but useful for later review or attribution,
- and which fields should be treated as structured values rather than free text.

Examples of important import guidance likely to matter:

- include the batch linkage field so every imported row is attached to the correct `Gift Batch`,
- include donor evidence fields in a consistent way,
- include gift date and payment type where available,
- include attribution evidence such as Appeal, Appeal Source, Fund, or provider-side source identifiers where available,
- and avoid assuming the importer can infer relationships that are not present in the mapped data.

Formatting guidance is also likely to matter in later user docs.

Examples:

- dates should be formatted consistently,
- amounts and currency values should be mapped into the expected structured fields,
- payment and status values should use the expected app/Twenty values where relevant,
- and imported relationship identifiers should be treated carefully so they map to the intended record.

This section should remain lightweight for now, but it is useful to note that field mapping and data formatting guidance will be an important part of later end-user documentation.

### What The User Should Expect After Import

After import, the user should not expect every row to be processable immediately.

The system is designed to treat imported rows as evidence to review, not as already-trusted final records.

Typical things that may still need review include:

- donor identity,
- gift date,
- payment type,
- attribution such as Appeal, Appeal Source, or Fund,
- and other coding details required before a Gift can be created safely.

### First Batch Review

When a user opens a newly imported batch, the expected first action is often to run donor match if there are no obvious immediate problems.

This should feel natural because donor identity is one of the biggest variables in imported data.

The batch review area should help the user distinguish between:

- all staged rows,
- rows that still need review,
- rows that are ready to process,
- failed rows,
- and rows with possible donor matches.

At this stage, donor identity is usually the first priority.

The user may not yet know which rows are:

- donations from existing donors,
- donations from likely existing donors that need review,
- or genuinely new donors.

Running donor match is intended to sort the batch into those broad paths before the user moves on to coding and readiness.

### Donor Match: Expected Outcomes

When donor match is run on a batch, the system should sort rows into a few clear categories.

Current intended outcomes:

- Exact donor matches linked
  The row is linked automatically when the system has strong enough evidence to do that safely.

- Possible donor matches
  The system found plausible donor evidence, but not enough to auto-link confidently.
  These rows should be reviewed by a user before processing.

- No confident donor match
  The system did not find enough evidence to auto-link or suggest a likely donor.
  These rows remain unmatched and may still need a donor decision later.

### Current Donor Matching Model

Current intended matching behavior:

- exact first name + last name + unique matching email can auto-link,
- exact first name + last name without unique email confirmation is treated as a possible donor match,
- exact unique email without sufficient matching name confidence is also treated as a possible donor match,
- and rows with no meaningful match remain unmatched.

This is intentionally conservative.

The aim is to avoid incorrect automatic donor linkage while still surfacing likely matches for review.

### Important Constraint: Unique Primary Email

Twenty does not allow duplicate `Person.emails.primaryEmail` values.

This matters directly to import and processing behavior.

It means:

- the app should not assume an unmatched row with an email can always create a new donor,
- a staged gift with an email already used as another donor's primary email must be reviewed before processing as a new donor,
- and direct "just create the donor during import" behavior would create avoidable failures.

This is one of the reasons the Gift Staging review step is important.

### Why Partial Matches Matter

Possible donor matches are not just a convenience feature.

They are an important safety layer between imported donor evidence and committed donor creation.

For example:

- a row may match an existing donor by exact name but use a new or missing email,
- a row may match an existing donor by exact email but have messy imported name data,
- or a row may include an email that already belongs to an existing donor and therefore cannot safely create a new donor record.

In all of these cases, user review is more appropriate than automatic creation or automatic linking.

### Donor Review After Donor Match

After donor match, the user should review rows according to the type of donor outcome.

#### Existing Donor

If a row has enough evidence for a confident automatic donor match, the donor is linked automatically.

Current intended rule:

- exact first name,
- exact last name,
- and a unique matching email

This is the strongest current donor-match path and is the normal basis for automatic donor linking.

In the normal path, the user does not need to take further donor action on that row unless something looks wrong.

#### Possible Donor Match

If a row has plausible donor evidence but not enough for safe automatic linking, it remains blocked for donor review.

This includes cases such as:

- exact first name and last name without enough email confidence,
- exact unique email without enough matching name confidence,
- or other cases where the system has good reason to pause rather than guess.

In donor review, the user can:

- link the existing donor if they recognise the match,
- or treat the row as a new donor if they have reviewed the evidence and decided it is not the same donor.

Treating the row as a new donor is an explicit review decision.

It does not create the donor immediately.

It clears the possible-match blocker and allows the row to follow the new-donor path later if the row is otherwise safe to process.

#### New Donor

If no confident donor match is found and no likely donor candidates are presented, the row can remain on the new-donor path.

In this case, the system is not asking the user to resolve a possible match first.

If the row is otherwise complete, it can later create a new donor during processing.

### Email Rules During Donor Review

Email handling is especially important in donor review.

If a row is linked to an existing donor and the staged email is new for that donor, processing may add that email to the donor record as an additional email.

This is useful because it allows imported donations to enrich an existing donor record without creating a duplicate donor.

If a row is not linked to a donor and its email already belongs to another donor's `primaryEmail`, the row cannot safely create a new donor with that same primary email.

In that case, the user must resolve the donor review properly rather than allowing the row to proceed as a new donor.

This is an important reason why email-only or name-only donor evidence may still need review even when the user believes the donor is new.

### Gift Coding And Attribution Review

After donor review, the next major question is whether the staged gift carries any attribution or coding evidence that should be resolved before processing.

Gift Coding is where the user turns imported or source-system evidence into canonical CRM links:

- `Appeal`,
- `Appeal Source`,
- and `Fund`.

The important distinction is between rows with coding evidence and rows with no coding evidence.

If a row contains source attribution evidence, the system should not silently ignore it.

If a row contains no attribution evidence, the system should not invent a blocker just because the gift is uncoded.

#### Batch-Level Coding

Batch coding is useful when many rows share the same known coding.

Typical examples:

- the whole CSV import belongs to one appeal,
- the whole batch should default to one fund,
- or the whole batch genuinely belongs to one appeal source.

Batch coding should be treated as a speed tool.

It should generally fill blanks rather than overwrite more specific row-level evidence.

If a row has its own source evidence, especially an `appealSourceExternalId`, that row-level evidence should usually take precedence over broad batch defaults.

#### Appeal Source External IDs

An `appealSourceExternalId` is strong attribution evidence.

It is intended to support imports from systems where a provider-side fundraiser, page, campaign segment, or source has its own stable ID.

Expected behavior:

- if exactly one matching `Appeal Source` exists, the readiness/check process can link it automatically,
- if that `Appeal Source` belongs to an appeal and the row has no appeal selected, the appeal can be inferred,
- if the row already has the same appeal selected, the match can link cleanly,
- if the row has a conflicting appeal selected, the system should pause for review rather than silently override,
- if no matching `Appeal Source` exists, the external ID should remain visible for review,
- and if more than one match exists, the system should not guess.

This makes external IDs linking clues, not just notes.

If a matching source cannot be resolved, the likely user action is to create or select the correct `Appeal Source`, then re-check the row.

#### Source Names

Source names such as `sourceAppealName` and `sourceFundName` are useful evidence, but they are weaker than stable IDs.

Expected behavior:

- show the source name to the user during review,
- do not auto-link based on fuzzy or similar names in v1,
- and require review if source-name evidence exists but the canonical `Appeal` or `Fund` has not been linked.

This keeps imported text evidence visible without creating risky automatic attribution.

#### No Coding Clues

If a row has no appeal, appeal source, fund, external ID, or source-name evidence, Gift Coding can remain blank unless the organisation has its own operational rule requiring coding.

In that case:

- the system should not block processing just because there is no coding clue,
- the user can still code the row manually if they know the right attribution,
- and batch coding may be the fastest way to apply shared coding where the whole import is known to belong to one appeal or fund.

#### Fund Defaults

Fund can come from several places:

- explicit row-level fund selection,
- source fund evidence from import,
- appeal default fund,
- or batch default fund.

The intended priority is:

- explicit selected fund wins,
- source fund evidence should be surfaced for review if not linked,
- appeal default fund can be a helpful default when choosing an appeal,
- and batch fund defaults should fill blanks rather than overwrite row-specific resolved coding by default.

### Readiness Check

After donor review and other row corrections, the user can run a readiness check.

The readiness check is intended to answer:

- which rows can likely be processed now,
- which rows still need review,
- and which rows are already processed or already failed.

Rows should only move into a processable state when the system has the minimum required information to create a Gift safely.

### Processing

Processing is the point where staged rows become committed Gifts.

The intended product posture is:

- process rows only when they are ready,
- stop rows that still need review,
- and treat the committed Gift as the long-term canonical record.

When processing succeeds, the Gift is the real fundraising record.

Gift Staging remains important as an operational audit trail, but it should not compete with the committed Gift as the main truth.

### Admin / Configuration Notes

Current working guidance:

- the default Gift Staging queue should emphasize active operational work rather than historical processed rows,
- processed rows are usually not the main day-to-day queue once import work is complete,
- and views/filters may still be adjusted at workspace level to suit each client.

This area is still being refined through walkthrough testing.

### Open Points In This Workflow

The following points are still being actively refined:

- the most helpful default Gift Staging queue/view,
- how clearly partial matches and no-match rows are distinguished in batch review,
- how visible post-processing reconciliation issues should be if a Gift is created but staging writeback does not finalize cleanly,
- and which additional queue slices are valuable without overwhelming users.
