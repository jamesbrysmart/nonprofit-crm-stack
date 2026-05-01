# Twenty App Runtime Architecture Questions

Updated: 2026-04-29
Status: Working note
Purpose: Capture the main runtime and architectural questions that sit between fundraising product design and the current Twenty apps model.

This note is intentionally exploratory.

- It reflects our first real implementation work in Twenty apps.
- Twenty apps are still early enough that some patterns should be treated as provisional until they are tested harder.
- The right answer for a pilot may not be the right answer for a production-ready multi-client product with higher data volumes and stricter operational expectations.

The goal is not to preserve early patterns for their own sake.

The goal is to make the open decisions visible now so we can validate them deliberately and avoid a large corrective refactor later.

## 1. Source Of Truth

When reasoning about app-runtime behavior:

- Twenty apps docs are the primary contract.
- `services/twenty-core` source is supporting evidence for current behavior, not a contract by itself.
- local fundraising migration notes are working context, not authoritative proof that a Twenty-app pattern is supported.

Practical rule:

- use the docs first to establish whether an app capability exists,
- then use `twenty-core` source to understand how it currently behaves,
- and treat any gap between docs and source as a validation question rather than an excuse to assume either side is fully correct.

## 2. Working Product Priority

Current priority:

- build a high-quality product,
- keep the data model lean where that is genuinely the right choice,
- and avoid storing derived meaning unnecessarily.

This means:

- we are not pursuing `derived over stored` as an ideology,
- we are using it as a default pressure against metadata sprawl,
- but we should store more when the product, workflow, or operational model clearly benefits.

If a leaner model creates brittle runtime behavior, weak operational visibility, or expensive re-derivation everywhere, that is a signal to revisit the storage boundary rather than defend the original preference.

## 3. Durable Facts vs Operational Meaning

Current framing:

- Twenty metadata fields should primarily store durable business facts.
- The app should derive operator-facing meaning from those facts where possible.
- Logic functions should materialize or coordinate state only when a workflow genuinely needs that state to be stable and reusable.

Examples of durable facts:

- donor-entered or operator-entered values,
- provider identifiers,
- event timestamps,
- explicit linkage between records,
- externally sourced statuses or references.

Examples of operational meaning:

- review readiness,
- matching confidence,
- Gift Aid claimability outcome,
- recurring health,
- queue membership,
- workflow warnings or summaries.

The key question is not whether something can be derived.

The key question is whether deriving it only at read time is still operationally sound.

## 4. A Three-Tier Decision Model

Use this model when deciding whether a concept should stay derived or become stored.

### 4.1 Read-Time Derived

Prefer read-time derivation when:

- the result is lightweight to compute,
- it is only needed in one or a small number of app surfaces,
- it is mainly explanatory or presentational,
- and stale data outside that surface would not break workflow integrity.

Good fit:

- summary labels,
- explanation text,
- lightweight review framing,
- donor or agreement display helpers.

### 4.2 Derived Then Materialized As Operational State

Prefer materializing a derived result when:

- the result drives queues, batches, filters, dashboards, or alerts,
- multiple surfaces need the same answer consistently,
- the meaning needs to survive outside one widget render,
- or the answer should remain visible even when the underlying records are not being viewed through the app.

Good fit:

- processing state,
- batch outcomes,
- blocking issue flags,
- workflow-specific review status that must be queried repeatedly.

### 4.3 Stored As First-Class Business Fact

Prefer first-class storage when the value is itself part of the domain truth rather than an interpretation.

Good fit:

- declaration facts,
- provider evidence,
- user decisions,
- authoritative external responses,
- explicit workflow commitments that must be auditable.

## 5. The Runtime Handover Boundary

One of the main open questions is where responsibility shifts between:

- Twenty as the durable data platform,
- front components as local UI/workflow shells,
- and logic functions as orchestrators and invariant-enforcers.

Current working model:

- front components are acceptable for direct reads and simple local writes,
- logic functions are preferable when an action spans multiple records, needs orchestration, or encodes business rules we do not want duplicated across UI surfaces,
- and native Twenty surfaces should remain in the loop wherever they are good enough rather than replaced automatically.

This means the question is not "how many logic functions should an app have?"

The question is:

- which actions are simple enough to keep at the component/client layer,
- which actions need a stable server-side boundary,
- and which outcomes must remain correct even when edits happen outside the current app flow.

## 6. The Update Propagation Problem

This is currently one of the most important open architectural questions.

If a derived or materialized meaning is only refreshed when records move through our custom app workflow, then that meaning is not a full system invariant.

It is only a consequence of one path.

That may be acceptable for some pilot behavior.

It is not automatically acceptable for a production-ready system where:

- records may be updated through native Twenty editing,
- multiple operators may touch the same objects,
- imports or integrations may write into the same records,
- or downstream workflows assume the app-owned interpretation is always current.

When this risk exists, we need to decide deliberately between:

- accepting the concept as view-local and best-effort,
- adding a reconciliation path,
- adding event-driven refresh logic where the apps framework supports it,
- or storing more explicit operational state.

## 7. Pilot vs Production Thresholds

The pilot may legitimately accept patterns that would need tightening later, but only if we name that tradeoff clearly.

Pilot-tolerable patterns may include:

- bounded batch sizes,
- more re-derivation at read time,
- manual refresh assumptions,
- app-controlled workflow updates as the main state-refresh path,
- and narrower operational guarantees.

Production-ready expectations for a broader rollout are likely stricter:

- larger record volumes,
- consistent behavior across multiple operators and edit paths,
- less dependence on one custom surface to keep state fresh,
- clearer error recovery and reconciliation,
- and stronger guarantees for queue state, derived outcomes, and auditability.

The preferred posture is still to learn the stronger answer now where we can.

We should not accept a fragile pilot pattern just because it "works for now" if we already suspect it will force expensive redesign later.

## 8. Pressure Signals That A Lean Model Is No Longer Lean

The `derived over stored` default stops being helpful when it creates too much hidden cost.

Warning signs:

- the same derivation is repeated across many components or functions,
- several screens need the same filtered operational state,
- API traffic rises mainly because we keep reloading and recomputing the same answers,
- records can become misleading when edited outside our workflow,
- users need to search, batch, or report on a value that only exists transiently in code,
- or the app needs more and more ad hoc refresh logic to stay believable.

At that point, the system may be telling us to:

- centralize the derivation,
- materialize an operational field,
- or promote the concept into a more explicit workflow state.

## 9. Current Questions To Keep Re-Evaluating

- Which fundraising concepts are safe as read-time derivations only?
- Which concepts need stable operational state for batching, queueing, or reporting?
- Which updates must remain correct even when records are edited outside our app-controlled flows?
- Where should we prefer direct front-component data access versus route-backed logic functions?
- What level of API pressure is acceptable for record pages, queue pages, and batch operations?
- Which current bounded assumptions are acceptable for a pilot but not for wider production use?
- Which app-runtime patterns are documented and supported by Twenty apps, and which are merely visible in current implementation?

## 10. Working Session Guidance

When a future session hits one of these questions, prefer recording the answer here if it affects more than one feature.

Good updates for this note include:

- a clarified runtime boundary,
- a repeated rule for when to store versus derive,
- evidence that a Twenty app capability is strong enough to rely on,
- a warning that a pilot pattern does not scale,
- or a product-level reason to store more state than we first expected.

If a finding is still weak:

- record it as a question or current leaning,
- do not overstate it as settled architecture.
