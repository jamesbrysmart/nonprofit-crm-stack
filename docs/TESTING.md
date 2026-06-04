# Testing & Quality Workflow

Purpose: define the minimum quality bar for changes in this stack and point sessions toward the current command owners.

## Current Default

Testing should follow the current app-first posture:

- for fundraising app work, use the scripts and tests in `apps/fundraising/nonprofit-fundraising`
- for Twenty core work, use the commands and workflow definitions in `services/twenty-core`
- treat `services/fundraising-service` checks as legacy-only unless a task explicitly touches that code

When in doubt, run the exact scripts defined in the package you changed rather than inventing new commands.

## Sources Of Truth

- Fundraising app scripts: `apps/fundraising/nonprofit-fundraising/package.json`
- Twenty core checks: `services/twenty-core/.github/workflows/*`
- App workflow context: `docs/apps-migration/TWENTY_APP_DEV_WORKFLOW.md`

## Definition Of Done

For any non-trivial change:

- add or update tests when reasonable
- run the smallest relevant lint, typecheck, or test command for the code you touched
- if checks fail and you are not fixing them now, call that out explicitly

## What To Run

| Change type | Minimum checks | Notes |
| --- | --- | --- |
| Docs-only (`docs/*`, `README.md`, `AGENTS.md`) | internal consistency scan | Remove or quarantine misleading legacy guidance, not just append exceptions. |
| Fundraising app (`apps/fundraising/nonprofit-fundraising/*`) | smallest relevant app test run | Prefer focused `yarn test` or `yarn test:unit` runs from that app. |
| Twenty core (`services/twenty-core/*`) | relevant Twenty-owned checks | Use existing Yarn/Nx targets and upstream workflow patterns. |
| Legacy fundraising service (`services/fundraising-service/*`) | package-local checks only if explicitly touching legacy code | Do not propose these by default for normal fundraising work. |
| Wiring / compose / nginx | verify current intent before testing | Do not assume the legacy Docker gateway workflow is still the desired validation path. |

## Legacy Note

Older testing guidance in this repo referenced:

- `services/fundraising-service` as the primary fundraising package
- smoke scripts against the old gateway workflow
- local host URLs such as `localhost:3000` and `localhost:4000`

Those are no longer default assumptions and should only be used when the task is explicitly about the legacy runtime.
