# Integrations Overview

_Last updated: 2025-09-30_

This file tracks external systems we plan to connect to the Twenty + fundraising-service stack. Entries are exploratory unless marked otherwise—treat the statuses as placeholders until we validate each path.

## 1. Guiding Principles

- Keep integrations thin: validate a happy-path POC before committing to deep feature work.
- Prefer webhook-driven flows when providers support them; fall back to polling only when necessary.
- Always run inbound data through the fundraising-service so we preserve dedupe, logging, and rollups.
- Document auth/secrets handling early so we don’t scatter credentials across the stack.

## 2. Payment & Donation Connectors

| Provider | Use Case | Desired Flow | Status | Notes |
| --- | --- | --- | --- | --- |
| Stripe | Card donations / one-off payments | Webhook → fundraising-service → `/gifts` | Planned | Need to design webhook endpoint + signature verification. |
| GoCardless | Direct debit recurring gifts | Webhook → schedule updates | Planned | Coordinate with rollup logic for pledge schedules. |
| JustGiving / Enthuse | Third-party donation forms | Daily export or webhook ingest | Backlog | Assess API availability/cost. |
| Custom Twenty Form | Native hosted donation page | Direct POST → fundraising-service | Existing | Already covered by admin UI; extend for public forms. |
| Receipt PDF service (e.g., PDF generator, Lambda) | Tax receipt generation & storage | Trigger via automation job, store link back in Twenty | Backlog | Align with automation job for receipt issuance. |

## 3. Communications & Marketing

| Tool | Use Case | Desired Flow | Status | Notes |
| --- | --- | --- | --- | --- |
| Mailchimp | Email segmentation, newsletters | Contact opt-in/out sync, audience exports | Backlog | Capture consent flags from fundraising-service automations. |
| Campaign Monitor / SendGrid | Potential alternatives | Similar to Mailchimp | Backlog | Evaluate once Mailchimp pattern is proven. |

## 4. Analytics & Dashboards

| Tool | Use Case | Desired Flow | Status | Notes |
| --- | --- | --- | --- | --- |
| Evidence.dev | Modular fundraising dashboards | Docker Compose service → reads from Twenty API or analytics warehouse (TBD) | Evaluating | Warehouse path validated (decision `D-0016` pending cost/ops); datasource registration bug (`npx evidence sources` resolves 127.0.0.1) tracked in `docs/spikes/evidence-dashboard-poc.md`. |
| Metabase / Superset | Donor performance dashboards | Direct DB connection (read-only) | Planned | Align with rollup fields + pilot reporting needs. |
| Google Data Studio / Looker Studio | Lightweight dashboards | CSV/API export from Twenty | Backlog | Needs reproducible export feeds. |

## 5. Other Ecosystem Touchpoints

| Domain | Candidate Integrations | Status | Notes |
| --- | --- | --- | --- |
| Volunteer Portals | Timecounts, Better Impact | Backlog | Reassess in Phase 2 (Volunteer module). |
| Grants | Grant-making platforms (e.g., Submittable) | Backlog | Align with Phase 3 requirements. |
| AI/Automation | GPT-based donor insights | Experiment | Depends on data-access patterns and consent. |

## 6. Dependencies & Cross-References

- Automation hook requirements live in `AUTOMATIONS.md` (webhook processing, job scheduling).
- API endpoints, duplicate handling, and merge behaviour documented in `docs/TWENTY_METADATA_API.md`.
- Any new integration should have a corresponding ticket in `/docs/POC-backlog.md` before implementation.

## 7. Open Questions

- Which providers must be in the MVP vs. nice-to-have for pilots?
- Do we centralise secrets management (e.g., Vault, Doppler) for third-party API keys?
- How do we expose integration health to admins (dashboards, alerts)?

## 8. Next Steps

1. Prioritise the first payment connector (likely Stripe) and design the webhook ingestion flow.
2. Draft the rollup architecture so analytics tools have reliable fields to query.
3. Revisit this matrix after each POC to update statuses and capture learnings.

(Keep this document lightweight—goal is clarity, not exhaustive specs. Update as soon as priorities shift.)
