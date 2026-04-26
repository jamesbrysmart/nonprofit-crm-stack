# Crossroads Pilot Overview

_Status: initial orientation note_  
_Updated: 2026-04-15_

## Why this branch exists

This branch exists to start a practical exploration of a possible pilot for Crossroads Care Kent using Twenty apps as the target platform.

The immediate goal is not to lock a Crossroads-specific pilot plan. It is to create a place to gather the most relevant existing repo context before we define client-specific scope, delivery sequence, or success criteria too confidently.

This branch should help us answer a narrower question:

- can a real client pilot give us a credible practical test of the fundraising product shape we want, while also testing the current Twenty apps framework under real workflow pressure?

At this early stage, the main emphasis should be on the Twenty-apps side of that question:

- can Twenty apps support the level of fundraising workflow quality described in the current product-review work,
- where are the likely framework limits or risks,
- and which parts of the desired fundraising product shape are the right first pressure tests?

Crossroads matters as the first practical test case, but not yet as the main source of product definition.

## What we currently know at a high level

We should keep the current starting assumptions modest.

- The repo's current migration posture is app-first in direction, but not app-only by assumption.
- The current fundraising migration conversation is no longer purely abstract; the first pilot is expected to pressure real workflows such as donation intake, Gift Aid, recurring donations, and finance-system handoff.
- The existing product and migration docs already assume this pilot should test more than raw CRUD or a thin "can this technically run" slice.
- At the same time, the repo does not yet contain a Crossroads-specific pilot brief, confirmed workflow scope, or validated implementation plan.

So, at this stage, we know more about the existing fundraising product direction and migration concerns than we know about Crossroads' actual operational needs.

## Relevant repo context already in place

The docs below are the main existing context for this branch.

### Product shape and fundraising workflow review

- [docs/apps-migration/PRODUCT_REVIEW.md](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/PRODUCT_REVIEW.md)
  - current review of which fundraising workflows should be preserved, simplified, redesigned, or left open before migration.
- [docs/PROJECT_CONTEXT.md](/home/jamesbryant/workspace/dev-stack/docs/PROJECT_CONTEXT.md)
  - current product thesis, module scope, roadmap, and Phase 1 fundraising priorities.
- [docs/features/gift-aid.md](/home/jamesbryant/workspace/dev-stack/docs/features/gift-aid.md)
  - current working Gift Aid product shape, including operational stance and likely UI surfaces.
- [docs/features/recurring-donations.md](/home/jamesbryant/workspace/dev-stack/docs/features/recurring-donations.md)
  - current recurring-donations shape, especially agreement/installment model and webhook-driven flow assumptions.

### Apps migration framing

- [docs/apps-migration/OVERVIEW.md](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/OVERVIEW.md)
  - why the migration exists and the current first-pilot context.
- [docs/apps-migration/MIGRATION_SEQUENCE.md](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/MIGRATION_SEQUENCE.md)
  - current sequence outline; useful as context, but still high-level.
- [docs/apps-migration/UI_MIGRATION_MAP.md](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/UI_MIGRATION_MAP.md)
  - currently only an outline; worth noting as a gap rather than treating it as settled guidance.

### Twenty apps capability and constraint context

- [docs/ui/TWENTY_APPS.md](/home/jamesbryant/workspace/dev-stack/docs/ui/TWENTY_APPS.md)
  - current UI portability guidance and explicit open questions around dense operational workflows.
- [docs/TWENTY_EXTENSIBILITY_WATCH.md](/home/jamesbryant/workspace/dev-stack/docs/TWENTY_EXTENSIBILITY_WATCH.md)
  - current evidence log on Twenty's evolving app/runtime surface.
- [docs/DECISIONS.md](/home/jamesbryant/workspace/dev-stack/docs/DECISIONS.md)
  - especially:
  - `D-0004` gift staging and intake posture,
  - `D-0015` interim defaults for households, allocations/funds, and portal strategy,
  - `D-0017` extensibility alignment strategy.

### Operational and integration context

- [docs/INTEGRATIONS.md](/home/jamesbryant/workspace/dev-stack/docs/INTEGRATIONS.md)
  - current connector/integration posture, including the still-lightweight pilot assumptions.
- [docs/AUTOMATIONS.md](/home/jamesbryant/workspace/dev-stack/docs/AUTOMATIONS.md)
  - current tooling posture across Twenty workflows, n8n, serverless functions, and fundraising-service jobs.
- [docs/DONATION_CONNECTOR_SCAFFOLDING.md](/home/jamesbryant/workspace/dev-stack/docs/DONATION_CONNECTOR_SCAFFOLDING.md)
  - useful for current connector assumptions, but still a design note rather than a final pilot integration plan.
- [docs/POC-backlog.md](/home/jamesbryant/workspace/dev-stack/docs/POC-backlog.md)
  - current operational backlog context, including CSV intake via Twenty import, Gift Aid export work, and connector scaffolding.

## Current working read from those docs

This is the most restrained synthesis that seems justified from the repo today.

- The early planning focus should be Twenty-apps fit against the fundraising product shape already described in the repo, not premature client-specific workflow design.
- The clearest early pressure-test workflow is gift staging / gift processing.
- This is not only a doc-level conclusion. The current codebase already treats staging as a substantial operational workflow with queue review, drawer-based record work, donor resolution, batch scope, donor-match runs, and record/batch processing boundaries.
- Donation intake and staged review are therefore likely central to the first serious pilot workflow.
- Gift Aid remains one of the clearest UK-specific product-shape tests.
- Recurring donations and finance handoff are already treated as likely early pilot pressure points.
- The biggest current uncertainty is not whether Twenty can store the data, but whether Twenty apps can support the quality of operational workflow we want, especially queue-heavy and review-heavy fundraising work.
- The repo already allows for a hybrid posture if the platform cannot yet support a clean implementation entirely inside Twenty apps.
- The repo does not yet justify a confident statement that Crossroads' pilot should start with any specific feature set, channel mix, or delivery sequence.

### Early staging / processing fit snapshot

| Sub-workflow | Likely fit | Short reason |
| --- | --- | --- |
| Queue review and filtering | In-app | Current app primitives appear sufficient for list/filter/review surfaces. |
| Drawer / side-panel record review | In-app | Likely the best early UI pressure test, but still the most important interaction unknown. |
| Single-record processing orchestration | Hybrid | The current processing boundary coordinates several services and status transitions. |
| Batch-level runs and processing | Hybrid | Feels closer to operational job control than a simple app-side action. |
| Provider/webhook ingress into staging | Stop-risk | Current route-trigger shape still looks risky for raw-body signature-verification cases. |

Current working conclusion:

- queue/review UX looks like the best early in-app pressure test;
- orchestration-heavy processing likely needs a thin hybrid boundary at first;
- provider ingress remains the clearest platform-risk area;
- drawer / side-panel review UX is the most important UI unknown to test in practice.

### Workflow-shape spike: queue + side-panel review

This should be treated as a workflow-shape spike, not a partial migration commitment.

Tiny build checklist:

- Create a minimal Twenty app surface for a staging-review spike.
- Use a seeded spike object and view as the queue rather than attach directly to the live `giftStaging` metadata yet.
- Open records from the queue in Twenty's native side-panel record flow.
- Add one lightweight review widget to the record page layout.
- Support one small real review edit: correct `giftDate`.
- Support one lightweight review action: `Mark ready`.
- Keep donor summary intentionally light.
- Evaluate post-action orientation, including row-to-row continuation after save / mark ready.

Seeded states should reflect realistic review meaning:

- in review
- ready
- blocked by donor issue
- failed processing

Explicit non-goal:

- this spike is not trying to prove processing, donor matching, batch execution, or provider ingress.

## Questions still to answer before a real pilot definition exists

### Product-bar questions

- What does "good enough" mean for this pilot beyond basic usability?
- Which workflows need to meet the existing fundraising product bar early, and which can remain intentionally partial for the first phase?
- Which current product-review conclusions are strong enough to treat as pilot-shaping decisions, and which still need validation?

### Platform-fit questions

- Can Twenty apps support the current gift staging / gift processing workflow shape cleanly enough to preserve the product bar?
- Can Twenty apps support the queue/review/detail/action patterns needed for fundraising operations without degrading the product shape?
- Which parts of the likely pilot flow fit naturally in Twenty apps, and which may still need an external adapter or service boundary?
- Are current Twenty app/runtime constraints likely to block any critical pilot workflow outright?

### Delivery questions

- What is the right early analysis sequence for this branch: product-review-defined workflow first, then client-fit, rather than the other way round?
- What is the right first build/test slice for this client specifically?
- What follow-on capabilities would need to land before we could call the experiment a real success rather than an exploratory proof?
- What would count as a temporary workaround versus a sign that the experiment should pause or be deferred?

### Client-specific questions

- What are Crossroads Care Kent's actual fundraising workflows today?
- Which intake channels matter first: manual entry, CSV/import, online payments, recurring, or some combination?
- How important are Gift Aid, recurring donations, and finance export on day one versus later in the pilot?
- What operational pain points are they trying to solve first?
- Which users or roles need to use the system directly?

## Immediate next step

Before writing a proper pilot brief, we should first use the repo's existing product-review and apps-migration material, together with the current staging/processing implementation, to identify which fundraising workflows are the right Twenty-apps pressure tests. Right now, gift staging / gift processing looks like the strongest early candidate. After that, we should capture the Crossroads-specific operating context and test it against those assumptions.

Until that client context is written down, this doc should remain an orientation note rather than expand into a confident plan.
