# Donation Intake & Entry — Lean Design (Repo Spec)

**Purpose**  
Define a **lightweight, flexible** donation intake layer that supports three inputs:
1) **Manual Gift Entry UI** (fast, error-resistant, admin-friendly)  
2) **Online Donation Portal** (Stripe cards/wallets + GoCardless Direct Debit)  
3) **CSV Import** (staged, idempotent, safe)

Focus: **small–mid nonprofits (UK-first)**, modular, low complexity, strong data hygiene. This spec complements our Receipting and Reconciliation specs.

---

## Product Goals & Non-Goals

**Goals**
- **Speed + accuracy**: sub-30s per gift (p95) with built-in validation & deduping.
- **Minimal friction** for donors (portal), **minimal rework** for admins (manual/csv).
- **Consistent attribution**: always capture appeal/campaign, fund/designation, and (optionally) grant/program links.
- **Idempotent intake**: safe against duplicates (manual repeats, webhook retries, CSV re-imports).
- **UK-ready**: Gift Aid eligibility + declaration capture, SCA/3-D Secure, Direct Debit mandates.

**Non-Goals (MVP)**
- Full accounting/ledger (see Reconciliation/Finance).
- Complex premium/benefit valuation, in-kind, pledges (can follow later).
- Deep journey automation (lives in Marketing/integrations).

---

## Core Principles

1) **Stage → Validate → Commit**: all inputs flow through the same pipeline.  
2) **Defaults & smart suggestions** > required manual choices.  
3) **Inline hygiene**: dedupe, mapping, and consent checks without derailing flow.  
4) **Objects remain lean**: individuals are donors of record; households for rollups; funds/appeals are first-class.  
5) **Idempotency everywhere**: external IDs, source hashes, and safe retries.

---

## Minimal Data Surface (fields we must set)

**Donation**  
- `contact_id` (or new contact created)  
- `amount`, `currency` (GBP default), `date_received`  
- `payment_method` (`card`, `direct_debit`, `cash`, `cheque`, `bank_transfer`, `other`)  
- `appeal_id` (required if attributable), `appeal_segment_id` (opt), `tracking_code_id` (opt, auto for digital)  
- `fund_id` (designation; defaultable)  
- `gift_aid_eligible` (bool), `gift_aid_declaration_id` (opt)  
- `external_reference` (processor transaction ID / import row key)  
- `notes` (opt), `soft_credit_contact_id` (opt), `split_lines[]` (opt, for multi-fund allocations)

**Gift Aid Declaration (UK)**  
- `contact_id`, `declaration_date`, `status` (`active`/`revoked`), `coverage` (past/present/future), `source` (portal/manual/csv), `text_version_id`

**Staging (shared)**  
- `intake_source` (`manual`, `portal`, `csv`)  
- `raw_payload` (opaque, for audit), `source_fingerprint` (hash for idempotency), `validation_status`, `dedupe_status`

---

## Workflows

### A) Manual Gift Entry (Admin UI)

**Use cases**: cash, cheques, phone gifts, event day batches, manual corrections.

**UX requirements**
- **Keyboard-first, sticky defaults**: select batch defaults (appeal, fund, date, method); tab through fields.
- **Inline contact search + quick-create**: search by name/email/phone; if not found, quick-create with minimal fields; household suggestion if address matches.
- **Smart mapping**: prefill `appeal/fund` from batch defaults; show last used for this contact; allow one-click change.
- **Dedup prevention (before save)**:
  - Level 1: same contact + same amount + same date (±1d) → warn + “proceed anyway/merge”.
  - Level 2: same external reference → block as duplicate.
  - Level 3: fuzzy: similar name/email + amount → caution banner.
- **Gift Aid assist**: show existing declaration status; one-click “record new declaration” inline (with template text); eligibility checkbox (UK rules simplified).
- **Receipting toggle**: “Queue receipt” (now/later/none), respect channel consents.
- **Error handling**: inline validation (amount > 0, date not future unless pledge, fund/appeal presence if required).
- **Batch actions**: apply/override defaults, undo last, bulk delete uncommitted lines.
- **Accessibility**: WCAG 2.2 AA; screen reader labels; clear error summaries.

**Flow**
1. Select/create **Batch** (defaults).  
2. Add line: pick/quick-create contact → amount/date → (auto) appeal/fund → eligibility → save.  
3. Dedupe check → confirm or merge.  
4. Post-commit hooks: rollups, receipting (if queued), reconciliation signals.

---

### B) Online Donation Portal (Stripe + GoCardless)

**Goals**: high conversion, automatic attribution, low support burden.

**Core features**
- **Payment**: Stripe (cards + Apple Pay/Google Pay + Link) with SCA; GoCardless mandates + schedules (monthly/annual).  
- **Recurring**: monthly default + one-time toggle; editable amounts; “upgrade to monthly” post-donation.  
- **Attribution**: capture UTM/tracking params → auto-set `appeal_id`/`tracking_code_id`; campaign-specific links.  
- **Designation**: optional fund picker (or campaign default).  
- **Gift Aid**: eligibility question + inline declaration (store record + text version).  
- **Consent & preferences**: GDPR consents (email/SMS/post), interests.  
- **Tributes/soft credits** (opt): in honour/memory fields; notify contact email.  
- **Cover fees** (opt): % or fixed suggestions; transparent calculator.  
- **Thank-you**: on-screen + email; receipt rules respect org setting (instant vs queued).  
- **Self-serve portal**: manage recurring (pause/cancel/update method/amount), view history, download receipts; webhook-driven sync.  
- **Fraud & retries**: Stripe Radar defaults; GoCardless retry rules; dunning emails (templated) with secure update links.

**Technical**
- **Webhooks**: reliable ingestion (verify signatures, retry, idempotency keys); map events to donations, refunds, failures.  
- **Idempotency**: store processor event IDs; ignore duplicates.  
- **Security**: no PAN storage; PCI SAQ-A; TLS; rate limiting.  
- **Performance**: sub-2s initial render; preserve state across SCA challenge.

**Admin configuration**
- Org defaults: currency, min/max amounts, default appeal/fund per form, receipt timing, Gift Aid wording, fee-covering.
- Form variants: embeddable widget + hosted page; preview mode; sandbox/live keys.

---

### C) CSV Import (Staged & Safe)

**Use cases**: historic migrations, third-party platforms, bulk backfill.

**Capabilities**
- **Templates**: prebuilt mappings (Stripe/PayPal/JustGiving/Legacy); user-saved mappings; sample file download.
- **Transformations**: trim, case-normalize, date parsing, currency normalization, amount sanitization.
- **Validation**: required columns present; per-row checks (amount > 0; date parseable; mutually exclusive fields).
- **Preview**: counts by outcome (create/update/skip), sample errors, dedupe warnings; **Dry-run** mode.
- **Staging**: import to `donation_import_staging`; run matching engine; present **Review & Commit** screen.
- **Matching & idempotency**:
  - Primary: `external_id` (transaction/ref) → upsert.
  - Secondary: (email/name) + amount + date window.
  - Fingerprint hash of row → skip re-imports.
- **Partial commit**: commit valid rows; export errors with row numbers and reasons; allow fix-and-retry.
- **Batch defaults**: set appeal/fund/date if missing.

**Admin UX**
- Stepper: Upload → Map → Validate → Preview/Dry-run → Review & Commit → Summary (with exportable error log).
- Save mapping profiles per source.

---

## Data Hygiene & Dedup (Shared Engine)

**Contact-level** (on add/select)
- Exact: email/phone matches existing → suggest select instead of create.
- Fuzzy: name + address/postcode similarity → suggest householding or link.

**Donation-level** (pre-commit)
- Hard duplicate: same `external_reference` → block.
- Likely duplicate: same contact + same amount + same date (±1d) → warn + require confirm.
- Fuzzy duplicate: similar contact + amount + within window → warn w/ confidence.

**Merges & safety**
- Side-by-side merge dialog (retain all gifts, rollups recompute).
- Full audit trail of merges and overrides.

---

## Validation Rules (MVP)

- Amount > 0; currency known; date not > today (unless admin override).
- Appeal present if org requires attribution; fund must exist (or quick-create allowed per permission).
- Gift Aid eligibility requires UK taxpayer confirmation + declaration capture if not already active.
- Payment method constraints (e.g., Direct Debit cannot be “today” — obey Bacs lead times).

---

## Post-Commit Hooks

- Rollups: contact + household + appeal/segment + tracking code totals.
- Receipting: enqueue per org rules (instant vs batch).
- Reconciliation signal: mark as pending for deposit grouping.
- Journeys: emit event to Marketing (opt-in).

---

## Admin Controls & Audit

- **Batches**: status (`open`, `committed`), owner, created_at, defaults, item count, totals.
- **Logs**: intake events, validation failures, dedupe decisions, webhook deliveries, user actions.
- **Exports**: batch summary CSV, reconciliation handoff.
- **Permissions**: who can override dedupe, backdate, quick-create funds/appeals, issue refunds (if permitted).

---

## Accessibility & UX Quality

- WCAG 2.2 AA, clear error summaries, large tap targets, focus states.
- Progressive enhancement; graceful recovery on SCA failures.
- Performance budgets (form TTI < 2s, keystroke latency < 100ms).

---

## AI Assist (Optional, Post-MVP)

- **Smart defaults**: predict appeal/fund based on contact history/campaign timing.
- **Contact match**: ML fuzzy matching for contact selection/creation.
- **Duplicate detector**: learned thresholds per org; explainable scores.
- **Anomaly flags**: unusual amount/day-of-month for this donor; missing expected recurring installment.
- **Content help**: auto-copy for thank-yo notes; error explanations (“Gift Aid needs declaration”).

*(AI proposes; user confirms. Always log rationale & confidence.)*

---

## Security, Compliance, Regional Notes

- **PCI**: tokenize via Stripe; no card data stored; SAQ-A.
- **PSD2/SCA**: handle 3-D Secure flows; robust webhook retries.
- **GoCardless/Bacs (UK)**: mandate creation, advance notice emails, retry windows, failure codes; settlement delays.
- **GDPR**: explicit consent capture; lawful basis logging; data minimization.
- **Gift Aid**: store wording version + timestamp; support HMRC export in separate feature.

---

## KPIs / Success Criteria

- **Manual entry speed**: ≤ 30s per gift (p95) with batch defaults.
- **Portal conversion**: +10–20% vs baseline (wallets/Apple Pay enabled).
- **Auto-attribution**: ≥ 95% online gifts tagged to appeal via tracking code.
- **Duplicate rate**: < 1% of new gifts flagged as confirmed dupes.
- **CSV success**: ≥ 98% valid rows committed on first pass; clear error exports.

---

## Roadmap

**Phase 1 (MVP)**
- Manual Gift Entry (batches, defaults, inline dedupe).
- Hosted Donation Portal (Stripe cards + wallets; GoCardless one-off + monthly).
- UTM → tracking code attribution; simple thank-yo email; Gift Aid capture.
- CSV import (staging, mapping, dry-run, idempotent upsert).
- Webhooks & idempotency; basic rollups.

**Phase 2**
- Self-serve donor portal for recurring mgmt.
- GoCardless schedules & failure retries; dunning templates.
- Split gifts; soft credits; tributes.
- Saved CSV mappings per source; richer transforms.
- AI: contact match & duplicate detection.

**Phase 3**
- A/B amounts/fee-cover prompts; conversion analytics.
- Multi-currency; advanced designation rules.
- Gift Aid export HMRC; automation hooks.
- Deep marketing handoffs (journey events), expanded providers.

---

## Defaults (Recommended)

- Donation portal: GBP, monthly preselected, Apple/Google Pay on, fee-cover prompt on, minimal fields.
- Manual entry: batch defaults required (appeal/fund/date/method), dedupe warnings enabled.
- CSV: dry-run on by default; saved mapping template remembered per source.
- Gift Aid: show eligibility prompt for UK addresses; capture declaration inline if eligible.
- Receipts: instant for portal gifts; queued for manual/CSV (org configurable).