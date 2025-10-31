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
Support two modes of bringing external donation records into the system:
- **Direct integrations** (Stripe, GoCardless, PayPal, JustGiving): use API or webhooks to pull transactions on schedule.
- **Manual CSV upload**: users upload reports from external systems (monthly, weekly, or ad hoc).

All imported records land in a **temporary staging table** (`donation_import_staging`).

| Field         | Description                      |
|---------------|----------------------------------|
| `external_id`   | Unique transaction ID from source|
| `source_system` | e.g. Stripe, PayPal, JustGiving  |
| `donor_name` / `email` | For fallback matching            |
| `amount`      | Donation amount                  |
| `date`        | Transaction date                 |
| `status`      | Successful, refunded, pending    |
| `reference`   | Bank ref or payout batch ID      |
| `fees`        | (optional) processor fee         |
| `import_batch_id` | Links multiple imports together  |

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

These are stored in a `donation_reconciliation_log`.

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

| Deposit Date | Source | Deposit Ref | CRM Total | Bank Total | Variance |
|---------------|---------|-------------|------------|-------------|-----------|
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
| `donation_import_staging` | Temporary holding for external transaction data |
| `donation_reconciliation_log` | Audit of matches, mismatches, resolutions |
| `donation_reconciliation_batch` | Each import or reconciliation session |
| `donation_payout_group` | Groups of donations by payout or deposit (optional) |

Each donation record gains a new field:  
- `external_reference` (links to source transaction or batch)

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

### **Phase 1 – Foundation**
- CSV import for external transactions
- Auto-match by external ID / donor + date + amount
- Dashboard to view and resolve mismatches
- Manual variance entry & export

### **Phase 2 – Integrations & Automation**
- Stripe and GoCardless API connectors
- Payout grouping and deposit summaries
- Automated nightly reconciliation job
- Basic AI/fuzzy matching and variance alerts

### **Phase 3 – Intelligence & Finance Sync**
- AI-driven anomaly detection and explanations
- Optional push to accounting (e.g. Xero)
- Multi-org or multi-currency support
- “Finance module” option for orgs with accounting integration needs

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