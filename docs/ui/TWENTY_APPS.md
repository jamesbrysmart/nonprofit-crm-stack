# Twenty Apps UI Guidance

Updated: 2026-04-02
Status: Working guide (`stage-2`)
Purpose: Define how current UI work should be evaluated against the likely move into Twenty's apps/front-component framework.

This is the current migration-aware UI guidance doc. It should inform local UI decisions without overstating what we have already validated in Twenty.

## 1. Scope

This doc is authoritative for:

- how much the Twenty apps direction should influence current UI work,
- what kinds of UI assets are likely portable,
- what kinds are more likely to remain local,
- which migration questions are still open.

This doc is not authoritative for:

- local shared UI architecture,
- Storybook process,
- general UX principles.

## 2. Current Working Position

Current default:

- current UI work should be aware of the likely move toward Twenty apps/front components,
- migration-friendliness should influence significant UI abstractions,
- migration-friendliness should not override clear local product value for small or obviously useful improvements.

Open:

- the exact limits of Twenty front components for dense operational workflows,
- how cleanly drawer-heavy and queue-heavy fundraising flows map to Twenty-native surfaces.

## 3. Portable Asset Types

`Current default`:

- shared composition contracts,
- headless state/view-model logic,
- focused domain components,
- workflow modules that can live inside a front component.

## 4. Lower-Confidence / Local-Only Asset Types

`Current default`:

- page-specific shells,
- deeply local styling structures,
- route-owned assumptions,
- workflow orchestration that depends on the current fundraising-service app shell.

## 5. Evaluation Criteria For New UI Work

When considering new reuse or refactors, assess:

- portability into a front-component or Twenty app page-layout model,
- dependence on current local shell/layout assumptions,
- whether the abstraction would survive a lift-and-shift,
- whether the investment still has strong local value even if it does not migrate cleanly.

## 6. Current Open Questions

- Shared record-list/view model in a Twenty-app context.
- Drawer/detail-review behavior versus Twenty-native panel models.
- Styling portability versus re-skinning against Twenty primitives.

## 7. Practical Guidance For Current Work

Safe to invest in now:

- small shared composition layers,
- shared state framing,
- focused domain modules,
- headless state shaping that is not tied to the current page shell.

Treat as local-only for now unless proven otherwise:

- large page shells,
- abstractions that assume the current fundraising-service route/layout ownership,
- style systems that only make sense inside the current `f-*` shell.

Spike before hardening:

- anything that claims to be a direct Twenty-app-ready list/detail model,
- anything that depends on assumptions about drawer/panel behavior we have not validated.

## 8. References To Fold In

- `docs/TWENTY_EXTENSIBILITY_WATCH.md`
- current local audit conclusions from fundraising-service UI work
- any validated Twenty app examples we rely on
