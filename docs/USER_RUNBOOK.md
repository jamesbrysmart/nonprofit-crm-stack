# Donation Admin Runbook (POC)

_Last updated: 2025-10-29_

This runbook captures the expected behaviour of the fundraising POC from a donation admin’s point of view. It covers what you should see in the UI, how recurring donations behave, and the actions you take as new gifts arrive. Treat it as living guidance; we will evolve it as features harden.

---

## 1. Where you work today

- **Manual gift entry** – quick form for one-off or catch-up gifts. Submits directly to staging (auto-promote off) so you can review before committing.
- **Staging queue** – central review list for anything pending (manual entry, Stripe webhooks, imports). The queue now highlights recurring metadata (provider, expected date, agreement id) and lets you filter by a specific recurring agreement.
- **Recurring agreements list** – snapshot of the latest agreement records provisioned in Twenty. Shows donor link, amount/cadence, next expected date, status, and provider so you can sanity-check Stripe/GoCardless activity.

---

## 2. Recurring donations in practice

### 2.1 Stripe card plans
- **What triggers the flow**: A `checkout.session.completed` webhook from Stripe.
- **What you see**:
  - A staging row with `intakeSource = stripe_webhook`, the Stripe subscription/payment IDs, and the linked recurring agreement ID (taken from Stripe metadata).
  - If Stripe supplied the next charge date, the staging row shows `Expected` with that calendar date.
- **What happens on approve**:
  - When the staging row commits (auto-promote or manual process), the corresponding recurring agreement is marked `active` and its `nextExpectedAt` is updated to the date Stripe provided (or our default +1 month fallback).
  - The final Gift record retains `recurringAgreementId`, `provider`, `providerPaymentId`, and the JSON `recurringMetadata` for later auditing.

### 2.2 GoCardless direct debit (skeleton status)
- **Current state**: `/webhooks/gocardless` accepts events and logs them; staging rows are not yet created automatically.
- **Admin expectation**: You may manually create staging rows for GoCardless payments, linking them to the recurring agreement. The promotion path updates the agreement just like Stripe once the staging record is committed.
- **Next iteration goal**: GoCardless webhooks will create/update staging rows so you only review exceptions (failed payments, mandate issues).

### 2.3 Manual/imported installments
- **Manual entry**: When you create or import a recurring payment manually, include `recurringAgreementId` and (optionally) `expectedAt`. After you process the row, the agreement’s `nextExpectedAt` advances (falls back to +1 month if no date was provided).
- **Missing payments**: Agreements still drive the “missed payment” check by comparing `nextExpectedAt` to the most recent posted Gift; you use the staging queue filter to investigate each agreement.

---

## 3. Daily/weekly admin checklist

1. **Monitor staging queue**
   - Use the “Recurring agreement ID” filter if you are chasing a specific plan.
   - For Stripe rows that failed validation (`validationStatus=failed`), follow up with the donor and reprocess once resolved.
   - Manual imports: edit any mismatched coding (campaign/fund) before clicking “Process”.

2. **Review agreements for upcoming action**
   - Sort the recurring agreement list by `Next expected` to see which donors are due soon.
   - If an agreement shows `status = delinquent` (future enhancement), schedule outreach or consider cancelling.

3. **Handle cancellations/pauses**
   - Pause in Twenty (or Stripe/GoCardless) and note the action in the agreement record. Future staging rows will stop auto-promoting while the status stays paused.
   - Cancelling in Stripe/GoCardless should feed through once those webhooks are wired; for now, update the agreement status manually after the provider action.

4. **Audit receipts & reporting**
   - Verify that committed gifts include the correct `provider` and `recurringAgreementId` so downstream receipts and reports stay accurate.
   - Spot check the Twenty gift list for the most recent webhook-driven installments to confirm the staging workflow finished.

---

## 4. Troubleshooting tips

- **Webhook arrives but no staging row**: Check the logs (`fundraising-service`) for the Stripe/GoCardless event. If metadata such as `recurringAgreementId` is missing, the row may be staged without linkage; search by payment ID in the queue.
- **Agreement not updating**: Promotion updates `nextExpectedAt` only when the staging row is linked to an agreement. Confirm the staging details include the correct `recurringAgreementId`.
- **Duplicate gifts**: Use the staging queue to inspect the raw payload and dedupe status. If you see multiple rows with the same provider payment ID, keep only one and mark the others as failed.
- **Manual review overload**: Remember you can set `autoPromoteEnabled=true` on a recurring agreement. Webhook-created rows for that agreement will bypass manual processing unless they hit a validation error.

---

## 5. Known gaps (tracked for future slices)

- GoCardless ingestion is logging-only today; auto creation of staging rows and delinquency handling will follow.
- There is no UI action yet to pause/cancel agreements from the managed extension; perform the action in Twenty or the payment provider for now.
- Agreement rollups (total paid, last payment date) are not materialised yet; rely on the recurring agreement list and gift query filters.
- No automatic donor notifications are sent when payments fail; admins rely on the staging queue exceptions list to follow up.

---

Keep this document in sync with product decisions and staging improvements. If a feature changes the expected admin workflow, update the relevant section so future testing and onboarding stay aligned.
