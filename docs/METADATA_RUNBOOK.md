# Metadata Provisioning Runbook — Fundraising POC

_Last updated: 2025-02-07_

This runbook captures the repeatable steps for provisioning the Campaign and Gift objects required by the fundraising-service proxy while Twenty's Metadata API is still evolving. Update this file whenever the script behaviour, manual UI flow, or Twenty release status changes.

## 1. Prerequisites

- A Twenty workspace API key with metadata permissions. For local development, use the key configured in `.env` (`TWENTY_API_KEY`). Prefer short-lived keys when testing against shared workspaces.
- The dev-stack services running (at minimum the Twenty core `server`) OR a tunnel to the Twenty REST API (`http://localhost:3000/rest`).
- Node.js available locally (the provisioning script runs via `node`).

## 2. Scripted provisioning (objects + simple fields)

Run the initial schema script from the repo root so it can locate `.env` automatically:

```bash
node services/fundraising-service/src/metadata-scripts/v1-initial-schema.mjs
```

What the script does:
- Creates the custom `campaign` and `gift` objects if they do not already exist.
- Adds simple fields:
  - `campaign`: `StartDate` (`DATE`), `EndDate` (`DATE`).
  - `gift`: `Amount` (`CURRENCY`), `Date` (`DATE`).
- Logs "Object already exists" when rerun against a workspace that already has the objects. (Field creation is skipped in that case because the API cannot fetch the existing object ID.)

Limitations to note:
- Lookup/relation fields are **not** created (see §3).
- If the script exits early, rerun it after clearing any partially created objects/fields manually.

## 3. Manual UI steps (lookup/relationship fields)

Until Twenty exposes a stable payload for lookup metadata, add the relational fields in the UI after the script succeeds:

1. Sign in to the Twenty workspace as an admin.
2. Navigate to **Settings → Objects → Gifts → Fields**.
3. Click **New field** and create the following:
   - `Campaign` — `Lookup` to `Campaign`. Mark as required if desired.
   - `Contact` — `Lookup` to `Person`. Keep optional for now; adjust when the data model is finalised.
4. (Optional) Add descriptions to clarify how the fundraising proxy uses each field.
5. Publish the changes.

Record any additional manual fields here as they become part of the POC scope.

## 4. Verification checklist

- Re-run the smoke test to confirm Gift CRUD still works through the proxy:
  ```bash
  cd services/fundraising-service
  npm run smoke:gifts
  ```
- In the Twenty UI, confirm:
  - `Campaign` and `Gift` objects are visible with the expected fields.
  - The script-created fields show the labels defined above.
  - The manual lookup fields appear on the Gift layout and allow selecting existing records.
- If the smoke test fails, inspect `docker compose logs fundraising-service` for structured log entries (`twenty_proxy_*`) to identify metadata-related errors.

## 5. Release watch log

Track Metadata API behaviour whenever we upgrade the Twenty image or bump the `twenty-core` submodule.

| Date | Twenty tag / commit | Script outcome | Manual steps result | Notes |
| --- | --- | --- | --- | --- |
| 2025-02-07 | `v1.4.0` (current) | ✅ Objects + simple fields created; skipped when rerun | ✅ Campaign + Contact lookups created via UI | Lookup API still unsupported; script requires `.env` with API key |

Add a new row after every metadata-related test, including failures. Highlight regressions and link to follow-up issues where needed.

---

_Questions to track:_
- When Twenty documents `LOOKUP` payloads, prototype the API flow and update §2 accordingly.
- Improve idempotency once `/rest/metadata/objects` supports filtering by `nameSingular`.
