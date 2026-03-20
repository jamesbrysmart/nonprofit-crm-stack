# Twenty Cloud App Fit Spike (2026-03-16)

_Last updated: 2026-03-16_

## Purpose

This spike is an exploratory investigation into how our fundraising module, and future modules built in a similar style, might fit into Twenty's cloud-hosted app model.

This is intentionally broader than "migrate `fundraising-service` into Twenty Apps".

The immediate goal is not to migrate production code. The goal is to reduce uncertainty about:

- what parts of our current module architecture map cleanly into Twenty Apps,
- what assumptions break when we stop assuming self-hosting,
- what still needs an external edge/service layer,
- what feedback we can give Twenty from a real operational module rather than a toy app.

This document is a working spike brief. It should guide exploration, not silently override canonical decisions.

## Why Now

- Twenty Apps and related tooling have continued to mature through the recent upstream changes tracked in [`docs/TWENTY_EXTENSIBILITY_WATCH.md`](/home/jamesbryant/workspace/dev-stack/docs/TWENTY_EXTENSIBILITY_WATCH.md).
- The direction is becoming clearer: richer manifest entities, more explicit install/publish flows, stronger app lifecycle plumbing, and growing AI/app packaging support.
- We are close enough to plausibly learn something meaningful from a real spike, but still early enough that the primary value is learning rather than execution.

## Framing

This spike is about **platform fit and operating model fit**, not just code movement.

It is also about **canonical logic ownership**.

If Twenty Apps become a serious packaging target for this module and future modules, we need to understand not just whether logic can run in an app, but where the canonical domain logic should live over time.

Today our assumptions are heavily shaped by self-hosting:

- we own a separate `fundraising-service`,
- we expose a dedicated fundraising API,
- we rely on service-level auth and middleware,
- we can introduce bespoke operational surfaces freely,
- our testing and deployment assumptions assume we control the whole stack.

If the fundraising module becomes a Twenty App intended to work in Twenty Cloud, some of those assumptions may disappear, some may need to move inside Twenty, and some may still require a vendor-managed edge layer.

That means the spike must answer architectural questions, not just implementation questions.

## Primary Questions

### 1. What would actually move into the app?

- Which current responsibilities belong naturally inside a Twenty App?
- Which responsibilities still look like external edge concerns?
- Which current boundaries are artifacts of our self-hosted architecture rather than enduring product needs?

### 2. What changes if we assume Twenty Cloud?

- Is our current fundraising-specific API still desirable?
- Is it still feasible to expose equivalent routes when the module is app-first?
- Does our current auth layer become unnecessary, partially unnecessary, or still required for some paths?
- Which workflows can run entirely in app logic/functions and which still require external ingress or long-running infrastructure?

### 3. What is missing versus merely awkward?

- Which parts of the current Twenty App surface are true blockers?
- Which parts are possible but clumsy?
- Which parts are straightforward enough that migration planning becomes credible?

### 4. What should we tell Twenty?

- What gaps or rough edges show up when a real operational fundraising workflow is used as the test case?
- Which issues are docs drift versus runtime/platform gaps?
- What would materially improve viability for serious domain modules in Twenty Cloud?

### 5. Where should canonical domain logic live?

- Should domain logic ultimately live in app-native modules that self-hosting also runs?
- Should we instead preserve a shared domain core with distinct app and self-hosted runtime adapters?
- Which parts of our current code are true business rules versus orchestration/runtime glue?
- Can we avoid ending up with duplicated logic implementations across app and service?

## Non-Goals

This spike is not intended to:

- commit us to a migration timeline,
- replace the hybrid posture in [`docs/DECISIONS.md#L538`](/home/jamesbryant/workspace/dev-stack/docs/DECISIONS.md#L538),
- prove that the full fundraising module can already move in-app,
- design the final cloud operating model in one pass,
- produce production-ready UX parity for the whole module.

This spike should also **avoid normalizing duplicated implementations** of the same fundraising logic across app and service runtimes unless the evidence clearly forces that conclusion.

## Proposed Learning Slice

Use the **single-record gift staging -> processing -> gift creation path** as the main backend slice.

Why this slice:

- it is real operational module behavior, not a toy example,
- it exercises staging metadata, logic-function behavior, donor resolution timing, gift creation, and status writeback,
- it is large enough to reveal real platform fit issues,
- it is still narrower than batch processing, full queue UX, or connector/webhook ingestion.

Grounding in current code:

- [`gift.service.ts`](/home/jamesbryant/workspace/dev-stack/services/fundraising-service/src/gift/gift.service.ts)
- [`gift-staging.service.ts`](/home/jamesbryant/workspace/dev-stack/services/fundraising-service/src/gift-staging/gift-staging.service.ts)
- [`gift-staging-processing.service.ts`](/home/jamesbryant/workspace/dev-stack/services/fundraising-service/src/gift-staging/gift-staging-processing.service.ts)
- [`docs/solutions/gift-staging-processing.md`](/home/jamesbryant/workspace/dev-stack/docs/solutions/gift-staging-processing.md)

## Phased Spike Plan

These passes are default guidance, not a fixed contract.

We may pause, reorder, narrow, or expand the spike based on evidence. Two examples:

- if we uncover an urgent product/platform issue, it can take priority over the next planned pass,
- if the migration path proves much smoother than expected, we may move more ambitiously than the initial staged plan suggested.

The point of the phased structure is to preserve clarity and caution, especially as context compresses over time. It is not meant to force us to ignore reality.

### Pass 1: Backend Capability And Operating Model

Objective:

- Determine whether the single-record staging -> process -> gift creation path can be expressed credibly as a Twenty App workflow.

Focus:

- app-managed metadata for the minimum staging-related object/field slice,
- one or more real logic functions derived from current fundraising code,
- app-auth calling the APIs actually needed for the flow,
- status/error writeback,
- install/update/uninstall behavior for the selected metadata slice,
- cloud-model implications for auth, API shape, and edge responsibilities.

Key questions:

- What current service code ports cleanly?
- What needs thin adapters only?
- What fails because of app-auth, route shape, runtime constraints, or missing app APIs?
- If the workflow lives in-app, what remains of the current fundraising API boundary?

### Pass 2: UI Surface Viability

Objective:

- Determine whether the current app UI primitives are enough to expose a credible version of the staging/process workflow.

Focus:

- one meaningful review/process surface,
- current front-component/page-layout/navigation primitives,
- operator ergonomics and workflow clarity,
- what feels viable versus what immediately fights the platform.

Important note:

- UI is important enough to include in this spike, but not before we have evidence that the backend path is viable enough to justify it.
- Early spike evidence suggests the native object/view/navigation model is real but opinionated; richer workflow UI likely depends on front components, and blank-slate frontend flexibility remains unproven.

### Pass 3: Broader Workflow And Edge Implications

Objective:

- Explore the next layer only if passes 1-2 are promising enough.

Possible areas:

- batch workflows,
- queue experience,
- webhook ingress,
- cloud-compatible external service boundaries,
- longer-term module packaging implications for future modules.

## Explicit Unknowns To Track

### Canonical Logic Ownership

- What should become the canonical home of domain logic if apps become a serious packaging target?
- Are we heading toward an app-native canonical runtime, or toward a shared domain core with multiple runtime adapters?
- How much of the current self-hosted runtime shape is enduring architecture versus a consequence of how we started?
- Which parts of the codebase should remain runtime-specific even if the domain logic converges?

### Cloud And Deployment Model

- What assumptions in our current tests only hold because we self-host?
- What would "module works in Twenty Cloud" actually mean operationally?
- Which parts of the current module become vendor-managed edge responsibilities rather than app responsibilities?

### Auth And Security

- Does app auth replace our current fundraising auth layer for the chosen slice?
- Where do we still need explicit auth/signature handling?
- What changes about secrets, role scoping, and operational hardening in a cloud-compatible posture?

### API Boundary

- If core flow logic lives inside Twenty Apps, does a standalone fundraising API still make sense?
- If yes, for which functions?
- If no, what replaces the workflows currently mediated through our service endpoints?

### Runtime And Platform Limits

- Are route-trigger and logic-function capabilities sufficient for the selected flow?
- Are there API access or permission gaps under app auth?
- Which limitations are hard blockers versus inconvenient implementation details?

## Success Criteria

This spike is successful if it gives us a clearer answer to all of the following:

- whether the selected fundraising slice is viable in-app,
- what remains external in a cloud-compatible architecture,
- whether our current service/API/auth boundaries still make sense,
- where canonical domain logic should live if we want to support both cloud and self-hosted deployment models without long-term duplication,
- what concrete gaps or requests we should take back to Twenty,
- whether a deeper migration planning phase is justified.

## Outcome Categories

### Viable

- The selected slice works with acceptable adapters and no major platform blocker.
- We still expect a hybrid end state for some time, but concrete migration planning becomes more credible.

### Viable But Awkward

- The slice basically works, but the ergonomics, API shape, or platform assumptions are rough enough that we would not want to migrate broadly yet.

### Blocked

- The spike reveals one or more material blockers for serious module viability in Twenty Cloud.
- That is still a good outcome if the evidence is clear and useful.

## Evidence To Capture As We Go

- Exact parts of the fundraising flow that port cleanly.
- Exact parts that require reshaping.
- Platform/runtime gaps.
- Docs drift or misleading command/behavior assumptions.
- Cloud-specific constraints that self-hosting masked.
- Feedback/recommendations to share with Twenty.

## Working Hypothesis

Our likely future state remains hybrid for some time.

We should be neutral, for now, between two serious architectural outcomes:

- **Shared domain core with multiple runtimes**
  - domain logic converges into runtime-agnostic modules,
  - app and self-hosted paths each provide their own orchestration/adapters,
  - this preserves flexibility while the app model is still early.

- **App-native canonical runtime**
  - app execution becomes the primary home of domain logic,
  - self-hosting becomes more of a packaging/deployment mode than a separate logic owner.

At this stage, both outcomes are plausible enough to deserve real evaluation. The spike should not assume either one prematurely.

The spike is meant to help answer:

- how much of the fundraising module can plausibly become an app,
- whether the cloud-compatible version of the module changes the meaning of "our API" and "our auth",
- whether the path for this module is also a likely template for future modules we build,
- how future modules should be designed if Twenty Cloud Apps become the preferred packaging target.

## Related References

- [`docs/DECISIONS.md#L538`](/home/jamesbryant/workspace/dev-stack/docs/DECISIONS.md#L538)
- [`docs/TWENTY_EXTENSIBILITY_WATCH.md`](/home/jamesbryant/workspace/dev-stack/docs/TWENTY_EXTENSIBILITY_WATCH.md)
- [`docs/solutions/gift-staging-processing.md`](/home/jamesbryant/workspace/dev-stack/docs/solutions/gift-staging-processing.md)
- [`docs/features/donation-staging.md`](/home/jamesbryant/workspace/dev-stack/docs/features/donation-staging.md)
