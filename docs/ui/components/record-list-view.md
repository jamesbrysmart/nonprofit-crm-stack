# Record List / View Requirements

Updated: 2026-04-05
Status: Working requirements (`stage-2`)
Purpose: Define the shared requirements, variation points, and open questions for the project's repeated record-list/view pattern.

This is a component-requirements doc, not a final implementation decision.

## 1. Problem

This project repeatedly needs list-driven workspaces where users review many records, narrow the set, inspect details, and act without losing context.

Today, those workspaces share obvious structural similarities but still drift in behavior, layout, state handling, and interaction posture. That drift creates two problems:

- users see similar jobs presented with different operating rules,
- engineers keep rebuilding near-duplicate page assembly in different ways.

High-level architecture guidance is not enough here because the record-list/view problem is strategically important and recurs across multiple workflows. We need a clearer statement of what this pattern must do before deciding what implementation shape it should take.

The main risk here is not over-abstraction. The main risk is continuing to duplicate near-identical list workspace code and letting core record-list behavior drift.

## 2. Candidate Scope

Workflows likely in scope:

- recurring,
- reconciliation,
- appeals,
- gift processing/staging,
- Gift Aid review,
- other future list-driven workspaces where the user filters, reviews, and acts on a set of records.

Intentionally out of scope:

- simple CRUD index pages with minimal workflow behavior,
- generic tables used only for passive display,
- standalone record pages that are not part of a list-driven workflow.

## 3. Shared Requirements

The repeated pattern should be able to support:

- clear workspace identity and context,
- a consistent control model for narrowing and ordering records,
- deliberate loading, empty, filtered-empty, error, and success states,
- a results surface that makes the current set obvious,
- pagination or equivalent set navigation when the record count grows,
- selection and detail/review behavior that keeps context intact when appropriate.

Common operating rules likely include:

- users should be able to understand what set of records they are looking at,
- filters, search, and sort should feel related rather than scattered,
- applied state should be visible when it changes what the user is seeing,
- results-state framing should be predictable even when the inner renderer differs,
- detail/review behavior should support continuity rather than forcing unnecessary context switches.

The core value of this pattern is a consistent user operating model for working through records. Users should not have to relearn how to work a list each time they move between similar list-driven workflows.

This pattern must be able to accommodate both:

- browser-style workspaces where the user is reviewing and comparing records,
- queue-style workspaces where the user is triaging and resolving operational work.

This doc treats the summary/header area above the list as related but separate. The record-list/view requirements focus on how the user works with the record set itself, not on the surrounding workspace summary chrome.

## 4. Variation Points

Expected legitimate variation includes:

- table vs card results surfaces,
- calmer browser/list behavior vs denser operational queue behavior,
- workflow-specific controls,
- row/card actions,
- the amount of record metadata shown directly in the results surface,
- the role and density of the detail/review surface.

The component should be configurable in the record content it renders. Different workflows may need different fields, signals, and domain-specific actions while still using the same core list behavior.

Variation should remain local when:

- it materially changes the task model,
- it adds workflow-specific operational behavior,
- it would make a shared abstraction harder to understand than separate implementations.

Examples of likely local variation:

- staging batch and queue operations,
- appeal-specific card presentation,
- payout-specific reconciliation signals,
- domain-specific row content and detail modules.

## 5. Success Criteria

UX outcomes:

- similar list-driven workspaces feel recognizably related,
- users do not need to relearn the same core interaction model on each page,
- important state changes and next actions are easier to understand,
- workflow-specific differences still feel intentional rather than arbitrary.

Code and maintenance outcomes:

- repeated page assembly is reduced,
- shared rules live in one place,
- differences are explicit rather than emerging from accidental drift,
- future sessions can extend the pattern without copying entire pages.

Migration-aware outcomes:

- the eventual shared model can plausibly survive into a Twenty-app context at least in part,
- the work does not over-invest in page-local assumptions if a more portable contract is possible.

## 6. Implementation Options

1. Shared component
- strongest consistency if the rules are genuinely common
- highest risk if unlike workflows are forced into the same renderer or API

2. Shared composition contract
- strong fit when the shared layer is mostly structure and state framing
- allows different result renderers without losing consistency

3. Shared headless model with multiple renderers
- useful if the commonality is mostly behavioral rather than visual
- can be powerful, but may be harder to understand and adopt consistently

4. Mostly local implementations with a smaller shared shell
- lowest abstraction risk
- may still allow too much drift if the shared surface is too thin

This doc does not choose between these yet. The important point is that a more substantial shared record-list/view model remains a live option and should be evaluated seriously, not ruled out by default.

What should remain open:

- the exact implementation shape,
- which parts are fixed versus configurable,
- how far one shared model should span browser-style and queue-style workflows.

What is no longer open:

- this area deserves serious consolidation,
- consistent record-list behavior is a product priority,
- a future implementation should be evaluated against the repeated user job, not against accidental differences in current pages.

## 7. Twenty Apps Considerations

Potentially portable:

- composition contracts,
- headless state shaping,
- consistent record-list behavior rules,
- focused result modules,
- predictable state framing,
- selection/detail interaction rules that can map to a front component or related surface.

More likely local-only:

- layout assumptions tied to the current fundraising-service app shell,
- deeply local styling structure,
- operational behavior that depends on the current page and route ownership.

Needs validation before we treat it as portable:

- how well queue-style and browser-style list views map to Twenty app surfaces,
- how detail/review behavior maps to Twenty-native panel or related navigation models,
- whether a shared list/view model should be implemented as one component family or as a lighter contract plus local renderers.

Twenty's own list view should be treated as an explicit reference point when evaluating this pattern. We do not need to copy it literally, but we should learn from how it handles core list behavior, consistency, and flexibility.

## 8. Current Open Questions

Confirmed open questions:

- Which rules are truly common versus only superficially similar.
- Whether one shared record-list/view model should span both browser-style and queue-style workflows.
- Whether the right center of gravity is:
  - a shared component,
  - a shared composition contract,
  - a shared headless model,
  - or a combination of these.
- What degree of variation is acceptable before the shared model stops helping.

Working default:

- continue consolidating obvious shared seams,
- keep the broader shared record-list/view model open as a serious candidate,
- use this doc to decide when that broader step becomes justified.

## 9. References

- `docs/ui/ARCHITECTURE.md`
- `docs/ui/TWENTY_APPS.md`
- recurring, reconciliation, appeals, gift processing/staging, and Gift Aid live workspaces
