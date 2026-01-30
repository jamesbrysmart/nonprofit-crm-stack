# Donation Reconciliation — Lean Design (Repo Spec)

**Purpose:**  
Define a **lightweight, flexible** approach to donation reconciliation for small–mid-sized nonprofits, addressing one of the most persistent administrative pain points in fundraising CRMs: **ensuring CRM donation data matches financial reality** across multiple sources.  
This feature aims to **reduce manual effort, detect discrepancies early, and improve trust in financial data** without building a full accounting system.

---

## Context and Challenges

- Nonprofits receive donations through **multiple sources** — Stripe, GoCardless, PayPal, JustGiving, website forms, events, direct debits, cash, cheques, etc.
- Each source generates its own data structure, timing, and reporting. When data flows into the CRM via imports or integrations, **mismatches and duplicates** inevitably occur.
- Finance teams often reconcile CRM totals against bank statements manually in **Excel**, matching by date, amount, and donor name.  
  This process can consume **10–20 hours per month** for small teams.
- Common issues:
  - Duplicated donation records (especially with recurring gifts)
  - Missing donations (unimported or integration failures)
  - Wrong amounts or dates
  - Discrepancies between CRM totals and payout totals
- The goal: provide an **integrated, semi-automated way** to flag and fix these discrepancies before they reach finance.

---

## Guiding Principles

1. **Keep it lightweight:** No full accounting system or ledger needed — this should assist *reconciliation*, not replace financial software.
2. **Flexible by design:** Different orgs use different payment processors; the tool must handle both **API integrations** and **CSV imports**.
3. **Action-oriented:** The system must do more than report mismatches — it should allow users to fix them quickly.
4. **Integrate, don’t isolate:** Ideally lives inside the **Fundraising module**, since it deals directly with gifts. Could later expand to a dedicated **Finance module** if accounting integrations deepen.
5. **Transparency and auditability:** Every match, correction, and ignored discrepancy is logged.

---

## Functional Overview

### 1. **Data Ingestion**
All external donation activity continues to flow through the existing **gift staging** pipeline described in the Intake/Staging specs. We simply add a `giftPayoutId` relation on staging rows (and later the processed gifts) so each external transaction knows which payout/bank deposit it belongs to.

Support two ingestion paths:
- **Direct integrations** (Stripe, GoCardless, PayPal, JustGiving): API/webhooks pull transactions and payout references on a schedule. Each payload lands in `giftStaging` with `providerPaymentId`, `feeAmount`, and optional `giftPayoutId` if we already know the payout.
- **Manual / CSV**: admins use Twenty’s native CSV import to load payout files or transaction lists. Mapping templates populate the same staging fields plus `giftPayoutId` or payout metadata when available.

Key staging fields for reconciliation:

| Field | Description |
| --- | --- |
| `externalId` | Unique transaction ID from source |
| `source` / `intakeSource` | e.g. Stripe webhook, PayPal CSV |
| `giftPayoutId` | Relation to the payout/deposit record |
| `amount` | Gross donation amount (currency field) |
| `feeAmount` | Processor/bank fees captured per transaction |
| `giftDate` | Transaction date (date the donor made the gift) |
| `providerPaymentId` / `reference` | Processor reference or payout batch ID |
| `rawPayload` | Audit trail for troubleshooting |

---

### 2. **Automated Matching**

When imported, the CRM runs a **matching engine** to link staging records to existing donations:

| Match Tier    | Logic                                        |
|-------------|----------------------------------------------|
| **Tier 1 (exact)** | Match by `external_id` (unique transaction ID) |
| **Tier 2 (strong)** | Match by donor + amount + date               |
| **Tier 3 (fuzzy)** | Match by approximate date range (±1 day) or similar donor name |
| **Tier 4 (manual)** | User review required                         |

Each record is flagged as:
- ✅ **Matched** – confirmed link between external record and CRM donation.
- ⚠️ **Potential Match** – system found a near match; user confirmation needed.
- ❌ **Unmatched** – appears in external data but no CRM equivalent.
- 🌀 **Duplicate** – multiple CRM records linked to the same external transaction.

Staging and gift records share the same status history; reconciliation status is an additional layer that records whether the external payout amount matches the sum of linked gifts (see `giftPayout` below).

---

### 3. **Discrepancy Dashboard**

A dedicated **Reconciliation Dashboard** presents the results:

#### Sections
- **Unmatched External Donations** → likely *missing* from CRM  
  → Action: “Create New Donation” (pre-fill fields)
- **Unmatched CRM Donations** → likely *duplicates or errors*  
  → Action: “Mark as Error / Delete / Link to External”
- **Duplicate Matches** → two CRM gifts linked to one transaction  
  → Action: “Merge”
- **Reconciled Deposits** → matched and grouped transactions (see below)

#### UX Features
- Inline search/filter by date range, amount, or source
- Group view by **source system** or **payout batch**
- Bulk actions (approve multiple matches)
- Confidence scores (e.g. “High match probability” for fuzzy matches)
- Export to CSV or PDF for finance team review

---

### 4. **Deposit Grouping & Financial Alignment**

To help finance staff verify totals:
- The system groups matched donations by **payout reference or bank deposit date**.
- Each group displays:
  - **Deposit total (CRM)** vs **Deposit total (Bank)**  
  - **Variance amount** (if any)
  - Linked donations within that deposit
- If integrated with Stripe or GoCardless, the system can automatically pull **payout batches and fees**, reconciling gross vs net amounts.

Example summary table:

| Deposit Date | Source | Deposit Ref | CRM Net Total | Deposit Net | Variance |
|---------------|---------|-------------|----------------|---------------|-----------|
| 2025-09-30 | Stripe | POUT-981 | £5,030.00 | £5,030.00 | £0.00     |
| 2025-09-29 | PayPal | PAY-172 | £1,950.00 | £1,900.00 | -£50.00 ⚠️ |

---

### 5. **Resolution Actions**

Each discrepancy can be resolved directly from the dashboard:
- ➕ **Add to CRM** → Creates new donation record using staging data.
- 🔗 **Link existing donation** → If the system guessed a potential match.
- 🧹 **Mark as duplicate** → Merges or flags duplicates.
- 🧾 **Ignore / Confirm Reconciled** → When variance is explained (e.g. refund or rounding).
- 🧮 **Export summary** → Download reconciliation report by date or deposit batch.

Once resolved, entries move to a “Reconciled” state and appear in reports.

---

## Data Model Summary

| Object | Description |
|--------|-------------|
| `giftStaging` | Existing staging object enriched with `giftPayoutId` and `feeAmount` for reconciliation |
| `gift` | Final donation record gains `feeAmount` and `giftPayoutId` relations so net amounts can be rolled up |
| `giftPayout` | New object representing the actual payout/deposit as it appears in Stripe/GoCardless/bank |

### `giftPayout` fields (MVP)

| Field | Purpose |
| --- | --- |
| `sourceSystem` | Stripe, GoCardless, manual_bank, etc. |
| `payoutReference` | Processor/bank reference ID |
| `depositDate` | Date the net amount hit the bank |
| `grossAmount` (CURRENCY) | Sum of associated transactions before fees |
| `feesAmount` (CURRENCY) | Total fees withheld in the payout |
| `netAmount` (CURRENCY) | Amount paid to the org (the value finance sees) |
| `expectedItemCount` | Optional number of transactions from the source export |
| `status` | `pending`, `partially_reconciled`, `reconciled`, `variance`, etc. |
| `varianceAmount` / `varianceReason` | Track explained differences |
| `note`, `confirmedAt`, `confirmedBy` | Audit trail once finance signs off |

Rollups (powered by fundraising-service’s rollup engine) populate `crmGrossAmount`, `crmFeeAmount`, `crmGiftCount`, and `pendingStagingCount`; the UI derives the CRM net total by subtracting fees so we never lose sight of processor deductions.

---

## Lifecycle

1. **Create payout** – via integration (future), CSV import, or manual entry. The payout record stores deposit metadata and, when possible, the list/count of expected transactions.
2. **Ingest transactions** – all external donations enter `giftStaging` with `giftPayoutId` + fee data. Manual gifts can also be linked to a payout when created.
3. **Validate & process** – staging follows the existing Stage → Validate → Process flow. When a row processes, its `giftPayoutId` moves to the final `gift` record.
4. **Rollups & status** – rollupEngine calculates CRM gross/fee totals vs. payout totals. Status flips to `reconciled` automatically when `(crmGrossAmount - crmFeeAmount) === netAmount` and no pending staging remains; otherwise it stays `pending`, `partially_reconciled`, or `variance`.
5. **Resolution** – ops link missing gifts, create new ones, or record an explained variance. Finance confirms the payout once satisfied.

Automated payout ingestion (Stripe/GoCardless) and richer CSV tooling are Phase 2+ enhancements; MVP focuses on the shared data model, manual entry, and dashboard experience.

---

## AI & Automation Opportunities

AI could dramatically reduce the manual burden:
- 🤖 **Smart matching:** ML model learns from past matches to improve fuzzy matching accuracy (e.g. name variations, rounding differences, recurring timing).
- 🧠 **Duplicate detection:** Identify likely duplicates before they enter reconciliation (e.g. two gifts, same amount/date, same donor).
- 📊 **Anomaly detection:** Spot unexpected patterns (e.g. missing recurring donation this month, abnormal deposit total).
- 🗣️ **Natural language explanations:** Auto-generate “reconciliation summaries” (e.g. “£50 discrepancy on 29 Sept due to refunded PayPal payment”).
- 🔔 **Alerts:** Notify when large variances occur or when unmatched external donations exceed a threshold.

---

## Placement within the System

| Option | Pros | Cons | Recommendation |
|--------|------|------|----------------|
| **Within Fundraising module** | Close to donation data, minimal extra setup, logical ownership | Mixes operational (donation) and financial concerns | ✅ **Start here (MVP)** |
| **Separate Finance module** | Can expand to full accounting integration (Xero/QuickBooks) | Adds complexity and overhead early on | Consider later |

> **Decision:** Start as a feature of the **Fundraising module**, adjacent to “Gift Entry” and “Import Donations.”  
> If future integrations deepen (e.g. push to finance systems), extract into a **Finance module**.

---

## UX Sketch (conceptual)

[ Reconciliation Dashboard ]

Unmatched External Donations (5)

✓ John Smith – £25.00 (Stripe 2025-09-10)
→ [Create Donation] [Ignore]

⚠ Mary Jones – £100.00 (PayPal 2025-09-12)
→ Suggested match: Donation #D-8412 (similar date)
[Confirm Match] [Skip]

Unmatched CRM Donations (3)

❌ Gift #D-9283 – £50.00 (no external record)
→ [Mark Duplicate] [Keep]

Deposit Summary

Stripe Payout POUT-981 £5,030.00 ✅ Reconciled
PayPal Batch PAY-172 £1,900.00 ⚠ -£50 Variance


---

## Rollout Roadmap

### **Phase 1 – Foundation (this slice)**
- Add `giftPayout` object + relations on `gift`/`giftStaging`
- Manual/CSV payout creation (via Twenty import or inline form)
- Reconciliation dashboard with rollups + variance tracking
- Manual variance entry & export

### **Phase 2 – Integrations & Automation**
- Stripe and GoCardless payout connectors + nightly sync
- Auto-link transactions to payouts during ingestion
- Automated reconciliation job & alerts when payouts stall
- Initial AI/fuzzy matching for tricky donor/date combos

### **Phase 3 – Intelligence & Finance Sync**
- AI-driven anomaly detection and explanations
- Optional push to accounting (e.g. Xero) using `giftPayout` as bridge
- Multi-org/multi-currency support and deeper finance workflows
- “Finance module” option for orgs needing ledger-level controls

---

## Expected Impact

✅ **Saves hours per month** by automating comparison and matching  
✅ **Improves data quality** (catches missing/duplicate donations early)  
✅ **Bridges fundraising and finance** teams with a shared truth  
✅ **Flexible** enough to adapt to any combination of donation sources  
✅ **Increases confidence** in CRM totals and financial reporting  

---

## References & Inspiration

- **Prospero Software** – database-driven matching between PayPal, Stripe, JustGiving and CRM exports (UK)  
- **CloudStack financeManager** – Salesforce plugin for Stripe/QuickBooks reconciliation  
- **Microsoft Dynamics 365 Nonprofit** – automatic matching of donations to bank statement lines  
- **Community practices** (Reddit/Charity forums) – scripts for CSV reconciliation and donor database integration  
- **Omatic Software** – integration bridges between fundraising and finance systems  

---

**Status:**  
🟩 *Roadmap candidate* (Post–Gift Entry, pre–Finance module)  
🧩 *Lives within Fundraising module initially*  
🧠 *Future AI spike: Smart matching & variance detection*
