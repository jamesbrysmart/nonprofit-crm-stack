# UI / UX Notes (Working)

> Central scratchpad for user experience decisions across the managed fundraising extension. Keep this as the first stop for design discussions; once sections grow too large we can graduate them into dedicated docs under `docs/ui/`.

## 0. Project-Wide Principles (Placeholder)

- **Visual parity with Twenty:** default to Twenty’s minimalist styling—neutral palette, generous spacing, lightweight typography—so the transition between native CRM screens and managed extension views feels seamless. Match the Twenty design tokens for spacing (`4px` base grid), typography (Inter family), and surface treatments (subtle borders, soft elevation) until branding needs diverge.
- **Component reuse:** wherever possible, reuse (or faithfully replicate) Twenty UI patterns: table styling, badge treatments, form controls, toast behaviour. When a bespoke component is required, document why the shared Twenty UI library does not yet cover the need.
- **Tone & copy:** keep microcopy concise and supportive. Use sentence case, follow Twenty’s existing voice (“clear, action-oriented, never cute”), and log deviating wording in release notes for localisation.
- **Motion & feedback:** reserve animation for reinforcing state change (e.g., drawer slide, skeleton loading). If we add new motion, note timing/curve defaults so engineering can align with Emotion keyframes.
- **Responsiveness:** admins will mostly use desktop, but basic responsiveness should prevent layout collapse on narrower windows. Define breakpoints up front (desktop ≥ 1440px, compact desktop 1024–1439px, tablet stretch 768–1023px).
- **Accessibility:** follow WCAG AA conventions (focus states, colour contrast, aria labels). Call out any intentional exceptions (e.g., temporary colour tokens) with a remediation date.
- **Design debt log:** track provisional decisions directly in this doc (⚠️ marker + revisit trigger) so we can quickly find assumptions to revisit once MVP slices ship.
- **Brand overlays:** defer any unique Fundraising theme variations; mirror Twenty light theme today and note future opportunities for co-branding once we validate the admin workflows.

---

## 1. Fundraising Managed UI Notes

> Working outline for the internal UI that supports the fundraising staging → processing flow. This supplements the feature specs and keeps visual/interaction decisions deliberate so we do not ship a placeholder that becomes legacy debt.

### 1.1 Current slice (2025-10-23)

- **Manual gift entry** now includes a supporter search drawer: inline duplicate rows surface exact/review/partial matches with badges, while the “Search supporters…” modal queries the wider directory before the form allows save. Selecting a supporter pins a summary card above contact inputs.
- **Recurring toggle** adds a lightweight picker filtered to the most recent Twenty `RecurringAgreement` objects so staff can attach manual installments without pasting IDs; the control disappears again once unchecked to keep the form lean.
- **Duplicate guardrails** warn when a staged gift already exists for the same supporter/amount/date, reinforcing the “don’t double enter” flow before submission. (Committed-gift lookup still todo.)
- **Staging queue** renders status pills plus row-level actions, with a detail drawer supporting inline edits (amount, coding, batch, notes), status transitions (“Mark ready”, “Process now”), and donor reassignment shortcuts that call back into Twenty duplicates diagnostics.
- **Recurring health widget** in the queue header provides a quick read on pending vs auto-promoted installments and latest webhook activity so admins can spot integration drift without leaving the page.

## 1. Scope & Audience

- **Primary user:** Back-office fundraiser / operations teammate reviewing staged gifts before they post to Twenty.
- **Environment:** Bundled with the existing fundraising-service Vite client for now (same auth story), but design should stand alone in case we later extract the tool.
- **Hosting assumption:** Lives under the authenticated `/fundraising` admin area; no separate shell or login experience planned for MVP.
- **Goals for the MVP UI:**
  1. Surface staged gifts with enough context to decide “approve, fix, process, or ignore”.
  2. Provide quick links into detail (raw payload, normalised fields, validation/dedupe diagnostics).
  3. Trigger the relevant API calls (`PATCH /gift-staging/:id/status`, `POST /gift-staging/:id/process`) with clear feedback.

## 2. Core Views

### 2.1 Review Queue (List/Table)

Columns (initial set):
- `stagingId` (link to detail drawer)
- `createdAt` / elapsed time
- Donor preview (name/email if resolved; highlight “unresolved contact”)
- Amount + currency
- `validationStatus`, `dedupeStatus`, `promotionStatus` (rename displayed to “Processing Status”)
- Intake source (manual UI, Stripe, CSV, etc.)
- `giftBatchId` (if present) with tooltip showing batch label/risk
- Error detail (only when status = `commit_failed`), truncated with tooltip/full view

Interactions:
- Filters for common queues: `ready_for_commit`, `commit_failed`, `pending_review`.
- Bulk action seed (checkbox column) but actual multi-select defer until we validate need.
- Per-row actions (icon buttons):
  - “Mark ready” → sets `promotionStatus=ready_for_commit`
  - “Process now” → calls new processing endpoint (Disable button when already `committing`)
  - “Retry” → only visible when `commit_failed`
  - “Edit” → opens detail drawer with editable fields (see below)

Empty states:
- Show friendly guidance when there are zero staged gifts.
- When API errors, present toast + inline error panel (avoid silent failures).
- _Implementation status:_ thin read-only table now surfaces latest staging rows (no filters/actions yet). Style and component alignment with Twenty tokens still pending.

### 2.2 Detail Drawer (or modal)

Sections:
- **Summary:** same top metadata as list row + status badges.
- **Normalized payload:** editable fields we allow staff to tweak before re-processing (amount, date, contact overrides, attribution). Save operates via `PATCH /gift-staging/:id/status` with updated payload (remember to hydrate `rawPayload` from the service if UI sends only delta).
- **Diagnostics:** show raw validation/dedupe errors, history of status changes (if/when we capture).
- **Raw payload viewer:** collapsible JSON viewer for support/debugging (read-only).
- _Implementation status:_ drawer now loads basic metadata + raw payload (read-only). Editing/actions still TODO; copy/status badges will be aligned with Twenty styling in a follow-up slice.
- _Duplicate diagnostics:_ raw payload includes `dedupeDiagnostics` (match type, donor id, candidates). Drawer surfaces this context; future work will add reassignment controls for partial matches.
- _Platform reuse:_ Duplicate checks lean on Twenty's `/people/duplicates`; managed UI only adds context and review controls per the project guiding principles (`docs/PROJECT_CONTEXT.md` §3a).
- _Future config:_ Plan a simple “matching profile” toggle so orgs can refine duplicate rules/thresholds without code changes once the admin surface exists.

Actions inside drawer:
- “Save draft” → `PATCH /gift-staging/:id/status` with edits, keep status `pending`.
- “Mark ready for processing” → status + optional comment field (future).
- “Process now” → same as list action but gives inline success/error confirmation.

### 2.3 Toasts / Inline Feedback

- Success message includes new gift ID when processing succeeds.
- Failure toast summarises reason and points user back to error detail.
- Consider global snackbar queue so repeated actions don’t overlap.

### 2.4 Manual Gift Entry (Thin Slice)

- **Purpose:** Ship a minimal manual entry surface that exercises the full staging pipeline end-to-end (create staging record → run validation/dedupe → process into Gifts).
- **Fields in scope:** Donor first/last name, optional email, amount, currency (pre-filled to GBP), gift date (defaults to today). Everything else (fund, appeal, Gift Aid, batch context) flagged as ⚠️ follow-up.
- **Interaction notes:**
  - Inline dedupe check runs before staging write to catch obvious duplicates (reuse existing `/people/duplicates` POST).
  - On submit without duplicates, call new staging entry endpoint (vs. current direct `/gifts` mutation). Capture staging ID for subsequent actions.
  - When duplicates surface, force user to choose existing contact or continue with new contact; UX mirrors current placeholder form but style it with Twenty components and accessible copy.
  - After staging record creation, surface processing status in-context (toast + inline summary linking to staging review drawer once built).
- **Differences vs. integrations/CSV:** For non-manual sources, dedupe occurs post-staging. Document this split so we avoid conflating flows later.
- **Placeholder audit:** The existing `/fundraising` Vite form posts directly to `POST /api/fundraising/gifts` and should be treated as reference only for behaviour (not layout). Replace once the staging-based flow lands.

## 3. API & Data Notes

- **Listing endpoint:** we do not yet have a dedicated `GET /gift-staging` proxy. Options:
  - Quick path: expose a read endpoint in fundraising-service that proxies Twenty’s metadata list (with filters). Needs pagination + sorting for list performance.
  - Longer-term: shift to local mirror once operational DB lands (per `ARCHITECTURE.md`).
- **Field naming:** backend still uses `promotionStatus`. UI should present it as “Processing Status” but maybe keep the raw key visible somewhere for debugging until metadata rename happens.
- **Error detail:** new `errorDetail` string is already persisted when processing fails—UI should display this prominently.
- **Permissions:** reuse whatever auth we apply to the admin gift form for now; flag follow-up for role-based access (only staff with staging rights should see these controls).
- **Batch context:** we only store `giftBatchId`. If we want to show batch label/risk we either query Twenty for the metadata or cache it locally.

## 4. Out of Scope (for this slice)

- Full batch management (bulk approve/process).
- Advanced filtering (date range, amount ranges, search by donor) beyond basic status filters.
- Multi-tenant theming / white-label.
- Upload/import UI (CSV prep) – tracked separately.
- Dashboard widgets summarising staging counts (nice to have later).

## 5. Design TODOs / Decisions

| Item | Status | Notes |
| --- | --- | --- |
| High-level wireframe (list + detail) | Pending | Create lightweight mock in Figma or even ASCII sketch before coding. |
| API contract for list endpoint | Pending | Decide whether to implement new controller in fundraising-service vs. rely on Twenty REST filters. |
| Edit fields allowed | Pending | Align with validation rules (we shouldn’t let users edit derived fields without recalculating `amountMinor`, etc.). |
| Status terminology in UI | Confirmed | Display “Processing Status”, “Validation Status”, “Duplicate Check”, map from existing enum names. |
| Autosave vs. explicit save | Pending | MVP can stick with explicit “Save changes” to avoid accidental writes. |
| Loading states | Pending | Need skeleton rows or spinner to avoid blank flash. |

## 2. API Requirements for Staging UI (Draft)

### 2.1 `GET /gift-staging`

- **Purpose:** Fetch paginated staging records for review queue.
- **Query params (proposed):**
  - `status` (`ready_for_commit`, `commit_failed`, `pending`, etc.) – optional, multi-value allowed.
  - `intakeSource` – optional filter by source.
  - `search` – optional string that matches staging ID, donor name/email, or external ID.
  - `limit` (default 25), `cursor` (opaque string) for pagination.
  - `sort` – default `createdAt:desc`, allow `createdAt:asc`, `amountMinor:desc`.
- **Response shape (per entry):**
  ```jsonc
  {
    "id": "stg_123",
    "createdAt": "2025-10-08T12:34:56Z",
    "updatedAt": "2025-10-08T12:35:10Z",
    "processingStatus": "ready_for_commit",       // maps from promotionStatus
    "validationStatus": "passed",
    "dedupeStatus": "passed",
    "errorDetail": "network error",               // nullable
    "intakeSource": "stripe_webhook",
    "sourceFingerprint": "stripe:pi_123",
    "externalId": "pi_123",
    "giftBatchId": "batch_001",                   // nullable
    "autoPromote": false,
    "amountMinor": 12345,
    "currency": "GBP",
    "dateReceived": "2025-10-08",
    "paymentMethod": "card",
    "giftAidEligible": false,
    "donorId": "person_456",                      // nullable
    "donorPreview": { "name": "Sam Example", "email": "sam@example.org" }, // derived if available
    "fundId": null,
    "appealId": null,
    "rawPayloadAvailable": true                   // avoid sending full blob on list view
  }
  ```
- **Pagination envelope:**
  ```jsonc
  {
    "data": [...],
    "meta": {
      "nextCursor": "opaque",
      "hasMore": true
    }
  }
  ```
- **Implementation notes:**
  - Start with a simple proxy to Twenty’s `/giftStagings` REST endpoint; map fields into the shape above.
  - Exclude `rawPayload` from list response (fetch on detail by ID).
  - Provide derived `processingStatus` string; keep raw `promotionStatus` internal.
  - If Twenty lacks `createdAt`/`updatedAt`, fall back to timestamps stored in staging payload or omit until schema updated.

### 2.2 `GET /gift-staging/:id`

- Already exists via `GiftStagingService.getGiftStagingById`; extend the controller to expose it publicly if required by UI (returns full payload + raw JSON).

### 2.3 Mutations

- Reuse existing endpoints:
  - `PATCH /gift-staging/:id/status` – update statuses + payload edits.
  - `POST /gift-staging/:id/process` – trigger processing.
- These already return `{ ok: true }` and `{ status: ... }`; UI should interpret the responses and refetch the row to reflect new state.

### 2.4 `POST /gift-staging`

- Manual entry slice requires a lightweight `POST /gift-staging` (or equivalent proxy helper) to create a staging record directly from the admin UI.
- Payload (MVP): `donor` block (either `{ contactId }` or `{ firstName, lastName, email? }`), `amountMinor`, `currency`, `dateReceived`. Include `intakeSource = manual_ui` for downstream filtering.
- Response should return the newly created `stagingId` plus current statuses so the client can immediately poll/process without refetching the list.
- ⚠️ Confirm idempotency expectations (e.g., hash on donor+date+amount) before launch; document behaviour if the service returns an existing staging record instead of creating a duplicate.

## 3. Implementation Checklist (First UI Slice)

1. **API layer**
   - [ ] Implement `GET /gift-staging` controller/service method.
   - [ ] Confirm we can surface donor preview (may require additional lookup or storing when staging).
   - [ ] Add integration test covering filtering + pagination (or at least unit for service mapping).

2. **UI groundwork**
   - [ ] Scaffold new route/page in Vite client (e.g., `/admin/staging`).
   - [ ] Build list table with status filters and fetch hook hitting the new endpoint.
   - [ ] Implement detail drawer skeleton with raw payload accordion.
   - [ ] Wire actions (`mark ready`, `process`, `retry`) using existing endpoints with toast feedback.

3. **Polish / follow-ups**
   - [ ] Add loading/empty/error states.
   - [ ] Decide on formatting helpers (currency, date).
   - [ ] Document workflow in `docs/OPERATIONS_RUNBOOK.md` once UI is usable.

## 4. Manual Single-Gift E2E Walkthrough (Provisional)

1. **Preconditions**
   - Seed mandatory metadata (default fund, currency config) and ensure staging service exposes `POST /gift-staging`, `POST /gift-staging/:id/process`, and duplicate lookup endpoints.
   - Confirm auth: fundraising admin logs into existing Vite client at `/fundraising`.
2. **Flow**
   - Open manual entry page → populate donor name, optional email, amount (GBP) and submit.
   - If duplicates surface, select an existing contact or choose “create new contact” to proceed.
   - On successful staging create, immediately trigger “Process now” and display inline toast with gift ID plus link to staging detail (temporary: plain text summary until drawer ships).
3. **Verification**
   - Fetch staging record by ID to ensure `promotionStatus` progressed to `committed`.
   - Retrieve resulting gift via Twenty API and confirm amount, donor linkage, and timestamps.
   - Record findings (screenshots/logs) in `REPORTING_EVIDENCE.md` or linked test run so we can reuse the scenario during regressions.

_Future enhancements_: batch selection, advanced filtering, inline field editing (requires careful validation), and integration with eventual operational mirror if/when we adopt it.

## 5. Communication & Follow-up

- Note in release checklist: endpoint rename `/promote` → `/process` means older tooling must update (already called out in README/runbook).
- Once UI slice lands, update `docs/OPERATIONS_RUNBOOK.md` with screenshots / quick steps for staging review.
- Record open questions in `POC-backlog.md` (Phase 1) so UI work ties into the main roadmap.

## 6. Open Questions & Follow-ups

- ⚠️ Confirm staging creation idempotency rules for manual UI vs. imports; document expected error when a duplicate staging row is blocked.
- ⚠️ Decide where the manual entry page lives in information architecture (sidebar item vs. dashboard link) before adding nav affordances.
- ⚠️ Explore whether processing feedback should eventually deep-link into the Twenty gift detail or a managed-extension receipt page.
- ⚠️ Placeholder `/fundraising` form: capture its remaining gaps (no staging, limited styling) and remove once the new slice lands to avoid ambiguity for testers.

_Keep this document updated while the UI spec evolves. When the design hardens or moves into a formal spec repo, archive or cross-link accordingly._
