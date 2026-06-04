# Fundraising Data Model

Status: historical reference under rewrite.

This file used to describe the data model through the lens of `services/fundraising-service` provisioning scripts and runtime behavior. That is no longer a safe default source of truth.

Current guidance:

- treat app-owned metadata and runtime code in `apps/fundraising/nonprofit-fundraising` as the primary implementation reference
- treat older service-owned schema/setup notes as historical prior art only
- verify field and object assumptions against current app code before using them in planning or implementation

Useful current references:

- [apps/fundraising/nonprofit-fundraising/src/objects](/home/jamesbryant/workspace/dev-stack/apps/fundraising/nonprofit-fundraising/src/objects)
- [apps/fundraising/nonprofit-fundraising/src/fields](/home/jamesbryant/workspace/dev-stack/apps/fundraising/nonprofit-fundraising/src/fields)
- [docs/apps-migration/ONLINE_DONATION_INTAKE_FIELD_MODEL.md](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/ONLINE_DONATION_INTAKE_FIELD_MODEL.md)
- [docs/apps-migration/MIGRATION_WORKING_PATTERNS.md](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/MIGRATION_WORKING_PATTERNS.md)

If this file is expanded again, it should be rewritten as:

- a short conceptual domain map,
- app-first,
- with explicit separation between current facts and historical service-era assumptions.
