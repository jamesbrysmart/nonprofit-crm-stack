# Rollup engine

Gift rollup engine for Twenty workspaces. The project ships a configurable
serverless function that aggregates Gift data onto parent Person records.

## Requirements
- twenty-cli `npm install -g twenty-cli`
- an `apiKey`. Go to `https://twenty.com/settings/api-webhooks` to generate one

## Configuration
- `serverlessFunctions/calculaterollups/rollups.json` — declarative rollup definitions. The default bundle targets
  Gifts → Person via `donorId` and calculates lifetime, year-to-date, first, and
  last gift metrics. See below for the required Person fields.
- Extend or fork this file to add new rollups (additional parent objects,
  filters, or aggregation types). Keep values camelCase to match the Twenty
  metadata API.
- `filters[].dynamicValue` currently supports `"startOfYear"` (UTC midnight on
  the first day of the current calendar year).

### Default Gift → Person rollups
| Parent field | Suggested type | Description |
| --- | --- | --- |
| `lifetimeGiftAmount` | Number / Currency | Sum of all positive Gifts (`amount.value`) for the Person. |
| `lifetimeGiftCount` | Number | Count of Gifts associated to the Person. |
| `lastGiftDate` | Date | Most recent `dateReceived`. |
| `firstGiftDate` | Date | Earliest `dateReceived`. |
| `yearToDateGiftAmount` | Number / Currency | Sum of Gifts on/after the current calendar year start. |
| `yearToDateGiftCount` | Number | Count of Gifts on/after the current calendar year start. |

Assumptions:
- The Gifts API exposes `donorId`, `amount.value`, `dateReceived`, and optional
  `status`. We currently include any Gift with a positive `amount.value`; adjust
  `childFilters` if you need status-specific behaviour (e.g. settled-only).
- All amounts use `amount.value` (major units). If you migrate to minor units,
  update the configuration accordingly.
- Custom Person fields must be created up front in Twenty metadata with the
  names above (camelCase).
- The provisioning script at `services/fundraising-service/scripts/setup-schema.mjs`
  now seeds these Person fields alongside the campaign/gift objects; run it on
  new workspaces before syncing the app.

## Install to your Twenty workspace

```bash
twenty auth login
twenty app sync
```
