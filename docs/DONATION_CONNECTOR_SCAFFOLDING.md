# Donation Connector Scaffolding — Design Notes

_Last updated: 2025-10-02_

Prepared to capture the shared understanding before we begin implementation work on `/docs/POC-backlog.md` item 4 (Payment/Form Connector Scaffolding). Treat this as the living design reference; expand it alongside code changes and adjacent docs (`INTEGRATIONS.md`, `AUTOMATIONS.md`).

## 1. Problem Statement
- We need a reusable path for external donation platforms and first-party donation forms to inject gifts through the managed fundraising proxy without bespoke glue each time.
- Stripe (card payments) and GoCardless (direct debit) are assumed to set the pattern for most online donation providers we will encounter; other connectors should be able to follow the same scaffold.
- Fundraising-service now exposes `/webhooks/gocardless` (skeleton handler) so we can iterate on Direct Debit ingestion without blocking Stripe delivery.
- The first delivery slice focuses on end-to-end payment ingestion; donor matching/dedupe and downstream automations (receipts, Gift Aid) follow immediately after we prove the pattern.

## 2. Goals & Outcomes
- **Platform agnostic adapters:** A documented normalization layer that maps provider events/webhooks to the existing `POST /api/fundraising/gifts` proxy contract.
- **Reference implementations:** One canonical third-party connector (likely Stripe) plus an in-house public donation form example that reuses the same pipeline.
- **Documentation-first approach:** Every decision, assumption, and follow-up ticket is captured here and cross-linked so pilots can rely on the playbook without digging through issues.
- **Incremental delivery plan:** Start with the fastest viable path; iterate on observability, dedupe, and automation as confidence grows.
- **Single surface:** Regardless of orchestrator, all inbound events post into fundraising-service so dedupe, logging, and rollups stay consistent.

## 2.1 Configuration & Onboarding (Stripe MVP)

Follow these steps for each nonprofit workspace that needs to connect Stripe:

1. **Gather secrets in Stripe**
   - Create (or copy) an API secret key with access to Checkout Sessions and Customers. For production tenants, prefer a [restricted key](https://stripe.com/docs/keys#restricting-access). This value will become `STRIPE_API_KEY`.
   - Create a webhook endpoint that points to the fundraising-service gateway (local dev: `http://localhost:4500/api/fundraising/webhooks/stripe`; hosted stacks should use their public HTTPS domain). Subscribe at least to `checkout.session.completed`, then copy the signing secret (`STRIPE_WEBHOOK_SECRET`).

2. **Configure the fundraising-service environment**
   - Copy `services/fundraising-service/.env.example` to `.env` if it does not exist.
   - Populate the Stripe variables:
     ```ini
     STRIPE_API_KEY=sk_test_or_restricted_live_value
     STRIPE_WEBHOOK_SECRET=whsec_...
     ```
   - Restart the fundraising-service so the new values are loaded (Docker example: `docker compose --profile fast up -d --build fundraising-service`). If either value is missing, the service logs `stripe_webhook_missing_secret` / `TWENTY_API_KEY not configured` and returns HTTP 503 for incoming events.

3. **Run the manual smoke test**
   - Use a unique email via the process in §7 to confirm the webhook → Person → Gift path succeeds.

4. **Document for the tenant**
   - Store the Stripe credentials in the organisation’s secret manager; note rotation procedures.
   - Record the webhook endpoint in Stripe so future deploys use the same URL.

Future work will wrap these steps in UI/onboarding tooling; for now, this runbook keeps the setup consistent across tenants.

## 3. Current Assumptions
1. **Provider Coverage:** Stripe and GoCardless will be the reference connectors; most other platforms will follow their patterns.
2. **Event Timing:** Real-time webhooks are the default ingestion mechanism. Batch/CSV imports remain out of scope for the first slice but must be noted as a future extension.
3. **Normalization Layer:** We expect to standardise incoming events into a canonical "gift event" payload before hitting the fundraising-service endpoint, but the exact schema is still open.
4. **Contact Handling:** Initial milestone may prioritise creating gifts with minimal donor info; lightweight dedupe (e.g., email-based) becomes a near-term follow-up.
5. **Execution Environment:** Connector logic may live inside fundraising-service, a companion worker, or external automation tooling (n8n/Twenty Workflows); we will validate and document the chosen approach.
6. **Documentation Fidelity:** No code ships until this document (and linked references) reflect the agreed design. Source platform docs (Stripe/GoCardless) should be summarised or stored locally to avoid guesswork.
7. **Recurring metadata handoff:** Stripe checkout flows must include `recurringAgreementId` (matching the Twenty metadata record) and may send `nextExpectedAt`; the webhook now uses these values to update agreements and embed provider context on staged gifts (`provider`, `providerPaymentId`, `providerContext`).

## 4. Open Questions (to resolve before coding)
- **Reference Events:** Which Stripe objects drive the gift creation flow (e.g., `payment_intent.succeeded`, Checkout Session events, Charge API)? _(Thin slice uses `checkout.session.completed`; list remaining events for future phases.)_ For GoCardless, which webhook events (mandates, payouts) must we support day one?
- **Contact Matching:** Is "always create a new Person" acceptable for the MVP, or do we need immediate email/name matching? If matching is required, what are the minimal rules? _(Thin slice assumes we can create a new Person; revisit once staging/dedupe stories advance.)_
- **Canonical Payload Shape:** What fields are mandatory in the provider-agnostic payload (amount, currency, donor info, metadata, external ID, gift date)? How do we represent instalments/recurring contexts?
- **Execution Placement:** Do we embed provider adapters inside fundraising-service (keeping infra simple) or rely on an orchestration layer (n8n/Twenty workflows)? What triggers the choice to split out?
- **Testing Strategy:** What automated checks are required? (Mock webhook fixtures, end-to-end smoke scripts, replay harness?)
- **Secrets & Config:** How do we configure provider credentials (env vars vs. managed secret store) and expose them in docs without leaking sensitive info?
- **Error Handling:** What is the minimal retry/DLQ story for POC? How do we surface failures (logs, runbooks, dashboards)?

## 5. Implementation Priorities
- **Canonical event first:** Finalise a provider-agnostic JSON payload that the fundraising-service adapter produces before invoking existing gift endpoints.
- **Adapter placement:** Implement the Stripe connector inside fundraising-service (Nest module) so organisations deploy the same image, configure Stripe/Twenty env vars, and gain the integration without extra tooling.
- **Stripe pilot:** Deliver a Stripe Checkout flow (one-off donation) that listens for `checkout.session.completed`, maps it into the canonical payload, and posts it to `/api/fundraising/gifts` with the usual request-id propagation.
- **Telemetry + docs:** Update `AUTOMATIONS.md`/`INTEGRATIONS.md` with setup steps (Stripe webhook secret, environment variables), document manual smoke tests, and note how Twenty webhooks can be layered later.
- **Iterate forward:** After the success-path lands, expand to dedupe/contact matching, retries, recurring payments, GoCardless parity, and a first-party donation form that reuses the same pipeline.

### 5.1 Canonical Gift Event (draft)

The adapter produces the following envelope before invoking fundraising-service (subject to iteration):

```json
{
  "eventId": "evt_01HV…",
  "source": {
    "provider": "stripe",
    "type": "checkout.session.completed",
    "receivedAt": "2025-10-05T12:34:56.000Z"
  },
  "gift": {
    "amount": { "currencyCode": "GBP", "value": 25.0 },
    "date": "2025-10-05",
    "externalId": "cs_test_a1B…",
    "description": "Autumn appeal",
    "metadata": {
      "paymentIntentId": "pi_3NY…",
      "campaignCode": "AUT25"
    }
  },
  "donor": {
    "contactId": null,
    "firstName": null,
    "lastName": null,
    "email": "ada@example.org"
  },
  "tags": ["online", "stripe"]
}
```

- `eventId` + Checkout session IDs drive idempotency inside fundraising-service.
- `customer_details` from the session supplies the donor email; name fields remain `null` unless the session collected them.
- Leave `contactId` null for v0; staging/dedupe work will resolve it later.
- Always forward or mint an `x-request-id` when calling fundraising-service for traceability.

Version changes to this schema must land alongside adapter updates and be recorded here.

### 5.2 Pilot: Stripe Checkout → fundraising-service

| Step | Description | Output |
| --- | --- | --- |
| 1 | Receive Stripe webhook (`checkout.session.completed`). | Nest controller validates signature and logs receipt. |
| 2 | Map session payload → canonical event. | JSON ready for internal processing. |
| 3 | Convert canonical event into `POST /api/fundraising/gifts` payload. | Twenty gift created via existing proxy; response returned to adapter. |
| 4 | Log success/failure with request ID; surface failures via structured logs. | Enables manual monitoring during MVP. |
| 5 | Document manual smoke test (create Checkout session → gift visible in Twenty). | Repeatable validation steps for other orgs. |

Follow-up: leverage Twenty webhooks or internal jobs to trigger receipts, rollups, and Gift Aid once the gift posts successfully.

## 6. Required Inputs & Next Actions
1. **Collect Stripe & GoCardless Docs:** Need summaries (or copied references) for webhook schemas, signature validation, and event lifecycles. _Owner: James (provide or confirm sources)._ 
2. **Decide Contact Handling MVP:** Align on whether the first version creates donors blindly or performs basic matching. _Owner: joint decision._
3. **Review Canonical Gift Event Draft:** Socialise §5.1 payload with stakeholders; confirm naming, required fields, and change-management expectations. _Owner: joint design._
4. **Confirm Execution Home Defaults:** Document in `AUTOMATIONS.md`/runbooks that n8n owns pilots, fundraising-service owns hardened flows, and capture revisit triggers. _Owner: joint design._
5. **Author Test Strategy Outline:** Decide on fixtures/smoke tests and how to run them locally. _Owner: engineering._
6. **Plan Follow-up Tickets:** Break work into backlog issues (connector patterns, dedupe, receipts) once the design stabilises. _Owner: product/engineering._
7. **Capture Zapier Guardrails:** Define when tenant-specific Zaps are acceptable and how we migrate them into n8n/service, keeping docs in sync. _Owner: product/engineering._

## 7. Testing

### Manual Smoke Test (Stripe)

This process validates the end-to-end flow from a Stripe payment to a Gift record in Twenty.

**Prerequisites:**
- The `dev-stack` is running.
- You have a Stripe account with a test Payment Link for a donation product.
- The Stripe CLI is installed and you are logged in (`stripe login`).
- The `stripe listen` command is running and forwarding events to the `fundraising-service`:
  ```bash
  stripe listen --forward-to http://localhost:4500/api/fundraising/webhooks/stripe
  ```

**Steps:**

1.  **Create a unique customer and checkout session:**
    - To avoid duplicate email errors, always use a new email for each test run.
    - **Option A (Manual):** Open the Stripe Payment Link URL in your browser and complete the payment using a test card (e.g., `4242 4242 4242 4242`). Use a unique email like `stripe+<timestamp>@example.com`.
    - **Option B (Scripted):**
      1.  Create a customer: `stripe customers create --email="stripe+<timestamp>@example.com"`
      2.  From the output, copy the customer ID (`cus_...`).
      3.  Create a checkout session for that customer (this requires knowing the correct syntax for the `stripe checkout sessions create` command, which has proven difficult).

2.  **Verify Webhook Reception:**
    - Check the `stripe listen` terminal for `checkout.session.completed` event logs.
    - Check the `fundraising-service` logs for a message like `"Forwarding Stripe checkout session to fundraising proxy"`.

3.  **Verify Record Creation in Twenty:**
    - Check the `fundraising-service` logs for successful `POST /people` and `POST /gifts` requests to the Twenty API.
    - Log in to the Twenty UI and confirm:
      - A new "Person" record exists with the email you used.
      - A new "Gift" record exists, linked to the new Person.
      - The Gift's "Notes" field contains the Stripe Checkout Session ID for traceability.

### Future Automation

- The manual smoke test should be automated using a browser-based E2E testing framework like Playwright or Cypress.
- A separate, faster integration test can be created to directly trigger a `checkout.session.completed` event via the Stripe CLI and assert that the webhook handler creates the correct records.

## 8. Current Status (2025-10-03)
- **Webhook delivery proven:** `stripe listen --forward-to http://localhost:4500/api/fundraising/webhooks/stripe` now hits the Nest controller and the adapter logs `stripe_checkout_session_forward` attempts.
- **Contact dedupe minimised:** fundraising-service now checks Twenty’s `/people/duplicates` endpoint using the Stripe email before creating a Person. If a match exists we reuse the existing `personId`; otherwise we create a new record.
- **Auto-promote guardrails:** Stripe payloads default to `autoPromote=true`, but we now downgrade to staging review whenever the checkout session lacks a confident email match (e.g., donor skipped the email field); this keeps medium-confidence entries in the queue instead of posting directly.
- **Stripe session traceability:** currently lives in logs only; once metadata fields land we can persist identifiers directly on the Gift records.
- **Happy path verified:** 2025-10-03 manual smoke test (unique email flow) confirmed `checkout.session.completed` → Person create → Gift create succeeds without errors.
- **Duplicate reuse verified:** 2025-10-03 webhook replay with an existing donor email reused the Person returned by `/people/duplicates` and created the Gift without errors.
- **Next session focus:** add an automated smoke checklist for the webhook path and expand coverage beyond `checkout.session.completed` once the MVP slice is stable.

## 9. Related Documents
- `docs/POC-backlog.md` — Item 4 for scope and acceptance hints.
- `INTEGRATIONS.md` — Provider matrix; will reference this design once expanded.
- `AUTOMATIONS.md` — Captures receipt workflows, rollup jobs, and connector automation needs.
- `docs/TWENTY_GIFTS_API.md` — Current fundraising-service proxy behaviour.
- `DECISIONS.md` — D-0015 (portal/connectors stance) provides strategic context.

---

_Update this document as decisions are made. Once ready for implementation, add a “Solution Outline” section with architecture diagrams, payload samples, and testing notes._
