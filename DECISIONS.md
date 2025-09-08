# DECISIONS

Status: Living document  
Last updated: 2025-09-07

This file captures the *how*, not the *what*: boundaries, trade-offs, and defaults that keep us fast without painting us into a corner.

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
- **Contacts** are owned by **Twenty** (CRM).
- **Fundraising (Gifts, Campaigns)** are owned by the **fundraising-service** database.

**Why**
- Keeps CRM responsibilities clean; fundraising logic can evolve independently (Gift Aid, webhooks, AI).

**UX impact**
- Users create/edit Contacts in Twenty; Gifts link to a `contactId` from Twenty.
- If a webhook arrives for an unknown donor, we create/match the Contact in Twenty first, then persist the Gift.

**Alternatives considered**
- Fundraising owns Contacts → rejected (split editing, messier UX).

---

## D-0002: How Gifts/Campaigns appear in Twenty
**Decision**
- **Write-back (mirror)** a subset of fields into **Twenty custom objects** using the metadata API (`/graphql/metadata`), so Gifts/Campaigns feel native in lists/search.

**Why**
- Immediate “native” UX, minimal custom frontend. Gateway-only can still be added later for richer views.

**Consequence**
- We own a small, deterministic sync (idempotent upsert) from fundraising-service → Twenty.

**Alternative**
- **Gateway-only** (no mirror). Pros: no duplication; Cons: more custom UI, less out-of-the-box CRM goodness.

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
- Keep an **UPGRADES.md** checklist (diff release notes, run DB backups, test metadata scripts, smoke tests).

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
- **SoT**: Contacts → Twenty; Gifts/Campaigns → fundraising-service.
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