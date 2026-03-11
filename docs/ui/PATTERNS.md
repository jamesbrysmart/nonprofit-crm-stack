# UI Patterns (Working Draft)

Updated: 2026-03-11
Status: Working draft (`trial`)
Purpose: Capture reusable interaction patterns for custom UI so we do not restart from scratch each time.

This file is a pattern log, not a fixed design system.

## 0. Interpretation (Important)

- These patterns are working proposals.
- They are expected to change as we test them across real workflows.
- A pattern marked `trial` should be treated as a candidate, not a rule.

## 1. Pattern Format

For each pattern, capture:

- `Status`: `confirmed`, `trial`, or `open`
- `Intent`: what user problem it solves
- `Anatomy`: major UI parts
- `States`: loading/empty/error/success/edge
- `Notes`: implementation constraints and known gaps

## 2. Queue/List With Filters

Status: `trial`

Intent:
- Help operations users triage and act on many records quickly.

Anatomy:
- Summary chips (counts/status)
- Search/filter row
- Dense table with stable key columns
- Row action area with clear primary action

States:
- Loading: keep table structure visible
- Empty (no data): explain next action
- Empty (filtered): offer clear reset
- Error: inline retry + error summary

Notes:
- Current example exists in staging queue (`services/fundraising-service/client/src/components/gift-staging`).
- Column and status language should track Twenty style/tone.
- Keep users in one operational surface where possible; external record-page jumps should be a fallback, not the default path.

## 3. Record Browser Shell

Status: `trial`

Intent:
- Give list-driven workflow pages one stable operating model without forcing every page into the same visual surface.

Anatomy:
- Summary band with scoped metrics and page actions
- Shared controls row for search, filter scope, and sort
- Active chip row for applied search/filter/sort state
- Record surface:
  - dense table, or
  - card list
- Pagination footer
- Right-side review drawer

States:
- Loading
- Empty (no data)
- Empty (filtered)
- Error
- Multi-page navigation

Notes:
- This is the current working baseline for fundraising list pages.
- The aim is shared structure and consistency, not visual uniformity for its own sake.
- Record surfaces may vary by workflow; the more important shared layer is the operating model.
- Detailed review and record actions should usually move into the drawer rather than expanding page density, but this should stay a working default rather than a hard rule.
- Current intended examples:
  - operational queue/table for gift processing,
  - exception table for recurring,
  - list/detail or card-list browser for Appeals.

## 4. Queue + Drawer Variant

Status: `trial`

Intent:
- Apply the record-browser shell to action-heavy operational workflows where dense triage and in-context resolution matter more than richer browsing or editorial review.

Anatomy:
- Shared record-browser structure
- Dense queue/table surface
- Clear per-row primary action
- Right-side review drawer that functions as the main task workspace
- Optional feedback lane for workflow outcomes

States:
- Loading queue
- Empty (no data)
- Empty (filtered)
- Error
- Row ready / blocked / failed / complete
- Workspace scope / parent scope

Notes:
- This is best treated as one operational variant inside the broader record-browser family, not as the only list-page pattern.
- Gift staging is the main current example.
- The parent-scope pattern below is primarily an extension of this variant today.

## 5. Right-Side Review Drawer

Status: `trial`

Intent:
- Let users review/edit one record without losing list context.

Anatomy:
- Header (record identity + status + close)
- Sections (overview, editable fields, diagnostics)
- Sticky footer actions

States:
- Loading selected record
- Validation or update errors
- Action in progress (disable conflicting controls)

Notes:
- Keep action semantics explicit (`Save`, `Mark ready`, `Process`) and avoid hidden side effects.
- Prefer task-complete drawers for operational workflows so users can resolve most records without leaving the page.
- Treat the drawer as a review-and-resolution workspace, not as a general record page.
- Keep audit/debug detail available but secondary; healthy records should feel light rather than over-explained.
- Show the smallest useful set of fields and guidance by default, then progressively disclose lower-signal metadata.

## 6. Guided Manual Entry Form

Status: `trial`

Intent:
- Support fast, low-error manual entry with clear duplicate/donor resolution.

Anatomy:
- Step-like grouped cards
- Contextual helper copy
- Duplicate/suggestion panel
- Submission status panel

States:
- Initial blank
- Duplicate found
- Submit success
- Submit failure with recoverable guidance

Notes:
- Keep form layouts and controls aligned with Twenty-like field behavior.

## 7. Status and Feedback Language

Status: `open`

Intent:
- Keep statuses, alerts, and toasts consistent across views.

Working defaults:
- Use neutral, plain-language status names.
- Show outcome and next action in errors when possible.
- Avoid decorative copy.

Open questions:
- Final status vocabulary standard across all workflow-heavy custom app flows.
- Where to centralize reusable copy constants.

## 8. Dual-Scope Queue (Workspace / Parent)

Status: `trial`

Intent:
- Reuse the same queue + drawer workflow while allowing users to operate either across all child records (workspace scope) or within one parent record context (parent scope).

Anatomy:
- Shared shell remains consistent (summary band, queue panel, action drawer, feedback lane).
- Scope context changes the data slice:
  - Workspace scope: all child records.
  - Parent scope: child records for a selected parent record.
- Scope-aware summaries/actions:
  - Summaries reflect current scope.
  - Parent-scope actions can expose workflow-specific bulk operations.

Notes:
- The layout and interaction model should stay stable across scope changes.
- This pattern should support domain variants (gift staging, case records, memberships, campaigns) without redefining page structure.

## 9. Open UX Questions (Testing)

- When switching workspace scope ↔ parent scope, should filters/sort persist or reset to scope defaults?
- In parent scope, what should always change: summaries, primary CTA, bulk actions, or all three?
- What is the clearest UI cue that the user is in parent scope, and what is the fastest way back to workspace scope?
