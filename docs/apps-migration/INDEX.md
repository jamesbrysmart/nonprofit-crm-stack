# Fundraising App Docs Index

Use this folder for the current fundraising app, its remaining transition work away from the legacy hybrid service model, and the supporting notes that still help us reason about architecture and implementation.

This folder is no longer just a place for “pre-migration” planning.

It now contains a mix of:

- current app guidance
- hardening and review notes
- transition and retirement context
- historical migration material that is still useful as supporting background

Start here when working on fundraising app product or implementation questions.

## Current Reading Order

If you want the best current mental model, read in this order:

- [OVERVIEW.md](docs/apps-migration/OVERVIEW.md)
  - current app position, transition framing, and remaining boundary questions
- [APP_DEPLOYMENT_RUNBOOK.md](docs/apps-migration/APP_DEPLOYMENT_RUNBOOK.md)
  - current lightweight install/upgrade process for the shared fundraising app in client workspaces
- [PILOT_APP_IMPLEMENTATION_PLAN.md](docs/apps-migration/PILOT_APP_IMPLEMENTATION_PLAN.md)
  - phased production-quality implementation plan for the app that now exists as the main fundraising surface
- [MIGRATION_WORKING_PATTERNS.md](docs/apps-migration/MIGRATION_WORKING_PATTERNS.md)
  - current implementation patterns and cross-cutting “do not assume X” guidance
- [TWENTY_APP_DEV_WORKFLOW.md](docs/apps-migration/TWENTY_APP_DEV_WORKFLOW.md)
  - repo-local workflow guidance for current Twenty app work

## Where To Start

If you need:

- current app framing and transition status:
  - [OVERVIEW.md](docs/apps-migration/OVERVIEW.md)
- current install/upgrade/deployment runbook for the shared fundraising app:
  - [APP_DEPLOYMENT_RUNBOOK.md](docs/apps-migration/APP_DEPLOYMENT_RUNBOOK.md)
- short operator-facing deployment checklist template:
  - [APP_DEPLOYMENT_CHECKLIST_TEMPLATE.md](docs/apps-migration/APP_DEPLOYMENT_CHECKLIST_TEMPLATE.md)
- current umbrella note for how client workspace layers fit together operationally:
  - [CLIENT_WORKSPACE_OPERATIONS_MODEL.md](docs/apps-migration/CLIENT_WORKSPACE_OPERATIONS_MODEL.md)
- detailed product decisions and what should survive from earlier implementations:
  - [PRODUCT_REVIEW.md](docs/apps-migration/PRODUCT_REVIEW.md)
- current implementation plan and slice ordering:
  - [PILOT_APP_IMPLEMENTATION_PLAN.md](docs/apps-migration/PILOT_APP_IMPLEMENTATION_PLAN.md)
- current Twenty-app runtime/layout learnings:
  - [TWENTY_NATIVE_REFERENCE.md](docs/apps-migration/TWENTY_NATIVE_REFERENCE.md)
- current implementation patterns discovered during app work:
  - [MIGRATION_WORKING_PATTERNS.md](docs/apps-migration/MIGRATION_WORKING_PATTERNS.md)
- review framing for an evolving Twenty Apps platform:
  - [REVIEW_POSTURE.md](docs/apps-migration/REVIEW_POSTURE.md)
- current technical hardening priorities:
  - [APP_HARDENING_BACKLOG.md](docs/apps-migration/APP_HARDENING_BACKLOG.md)
- app-runtime and stored-vs-derived architecture questions:
  - [APP_RUNTIME_ARCHITECTURE.md](docs/apps-migration/APP_RUNTIME_ARCHITECTURE.md)
- shared API/workflow/logic-function pressure constraints:
  - [API_PRESSURE.md](docs/apps-migration/API_PRESSURE.md)
- source-neutral online donation intake modeling:
  - [ONLINE_DONATION_INTAKE_CONTRACT.md](docs/apps-migration/ONLINE_DONATION_INTAKE_CONTRACT.md)
- current preferred staging/intake field model and rationale:
  - [ONLINE_DONATION_INTAKE_FIELD_MODEL.md](docs/apps-migration/ONLINE_DONATION_INTAKE_FIELD_MODEL.md)
- current appeal child-attribution model and deferred concepts:
  - [APPEAL_SOURCE_MODEL.md](docs/apps-migration/APPEAL_SOURCE_MODEL.md)
- current lightweight soft-credit model and deferred concepts:
  - [SOFT_CREDIT_MODEL.md](docs/apps-migration/SOFT_CREDIT_MODEL.md)
- current likely use of native Twenty `Opportunity` for funding / bid / award pipeline work:
  - [OPPORTUNITY_FUNDING_PIPELINE_MODEL.md](docs/apps-migration/OPPORTUNITY_FUNDING_PIPELINE_MODEL.md)
- agreed lean runtime boundary and lifecycle for embeddable donation forms:
  - [DONATION_FORMS_EMBEDDED_RUNTIME.md](docs/apps-migration/DONATION_FORMS_EMBEDDED_RUNTIME.md)
- current UI blocks and reuse candidates:
  - [UI_COMPONENTS_CATALOG.md](docs/apps-migration/UI_COMPONENTS_CATALOG.md)

## How To Read This Folder

Use these categories when deciding how much weight to give a doc.

### Current App Guidance

- [OVERVIEW.md](docs/apps-migration/OVERVIEW.md)
- [APP_DEPLOYMENT_RUNBOOK.md](docs/apps-migration/APP_DEPLOYMENT_RUNBOOK.md)
- [APP_DEPLOYMENT_CHECKLIST_TEMPLATE.md](docs/apps-migration/APP_DEPLOYMENT_CHECKLIST_TEMPLATE.md)
- [CLIENT_WORKSPACE_OPERATIONS_MODEL.md](docs/apps-migration/CLIENT_WORKSPACE_OPERATIONS_MODEL.md)
- [PILOT_APP_IMPLEMENTATION_PLAN.md](docs/apps-migration/PILOT_APP_IMPLEMENTATION_PLAN.md)
- [MIGRATION_WORKING_PATTERNS.md](docs/apps-migration/MIGRATION_WORKING_PATTERNS.md)
- [TWENTY_APP_DEV_WORKFLOW.md](docs/apps-migration/TWENTY_APP_DEV_WORKFLOW.md)
- [REVIEW_POSTURE.md](docs/apps-migration/REVIEW_POSTURE.md)
- [APP_HARDENING_REVIEW_RUBRIC.md](docs/apps-migration/APP_HARDENING_REVIEW_RUBRIC.md)
- [APP_HARDENING_BACKLOG.md](docs/apps-migration/APP_HARDENING_BACKLOG.md)

### Current Feature / Architecture Notes

- [ONLINE_DONATION_INTAKE_CONTRACT.md](docs/apps-migration/ONLINE_DONATION_INTAKE_CONTRACT.md)
- [ONLINE_DONATION_INTAKE_FIELD_MODEL.md](docs/apps-migration/ONLINE_DONATION_INTAKE_FIELD_MODEL.md)
- [APPEAL_SOURCE_MODEL.md](docs/apps-migration/APPEAL_SOURCE_MODEL.md)
- [SOFT_CREDIT_MODEL.md](docs/apps-migration/SOFT_CREDIT_MODEL.md)
- [OPPORTUNITY_FUNDING_PIPELINE_MODEL.md](docs/apps-migration/OPPORTUNITY_FUNDING_PIPELINE_MODEL.md)
- [DONATION_FORMS_EMBEDDED_RUNTIME.md](docs/apps-migration/DONATION_FORMS_EMBEDDED_RUNTIME.md)
- [APP_RUNTIME_ARCHITECTURE.md](docs/apps-migration/APP_RUNTIME_ARCHITECTURE.md)
- [API_PRESSURE.md](docs/apps-migration/API_PRESSURE.md)
- [TWENTY_NATIVE_REFERENCE.md](docs/apps-migration/TWENTY_NATIVE_REFERENCE.md)

### Supporting Historical Context

These remain useful, but should not make new sessions think the app is still mostly aspirational.

- [PRODUCT_REVIEW.md](docs/apps-migration/PRODUCT_REVIEW.md)
- [CODE_REVIEW.md](docs/apps-migration/CODE_REVIEW.md)
- [UI_MIGRATION_MAP.md](docs/apps-migration/UI_MIGRATION_MAP.md)
- [MIGRATION_SEQUENCE.md](docs/apps-migration/MIGRATION_SEQUENCE.md)
- [STRIPE_IMPLEMENTATION_STAGES.md](docs/apps-migration/STRIPE_IMPLEMENTATION_STAGES.md)
- [STRIPE_WORKLOG.md](docs/apps-migration/STRIPE_WORKLOG.md)

## Maintenance Note

When updating this folder:

- keep the tense honest
- distinguish clearly between current app reality and historical migration background
- prefer saying “current app,” “hardening,” or “remaining transition work” where that is the real state
- avoid phrasing that makes the app sound like a purely future plan when substantial implementation already exists
