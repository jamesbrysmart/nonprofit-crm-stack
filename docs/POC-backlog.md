# POC Backlog (Managed Extension)

Working list of tickets focused on validating the Twenty-managed extension approach. Organised by phase to keep delivery aligned with the roadmap. Update as work progresses.

## Phase 1 – Fundraising & Core CRM (MVP)

### 1. Fundraising API Smoke Test
- **Owner:** Engineering
- **Goal:** Prove the end-to-end flow `gateway → fundraising-service → Twenty REST` works reliably with documented metadata prerequisites.
- **Acceptance hints:**
  - Scripted curl/Postman run creating and listing a gift through `/api/fundraising/gifts`.
  - Twenty shows the new record; response payload matches expectations.
  - Manual metadata setup (API or UI) captured in docs.
  - Logs reviewed, with open issues noted.
- **Notes:** Depends on the manual object/field setup; no local Postgres use. `GATEWAY_BASE=http://localhost:4000 npm run smoke:gifts` (host) now automates create → list → get → update → delete and leaves a persistent record labelled "Persistent Smoke Test Gift" for UI verification. Inside containers you can omit the override.
**Status:** ✅ Delivered (Nov 2025). Keep the smoke script/runbook as regression tooling; revise only if proxy contract changes.
**Status:** ✅ Delivered (Nov 2025). Keep the script/runbook as regression tooling; no new work unless the proxy contract changes.

### 2. Fundraising Admin Gift Entry UI
- **Owner:** Engineering
- **Goal:** Deliver a lightweight fundraising-service UI that lets an internal admin create gifts (and required contact data) directly in Twenty while reusing the managed-extension proxy.
- **Acceptance hints:**
  - Page lives under the gateway (e.g., `/fundraising/admin/gifts/new`) and is protected by current stack auth assumptions.
  - Form captures mandatory Twenty fields (gift amount/date and minimal contact info) and posts through `/api/fundraising/gifts`.
  - Successful submissions surface confirmation with a link to the new Gift record in Twenty.
  - Follow-up notes captured for contact matching/deduping and future auth unification.
- **Notes:** UI + proxy now create a Person (via `/people`) then a Gift linked by `donorId`; success banner surfaces the gift ID. The UI is served via the gateway at `/fundraising/`. Next steps: add contact matching/dedupe, and tighten UI styling.
**Status:** ✅ Delivered (Dec 2025). Manual entry intentionally auto-promotes; follow-up improvements live under 2a/2b.

#### 2a. Manual Entry Donor Context Panel *(New)*
- **Owner:** Engineering + Product
- **Goal:** Surface recent gifts, recurring plans, and staged rows for the selected donor so admins can spot duplicates before submitting.
- **Acceptance hints:**
  - Summary card shows last gift date/amount plus active recurring agreements when a donor is selected.
  - Staging drawer mirrors the same context to support review decisions.
  - Additional lookups stay within documented performance budgets; caching strategy captured.
- **Notes:** Builds on the explicit donor confirmation UX shipped in Nov 2025.
**Status:** 🟡 Design captured, engineering pending (needs donor history API).

#### 2b. Manual Entry Duplicate & Coding Hardening *(New)*
- **Owner:** Engineering
- **Goal:** Extend duplicate protection to include recently committed gifts and ensure fund/appeal metadata survives the proxy when manual gifts auto-promote.
- **Acceptance hints:**
  - Selecting an existing donor checks both staging rows and committed gifts (amount/date window) with actionable warnings.
  - Fund/appeal inputs persist on the final Gift record; assumptions about Gift Aid/tracking scope documented in docs.
  - Regression tests cover autopromote + staged pathways.
- **Notes:** Captures gaps raised during Nov 2025 testing; keeps manual entry safe even without staging.

### 3. Gift Rollups & Dashboard Foundations
- **Owner:** Engineering
- **Goal:** Deliver deterministic rollups (lifetime, YTD/LY, first/last gift) and seed dashboards that satisfy Phase 1 reporting promises.
- **Acceptance hints:**
  - Rollup calculation path agreed (materialised or scheduled job) and tests cover edge cases (pledges, recurring gifts).
  - Dashboard JSON/templates committed; smoke data renders expected totals in Twenty.
  - Rollup rebuild procedure documented for post-import reconciliation.
- **Notes:** Reuse learnings from API smoke work; coordinate with Feature Audit for field availability.
**Status:** ✅ Delivered (rollup engine + Evidence slice live). Ongoing regression coverage tracked under item 24.

#### 3a. Gift Batch UX & Processing Follow-up *(New)*
- **Owner:** Engineering + Product
- **Goal:** Promote `giftBatch` to a first-class UI construct so admins can process one chunk at a time (batch cards, defaults, completion signal).
- **Acceptance hints:**
  - Summary chips expose open batches (counts + totals) and let admins focus the queue.
  - Drawer and processing actions respect batch context; batch completion indicator clears once all rows are committed.
  - Batch-level “Process all ready rows” guarded by validation/confirmation.
- **Notes:** Builds on the November summary-bar refactor; required groundwork for enhanced CSV/import tooling.

### 4. Payment/Form Connector Scaffolding
- **Owner:** Engineering
- **Goal:** Provide stubs or adapters so popular UK donation forms (e.g., JustGiving, PayPal) can post gifts through the proxy without bespoke code each time.
- **Acceptance hints:**
  - Documented webhook/REST shim for at least one provider with validation of required fields.
  - Configuration guide (environment variables/secrets) committed.
  - Follow-up tickets opened for additional providers once pattern validates.
- **Notes:** Depends on API reliability improvements and Gift model completeness.
**Status:** 🟡 Stripe checkout session path implemented; GoCardless + additional providers covered under item 23 before we expand scope.

#### 4a. CSV intake decision (2025-10-23)
- Rather than building a bespoke `/gift-staging/imports` shell, we will lean on **Twenty’s native CSV import app** for pilot tenants. CSV files will enter Twenty through the existing UI, and we will map the imported gifts into staging using the metadata provided by the platform.
- Follow-up engineering work focuses on documenting the Twenty import presets and ensuring imported rows land in the shared staging queue; no separate intake UI is planned unless the Twenty tool proves insufficient.

### 5. Gift Aid Export & Declaration UX
- **Owner:** Engineering + Product
- **Goal:** Ensure Gift Aid declarations are captured and a claim-ready export is available with minimal setup.
- **Acceptance hints:**
  - Declaration capture flow (API + UI guidance) documented with validation rules.
  - Export script/report template produces HMRC-ready CSV for sample data.
  - Consent/retention checklist cross-referenced in onboarding docs.
- **Notes:** Coordinates with GDPR tasks under Cross-phase; feeds the Phase 1 exit criteria.
**Status:** 🟡 Declaration capture guidance in place; export tooling still due.

### 6. Twenty API Resilience & Structured Logging
- **Owner:** Engineering
- **Goal:** Harden the proxy against transient failures and surface actionable telemetry.
- **Acceptance hints:**
  - Structured JSON logging with request IDs and retry metadata enabled.
  - Alerting or TODO path defined for repeated failures (manual drill log suffices for now).
  - Failure simulation captured in docs with expected behaviour.
- **Status:** JSON logs now include `requestId`, `event` (e.g., `twenty_proxy_attempt`, `twenty_proxy_retry`, `twenty_proxy_network_error`), and timing metadata; metrics TODO and DLQ/webhook backlog still outstanding.
**Status:** 🟡 Structured logging done; alerting/metrics + dead-letter strategy still open.

### 7. Operational Hygiene & Runbook
- **Owner:** Engineering
- **Goal:** Ensure the stack is operable without heroics (health/readiness endpoints, logging, restart instructions).
- **Acceptance hints:**
  - `/health` and `/ready` semantics defined and documented.
  - Logging expectations (format, correlation IDs) captured.
  - Runbook snippet covering build/run/diagnose steps committed to docs.
- **Status:** `docs/OPERATIONS_RUNBOOK.md` now documents startup/shutdown, health endpoints, and structured log fields; keep expanding with future procedures.
**Status:** 🟡 Continue expanding (reconciliation/connector troubleshooting).

### 8. Metadata Runbook & Release Watch
- **Owner:** Product + Engineering
- **Goal:** Document programmatic provisioning of custom objects/fields and track Metadata API behaviour (especially relation fields) across Twenty releases.
- **Acceptance hints:**
  - Runbook covering API scripts (`/rest/metadata/objects`, `/rest/metadata/fields`) plus remaining UI steps for relation fields.
  - Table/log of Twenty versions tested, outcomes, and next actions.
  - Reminder or issue to re-test when new images drop.
- **Status:** `docs/METADATA_RUNBOOK.md` documents script usage, manual lookup steps, and a release watch table; update as lookup automation unblocks.
**Status:** 🟡 Active; refresh when relation field automation unlocks or metadata schema changes.

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

### 21. Fundraising-service Refactor & Component Breakup *(New)*
- **Owner:** Engineering
- **Goal:** Reduce the size/complexity of key files (e.g., `ManualGiftEntry.tsx`, `GiftStagingService`, reconciliation drawer) so future changes are easier to reason about and test.
- **Acceptance hints:**
  - Extract shared hooks/components (currency/date helpers, donor panels, table utilities) with Jest coverage where practical.
  - Break backend services that exceed ~500 LOC into focused modules (e.g., staging list/filter logic vs. payload merge).
  - Document the refactor plan (order of files, risks) and ensure no behaviour regressions via smoke tests.
- **Notes:** Several files now exceed 1,000 LOC; this work unblocks faster iteration for testing + connectors.
  - *21a. API client helper*: create a shared `fetchJson` utility for `client/src/api.ts` + incremental refactor of the largest fetchers (gifts, payouts) with unit tests. Afterwards, split the module into per-domain files (`api/gifts.ts`, etc.) to keep code maintainable.

### 22. Recurring Agreement Parity for Manual/Auto Flows *(New)*
- **Owner:** Engineering
- **Goal:** Ensure gifts created outside the staging processor (manual entry auto-promote, connector auto-promote) still update recurring agreements (next expected date, status).
- **Acceptance hints:**
  - Manual entry + Stripe webhook paths trigger the same `RecurringAgreementService.updateAgreement` logic as staged rows.
  - Tests cover both paths; documentation updated to reflect the behaviour.
  - Observability (logs/metrics) added so support can confirm agreement updates.
- **Notes:** Today only the staging processor updates agreements; this caused gaps during Nov 2025 testing.

### 23. Connector Reliability & Test Harness *(New)*
- **Owner:** Engineering
- **Goal:** Harden Stripe/GoCardless ingestion with replay-safe validation, feature flags, and automated tests before expanding connector coverage.
- **Acceptance hints:**
  - Integration tests (or high-fidelity mocks) cover `checkout.session.completed` and representative GoCardless events.
  - Error handling (signature failures, missing metadata) produces actionable logs/toasts.
  - Backlog entries created for additional providers once the harness is in place.
- **Notes:** Stripe is partially wired; GoCardless currently logs only. No automated regression exists today.

### 24. Rollup Regression Suite *(New)*
- **Owner:** Engineering
- **Goal:** Add automated coverage for the rollup engine + Evidence dashboard so future schema changes don’t silently break KPIs.
- **Acceptance hints:**
  - Script populates sample data (one-off, recurring, refunds) and asserts rollup outputs via unit or integration tests.
  - Dashboard JSON checked into repo with expected values; docs updated with rebuild steps.
  - Hooks added to smoke pipeline (manual or CI) to run the suite.
- **Notes:** Complements item 3; ensures the delivered rollups remain trustworthy.

### 25. Reconciliation Automation & Audit *(New)*
- **Owner:** Engineering + Product
- **Goal:** Build on the new payout drawer by adding automated suggestions, audit logging, and rollup recalculations so finance can close payouts confidently.
- **Acceptance hints:**
  - Suggested gifts heuristics (date/amount/source) configurable per workspace; manual overrides logged.
  - Linking/unlinking writes audit entries (user, timestamp, variance deltas).
  - Rollup engine confirms matched/pending counts post-link; variance banners updated automatically.
- **Notes:** MVP drawer now supports manual linking; this follow-up hardens the workflow before pilot testing.

## Phase 2 – Volunteers

### 14. Volunteer Metadata & Rollup Blueprint
- **Owner:** Engineering
- **Goal:** Design the volunteer object model (Opportunity, Job, Shift, Attendance) and confirm rollup approach before implementation.
- **Acceptance hints:**
  - Draft metadata schema + ERD committed.
  - Rollup requirements documented (hours, active volunteers) with technical approach chosen.
  - Dependencies on households/contact model resolved.

### 15. Volunteer Signup Experience Prototype
- **Owner:** Product
- **Goal:** Define the minimal public signup flow or portal page for volunteers and validate usability.
- **Acceptance hints:**
  - Wireframes or low-code prototype demonstrating signup to shift confirmation.
  - Accessibility/privacy considerations captured.
  - Implementation tickets split (gateway vs. separate starter kit).

### 16. Volunteer Reporting & Compliance
- **Owner:** Engineering + Product
- **Goal:** Outline reporting needs (hours served, churn) and consent handling for volunteer data.
- **Acceptance hints:**
  - Reporting matrix documented with required fields.
  - GDPR/consent approach extended from fundraising module.
  - Follow-up development issues created.

## Phase 3 – Grants (Incoming)

### 17. Grants Metadata & Workflow Design
- **Owner:** Engineering
- **Goal:** Capture the grant pipeline (application → award → payment schedule) and required metadata.
- **Acceptance hints:**
  - Object/field list with statuses, deliverables, reminders documented.
  - Alignment with allocations/fund decision recorded.
  - Integration touchpoints with fundraising rollups mapped.

### 18. Grants Reporting & Renewal Hooks
- **Owner:** Product
- **Goal:** Define dashboards and renewal nudges for grants to ensure early ROI.
- **Acceptance hints:**
  - Dashboard outlines (pipeline, award conversion) drafted.
  - Renewal automation concept note created.
  - Dependencies on payment schedules identified.

## Phase 4 – Programs/Services

### 19. Program Schema & Bulk Entry Planning
- **Owner:** Engineering
- **Goal:** Plan program/enrollment/service delivery objects with bulk entry ergonomics.
- **Acceptance hints:**
  - Metadata outline with optional outcome object documented.
  - Bulk entry UX constraints captured in coordination with Product.
  - Data retention requirements listed.

### 20. Impact Reporting Foundations
- **Owner:** Product + Data
- **Goal:** Define baseline dashboards/metrics for people served and services delivered.
- **Acceptance hints:**
  - KPI list agreed, with data sources mapped.
  - Mock dashboard or spreadsheet prototype shared.
  - Outcome tracking go/no-go documented (ties to Section 11 decision).

## Cross-Phase & Platform

### 21. AI Feasibility Spike
- **Owner:** Engineering + AI
- **Goal:** Prototype one AI-first interaction (e.g., generated donor summary or chat-driven CRUD) using data pulled from Twenty.
- **Acceptance hints:**
  - Running script or endpoint demonstrating the interaction.
  - Architecture notes covering model choice, deployment, security, and future scaling concerns.
  - Wishlist of additional AI-first behaviours (dup detection, conversational workflow) captured in docs.
- **Notes:** Keep scope narrow—show feasibility, not production polish.

### 22. Twenty Upgrade Probe
- **Owner:** Engineering
- **Goal:** Trial newer Twenty image tags, re-run smoke tests, and capture outcomes (especially Metadata API behaviour).
- **Acceptance hints:**
  - Upgrade experiment notes (tag tested, results, revert if necessary).
  - `DECISIONS.md` updated with findings/plan.
  - Follow-up items opened if regressions occur.
- **Status (2025-09-30):** Successfully upgraded from `v1.4.0` to `v1.5.3`. The process is now documented in `docs/DOCKER_ENV_APPROACH.md`. A smoke test failure was identified and fixed during the upgrade.

### 23. Vision & Plan-B Documentation Refresh
- **Owner:** Product
- **Goal:** Keep strategic docs current—codify AI-first roadmap, manage extension rationale, and fallback triggers.
- **Acceptance hints:**
  - Updated DECISIONS.md / supporting docs with continue vs. pivot checkpoints.
  - Explicit list of signal events that trigger a reevaluation (e.g., Metadata API still blocked after X releases).
  - Summary ready for stakeholder review.

### 24. Gateway & Runbook Parity Check
- **Owner:** Engineering
- **Goal:** Ensure operational docs (Docker/env approach, runbooks) reflect current compose configuration and health checks.
- **Acceptance hints:**
  - Review gateway/gateway-src healthchecks vs docs, fix discrepancies.
  - Runbook updated with realistic start/stop/diagnose steps.
  - Outstanding doc tickets opened if parity gaps remain.

### 25. Settings & Feature Toggles (2025-10-23 update)
- **Decision:** Instead of building custom flag scaffolding inside fundraising-service, we will pilot feature toggles through Twenty’s **Applications** framework. Managed extension functionality (Gift Aid, reconciliation, receipts) will be exposed as app-level toggles that can be enabled per workspace.
- **Implication:** Engineering effort shifts to documenting which Twenty application (and metadata) must be installed, plus ensuring fundraising-service reads the workspace configuration before activating modules. No bespoke config UI is needed for the POC unless Twenty’s app toggles fall short.
- **Follow-up:** Capture the required application IDs/permissions in `docs/USER_RUNBOOK.md` / onboarding materials once the toggle map is finalised.

---

_Maintainer: update this file as tickets progress or new findings alter priorities._
- #### 4b. Recurring Agreement Insights Iteration *(New)*
- **Owner:** Engineering + Product
- **Goal:** Iterate on the recurring agreements triage view (exception widgets, drill-down, automation hooks).
- **Acceptance hints:**
  - Chips/filters persist across sessions; table supports pagination/search.
  - Agreement detail exposes quick actions (pause/resume/cancel) once API scaffolding lands.
  - Metrics feed downstream alerts/digests (e.g., Slack summary of overdue plans).
- **Notes:** Depends on agreement metadata automation; coordinate with dunning/delinquency initiatives.
