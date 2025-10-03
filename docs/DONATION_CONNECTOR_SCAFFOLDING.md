# Donation Connector Scaffolding — Design Notes

_Last updated: 2025-10-02_

Prepared to capture the shared understanding before we begin implementation work on `/docs/POC-backlog.md` item 4 (Payment/Form Connector Scaffolding). Treat this as the living design reference; expand it alongside code changes and adjacent docs (`INTEGRATIONS.md`, `AUTOMATIONS.md`).

## 1. Problem Statement
- We need a reusable path for external donation platforms and first-party donation forms to inject gifts through the managed fundraising proxy without bespoke glue each time.
- Stripe (card payments) and GoCardless (direct debit) are assumed to set the pattern for most online donation providers we will encounter; other connectors should be able to follow the same scaffold.
- The first delivery slice focuses on end-to-end payment ingestion; donor matching/dedupe and downstream automations (receipts, Gift Aid) follow immediately after we prove the pattern.

## 2. Goals & Outcomes
- **Platform agnostic adapters:** A documented normalization layer that maps provider events/webhooks to the existing `POST /api/fundraising/gifts` proxy contract.
- **Reference implementations:** One canonical third-party connector (likely Stripe) plus an in-house public donation form example that reuses the same pipeline.
- **Documentation-first approach:** Every decision, assumption, and follow-up ticket is captured here and cross-linked so pilots can rely on the playbook without digging through issues.
- **Incremental delivery plan:** Start with the fastest viable path; iterate on observability, dedupe, and automation as confidence grows.
- **Single surface:** Regardless of orchestrator, all inbound events post into fundraising-service so dedupe, logging, and rollups stay consistent.

## 3. Current Assumptions
1. **Provider Coverage:** Stripe and GoCardless will be the reference connectors; most other platforms will follow their patterns.
2. **Event Timing:** Real-time webhooks are the default ingestion mechanism. Batch/CSV imports remain out of scope for the first slice but must be noted as a future extension.
3. **Normalization Layer:** We expect to standardise incoming events into a canonical "gift event" payload before hitting the fundraising-service endpoint, but the exact schema is still open.
4. **Contact Handling:** Initial milestone may prioritise creating gifts with minimal donor info; lightweight dedupe (e.g., email-based) becomes a near-term follow-up.
5. **Execution Environment:** Connector logic may live inside fundraising-service, a companion worker, or external automation tooling (n8n/Twenty Workflows); we will validate and document the chosen approach.
6. **Documentation Fidelity:** No code ships until this document (and linked references) reflect the agreed design. Source platform docs (Stripe/GoCardless) should be summarised or stored locally to avoid guesswork.

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

## 7. Related Documents
- `docs/POC-backlog.md` — Item 4 for scope and acceptance hints.
- `INTEGRATIONS.md` — Provider matrix; will reference this design once expanded.
- `AUTOMATIONS.md` — Captures receipt workflows, rollup jobs, and connector automation needs.
- `docs/TWENTY_GIFTS_API.md` — Current fundraising-service proxy behaviour.
- `DECISIONS.md` — D-0015 (portal/connectors stance) provides strategic context.

---

_Update this document as decisions are made. Once ready for implementation, add a “Solution Outline” section with architecture diagrams, payload samples, and testing notes._
