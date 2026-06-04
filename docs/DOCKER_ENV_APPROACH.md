# Docker / Env Approach

Status: legacy note under retirement.

This file used to describe the old integrated Docker workflow centered on nginx gateway routing, `fundraising-service`, and host URLs such as `http://localhost:3000` and `http://localhost:4000`.

That workflow is no longer the default local development path and should not be treated as canonical for new sessions.

Use instead:

- [README.md](/home/jamesbryant/workspace/dev-stack/README.md)
- [docs/INDEX.md](/home/jamesbryant/workspace/dev-stack/docs/INDEX.md)
- [docs/apps-migration/TWENTY_APP_DEV_WORKFLOW.md](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/TWENTY_APP_DEV_WORKFLOW.md)

Only return to the old Docker/gateway/service workflow if a task is explicitly about:

- `services/fundraising-service`
- legacy nginx gateway routing
- historical compose wiring
- hosted environments still depending on that runtime
