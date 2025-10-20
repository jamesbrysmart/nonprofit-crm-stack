# Automations Overview

_Last updated: 2025-10-02_

Working draft that tracks automation tooling, patterns, and decisions for the managed-extension stack. Pair this with `INTEGRATIONS.md` so every inbound/outbound workflow has both an integration and an automation story. Update as we experiment.

## 1. Guiding Principles
- Start with the leanest automation that proves the flow; document manual fallbacks until we harden the job.
- Prefer declarative or low-code options (Twenty Workflows, n8n) for pilot speed, but record hand-off paths to fundraising-service jobs if we hit scale limits.
- Keep the fundraising-service API as the canonical ingress/egress so dedupe, rollups, and logging stay consistent no matter which tool triggers the flow.
- Keep automations observable: structured logs, rerun guidance, and rollback steps must live in the runbooks.
- Every automation links to a backlog item (see `/docs/POC-backlog.md`) so we can track ownership and follow-up work.

## 2. Tooling Landscape (placeholder)

| Tool | Use Case | Status | Notes |
| --- | --- | --- | --- |
| Twenty Workflows (in-app) | Native triggers/actions inside Twenty | Not yet evaluated | Need spike to confirm coverage for Gift object + custom rollups. Always proxy writes/reads via fundraising-service endpoints. |
| n8n (self-hosted) | Cross-system orchestration (webhooks, receipts) | Planned | Primary low-code orchestrator for pilot integrations; call fundraising-service REST API and emit request IDs into logs. Capture deployment decision (stack vs managed) and secret handling. |
| fundraising-service jobs | Node scripts/cron for advanced logic | Existing | House compliance-critical flows (Gift Aid, receipts) and latency-sensitive work. Align with rollup calculations, webhook retries, receipt generation. |
| Zapier (per-tenant) | Lightweight notifications or bespoke pilot glue | Planned | Allowed for scoped org-specific automations; document flows and hand-off criteria into n8n/service when they harden. |
| Evidence CLI automations | Report refresh/build tasks | Pending | Depends on Decision D-0016 (warehouse vs API). |

> TODO: add additional tools (Zapier, Make, AWS Step Functions) once we scope their role.

## 3. Platform Playbook
- **Twenty webhooks first**: Subscribe where available, normalise the payload into the canonical gift/automation event shape, then forward to fundraising-service so telemetry and retry policies remain centralised.
- **n8n orchestration**: Use n8n for cross-system pilots (e.g., Stripe → fundraising-service, Slack alerts). Version exported flows in Git and pair each with a runbook entry before extending to new tenants.
- **Zapier guardrails**: Limit Zapier to tenant-specific glue that cannot wait for n8n. Document the Zap, link it to a backlog ticket, and define the trigger to migrate it into n8n/service if usage or risk grows.
- **Service-owned jobs**: Fall back to Nest cron/queues when the flow is compliance-critical, latency-sensitive, or needs bespoke retry/error semantics.
- **Observability baseline**: Whatever the orchestrator, pass through `x-request-id` and log context so `docs/OPERATIONS_RUNBOOK.md` remains the single troubleshooting path.

## 4. Core Scenarios to Map
- **Gift Rollups & Snapshots**: Automate rebuilds post-import and nightly refresh; ensure alignment with backlog item 3.
- **Donation Receipt Pipeline**: Trigger PDF/email receipts after successful gift creation, capture retries, and surface audit trails for HMRC/GDPR compliance.
- **Gift Aid Declarations**: Auto-flag eligible gifts, schedule claim exports, and remind admins when declarations expire (ties to backlog item 5).
- **Data Hygiene**: Contact dedupe/matching, missing address alerts, consent sync with marketing tools.
- **Connector Webhook Handling**: Standardise validation, idempotency, and error recovery for payment/form connectors (backlog item 4).
- **Volunteer/Program Automations (future)**: Queue once Phase 2+ schemas are defined; include shift reminders and attendance rollups.

## 5. Dependencies & Referenced Docs
- `docs/OPERATIONS_RUNBOOK.md` for smoke/rerun steps when automations fail.
- `docs/METADATA_RUNBOOK.md` for required fields/objects the automations rely on.
- `INTEGRATIONS.md` for upstream/downstream systems and secrets.
- ADRs in `DECISIONS.md` (notably D-0015 for portal/connector stance, D-0016 for reporting data source) drive automation choices.
- `docs/DONATION_CONNECTOR_SCAFFOLDING.md` for canonical event schema, Stripe→n8n pattern, and connector upgrade triggers.

## 6. Open Questions
- Which automations must ship for the Fundraising MVP vs. post-POC?
- Do we bundle n8n inside dev-stack or document a managed option for pilots?
- How do we version and test declarative automations (export formats, CI hooks)?
- Should receipt generation live in fundraising-service or an external worker?
- What guardrails do we need around AI-assisted automations (consent, explainability)?

## 7. Next Steps
1. Confirm owner for the automation spike (backlog follow-up to re-create the original content).
2. Audit NPSP’s out-of-the-box automations and flag which ones we replicate vs. retire.
3. Draft evaluation checklist for Twenty Workflows vs. n8n vs. custom jobs (coverage, limits, monitoring).
4. Populate scenario sections with concrete runbooks, payload schemas, and retry policies once the first automation lands.

(Placeholder: flesh out sections above as we validate tooling and ship the initial automation flows.)

## 8. Serverless Functions – Current Learnings

_Last updated: 2025-10-20_

Twenty’s serverless runtime is where we now host the rollup engine. Experience so far:

- **Bundle & overrides**
  - Code lives under `serverlessFunctions/<name>/src`. We embed runtime config in TypeScript (`rollupConfig.ts`) rather than reading `rollups.json` from disk. Optional overrides come from env variables (`ROLLUP_ENGINE_CONFIG`, `ROLLUPS_CONFIG`, `CALCULATE_ROLLUPS_CONFIG`).
  - `twenty app sync` pushes a snapshot; `twenty app dev` hot-syncs while coding. After a compose upgrade always re-run the sync so the worker sees the latest bundle (`docs/DOCKER_ENV_APPROACH.md`).
- **Environment**
  - Workers must receive `TWENTY_API_KEY` and the base URL (`TWENTY_API_BASE_URL`). We pass them explicitly in `docker-compose.yml` so the serverless function can call Twenty’s REST API. Missing keys now downgrade the run to a noop warning instead of an exception.
  - Twenty includes both current and previous relation IDs in database-event payloads. We filter child records client-side and log the relation ID so orphaned donors don’t break the rollup.
- **Logging & diagnostics**
  - Each run logs:
    - Relation membership (`relation … includes … gift(s)`).
    - Computed aggregates (`{ amountMicros, currencyCode, … }`).
    - Success/warning lines referencing the relation ID so we can diff against `/rest/gifts`.
  - REST filters like `filter[donorId]` aren’t honored today; we perform filtering locally and watch the Twenty roadmap in case native filters appear.
- **Data shape**
  - Currency rollups must be `{ amountMicros, currencyCode }`; dates should be `YYYY-MM-DD`. The current bundle normalizes values taken from `gift.amount.amountMicros` and `giftDate`.
- **Doc hygiene**
  - Update this section whenever we learn something new (bundle limits, trigger quirks, cron intervals, etc.). Cross-reference with `docs/TWENTY_HACKATHON.md` for the rollup architecture narrative.

(Placeholder: flesh out sections above as we validate tooling and ship the initial automation flows.)
