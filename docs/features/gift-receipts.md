# Gift Receipts & Acknowledgements — Best Practices (UK-first, Lean CRM)

**Purpose:** Design input for product, data model, and workflows drawn from receipting research. Target audience is engineers, product, and AI tooling shaping a **lean, modular nonprofit CRM** for **UK small–mid orgs**. Read alongside `docs/features/recurring-donations.md` (installment behaviour) and consent notes in `docs/PROJECT_CONTEXT.md`.

---

## Product Goals

- **Fast & automatic:** Receipts follow successful payments with no manual steps.
- **Flexible & legible:** Support per-gift, first-installment, and annual statements with simple overrides.
- **UK-first:** Bake in Gift Aid, GDPR compliance, and UK tax-year assumptions (6 Apr–5 Apr).
- **Lean core:** Keep logic in managed extensions; integrations stay optional.
- **Auditable:** Every gift exposes receipt status, resend history, and lawful basis.

---

## Core Practices & Feature Outline

### 1. Receipt Policy & Preferences
- Org-level policy defaults: `per_gift`, `first_installment_only`, `annual_summary`, `hybrid` (thank-you + annual).
- Contact-level overrides for cadence and channel (`email`, `pdf+email`, `postal`, `none`) tied to GDPR consent flags.
- Campaign/event overrides when bespoke stewardship is required.

### 2. Format & Delivery
- HTML email holds the full receipt; option to attach a rendered PDF.
- Postal packs (PDF letter + address CSV) for donors who cannot receive email.
- Optional SMS confirmation with secure link once advanced channels land.
- Donor self-service page or magic link for history and preference updates.

### 3. UK Considerations (Gift Aid & GDPR)
- Include charity registration details and relevant Gift Aid statements.
- Flag each gift `gift_aid_eligible`; adjust on refund and roll into annual summaries.
- Log lawful basis per send; suppress delivery if consent is missing.

### 4. Triggering & Automation
- Fire only on confirmed success (webhook-driven for Stripe/GoCardless); dedupe by `provider_payment_id`.
- Recurring flow: special first-instalment template, policy-driven follow-ups, annual rollup job (UK tax year by default).
- Imports: batch “receipt now” with guard rails to prevent duplicate sends.

### 5. Templates & Personalisation
- Country-aware template packs built in MJML/Nunjucks with merge fields for donor, gift, campaign, Gift Aid eligibility, and YTD totals.
- Conditional blocks (first gift, tribute, fee covered, in-kind) and lightweight branding (logo, colour, e-signature).
- Preview + test-send per version; maintain version history for audit.

### 6. Data Model (future-ready; first slice is on-gift)
- **First slice:** receipt state lives on the Gift (see “Current first slice”); annual acknowledgement state lives on `RecurringAgreement`. No separate receipt object or file linkage field is required for MVP.
- **Future (if we need resend history or multi-channel analytics):**
  - `receipt`: `id`, `contact_id`, `gift_id`/`gift_installment_id`, `type`, `delivery`, `template_id`, `rendered_at`, `sent_at`, `channel_message_id`, `status`, `dedupe_key`, `resend_of`.
  - `gift` / `gift_installment`: `receipted`, `receipt_id`, `gift_aid_eligible`, `refunded`, `refund_adjusted` (extends fields in `recurring-donations.md`).
  - `annual_statement`: `id`, `contact_id`, `fiscal_year`, `total_amount`, `gift_count`, `sent_at`, `receipt_ids[]`.

### 7. Admin UX
- Receipting dashboard highlighting unsent gifts, failures, and upcoming annual jobs.
- One-click resend with audit trail; bulk send for filtered lists; suppress/unsuppress per donor or gift.
- Postal batch export workflow when needed.

### 8. Reliability & Safeguards
- Idempotent send logic keyed on `dedupe_key` + template/type.
- Auto retries with escalation after N failures.
- Event timeline: webhook received → gift posted → receipt rendered → send accepted/delivered.
- Sandbox mode routes to test inbox with clear banners; annual job runs with dry-run preview.
- Rate limits/cool-offs to avoid accidental mass re-sends.

---

## Recommended Defaults (UK Small–Mid Orgs)

- **Online one-off gifts:** Immediate HTML receipt (PDF attachment when renderer lands) + Gift Aid reminder if declaration missing.
- **Recurring gifts:** Default to first instalment receipt + annual statement each April; allow donors to opt into per-instalment emails.
- **Offline/imported gifts:** Batch receipting tool with dedupe preview.
- **Refunds:** Issue revised receipt note automatically, flip Gift Aid flags, optionally notify donor.
- **Self-service:** Magic link for donors to download receipts and manage preferences.

---

## Release Slices (Proposal)

- **Current first slice (2025-11 agreement): lean, on-gift fields only**
  - **No standalone receipt object in MVP.** We store receipt state on the Gift; resends are rare and overwrite those fields. Future escape hatch is to add a receipt log object only if we need resend/audit history.
  - **Gift fields (add via metadata):** `receiptStatus` (`pending|sent|failed|suppressed`), `receiptSentAt`, `receiptPolicyApplied` (`per_gift|first_installment|annual|suppressed`), `receiptChannel` (`email|none`), `receiptTemplateVersion` (string), `receiptError` (string), `receiptDedupeKey` (e.g., `providerPaymentId` or hash of gift+policy). No `fileId` field unless Twenty Files linkage is confirmed.
  - **Annual acknowledgements:** Track on `RecurringAgreement` (not a new object): `annualReceiptStatus`, `annualReceiptSentAt`, `annualReceiptPeriod` (tax-year string), `annualReceiptPolicy` (e.g., `annual` or `first+annual`). One-off donors’ annual statements deferred until we validate demand.
  - **Send criteria (lean policy):** Defaults: one-off → `per_gift`; recurring → `first_installment_only` or `annual` (config). Auto-send only when under a configurable amount threshold and donor/org opts in; otherwise mark `receiptStatus='suppressed'` for manual stewardship. Idempotency: skip send if `receiptStatus='sent'` for the same `receiptDedupeKey`.
  - **Attachments:** If/when Twenty Files support linking to Gifts, attach the PDF to the Gift and optionally note the chosen file in logs. Until then, no attachment field is required.
  - **Email channel:** Email-only in MVP; PDF rendering, postal, SMS, and template editor are out-of-scope. Sending is via existing/future Twenty email capabilities or a simple SMTP adapter; we mirror success/failure onto the Gift fields above.

- **Release 1 — MVP foundations**
  - Org/contact policies with UK tax-year defaults.
  - Webhook-triggered receipts with idempotent dedupe.
  - HTML email delivery (inline content) only; PDF generation deferred.
  - On-gift receipt fields capture status/timestamps (no separate receipt object).
  - Minimal dashboard (unsent list, resend, suppression) and historic batch tool.

- **Release 2 — Operational polish**
  - Annual statement job with preview/dry-run.
  - Template versioning, conditional blocks, richer branding options.
  - Donor self-service page for history and preferences.
  - Postal batch export (PDF bundle + CSV).

- **Release 3 — Advanced & integrations**
  - ESP/SMS/print-mail connectors with delivery analytics and retry tuning.
  - SMS confirmations with secure links.
  - Deeper observability hooks and automation triggers for stewardship tasks.

---

## Solution Options

- **Native stack with OSS bricks (MVP bias):** Embed `GrapesJS` for editing MJML/Nunjucks templates, render HTML + inline CSS server-side, and generate PDFs via headless Chrome/Gotenberg. MVP writes receipt status to Gifts (no receipt table); pluggable SMTP adapter (SES/SendGrid/Postal) handles email. Add a receipt log object and PDF storage later if needed.

- **Twenty workflows for email delivery:** Twenty already sends transactional emails via Workflows ([user guide](https://twenty.com/user-guide/section/integrations/emails)). Validate whether receipts triggered through that surface hit timing, merge-field, and logging needs; improvements are expected in future Twenty releases, so keeping this option alive avoids bespoke send code if it satisfies MVP.

- **Self-hosted delivery add-ons:** For fully self-managed tenants, drop in an OSS MTA (Postal, Haraka) behind the SMTP adapter; extend the same contract for Twilio-style SMS when advanced channels become priority.

- **PDF tooling spike:** PDF customisation is the trickiest balance between lean and flexible. Schedule a spike to trial options (e.g., [pdfme](https://pdfme.com/docs/getting-started), wkhtmltopdf/Gotenberg, Puppeteer, [libpdf](https://libpdf.documenso.com/)) to test editing experience, templating constraints, file size, and performance before locking the renderer.

- **Why not a full suite:** OSS marketing platforms (Mautic, Listmonk, etc.) are heavier than needed and still lack gift-level idempotency, Gift Aid fields, and annual rollups. Modular OSS components keep the footprint small and mirror our Evidence-for-reporting precedent.

---

## KPIs / Success Criteria

- **T+60s** from payment success to emailed receipt (p95).
- **<0.5%** duplicate receipting rate per month.
- **>98%** successful send rate; **<1%** annual statement exceptions.
- **<5 minutes** to configure policies/templates for a new org.
- **GDPR-clean** audit trail (who/when/what) for 100% of receipts.

---

## Conclusion

1. For the MVP, keep receipt state on the Gift (and annual status on `RecurringAgreement`), with email-only sending and no separate receipt object; add a receipt log object later only if resend/audit needs grow.
2. Trigger from authoritative success events (staging commits, webhooks) to avoid timing errors and stay aligned with recurring/staging flows; guard with idempotent `receiptDedupeKey`.
3. Default to UK-sensible policies (one-off per-gift, recurring first or annual) plus thresholds for high-value/manual stewardship; honor opt-outs.
4. Defer PDFs/attachments and template editors until core email flow is reliable; optionally attach PDFs to Gifts via Twenty Files once supported.
5. Stay modular: prefer Twenty workflows/email handling when it satisfies timing/merge needs; keep SMTP/OSS options available as pluggable adapters.
