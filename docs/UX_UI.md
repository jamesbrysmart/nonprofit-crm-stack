# UI / UX Principles

Updated: 2026-04-02
Status: Current guidance
Purpose: Define stable UX and interaction principles for custom UI in this project.

This doc is authoritative for UX principles only.

Related docs:

- `docs/ui/ARCHITECTURE.md`: shared UI model, reuse criteria, and open architectural questions.
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

## 5. Accessibility And Responsiveness

- Follow WCAG AA expectations for focus, contrast, and readable semantics.
- Desktop is the primary target, but layouts should remain usable on narrower admin windows.
- Responsive behavior should preserve task clarity, not just avoid visual breakage.

## 6. Design Debt

- Provisional UX decisions should be easy to find and revisit.
- When a workflow diverges intentionally from a current default, record why in the relevant architecture or feature doc rather than leaving the difference unexplained in code.
