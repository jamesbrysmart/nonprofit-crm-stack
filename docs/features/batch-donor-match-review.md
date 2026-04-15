# Batch Donor Match Review

Status: Working product note  
Scope: Batch-level guided review for donor-match results in gift staging

This note defines the intended product shape for reviewing ambiguous batch donor-match results after the donor-match run completes.

It complements:

- `docs/features/donation-staging.md`
- `docs/apps-migration/PRODUCT_REVIEW.md`

It does not define backend implementation details or settle the final migrated UI structure.

## Purpose

Batch donor match already resolves clear existing-donor matches at volume.

The remaining product need is a fast review flow for rows that:

- cannot be auto-linked safely,
- still have plausible existing donor candidates,
- or have duplicate existing donors that block safe auto-linking.

The goal is to avoid pushing those rows back into slow row-by-row review in the general staging queue.

## Current Baseline

Current runtime truth:

- donor match can auto-link clear existing-donor matches
- ambiguous duplicate-candidate sets no longer auto-link
- donor match no longer creates donors
- unresolved rows remain unresolved until later processing
- the backend currently records review-required rows mainly as `partial_match_review`, with reason/candidate metadata carrying the more specific distinction between ordinary partial matches and duplicate-blocked exact matches

That means the next product layer is a review experience, not another matching engine.

## Core Use Case

A user runs donor match for a batch and then needs to:

1. see what the run did,
2. quickly confirm or skip plausible partial matches,
3. understand which rows were blocked by duplicate existing donors,
4. leave unresolved rows safely unresolved when no confident decision can be made.

## Proposed V1 Shape

### Entry point

Default direction:

- user clicks `Run donor match` in batch scope
- when the run completes, a batch donor-match review drawer opens if review-required rows exist
- if the run produces no review-required rows, do not force the drawer open just to show a summary

### Drawer summary

The drawer should begin with a compact run summary:

- total rows considered
- auto-linked
- review required
- no match
- insufficient identity
- errors

This gives users confidence that the run made progress before they start reviewing edge cases.

### Main review list

The main body should focus on rows where the user can take meaningful action immediately.

Primary flow:

- `Needs confirmation`
- `Blocked by duplicates`

Secondary/summary flow:

- `Unresolved`
- `No match`
- `Insufficient identity`

For each row, show:

- staged donor evidence:
  - first name
  - last name
  - email
- candidate existing donors
- clear action choices:
  - `Match donor`
  - `Skip`

`Skip` should mean:

- leave the row unresolved
- do not create a donor
- do not silently defer a donor decision inside donor match
- do not invent a special extra workflow state in v1

After `Match donor` or `Skip`, the drawer should auto-advance to the next actionable row.

### Review categories

The drawer should distinguish at least these categories for the user, even if the first backend cut still derives them from one broader `partial_match_review` runtime outcome plus diagnostics/reason data:

1. `Needs confirmation`
   - plausible partial matches
   - user can confirm a candidate donor or skip

2. `Blocked by duplicates`
   - an otherwise strong/exact match was blocked because duplicate lookup returned multiple existing donors
   - this is not just an ordinary partial match; it is also a data-quality signal

3. `Unresolved`
   - no suitable candidate
   - or insufficient identity

The first workflow priority is `Needs confirmation`, with `Blocked by duplicates` surfaced as a distinct escalation class rather than an ordinary candidate-selection case.

## Duplicate-Blocked Exact Matches

These deserve explicit handling.

Where donor match finds what looks like an exact match but multiple existing donor records qualify:

- the row must not auto-link
- the drawer should flag this clearly
- the first version may identify these rows from the donor-match reason/candidate metadata rather than from a dedicated backend outcome type
- the user should understand this is both:
  - a matching problem for the current row
  - and a likely duplicate-donor cleanup signal in the donor database

V1 should surface this clearly without turning donor match into a donor-merge workflow.

V1 handling:

- flag duplicate-blocked exact matches clearly inside the drawer
- do not allow ordinary in-drawer candidate selection for these rows
- provide a link/handoff to Twenty's duplicate merge functionality in a new tab
- expect the user to return and rerun donor match explicitly after duplicate cleanup

Longer term, a tighter end-to-end duplicate-resolution flow may be desirable, but it is out of scope for the first version of this drawer.

## Relationship To Processing

This drawer is not a donor-creation workflow.

The intended boundary remains:

- donor match:
  - link an existing donor where safe
  - otherwise leave unresolved

- later processing:
  - if a row still has no linked donor, processing may create a new donor

That boundary should remain explicit in both UI language and backend behavior.

## Relationship To Manual Entry Matching

Batch donor match should not simply copy manual-entry matching behavior.

Current direction:

- batch auto-link remains stricter than manual-entry suggestions
- useful match language and visual patterns may still align where that improves consistency

So the design should reuse helpful concepts without lowering the batch auto-link bar.

## V1 Boundaries

### In scope

- batch-level review drawer
- run summary
- candidate confirmation for review-required rows
- explicit handling of duplicate-blocked exact matches
- leave unresolved rows unresolved when the user skips
- explicit rerun after external duplicate cleanup

### Out of scope

- donor merge / duplicate-cleanup workflow
- donor creation inside donor match
- a full new matching engine
- broad redesign of the staging queue itself

## Open Questions

1. Should the drawer reuse the existing donor-review card patterns from the staging drawer, or use a more compact batch-specific presentation?
2. What exact labels should be used so users understand the difference between:
   - confirmable partial match
   - duplicate-blocked exact match
   - no suitable match
3. Should duplicate-blocked exact matches become a first-class backend outcome later, or remain a drawer-level classification derived from donor-match diagnostics?
4. Should the drawer offer an explicit rerun action after external duplicate cleanup, or rely on the existing batch-level donor-match action only?

## Current Recommendation

The likely first product iteration is:

- run donor match from batch scope
- open a dedicated batch donor-match review drawer by default when review-required rows exist
- summarize the run at the top
- keep the primary actionable flow focused on:
  - confirm candidate
  - skip
- keep unresolved/no-match/insufficient-identity rows out of the main action stream and visible in summary or secondary sections
- surface duplicate-blocked exact matches as a stronger warning/escalation class within the same review flow
- link out to duplicate merge rather than trying to resolve duplicates inside the drawer
- require an explicit rerun after duplicate cleanup

That keeps the first version simple while still solving the real problem: turning ambiguous donor-match results into a fast batch review workflow instead of falling back to one-row-at-a-time staging review.
