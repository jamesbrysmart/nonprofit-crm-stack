# Donation Admin Runbook (POC)

_Last updated: 2025-10-23_

This runbook captures the expected behaviour of the fundraising POC from a donation admin’s point of view. It explains what you should see in the UI, how to work the staging queue, and the steps to keep recurring programmes healthy. Treat it as living guidance; update it whenever features harden or workflows change.

---

## 1. Where you work today

- **Manual gift entry** – keyboard-first form for one-off or catch-up gifts. Inline duplicate detection surfaces exact / review / partial matches from Twenty, you can open the supporter directory modal if you need to refine the search, and an optional toggle lets you link the gift to an existing recurring agreement. The form submits into staging (auto-promote disabled unless you explicitly change it) so you can review the row before committing.
- **Staging queue** – central review surface for everything pending (manual entry, Stripe webhooks, future imports). Each row shows processing/validation/dedupe status, provider metadata, and a recurring tab in the detail drawer. Quick actions let you mark ready, process now, or resolve duplicates without leaving the table.
- **Recurring agreements list** – snapshot of the latest agreement records in Twenty. Shows donor link, amount/cadence, next expected date, status, provider, and payment identifiers so you can sanity-check Stripe/GoCardless activity between webhook runs.

---

## 2. Manual gift entry workflow

1. **Fill in gift basics**  
   Enter amount (defaults to GBP) and date. Optional name/notes help you track campaign context.
2. **Confirm the supporter**  
   As soon as you enter first/last name (and optionally email), the duplicate list highlights existing supporters with badges for exact email, likely match, or partial match. Select “Use supporter” to reuse a record, or open **Search supporters…** to query the directory if you need a different contact.
3. **Watch duplicate warnings**  
   If a staged gift already exists for the same supporter, amount, and date (±1 day) the form warns you before submission. Use that cue to review the existing row instead of creating a duplicate.  
   _Known gap:_ this warning does **not** check already committed gifts yet—spot-check the donor’s recent gifts in Twenty if you suspect they were posted earlier.
4. **Link to a recurring agreement (optional)**  
   Toggle “Part of a recurring agreement” to reveal a filtered list of recent Twenty `RecurringAgreement` IDs. Select the correct agreement so downstream rollups advance automatically when the row commits.
5. **Submit and monitor staging**  
   Successful submission shows either the new gift ID (auto-promoted) or a staging acknowledgement. Head to the staging queue to edit coding, resolve duplicates, and choose when to process.

---

## 3. Recurring donations in practice

### 3.1 Stripe card plans
- **Trigger:** `checkout.session.completed` webhook.
- **What you see:** Staging row with `intakeSource = stripe_webhook`, Stripe IDs, recurring agreement linkage from metadata, and expected date when provided.
- **On commit:** Agreement status flips to `active`, `nextExpectedAt` updates, and the posted Gift retains provider metadata (`recurringAgreementId`, `provider`, `providerPaymentId`, `providerContext`).
- **Auto-promote guardrail:** If Stripe didn’t supply a confident email, the row arrives with `autoPromote=false` so you review it before posting.

### 3.2 GoCardless direct debit (skeleton status)
- **Current behaviour:** Webhooks log payloads but do not yet create staging rows.
- **Admin expectation:** Manually stage payments when required, linking them to the agreement so processing still advances cadence.
- **Next slice:** Automate staging row creation from GoCardless webhooks and surface failures in the queue.

### 3.3 Manual/imported installments
- Include `recurringAgreementId` (and, if you have it, `expectedAt`) when staging manual installments. Processing advances the agreement’s `nextExpectedAt` (default +1 month fallback).
- Use the staging queue filter by agreement ID to investigate missed payments; compare `nextExpectedAt` against the latest committed gift.

---

## 4. Daily/weekly admin checklist

1. **Monitor the staging queue**
   - Filter by “Recurring agreement ID” when reconciling a specific donor or chasing missed payments.
   - Resolve validation errors (amount/date/coding) before processing; leave notes if you need help from another teammate.
   - For manual rows, edit fund/appeal/batch in the drawer before you click “Process now”.
2. **Review agreements for upcoming action**
   - Sort the agreements list by “Next expected” to see who is due soon.
   - If an agreement looks stalled (no new staging rows, outdated `nextExpectedAt`), investigate in the staging queue or payment provider.
3. **Handle cancellations or pauses**
   - Perform the action in Stripe/GoCardless or Twenty and update the agreement status. While paused, auto-promote stays disabled so accidental charges don’t post.
4. **Audit receipts & reporting**
   - Confirm committed gifts include `provider` and `recurringAgreementId` for downstream receipts.
   - Spot-check the Twenty gift list for the latest webhook-driven installments to ensure staging processed successfully.

---

## 5. Troubleshooting tips

- **Webhook arrives but no staging row:** Check fundraising-service logs. If metadata such as `recurringAgreementId` is missing, look up the staging row by payment ID; it may be present but unlinked.
- **Agreement not updating:** Promotion only advances `nextExpectedAt` when the staging row carries the correct `recurringAgreementId`. Edit the drawer and reprocess if needed.
- **Duplicate gifts:** Use the staging drawer’s duplicate diagnostics. Keep the row with the correct provider payment ID and mark the duplicates as failed.
- **Too many manual reviews:** Enable `autoPromote` on trusted recurring agreements. Rows for those agreements skip manual processing unless validation fails.
- **Manual form error:** If submission fails, review the inline duplicate list or run the supporter search again—picking an existing supporter often resolves validation issues.

---

## 6. Known gaps (tracked for future slices)

- GoCardless webhooks still log-only; automatic staging and delinquency handling are in the next implementation session.
- Managed UI does not yet expose pause/cancel controls for agreements—use the payment provider or Twenty native UI.
- Agreement rollups (total paid, last payment date) aren’t materialised; rely on the agreements list and ad-hoc queries.
- Duplicate warning in manual entry only checks staging rows; committed-gift check is planned.
- No automated donor notifications when payments fail; admins rely on staging exceptions for follow-up.

---

Keep this runbook aligned with product decisions and staging improvements. Whenever a feature changes a donation admin workflow, update the relevant section so onboarding and support stay accurate.
