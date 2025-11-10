# Opportunities & Gifts — Lean Revenue Model (Repo Spec)

**Purpose**  
Define a **simple, flexible** fundraising data model and UX where:
- **Opportunity** = *solicitation pipeline* (asks, applications, proposals, pledges/awards-in-principle).
- **Gift** = *money received* (each payment/receipt, incl. in-kind).

This keeps day-to-day finance and reporting clean (Gifts), while making pipeline complexity optional (Opportunities). Target users: **small–mid nonprofits (UK-first, global-ready)**.

---

## Core Principles

1. **Separation of concerns**
   - **Opportunities** hold stages, collaboration, follow-ups, expected/committed amounts.
   - **Gifts** are the single source of truth for revenue, receipts, Gift Aid, reconciliation, and attribution.

2. **Lean by default**
   - Most one-off/online donations skip Opportunities entirely (create **Gift** only).
   - Pipeline is **opt-in** per use case (grants, HNW, sponsorships, legacies).

3. **Minimal shared schema**
   - One Gifts table powers income analytics; Opportunities power pipeline/forecast.
   - Optional helpers (e.g., payment schedules) only when needed.

4. **UK-ready**
   - Gift Aid declarations & eligibility on Gifts; Direct Debit (GoCardless) flows; SCA for cards.

5. **Modular**
   - Memberships/events are separate modules if enabled; fees/tickets still recorded as **Gifts**.

---

## Data Model

### Opportunity (solicitation / pledge / pipeline)
- `id`
- **Who**: `primaryContactId` (or `orgId`), *optional household visibility*
- **What**: `name`, `typeSubtype` *(Grant | MajorGift | Corporate | Legacy | Membership-Acquisition | Other)*
- **Pipeline**: `stage`, `probability`, `expectedCloseDate`, `amountTarget`
- **Commitment (optional)**: `amountCommitted`, `commitmentDate` *(pledge/award recorded but unpaid)*
- **Defaults (optional)**: `defaultFundId`, `defaultAppealId`
- **Admin & Collab**: `ownerId`, notes, tasks, followers, files
- **Rollups (read-only)**:
  - `giftsCount`
  - `giftsReceivedAmount`
  - `balanceOutstanding = amountCommitted - giftsReceivedAmount` *(null-safe)*

> Notes  
> - We intentionally **do not** treat `amountCommitted` as revenue. Gifts are revenue.  
> - If more granular expected installments are needed later, add optional `OpportunityPaymentSchedule` (see Roadmap).

---

### Gift (every payment / receipt)
- `id`
- **Who/When**: `contactId` (or `orgId`), `dateReceived`, `currency`, `amount`
- **Linkage**: `opportunityId` *(nullable — only when sourced from a solicitation)*
- **Method**: `paymentMethod` *(card, directDebit, cash, cheque, bankTransfer, inKind, other)*  
  - For reversals: `reversalOfGiftId` *(optional negative gift pattern)*
- **Attribution**: `fundId` *(designation)*, `appealId`, `appealSegmentId`, `trackingCodeId`
- **Gift Aid (UK)**: `giftAidEligible`, `giftAidDeclarationId`
- **External refs**: `processorTxnId`, `importRowId`, `sourceSystem`
- **Extras (optional)**: `softCreditContactId`, `splitAllocations[]` *(list of `{fundId, amount}`)*, `notes`
- **In-kind**: `isInKind` (bool), `inKindDescription`, `estimatedValue`

> Pattern  
> - **One installment = one Gift.**  
> - Multi-year grants/pledges → multiple Gifts linked to the same Opportunity.

---

### Optional helpers (feature-flagged)

**OpportunityPaymentSchedule** *(child of Opportunity)*  
- `dueDate`, `scheduledAmount`, `status` *(Due/Paid/Deferred/Cancelled)*  
> Used to track *expected* installments; Gifts are created only when cash lands.

**RecurringAgreement** *(for DD/cards)*  
- `contactId`, `provider` *(Stripe/GoCardless)*, `startDate`, `cadence`, `status`, `amount`  
> Source of truth is the provider; webhooks generate Gifts and update status.

**Membership (separate module)**  
- `contactId`, `membershipType`, `startDate`, `endDate`, `status`, `autoRenew`  
> Membership **payments are Gifts**; link Gift→Membership for lifecycle analytics.

**Event (separate module)**  
- `eventId`, metadata (name, date, location, capacity)  
> Event income are **Gifts** tagged with `eventId` or via `appealId`.

---

## Key Relationships

- **Gift → Opportunity** *(0..1)*: Payment against an ask/proposal/pledge.
- **Gift → Fund/Appeal/TrackingCode**: For designation & campaign performance.
- **Gift → GiftAidDeclaration**: For UK tax reclaim; declaration may pre-exist.
- **Opportunity → Contact/Org**, tasks, notes, files: for moves management.
- **Membership/Event modules**: Gifts link-out when modules are enabled.

---

## Core Workflows

### 1) Simple/Online Donation (no Opportunity)
1. Donor pays via **Stripe/GoCardless** form (SCA/mandate handled).
2. Webhook creates **Gift** (auto-attributes `appealId`/`trackingCodeId` via UTM).
3. Receipting/Gift Aid queued per org rules; reconciliation picks up deposit.

### 2) Grant or Major Gift (with Opportunity)
1. Fundraiser creates **Opportunity**, sets `typeSubtype`, `stage`, `amountTarget`; collaborates via tasks/notes.
2. When awarded/pledged: set `amountCommitted` (+ optional schedule).
3. As funds arrive: create **Gifts** linked to the Opportunity (prefill fund/appeal defaults).
4. Rollups update: `giftsReceivedAmount`, `balanceOutstanding = amountCommitted - giftsReceivedAmount`.  
   Reports use Gifts for income; Opportunities for forecast.

### 3) Pledge / Multi-installment
- Minimal: track `amountCommitted` on Opportunity; each payment → Gift.  
- With schedule (opt): define due dates; overdue reminders; still only Gifts count as income.

### 4) Legacy / Bequest
- Opportunity `typeSubtype=Legacy`, stages (Notified → Probate → Realised).
- Each estate distribution → **Gift** linked to the Opportunity.

### 5) Corporate Sponsorship / In-Kind
- Opportunity for negotiation/stage; **Gift** with `isInKind` & description (and/or cash component).  
- Deliverables tracked as tasks/files (or future light “Deliverables” child if needed).

### 6) Membership (module on)
- Membership record manages status/term.  
- New/renewal fee → **Gift** linked to Membership; optional Acquisition Opportunity when doing member drives.

---

## UX / UI

**Opportunity workspace**
- Pipeline Kanban/list with filters by `typeSubtype` and owner.
- Header rollup: *Committed £X / Received £Y / Outstanding £Z*.
- Tabs: Overview, Activity (tasks/notes/emails), Files, Gifts (linked), Schedule (if enabled).
- Quick actions: Add Gift (prefilled), Log Task, Advance Stage.

**Gift entry**
- Fast, keyboard-first batch UI (defaults for fund/appeal/date/method).
- Inline contact search/quick-create + dedupe warnings.
- Gift Aid status preview + one-click declaration capture (UK).
- If launched from Opportunity: prefilled fund/appeal + auto-link.

**Donation forms (online)**
- Wallets (Apple/Google Pay), SCA, DD mandates; minimal fields.
- UTM/Tracking auto-capture; fee-cover prompt; Gift Aid checkbox + declaration.
- Self-serve portal (Phase 2): manage recurring; download receipts.

**Reconciliation alignment**
- Finance dashboards use **Gifts** only; group by payout/deposit.  
- Deposits show variance and linked Gifts.

---

## Validation & Rules

- **Gifts**
  - `amount > 0`, `dateReceived <= today` (overrideable by permission).
  - `paymentMethod` consistent (e.g., `directDebit` respects Bacs lead times).
  - `fundId` required if org enforces designation; `appealId` recommended (auto for digital).
  - **Duplicate prevention**: block on identical `processorTxnId`; warn on same contact+amount+date (±1d).
  - Gift Aid: require active declaration or capture inline if eligible.

- **Opportunities**
  - `expectedCloseDate` required when stage in pipeline.
  - `amountCommitted` cannot be negative; **report-only** (not revenue).
  - Stage transitions may auto-create tasks (e.g., stewardship on Close Won).

---

## Reporting

- **Income (actuals)**: Gifts by fund, appeal, channel, method; YoY; donor cohorts.
- **Campaign performance**: Gifts by appeal/segment/tracking code; response rates via solicitation snapshots.
- **Pipeline**: Opportunities by stage/probability/owner; forecast vs targets.
- **Pledge realisation**: Opportunities with `amountCommitted` vs sum(Gifts).
- **Legacy pipeline**: counts by stage, realised amounts.
- **Membership** (module): active/lapsed counts; revenue (Gifts) by type.

> Finance exports & reconciliation pull **Gifts** only (never commitments).

---

## API & Integrations

- **Webhooks ingestion**: Stripe/GoCardless events (verified, idempotent) → Gifts.
- **Marketing**: send “Gift created” events; audience sync from segments; campaign `appealId` ties comms→gifts.
- **Accounting (later)**: deposit summaries; push grouped Gifts (net/gross/fees) to Xero/QuickBooks.

---

## KPIs / Success Criteria

- ≥ **95%** online Gifts auto-attributed to `appealId` via tracking.
- **Zero** double counting: revenue = sum(Gifts); commitments excluded.
- **Time to log a Gift** (manual) ≤ **30s** p95 with defaults.
- **Forecast accuracy**: (Committed − Outstanding) trend improves after adoption.
- **Reconciliation variance**: < **0.5%** unmatched Gifts per month.

---

## Defaults (Recommended)

- Online: `Gift` only (no Opportunity).  
- Grant/HNW/corporate/legacy: use Opportunity; Gifts link when received.  
- Gift Aid prompt for UK donors; capture declaration text version.  
- Batch gift entry requires defaults (fund/date/method).  
- Refunds as negative Gifts linking the original.

---

## Risks & Mitigations

- **User confusion (commitment vs revenue)** → Clear UI labels, tooltips, and training; revenue widgets pull Gifts only.
- **Over-modeling** → Feature-flag schedules/advanced modules; progressive disclosure in forms.
- **Data drift** (Gifts not linked to relevant Opp) → Gentle reminder when adding Gifts near an open Opp for same donor.

---

## Roadmap

**Phase 1 (MVP)**
- Opportunity & Gift entities with fields above.
- Gift entry (batch), online forms (Stripe cards+wallets; GoCardless DD one-off/monthly).
- UTM/Tracking → `appealId`; Gift Aid capture; basic dashboards.
- Reconciliation summaries based on Gifts.

**Phase 2**
- Self-serve donor portal for recurring management.
- OpportunityPaymentSchedule (optional), reminders for due installments.
- Membership module v1 (status/term; link payments as Gifts).
- Refunds/chargebacks as negative Gifts; reversal workflows.
- AI: duplicate detection; Gift default predictions (fund/appeal).

**Phase 3**
- Event module v1 (metadata + Gift tagging).
- Accounting sync (Xero/QB) deposit pushes; fee handling.
- Advanced attribution (multi-touch side table) if demanded.
- Grant light “Deliverables” child (deadlines, reports) when orgs ask.

---

## Open Questions / Spikes

- **Membership location**: keep separate module (recommended) to avoid bloating Gift/Opportunity forms?  
- **Multi-touch attribution**: do we need fractional credit now, or keep last-touch on Gift until demand?  
- **Granular pledge schedules**: validate need across early adopters before shipping the schedule object.

---

## Summary

This model:
- Keeps **financial truth** simple (Gifts) and **pipeline** powerful (Opportunities).
- Avoids forcing complexity on small orgs while scaling to grants, HNW, sponsorships, legacies.
- Aligns with reconciliation, receipting, and campaign analytics out of the box.
- Leaves room for optional modules (Membership, Events) without polluting core flows.
