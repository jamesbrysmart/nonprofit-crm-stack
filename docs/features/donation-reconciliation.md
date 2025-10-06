# Donation Reconciliation — Lean Design (Repo Spec)

**Purpose:** Provide a lightweight, flexible reconciliation flow that helps small–mid nonprofits ensure fundraising CRM data matches financial reality across payment providers. This spec focuses on early discrepancy detection and fast resolution without building a full accounting system. Read alongside `docs/features/donation-staging.md` (intake flows) and `docs/DONATION_CONNECTOR_SCAFFOLDING.md` (provider adapters).

---

## Product Goals & Constraints

- **Assist finance without becoming finance:** Deliver discrepancy detection, guided fixes, and audit trails while leaving ledgers and postings to accounting tools.
- **Handle mixed inputs:** Work with API integrations (Stripe, GoCardless, PayPal, JustGiving) and CSV uploads on the same staging surface.
- **Prioritise action:** Highlight unreconciled items and offer direct remediation (create gift, link, ignore) rather than passive reports.
- **Integrate with Fundraising:** Live alongside gift entry/import tooling so reconciliation sits close to donation data; future Finance module remains an option.
- **Transparent & auditable:** Persist every import, match, and decision with timestamps and operators.

---

## Context & Challenges

- Donations originate from multiple sources with differing schemas and payout cadences; mismatches appear during intake or payout reconciliation.
- Finance teams currently export CRM totals to spreadsheets and manually compare against bank accounts or provider reports, often spending 10–20 hours monthly.
- Frequent pain points: duplicated CRM gifts (especially recurring), missing/failed imports, incorrect amounts/dates, net vs gross discrepancies against payout files.

Goal: catch these issues early, reduce manual effort, and boost confidence in CRM totals before finance month-end.

---

## Functional Overview

### 1. Data Ingestion

- **Direct integrations:** Piggyback on connector scaffolding (Stripe/GoCardless/PayPal/JustGiving) to pull transactions on a schedule or via webhook fan-out. Ingestion jobs deposit raw events into the shared staging layer described in `docs/features/donation-staging.md`.
- **Manual CSV upload:** Users upload provider payout/export files. Upload wizard maps columns (remembering templates) and stores rows in the same staging table.

Staging schema (extend existing `donation_staging` envelope with reconciliation fields):

| Field | Description |
| --- | --- |
| `external_id` | Unique provider transaction ID |
| `source_system` | Stripe, PayPal, GoCardless, JustGiving, etc. |
| `donor_name` / `donor_email` | Fallback matching hints |
| `amount_minor` | Donation amount (minor units) |
| `currency` | Currency code |
| `transaction_date` | Provider transaction timestamp |
| `status` | Successful, refunded, pending |
| `payout_reference` | Provider payout/batch ref (if present) |
| `fees_minor` | Processor fee (optional) |
| `import_batch_id` | Logical grouping per import |

### 2. Matching Engine

After ingestion, run a matching pass to align staging records with CRM donations:

| Tier | Logic | Outcome |
| --- | --- | --- |
| 1 – Exact | Match on `external_id` or `transaction_id` already stored on donation | Auto-confirm match |
| 2 – Strong | Match on contact + amount + date (same day) | Flag as “High confidence” potential match |
| 3 – Fuzzy | Allow ±1 day, nickname/email variants, rounding tolerance | Flag as “Review” |
| 4 – Manual | No confident match | Mark as “Unmatched” |

Matching results write to `donation_reconciliation_log` with status codes:
- ✅ `matched`
- ⚠️ `potential_match`
- ❌ `unmatched_external`
- 🌀 `duplicate`
- ❓ `unmatched_crm` (detected by scanning gifts lacking `external_reference` within date ranges)

### 3. Discrepancy Workspace

A reconciliation dashboard (Fundraising → Reconciliation) surfaces actionable queues:

- **Unmatched external transactions:** Likely missing from CRM → actions: `Create donation`, `Link existing`, `Ignore`.
- **Unmatched CRM donations:** Gifts without matching external records → actions: `Mark duplicate`, `Add external reference`, `Dismiss`.
- **Duplicate matches:** Multiple CRM gifts tied to a single external transaction → action: `Merge or detach duplicates`.
- **Deposit summaries:** See payout groups with CRM vs provider totals and variance.

UX staples: filters by date/source/payout, bulk confirm, confidence badges, exports for finance (CSV/PDF), and timeline view per item (imported → matched → resolved).

### 4. Deposit Grouping & Financial Alignment

Group reconciled donations by payout reference or bank deposit date (`donation_payout_group`). Show for each group:
- Gross amount, fees, net amount (where provider exposes data).
- CRM net vs provider net; highlight variance.
- Linked donations with quick drill-down.

Stripe/GoCardless integrations can auto-populate payout batches; CSV uploaders can manually set payout references during import.

### 5. Resolution Actions & Audit

Each reconciliation item supports inline resolution:
- ➕ `Create donation` pre-populates gift entry from staging row.
- 🔗 `Link donation` associates staging external ID to existing gift (updates `external_reference`).
- 🧹 `Mark duplicate` merges duplicates or flags them for follow-up.
- 🧾 `Confirm variance` records explanation (refund, currency adjustment) and marks group reconciled.
- 📤 `Export summary` produces finance packets by date/payout.

Every action appends to `donation_reconciliation_log` with actor, timestamp, reason.

---

## Data Model Summary

| Object | Purpose |
| --- | --- |
| `donation_staging` | Existing staging layer extended with reconciliation columns above |
| `donation_reconciliation_log` | Status transitions and audit entries for matches/resolutions |
| `donation_reconciliation_batch` | Metadata for each import/run (source, initiated_by, timeframe) |
| `donation_payout_group` | Optional grouping of donations by payout/deposit ref |

Donation records gain:
- `external_reference` (string, provider transaction ID or payout ref)
- `reconciled_at` (timestamp) and `reconciliation_status` (enum: `pending`, `matched`, `variance_recorded`)

---

## AI & Automation Opportunities (Phase 2+)

- **Smart matching:** Train models on historic matches to improve Tier 3 suggestions (nickname mapping, amount drift, timing for recurring gifts).
- **Duplicate prevention:** Surface likely duplicates during gift entry/import before they hit reconciliation.
- **Anomaly detection:** Alert when recurring gifts miss expected cycles or when payout variance exceeds thresholds.
- **Narrative summaries:** Generate plain-language explanations ("£50 variance on 29 Sep – PayPal refund") for finance reports.
- **Proactive alerts:** Notify teams when unmatched external donations cross volume thresholds or when reconciliation falls behind schedule.

AI recommendations remain human-reviewed; store confidence scores for audit.

---

## Placement Within the Product

| Option | Pros | Cons | Recommendation |
| --- | --- | --- | --- |
| Fundraising module feature | Shared UI patterns, close to gift data/import tooling | Intermixes operational + finance tasks | ✅ MVP home |
| Dedicated Finance module | Opens door to accounting integrations (Xero/QuickBooks) | Additional infrastructure & UX overhead early | Consider post-MVP |

---

## Release Slices (Proposal)

- **Release 1 — Manual Foundations**
  - CSV import to `donation_staging` with reconciliation fields.
  - Tier 1–2 matching (external ID + donor/amount/date).
  - Reconciliation dashboard with unmatched external vs CRM lists.
  - Manual resolution actions (create/link/dismiss) and exportable summary.

- **Release 2 — Integrations & Payouts**
  - Stripe & GoCardless ingestion via existing connector scaffolding.
  - `donation_payout_group` with gross/net/fee rollups and variance indicators.
  - Tier 3 fuzzy matching with confidence scores; nightly reconciliation job.
  - Basic alerts (email/slack) for large variances or aging unmatched items.

- **Release 3 — Intelligence & Finance Sync**
  - AI-assisted matching and anomaly detection.
  - Deeper provider coverage (PayPal, JustGiving) and multi-currency support.
  - Optional accounting export/push (Xero/QuickBooks).
  - Evaluate move to Finance module if integrations deepen.

Roadmap will likely pare Release 1 further (e.g., focus on CSV + exact match) depending on delivery capacity.

---

## Expected Impact

- Reduce manual reconciliation hours per month by surfacing discrepancies and suggested fixes.
- Improve donation data accuracy before finance month-end closes.
- Provide shared tooling for fundraising & finance teams, boosting trust in CRM totals.
- Offer flexible ingestion that adapts to any mix of payment providers.

---

## References & Inspiration

- Prospero Software (UK) – provider to CRM reconciliation workflows.
- CloudStack financeManager (Salesforce) – Stripe/QuickBooks matching.
- Microsoft Dynamics 365 Nonprofit – donation-to-bank-line matching.
- Community scripts (Reddit/charity forums) for CSV reconciliation.
- Omatic Software – middleware bridging fundraising and finance platforms.

---

## Status

- 🟩 Roadmap candidate (post gift-entry enhancements, pre dedicated finance module).
- 🧩 Lives in Fundraising module for MVP.
- 🧠 Future spike: AI-powered matching & variance detection.
