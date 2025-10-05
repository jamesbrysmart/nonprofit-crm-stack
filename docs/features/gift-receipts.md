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

### 6. Data Model (minimal, explicit)
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

- **Online one-off gifts:** Immediate HTML receipt (optional PDF) + Gift Aid reminder if declaration missing.
- **Recurring gifts:** Default to first instalment receipt + annual statement each April; allow donors to opt into per-instalment emails.
- **Offline/imported gifts:** Batch receipting tool with dedupe preview.
- **Refunds:** Issue revised receipt note automatically, flip Gift Aid flags, optionally notify donor.
- **Self-service:** Magic link for donors to download receipts and manage preferences.

---

## Release Slices (Proposal)

- **Release 1 — MVP foundations**
  - Org/contact policies with UK tax-year defaults.
  - Webhook-triggered receipts with idempotent dedupe.
  - HTML email delivery (inline content) plus optional PDF.
  - `receipt` records with status + audit metadata.
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

- **Native stack with OSS bricks (MVP bias):** Embed `GrapesJS` for editing MJML/Nunjucks templates, render HTML + inline CSS server-side, and generate PDFs via headless Chrome/Gotenberg. Fundraising-service stores `receipt` records, enqueues jobs, and hands off to a pluggable SMTP adapter (tenants can point at SES/SendGrid/Postal without code changes).

- **Twenty workflows for email delivery:** Twenty already sends transactional emails via Workflows ([user guide](https://twenty.com/user-guide/section/integrations/emails)). Validate whether receipts triggered through that surface hit timing, merge-field, and logging needs; improvements are expected in future Twenty releases, so keeping this option alive avoids bespoke send code if it satisfies MVP.

- **Self-hosted delivery add-ons:** For fully self-managed tenants, drop in an OSS MTA (Postal, Haraka) behind the SMTP adapter; extend the same contract for Twilio-style SMS when advanced channels become priority.

- **PDF tooling spike:** PDF customisation is the trickiest balance between lean and flexible. Schedule a spike to trial options (e.g., [pdfme](https://pdfme.com/docs/getting-started), wkhtmltopdf/Gotenberg, Puppeteer) to test editing experience, templating constraints, file size, and performance before locking the renderer.

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

1. Model receipts as first-class records linked to gifts/installments; keep status, idempotency, and audit data explicit.
2. Trigger from authoritative success events to avoid manual timing errors and stay aligned with the staging and recurring patterns already defined.
3. Default to UK-sensible policies (first-instalment + annual) while letting donors/orgs override within consent bounds.
4. Delight donors and reduce admin through rich HTML receipts, optional PDFs, and self-service history.
5. Start lean with modular OSS components, evaluate Twenty workflow emails, and spike PDF tooling early so future regional expansion slips into the same scaffold.
