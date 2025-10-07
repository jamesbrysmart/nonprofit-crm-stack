# Twenty API Reference

This document summarizes the status and findings related to Twenty's APIs and serves as a central reference to guide integration efforts.

## API Schemas (OpenAPI)

Twenty exposes two separate OpenAPI schemas: one for the **Core API** (data records) and one for the **Metadata API** (object definitions).

To access these schemas, you need a valid API key from your Twenty workspace. You can generate one from the Twenty UI under `Settings -> API Keys`.

**Important:** Always use these schemas as the source of truth when building API integrations. The `token` parameter in the URL must be replaced with your valid API key.

### Core API Schema

Use this schema for creating, reading, updating, and deleting data records (e.g., People, Companies, and any custom objects you have defined).

- **URL:** `http://localhost:3000/rest/open-api/core?token=<YOUR_API_KEY>`

### Metadata API Schema

Use this schema for creating or modifying the definitions of objects and fields themselves.

- **URL:** `http://localhost:3000/rest/open-api/metadata?token=<YOUR_API_KEY>`

**Notes:**

- Treat the token like a secret; prefer a short-lived Playground token.

---

## Metadata API Findings

This section documents the current status and findings related to the GraphQL and REST Metadata APIs.

### Creating a Custom Object (Success)

We have successfully created a custom object via the REST Metadata API. This proves that programmatic creation is possible.

**Endpoint:** `POST /rest/metadata/objects`

**Successful `curl` Command:**
```bash
curl -X POST -H "Authorization: Bearer <YOUR_API_KEY>" -H "Content-Type: application/json" -d '{
  "nameSingular": "gift",
  "namePlural": "gifts",
  "labelSingular": "Gift",
  "labelPlural": "Gifts",
  "icon": "IconGift"
}' http://localhost:3000/rest/metadata/objects
```

**Key Learnings:**
- The endpoint is `/rest/metadata/objects`, not `/rest/objects`.
### Creating Fields (Partial Success)

We have had partial success creating fields for custom objects.

**Endpoint:** `POST /rest/metadata/fields`

#### Successful `CURRENCY` Field Creation

```bash
curl -X POST -H "Authorization: Bearer <YOUR_API_KEY>" -H "Content-Type: application/json" -d '{
  "type": "CURRENCY",
  "name": "amount",
  "label": "Amount",
  "objectMetadataId": "<YOUR_OBJECT_METADATA_ID>"
}' http://localhost:3000/rest/metadata/fields
```

#### Successful `DATE` Field Creation

```bash
curl -X POST -H "Authorization: Bearer <YOUR_API_KEY>" -H "Content-Type: application/json" -d '{
  "type": "DATE",
  "name": "date",
  "label": "Date",
  "objectMetadataId": "<YOUR_OBJECT_METADATA_ID>"
}' http://localhost:3000/rest/metadata/fields
```

### Example: Gift Staging Object Provisioning

The fundraising POC uses a `gift_staging` object to hold intake records before they are committed to the canonical `gift` object. Use the same REST endpoints shown above to create the object and its simple fields:

```bash
curl -X POST -H "Authorization: Bearer <YOUR_API_KEY>" -H "Content-Type: application/json" -d '{
  "nameSingular": "giftStaging",
  "namePlural": "giftStagings",
  "labelSingular": "Gift Staging",
  "labelPlural": "Gift Stagings",
  "icon": "IconInbox",
  "description": "Temporary staging record for gifts prior to commit."
}' http://localhost:3000/rest/metadata/objects
```

Follow up by creating the supporting fields (all simple types that the API already supports): `Source`, `IntakeSource`, `SourceFingerprint`, `ExternalId`, `AmountMinor`, `Currency`, `PaymentMethod`, `DateReceived`, `ValidationStatus`, `DedupeStatus`, `PromotionStatus`, `AutoPromote`, `GiftAidEligible`, `GiftBatchId`, and `RawPayload`.

Lookup fields (e.g., linking `gift_staging` to `gift` or `gift_batch`) still require manual creation in the Twenty UI until the metadata API accepts `RELATION` payloads.

#### Challenges with `RELATION` / `LOOKUP` Fields

As of this writing, we have been unsuccessful in programmatically creating a `RELATION` or `LOOKUP` field via the REST Metadata API. Attempts have resulted in various errors, including:
- `Field 'relation' is not defined by type 'CreateFieldInput'`
- `Value 'LOOKUP' does not exist in 'FieldMetadataType' enum`
- `Relation creation payload is not defined`

This suggests that either the OpenAPI schema is incomplete for this field type, or there is a bug in the API. The GraphQL API may be the correct path, but further investigation is needed.

**Recommendation:** For now, create `RELATION` or `LOOKUP` fields manually in the Twenty UI.

---


## Open Questions

- Automating `RELATION` / `LOOKUP` fields via the API remains unsolved; continue to create those manually in the UI until Twenty documents the payload or fixes the schema.

---

### `v1-initial-schema.mjs` Script Status

The `services/fundraising-service/src/metadata-scripts/v1-initial-schema.mjs` script has been updated to use the REST Metadata API for creating custom objects (`campaign`, `gift`) and their simple fields (`StartDate`, `EndDate`, `Amount`, `Date`). This script is intended to be run on the spinup of a new workspace to provision these essential metadata elements.

**Current Status and Known Limitations:**

-   **Object and Simple Field Creation:** The script successfully creates custom objects and simple fields (e.g., `TEXT`, `DATE`, `CURRENCY`).
-   **Naming Conventions:** It has been observed that `nameSingular` and `namePlural` fields for objects must be in `camelCase` (e.g., `campaign`, `campaigns`) to avoid `400 Bad Request` errors from the Twenty API.
-   **Idempotency (Partial):** The script attempts to handle existing objects gracefully. If an object already exists, it will log a "Skipped: Object already exists." message. However, the current REST Metadata API does not provide a direct way to `GET` an object by its `nameSingular` via query parameters (e.g., `/rest/metadata/objects?filter[nameSingular]=campaign`). This means if an object exists, the script cannot programmatically retrieve its `id` to create associated fields in the same run.
-   **LOOKUP/RELATION Fields:** Programmatic creation of `LOOKUP` or `RELATION` fields via the API remains problematic. These fields (e.g., linking `gift` to `campaign`, or `gift` to `person`) still require manual creation in the Twenty UI after the script has run.

**Recommendation:**

Run `v1-initial-schema.mjs` on new workspace spinup. After execution, manually create any necessary `LOOKUP` or `RELATION` fields in the Twenty UI. Further attention is needed to enhance the script's idempotency for field creation and to address the `LOOKUP` field creation via API once Twenty's Metadata API supports it.

---

_Last updated: 2025-09-26_

## Managed extension notes (2025-09-29)

- Gift → Person lookup field API name: `donorId` (provision via metadata runbook; admin UI relies on it).
- Person create payload (Core `/people`) observed in schema:
  ```json
  {
    "name": {
      "firstName": "Ada",
      "lastName": "Lovelace"
    },
    "emails": {
      "primaryEmail": "ada@example.org"
    }
  }
  ```
- Fundraising admin form currently posts first/last name (and optional email), creating the Person before creating the linked Gift.
