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

#### Creating `RELATION` / `LOOKUP` Fields (GraphQL path)

The REST Metadata API still rejects relation payloads, but the **GraphQL metadata endpoint** handles them. Use the `/metadata` endpoint with a bearer token:

```bash
curl -s -X POST http://localhost:3000/metadata \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TWENTY_API_KEY}" \
  -d '{"query":"mutation CreateRelationField($input: CreateOneFieldMetadataInput!) { createOneField(input: $input) { id name type relation { type targetObjectMetadata { id nameSingular } targetFieldMetadata { id name label } } } }","variables":{"input":{"field":{"type":"RELATION","name":"donorLinkAuto","label":"Donor","objectMetadataId":"03f097db-58f0-44eb-991f-d963e9fa955d","relationCreationPayload":{"type":"MANY_TO_ONE","targetObjectMetadataId":"8fa66908-0811-43dc-b792-efe8e3bd7c21","targetFieldLabel":"Gifts","targetFieldIcon":"IconGift"}}}}}'
```

Response excerpt (gift → person relation):

```json
{
  "data": {
    "createOneField": {
      "id": "0d8080e0-48b9-49ec-ad13-6ba6f645ddcb",
      "name": "donorLinkAuto",
      "type": "RELATION",
      "relation": {
        "type": "MANY_TO_ONE",
        "targetObjectMetadata": {
          "id": "8fa66908-0811-43dc-b792-efe8e3bd7c21",
          "nameSingular": "person"
        },
        "targetFieldMetadata": {
          "id": "b029d728-1f11-46f3-8e1c-20d0bc1df16f",
          "name": "giftsAuto",
          "label": "Gifts"
        }
      }
    }
  }
}
```

- `type` accepts `MANY_TO_ONE` or `ONE_TO_MANY` (see `RelationType` in `twenty-shared`).
- `targetFieldLabel` / `targetFieldIcon` describe the inverse field that Twenty auto-creates on the target object.
- Discover `objectMetadataId` values via `GET /rest/metadata/objects` or the metadata runbook.

Our `setup-schema.mjs` script now uses this pattern (via `ensureRelationField`) to create the core fundraising relations automatically (Gift, Gift Staging, Recurring Agreement, Solicitation Snapshot, Household, Person). Continue porting any remaining optional/roadmap relations by supplying the relevant object IDs and labels in the same mutation structure.

**Recommendation:** Prefer this GraphQL workflow for any field type that requires `relationCreationPayload` (relations, morph relations). Keep REST for simple primitives, but standardise on `Authorization: Bearer <API_KEY>` headers everywhere.

---


## Open Questions

- Confirm whether Twenty will expose relation field creation in the REST Metadata API; today we rely on GraphQL for relations and REST for primitives.

---

### `v1-initial-schema.mjs` Script Status

The `services/fundraising-service/scripts/setup-schema.mjs` script has been updated to use the REST Metadata API for creating custom objects (`campaign`, `appeal`, `gift`, `giftStaging`, `recurringAgreement`, `solicitationSnapshot`) and their simple fields. Note: some field names (e.g. plain `type`) are rejected by the API; we prefer explicit names such as `appealType`. This script is intended to be run on the spinup of a new workspace to provision these essential metadata elements.

**Current Status and Known Limitations:**

-   **Object and Simple Field Creation:** The script successfully creates custom objects and simple fields (e.g., `TEXT`, `DATE`, `CURRENCY`).
-   **Naming Conventions:** It has been observed that `nameSingular` and `namePlural` fields for objects must be in `camelCase` (e.g., `campaign`, `campaigns`) to avoid `400 Bad Request` errors from the Twenty API.
-   **Idempotency (Partial):** The script attempts to handle existing objects gracefully. If an object already exists, it will log a "Skipped: Object already exists." message. However, the current REST Metadata API does not provide a direct way to `GET` an object by its `nameSingular` via query parameters (e.g., `/rest/metadata/objects?filter[nameSingular]=campaign`). This means if an object exists, the script cannot programmatically retrieve its `id` to create associated fields in the same run.
-   **LOOKUP/RELATION Fields:** Relation fields are created via the GraphQL metadata endpoint (`/metadata`). The provisioning script uses this path for core fundraising relations; reserve manual UI creation for optional/roadmap relations or if the script fails.

**Recommendation:**

Run `v1-initial-schema.mjs` on new workspace spinup. After execution, validate relations in the Twenty UI and add any optional/roadmap lookup fields that are not yet scripted. Further attention is needed to enhance the script's idempotency for field creation and to address the `LOOKUP` field creation via API once Twenty's Metadata API supports it.

---

_Last updated: 2025-10-07_

## Managed extension notes (2025-09-29)

- Gift → Person relation field API name: `donor` (REST payloads use `donorId` when linking).
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
