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
- For Twenty app setup/build/dev flow, use Twenty's official docs as the canonical source of truth rather than copying local setup steps into this repo. Record only repo-specific constraints, observed deviations, and migration implications here.

For the first pilot-app implementation pass, the practical posture should be:

- architecture first,
- high-quality code from the start,
- careful metadata decisions alongside both,
- and feature polish only after the core workflow model and boundaries are sound.

One cross-cutting metadata question needs to stay visible during migration:

- when should a concept become stored metadata,
- when should it remain derived from other facts,
- and how do we keep that answer consistent across features rather than letting similar concepts drift into different patterns by accident?

Current leaning:

- prefer to minimize metadata fields unless they are clearly justified by real operational need,
- especially where a field would otherwise become a second stored truth for something that may be better derived from existing facts.

This is not yet a locked rule. It is a migration-wide design question we should keep revisiting as more slices are implemented and tested.

Related runtime question:

- how much operational meaning can remain derived at read time,
- when should app logic materialize or coordinate that meaning,
- and how should app-owned interpretations stay current when records can also be updated through native Twenty surfaces or other integration paths?

This is not just a metadata-shape issue.

It is also an app-runtime architecture question about:

- where responsibility sits between front components, logic functions, and native Twenty record editing,
- what guarantees we expect from pilot behavior versus broader production rollout,
- and how much API pressure or reconciliation work a leaner model actually creates in practice.

The current working note for that topic is:

- [`APP_RUNTIME_ARCHITECTURE.md`](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/APP_RUNTIME_ARCHITECTURE.md)

Closely related cross-cutting constraint:

- API pressure is now tracked in:
  - [`API_PRESSURE.md`](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/API_PRESSURE.md)

That note should be used when evaluating whether an app design is operationally safe under shared Twenty API, workflow, and logic-function budgets rather than only functionally correct in isolation.

### 5.1 Twenty App Workflow Source Of Truth

For app scaffolding, setup, build, and dev workflow, treat the official Twenty docs as canonical:

- `https://docs.twenty.com/developers/extend/apps/getting-started`
- `https://docs.twenty.com/developers/extend/apps/building`

Why this matters:

- the Twenty app SDK and scaffolding flow are still moving quickly;
- local hand-rolled scaffolds can create false negatives that look like platform/runtime limits;
- migration spikes should only be interpreted as platform evidence once they are running through Twenty's current documented app workflow.
- the Twenty CRM/runtime version and the Twenty app SDK version are separate version lines and should not be conflated when planning or diagnosing spikes.

Versioning note:

- The Docker/runtime version of Twenty CRM and the app-tooling version (`twenty-sdk`, `create-twenty-app`, `twenty` CLI) are different things.
- They may move on different version lines and should be checked independently.

When evaluating spikes, first identify which runtime/UI version is actually under test, then choose the corresponding app-tooling line for that release family. Do not assume the checked-out local Twenty source version is the same thing as the runtime version currently running in Docker.

This doc should not duplicate step-by-step app setup instructions unless we intentionally need to document a repo-specific deviation from Twenty's process.

## 6. Related Docs

- [`PRODUCT_REVIEW.md`](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/PRODUCT_REVIEW.md)
  - decides what product behavior should be preserved, simplified, redesigned, or dropped.
- [`CODE_REVIEW.md`](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/CODE_REVIEW.md)
  - decides what code is worth carrying forward, what needs refactoring, and what should not be migrated as-is.
- [`UI_MIGRATION_MAP.md`](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/UI_MIGRATION_MAP.md)
  - connects current workflows and patterns to likely Twenty-app migration targets.
- [`MIGRATION_SEQUENCE.md`](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/MIGRATION_SEQUENCE.md)
  - defines migration order, dependencies, and validation gates.
- [`PILOT_APP_IMPLEMENTATION_PLAN.md`](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/PILOT_APP_IMPLEMENTATION_PLAN.md)
  - defines the phased production-quality implementation plan for the first fundraising pilot app.
- [`MIGRATION_WORKING_PATTERNS.md`](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/MIGRATION_WORKING_PATTERNS.md)
  - captures provisional working patterns from implementation sessions and should be updated as we learn more or find better approaches.
- [`UI_COMPONENTS_CATALOG.md`](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/UI_COMPONENTS_CATALOG.md)
  - catalogs current UI components, blocks, and reuse candidates so similar functionality is easier to spot before we build it twice.
- [`TWENTY_APP_DEV_WORKFLOW.md`](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/TWENTY_APP_DEV_WORKFLOW.md)
  - captures the current repo-local workflow split between Twenty app development and the integrated `dev-stack` environment.
- [`APP_RUNTIME_ARCHITECTURE.md`](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/APP_RUNTIME_ARCHITECTURE.md)
  - exploratory runtime-boundary note for stored-vs-derived decisions, app-to-Twenty handover, and pilot-vs-production architecture questions.
- [`API_PRESSURE.md`](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/API_PRESSURE.md)
  - tracks migration-wide API/workflow/logic-function pressure constraints and the design posture they imply for future apps.
- [`ARCHITECTURE.md`](/home/jamesbryant/workspace/dev-stack/docs/ui/ARCHITECTURE.md)
  - defines shared UI evaluation rules and current defaults.
- [`TWENTY_APPS.md`](/home/jamesbryant/workspace/dev-stack/docs/ui/TWENTY_APPS.md)
  - defines migration-aware UI guidance and current portability assumptions.
- [`service-layer-integration-runtime.md`](/home/jamesbryant/workspace/dev-stack/docs/spikes/service-layer-integration-runtime.md)
  - exploratory note on where a service/runtime layer may act as a hedge or complement while Twenty apps remain early.
