# Rollup engine

Gift rollup engine for Twenty workspaces. The project ships a serverless
function that aggregates Gift data onto parent Person records.

## Requirements
- twenty-cli `npm install -g twenty-cli`
- an API key with access to your workspace. Generate one at
  `https://twenty.com/settings/api-webhooks`.

## Metadata prerequisites
- Provision the `gift` object (see `services/fundraising-service/scripts` for
  the automation used in the nonprofit stack).
- Add these fields to the `person` object: `lifetimeGiftAmount`,
  `lifetimeGiftCount`, `lastGiftDate`, `firstGiftDate`, `yearToDateGiftAmount`,
  `yearToDateGiftCount`. Keep the API names camelCase.
- Add these fields to the `appeal` object: `raisedAmount`, `giftCount`.

## Runtime configuration
- `serverlessFunctions/calculaterollups/src/rollupConfig.ts` contains the
  declarative rollup definitions. The default bundle targets Gifts → Person via
  `donorId` and calculates lifetime, year-to-date, first, and last gift metrics.
  Override the rules by setting `ROLLUP_ENGINE_CONFIG` (or `ROLLUPS_CONFIG`) to
  a JSON array before syncing the app.
- `filters[].dynamicValue` currently supports `"startOfYear"` (UTC midnight on
  the first day of the current calendar year).
- Environment: set `TWENTY_API_KEY` (required) and `TWENTY_API_BASE_URL`.
  - **Local dev:** the default `application.config.ts` points `TWENTY_API_BASE_URL`
    to `http://localhost:3000/rest`, so you only need a dev API key.
  - **Cloud workspace:** override `TWENTY_API_BASE_URL` to
    `https://app.twenty.com/rest` in the Applications UI and supply a cloud API key.
  - Environment changes require redeploying/restarting the app before tests.

### Default Gift → Person rollups
| Parent field | Suggested type | Description |
| --- | --- | --- |
| `lifetimeGiftAmount` | Currency (`amountMicros`, `currencyCode`) | Sum of all positive Gifts (`amount.amountMicros`) for the Person. |
| `lifetimeGiftCount` | Number | Count of Gifts associated to the Person. |
| `lastGiftDate` | Date | Most recent `giftDate`. |
| `firstGiftDate` | Date | Earliest `giftDate`. |
| `yearToDateGiftAmount` | Currency (`amountMicros`, `currencyCode`) | Sum of Gifts on/after the current calendar year start. |
| `yearToDateGiftCount` | Number | Count of Gifts on/after the current calendar year start. |

### Default Gift → Appeal rollups
| Parent field | Suggested type | Description |
| --- | --- | --- |
| `raisedAmount` | Currency (`amountMicros`, `currencyCode`) | Sum of positive Gifts linked to the Appeal. |
| `giftCount` | Number | Count of Gifts linked to the Appeal. |

Assumptions:
- The Gifts API exposes `donorId`, `amount.amountMicros`, `amount.currencyCode`,
  `giftDate`, and optional `status`. We currently include any Gift with a
  positive `amount.amountMicros`; adjust `childFilters` if you need
  status-specific behaviour (e.g. settled-only).
- Amount totals are stored in micros (integers) to align with Twenty’s composite
  currency fields.

## Install to your Twenty workspace

```bash
twenty auth login
twenty app sync
```

## Local smoke test

```bash
yarn install
yarn smoke
```

The smoke script replaces `fetch` with an in-memory mock, executes the rollup
function using sample Gift data, and asserts the PATCH payload that would be
sent to Twenty. It depends on the `tsx` runtime, which is installed by the
workspace `yarn install`.
