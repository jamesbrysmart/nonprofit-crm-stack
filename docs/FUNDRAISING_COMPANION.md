# Fundraising Companion (POC, Work in Progress)
Working draft v0 (Jan 2026)

## Purpose of this document
This companion document adds practical, partner-friendly detail to the high-level overview. It describes what has been built so far in the **Fundraising module** (as a proof of concept), what is still in progress, and what feedback we are looking to validate.

This is **not** production documentation. The current system is a work in progress and the data model, workflows, and UI will evolve as we learn from pilots.

---

## What exists today (reality anchor)
### Built now (POC, partially implemented)
The current build includes a “Fundraising Console” (admin UI) and a supporting service layer that integrates with Twenty CRM.

**Fundraising Console (UI)** *(currently titled “Fundraising admin” in the UI)*
- Manual gift entry (admin-facing)
- Gift staging queue (review + processing)
- Duplicate detection assistance (donor matching support)
- Recurring agreement monitoring (triage/filter view)
- Appeals management (basic appeal metadata + solicitation snapshots)
- Households management (pilot data hygiene tooling)
- Reconciliation view (payout-first reconciliation tooling)

**Service layer (API behind the UI)**
- Gift CRUD proxying into Twenty
- Gift staging + processing endpoint
- Recurring agreement proxying into Twenty
- Appeals + solicitation snapshot proxying into Twenty
- Households proxying into Twenty (and member management)
- Payouts (“gift payouts”) for reconciliation linking

### Exists as “API-only / scaffold” today
- **Stripe integration**: webhook handling exists, but should be treated as WIP until validated end-to-end in pilots.
- **GoCardless integration**: present as a scaffold/skeleton and not yet proven as an operational flow.
- **Gift Aid**: included as an example of a toggleable UK-only capability; not implemented as an end-to-end workflow in the current build.

### Roadmap modules (not built yet)
The project is explicitly modular, but today the only implemented module is fundraising. Other modules (Volunteers, Grants, Programs/Services) are on the roadmap and will follow once the core fundraising slice is validated.

---

## Fundraising Console (POC): workflows and why they exist
> **Screenshot placeholder — Fundraising Console navigation**
>
> [Insert screenshot: navigation showing Staging queue / Manual gift entry / Reconciliation / Recurring agreements / Appeals / Households]

> **Status note:** Several areas (Appeals, Households, Reconciliation, Recurring agreements) are intentionally “present but partial” in the POC. They exist to prove direction and gather feedback, and are expected to be refined before pilots go live.

### 1) Gift staging queue (review → resolve → process)
**What it’s for**
A staging queue is the safety layer between inbound donation capture and processed CRM records. It supports validation, dedupe, and review workflows so the CRM stays clean even when inputs are messy (manual entry, webhooks, future imports).

**What exists in the POC UI**
- A queue of staged gifts with filters and summary counts.
- A “drawer-first” review workflow (review a row, resolve issues, then act).
- Actions to mark items ready and to process when appropriate.
- Duplicate-related indicators to help staff focus on rows that need attention.

**Why this is valuable**
- Makes ingestion resilient: problems are handled in the queue rather than “poisoning” core data.
- Gives ops staff a predictable daily workflow: review, fix, process.
- Creates a foundation for imports and integrations without multiplying bespoke admin screens.

**References (background design)**
- `docs/features/donation-staging.md`
- `docs/solutions/gift-staging-processing.md`

> **Screenshot placeholder — Staging Queue**
>
> [Insert screenshot: staging queue table + summary chips]
>
> **Screenshot placeholder — Staging Drawer**
>
> [Insert screenshot: staging record drawer with donor + status + actions]

---

### 2) Manual gift entry (fast capture with data hygiene)
**What it’s for**
A keyboard-first workflow for staff to enter gifts that arrive outside digital rails (cheques, cash, phone donations, corrections). The key principle is: fast entry without sacrificing data quality.

**What exists in the POC UI**
- Manual gift entry form designed for admin use.
- Donor selection support and duplicate detection assistance.
- Support for “donor vs organisation” intent so corporate/grant-style gifts don’t force a donor-first flow.
- Submission that flows into staging (so the queue remains the central work surface).

**Why this is valuable**
- Gives teams a path off spreadsheets quickly.
- Prevents “dirty data” by making good hygiene part of normal entry (not an afterthought).
- Keeps manual entry aligned with staging/processing so future connectors share the same path.

**References (background design)**
- `docs/features/donation-intake-entry.md`
- `docs/USER_RUNBOOK.md`

> **Screenshot placeholder — Manual Gift Entry**
>
> [Insert screenshot: manual entry form with donor panel and duplicate suggestions]

---

### 3) Duplicate detection (donor matching assistance)
**What it’s for**
Help staff avoid creating duplicate donor records during intake by surfacing likely matches and making selection/override explicit.

**What exists in the POC**
- Dedupe assistance integrated into manual entry and staging review flows.
- A deliberate “human confirmation” posture: suggestions are shown, but users control what happens next.

**Why this is valuable**
- Most nonprofit CRM pain compounds from duplicates; preventing them early is cheaper than cleaning later.
- Supports a pragmatic pilot posture: use deterministic heuristics first, allow more sophistication later.

**References**
- `docs/features/donation-intake-entry.md`
- `docs/USER_RUNBOOK.md`

> **Screenshot placeholder — Duplicate Suggestions**
>
> [Insert screenshot: donor match list + “use donor”/clear selection behaviour]

---

### 4) Recurring agreements (triage and monitoring view)
**What it’s for**
A lightweight monitoring view for recurring donation plans (agreements) so admins can spot issues early (overdue, paused/canceled, delinquent) and confirm that inbound gifts are linking to the correct plan.

**What exists in the POC UI**
- A list/monitor view with simple filters (e.g., overdue/paused/delinquent).
- A link-out to view the underlying records in Twenty.

**What to assume (WIP)**
- This is primarily a triage surface today, not a full recurring management console.

**References (directional)**
- `docs/features/recurring-donations.md`
- `docs/USER_RUNBOOK.md`

> **Screenshot placeholder — Recurring Agreements Monitor**
>
> [Insert screenshot: recurring agreements table + filter chips]

---

### 5) Appeals (attribution basics + solicitation snapshots)
**What it’s for**
Appeals provide a simple way to capture attribution and measure performance without building a full marketing suite inside the CRM. Solicitation snapshots support response-rate style reporting without requiring heavy per-contact campaign member tables.

**What exists in the POC UI**
- Basic appeal creation/editing.
- Solicitation snapshot capture (counts, source, captured date).

**Why this is valuable**
- Keeps early attribution lean while leaving room for optional future complexity (segments, tracking codes, deeper marketing integrations).

**References**
- `docs/features/campaigns-appeals.md`

> **Screenshot placeholder — Appeals View**
>
> [Insert screenshot: appeal list + create/edit modal]
>
> **Screenshot placeholder — Solicitation Snapshots**
>
> [Insert screenshot: snapshot list and capture form]

---

### 6) Households (pilot data hygiene tooling)
**What it’s for**
Households are an optional structure to manage shared mail details and stewardship patterns, without making households the “donor of record”. The intent is to keep the model lean and reversible.

**What exists in the POC UI**
- A households management surface (create/edit, membership management).
- Tools that support shared address/mail settings in a controlled way.

**References**
- `docs/features/households.md`

> **Screenshot placeholder — Households View**
>
> [Insert screenshot: household detail + members list + address tools]

---

### 7) Reconciliation (payout-first operational reconciliation)
**What it’s for**
A lightweight approach to help nonprofits reconcile CRM gifts to what actually settled in payouts/deposits, without building a full accounting ledger.

**What exists in the POC UI**
- A reconciliation view oriented around payout records.
- Ability to create/manage payouts and inspect status buckets (pending, reconciled, variance, etc.).
- Linking/unlinking gifts to payouts (reconciliation evidence and workflow support).

**References**
- `docs/features/donation-reconciliation.md`

> **Screenshot placeholder — Reconciliation Dashboard**
>
> [Insert screenshot: payouts table + filters + payout drawer]

---

## Integrations (API-only / scaffold today)
This section is intentionally high level; details will evolve as connectors are validated.

### Stripe (API-only / WIP)
- Intended role: ingest donations via webhooks and feed them into the same staging pipeline as manual entry.
- Current status: implemented as a service capability, but not yet treated as fully proven operational behaviour in the console.

### GoCardless (scaffold)
- Intended role: UK Direct Debit rail for recurring and one-off donations.
- Current status: scaffold only; included to show direction and planned modular connector approach.

---

## Modularity and future modules (roadmap, not built yet)
The long-term goal is a modular nonprofit suite on top of Twenty CRM, where modules can be enabled based on organisational needs (Fundraising first; Volunteers/Grants/Programs later).

Today, we reference these modules only as roadmap context. The fundraising slice is the proof point for:
- Lean defaults with opt-in complexity
- A consistent staging/validation pattern for operational reliability
- A path for partners to extend vertically without forking core CRM behaviour

---

## Status and caveats (read before drawing conclusions)
- Everything described here is proof-of-concept quality and work in progress.
- The UI and data model are expected to change as we test pilots and refine requirements.
- The purpose of sharing this is to help partners understand the intended workflows and give informed feedback—without needing to read code.

---

## Appendix: pointers to deeper material
- Data model companion: `docs/FUNDRAISING_DATA_MODEL.md`
- Operator view: `docs/USER_RUNBOOK.md`
- Intake and manual entry direction: `docs/features/donation-intake-entry.md`
- Staging direction: `docs/features/donation-staging.md`, `docs/solutions/gift-staging-processing.md`
- Recurring direction (forward-looking): `docs/features/recurring-donations.md`
- Appeals direction: `docs/features/campaigns-appeals.md`
- Households direction: `docs/features/households.md`
- Reconciliation direction: `docs/features/donation-reconciliation.md`
