# Operations Runbook

Status: legacy runtime note.

This file no longer defines the default local development workflow for the repo.

## Current Rule

Do not assume the standard way to work locally is:

- bringing up the old integrated Docker stack
- routing through nginx gateway
- using `fundraising-service` as the main fundraising runtime
- relying on host URLs such as `http://localhost:3000` or `http://localhost:4000`

That workflow may still matter for historical investigation or specific hosted environments, but it is not the default path for normal app work.

## Use Instead

For current repo work, start with:

- [README.md](/home/jamesbryant/workspace/dev-stack/README.md)
- [docs/INDEX.md](/home/jamesbryant/workspace/dev-stack/docs/INDEX.md)
- [docs/apps-migration/TWENTY_APP_DEV_WORKFLOW.md](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/TWENTY_APP_DEV_WORKFLOW.md)

## When This File Still Matters

Return to legacy integrated-runtime guidance only when a task is explicitly about:

- `services/fundraising-service`
- nginx gateway behavior
- old compose wiring
- a hosted environment still depending on the hybrid service-first stack

If this file needs to grow again, it should do so as a clearly scoped legacy-runtime runbook, not as the default operating guide for the repo.
