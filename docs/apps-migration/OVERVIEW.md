# Fundraising To Twenty Apps Migration Overview

Updated: 2026-04-06
Status: Working guide (`stage-2`)
Purpose: Define the overall purpose, scope, and success criteria for migrating fundraising-service functionality into Twenty apps.

This doc explains why the migration exists, what it is trying to achieve, and how migration decisions should be made. It is intentionally strategic rather than detailed.

## 1. Why This Migration Exists

Moving fundraising-service functionality into Twenty apps is desirable because the current split between the service-hosted fundraising UI and the Twenty product creates unnecessary product, UX, and maintenance costs.

This migration is intended to:

- bring fundraising workflows closer to the main product surface,
- reduce the amount of local-only UI and workflow structure we have to maintain separately,
- improve consistency between Twenty-native experiences and fundraising-specific workflows,
- create a clearer long-term home for functionality that should live as part of the platform experience.

We are reviewing the current product and code before migrating because this should not be a blind port. The goal is to migrate the right product behavior and the right implementation assets, not simply recreate everything that exists today.

This remains an app-first migration conversation.

That does not automatically mean every execution/runtime concern will ultimately live fully inside Twenty app code. The current Gift Aid / HMRC work suggests there may be cases where a specialized external adapter or service layer remains a useful hedge, especially while the Twenty apps/runtime model is still early. That question is still unresolved and should be tested against the released framework rather than assumed in either direction.

## 2. Goals

Product goals:

- preserve the fundraising workflows that provide real user value,
- simplify or redesign workflows that are solving the right problem in the wrong way,
- avoid carrying forward accidental complexity just because it already exists.

UX/UI goals:

- make fundraising workflows feel more native and consistent with Twenty,
- define the repeated UI patterns we actually want to keep,
- improve consistency where users are doing fundamentally similar jobs.

Technical goals:

- migrate reusable behavior and structure rather than accidental local implementation,
- identify which code is worth carrying forward, which should be refactored first, and which should be left behind,
- create a migration path that supports substantial product movement rather than isolated cleanup only.

## 3. Non-Goals

- This is not a blind lift-and-shift of the current fundraising-service UI and code.
- This is not a commitment to preserve every current workflow exactly as it exists today.
- This is not a full product rewrite before we know what should survive the migration.
- This is not a doc set for endlessly postponing migration behind abstract preparation work.

## 4. Scope Framing

This migration includes:

- workflow review,
- repeated UI pattern review,
- code portability review,
- mapping current surfaces to likely Twenty-app targets,
- sequencing the migration so larger product areas can actually move.

This migration does not yet imply:

- final implementation decisions for every repeated component,
- immediate parity for every current surface,
- that every current fundraising-service capability should survive unchanged.

Current planning context:

- After initial pilot scoping, the first pilot customer is expected to prioritize:
  - donation intake,
  - Gift Aid,
  - recurring donations,
  - and finance-system integration.
- This should be treated as migration context, not as a claim that other areas are unimportant or will not migrate.
- The practical implication is that upcoming migration decisions and sequencing should keep first-pilot fit in view, while still documenting broader product understanding where that helps later sessions.

## 5. Migration Principles

Use these principles to guide migration decisions:

- Review before porting.
- Migrate deliberately, not mechanically.
- Preserve user value, not implementation accidents.
- Remove duplication where the product model is clearly shared.
- Redesign where the current UI or code is solving the wrong problem.
- Use Twenty as a reference and target environment, not as a template to copy blindly.
- Validate risky assumptions before committing to large migration steps.
- Keep the end goal in view: this work should support the real migration of the product, not just local cleanup.
- Treat any service/edge/runtime pattern as a possible complement to app migration, not as an excuse to weaken or defer app-first product movement.

## 6. Related Docs

- [`PRODUCT_REVIEW.md`](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/PRODUCT_REVIEW.md)
  - decides what product behavior should be preserved, simplified, redesigned, or dropped.
- [`CODE_REVIEW.md`](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/CODE_REVIEW.md)
  - decides what code is worth carrying forward, what needs refactoring, and what should not be migrated as-is.
- [`UI_MIGRATION_MAP.md`](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/UI_MIGRATION_MAP.md)
  - connects current workflows and patterns to likely Twenty-app migration targets.
- [`MIGRATION_SEQUENCE.md`](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/MIGRATION_SEQUENCE.md)
  - defines migration order, dependencies, and validation gates.
- [`ARCHITECTURE.md`](/home/jamesbryant/workspace/dev-stack/docs/ui/ARCHITECTURE.md)
  - defines shared UI evaluation rules and current defaults.
- [`TWENTY_APPS.md`](/home/jamesbryant/workspace/dev-stack/docs/ui/TWENTY_APPS.md)
  - defines migration-aware UI guidance and current portability assumptions.
- [`service-layer-integration-runtime.md`](/home/jamesbryant/workspace/dev-stack/docs/spikes/service-layer-integration-runtime.md)
  - exploratory note on where a service/runtime layer may act as a hedge or complement while Twenty apps remain early.
