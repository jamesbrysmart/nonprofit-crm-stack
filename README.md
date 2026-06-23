# Twenty Nonprofit Suite

This repository is the coordination layer for the nonprofit stack and its fundraising app work.

Current default posture:

- product and workflow work is centered on `apps/fundraising/nonprofit-fundraising`
- `services/twenty-core` remains the main platform dependency
- `services/fundraising-service` is legacy code that may still exist in the repo, but it is no longer the default local development path and should not be treated as the primary fundraising runtime

## Start Here

Before acting, read:

- [docs/INDEX.md](/home/jamesbryant/workspace/dev-stack/docs/INDEX.md)
- [docs/apps-migration/INDEX.md](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/INDEX.md)
- [docs/apps-migration/TWENTY_APP_DEV_WORKFLOW.md](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/TWENTY_APP_DEV_WORKFLOW.md)

Those docs are the current source map for how this repo is used.

## Repository Shape

- `apps/fundraising/nonprofit-fundraising`
  Current fundraising app implementation and tests.
- `services/twenty-core`
  Forked Twenty core repo.
- `services/fundraising-service`
  Legacy hybrid service/runtime kept only as historical or transitional code unless a task explicitly says otherwise.

## Local Development

Do not assume the old gateway-based local workflow is current.

For current local work:

- use the Twenty app workflow and app-local tests for `apps/fundraising/nonprofit-fundraising`
- use [docs/apps-migration/TWENTY_APP_DEV_WORKFLOW.md](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/TWENTY_APP_DEV_WORKFLOW.md) as the repo-local guidance
- use Twenty's official app docs as canonical for scaffolding, sync, and app-dev server commands

The old local Docker flow involving `fundraising-service`, nginx gateway routing, and host URLs such as `http://localhost:3000` or `http://localhost:4000` is legacy context only. Do not treat it as the default setup unless a task is explicitly about that legacy runtime.

## Legacy Note

Several older docs in this repo still describe:

- `fundraising-service` as the main fundraising runtime
- gateway-driven local access via `localhost:4000`
- direct Twenty server access via `localhost:3000`

That material is being retired because it is now actively misleading for normal sessions. If you encounter guidance that assumes that workflow, prefer the app-first docs above and treat the older note as historical unless it is clearly marked current.
