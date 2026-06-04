# Docs Index

Goal: make `docs/` easy to navigate, reduce drift, and make the current app-first posture obvious.

Use this file as the first stop when a session needs repo guidance.

## Current Canonical Docs

- `PROJECT_CONTEXT.md`
  Product thesis, module scope, principles, and roadmap framing.
- `TESTING.md`
  Current testing posture and command-selection guidance.
- `UX_UI.md`
  Current UX and interface guidance for our code.
- `apps-migration/INDEX.md`
  Current fundraising app and migration-related source map.
- `apps-migration/OVERVIEW.md`
  Strategic framing for the move away from the old hybrid service model.
- `apps-migration/TWENTY_APP_DEV_WORKFLOW.md`
  Repo-local workflow guidance for current Twenty app work.

## Runbooks

- `runbooks/OPERATIONS_RUNBOOK.md`
  Legacy runtime status note. Do not treat it as the default local development path unless the task is explicitly about the old integrated Docker workflow.
- `runbooks/METADATA_RUNBOOK.md`
  Current metadata notes. Validate against app-owned metadata code before trusting historical service-script guidance.
- `runbooks/USER_RUNBOOK.md`
  Historical operator workflow note. Treat cautiously unless refreshed.

## Fundraising App Docs

- `apps-migration/INDEX.md`
  Entry point for current fundraising app docs.
- `apps-migration/MIGRATION_WORKING_PATTERNS.md`
  Working patterns discovered while implementing the app.
- `apps-migration/UI_COMPONENTS_CATALOG.md`
  Current UI blocks and reuse candidates.
- `apps-migration/TWENTY_NATIVE_REFERENCE.md`
  Code-first reference map for Twenty-native app surfaces.

## Feature And Solution Notes

- `features/`
  Feature-level product notes. Some files still contain legacy service assumptions and should be read critically.
- `solutions/`
  As-built or cross-feature solution notes. Validate runtime assumptions against the current app code.

## Legacy / Retirement Candidates

These docs are no longer good default entrypoints and should not be treated as current architecture without verification:

- `DOCKER_ENV_APPROACH.md`
- `FUNDRAISING_COMPANION.md`
- `FUNDRAISING_DATA_MODEL.md`

## Reading Rule

If a doc tells you to use:

- `services/fundraising-service` as the default runtime,
- `http://localhost:3000` or `http://localhost:4000` as the normal local path,
- nginx gateway routing as the standard product entrypoint,

treat that guidance as legacy unless another current doc explicitly says otherwise.
