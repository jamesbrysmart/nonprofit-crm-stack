# Twenty Gifts API Reference (POC Notes)

This page summarizes the relevant REST endpoints exposed by Twenty for the custom `Gift` object. The structure mirrors the official OpenAPI schema so we can build and test the fundraising-service integration while the Metadata API remains blocked.

## Base Paths

All routes are rooted at `https://api.twentycrm.com`, and in our local stack they are available via the gateway at `http://localhost:4000/api`.

## Endpoints

- `GET /gifts`
  - Tags: `gifts`
  - Purpose: Find many gifts.
  - Supports query params: `order_by`, `filter`, `limit`, `depth`, `starting_after`, `ending_before`.
  - Response: `{ data: { gifts: GiftForResponse[] }, pageInfo, totalCount }`.

- `POST /gifts`
  - Purpose: Create one gift.
  - Body schema: `Gift`.
  - Success response: `{ data: { createGift: GiftForResponse } }`.
  - Example (local stack):

    ```bash
    TWENTY_API_KEY=$(sed -n 's/^TWENTY_API_KEY=\(.*\)$/\1/p' .env | tr -d '"')
    curl -s \
      -H "Authorization: Bearer ${TWENTY_API_KEY}" \
      -H "Content-Type: application/json" \
      -d '{"amount":{"currencyCode":"GBP","amountMicros":100000000}}' \
      http://localhost:3000/rest/gifts
    ```

    Response shape (abridged):

    ```json
    {
      "data": {
        "createGift": {
          "id": "<uuid>",
          "name": "Untitled",
          "amount": {
            "amountMicros": 100000000,
            "currencyCode": "GBP"
          },
          "createdBy": {
            "source": "API",
            "name": "Fundraising"
          }
        }
      }
    }
    ```
  - Notes:
    - Twenty auto-populates optional fields (e.g., `name` defaults to "Untitled").
    - `contactId` and `campaignId` are not required for the minimal create payload.

- `POST /batch/gifts`
  - Purpose: Create many gifts in a single request.
  - Body schema: `Gift[]`.
  - Success response: `{ data: { createGifts: GiftForResponse[] } }`.

- `GET /gifts/{id}`
  - Purpose: Find one gift.
  - Path parameter: `id` (UUID).
  - Optional query: `depth`.
  - Success response: `{ data: { gift: GiftForResponse } }`.

- `PATCH /gifts/{id}`
  - Purpose: Update one gift.
  - Path parameter: `id`.
  - Body schema: `GiftForUpdate`.
  - Success response: `{ data: { updateGift: GiftForResponse } }`.

- `DELETE /gifts/{id}`
  - Purpose: Delete one gift.
  - Success response: `{ data: { deleteGift: { id } } }`.

- `POST /gifts/duplicates`
  - Purpose: Find duplicates for gifts.
  - Body: `{ data: Gift[], ids: UUID[] }`.
  - Success response includes `totalCount`, `pageInfo`, and `giftDuplicates`.

## Usage Notes

- The official schemas `Gift`, `GiftForResponse`, and `GiftForUpdate` should be pulled from the Twenty OpenAPI spec (`https://api.twentycrm.com/openapi.json`).
- Authentication: requires a valid API key passed as `Authorization: Bearer <token>`.
- This reference is a stopgap until metadata automation lets us provision the object programmatically.

## Fundraising-Service Proxy (Local)

The fundraising-service now acts as a thin proxy in front of Twenty:

- `POST http://localhost:4000/api/fundraising/gifts` forwards the request body directly to `http://localhost:3000/rest/gifts` using the configured `TWENTY_API_KEY` and returns the raw Twenty JSON response. No local persistence is performed.
- `GET http://localhost:4000/api/fundraising/gifts` issues the same request to Twenty’s `/rest/gifts` endpoint (including any query parameters) and returns the exact payload from Twenty.
- `GET http://localhost:4000/api/fundraising/gifts/{id}` proxies to Twenty’s `/rest/gifts/{id}` and surfaces the response unchanged; query parameters such as `depth` are forwarded as-is.
- `PATCH http://localhost:4000/api/fundraising/gifts/{id}` forwards updates to Twenty’s `/rest/gifts/{id}` and returns the raw update payload.
- `DELETE http://localhost:4000/api/fundraising/gifts/{id}` forwards deletes to Twenty and surfaces the response (usually the deleted id).

Quick check:

```bash
cd services/fundraising-service
GATEWAY_BASE=http://localhost:4000 npm run smoke:gifts
```

The script exercises create → list → get → update → delete through the proxy so any regression shows up before manual metadata work.

> Always re-run the smoke script after significant gateway/service changes so we catch regressions before touching metadata or UI flows.

### Validation guardrails & contact auto-create

- Incoming payloads must include `amount.currencyCode` (non-empty string) and `amount.amountMicros` (numeric). Known string fields such as `contactId`, `campaignId`, `giftDate`, `name`, `description`, `notes`, and `externalId` are trimmed; unsupported fields on updates pass through unchanged for forward compatibility.
- `POST` requests may include a `contact` object with `firstName` / `lastName` (and optional `email`). The service will create a Person via Twenty’s `/people` endpoint and inject the resulting `donorId` into the Gift payload before forwarding to `/gifts`.
- Responses from Twenty are sanity-checked so the expected `createGift` / `updateGift` / `deleteGift` / `gift` / `gifts` payloads exist. Missing data surfaces as a 400 error, making upstream issues obvious during development.
- Transient errors from Twenty (429/5xx or network hiccups) are retried up to three times with a short backoff; persistent failures bubble back so callers see the real status code and payload.

Example (manual curl matching the direct REST call):

```bash
TWENTY_API_KEY=$(sed -n 's/^TWENTY_API_KEY=\(.*\)$/\1/p' .env | tr -d '"')
curl -s \
  -H "Authorization: Bearer ${TWENTY_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"amount":{"currencyCode":"GBP","amountMicros":100000000}}' \
  http://localhost:4000/api/fundraising/gifts
```

The response is identical to calling `http://localhost:3000/rest/gifts` directly, ensuring the smoke test reflects reality in Twenty’s UI.
