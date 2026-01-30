# Recurring Donations — Lean, Modular Design (UK Focus)

**Purpose:** Outline the target experience and technical framing for recurring donations in our lean managed-extension stack. Audience: engineers, product, and AI tooling that assist implementation.

**Scope:** Forward-looking guide. Treat structures as provisional until Phase 1 spikes land.

---

## Assumptions & Pending Decisions

- **Data home:** Recurring data will live in Twenty custom objects once metadata automation is reliable. We proceed as if API gaps are temporary, revisiting only if D-0000 triggers a shift away from API-first.
- **Gift linkage:** Every successful installment surfaces as a Twenty Gift. Naming (`gift_installment` vs. `charge`) and whether we persist an "expected" shadow record remain open; revisit when the metadata schema is drafted.
- **Automation ownership:** Dunning, exception handling, and donor self-service flows may live in fundraising-service, n8n, or a blend. Document requirements now; decide tooling during implementation planning.

---

## Product Goals & Constraints

- **Optimised for UK reality:** GoCardless (Direct Debit) and Stripe (cards) are the primary rails.
- **Lean, modular, low-admin:** Prefer provider features (scheduling, retries, PCI scope) over rebuilding them.
- **Clarity over complexity:** Simple objects with explicit state transitions and audit trails.
- **High data quality / UX:** Fast, accurate, low-touch operations with donor self-service as the default path.

## Core Concepts (Data & Workflow)

- **Recurring Agreement:** Donor commitment (amount, cadence, payment method, coding defaults, start/end).
- **Gift Installment:** A single occurrence (expected vs. posted) that maps to the Gift record in Twenty.
- **Payment Method:** Tokenised card or bank mandate metadata (store provider tokens only).
- **Provider Objects:** Stripe `subscription` / `invoice` / `payment_intent`; GoCardless `subscription` / `payment` / `mandate`.
- **Events & Dunning:** Webhooks drive state. Providers attempt retries first; CRM escalates exceptions.
- **Receipting:** Configurable cadence (first/every/annual) with charge-level Gift Aid eligibility.

## Minimal Data Model (Provisional)

Plan to model agreements and installments inside Twenty metadata once relation field automation lands. Fields below are a starting point; treat as a checklist for the metadata spike.

### Objects & Key Fields

**Recurring Agreement (custom object)**
- `id`
- `contactId` (lookup to Person)
- `status` (`active`, `paused`, `canceled`, `completed`, `delinquent`)
- `cadence` (enum: `monthly`, `quarterly`, `annual`, `weekly`, `custom`)
- `intervalCount` (numeric; pairs with `cadence`)
- `amount` (`amountMicros`, `currencyCode`)
- `startDate`, optional `endDate`
- `nextExpectedAt`
- `autoProcessEnabled` (boolean)
- Defaults: `defaultCampaignId`, `defaultFundId`, `defaultSoftCreditJson`
- Gift Aid: `giftAidDeclarationId`
- Provider linkage: `provider` (`stripe`, `gocardless`, `manual`, `imported`), `providerAgreementId`, optional `providerPaymentMethodId`, `mandateReference`, and `providerContext` (JSON blob for rail-specific metadata like scheme or plan nickname)
- Source/audit: `source`, `createdById`, `updatedById`, timestamps (`createdAt`, `updatedAt`, `canceledAt`, `completedAt`)

**Gift Installment (working name; posts as Gift)**
- `id`
- `recurringAgreementId`
- `providerPaymentId`
- `expectedAt`, `postedAt`
- `amount` (`amountMicros`, `currencyCode`)
- `status` (`pending`, `paid`, `failed`, `refunded`, `canceled`)
- `failureReason`, `retryCount`
- Coding overrides: `campaignId`, `fundId`, `softCreditJson`
- Gift Aid: `eligible`, `claimed`, `refundAdjusted`
- `receiptId` (lookup), `notes`, `createdAt`
- Optional finance metadata: `payoutId`, `providerStatus`

**Payment Method (custom object or extended existing)**
- Defer for future iteration; MVP stores rail references on the agreement and installment via `providerPaymentMethodId` and `providerContext`. Retain this section as a placeholder for when we graduate to a reusable payment method object.

**Supporting records (Phase 2+)**
- `webhook_event` style object for idempotency and replay (`providerEventId`, `payloadHash`, `receivedAt`, `processedAt`, `status`, `error`).
- `exception_queue` for unresolved failures (`context`, `severity`, `payloadRef`, `assignedTo`, `resolvedAt`).
- Optional `settlement_payout` when finance reconciliation becomes a priority.

> **Note:** The MVP does not pre-create “expected” installment records. We infer missed payments by comparing `RecurringAgreement.nextExpectedAt` against the latest posted Gift and only materialise installments once a real payload arrives (webhook, import, or manual entry).

## State Machines (Agreement & Installment)

**Agreement transitions**
- `active` → `paused` (admin or donor pause)
- `active` → `canceled` (donor cancel, mandate revoked, subscription deleted)
- `active` ↔ `delinquent` (N failed payments → delinquent; recovery → active)
- `active` → `completed` (end date reached or fixed-term fulfilled)

**Installment transitions**
- `pending` → `paid` (webhook success)
- `pending` → `failed` (webhook failure) → retry cycles → `paid` or stay `failed`
- `paid` → `refunded` (partial/full) with linked refund data
- `pending`/`paid` → `canceled` (provider void or admin action)

Define thresholds (e.g., failure counts, timing) during Phase 1 implementation.

## Best Practices (What to Build First)

### 1. Provider-led scheduling & webhook sync
- Lean on Stripe Subscriptions and GoCardless Subscriptions/Mandates for cadence, retries, card updates, and compliance. See `docs/DONATION_CONNECTOR_SCAFFOLDING.md` for connector design.
- Treat webhooks as authoritative; build idempotency keyed on `providerEventId` and `providerPaymentId`.

### 2. Explicit agreement object
- Model recurring intent as a first-class object with defaults, state, and audit history.
- Use AI for augmentation (legacy detection, churn prediction) later; don’t rely on heuristics as the source of truth.

### 3. Clear status & audit trail
- Separate "plan" vs. "installment" data even if they map to the same Gift record. Persist transitions for reporting and support.

### 3a. First Slice Flow Blueprint

**Stripe (card)**
- Checkout/portal success → fundraising-service ensures `RecurringAgreement` exists/updates defaults, `autoProcessEnabled=true`.
- `checkout.session.completed` / `invoice.payment_succeeded` webhooks create a `GiftStaging` row with `autoProcess=true`, `recurringAgreementId`, `providerPaymentId`, `expectedAt`.
- Staging auto-processes on success → creates `Gift` (copies defaults, stores `recurringAgreementId` & `providerPaymentId`), updates agreement `nextExpectedAt`.
- Failures (`invoice.payment_failed`) mark staging `validationStatus=failed`, agreement `status=delinquent`; recovery flips back to `active`.

**GoCardless (direct debit)**
- Mandate/subscription creation (outside scope) seeds/updates `RecurringAgreement` (`autoProcessEnabled=false`, `mandateReference`).
- `payment_created` webhook logs/updates staging row (`expectedAt`, `providerPaymentId`, `providerContext.providerStatus=pending`); remains pending.
- `payment_confirmed` → staging auto-process: create `Gift`, update `nextExpectedAt`, mark agreement `status=active`.
- `payment_failed` / `payment_cancelled` → staging `validationStatus=failed`, agreement `status=delinquent` or `canceled` (via service logic).

**Manual/import**
- Admin or CSV import creates/updates `RecurringAgreement` (`provider=manual|imported`, `autoProcessEnabled=false`).
- Each payment entry generates a staging row with `expectedAt`, amount override, and optional `providerPaymentId`.
- Admin uses staging UI to review, adjust, then process. Processing creates `Gift`, updates `nextExpectedAt`. Missed periods surfaced by comparing agreement schedule vs. last posted gift.

**Admin surfaces**
- Agreement overview: status/intake chips highlight overdue, paused/canceled, and delinquent plans; table remains the drill-down (donor, amount, cadence, next expected, status, provider).
- Agreement detail: overview (fields above + defaults, provider info), installments tab (staging + posted Gifts filtered by `recurringAgreementId`), actions (pause/resume/cancel).
- Staging queue: summary chips for intake sources and batches, drawer-first workflow, and contextual actions (review → process/retry) keep recurring and manual work in the same surface.

### 4. Dunning & recovery (provider first, CRM smart)
- Allow provider smart retries to run; mirror outcomes. Surface unresolved failures to an exception queue with SLAs and task routing.
- Capture donor comms requirements now; choose tooling (service vs. n8n) when automation scope is clearer.

### 5. Donor self-service (magic link, low friction)
- Provide hosted link to update payment method, amount/date, pause/skip, or cancel. Log every change (who/when/what).
- Explore rail switching (card → Direct Debit) to reduce fees; requires coordinated UX + automation.

### 6. Flexible receipting
- Support org-level policy: first installment, every installment, annual statement, or hybrid, with donor overrides.
- Generate receipts on `paid`; suppress duplicates on retries. Annual rollup job should integrate with Gift Aid exports.

### 7. Secure token handling
- Store provider IDs only; rely on hosted components (Stripe Checkout/Elements, GoCardless hosted mandate) to minimise PCI scope.

### 8. Reconciliation ready
- Plan to map provider payouts to installments (optional `settlement_payout`). Capture allocation defaults at agreement and overrides per installment.

### 9. Admin UX essentials (future-facing)
- Agreement summary (next date, last outcome, health), inline actions (pause, skip, change amount).
- Installment table filters (failed, unreceipted) with bulk actions (resend receipt, reclassify).
- Dashboards: active agreements, MRR, failure rate, delinquent list, expiring cards, cancellations.

### 10. AI augmentation (Phase 3)
- Detect legacy recurring patterns, score churn risk, optimise retry timing, and flag anomalies once base flows are stable.

## Webhooks & Idempotency

**Stripe**
- `invoice.payment_succeeded` → mark installment `paid`
- `invoice.payment_failed` / `charge.failed` → mark `failed`, trigger dunning
- `customer.subscription.updated|deleted` → update agreement status/schedule
- `charge.refunded` → mark `refunded`, adjust Gift Aid eligibility

**GoCardless**
- `payment.created|submitted|confirmed|failed|cancelled` → upsert installment + status
- `subscription.created|updated|cancelled` → keep agreement in sync
- `mandate.cancelled|failed` → set agreement `canceled` or `delinquent`

Store `providerEventId` + `providerPaymentId` with a payload hash; log processing timestamps and errors for replay.

## Failure Handling & Exceptions

- **Soft failures:** rely on provider retries; notify donor; mark installment `failed`; auto-resolve if later `paid`.
- **Hard failures:** escalate to staff; options include pause, cancel, or rail switch.
- **Delinquency rules:** e.g., three consecutive failures → agreement `delinquent`; recovery returns to `active`.
- **Duplicate payments:** detect same donor/amount/close timestamp and provider ref; flag for manual review.
- **Refunds:** track linked records and update Gift Aid claims accordingly.

## Gift Aid (UK)

- Link agreements to Gift Aid declarations; mark each installment `eligible` as appropriate.
- Adjust claims when refunds occur (`refundAdjusted`).
- Annual claims include recurring installments; document cutoff windows.

## Migration & Imports

- Stripe / GoCardless: backfill agreements from provider subscriptions/mandates, import historic installments from exports.
- Salesforce (NPSP RD2 / NPC Gift Commitments): map to agreements + generate installments for past payments.
- AI-assisted pattern detection can suggest agreements for repeated manual gifts; admins approve before creation.

## Roadmap

**Phase 1 (MVP)**
- Agreements, installments, and payment method metadata (Twenty custom objects).
- Stripe & GoCardless webhooks with idempotent processors.
- Basic dunning (provider-driven), receipts policy (first/every), charge-level Gift Aid flagging.
- Donor magic-link self-service (update method, cancel, amount/date change).
- Dashboards: active MRR, failures, expiring cards.
- No speculative installment records; missed payments inferred from `nextExpectedAt` plus actual Gift history.

**Phase 2**
- Pause/skip & schedule amendments; exception queue with SLAs.
- Annual statements; allocation defaults & per-installment overrides; payout reconciliation.
- Admin bulk tools (resend receipts, reclassify installments).

**Phase 3**
- AI: churn risk, anomaly detection, legacy pattern discovery.
- Standing orders / Open Banking feed: generate expected installments & reconcile against bank data.
- Advanced Gift Aid workflows, including automated refund clawback adjustments.

## Open Questions / Decisions

- Default receipting policy (org-level + donor override)?
- Delinquency grace window (# of failures, timeline)?
- CSV-driven Bacs exports or other legacy Direct Debit flows—bundle as optional module?
- Rail switch UX (card → Direct Debit) and success metrics?
- Portal scope (full login vs. magic-link only)?
- Naming: do we align metadata labels with Twenty’s Gift object or introduce a new "Gift Installment" entity?

## Success Criteria (Initial)

- Recurring plan setup in < 2 minutes via hosted forms.
- Webhook → CRM latency < 30s; zero duplicate installments recorded.
- 100% of first payments receipted automatically; annual statement job runs without errors.
- Provider retry + outreach improves recovery rate ≥ 15% vs. no-dunning baseline.
- Admins report they can manage recurring programs without spreadsheets.

---

Cross-reference: `docs/DONATION_CONNECTOR_SCAFFOLDING.md`, `docs/METADATA_RUNBOOK.md`, `DECISIONS.md` (D-0000, D-0015), `docs/TWENTY_GIFTS_API.md`.
