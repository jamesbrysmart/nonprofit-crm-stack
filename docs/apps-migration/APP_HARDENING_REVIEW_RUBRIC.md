# Twenty App Hardening Review Rubric

Updated: 2026-05-14
Status: Working note
Purpose: Define how to run a high-signal hardening review of the fundraising Twenty app without overreacting to fast-moving Twenty platform areas.

Use this rubric alongside:

- [REVIEW_POSTURE.md](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/REVIEW_POSTURE.md)
- [TWENTY_EXTENSIBILITY_WATCH.md](/home/jamesbryant/workspace/dev-stack/docs/TWENTY_EXTENSIBILITY_WATCH.md)

This rubric is for implementation and architecture review.

It is not a substitute for product-context review. If a finding depends on product intent, record it as a technical concern with a product dependency rather than deciding it locally.

## 1. Review Goal

The goal is to identify:

- what is sound and can stay,
- what is provisional and should be documented as such,
- what is risky enough to change before broader expansion,
- and what needs product validation before any refactor should be recommended.

This is not a style sweep.

It is a hardening review aimed at:

- repeatable code patterns,
- clean separation of concerns,
- maintainability,
- runtime and data integrity,
- and avoiding expensive refactor later.

## 2. Primary Review Priorities

Prioritize issues that Twenty is unlikely to fix for us:

- weak separation between UI, orchestration, and domain logic,
- repeated one-off implementations where a reusable pattern should exist,
- brittle mutation and linking flows,
- stale or misleading record state caused by our own refresh/update model,
- code organization that makes future features harder,
- avoidable API/query pressure caused by local design,
- weak failure handling or partial-update risk,
- and patterns likely to cause a painful refactor even if Twenty itself stayed unchanged.

These should be the highest-signal review targets.

## 3. Secondary Review Priorities

Review platform-fit issues where Twenty is clearly evolving or standardizing:

- current SDK import and packaging patterns,
- command/front-component wiring,
- front-component runtime assumptions,
- application-variable behavior,
- layout/page/tab primitives,
- app manifest/entity conventions,
- and other areas already tracked in [TWENTY_EXTENSIBILITY_WATCH.md](/home/jamesbryant/workspace/dev-stack/docs/TWENTY_EXTENSIBILITY_WATCH.md).

Default posture in this bucket:

- align with current documented or clearly-emerging Twenty direction where practical,
- document assumptions,
- and avoid deep refactor unless the issue creates real fragility now.

## 4. Handling Model For Findings

Every finding should land in one of these buckets.

### 4.1 Fix Now

Use when the issue is:

- a correctness problem,
- a data-integrity problem,
- a serious stale-state or reconciliation problem,
- a clear platform misuse,
- a maintainability issue likely to block future work,
- or a repeated code pattern that should be stabilized before more features are added.

### 4.2 Document And Watch

Use when the issue sits in a fast-moving Twenty area and is acceptable for now, but should stay visible.

Examples:

- current front-component wiring pattern is version-sensitive,
- a workaround exists because Twenty does not yet expose a better primitive,
- upstream appears to be standardizing a better shape but the local benefit of refactoring now is low.

These findings should point to:

- the current working pattern,
- why it is acceptable today,
- and what upstream change should trigger review.

### 4.3 Leave Alone

Use when the issue is:

- low-signal cleanup,
- minor inconsistency with no meaningful cost,
- speculative improvement without pressure,
- or platform churn that does not currently change product quality or refactor risk.

## 5. Review Categories

### 5.1 Code Structure And Separation

Review questions:

- Are front components focused on UI and local interaction, or are they accumulating domain orchestration?
- Are logic functions used where cross-record or business-rule boundaries need a stable server-side home?
- Are shared helpers and domain logic extracted cleanly enough to be reused?
- Are modules growing into hard-to-reason-about mixed-responsibility files?

Priority signals:

- duplicated workflow logic across components,
- API access mixed too deeply into rendering code,
- mutation flows duplicated in multiple places,
- weak boundaries between transport, orchestration, and domain rules.

### 5.2 Reuse And Repeatable Patterns

Review questions:

- Do similar workflows use similar shapes?
- Are we building stable patterns or accumulating one-off implementations?
- Is a repeated local solution narrow and deliberate, or is it becoming accidental infrastructure?

Priority signals:

- near-duplicate flows with slightly different mutation logic,
- multiple ad hoc ways to solve the same app problem,
- repeated manual fetch/refetch/writeback patterns that should be abstracted.

### 5.3 Runtime And Data Correctness

Review questions:

- Could data become stale, misleading, partially updated, or hard to reconcile?
- Do action boundaries recompute or validate enough state before committing important workflow changes?
- Are there clear invariants that only hold on one app path but not on native Twenty edit paths?

Priority signals:

- partial-success mutation paths,
- missing failure recovery or batch finalization safeguards,
- derived operational meaning that can drift silently,
- operator-visible state that can become untrustworthy.

### 5.4 API And Operational Efficiency

Review questions:

- Are we making repeated queries or recomputations that are likely to create unnecessary API pressure?
- Are current fetch/update patterns operationally safe at expected volumes?
- Which current bounded assumptions are acceptable, and which should already be flagged?

Priority signals:

- repeated page-load derivation of the same expensive state,
- hard-coded ceilings or pagination limits that distort results,
- avoidable per-widget refetch storms,
- orchestration patterns that become noisy as more clients or records arrive.

### 5.5 Twenty Platform Alignment

Review questions:

- Are we materially off the current Twenty direction in a way that matters?
- Are we depending on undocumented host behavior?
- Are we carrying app-owned workarounds that should now be revisited?

Use [TWENTY_EXTENSIBILITY_WATCH.md](/home/jamesbryant/workspace/dev-stack/docs/TWENTY_EXTENSIBILITY_WATCH.md) as the filter for what is likely to move upstream.

Priority signals:

- reliance on patterns Twenty is clearly replacing,
- workaround code that remains after Twenty adds native support,
- assumptions based only on `twenty-core` internals rather than docs or SDK surface.

### 5.6 Documentation And Future Session Guidance

Review questions:

- What stable lesson should future sessions inherit?
- What should be recorded as provisional rather than re-discovered?
- What needs a revisit trigger?

Priority signals:

- repeated discussion of the same implementation question across sessions,
- platform-fit assumptions not captured anywhere,
- working patterns that are already shaping multiple features.

## 6. What Usually Does Not Count As A Finding

Usually exclude:

- minor style issues,
- harmless naming inconsistencies,
- cleanup ideas without operational or refactor value,
- product-shape criticism that is really a product decision,
- and refactor suggestions based only on a newer Twenty pattern unless there is a concrete benefit now.

## 7. Product-Adjacent Issues

If a technical concern depends on product intent, label it explicitly.

Preferred labels:

- technical concern, product assumption
- acceptable if product intends X
- needs product validation before refactor

This review should stay technically opinionated without pretending to settle wider product decisions from partial context.

## 8. Recommended Review Output

The review should produce three outputs:

1. Review findings
   - ordered by severity or refactor value
2. Open technical questions
   - especially where platform validation or product confirmation is needed
3. Docs deltas
   - the smallest useful updates to migration working docs

Do not mix these into one undifferentiated memo.

## 9. Suggested Severity Model

- High
  - fix before meaningful expansion
- Medium
  - address soon or document explicitly as provisional
- Low
  - note only if it teaches a reusable pattern or prevents future confusion

## 10. Current Review Bias

For the current fundraising app:

- be strict on repeatable code quality, separation of concerns, and maintainability,
- be strict on data correctness and stale-state risks,
- be measured on fast-moving Twenty platform edges,
- and prefer documenting platform-sensitive issues over refactoring them unless they are materially hurting the app now.
