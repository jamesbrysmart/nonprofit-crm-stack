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
      -d '{"amount":{"currencyCode":"GBP","value":100}}' \
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

## Fundraising-Service Mirror (Local)

The fundraising-service now exposes matching endpoints so we can persist Gifts locally and proxy them through the gateway:

- `POST http://localhost:4000/api/fundraising/gifts`

  ```bash
  curl -s \
    -H "Content-Type: application/json" \
    -d '{"contactId":"gateway-contact","amountCurrencyCode":"GBP","amountValue":"50.00","date":"2025-09-17"}' \
    http://localhost:4000/api/fundraising/gifts
  ```

  Response:

  ```json
  {
    "data": {
      "gift": {
        "id": "ff6105b7-4fe2-49b2-82b3-cfb0c7d38709",
        "contactId": "gateway-contact",
        "campaignId": null,
        "amount": { "currencyCode": "GBP", "value": "50.00" },
        "date": "2025-09-17",
        "createdAt": "2025-09-18T14:54:55.342Z",
        "updatedAt": "2025-09-18T14:54:55.342Z"
      }
    }
  }
  ```

- `GET http://localhost:4000/api/fundraising/gifts`

  Returns the stored records in the fundraising Postgres database, ordered newest first.

These endpoints do not yet push to Twenty automatically—the follow-up step is to call `POST /rest/gifts` after the local insert succeeds.
