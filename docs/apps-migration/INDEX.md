# Apps Migration Docs Index

Use this folder for fundraising-to-Twenty-app migration context, planning, and working notes.

This folder now contains both:

- strategic migration docs
- working reference notes that should evolve as implementation learning improves

Start here when working on migration-related product or implementation questions.

## Where To Start

If you need:

- overall purpose and migration framing:
  - [OVERVIEW.md](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/OVERVIEW.md)
- detailed product migration decisions:
  - [PRODUCT_REVIEW.md](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/PRODUCT_REVIEW.md)
- first pilot implementation planning:
  - [PILOT_APP_IMPLEMENTATION_PLAN.md](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/PILOT_APP_IMPLEMENTATION_PLAN.md)
- current Twenty-app runtime/layout learnings:
  - [TWENTY_NATIVE_REFERENCE.md](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/TWENTY_NATIVE_REFERENCE.md)
    - includes native layout/runtime notes, metadata field types, field-definition patterns, and current front-component sync/runtime findings
- source-neutral online donation intake modeling:
  - [ONLINE_DONATION_INTAKE_CONTRACT.md](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/ONLINE_DONATION_INTAKE_CONTRACT.md)
- current preferred staging/intake field model and rationale:
  - [ONLINE_DONATION_INTAKE_FIELD_MODEL.md](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/ONLINE_DONATION_INTAKE_FIELD_MODEL.md)
- open app-runtime and stored-vs-derived architecture questions:
  - [APP_RUNTIME_ARCHITECTURE.md](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/APP_RUNTIME_ARCHITECTURE.md)
- evolving implementation patterns discovered during sessions:
  - [MIGRATION_WORKING_PATTERNS.md](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/MIGRATION_WORKING_PATTERNS.md)
- current UI blocks and reuse candidates:
  - [UI_COMPONENTS_CATALOG.md](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/UI_COMPONENTS_CATALOG.md)

## Strategic Docs

- [OVERVIEW.md](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/OVERVIEW.md)
  - high-level migration purpose, goals, principles, and related docs
- [PRODUCT_REVIEW.md](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/PRODUCT_REVIEW.md)
  - detailed product behavior review and migration decisions
- [CODE_REVIEW.md](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/CODE_REVIEW.md)
  - code portability and migration-worthiness review
- [UI_MIGRATION_MAP.md](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/UI_MIGRATION_MAP.md)
  - mapping from existing fundraising-service UI/workflows to likely Twenty-app targets
- [MIGRATION_SEQUENCE.md](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/MIGRATION_SEQUENCE.md)
  - migration ordering and dependencies

## Pilot Implementation Docs

- [PILOT_APP_IMPLEMENTATION_PLAN.md](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/PILOT_APP_IMPLEMENTATION_PLAN.md)
  - phased implementation plan for the first production-quality pilot app
- [TWENTY_APP_DEV_WORKFLOW.md](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/TWENTY_APP_DEV_WORKFLOW.md)
  - repo-local workflow notes for working on Twenty apps in `dev-stack`
- [TWENTY_NATIVE_REFERENCE.md](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/TWENTY_NATIVE_REFERENCE.md)
  - references and observations about Twenty-native capabilities, constraints, metadata field types, field-definition patterns, and front-component runtime behavior
- [APP_RUNTIME_ARCHITECTURE.md](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/APP_RUNTIME_ARCHITECTURE.md)
  - exploratory runtime-boundary note for app-to-Twenty handover, update propagation, and stored-vs-derived decisions
- [ONLINE_DONATION_INTAKE_CONTRACT.md](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/ONLINE_DONATION_INTAKE_CONTRACT.md)
  - source-neutral internal contract for online donation adapters feeding staging and processing
- [ONLINE_DONATION_INTAKE_FIELD_MODEL.md](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/ONLINE_DONATION_INTAKE_FIELD_MODEL.md)
  - current recommended field-level interpretation of that intake contract for staging metadata

## Working Reference Notes

These are deliberately more lightweight and should be updated as we learn.

- [MIGRATION_WORKING_PATTERNS.md](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/MIGRATION_WORKING_PATTERNS.md)
  - provisional patterns for UI, modeling, configurability, and migration decision-making
- [UI_COMPONENTS_CATALOG.md](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/UI_COMPONENTS_CATALOG.md)
  - current widgets/blocks, where they appear, and reuse opportunities

## Historical / Feature-Specific Notes

- [STRIPE_IMPLEMENTATION_STAGES.md](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/STRIPE_IMPLEMENTATION_STAGES.md)
  - Stripe-specific implementation staging notes
- [STRIPE_WORKLOG.md](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/STRIPE_WORKLOG.md)
  - Stripe-specific implementation worklog

## Maintenance Note

If a migration session produces a pattern or reusable UI insight that is likely to matter again:

- add strategic decisions to the appropriate strategic doc
- add implementation guidance to the pilot plan if it affects delivery
- add provisional patterns to `MIGRATION_WORKING_PATTERNS.md`
- add concrete blocks/widgets to `UI_COMPONENTS_CATALOG.md`

Prefer updating existing notes over creating a new doc unless the new topic is clearly distinct.
