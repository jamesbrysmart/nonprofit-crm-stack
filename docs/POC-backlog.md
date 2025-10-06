# POC Backlog (Managed Extension)

Working list of tickets focused on validating the Twenty-managed extension approach. Organised by phase to keep delivery aligned with the roadmap. Update as work progresses.

## Phase 1 – Fundraising & Core CRM (MVP)

### 1. Fundraising API Smoke Test _(completed)_
- **Owner:** Engineering
- **Goal:** Prove the end-to-end flow `gateway → fundraising-service → Twenty REST` works reliably with documented metadata prerequisites.
- **Outcome:** `npm run smoke:gifts` exercises create → list → get → update → delete, logs cover retry telemetry, and the persistent smoke gift is visible in Twenty. Any future enhancements (e.g., staging-aware payloads) should ship as new tickets.

### 2. Fundraising Admin Gift Entry UI _(completed)_
- **Owner:** Engineering
- **Goal:** Deliver a lightweight fundraising-service UI that lets an internal admin create gifts (and required contact data) directly in Twenty while reusing the managed-extension proxy.
- **Outcome:** The Vite client (`/fundraising/`) creates donors via `/people`, posts gifts through the proxy, handles duplicate prompts, and confirms with a Twenty link. Any further polish (auth hardening, styling tweaks) belongs in fresh chores.

### 3. Gift Rollups & Dashboard Foundations
- **Owner:** Engineering
- **Goal:** Deliver deterministic rollups (lifetime, YTD/LY, first/last gift) and seed dashboards that satisfy Phase 1 reporting promises.
- **Acceptance hints:**
  - Rollup calculation path agreed (materialised or scheduled job) and tests cover edge cases (pledges, recurring gifts).
  - Dashboard JSON/templates committed; smoke data renders expected totals in Twenty.
  - Rollup rebuild procedure documented for post-import reconciliation.
- **Notes:** Reuse learnings from API smoke work; coordinate with Feature Audit for field availability.

### 4. Payment/Form Connector Scaffolding
- **Owner:** Engineering
- **Goal:** Provide stubs or adapters so popular UK donation forms (e.g., JustGiving, PayPal) can post gifts through the proxy without bespoke code each time.
- **Acceptance hints:**
  - Documented webhook/REST shim for at least one provider with validation of required fields.
  - Configuration guide (environment variables/secrets) committed.
  - Follow-up tickets opened for additional providers once pattern validates.
- **Notes:** Depends on API reliability improvements and Gift model completeness.

### 5. Gift Aid Export & Declaration UX
- **Owner:** Engineering + Product
- **Goal:** Ensure Gift Aid declarations are captured and a claim-ready export is available with minimal setup.
- **Acceptance hints:**
  - Declaration capture flow (API + UI guidance) documented with validation rules.
  - Export script/report template produces HMRC-ready CSV for sample data.
  - Consent/retention checklist cross-referenced in onboarding docs.
- **Notes:** Coordinates with GDPR tasks under Cross-phase; feeds the Phase 1 exit criteria.

### 6. Twenty API Resilience & Structured Logging
- **Owner:** Engineering
- **Goal:** Harden the proxy against transient failures and surface actionable telemetry.
- **Acceptance hints:**
  - Structured JSON logging with request IDs and retry metadata enabled.
  - Alerting or TODO path defined for repeated failures (manual drill log suffices for now).
  - Failure simulation captured in docs with expected behaviour.
- **Status:** JSON logs now include `requestId`, `event` (e.g., `twenty_proxy_attempt`, `twenty_proxy_retry`, `twenty_proxy_network_error`), and timing metadata; metrics TODO and DLQ/webhook backlog still outstanding.

### 7. Operational Hygiene & Runbook
- **Owner:** Engineering
- **Goal:** Ensure the stack is operable without heroics (health/readiness endpoints, logging, restart instructions).
- **Acceptance hints:**
  - `/health` and `/ready` semantics defined and documented.
  - Logging expectations (format, correlation IDs) captured.
  - Runbook snippet covering build/run/diagnose steps committed to docs.
- **Status:** `docs/OPERATIONS_RUNBOOK.md` now documents startup/shutdown, health endpoints, and structured log fields; keep expanding with future procedures.

### 8. Metadata Runbook & Release Watch _(completed)_
- **Owner:** Product + Engineering
- **Goal:** Document programmatic provisioning of custom objects/fields and track Metadata API behaviour (especially relation fields) across Twenty releases.
- **Outcome:** `docs/METADATA_RUNBOOK.md` now covers scripts, manual lookup steps, and the release watch table. Re-open only if Twenty metadata behaviour shifts or automation resumes.

### 9. Evidence Dashboard POC
- **Owner:** Engineering + Product
- **Goal:** Evaluate Evidence.dev as a modular dashboard layer and deliver an internal gifts-focused slice.
- **Acceptance hints:**
  - Evidence runs as a Compose-managed service (profile gated) with documented start/stop and basic auth setup.
  - A sample dashboard renders fundraising metrics sourced from Twenty (via API or staging warehouse) without breaking the managed-extension contract.
  - Findings, licensing/auth questions, and next steps captured in `docs/spikes/evidence-dashboard-poc.md` and cross-referenced in `INTEGRATIONS.md`.
- **Notes:** Warehouse snapshot path validated; service boots on compose profile. Blocker: `npx evidence sources` inside devenv still resolves Postgres as `127.0.0.1`, so charts fail until datasource registration fix lands. Data-source decision captured as `D-0016` (pending cost/ops analysis). Evidence documentation import still pending (`TODO:evidence-docs`).

### 10. Pilot Quickstart (<60 Minutes)
- **Owner:** Product
- **Goal:** Package the steps, scripts, and checklists required to go from empty workspace to recording the first donation within an hour.
- **Acceptance hints:**
  - Step-by-step onboarding doc referencing metadata runbook, smoke test, Gift Aid setup.
  - Dry run results captured with timestamps to prove the time-box.
  - Gaps or tooling requests escalated to Engineering.

### 11. Historical Import Drill (50k Donations)
- **Owner:** Engineering
- **Goal:** Validate bulk import tooling and rollup rebuild paths at the scale promised in success criteria.
- **Acceptance hints:**
  - Test dataset prepared (dummy or anonymised) with at least 50k donation rows.
  - Import script/flow documented; rollups verified after load without manual trigger toggling.
  - Runtime/performance notes and mitigation strategies captured.

### 12. Twenty Feature Audit (Fundraising Lens)
- **Owner:** Product
- **Goal:** Evaluate Twenty-native capabilities (workflows, reports, dedupe, list views, etc.) against nonprofit fundraising expectations.
- **Acceptance hints:**
  - Checklist of exercised features with pass/fail notes.
  - Identified gaps or workarounds documented with suggested ownership (Twenty vs. extension).
  - Comparison summary for future Supabase/custom fallback analysis.

### 13. Managed Extension Decision Spike (Households, Funds, Portal)
- **Owner:** Product + Engineering
- **Goal:** Resolve short-term defaults for open architectural decisions (household default state, allocation/fund placement, portal starter approach) while documenting reversible rationale.
- **Acceptance hints:**
  - Workshop/notes covering options, near-term recommendation, and rollback path for each decision.
  - Interim defaults recorded in `DECISIONS.md` (or draft ADR) with TODOs for revisit triggers.
  - Follow-on implementation tickets opened if configuration work is required for Phase 1 delivery.
- **Notes:** Time-boxed spike; aim for decisions that keep the POC lean without closing future doors.

### 14. Gift Schema & Staging Alignment
- **Owner:** Engineering + Product
- **Goal:** Harmonise the managed-extension `Gift` payload with staging/attribution expectations so intake, reconciliation, and pipeline specs stay in sync.
- **Acceptance hints:**
  - Field map documented across fundraising-service proxy, staging tables, and Twenty metadata (covering amount fields, attribution IDs, external references).
  - Prototype payload exercised through `/api/fundraising/gifts` and staging validation to confirm compatibility.
  - Follow-up implementation tickets raised for required schema migrations or proxy adjustments.
- **Notes:** Reference `docs/features/donation-intake.md`, `docs/features/opportunities-gifts.md`, and `docs/features/donation-reconciliation.md` before locking names/enums.

### 15. Opportunity MVP Scaffolding
- **Owner:** Engineering
- **Goal:** Stand up the minimal `Opportunity` object, rollups, and defaults needed to support the pipeline flows described in the Opportunities & Gifts spec.
- **Acceptance hints:**
  - Metadata outline committed (stage enum, commitment fields, defaults, read-only rollups).
  - Draft API/UI story showing how a Gift links back to an Opportunity without bypassing staging rules.
  - Explicit dependency recorded on Ticket 14 (schema alignment) before implementation starts.
- **Notes:** Keep scope to core pipeline (grants/HNW/legacy); schedules and deliverables stay behind feature flags per roadmap.

### 16. Recurring Agreement Handshake Spike
- **Owner:** Engineering
- **Goal:** Validate the event flow from Stripe/GoCardless agreements into Gifts so recurring donations can reuse the same ingestion path.
- **Acceptance hints:**
  - Sequence diagram or prototype covering agreement creation, webhook events, and resulting Gift records.
  - Gaps identified in provider metadata storage or Gift payload fields captured with remediation tickets.
  - Receipting/Gift Aid touchpoints reconciled with `docs/features/recurring-donations.md`.
- **Notes:** Dependent on Ticket 14; focus on one provider first (Stripe or GoCardless) to prove the path.

## Phase 2 – Volunteers

### 17. Volunteer Metadata & Rollup Blueprint
- **Owner:** Engineering
- **Goal:** Design the volunteer object model (Opportunity, Job, Shift, Attendance) and confirm rollup approach before implementation.
- **Acceptance hints:**
  - Draft metadata schema + ERD committed.
  - Rollup requirements documented (hours, active volunteers) with technical approach chosen.
  - Dependencies on households/contact model resolved.

### 18. Volunteer Signup Experience Prototype
- **Owner:** Product
- **Goal:** Define the minimal public signup flow or portal page for volunteers and validate usability.
- **Acceptance hints:**
  - Wireframes or low-code prototype demonstrating signup to shift confirmation.
  - Accessibility/privacy considerations captured.
  - Implementation tickets split (gateway vs. separate starter kit).

### 19. Volunteer Reporting & Compliance
- **Owner:** Engineering + Product
- **Goal:** Outline reporting needs (hours served, churn) and consent handling for volunteer data.
- **Acceptance hints:**
  - Reporting matrix documented with required fields.
  - GDPR/consent approach extended from fundraising module.
  - Follow-up development issues created.

## Phase 3 – Grants (Incoming)

### 20. Grants Metadata & Workflow Design
- **Owner:** Engineering
- **Goal:** Capture the grant pipeline (application → award → payment schedule) and required metadata.
- **Acceptance hints:**
  - Object/field list with statuses, deliverables, reminders documented.
  - Alignment with allocations/fund decision recorded.
  - Integration touchpoints with fundraising rollups mapped.

### 21. Grants Reporting & Renewal Hooks
- **Owner:** Product
- **Goal:** Define dashboards and renewal nudges for grants to ensure early ROI.
- **Acceptance hints:**
  - Dashboard outlines (pipeline, award conversion) drafted.
  - Renewal automation concept note created.
  - Dependencies on payment schedules identified.

## Phase 4 – Programs/Services

### 22. Program Schema & Bulk Entry Planning
- **Owner:** Engineering
- **Goal:** Plan program/enrollment/service delivery objects with bulk entry ergonomics.
- **Acceptance hints:**
  - Metadata outline with optional outcome object documented.
  - Bulk entry UX constraints captured in coordination with Product.
  - Data retention requirements listed.

### 23. Impact Reporting Foundations
- **Owner:** Product + Data
- **Goal:** Define baseline dashboards/metrics for people served and services delivered.
- **Acceptance hints:**
  - KPI list agreed, with data sources mapped.
  - Mock dashboard or spreadsheet prototype shared.
  - Outcome tracking go/no-go documented (ties to Section 11 decision).

## Cross-Phase & Platform

### 24. AI Feasibility Spike
- **Owner:** Engineering + AI
- **Goal:** Prototype one AI-first interaction (e.g., generated donor summary or chat-driven CRUD) using data pulled from Twenty.
- **Acceptance hints:**
  - Running script or endpoint demonstrating the interaction.
  - Architecture notes covering model choice, deployment, security, and future scaling concerns.
  - Wishlist of additional AI-first behaviours (dup detection, conversational workflow) captured in docs.
- **Notes:** Keep scope narrow—show feasibility, not production polish.

### 25. Twenty Upgrade Probe
- **Owner:** Engineering
- **Goal:** Trial newer Twenty image tags, re-run smoke tests, and capture outcomes (especially Metadata API behaviour).
- **Acceptance hints:**
  - Upgrade experiment notes (tag tested, results, revert if necessary).
  - `DECISIONS.md` updated with findings/plan.
  - Follow-up items opened if regressions occur.
- **Status (2025-09-30):** Successfully upgraded from `v1.4.0` to `v1.5.3`. The process is now documented in `docs/DOCKER_ENV_APPROACH.md`. A smoke test failure was identified and fixed during the upgrade.

### 26. Vision & Plan-B Documentation Refresh
- **Owner:** Product
- **Goal:** Keep strategic docs current—codify AI-first roadmap, manage extension rationale, and fallback triggers.
- **Acceptance hints:**
  - Updated DECISIONS.md / supporting docs with continue vs. pivot checkpoints.
  - Explicit list of signal events that trigger a reevaluation (e.g., Metadata API still blocked after X releases).
  - Summary ready for stakeholder review.

### 27. Gateway & Runbook Parity Check
- **Owner:** Engineering
- **Goal:** Ensure operational docs (Docker/env approach, runbooks) reflect current compose configuration and health checks.
- **Acceptance hints:**
  - Review gateway/gateway-src healthchecks vs docs, fix discrepancies.
  - Runbook updated with realistic start/stop/diagnose steps.
  - Outstanding doc tickets opened if parity gaps remain.

### 28. Data Model Documentation Maintenance
- **Owner:** Product + Engineering
- **Goal:** Keep `docs/data-model/` in lockstep with feature specs and backlog decisions so modules stay decoupled.
- **Acceptance hints:**
  - Review cadence agreed (e.g., during backlog grooming) and noted in the runbook.
  - Recent feature updates reflected in the relevant data-model files, with diff links or references captured.
  - Checklist added to backlog templates to remind contributors to update data-model docs when specs change.
- **Notes:** Covers Twenty core vs. nonprofit-specific modules (e.g., Households) until ownership is formalised.

---

_Maintainer: update this file as tickets progress or new findings alter priorities._
