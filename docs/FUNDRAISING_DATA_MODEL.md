# Fundraising Data Model (POC, Work in Progress)
Working draft v0 (Jan 2026)

## Purpose
This document describes the **current Fundraising module data model** implemented as a managed extension on top of Twenty CRM.

It is designed to be:
- **Light technical** (readable by partners without reading code)
- **Grounded in what exists today** (objects/fields provisioned in Twenty)
- Explicitly **work in progress** (names, fields, and relationships will evolve before pilot/production)

## Source of truth (today)
- Metadata provisioning script: `services/fundraising-service/scripts/setup-schema.mjs`
- Runtime behaviour: `services/fundraising-service/src` (proxy + staging/processing logic)

This document is intended to become the human-friendly “source of truth”, while the script remains the provisioning mechanism; they should stay aligned.

## Important note on relationship fields (GraphQL provisioning)
Older runbooks referenced manually creating lookup/relation fields. That guidance predates the discovery that **relationship fields can be created via Twenty’s GraphQL metadata API**.

Current state:
- Relationship provisioning is available via GraphQL and is standardised in the provisioning script for core fundraising links.
- Optional/roadmap relationships remain documented as **assumptions pending confirmation** until automated.
- **Naming convention for this document:** list the relation field API name without the `Id` suffix (e.g., `appeal`, `household`, `donor`). The REST payloads still accept `<relationName>Id` for linking (e.g., `appealId`, `householdId`, `donorId`).

---

## Entity map (high level)
> **Diagram placeholder — Fundraising data model map**
>
> Suggested diagram nodes:
> - Twenty core: `person`, `company`, `opportunity`
> - Fundraising custom objects: `gift`, `giftStaging`, `recurringAgreement`, `appeal`, `solicitationSnapshot`, `giftPayout`, `household`
> - Main relations: `giftStaging → gift` (promotion), and `gift/giftStaging → donor/appeal/recurringAgreement/giftPayout` (links)

---

## Objects and fields
Tables list:
- **API name** (script `name`)
- **Label** (script `label`)
- **Type** (script `type`)
- **Purpose** (why it exists in workflows)

### 1) Gift (`gift`)
**What it represents**
Canonical committed donation record in Twenty; this is the output of the intake + staging pipeline.

**Scripted fields**
| API name | Label | Type | Purpose |
|---|---|---|---|
| `amount` | Amount | `CURRENCY` | Gift amount (currency field). |
| `feeAmount` | Fee Amount | `CURRENCY` | Fees associated with the payment (if known). |
| `date` | Gift Date | `DATE` | Gift date for reporting/rollups. |
| `externalId` | External ID | `TEXT` | External reference for idempotency (processor transaction ID / import row key). |
| `paymentMethod` | Payment Method | `TEXT` | High-level method (card, direct debit, cash, cheque, bank transfer, etc.). |
| `donorFirstName` | Donor First Name | `TEXT` | Donor snapshot for ops visibility and audit. |
| `donorLastName` | Donor Last Name | `TEXT` | Donor snapshot for ops visibility and audit. |
| `donorEmail` | Donor Email | `TEXT` | Donor snapshot for ops visibility and audit. |
| `provider` | Provider | `TEXT` | Provider identifier (e.g., stripe, gocardless, manual). |
| `providerPaymentId` | Provider Payment ID | `TEXT` | Provider payment reference for reconciliation/idempotency. |
| `intakeSource` | Intake Source | `TEXT` | Ingestion channel (manual entry, webhook, import, etc.). |
| `notes` | Notes | `TEXT` | Operator notes / context. |
| `recurringStatus` | Recurring Status Snapshot | `TEXT` | Lightweight recurring snapshot used in operations (WIP). |
| `recurringMetadata` | Recurring Metadata | `RAW_JSON` | Provider/recurring metadata blob (WIP). |
| `giftIntent` | Gift Intent | `TEXT` | Intent classification used to keep UI and review flows focused (WIP). |
| `isInKind` | Is In-Kind | `BOOLEAN` | Whether gift is in-kind. |
| `inKindDescription` | In-Kind Description | `TEXT` | Free-text description for in-kind gifts. |
| `estimatedValue` | Estimated Value | `NUMBER` | Estimated value for in-kind gifts (if applicable). |
| `receiptStatus` | Receipt Status | `TEXT` | Receipt state marker (WIP). |
| `receiptSentAt` | Receipt Sent At | `DATE_TIME` | Timestamp when receipt was sent (if sent). |
| `receiptPolicyApplied` | Receipt Policy Applied | `TEXT` | Policy key/version applied (WIP). |
| `receiptChannel` | Receipt Channel | `TEXT` | Delivery channel (email/print/etc.) (WIP). |
| `receiptTemplateVersion` | Receipt Template Version | `TEXT` | Template/version used (WIP). |
| `receiptError` | Receipt Error | `TEXT` | Error detail if receipt generation/sending failed (WIP). |
| `receiptDedupeKey` | Receipt Dedupe Key | `TEXT` | Idempotency key for receipting (WIP). |

**Relationship fields (scripted via GraphQL)**
| API name | Label | Type | Target | Purpose / Notes |
|---|---|---|---|---|
| `donor` | Donor | `RELATION` | `person` | Links the gift to the donor/supporter (Person). |
| `company` | Company | `RELATION` | `company` | Links an organisation gift/employer context. |
| `opportunity` | Opportunity | `RELATION` | `opportunity` | Links to opportunity-style records (pledges/grants/major gifts). |
| `appeal` | Appeal | `RELATION` | `appeal` | Attribution for appeal/campaign reporting. |
| `recurringAgreement` | Recurring Agreement | `RELATION` | `recurringAgreement` | Links installment gifts to the underlying agreement. |
| `giftPayout` | Gift Payout | `RELATION` | `giftPayout` | Links gifts to payout/deposit for reconciliation. |

> **Screenshot placeholder — Gift record in Twenty**
>
> [Insert screenshot of Gift object fields + relations]

---

### 2) Gift Staging (`giftStaging`)
**What it represents**
Temporary staging record used to validate/dedupe/review gifts before committing a canonical Gift.

**Scripted fields**
| API name | Label | Type | Purpose |
|---|---|---|---|
| `source` | Source | `TEXT` | Generic/legacy source marker (WIP). |
| `intakeSource` | Intake Source | `TEXT` | Ingestion channel (manual entry, webhook, import, etc.). |
| `sourceFingerprint` | Source Fingerprint | `TEXT` | Idempotency fingerprint across retries/import runs. |
| `externalId` | External ID | `TEXT` | External transaction/import identifier. |
| `amount` | Amount | `CURRENCY` | Amount as currency field (used for review + commit). |
| `amountMinor` | Amount (minor units) | `NUMBER` | Amount in minor units for quick filtering and display. |
| `feeAmount` | Fee Amount | `CURRENCY` | Fee amount (if known). |
| `feeAmountMinor` | Fee Amount (minor units) | `NUMBER` | Fee in minor units (ops convenience). |
| `paymentMethod` | Payment Method | `TEXT` | Payment method snapshot. |
| `dateReceived` | Date Received | `DATE` | Operational “received” date (used across intake flows). |
| `expectedAt` | Expected At | `DATE` | Expected payment/installment date (recurring operations). |
| `validationStatus` | Validation Status | `TEXT` | Validation state marker (WIP but used by the console). |
| `dedupeStatus` | Dedupe Status | `TEXT` | Dedupe state marker (WIP but used by the console). |
| `promotionStatus` | Promotion Status | `TEXT` | Processing/commit lifecycle marker (legacy naming; see Status section). |
| `autoPromote` | Auto Promote | `BOOLEAN` | Whether rows can be auto-processed (policy-driven). |
| `giftAidEligible` | Gift Aid Eligible | `BOOLEAN` | UK-only eligibility marker (WIP). |
| `giftBatchId` | Gift Batch ID | `TEXT` | Batch/group marker (WIP; currently an ID string). |
| `provider` | Provider | `TEXT` | Provider identifier (stripe/gocardless/manual/import). |
| `providerPaymentId` | Provider Payment ID | `TEXT` | Provider payment reference. |
| `providerContext` | Provider Context | `RAW_JSON` | Provider metadata blob (raw, provider-shaped). |
| `donorFirstName` | Donor First Name | `TEXT` | Donor snapshot for ops review. |
| `donorLastName` | Donor Last Name | `TEXT` | Donor snapshot for ops review. |
| `donorEmail` | Donor Email | `TEXT` | Donor snapshot for ops review. |
| `notes` | Notes | `TEXT` | Operator/review notes. |
| `errorDetail` | Error Detail | `RAW_JSON` | Structured error detail for failures/retries. |
| `rawPayload` | Raw Payload | `RAW_JSON` | Original ingestion payload retained for audit/debug. |
| `giftIntent` | Gift Intent | `TEXT` | Intent classification (donor vs organisation, in-kind) (WIP). |
| `isInKind` | Is In-Kind | `BOOLEAN` | In-kind flag. |
| `inKindDescription` | In-Kind Description | `TEXT` | In-kind description. |
| `estimatedValue` | Estimated Value | `NUMBER` | In-kind estimated value. |

**Relationship fields (scripted via GraphQL)**
| API name | Label | Type | Target | Purpose / Notes |
|---|---|---|---|---|
| `donor` | Donor | `RELATION` | `person` | Selected/matched donor; used during processing and review. |
| `company` | Company | `RELATION` | `company` | Organisation gifts/corporate context. |
| `opportunity` | Opportunity | `RELATION` | `opportunity` | Optional linkage for opportunity-style records. |
| `appeal` | Appeal | `RELATION` | `appeal` | Attribution for appeal reporting. |
| `recurringAgreement` | Recurring Agreement | `RELATION` | `recurringAgreement` | Installment linkage for recurring operations. |
| `giftPayout` | Gift Payout | `RELATION` | `giftPayout` | Links staged rows to a payout/deposit for reconciliation. |
| `gift` | Gift | `RELATION` | `gift` | Linked committed gift after promotion. |

> **Screenshot placeholder — Gift staging record review**
>
> [Insert screenshot of staging drawer showing statuses + donor + processing actions]

---

### 3) Gift Payout (`giftPayout`)
**What it represents**
Processor payout or bank deposit grouping multiple gifts for reconciliation.

**Scripted fields**
| API name | Label | Type | Purpose |
|---|---|---|---|
| `sourceSystem` | Source System | `TEXT` | Stripe/GoCardless/PayPal/manual/etc. |
| `payoutReference` | Payout Reference | `TEXT` | Provider payout ID / bank deposit reference. |
| `depositDate` | Deposit Date | `DATE` | Settlement/deposit date. |
| `depositGrossAmount` | Deposit Gross Amount | `CURRENCY` | Gross deposited amount. |
| `depositFeeAmount` | Deposit Fee Amount | `CURRENCY` | Total fees. |
| `depositNetAmount` | Deposit Net Amount | `CURRENCY` | Net deposited amount. |
| `expectedItemCount` | Expected Item Count | `NUMBER` | Expected number of transactions. |
| `status` | Status | `TEXT` | Reconciliation status (see Status section). |
| `varianceAmount` | Variance Amount | `CURRENCY` | Variance amount when payout doesn’t match linked gifts. |
| `varianceReason` | Variance Reason | `TEXT` | Human explanation for variance. |
| `note` | Note | `TEXT` | Ops note/context. |
| `confirmedAt` | Confirmed At | `DATE_TIME` | When payout was confirmed reconciled. |
| `matchedGrossAmount` | Matched Gross Amount | `CURRENCY` | Sum of linked gifts (gross). |
| `matchedFeeAmount` | Matched Fee Amount | `CURRENCY` | Sum of linked gift fees. |
| `matchedGiftCount` | Matched Gift Count | `NUMBER` | Count of linked gifts. |
| `pendingStagingCount` | Pending Staging Count | `NUMBER` | Count of staged rows linked but not yet committed. |

---

### 4) Appeal (`appeal`)
**What it represents**
Lean attribution object for goals and performance tracking (without a heavy campaign-member model).

**Scripted fields**
| API name | Label | Type | Purpose |
|---|---|---|---|
| `appealType` | Appeal Type | `TEXT` | Simple classification (email, mail, event, etc.). |
| `description` | Description | `TEXT` | Free-text description. |
| `startDate` | Start Date | `DATE` | Appeal start date. |
| `endDate` | End Date | `DATE` | Appeal end date. |
| `goalAmount` | Goal Amount | `CURRENCY` | Target goal amount. |
| `targetSolicitedCount` | Target Solicited Count | `NUMBER` | Audience size snapshot input for response rate. |
| `budgetAmount` | Budget Amount | `CURRENCY` | Optional budget. |
| `raisedAmount` | Raised Amount | `CURRENCY` | Rollup/denormalized total raised (WIP). |
| `giftCount` | Gift Count | `NUMBER` | Rollup gift count (WIP). |
| `donorCount` | Donor Count | `NUMBER` | Rollup donor count (WIP). |
| `responseRate` | Response Rate | `NUMBER` | Derived metric (WIP; depends on snapshots + gifts). |
| `costPerPound` | Cost per £ | `NUMBER` | Derived metric (WIP; depends on budget + raised). |
| `lastGiftAt` | Last Gift At | `DATE_TIME` | Most recent gift timestamp (WIP). |

---

### 5) Solicitation Snapshot (`solicitationSnapshot`)
**What it represents**
Count snapshots (e.g., “we solicited 2,500 people via Mailchimp”) used for response-rate style reporting.

**Scripted fields**
| API name | Label | Type | Purpose |
|---|---|---|---|
| `countSolicited` | Count Solicited | `NUMBER` | Number solicited. |
| `source` | Source | `TEXT` | Where the snapshot came from (export/list build/etc.). |
| `capturedAt` | Captured At | `DATE_TIME` | When the snapshot was captured. |
| `notes` | Notes | `TEXT` | Context/notes. |

**Relationship fields (scripted via GraphQL)**
| API name | Label | Type | Target | Purpose / Notes |
|---|---|---|---|---|
| `appeal` | Appeal | `RELATION` | `appeal` | Links a snapshot to an appeal for response rate context. |

---

### 6) Recurring Agreement (`recurringAgreement`)
**What it represents**
Donor’s recurring commitment: amount, cadence, defaults, provider linkage. In the POC, it primarily supports monitoring/triage and linking gifts/installments.

**Scripted fields**
| API name | Label | Type | Purpose |
|---|---|---|---|
| `status` | Status | `TEXT` | Status (active/paused/canceled/delinquent/etc.) (WIP). |
| `cadence` | Cadence | `TEXT` | Cadence marker (monthly/annual/etc.) (WIP). |
| `intervalCount` | Interval Count | `NUMBER` | Interval for cadence (WIP). |
| `amount` | Amount | `CURRENCY` | Agreement amount (currency field). |
| `amountMinor` | Amount (minor units) | `NUMBER` | Amount in minor units (display/filter convenience). |
| `startDate` | Start Date | `DATE` | Start date. |
| `endDate` | End Date | `DATE` | End date (if applicable). |
| `nextExpectedAt` | Next Expected At | `DATE` | Next expected payment/installment date. |
| `autoPromoteEnabled` | Auto Promote Enabled | `BOOLEAN` | Whether installments can auto-promote (policy-driven). |
| `defaultAppealId` | Default Appeal ID | `TEXT` | Default appeal attribution (likely becomes relation later). |
| `defaultFundId` | Default Fund ID | `TEXT` | Default fund/designation (roadmap; likely becomes relation). |
| `defaultSoftCreditJson` | Default Soft Credit JSON | `RAW_JSON` | Placeholder for soft-credit defaults (WIP). |
| `giftAidDeclarationId` | Gift Aid Declaration ID | `TEXT` | UK-only placeholder (roadmap). |
| `provider` | Provider | `TEXT` | Stripe/GoCardless/manual/imported. |
| `providerAgreementId` | Provider Agreement ID | `TEXT` | Provider subscription/mandate reference. |
| `providerPaymentMethodId` | Provider Payment Method ID | `TEXT` | Provider payment method token/reference. |
| `mandateReference` | Mandate Reference | `TEXT` | UK direct debit mandate reference. |
| `providerContext` | Provider Context | `RAW_JSON` | Provider metadata blob. |
| `source` | Source | `TEXT` | Origin marker (migration/import/provider). |
| `canceledAt` | Canceled At | `DATE_TIME` | When canceled. |
| `completedAt` | Completed At | `DATE_TIME` | When completed (if applicable). |
| `statusUpdatedAt` | Status Updated At | `DATE_TIME` | When status last changed. |
| `totalReceivedAmount` | Total Received Amount | `CURRENCY` | Rollup/derived total received (WIP). |
| `paidInstallmentCount` | Paid Installment Count | `NUMBER` | Rollup/derived installment count (WIP). |
| `lastPaidAt` | Last Paid At | `DATE` | Last paid date (WIP). |
| `annualReceiptStatus` | Annual Receipt Status | `TEXT` | Annual receipting marker (WIP). |
| `annualReceiptSentAt` | Annual Receipt Sent At | `DATE_TIME` | Annual receipt sent timestamp. |
| `annualReceiptPeriod` | Annual Receipt Period | `TEXT` | Period identifier for annual receipt runs. |
| `annualReceiptPolicy` | Annual Receipt Policy | `TEXT` | Policy marker/version for annual receipts. |

**Relationship fields (scripted via GraphQL)**
| API name | Label | Type | Target | Purpose / Notes |
|---|---|---|---|---|
| `donor` | Donor | `RELATION` | `person` | Links the agreement to the supporter. |

---

### 7) Household (`household`)
**What it represents**
Optional stewardship grouping for shared mail details and rollups (individuals remain donors of record).

**Scripted fields**
| API name | Label | Type | Purpose |
|---|---|---|---|
| `envelopeName` | Envelope Name | `TEXT` | Mailing envelope name (e.g., “The Smith Family”). |
| `salutationFormal` | Salutation (Formal) | `TEXT` | Formal salutation for mailings. |
| `salutationInformal` | Salutation (Informal) | `TEXT` | Informal salutation. |
| `mailingAddress` | Mailing Address | `ADDRESS` | Shared mailing address (nullable). |
| `lifetimeGiftAmount` | Lifetime Gift Amount | `CURRENCY` | Rollup amount (WIP depending on rollup engine). |
| `lifetimeGiftCount` | Lifetime Gift Count | `NUMBER` | Rollup count (WIP). |
| `firstGiftDate` | First Gift Date | `DATE` | Rollup date (WIP). |
| `lastGiftDate` | Last Gift Date | `DATE` | Rollup date (WIP). |
| `yearToDateGiftAmount` | Year-To-Date Gift Amount | `CURRENCY` | Rollup amount (WIP). |
| `yearToDateGiftCount` | Year-To-Date Gift Count | `NUMBER` | Rollup count (WIP). |
| `lastGiftMemberName` | Last Gift Member Name | `TEXT` | Convenience field for “who gave last” (WIP). |

**Relationship fields (scripted via GraphQL)**
| API name | Label | Type | Target | Purpose / Notes |
|---|---|---|---|---|
| `primaryContact` | Primary Contact | `RELATION` | `person` | Primary person for addressing defaults. |

---

## Core object augmentations (Twenty native objects)
The provisioning script also adds fundraising-related fields to core objects.

### Person (`person`)
| API name | Label | Type | Purpose |
|---|---|---|---|
| `lifetimeGiftAmount` | Lifetime Gift Amount | `CURRENCY` | Rollup target for giving totals. |
| `lifetimeGiftCount` | Lifetime Gift Count | `NUMBER` | Rollup target for giving counts. |
| `lastGiftDate` | Last Gift Date | `DATE` | Rollup target. |
| `firstGiftDate` | First Gift Date | `DATE` | Rollup target. |
| `yearToDateGiftAmount` | Year-To-Date Gift Amount | `CURRENCY` | Rollup target. |
| `yearToDateGiftCount` | Year-To-Date Gift Count | `NUMBER` | Rollup target. |
| `mailingAddress` | Mailing Address | `ADDRESS` | Used in household stewardship workflows. |

**Relationship fields (scripted via GraphQL)**
| API name | Label | Type | Target | Purpose / Notes |
|---|---|---|---|---|
| `household` | Household | `RELATION` | `household` | Links the person to a household for shared stewardship/mailing. |

### Company (`company`)
| API name | Label | Type | Purpose |
|---|---|---|---|
| `lifetimeGiftAmount` | Lifetime Gift Amount | `CURRENCY` | Rollup target for organisation gifts. |
| `lifetimeGiftCount` | Lifetime Gift Count | `NUMBER` | Rollup target. |
| `firstGiftDate` | First Gift Date | `DATE` | Rollup target. |
| `lastGiftDate` | Last Gift Date | `DATE` | Rollup target. |
| `yearToDateGiftAmount` | Year-To-Date Gift Amount | `CURRENCY` | Rollup target. |
| `yearToDateGiftCount` | Year-To-Date Gift Count | `NUMBER` | Rollup target. |

### Opportunity (`opportunity`) (WIP)
| API name | Label | Type | Purpose |
|---|---|---|---|
| `opportunityType` | Opportunity Type | `TEXT` | Lightweight classification (WIP). |
| `giftsCount` | Gifts Count | `NUMBER` | Rollup target count (WIP). |
| `giftsReceivedAmount` | Gifts Received Amount | `CURRENCY` | Rollup target amount (WIP). |

---

## Status conventions (WIP)
This section lists known values in current POC flows and should be treated as evolving.

### Gift staging lifecycle (current naming uses `promotionStatus`)
Examples used in the POC console/processing flow:
- `pending`
- `ready_for_commit`
- `committing`
- `committed`
- `commit_failed`

### Validation and dedupe
Examples:
- `validationStatus`: `pending`, `passed`
- `dedupeStatus`: `pending`, `passed`, `needs_review`

### Gift payout reconciliation
Examples used in current UI:
- `pending`
- `partially_reconciled`
- `reconciled`
- `variance`

### Recurring agreement status
Examples used in current UI:
- `active`
- `paused`
- `canceled`
- `delinquent`

---

## Roadmap entities (not yet implemented as full objects)
Likely future/optional fundraising entities (explicitly WIP until implemented/validated):
- `fund` / designation
- `trackingCode`
- `appealSegment`
- `giftAidDeclaration` (UK-only toggleable)
- `giftBatch` (first-class batching)
- receipt objects (formal receipt entities vs receipt metadata fields)

---

## References
- Provisioning: `services/fundraising-service/scripts/setup-schema.mjs`
- Workflow context: `docs/USER_RUNBOOK.md`
- Intake direction: `docs/features/donation-intake-entry.md`
- Staging direction: `docs/features/donation-staging.md`, `docs/solutions/gift-staging-processing.md`
- Appeals direction: `docs/features/campaigns-appeals.md`
- Households direction: `docs/features/households.md`
- Reconciliation direction: `docs/features/donation-reconciliation.md`
- Recurring direction (forward-looking): `docs/features/recurring-donations.md`
