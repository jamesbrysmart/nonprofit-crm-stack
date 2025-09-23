# POC Backlog (Managed Extension)

Working list of tickets focused on validating the Twenty-managed extension approach. Priorities are loosely ordered by learning value; adjust as needed.

## 1. Fundraising API Smoke Test
- **Goal:** Prove the end-to-end flow `gateway → fundraising-service → Twenty REST` works reliably with documented metadata prerequisites.
- **Acceptance hints:**
  - Scripted curl/Postman run creating and listing a gift through `/api/fundraising/gifts`.
  - Twenty shows the new record; response payload matches expectations.
  - Manual metadata setup (API or UI) captured in docs.
  - Logs reviewed, with open issues noted.
- **Notes:** Depends on the manual object/field setup; no local Postgres use.

## 2. Metadata Runbook & Release Watch
- **Goal:** Document programmatic provisioning of custom objects/fields and track Metadata API behaviour (especially relation fields) across Twenty releases.
- **Acceptance hints:**
  - Runbook covering API scripts (`/rest/metadata/objects`, `/rest/metadata/fields`) plus remaining UI steps for relation fields.
  - Table/log of Twenty versions tested, outcomes, links to Discord or support threads, and next actions.
  - Reminder or issue to re-test when new images drop.
- **Notes:** Include open question on relation/lookup field automation.

## 3. Twenty Feature Audit (Fundraising Lens)
- **Goal:** Evaluate Twenty-native capabilities (workflows, reports, dedupe, list views, etc.) against nonprofit fundraising expectations.
- **Acceptance hints:**
  - Checklist of exercised features with pass/fail notes.
  - Identified gaps or workarounds documented with suggested ownership (Twenty vs. extension).
  - Comparison summary for future Supabase/custom fallback analysis.

## 4. AI Feasibility Spike
- **Goal:** Prototype one AI-first interaction (e.g., generated donor summary or chat-driven CRUD) using data pulled from Twenty.
- **Acceptance hints:**
  - Running script or endpoint demonstrating the interaction.
  - Architecture notes covering model choice, deployment, security, and future scaling concerns.
  - Wishlist of additional AI-first behaviors (dup detection, conversational workflow) captured in docs.
- **Notes:** Keep scope narrow—show feasibility, not production polish.

## 5. Twenty API Resilience & Error Handling
- **Goal:** Decide and implement how fundraising-service handles transient failures from Twenty (retry/backoff/alert).
- **Acceptance hints:**
  - Short design note describing retry/backoff strategy and observability hooks.
  - Code updates around REST calls (e.g., retry wrapper, structured logging, TODO for DLQ/webhooks).
  - Manual failure simulation with expected logging/behavior captured.

## 6. Operational Hygiene & Runbook
- **Goal:** Ensure the stack is operable without heroics (health/readiness endpoints, logging, restart instructions).
- **Acceptance hints:**
  - `/health` and `/ready` semantics defined and documented.
  - Logging expectations (format, correlation IDs) captured.
  - Runbook snippet covering build/run/diagnose steps committed to docs.
- **Notes:** Consider removing unused Postgres services once confident.

## 7. Twenty Upgrade Probe
- **Goal:** Trial newer Twenty image tags, re-run smoke tests, and capture outcomes (especially Metadata API behaviour).
- **Acceptance hints:**
  - Upgrade experiment notes (tag tested, results, revert if necessary).
  - DECISIONS.md updated with findings/plan.
  - Follow-up items opened if regressions occur.

## 8. Vision & Plan-B Documentation Refresh
- **Goal:** Keep strategic docs current—codify AI-first roadmap, manage extension rationale, and fallback triggers.
- **Acceptance hints:**
  - Updated DECISIONS.md / supporting docs with continue vs. pivot checkpoints.
  - Explicit list of signal events that trigger a reevaluation (e.g., Metadata API still blocked after X releases).
  - Summary ready for stakeholder review.

---

_Maintainer: update this file as tickets progress or new findings alter priorities._
