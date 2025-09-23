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

#### Challenges with `RELATION` / `LOOKUP` Fields

As of this writing, we have been unsuccessful in programmatically creating a `RELATION` or `LOOKUP` field via the REST Metadata API. Attempts have resulted in various errors, including:
- `Field 'relation' is not defined by type 'CreateFieldInput'`
- `Value 'LOOKUP' does not exist in 'FieldMetadataType' enum`
- `Relation creation payload is not defined`

This suggests that either the OpenAPI schema is incomplete for this field type, or there is a bug in the API. The GraphQL API may be the correct path, but further investigation is needed.

**Recommendation:** For now, create `RELATION` or `LOOKUP` fields manually in the Twenty UI.

---


## Current Status: Partially Blocked

Programmatic creation of custom objects via the API is currently unreliable. While the API is responsive to introspection, attempts to create objects via `curl` or other scripts fail with a specific error, even though the same mutation works in the official GraphQL Playground.

**Recommendation:** Avoid programmatic creation of custom objects for now. The official recommendation from the Twenty community is to wait for the **"import and export twenty configurations"** feature, expected by the end of Q3.

---

## Key Findings

### 1. Successful Playground Mutation

We successfully created a custom object named `test` in the GraphQL API Playground.

**Mutation:**
```graphql
mutation MyMutation {
  createOneObject(
    input: {object: {namePlural: "tests", nameSingular: "test", labelPlural: "Grants", labelSingular: "Grant"}}
  ) {
    id
  }
}
```

**Implication:** This proves that the API *is capable* of creating custom objects and that API key authentication (`Authorization: Bearer <API_KEY>`) is working correctly. The issue seems to be with how the API endpoint handles requests from non-playground clients.

### 2. Failed Programmatic Mutation (cURL)

When the exact same mutation is sent via `curl`, it consistently fails.

**Error Response:**
```json
{
  "errors": [
    {
      "message": "Unknown argument \"input\" on field \"Mutation.createOneObject\"",
      "locations": [
        {
          "line": 1,
          "column": 40
        }
      ]
    }
  ]
}
```

**Implication:** This discrepancy between the Playground and direct API calls is the core of the blocker. The `input` argument, which is clearly part of the schema and works in the playground, is not recognized in this context.

### 3. Successful Introspection

The API responds successfully to standard GraphQL introspection queries. This allows us to retrieve the schema, which can be useful for reference and for generating types or documentation.

---

## Workaround: Manual Object Creation and REST API Mirror

As per architectural decision D-0001, the `fundraising-service` is the canonical owner of gift data and requires its own database. The data is then mirrored to Twenty for a unified user experience.

The metadata API was intended to automate the creation of the custom `Gift` object in Twenty that serves as the target for this mirror. Due to the API blocker, the current workaround is as follows:

1.  **Manual Object Creation:** The `Gift` custom object must be created manually in the Twenty UI.
2.  **REST API Mirror:** The `fundraising-service` saves a gift to its own database and then makes a `POST` request to Twenty's standard REST API (`/rest/gifts`) to create a corresponding record in the manually created object.

This approach is documented in `docs/TWENTY_GIFTS_API.md`.

```