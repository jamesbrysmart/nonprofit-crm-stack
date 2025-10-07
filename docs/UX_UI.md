# UI / UX Notes (Working)

> Central scratchpad for user experience decisions across the managed fundraising extension. Keep this as the first stop for design discussions; once sections grow too large we can graduate them into dedicated docs under `docs/ui/`.

## 0. Project-Wide Principles (Placeholder)

- **Visual parity with Twenty:** default to Twenty’s minimalist styling—neutral palette, generous spacing, lightweight typography—so the transition between native CRM screens and managed extension views feels seamless.
- **Component reuse:** wherever possible, reuse (or faithfully replicate) Twenty UI patterns: table styling, badge treatments, form controls, toast behaviour.
- **Responsiveness:** admins will mostly use desktop, but basic responsiveness should prevent layout collapse on narrower windows.
- **Accessibility:** follow WCAG AA conventions (focus states, colour contrast, aria labels).
- _To flesh out_: tone/voice for inline copy, animation usage, dark-mode stance, icon set decisions.

---

## 1. Fundraising Managed UI Notes

> Working outline for the internal UI that supports the fundraising staging → processing flow. This supplements the feature specs and keeps visual/interaction decisions deliberate so we do not ship a placeholder that becomes legacy debt.

## 1. Scope & Audience

- **Primary user:** Back-office fundraiser / operations teammate reviewing staged gifts before they post to Twenty.
- **Environment:** Bundled with the existing fundraising-service Vite client for now (same auth story), but design should stand alone in case we later extract the tool.
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

### 2.2 Detail Drawer (or modal)

Sections:
- **Summary:** same top metadata as list row + status badges.
- **Normalized payload:** editable fields we allow staff to tweak before re-processing (amount, date, contact overrides, attribution). Save operates via `PATCH /gift-staging/:id/status` with updated payload (remember to hydrate `rawPayload` from the service if UI sends only delta).
- **Diagnostics:** show raw validation/dedupe errors, history of status changes (if/when we capture).
- **Raw payload viewer:** collapsible JSON viewer for support/debugging (read-only).

Actions inside drawer:
- “Save draft” → `PATCH /gift-staging/:id/status` with edits, keep status `pending`.
- “Mark ready for processing” → status + optional comment field (future).
- “Process now” → same as list action but gives inline success/error confirmation.

### 2.3 Toasts / Inline Feedback

- Success message includes new gift ID when processing succeeds.
- Failure toast summarises reason and points user back to error detail.
- Consider global snackbar queue so repeated actions don’t overlap.

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

_Future enhancements_: batch selection, advanced filtering, inline field editing (requires careful validation), and integration with eventual operational mirror if/when we adopt it.

## 6. Communication & Follow-up

- Note in release checklist: endpoint rename `/promote` → `/process` means older tooling must update (already called out in README/runbook).
- Once UI slice lands, update `docs/OPERATIONS_RUNBOOK.md` with screenshots / quick steps for staging review.
- Record open questions in `POC-backlog.md` (Phase 1) so UI work ties into the main roadmap.

_Keep this document updated while the UI spec evolves. When the design hardens or moves into a formal spec repo, archive or cross-link accordingly._
