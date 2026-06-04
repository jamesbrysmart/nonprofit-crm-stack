# Metadata Provisioning Runbook

Status: transitional note.

This file previously described metadata provisioning through the legacy `fundraising-service` setup path and older local host URLs. That is no longer a safe default assumption.

## Current Rule

- prefer app-owned metadata definitions in `apps/fundraising/nonprofit-fundraising`
- verify metadata expectations against current app code before trusting older service-script guidance
- do not assume `localhost:3000`, `localhost:4000`, or a running `fundraising-service` are part of the normal metadata workflow

## Current References

- [apps/fundraising/nonprofit-fundraising/src/objects](/home/jamesbryant/workspace/dev-stack/apps/fundraising/nonprofit-fundraising/src/objects)
- [apps/fundraising/nonprofit-fundraising/src/fields](/home/jamesbryant/workspace/dev-stack/apps/fundraising/nonprofit-fundraising/src/fields)
- [docs/apps-migration/TWENTY_APP_DEV_WORKFLOW.md](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/TWENTY_APP_DEV_WORKFLOW.md)
- [docs/FUNDRAISING_DATA_MODEL.md](/home/jamesbryant/workspace/dev-stack/docs/FUNDRAISING_DATA_MODEL.md)

## Legacy Note

If a task is explicitly about the old service-era schema bootstrap or hybrid runtime, confirm that intent first and then consult the historical scripts in `services/fundraising-service`.
