# Automations Overview

_Last updated: 2025-10-02_

Working draft that tracks automation tooling, patterns, and decisions for the managed-extension stack. Pair this with `INTEGRATIONS.md` so every inbound/outbound workflow has both an integration and an automation story. Update as we experiment.

## 1. Guiding Principles
- Start with the leanest automation that proves the flow; document manual fallbacks until we harden the job.
- Prefer declarative or low-code options (Twenty Workflows, n8n) for pilot speed, but record hand-off paths to fundraising-service jobs if we hit scale limits.
- Keep automations observable: structured logs, rerun guidance, and rollback steps must live in the runbooks.
- Every automation links to a backlog item (see `/docs/POC-backlog.md`) so we can track ownership and follow-up work.

## 2. Tooling Landscape (placeholder)

| Tool | Use Case | Status | Notes |
| --- | --- | --- | --- |
| Twenty Workflows (in-app) | Native triggers/actions inside Twenty | Not yet evaluated | Need spike to confirm coverage for Gift object + custom rollups. |
| n8n (self-hosted) | Cross-system orchestration (webhooks, receipts) | Planned | Capture deployment decision (stack vs managed) and secret handling. |
| fundraising-service jobs | Node scripts/cron for advanced logic | Existing | Align with rollup calculations, webhook retries, receipt generation. |
| Evidence CLI automations | Report refresh/build tasks | Pending | Depends on Decision D-0016 (warehouse vs API). |

> TODO: add additional tools (Zapier, Make, AWS Step Functions) once we scope their role.

## 3. Core Scenarios to Map
- **Gift Rollups & Snapshots**: Automate rebuilds post-import and nightly refresh; ensure alignment with backlog item 3.
- **Donation Receipt Pipeline**: Trigger PDF/email receipts after successful gift creation, capture retries, and surface audit trails for HMRC/GDPR compliance.
- **Gift Aid Declarations**: Auto-flag eligible gifts, schedule claim exports, and remind admins when declarations expire (ties to backlog item 5).
- **Data Hygiene**: Contact dedupe/matching, missing address alerts, consent sync with marketing tools.
- **Connector Webhook Handling**: Standardise validation, idempotency, and error recovery for payment/form connectors (backlog item 4).
- **Volunteer/Program Automations (future)**: Queue once Phase 2+ schemas are defined; include shift reminders and attendance rollups.

## 4. Dependencies & Referenced Docs
- `docs/OPERATIONS_RUNBOOK.md` for smoke/rerun steps when automations fail.
- `docs/METADATA_RUNBOOK.md` for required fields/objects the automations rely on.
- `INTEGRATIONS.md` for upstream/downstream systems and secrets.
- ADRs in `DECISIONS.md` (notably D-0015 for portal/connector stance, D-0016 for reporting data source) drive automation choices.

## 5. Open Questions
- Which automations must ship for the Fundraising MVP vs. post-POC?
- Do we bundle n8n inside dev-stack or document a managed option for pilots?
- How do we version and test declarative automations (export formats, CI hooks)?
- Should receipt generation live in fundraising-service or an external worker?
- What guardrails do we need around AI-assisted automations (consent, explainability)?

## 6. Next Steps
1. Confirm owner for the automation spike (backlog follow-up to re-create the original content).
2. Audit NPSP’s out-of-the-box automations and flag which ones we replicate vs. retire.
3. Draft evaluation checklist for Twenty Workflows vs. n8n vs. custom jobs (coverage, limits, monitoring).
4. Populate scenario sections with concrete runbooks, payload schemas, and retry policies once the first automation lands.

(Placeholder: flesh out sections above as we validate tooling and ship the initial automation flows.)
