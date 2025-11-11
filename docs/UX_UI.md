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

### 1.1 Current slice (2025-11-04)

- **Manual gift entry** now requires an explicit donor confirmation: inline matches surface exact/review/partial suggestions with badges, the “Search donors…” modal handles deep lookups, and the donor summary card offers a one-click “Clear” so admins can back out before saving. Leaving the card empty creates a new donor at submission.
- **Recurring toggle** adds a lightweight picker filtered to the most recent Twenty `RecurringAgreement` objects so staff can attach manual installments without pasting IDs; the control disappears again once unchecked to keep the form lean.
- **Duplicate guardrails** warn when a staged gift already exists for the same donor/amount/date, reinforcing the “don’t double enter” flow before submission. (Committed-gift lookup still todo.)
- **Staging queue** opens with status/intake/batch summary chips, a lean table (ID · donor · amount · updated · status · source · alerts), and a drawer-first “Review → Process” workflow. Contextual quick actions (e.g., “Process now” only when ready) keep the row surface calm.
- **Recurring agreements tab** pivots to exception buckets (overdue, paused/canceled, delinquent) with filter chips and status pills so admins triage the riskiest plans first.

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

Columns (current):
- `stagingId` (link to detail drawer)
- Donor summary (name/email/id when resolved, “Pending donor resolution” otherwise)
- Amount (currency-aware)
- Last updated timestamp
- Processing status pill (Pending / Needs review / Ready / Commit failed / Committed)
- Intake source with inline batch badge (if `giftBatchId` present)
- Alert stack (duplicate / unresolved donor / recurring / duplicate warning)

Interactions:
- Summary chips surface status totals, intake sources, and gift batches; “Duplicates” toggle and recurring-agreement search box round out the filters.
- Primary row action is **Review**, which opens the detail drawer; contextual buttons (“Process now”, “Retry”) only appear when appropriate.
- Drawer owns status transitions, donor reassignment, attribution edits, and processing.

Empty states:
- Friendly “you’re caught up” guidance when filters produce zero rows.
- Inline error panel (plus toast) when list fetch fails.
- _Implementation status:_ summary chips + lean table + drawer-first workflow landed in the 2025-11 slice; bulk/batch processing still on the roadmap.

### 2.2 Detail Drawer (or modal)

Sections:
- **Overview:** mirrors list metadata (status pill, intake, batch) with alerts called out at the top.
- **Editable fields:** amount/date, attribution (fund/appeal/batch), donor overrides when allowed. Saves via `PATCH /gift-staging/:id` (`rawPayload` hydration handled server-side).
- **Diagnostics:** validation/dedupe messages, webhook metadata, status history (when available).
- **Raw payload viewer:** collapsible JSON viewer for support/debugging (read-only).
- _Implementation status:_ overview + edit controls + processing buttons are live; status history remains TODO. Duplicate reassignment leans on `dedupeDiagnostics` from Twenty; we surface controls for partial matches inside the drawer.
- _Future config:_ planned matching-profile toggle to adjust duplicate thresholds without code changes once the admin surface exists.

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

## 7. Tailwind Exploration (Draft)

> We are evaluating Tailwind for the fundraising-service client so upcoming UI/UX sessions can iterate faster without forking too far from Twenty’s native look.

### 7.1 Why consider Tailwind now

- Manual entry + queue views already implement a bespoke utility stack in `styles.css`, which mirrors Twenty tokens (Inter, slate/navy neutrals, cobalt primary) but requires hand-tuning every time we add a slice. Tailwind could give us a structured utility layer while keeping those tokens centralised.
- The Project Context (§3) stresses sane defaults, simple rollups, and extensibility; Tailwind’s design-token config lets us codify those defaults once and reuse them across future modules (Volunteers, Grants) without restyling from scratch.
- Twinning Tailwind’s utility classes with our existing UI spec makes it easier for non-specialist contributors (or AI pairers) to ship pixel-consistent components because spacing/typography decisions live in config rather than bespoke CSS blocks.

### 7.2 Guardrails

1. **Mirror Twenty tokens first.** Define custom colors/spacing/typography in `tailwind.config.js` that match today’s CSS variables (e.g., background `#f8fafc`, text `#0f172a`, primary `#2563eb`, border `#e2e8f0`) so the managed UI still feels native.
2. **Opt-in per view.** Start by layering Tailwind into the Vite client for new review-queue surfaces; keep legacy CSS modules in place until a slice is reworked, avoiding a risky big-bang rewrite.
3. **Document component recipes.** When we convert a pattern (forms, drawers, summary pills), capture the Tailwind class mixins here so engineers can copy/paste with minor data binding.
4. **Respect bundle/runtime constraints.** Confirm PostCSS + Tailwind build fits within the existing Vite setup and that tree-shaking keeps the CSS payload close to the current hand-written file size.

### 7.3 Pilot To-dos

- Add Tailwind dependencies + build wiring to `services/fundraising-service/client` (Vite) with base/styles/components imports plus autogenerated `tailwind.css`.
- Create a `tokens.css` (or Tailwind `theme.extend`) mapping for typography, palette, radius, shadows that match the current manual styles so we can diff outputs before flipping switches.
- Rebuild one contained slice (manual entry form + duplicate panel) using Tailwind utilities only; verify the rendered UI matches the current `styles.css` outputs and note any deltas in this doc.
- Stress-test recurring agreements tab + queue table with responsive Tailwind classes to prove we can hit the responsiveness goals listed in §0 without bespoke media queries.

### 7.4 Open Questions

- Should we keep a lightweight global stylesheet for semantic elements (`body`, `main`) even after Tailwind lands, or move everything into utility classes?
- Do we need a Twenty-flavoured component library (e.g., wrappers for buttons, pills) on top of Tailwind to avoid class soup, or can we rely on `@apply` and `clsx` helpers?
- How do we want to expose Tailwind tokens to other services (e.g., eventual volunteer portal) so we do not fork configs per package?

### 7.5 Usage Guidelines (Draft)

- **Scope:** Tailwind only rides in `services/fundraising-service/client`; we do *not* add it inside the Twenty core repo.
- **Theme mirroring:** Configure `tailwind.config.js` to replicate the Twenty tokens already defined in `styles.css` (Inter font stack, 4px spacing grid, cobalt primary, slate neutrals, existing radii/shadows). Any new colour/spacing token must be added to the config before use—no inline hex/rgb shortcuts.
- **Component layer:** Common UI atoms live in `@layer components` with semantic `.f-*` classes such as `.f-page`, `.f-card`, `.f-heading-sm`, `.f-heading-md`, `.f-text-muted`, `.f-badge`, `.f-pill-status--{state}`. These encode typography, border, radius, and elevation so JSX stays readable.
- **Utilities vs. components:** Reach for the `.f-*` component classes whenever a pattern appears in multiple views. Reserve Tailwind utilities in JSX for local layout needs (e.g., `flex`, `grid`, `gap-*`, `justify-*`). If we copy the same utility combo three or more times, promote it into the component layer.
- **Prefixing:** Optionally enable the `f-` Tailwind prefix (`f-flex`, `f-gap-4`, etc.) to guarantee our utilities cannot collide with future Twenty core CSS or browser defaults.
- **Readability bar:** Keep class strings intentional—ideally one or more `.f-*` semantic classes plus no more than ~3–5 structural utilities (layout/spacing/alignment). This keeps diffs small and ensures component intent is obvious during reviews.

### 7.6 Token Map (Current Styling Snapshot)

> Reference for the tokens we mirrored in `tailwind.config.js` so incremental migration doesn’t lose any Twenty-aligned styling. File references point to `services/fundraising-service/client/src/styles.css`.

- **Palette anchors:**  
  - Ink: `#0f172a` (shell text, headings) — see `:root` and `.app-shell` (`styles.css:1`, `styles.css:17`).  
  - Canvas: `#f8fafc` (body background) — `:root`/`body` (`styles.css:1`).  
  - Primary cobalt: `#2563eb` (main CTAs/badges) with hover `#1d4ed8` (`styles.css:100`).  
  - Slate neutrals: `#e2e8f0`, `#cbd5f5`, `#94a3b8`, `#475569` used for borders/text (`styles.css:19`, `styles.css:39`, `styles.css:94`).  
  - Status accents: success `#047857`, warning `#facc15`, danger `#b91c1c` already used in alerts (`styles.css:133`, `styles.css:151`).
- **Typography:** Inter stack everywhere with 4px spacing grid; headings typically `1.75rem` / `600` (`styles.css:27`), sidebar eyebrow text uppercase at `0.8rem` (`styles.css:61`).
- **Radiuses & elevation:** Cards/drawers use `0.75rem` radius + `box-shadow: 0 1px 2px rgba(15,23,42,0.08)` (`styles.css:19`). Modal/drawer shadow is `0 20px 60px rgba(15,23,42,0.25)` (`styles.css:266`).
- **Component patterns to preserve:**  
  - Sidebar group + active pill styling (`styles.css:33`–`styles.css:92`).  
  - Header layout (`styles.css:96`–`styles.css:124`).  
  - Drawer/table skins (`styles.css:266` onward) including right-hand drawer positioning and table row hover states.  
  - Form controls + alert colours (`styles.css:44`–`styles.css:154`).
- **Twenty-specific cues:** Keep the right-hand review drawer width, backdrop, and `box-shadow` (`styles.css:266`–`styles.css:330`), plus the queue table typography/border rhythm (`styles.css:348` onward) until Tailwind replacements explicitly match them.

Use this list as the checklist when migrating sections; when a token/component moves fully into Tailwind, annotate the new `.f-*` recipe so this section stays current.
