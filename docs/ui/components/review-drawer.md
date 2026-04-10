# Review Drawer Requirements

Updated: 2026-04-05
Status: Outline (`stage-1`)
Purpose: Define the shared requirements, variation points, and open questions for repeated right-side review drawers and their core content model.

This is a component-requirements doc, not a final implementation decision.

## 1. Problem

- Why the review drawer is strategically important in this project.
- What problems repeated drawer drift creates in workflow-heavy admin UI.
- Why this pattern needs more explicit requirements than general architecture guidance alone.

## 2. Candidate Scope

- Which workflows likely belong in this pattern discussion:
  - gift processing/staging,
  - recurring review,
  - reconciliation review,
  - appeals review/edit flows,
  - other future review drawers.
- What does not belong here:
  - generic modal/dialog behavior,
  - large standalone record pages.

## 3. Shared Requirements

- Core jobs the drawer must support.
- Expectations for identity, status, primary next step, editable content, audit/detail access, and action footer behavior.
- Common state handling requirements.

## 4. Content Model

- What should usually appear first.
- What should usually be secondary.
- What should be progressively disclosed.
- What likely should not live in the default drawer surface at all.

## 5. Variation Points

- Workflow-specific modules.
- Read-focused vs action-heavy drawers.
- Cases where a drawer may not be the right surface.

## 6. Success Criteria

- What a successful shared drawer model would improve for users.
- What a successful shared drawer model would improve in the codebase.
- What signs would show the abstraction is not helping.

## 7. Implementation Options

- Shared drawer component with slots.
- Shared content contract layered onto local drawers.
- Shared headless model plus local renderers.
- Mostly local implementations with only a few shared sections/primitives.

Document tradeoffs without choosing one prematurely.

## 8. Twenty Apps Considerations

- How likely the drawer model is to map to Twenty-native panels or side-page surfaces.
- Which parts are likely portable.
- Which parts need validation before we rely on them as migration-safe.

## 9. Current Open Questions

- How much of the drawer content model is genuinely common across workflows.
- How much primary action logic should be shared versus workflow-specific.
- Whether the drawer should be treated as a common workspace model or a family of related variants.

## 10. References

- `docs/ui/ARCHITECTURE.md`
- `docs/ui/TWENTY_APPS.md`
- `docs/spikes/drawer-review-workspace.md`
- relevant live drawer implementations
