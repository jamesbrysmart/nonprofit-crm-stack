# Operational Data Plane – Working Notes

_Last updated: 2025-02-07_

This document captures the evolving architecture for how our managed extensions read and write CRM data while Twenty remains the canonical system. It expands on **D-0000** in `DECISIONS.md` and will be updated as prototypes land.

## 1. Goals & Constraints

- Provide a “homepage” experience that feels realtime for interactive widgets (tasks, recent activity, AI nudges) while supporting slightly delayed analytics (dashboards, summaries).
- Keep writes flowing through the fundraising/volunteer services so Twenty’s API remains the source of truth and we avoid hard forking the core schema.
- Allow future modules to reuse the same pattern without cornering ourselves if we need to pivot.
- Prefer solutions that deliver cross-module wins (gift staging, rollups, reporting, AI) rather than bespoke pipelines for each feature.

## 2. Option Summary

| Option | Description | Strengths | Risks / Gaps |
| --- | --- | --- | --- |
| API-only proxy | Homepage widgets call Twenty REST/GraphQL on demand via our gateway. | Zero duplication, always canonical state, minimal infra. | Latency stacks up, limited aggregate shaping, rate-limit exposure, no offline view. |
| API + cache | Short-lived caches (Redis/in-memory) layered on API responses. | Easy performance boost for repeated reads, still simple to operate. | Cache invalidation complexity, still lacks rich aggregations, stale just-created items hurt trust. |
| Operational mirror (hybrid) | Mirror key objects using Twenty custom objects (plus lightweight service caches when needed); writes still go through Twenty API. | Fast UX, custom aggregates, staging workflows, foundation for AI/dashboards, can seed warehouse. | Metadata automation maturity required, risk of schema bloat inside Twenty, still need drift monitoring. |
| Direct Twenty DB access | Read Twenty’s Postgres schema/replica directly. | Immediate consistency, rich SQL without ETL. | Undocumented schema shifts, upgrade fragility, security/tenancy concerns, potential to impact Twenty performance. |
| Warehouse-first | Use the analytics snapshot (Evidence spike) as the read source for UI + reporting. | Single pipeline powers dashboards, simplified analytics governance. | Refresh cadence too slow for interactive widgets, still need operational layer for staging and tasks. |

## 3. Current Working Plan (subject to change)

1. **Prototype the operational mirror**
   - Capture Gifts, People, Tasks, and staging entities through Twenty custom objects (no separate fundraising-service database).
   - Apply optimistic writes so newly created items appear instantly; reconcile via webhook/poll job results.
   - Instrument drift detection and logging (`x-request-id`) to follow requests end-to-end.
2. **Feed analytics from the same pipeline**
   - Surface mirror tables (or derived views) to the reporting warehouse discussed in D-0016.
   - Maintain a clear cadence difference: realtime for operational queries, scheduled snapshots for heavy analytics.
3. **Keep direct DB access as an experiment**
   - Limit any direct-read spike to read-only roles, document schema touchpoints, and define rollback criteria before attempting.

This plan remains provisional. For the fundraising MVP we are proceeding with the API proxy approach and small targeted caching, while designing read/write layers that can adopt the operational mirror when we hit the revisit triggers in `DECISIONS.md`. Once the MVP feature set stabilises—or sooner if the triggers fire—we will return to this plan, spike the mirror prototype, and update the architecture accordingly.

### 3.1 Gift Staging Lifecycle (draft)

- **Intake**: Inbound gifts (manual UI, CSV, connectors, portal webhooks) land in Twenty staging objects within the operational mirror. Capture raw payload, channel metadata, and ingestion timestamps.
- **Validation**: Synchronous rules flag missing fields, amount anomalies, consent requirements, and run duplicate checks (e.g. `/people/duplicates`). AI-assisted reviews can layer on top.
- **Review & Mapping**: Users (or automated flows) resolve donor/campaign/fund mapping, edit fields, or merge with existing donors. Audit log records each action.
- **Promotion**: Approved staging records trigger write-through to Twenty via the fundraising-service proxy; on success, status flips to “posted” and stores the created Gift ID.
- **Post actions**: Downstream automations (receipts, Gift Aid queues) key off the posted state to avoid firing on unreviewed staging records.
- **Error handling**: Failed promotions stay in staging with surfaced errors, allowing retries or rollbacks without orphaned data in Twenty.

_Open design questions: batching vs single record promotion, SLA expectations for different channels, how to expose staging state in the homepage UI, and whether certain connectors bypass staging with heightened validation._

## 4. Open Questions & Work Items

- **Sync mechanics**: Do we receive webhooks from Twenty or poll REST endpoints? How do we batch updates and handle retries?
- **Staging lifecycle**: Where do we record in-flight gift entries/imports, and how do we promote them to canonical Gifts?
- **Conflict resolution**: How are simultaneous edits (Twenty UI vs managed UI) surfaced and resolved?
- **Tenancy**: For the single-tenant pilot model, do we provision separate databases or schemas per org? What changes if we move to multi-tenant?
- **AI readiness**: What additional enrichment or embeddings do we store to power AI assistants without leaking PII?
- **Observability**: What metrics and alerts confirm mirror health (lag, failed webhooks, cache hit rate)?
- **Extension auth enforcement**: Keep managed UIs (fundraising and future modules) strictly behind the Twenty login once the platform exposes a supported session validation path; today the `/fundraising` React bundle is reachable when logged out, so plan mitigations and revisit after Twenty’s extensibility guidance ships.

## 5. Related Documents

- `DECISIONS.md` – D-0000 (operational data plane), D-0002 (object provisioning), D-0016 (reporting module).
- `docs/PROJECT_CONTEXT.md` – module priorities and product principles.
- `docs/POC-backlog.md` – spikes for rollups, AI CRM proof-of-concept, reporting.
- `docs/OPERATIONS_RUNBOOK.md` – logging and health-check practices to extend once the mirror is implemented.

_Update this file whenever spikes conclude or new constraints emerge so future modules can align without rediscovering past decisions._
