# Data Model

This document outlines the current data ownership strategy for the managed-extension proof of concept.

## Twenty as the Source of Truth

Custom fundraising objects (e.g., **Gift**, **Campaign**) now live inside Twenty itself. Our `fundraising-service` interacts with these records exclusively through Twenty's public APIs rather than maintaining a separate Postgres schema. This keeps customisations aligned with the "managed package" approach and avoids double-writing data.

### Provisioning

- Objects and fields are provisioned via `services/fundraising-service/scripts/setup-schema.mjs` plus the manual lookup steps captured in `docs/METADATA_RUNBOOK.md`. The script now covers Campaigns, Appeals, Gifts, Gift Staging, Recurring Agreements, and Solicitation Snapshots.
- Once the Metadata API is reliable, we will automate this via scripts or configuration exports.

### Access Pattern

- `fundraising-service` creates and reads gifts via Twenty's REST API (`/rest/gifts`).
- Any automation that reacts to user edits in Twenty will consume webhooks or polling endpoints when available.

## Service-Owned Storage

At present no additional Postgres tables are owned by `fundraising-service`. Future auxiliary storage (e.g., caching, AI feature state) will be documented per service.
