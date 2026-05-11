# UI / UX Principles

Updated: 2026-05-04
Status: Current guidance
Purpose: Define stable UX and interaction principles for custom UI in this project.

This doc is authoritative for UX principles only.

Related docs:

- `docs/ui/ARCHITECTURE.md`: shared UI model, reuse criteria, and open architectural questions.
- `docs/ui/OPERATIONAL_COMPONENT_PATTERNS.md`: recurring operational component shapes for custom UI while Twenty SDK UI evolves.
- `docs/ui/STORYBOOK.md`: Storybook process and review guidance.
- `docs/ui/TWENTY_APPS.md`: migration-aware guidance for Twenty apps/front components.

## 1. Product Fit

- Default toward visual parity with Twenty so custom workflows feel like part of the same product.
- Prefer consistency over novelty while shared patterns are still maturing.
- Use bespoke UI only when the workflow genuinely needs it.

## 2. Workflow-Heavy Admin UI

- Primary actions should be obvious without scanning the full page.
- Keep high-signal workflow context close to the action surface.
- Prefer in-context completion for workflow-heavy admin tasks unless leaving the page clearly improves the task.
- Consistency matters most in the parts of the workflow users perceive as the same job.

## 3. States And Feedback

- Loading, empty, error, and success states should feel deliberate rather than incidental.
- Feedback should explain outcome and, when useful, the next action.
- Use motion only to reinforce state change, not as decoration.

## 4. Tone And Copy

- Keep microcopy concise, clear, and action-oriented.
- Use sentence case.
- Avoid decorative or overly clever phrasing in operational workflows.
- Prefer operator-facing product language over internal model or engineering language.
- Describe what the user should do or what happened to their work, not how the system models the state.

## 5. Accessibility And Responsiveness

- Follow WCAG AA expectations for focus, contrast, and readable semantics.
- Desktop is the primary target, but layouts should remain usable on narrower admin windows.
- Responsive behavior should preserve task clarity, not just avoid visual breakage.

## 6. Design Debt

- Provisional UX decisions should be easy to find and revisit.
- When a workflow diverges intentionally from a current default, record why in the relevant architecture or feature doc rather than leaving the difference unexplained in code.

## 7. As-Built Notes

- `apps/fundraising/nonprofit-fundraising`: gift staging review widgets currently share a compact local styling layer, inherit host typography by default, and should expose one review tab rather than carrying parallel legacy and v2 review surfaces.
- `apps/fundraising/nonprofit-fundraising`: gift staging review copy is moving away from technical/internal terms toward donation-admin language such as `gift record`, `donor details`, `selected donor`, and `review later`.
- `apps/fundraising/nonprofit-fundraising`: recurring agreement record UI now prefers a lean `Home` tab made of compact signposting blocks (`Recurring state`, `Donor context`, `Linked gifts`) and avoids a separate all-in-one review surface.
- `apps/fundraising/nonprofit-fundraising`: Gift Aid claim batch first-tab UI now prefers compact control/signposting blocks (`Claim summary`, `Primary action`, `Gift worklists`, `Submission status`) rather than a single long workspace component with inline preview lists.
- `apps/fundraising/nonprofit-fundraising`: Gift Aid claim submission records now use a single curated `Home` tab that reads as system-generated history/audit context rather than a user-maintained workflow object.
- `apps/fundraising/nonprofit-fundraising`: manual gift entry treats Gift Aid as an optional bounded sub-workflow. If included in the surface, it renders only on the individual path and never on the company path.
- `apps/fundraising/nonprofit-fundraising`: the `Gift` record is moving toward `Home` / `Details` / optional `Gift Aid` tab composition, with native `FIELDS` views used for ordinary maintenance and custom Gift Aid widgets reserved for UK-specific operational review.
- `apps/fundraising/nonprofit-fundraising`: the `Gift` `Home` tab now uses one compact summary/posture block above native key fields so the record reads as an object to review carefully, not just a casual edit form.
- `apps/fundraising/nonprofit-fundraising`: refund is now treated as a dedicated lifecycle-style `Gift` tab rather than a `Home` widget, while `Home` only signposts refund state/posture when present.
- `apps/fundraising/nonprofit-fundraising`: `Gift batch` now prefers a fresh compact `Home` tab made of `Batch summary`, `Batch actions`, and `Worklist links`, while the older monolithic `Review` surface can remain as a stale fallback until local layout persistence is cleaned up.
