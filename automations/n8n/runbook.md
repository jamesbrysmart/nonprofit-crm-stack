# n8n Runbook (Optional)

This stack supports n8n as an optional companion service. It is best-effort only and must never be required for the core CRM to operate.

## Support Boundary
- Integrations must treat fundraising-service and Twenty APIs as the contract. No direct database access.
- n8n workflows can break independently; keep CRM upgrades decoupled from workflow changes.
- We provide a local profile + templates, not production operations guarantees.

## Local Quickstart
1) Set the required env vars in `.env` (see `.env.example`).
2) Start the profile: `docker compose --profile n8n up -d`.
3) Open `http://localhost:5678` and sign in.

## Required Env Vars
- `N8N_ENCRYPTION_KEY` (persisted; changing it invalidates stored credentials)
- `N8N_BASIC_AUTH_ACTIVE=true`
- `N8N_BASIC_AUTH_USER` + `N8N_BASIC_AUTH_PASSWORD`

## Webhook and Host Settings
- Default local URL: `http://localhost:5678`
- If you change `N8N_PORT`, also set `N8N_WEBHOOK_URL`.
- Hosted defaults (recommended):
  - Separate subdomain, e.g. `https://n8n.example.org`
  - `N8N_HOST=n8n.example.org`
  - `N8N_PROTOCOL=https`
  - `N8N_WEBHOOK_URL=https://n8n.example.org`
  - `N8N_EDITOR_BASE_URL=https://n8n.example.org`

## Security Baseline
- Auth required; prefer network restrictions for admin access.
- Use least-privileged API tokens for CRM access.
- Treat workflow exports as sensitive (they can reveal endpoints and logic).

## Storage
- Local dev uses SQLite in the `n8n-data` volume.
- This stack does not include a Postgres service dedicated to n8n.
- For shared/hosted usage, switch to an external Postgres instance:
  - `DB_TYPE=postgresdb`
  - `DB_POSTGRESDB_HOST=...`
  - `DB_POSTGRESDB_PORT=5432`
  - `DB_POSTGRESDB_DATABASE=...`
  - `DB_POSTGRESDB_USER=...`
  - `DB_POSTGRESDB_PASSWORD=...`

## Templates and Tenants
- Sanitized templates live in `automations/n8n/templates`.
- Tenant-specific workflows live in `automations/n8n/tenants`.
