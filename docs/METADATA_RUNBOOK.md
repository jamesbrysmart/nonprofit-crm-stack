# Metadata Provisioning Runbook — Fundraising POC

_Last updated: 2025-12-24_

This runbook captures the repeatable steps for provisioning the Campaign and Gift objects required by the fundraising-service proxy while Twenty's Metadata API is still evolving. Update this file whenever the script behaviour, manual UI flow, or Twenty release status changes.

## 1. Prerequisites

- A Twenty workspace API key with metadata permissions. For local development, use the key configured in `.env` (`TWENTY_API_KEY`). Prefer short-lived keys when testing against shared workspaces.
- The dev-stack services running (at minimum the Twenty core `server`) OR a tunnel to the Twenty REST API (`http://localhost:3000/rest`).
- Node.js available locally (the provisioning script runs via `node`).

## 2. Scripted provisioning (objects + simple fields)

Run the initial schema script from the repo root so it can locate `.env` automatically:

```bash
node services/fundraising-service/scripts/setup-schema.mjs
```

What the script does:
- Creates the custom fundraising objects if they do not already exist: `campaign`, `appeal`, `gift`, `giftStaging`, `recurringAgreement`, `solicitationSnapshot`.
- Adds simple fields (no lookups yet), for example:
  - `campaign`: `startDate`, `endDate`.
  - `appeal`: `appealType` (use this instead of `type`—Twenty reserves the generic name), `description`, `startDate`, `endDate`, `goalAmount`, `targetSolicitedCount`, `budgetAmount`, `raisedAmount`, `giftCount`, `donorCount`, `responseRate`, `costPerPound`, `lastGiftAt`.
  - `gift`: `amount`, `date`, `externalId`, `paymentMethod`, donor/contact scaffolding, provider metadata, **receipt fields** (`receiptStatus`, `receiptSentAt`, `receiptPolicyApplied`, `receiptChannel`, `receiptTemplateVersion`, `receiptError`, `receiptDedupeKey`).
  - `giftStaging`: intake metadata, validation statuses, donor snapshot, payload storage.
  - `recurringAgreement`: cadence, status, provider references, defaults, **annual receipt fields** (`annualReceiptStatus`, `annualReceiptSentAt`, `annualReceiptPeriod`, `annualReceiptPolicy`).
  - `solicitationSnapshot`: `countSolicited`, `source`, `capturedAt`, `notes`.
- Logs "Object already exists" when rerun against a workspace that already has the objects. (Field creation is skipped in that case because the API cannot fetch the existing object ID.)

Limitations to note:
- Relation fields are created via the GraphQL metadata API for the core fundraising links (Gift, Gift Staging, Household, Recurring Agreement, Solicitation Snapshot). See §3 for any remaining manual steps.
- If the script exits early, rerun it after clearing any partially created objects/fields manually.

## 3. Manual UI steps (lookup/relationship fields)

Most fundraising relations are now provisioned by the script via the GraphQL metadata endpoint. Only add manual lookup fields if:
- You are enabling roadmap objects (e.g., Fund/Designation, Tracking Code, Appeal Segment), or
- The script fails to create a relation and you need a temporary workaround.

If manual creation is required:
1. Sign in to the Twenty workspace as an admin.
2. Navigate to **Settings → Objects** and create the missing lookup fields.
3. Use the naming convention from `docs/FUNDRAISING_DATA_MODEL.md` (relation field name without the `Id` suffix).
4. Publish the changes and re-run the smoke test.

Record any additional manual fields here as they become part of the POC scope.

## 4. Verification checklist

- Re-run the smoke test to confirm Gift CRUD still works through the proxy:
  ```bash
  cd services/fundraising-service
  GATEWAY_BASE=http://localhost:4000 npm run smoke:gifts
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
| 2025-12-24 | `v1.14` | Not re-run | Not re-run | Upgrade completed; metadata provisioning not revalidated yet. |
| 2025-02-07 | `v1.4.0` | ✅ Objects + simple fields created; skipped when rerun | ✅ Campaign + Contact lookups created via UI | Lookup API still unsupported; script requires `.env` with API key |

Add a new row after every metadata-related test, including failures. Highlight regressions and link to follow-up issues where needed.

---

_Questions to track:_
- When Twenty documents `LOOKUP` payloads, prototype the API flow and update §2 accordingly.
- Improve idempotency once `/rest/metadata/objects` supports filtering by `nameSingular`.
