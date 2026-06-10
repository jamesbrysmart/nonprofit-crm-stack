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
- `apps/fundraising/nonprofit-fundraising`: staged donor review now includes an explicit `Mark anonymous donor` action so missing donor evidence stays blocking by default unless anonymity is intentionally confirmed by a reviewer.
- `apps/fundraising/nonprofit-fundraising`: recurring agreement record UI now prefers a lean `Home` tab made of compact signposting blocks (`Recurring state`, `Donor context`, `Linked gifts`) and avoids a separate all-in-one review surface, while native `Timeline` and `Notes` remain available as support tabs for durable follow-up context.
- `apps/fundraising/nonprofit-fundraising`: Gift Aid claim batch first-tab UI now prefers compact control/signposting blocks (`Claim summary`, `Primary action`, `Gift worklists`, `Submission status`) rather than a single long workspace component with inline preview lists, while native `Timeline` and `Tasks` remain available as secondary support tabs.
- `apps/fundraising/nonprofit-fundraising`: Gift Aid claim submission records now use a single curated `Home` tab that reads as system-generated history/audit context rather than a user-maintained workflow object.
- `apps/fundraising/nonprofit-fundraising`: manual gift entry treats Gift Aid as an optional bounded sub-workflow. If included in the surface, it renders only on the individual path and never on the company path.
- `apps/fundraising/nonprofit-fundraising`: the `Gift` record is moving toward `Home` / `Details` / optional `Gift Aid` tab composition, with native `FIELDS` views used for ordinary maintenance and custom Gift Aid widgets reserved for UK-specific operational review.
- `apps/fundraising/nonprofit-fundraising`: the `Gift` `Home` tab now uses one compact summary/posture block above native key fields so the record reads as an object to review carefully, not just a casual edit form.
- `apps/fundraising/nonprofit-fundraising`: refund is now treated as a dedicated lifecycle-style `Gift` tab rather than a `Home` widget, while `Home` only signposts refund state/posture when present.
- `apps/fundraising/nonprofit-fundraising`: the standard `Person` record now uses a lightweight custom `Home` tab that stays person-first, shows general contact context by default, and only adds fundraising context when giving / Gift Aid / recurring data is actually present.
- `apps/fundraising/nonprofit-fundraising`: the standard `Company` record now has a matching lightweight custom `Home` summary component that stays company-first, shows general organisation context by default, and only adds fundraising context when linked gifts or opportunities are actually present.
- `apps/fundraising/nonprofit-fundraising`: `Donation form` now treats `Configure`, `Preview`, and `Publish` as record-level tabs rather than nested workspace modes; `Preview` should keep its controls compact so the saved-draft form itself remains the dominant visual element.
- `apps/fundraising/nonprofit-fundraising`: front components now share local UI primitives from `src/front-components/front-component-ui.tsx` for repeated panels, labels, text, inputs, textarea, links, code blocks, badges, compact metadata, and divider treatments; new UI work should extend that neutral layer before adding fresh inline style variants. Use `CompactMetaGrid` and `CompactMetaItem` for repeated compact label/value summaries.
- `apps/fundraising/nonprofit-fundraising`: the `Gift` record now restores native `Timeline` and `Notes` as supporting tabs after the fundraising-specific `Home` / `Details` / `Refund` structure, so durable gift history and commentary remain available without cluttering the core review surface.
- `apps/fundraising/nonprofit-fundraising`: `Gift batch` now prefers a fresh compact `Home` tab made of `Batch summary`, `Batch actions`, and `Worklist links`; when the batch is empty, `Batch summary` should give a lightweight next-step instruction for using Twenty's native import flow and a small setup area for expected batch count/value rather than trying to recreate import UI inside the batch page. Native `Timeline` and `Notes` remain available as secondary support tabs.
- `apps/fundraising/nonprofit-fundraising`: `Gift batch` coding is now a collapsed-by-default `batch coding defaults` surface above the worklists, not a general-purpose bulk mutation tool. It should store durable default `Appeal`, `Fund`, and `Appeal source` selections on the batch, auto-fill `Fund` from the selected `Appeal` when helpful, and offer one safe apply action that fills blank coding fields on unprocessed rows without implying row-level undo semantics.
- `apps/fundraising/nonprofit-fundraising`: `DonationForm` now intentionally diverges from compact operational record layouts. It uses record-level `Configure` / `Preview` / `Publish` tabs because the object behaves like a durable public-facing editor workflow, not a quick transient review record. `Preview` should reflect the saved draft with the shared donation-form renderer, while `Publish` owns the live/public step and embed snippet.
- `apps/fundraising/nonprofit-fundraising`: the staging and committed-gift coding widgets now surface fundraiser soft credit as a lightweight derived readout beneath `AppealSource`, not as a parallel editable control. For the current fundraiser/P2P pattern, users should correct the `AppealSource` when fundraiser credit looks wrong.
