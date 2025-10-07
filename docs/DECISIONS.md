# DECISIONS

Status: Living document  
Last updated: 2025-09-10

This file captures the *how*, not the *what*: boundaries, trade-offs, and defaults that keep us fast without painting us into a corner.

---

## D-0000: Operational Data Plane Strategy
**Status**: Draft (tracking for continuous review)
**Priority**: Critical

**Context**
- Every managed extension (fundraising, volunteers, grants, programs) needs a user-facing experience that feels realtime while still respecting Twenty as the canonical CRM.
- The choice of read/write wiring affects dashboards, staging flows, AI assistants, reporting, and our ability to keep pilots confident in data freshness.
- Previous decisions (e.g. D-0002 on object provisioning and D-0016 on reporting) assumed API-first integration, but we agreed to re-open the architecture before locking anything in.

**Options under evaluation**
1. **API-only proxy** – homepage widgets call Twenty REST/GraphQL through our gateway for every read.
   - *Pros*: zero duplication, minimal infra, always shows canonical state.
   - *Cons*: compounded latency per widget, limited aggregate shaping, tight coupling to rate limits.
2. **API + cache** – layer Redis/in-memory caches with short TTL or explicit busting after writes.
   - *Pros*: quick win for repeated queries, still no separate persistence.
   - *Cons*: invalidation complexity, still constrained for rich analytics, risks stale “just created” items.
3. **Operational mirror (hybrid)** – maintain a focused read/write store inside our services (e.g. Postgres tables for gifts, tasks, staging) populated via webhooks or polling, while writes propagate to Twenty via API.
   - *Pros*: fast homepage, custom aggregates, pre-validation staging, strong foundation for AI features; can feed analytics warehouse.
   - *Cons*: own sync logic and monitoring; eventual consistency unless we add optimistic updates; extra infra surface area.
4. **Direct Twenty DB access** – read from Twenty’s Postgres schema/replica.
   - *Pros*: immediate consistency, minimal processing, powerful SQL.
   - *Cons*: schema is undocumented/volatile, upgrades become brittle, elevated security/operational risk, hard to share safely between tenants.
5. **Analytics warehouse first** – treat a refreshed warehouse (Evidence spike) as the read source for UI and reporting.
   - *Pros*: single investment powers dashboards and reports; simplified analytics pipeline.
   - *Cons*: refresh cadence limits “realtime” feel; still need an operational layer for interactive widgets.

**Current working approach (subject to change)**
- **MVP (now)**: ship with the API-first proxy pattern (option 1), layering small server-side batching/caching where needed. This keeps implementation velocity high for the fundraising homepage and staging proof-of-concept.
- **Design for evolution**: structure read layers so we can swap in an operational mirror later without rewriting every feature (`ARCHITECTURE.md` captures guidance).
- **Planned revisit**: prototype the operational mirror (option 3) once MVP feature set is stable or when documented triggers (below) fire. Keep the direct-DB tap (option 4) only for controlled spikes with rollback plans.

**Revisit triggers**
- Homepage or staging UX suffers due to API latency/limitations (e.g. new tasks not appearing immediately, lack of audit history).
- Duplicate handling/validation becomes unmanageable without local persistence.
- Reporting/Ai workloads require shaped data we can’t efficiently produce via API-only.
- Twenty exposes a supported event stream or replica that mitigates option 4 risks.
- Performance or cost constraints make warehouse + mirror untenable across modules.

**References**
- `ARCHITECTURE.md` – living note capturing the data-plane architecture and open questions.
- `docs/PROJECT_CONTEXT.md` §4/5 (module scope) and §7 (phase planning).
- `docs/POC-backlog.md` Phase 1/2 items (rollups, reporting, AI spikes) that rely on fast reads.
- `docs/OPERATIONS_RUNBOOK.md` §3 (structured logging) for tracing cross-system flows.

**Downstream decisions impacted**
- D-0002 (object provisioning) – may evolve if we materialise staging objects in Twenty vs service DB.
- D-0016 (reporting module) – data-source choice must align with the operational mirror outcome.
- Future module ADRs should cite D-0000 explicitly when selecting data access patterns.

**Next actions**
1. Draft detailed architecture notes (see `ARCHITECTURE.md`).
2. Schedule a spike to validate webhook-driven mirroring and quantify latency.
3. Update dependent decisions once the prototype proves (or disproves) the hybrid path.

---

## D-0004: Gift Staging & Intake Workflow
**Status**: Draft (problem framing)
**Priority**: High

**Context**
- Donation intake spans managed UI gift entry, CSV imports, portal/webhook feeds, and future connectors. Each source carries high risk of user error (duplicate or misspelled donors, incorrect amounts, wrong campaign/fund attribution).
- Downstream automation—receipts, acknowledgements, Gift Aid claims—can trigger before humans notice mistakes, creating costly clean-up.
- Industry patterns (e.g. Salesforce Gift Entry) rely on staging or “batch” records to validate, dedupe, and map donations prior to promoting a canonical gift.

**Goals**
- Provide a controlled “staging” area where inbound gifts can be reviewed, enriched, matched to donors/campaigns/funds, and flagged for issues before committing to Twenty.
- Support multiple intake channels with consistent validation rules and audit trails (who approved, when, original payload).
- Enable automated checks (duplicate detection, amount thresholds, task assignment) while allowing human intervention when needed.
- Ensure the staging lifecycle integrates with the operational data-plane decision (D-0000) so homepage widgets, AI summaries, and reporting can surface both pending and posted gifts.

**Approach candidates (to evaluate next)**
1. **Service-owned staging tables** – store raw + normalized payloads in fundraising-service DB, run validations, and promote to Twenty via API once approved.
2. **Staging objects inside Twenty** – create custom “Gift Intake” objects in Twenty metadata, using Twenty UI/list views for review before conversion.
3. **Hybrid** – capture staging in service DB for fast UX, but mirror approved batches into Twenty for audit/history.
4. **Direct streaming to warehouse** – land raw donations in analytics store, then backfill operational gifts (likely insufficient for realtime corrections but worth noting).

**Key considerations**
- Deduplication strategy (people, gifts), including use of `/people/duplicates` and future AI matching.
- Validation hooks (Gift Aid eligibility, required fields, campaign mapping) and extensibility for new channels.
- Auditability: ability to trace from final Gift back to original staging payload and decision log.
- Automation triggers: when do receipts/claims fire relative to staging approval?
- UX expectations: batch review, bulk approve/reject, quick edits.

**References**
- `ARCHITECTURE.md` (Operational Mirror) – staging must slot into the chosen read model.
- `docs/POC-backlog.md` Phase 1 items (Gift Aid export, connector scaffolding) impacted by staging.
- Future AI CRM spike – potential for AI-assisted validation.

**Next actions**
1. Document detailed staging lifecycle and data model assumptions (`ARCHITECTURE.md`).
2. Spike on prototype staging tables + promotion flow (manual UI path first).
3. Update this decision with evaluated options, chosen approach, and revisit triggers after the spike.

---

## D-0015: Managed Extension POC defaults (Households, Funds, Portal)
**Status**: Interim (revisit triggers defined)
**Priority**: High

**Context**
- For the Q4 FY25 managed-extension proof of concept we must keep the fundraising MVP lean while avoiding irreversible schema choices.
- Open questions in `/docs/PROJECT_CONTEXT.md` §11 cover Household defaults, Allocation/Fund scope, and portal strategy.

**Decision (Interim)**
- **Households** remain disabled by default for new workspaces; we document an enablement runbook so pilots can opt in when needed.
- **Allocations/Funds** stay out of the core MVP schema; requirements will be captured during Grants planning before adding an optional module.
- **Portal strategy** for the POC relies on third-party connectors and guidance; we defer shipping an in-repo or separate portal template until the volunteer signup prototype is defined.

**Why**
- Keeps day-one setup simple for small UK nonprofits, aligning with the POC’s “lean core” goal.
- Avoids shipping partially baked schema/UX that would be costly to undo once metadata automation stabilises.

**Revisit triggers**
- Re-evaluate Household defaults when ≥2 pilot orgs request it during onboarding or once the volunteer schema is finalised.
- Reconsider Allocations/Funds before Grants module implementation or if a pilot requires restricted fund reporting sooner.
- Revisit portal strategy after completing the volunteer signup experience prototype (POC backlog item 13).

**Notes**
- See `/docs/spikes/managed-extension-decisions.md` for option analysis and next actions.
- Action items: update onboarding docs with the household toggle guidance and connector-focused portal notes.

---

## D-0016: Evidence Reporting Data Source (Warehouse vs API)
**Status**: Pending
**Priority**: Medium

**Context**
- Evidence dashboards need a consistent reporting layer for fundraising metrics (initial slice: gifts by month).
- Two viable data paths emerged during the POC: query Twenty’s APIs live or materialise an analytics snapshot in Postgres and let Evidence read from that warehouse.
- Today’s devenv experiment confirms the warehouse path is technically feasible but we still need to understand operational overhead (snapshot jobs, storage, costs) before locking it in.

**Current Leaning (not final)**
- Treat the warehouse snapshot as the default source for the Evidence module because it keeps dashboards fast, isolates queries from API rate limits, and fits the managed-extension model (data stays inside our Postgres boundary).
- Keep the API-on-demand option as a fallback for lightweight embeds or orgs that cannot host a warehouse, but do not optimse the main build for it yet.

**Why we haven’t decided**
- Lack of cost modelling: we need estimates for long-running Postgres storage/compute, especially if snapshots grow with larger tenants.
- Operational overhead is undefined: no schedule or ownership yet for refreshing `analytics.gifts_snapshot`, monitoring job failures, or handling schema drift.
- Multi-tenant story is open: a shared warehouse may require row-level security or per-tenant databases; API approach could defer that complexity.

**Next Steps Before Decision**
1. Produce a lightweight cost model comparing (a) hosted Postgres snapshot vs (b) API-driven dashboards (consider query volume, storage, maintenance effort).
2. Define the proposed snapshot orchestration (tooling, cadence, failure handling) and identify the owning team.
3. Validate how Evidence behaves with larger datasets (performance, build time) to ensure the warehouse approach scales.
4. Document tenant isolation requirements and whether they favour one approach over the other.

**Revisit Triggers**
- Complete the cost/ops analysis (target: next reporting workstream planning session).
- Pilot feedback indicating Evidence must run without warehouse access.
- Any move toward multi-tenant hosting that changes cost or security assumptions.

**Notes**
- Spike findings live in `docs/spikes/evidence-dashboard-poc.md` (Key Learnings & Future Implementation Blueprint).
- Update `docs/REPORTING_EVIDENCE.md` and backlog items once the decision is made.

---

## D-0014: Project Structure and Dependency Management
**Status**: Decided
**Priority**: High

**Context**
- The project is composed of multiple, independent services that work together. We need a clear and robust strategy for managing the source code of these services within the main `dev-stack` repository.
- There has been confusion in the past due to inconsistencies between the documented structure (Git submodules) and the implementation (Docker build context).

**Decision: Git Submodules as the Source of Truth**
- The `dev-stack` repository will act as a "superproject" that manages its constituent services (`fundraising-service`, `twenty-core`) as Git submodules.
- The canonical source for the project structure is the `.gitmodules` file. All other configurations, including Docker Compose build contexts, must align with this file.
- The `fundraising-service` and `twenty-core` repositories will be located within the `services/` directory of the `dev-stack` repository.

**Why**
- **Version Pinning**: Submodules allow us to pin a specific version (commit) of a service, ensuring that the `dev-stack` is always in a known, consistent state. This is crucial for stability and reproducible builds.
- **Independent Development**: Each service can be developed and tested independently in its own repository, with its own commit history.
- **Clear Separation of Concerns**: It enforces a clean separation between the orchestration layer (`dev-stack`) and the services themselves.
- **Alignment with Documentation**: This decision aligns the project's implementation with its long-standing documentation, reducing confusion for current and future developers.

**Development Workflow**
- When cloning the `dev-stack` repository, always use the `--recurse-submodules` flag: `git clone --recurse-submodules ...`
- To pull the latest updates for all services, use: `git submodule update --remote --merge`
- Changes made within a submodule must be committed and pushed from within that submodule's directory. The `dev-stack` superproject must then be updated to point to the new commit.

---

## D-0013: Integration Strategy for Custom Entities (Gift, Campaign)
**Status**: Decided
**Priority**: High

**Context**
- We need to display and manage custom data (Gifts, Campaigns) that is not native to the Twenty CRM. We must decide on the best architectural approach for this integration to balance a native user experience with ease of maintenance.

**Decision: The "Managed Extension" Approach**
- We will adopt a hybrid **"Managed Extension"** approach. This treats the `twenty-core` codebase as a read-only vendor library while achieving a native-like experience by using official APIs.
- **Schema & UI Scaffolding**: The schema for our custom entities (`Gift`, `Campaign`) will be created and managed programmatically by calling Twenty's official **Metadata API**. This allows Twenty to generate the database tables and the basic UI (forms, lists), ensuring our entities feel native.
- **Advanced Business Logic**: The separate `fundraising-service` will contain all specialized business logic (e.g., payment gateway webhooks, reporting jobs). This service will interact with the data by calling Twenty's standard **Data API**, not by accessing the database directly.

**Why**
- This approach provides the best of both worlds: it leverages Twenty's core features for a native user experience (the "NPSP model") while keeping our custom code separate from the core codebase, which ensures future updates to `twenty-core` remain simple.

**Alternatives Considered**
- **Pure Separate Service**: Previously "Path A". This involved creating our own tables via TypeORM migrations and building all UI components from scratch. It was rejected due to concerns about a functional "rift" between the two systems and the high effort required to replicate native Twenty UI features.

---

## D-0001: Domain boundaries & sources of truth
**Decision**
- **Contacts** and **fundraising objects** (Gifts, Campaigns, etc.) live in **Twenty**. Our services orchestrate through Twenty's APIs rather than persisting a separate copy.

**Why**
- Mirrors the managed-package model (Salesforce NPSP analogy) and avoids bi-directional sync/duplication debt.
- Keeps Twenty's native UX, workflows, and reporting as the single pane of glass for nonprofit staff.

**UX impact**
- Users create and edit fundraising records directly inside Twenty; the fundraising-service acts as automation/AI glue.
- External inputs (e.g., webhooks) must write via Twenty APIs so the source of truth stays aligned.

**Alternatives considered**
- Service-owned fundraising DB → rejected due to sync overhead and drifting UX.
- Shared Postgres schema inside Twenty → higher coupling/risk during upgrades.

---

## D-0002: How Gifts/Campaigns appear in Twenty
**Decision**
- Provision custom objects/fields inside **Twenty** (manually for now, automated once the Metadata API stabilises) and interact with them directly through Twenty's REST/GraphQL APIs.

**Why**
- Gives us the native Twenty UX, reporting, and workflows without maintaining a duplicate data model.
- Keeps the managed-extension footprint small and avoids bespoke frontends during the POC.

**Consequence**
- Fundraising-service becomes an orchestration/automation layer; any local persistence is optional (e.g., caching, jobs).

**Alternative**
- **Gateway-only** frontends backed by our own DB. Pros: full control; Cons: rebuilds UI, loses Twenty workflows.

---

## D-0003: Tenancy model
**Decision**
- **Single-tenant per charity** (one stack per client) for pilots/early users.

**Why**
- Simpler isolation, GDPR/data separation, easier per-client config.

**Future**
- If multi-tenant becomes necessary, we may introduce `tenant_id` and row-level security; optional to add `tenant_id` columns early as cheap insurance.

---

## D-0004: Authentication model
**Decision**
- Users authenticate with **Twenty**.
- **Short-term**: gateway → fundraising-service via API key.
- **Long-term**: gateway validates Twenty session/JWT and propagates identity.

**UX**
- Single login for users; no second sign-in.

---

## D-0005: Gateway & base URL
**Decision**
- Front everything at **http://localhost:4000** (gateway), proxy to Twenty (3000) and fundraising-service (4500).
- **Config**: `SERVER_URL=http://localhost:4000`.

**Why**
- One origin = fewer CORS/cookie headaches; cleaner links.

**Future**
- Replace Nginx stub with **Apollo Router** for schema federation and auth enforcement.

---

## D-0006: Version pinning & upgrades
**Decision**
- Pin container images (e.g. `twentycrm/twenty:vX.Y.Z`) rather than `latest`.

**Process**
- The upgrade process is documented in `docs/DOCKER_ENV_APPROACH.md`.

---

## D-0007: Money, time, GDPR
**Decision**
- **Money**: integer **minor units** (pence) + ISO currency; format in UI.
- **Time**: store **UTC**; convert in UI.
- **PII/GDPR**: document DSAR/export/delete flows; log consent later (future Gift Aid work).

**Why**
- Prevents rounding bugs and timezone drift; prepares us for HMRC/GDPR expectations.

---

## D-0008: Database migrations
**Decision**
- **No** `synchronize: true` outside local; use **TypeORM migrations** for every change.
- Migration policy: add column → backfill → switch code → remove old column (zero-downtime pattern).

**Tooling**
- Testcontainers for integration tests; `npm run migration:generate` + review.

---

## D-0009: Metadata as code (Twenty)
**Decision**
- Keep idempotent scripts in `scripts/metadata/` that call **`/graphql/metadata`** with `x-api-key` to create/alter custom objects (e.g., `Gift__c`, `Campaign__c`).

**Why**
- Reproducible environments; no click-drift between dev/stage/prod.

**Notes**
- Store schema introspections (`schema-metadata.graphql`) to guide codegen/AI.

---

## D-0010: Observability & ops basics
**Decision**
- **Health**: `/health` (liveness) and `/ready` (readiness) in fundraising-service.
- **Logs**: structured JSON with request IDs; gateway should propagate an `X-Request-Id`.
- **Errors**: add Sentry (or equivalent) once beyond local.
- **Metrics**: basic counters for webhook processed/failed/retried.

---

## D-0011: Idempotency & external event handling
**Decision**
- Store provider IDs (e.g., Stripe charge ID, GoCardless event ID) and **upsert on dedupe keys**.
- Maintain an event ledger table if needed for replay.

**Why**
- Real-world webhooks retry; we must be safe to process twice.

---

## D-0012: Framework for `fundraising-service`
**Decision**
- We will continue to build the `fundraising-service` using the **NestJS** framework.

**Why**
- **Structure**: NestJS enforces a consistent, modular architecture (modules, controllers, services), which is ideal for collaboration and for a learning project.
- **Consistency**: It uses TypeScript, which aligns the entire stack (`twenty-core` and this service) to a single language.
- **Best Practices**: It promotes robust, enterprise-grade software patterns that are scalable and highly testable.
- **Ecosystem**: It has excellent documentation and built-in support for tools we are already using, like TypeORM.

**Alternatives considered**
- **Plain Express.js**: Rejected due to lack of enforced structure, which can lead to inconsistent code.
- **FastAPI (Python)**: Rejected to maintain a single language (TypeScript) across the project, reducing cognitive overhead.

---

## Practical defaults (TL;DR)
- **SoT**: Contacts, Gifts, Campaigns → Twenty (managed extension); fundraising-service orchestrates via API.
- **Surfacing**: Write-back to Twenty custom objects for native UX (plus gateway later).
- **Tenancy**: Single-tenant.
- **Auth**: One user login; short-term API key behind gateway; unify later.
- **Gateway**: Port 4000; `SERVER_URL=http://localhost:4000`.
- **Types**: Pence + currency; UTC.
- **Discipline**: Migrations only; metadata as code; pinned versions.
- **Ops**: Health/ready, JSON logs, Sentry later, idempotent webhooks.

---

## Open questions to revisit (when needed)
- Do we add `tenant_id` columns now as future-proofing?
- Which fields are mirrored to Twenty vs kept only in fundraising-service?
- Timeline to replace Nginx with Apollo Router and enable unified auth?

---

## D-0016: Reporting Module Approach
**Status**: Draft
**Priority**: Medium

We evaluated several open-source and custom approaches for modular reporting in the fundraising CRM:

| Option | Strengths | Weaknesses |
| --- | --- | --- |
| **Evidence.dev** | Developer-first, dashboards as code (Markdown + SQL), polished static output, full integration control, version-controllable. | Requires developer updates (no self-service), need to manage refresh scheduling & data segregation. |
| **Metabase** | Extremely easy setup, friendly UI, good for quick dashboards and prototyping. | Embedding & row-level security are enterprise-only; OSS integration clunky for multi-tenancy. |
| **Superset** | Very powerful, enterprise features (RBAC, extensibility, many chart types). | Heavy to run, steep learning curve, likely overkill for our simple needs. |
| **Redash** | Lightweight, SQL-friendly, minimal overhead. | Stagnant development, limited visuals/features, weaker multi-tenancy support. |
| **Custom build** | Fully integrated, ultimate flexibility, no licensing risk. | Higher dev effort and maintenance, risk of reinventing BI features over time. |

**Decision (interim):** Start with **Evidence.dev** for the POC. It fits our developer-driven model (dashboards are code-reviewed assets), gives us strong integration control, and avoids enterprise licensing hurdles. Data sourcing (direct API vs. staging warehouse) remains open until the evaluation spike is complete.
