# Donation Intake & Entry — Lean Design (Repo Spec)

**Purpose:** Define a lightweight, flexible donation intake layer that spans manual gift entry, online donation forms, and CSV imports. This doc complements `docs/features/gift-receipts.md`, `docs/features/donation-reconciliation.md`, and `docs/features/donation-staging.md`, ensuring every intake path feeds the same validation pipeline for UK-first small–mid nonprofits.

---

## Product Goals & Constraints

- **Speed + accuracy:** Sub-30s manual entry per gift (p95) with built-in validation, dedupe, and defaults.
- **Low friction for donors:** Hosted portal with Stripe (cards/wallets) and GoCardless (Direct Debit) optimised for conversion and compliance.
- **Consistent attribution:** Every intake path captures appeal/campaign, fund, tracking code, and Gift Aid where relevant.
- **Idempotent by design:** Safe against retries or re-imports using external IDs and source fingerprints.
- **UK-ready but global-friendly:** Gift Aid declarations, PSD2/SCA, Bacs lead times, GDPR consent capture.
- **Out of scope (MVP):** Full accounting, complex in-kind valuation, deep journey automation, pledge schedules (covered elsewhere or future phases).

---

## Core Principles

1. **Stage → Validate → Commit:** Manual, portal, and CSV flows all land in the shared staging pipeline described in `docs/features/donation-staging.md` before becoming Gifts.
2. **Defaults + smart suggestions:** Reduce data entry friction via batch defaults, contact history cues, and AI assist later on.
3. **Inline hygiene:** Deduping, mapping, consent checks, and Gift Aid prompts happen during entry, not after the fact.
4. **Lean data model:** Individuals remain donors of record; households supply rollups; funds/appeals/tracking codes are first-class fields.
5. **Idempotency everywhere:** External IDs, source fingerprints, and deterministic hashes prevent duplicates across manual, webhook, and import channels.

---

## Required Data Surface

**Donation (gift)**
- `contact_id`
- `amount_minor`, `currency` (GBP default)
- `date_received`
- `payment_method` (`card`, `direct_debit`, `cash`, `cheque`, `bank_transfer`, `other`)
- `appeal_id` (required when attributable), `appeal_segment_id` (optional), `tracking_code_id` (optional, auto for digital)
- `fund_id` (designation)
- `gift_aid_eligible` (bool), `gift_aid_declaration_id` (optional)
- `external_reference` (processor transaction ID / import row key)
- Optional: `notes`, `soft_credit_contact_id`, `split_lines[]` (future multi-fund allocations)

**Gift Aid Declaration (UK)**
- `contact_id`, `declaration_date`, `status` (`active`/`revoked`), `coverage` (past/present/future), `source` (`portal`/`manual`/`csv`), `text_version_id`

**Staging Envelope (shared)**
- `intake_source` (`manual`, `portal`, `csv`)
- `raw_payload` (JSON blob), `source_fingerprint` (hash for idempotency)
- `validation_status`, `dedupe_status`, `intake_batch_id`

---

## Intake Workflows

### A. Manual Gift Entry (Admin UI)

Use cases: cash/cheque entry, phone pledges fulfilled immediately, event-day batches, manual corrections.

**UX requirements**
- Keyboard-first batch entry with sticky defaults (appeal, fund, date, payment method).
- Inline contact search with quick-create (minimum viable fields) and household suggestion when address matches an existing household (`docs/features/households.md`).
- Smart mapping: prefill appeal/fund from batch defaults, show last-used designation for the contact, allow one-click override.
- Dedup prevention before commit:
  - Hard block if same `external_reference` exists.
  - Warn if same contact + same amount + same date (±1 day); require confirm.
  - Fuzzy warning for similar contact + amount within window.
- Gift Aid assist: surface existing declaration, one-click capture of new declaration (store text version), highlight eligibility rules.
- Receipting toggle tied to org policy (`gift-receipts.md`): queue immediate receipt or leave for batch processing.
- Batch management: undo last, bulk delete uncommitted lines, view batch totals/status.
- Accessibility: WCAG 2.2 AA, clear error summaries, focus states.

**Flow**
1. Create/select batch (defaults + owner).
2. Add line → search/create contact → enter amount/date → confirm attribution (appeal/fund/tracking code) → set eligibility/notes.
3. System runs dedupe checks → user confirms/ adjusts.
4. Commit writes to staging → validation → gift creation → rollups/receipting hooks.

### B. Online Donation Portal (Stripe + GoCardless)

Goals: high donor conversion, automatic attribution, minimal admin follow-up.

**Core features**
- Payment rails: Stripe cards + wallets (Apple Pay, Google Pay, Link) with SCA; GoCardless direct debit mandates (one-off and monthly schedule).
- Recurring: monthly default with ability to toggle to one-off; option to convert one-off to recurring post-donation via magic link.
- Attribution: capture UTMs/short-link params to set `tracking_code_id` and `appeal_id` automatically (see `docs/features/campaigns-appeals.md`).
- Designation: optional fund picker or default from form configuration.
- Gift Aid: eligibility question, inline declaration capture, store text version and coverage.
- Consent: capture GDPR channel consents + interests; pass to contact record.
- Optional extras: soft credits/tributes (notification email), fee-cover prompts with clear calculator.
- Thank-you: on-screen + email aligned with receipting policy; ability to delay final receipt if manual review required.
- Donor self-service (Phase 2): manage recurring mandates, update payment method, download receipts (leveraging receipts doc).

**Technical**
- Webhooks with verified signatures, idempotency keys stored (Stripe event IDs, GoCardless event IDs).
- Intake pipeline writes events to staging first; gifts created only after validation.
- Security: no card PAN storage, SAQ-A scope, TLS for hosted form, rate limiting + captcha/behavioural checks as needed.
- Performance: <2s initial render; preserve state through SCA challenges.

**Admin configuration**
- Org-level defaults: currency, min/max amounts, default appeal/fund, receipt policy, Gift Aid wording, fee-cover settings.
- Form variants: hosted page + embeddable widget, sandbox/live keys, preview mode, tracking code per deployment.

### C. CSV Import (Staged & Idempotent)

Use cases: historic migrations, third-party platform exports, offline batches.

**Capabilities**
- Templates: prebuilt mappings (Stripe, PayPal, JustGiving, legacy) + user-saved mappings; sample file download.
- Transformations: whitespace trimming, case normalisation, date parsing, currency conversion, amount sanitisation.
- Validation: required columns present, amount > 0, date parseable, dedupe checks, consent/Gift Aid logic.
- Preview: success vs error counts, sample errors, dedupe warnings; dry-run mode default on.
- Staging: import rows into shared staging table with `intake_source = csv`, attach `import_batch_id`.
- Matching & idempotency: primary match on `external_reference`/transaction ID; secondary on contact + amount + date; fingerprint hash prevents re-importing identical rows.
- Partial commit supported; export errors with row references for correction.
- Batch defaults: set appeal/fund/date/method for rows missing values.

**Admin UX**
- Guided stepper: Upload → Map → Validate → Preview (dry-run) → Review & Commit → Summary/Exports.
- Save mapping profiles, schedule repeated imports (Phase 2).

---

## Data Hygiene & Dedup Engine

Shared dedupe pipeline (manual/portal/csv) leverages rules documented in `donation-staging.md`:
- Contact-level: exact email/phone matches prompt selection; fuzzy name + postcode matches suggest linking/householding.
- Donation-level: block on duplicate `external_reference`; warn on same contact + amount + date (±1d); fuzzy warnings for similar contacts/amounts.
- Merge tooling: side-by-side comparison retaining all gifts, recomputing rollups; audit every merge decision.

---

## Validation Rules (MVP)

- Amount > 0, currency supported, date not in future unless admin override.
- Appeal required when organisation opts in; fund must exist (permissions to quick-create if allowed).
- Gift Aid eligibility requires explicit UK taxpayer confirmation; declarations captured or linked.
- Payment method constraints: Direct Debit respects Bacs lead time and cannot have same-day effective date; card payments abide by processor validations.
- Consent capture required for marketing opt-ins; default to opt-out if unspecified.

---

## Post-Commit Hooks

- Rollups: contact, household, appeal, segment, tracking code totals (shared rollup engine).
- Receipting: enqueue per policy (instant for portal by default, optional for manual/csv) as defined in `gift-receipts.md`.
- Reconciliation signals: mark gifts as `reconciliation_status = pending` and emit to payout grouping (`donation-reconciliation.md`).
- Marketing events: optional event emission to Marketing module for journeys (Phase 2).

---

## Admin Controls & Audit

- Batches: status (`open`, `committed`), owner, defaults, totals, created_at/updated_at.
- Audit logs: intake events, validation errors, dedupe overrides, webhook deliveries, user actions.
- Export: batch summaries, receipts queue, reconciliation handoff.
- Permissions: controls for overriding dedupe warnings, backdating gifts, creating new funds/appeals, issuing refunds (if enabled).

---

## Accessibility & Performance

- WCAG 2.2 AA compliance for admin and donor UIs.
- Progressive enhancement so forms degrade gracefully (e.g., portal without JS fallback).
- Performance budgets: portal TTI < 2s; manual entry keystroke latency < 100ms; mapping UI responsive for 10k-row CSV preview.

---

## AI Assist (Phase 2+)

- Smart defaults for appeal/fund predictions based on donor history/campaign timing.
- ML contact matching for ambiguous entries; provide confidence scores + explanation.
- Duplicate detector tuned per org; highlight anomaly donations (amount deviations, missing recurring installment).
- Content helper for thank-you copy/errors; auto-suggest Gift Aid clarifications.

AI suggestions remain human-approved; log rationale and confidence for audit.

---

## Security & Compliance

- PCI SAQ-A scope by using Stripe-hosted inputs/tokenization; never store PAN.
- PSD2/SCA handling for card flows; secure GoCardless mandate flows with advance notice emails.
- GDPR-compliant consent capture with lawful basis logging and data minimisation.
- Gift Aid wording/versioning stored for HMRC reporting (future export feature).

---

## KPIs / Success Criteria

- Manual entry speed ≤ 30s per gift (p95) in batches.
- Portal conversion lifts 10–20% over baseline with wallets enabled.
- ≥ 95% of online gifts auto-tagged to an appeal via tracking codes.
- Duplicate rate < 1% of new gifts confirmed as duplicates.
- CSV imports: ≥ 98% of valid rows commit on first pass; clear error reports for remainder.

---

## Release Slices (Proposal)

- **Release 1 — Intake Foundations**
  - Manual batch entry with defaults, inline dedupe warnings, Gift Aid prompt.
  - Hosted portal with Stripe cards/wallets (one-off + monthly), basic GoCardless one-off, UTM attribution, thank-you email.
  - CSV import stepper with dry-run, mapping templates, and idempotent upsert via `external_reference`.
  - Shared staging pipeline + rollup hooks wired.

- **Release 2 — Donor Self-Service & Enhancements**
  - Recurring donor portal (pause/cancel/update payment/amount), GoCardless schedules and retry handling.
  - Soft credits, tributes, fee-cover calculator, split gifts.
  - Saved CSV mappings per source, richer transformations, scheduled imports.
  - AI assist for contact matching and duplicate detection.

- **Release 3 — Optimisation & Expansion**
  - A/B testing for amounts/fee-cover prompts, conversion analytics dashboard.
  - Multi-currency, advanced fund rules, deeper marketing events handoff.
  - Gift Aid HMRC export tooling, additional payment providers.

Release slices may shrink further during implementation to hit MVP deadlines.

---

## Default Settings (Recommended)

- Portal: GBP currency, monthly preselected, Apple/Google Pay enabled, fee-cover prompt on, minimal required fields.
- Manual entry: batch defaults required (appeal, fund, date, method); dedupe warnings enabled by default.
- CSV: dry-run on by default; remember last mapping template per source.
- Gift Aid: prompt for UK addresses; capture declaration inline when eligible.
- Receipts: instant for portal gifts; queued for manual/csv unless org opts into immediate send.

---

## Consistency Check & Open Questions

- Ensure staging schema extensions for intake (source fingerprint, raw payload) align with reconciliation fields; consolidate into single migration when implemented.
- Verify manual entry dedupe rules feed into reconciliation (shared engine) to avoid double warnings.
- Confirm GoCardless scheduling obligations mesh with recurring donations doc (`recurring-donations.md`).
- Decide whether split gift allocations ship with Release 2 or defer until allocations module is defined.

---

## Conclusion

1. Use a unified staging pipeline for all intake channels so validation, dedupe, and rollups behave consistently.
2. Prioritise fast, accurate admin workflows and high-converting donor experiences before layering advanced automation.
3. Keep attribution, Gift Aid, and consent capture mandatory pieces of every intake path to support receipts, appeals, and reconciliation downstream.
4. Deliver in slices: foundations (manual + portal + CSV), then donor self-service + AI assist, then optimisation & provider expansion.
