# Campaigns, Appeals & Donor Engagement — Lean Design (Repo Spec)

**Purpose:** Define a simple, robust data model and workflows for donation attribution and appeal performance in the Fundraising module, plus an integrations-first Marketing module for advanced engagement (segments, sends, journeys) without building a full marketing suite. Target users: small–mid nonprofits (UK-first, global-ready).

---

## Product Goals & Constraints

- **Fundraising owns attribution:** Appeal setup, tracking codes, donation linkage, rollups, core KPIs.
- **Marketing integrates, not rebuilds:** Start with Mailchimp; keep provider adapters tool-agnostic (Dotdigital, Customer.io, etc.).
- **Simplicity over completeness:** Avoid heavy per-contact junctions; use snapshots for response rates.
- **Digital-first, offline-friendly:** Auto attribution via URLs/UTMs/QR codes; batch tagging for cheques, events, mail.
- **AI augments without overwhelm:** Predictive audience suggestions, RFM, content assist, insight summaries.

---

## Core Principles

1. **Single lean appeal object.** Represent Campaign/Appeal with one `appeal` record, with optional parent to group (e.g., “2026 Annual Campaign”).
2. **Explicit donation attribution.** Gifts hold `appeal_id` (plus optional `appeal_segment_id`, `tracking_code_id`, `fund_id`).
3. **Granularity only when needed.** Optional `appeal_segment` for channel/segment breakouts and optional audience snapshots for audit.
4. **Tracking codes are first-class.** Multi-channel attribution stays easy (URLs, UTMs, QR/short codes, offline reply codes).
5. **Response rate without bloat.** Use solicitation snapshots (counts) instead of per-contact campaign members; only materialise memberships when required.
6. **Shared rollup engine.** Appeal totals reuse the denorm/rollup pattern defined for gifts and households so scheduled jobs stay consistent.

---

## Minimal Data Model (Fundraising Module)

### `fund`
- `id`, `name`, `code` — designation/purpose applied to gifts (new object; to be provisioned alongside Fundraising metadata).

### `appeal` (core)
- `id`, `name` (e.g., “Spring Appeal 2026 – Email”).
- `parent_id` (nullable) to group under a broader campaign umbrella.
- `type` (`email`, `mail`, `event`, `social`, `mixed`).
- `start_date`, `end_date`.
- Targets: `goal_amount`, `target_solicited_count`, `budget_amount` (optional).
- Defaults: `default_fund_id`, `default_tracking_code_id`.
- Rollups (denorm): `raised_amount`, `gift_count`, `donor_count`, `response_rate` (gifts / solicited), `cost_per_£` (if budget present), `last_gift_at`.

### `appeal_segment` (optional granularity)
- `id`, `appeal_id`, `name` (e.g., “LYBUNT – Mail”).
- `channel` (`email`, `mail`, `social`, `event`).
- `target_solicited_count`.
- Rollups: `raised_amount`, `gift_count`, `response_rate`, `donor_count`.

### `tracking_code`
- `id`, `appeal_id` or `appeal_segment_id` (one required).
- `code` (unique, human-friendly; e.g., `SPR26-EM1`).
- `utm_source`, `utm_medium`, `utm_campaign`, `utm_content` (nullable).
- `landing_url` (with prefilled UTMs for digital).
- `channel` (`email`, `mail`, `social`, `qr`, `event`, `other`).
- Metrics: `clicks` (if available), `attributed_gift_count`, `attributed_amount`.
- QR downloads / short-link generation reuse this record so offline pieces share the same code.

### `donation` (extend existing schema)
- `fund_id` (designation).
- `appeal_id` (required when attributable).
- `appeal_segment_id` (nullable).
- `tracking_code_id` (nullable; auto for digital based on UTMs/QR).
- `source_channel` (derived fallback: `walk_in`, `import`, etc.).

### `solicitation_snapshot`
- `id`, `appeal_id` or `appeal_segment_id`.
- `count_solicited`.
- `source` (e.g., “Mailchimp Audience 2026-03-15” / “DM housefile lot #123”).
- `captured_at`.

#### Optional (feature-flag / compliance)
- `audience_snapshot`: `id`, `appeal_id`/`appeal_segment_id`, `source`, `captured_at`, `count`.
- `audience_snapshot_membership`: `snapshot_id`, `contact_id` (frozen recipient list for audit/suppression/regulatory needs).

Rollups for appeals/segments follow the same job pattern as contact/household rollups (event-driven updates with nightly reconciliation job when needed).

---

## Marketing Module (Integrations-First)

### Entities
- `marketing_integration`: `provider` (mailchimp/…), `auth_ref`, `status`, `last_synced_at`.
- `marketing_audience`: `provider_list_id`, `name`, sync mapping rules, last sync times, suppression flags.
- `segment_definition`: `name`, `type` (`static`, `dynamic`, `rfm`, `ai`), `definition_json`, `owner`.
- `segment_snapshot`: `segment_definition_id`, `generated_at`, `count` (+ optional `segment_snapshot_membership(contact_id)`).
- `marketing_send`: `provider_campaign_id`, `provider`, `appeal_id`/`appeal_segment_id`, `subject`, `channel`, metrics (`sent`, `delivered`, `opens`, `clicks`, `bounces`, `unsubs`, `complaints`).

### Responsibilities
- Build/persist segments (filters, RFM, AI output) → snapshot → sync to provider audience.
- Orchestrate sends (initiate or link to provider campaigns), capture metrics, roll up to appeal/segment.
- No in-house bulk email engine; embed/launch provider flows, store metadata, and surface AI assist aligned with segmentation guidance elsewhere.

---

## Key Workflows

### Create an Appeal
1. Create new `appeal`; optionally set `parent_id` (campaign umbrella) and `default_fund_id`.
2. Auto-generate default tracking codes (email, mail, social, QR); copy URLs and download QR assets for offline use.
3. Optionally add `appeal_segment` rows for major sub-audiences with channel metadata.

### Digital Attribution
- Donation form reads UTMs or QR parameters to map to `tracking_code`, setting `donation.appeal_id`/`tracking_code_id` automatically.
- Each attributed gift updates `tracking_code`, `appeal`, and `appeal_segment` rollups via the shared rollup service.

### Offline Attribution
- Batch gift entry: set batch-level `appeal_id` (and `appeal_segment_id`); optional entry of short reply codes that map to `tracking_code`.
- Manual tracking code entry auto-populates defaults for subsequent records in the batch.

### Solicited Counts & Response Rate
- When a send happens, marketing records a `solicitation_snapshot` (count + source) on the relevant appeal/segment.
- Response rate surfaces as gifts divided by latest snapshot count; warn if snapshot is stale.

### Marketing Execution (Mailchimp Example)
1. Build `segment_definition` (filters/RFM/AI) and generate `segment_snapshot`.
2. Sync snapshot to `marketing_audience` (Mailchimp list/segment).
3. Launch send (from Mailchimp or embedded UI) and log `marketing_send` with metrics.
4. Metrics roll up to appeal/segment dashboards (opens, clicks, gifts, revenue).

---

## UX Priorities

- Appeal page: KPIs (goal vs raised, gifts, donors, response rate), channel mix, top tracking codes, recent gifts.
- One-click tracking codes: auto-generated codes, copyable URLs, QR download button.
- Batch entry: sticky appeal defaults, quick assign of tracking codes for offline batches.
- Snapshots: “Add Solicited Count” action or “Link Send” that pulls counts/metrics from provider.
- Segments: simple builder with preview counts, “Sync to Mailchimp” CTA, AI suggestions inline.
- Sends: delivery/engagement metrics, cross-links to provider, tie back to appeal.
- Dashboards: aggregate appeal performance, segment/channel comparisons, year-over-year trends.

---

## AI & Advanced Segmentation

- **RFM engine:** scheduled job builds `segment_snapshots` (Top Decile, LYBUNT, SYBUNT).
- **Predictive audiences:** “Suggest donors for this appeal” prompts AI to rank contacts; user confirms snapshot creation.
- **Content assist:** AI drafts subject lines/body copy, suggests variations per segment.
- **Insight summaries:** Natural-language recap (e.g., “Email segment A converted 2.1× higher than mail segment”), timing tips, anomaly alerts.
- **Attribution quality checks:** Flag spikes of unattributed gifts; suggest likely appeals based on behaviour.

Guardrails: AI proposes, human approves. Store scores/criteria for explainability.

---

## What We’re Not Building

- A full marketing automation suite (native bulk email engine, journey builder).
- A heavy campaign-member junction with per-contact solicitation states by default.
- Rigid three-object hierarchies for campaign/fund/appeal; we collapse to a single appeal object with optional parent.

---

## Release Slices (Proposal)

- **Release 1 — Attribution Core**
  - `appeal`, `tracking_code`, and `fund` objects provisioned.
  - Donation form + batch entry capture `appeal_id`/`tracking_code_id` (UTM + reply code support).
  - Event-driven rollups for appeals (raised amount, gift count) with nightly reconciliation job baseline.
  - Manual solicitation snapshots and basic appeal dashboard (goal vs raised, gifts, donors).

- **Release 2 — Segments & Marketing Sync**
  - `appeal_segment` support with rollups and tracking codes per segment.
  - Mailchimp integration: `marketing_integration`, `marketing_audience`, `segment_definition`/`segment_snapshot`, `marketing_send` with metrics.
  - Automated solicitation snapshots from provider sends; response rate visuals.
  - QR code generation + short links embedded in tracking code UI.

- **Release 3 — Advanced Attribution & AI**
  - Optional audience snapshot membership for compliance-driven pilots.
  - AI-assisted segmentation, content suggestions, insight summaries.
  - Multi-touch attribution spike (side table) and cross-provider adapter framework (Dotdigital/Customer.io).

Roadmap slices will tighten during implementation planning; this structure helps prioritise MVP cuts.

---

## Open Questions & Spikes

1. Named recipients per appeal: stay snapshot-only unless regulatory/compliance needs demand membership tables.
2. Naming clarity (“Campaign” vs “Appeal”): user-test UI labels; consider aliasing appeal as “Campaign/Appeal” with parent labelled “Campaign (optional)”.
3. Multi-touch attribution: MVP single `appeal_id`; spike a `donation_attribution` table for fractional models later.
4. Rollup strategy: confirm rollup service can handle appeal volumes; monitor for drift and set reconciliation cadence.
5. Provider parity: start Mailchimp; design adapter spec for next provider.
6. Mailchimp webhook idempotency: spike with existing connector scaffolding to ensure send metrics and attribution remain consistent.

---

## Data Governance & Reliability

- Idempotency keys on provider events (`provider_campaign_id`, send IDs) and on `tracking_code`.
- Audit trail for appeal updates, snapshots, syncs, merges.
- GDPR compliance: respect marketing consents, maintain suppression lists, keep logs scrubbed of sensitive content.
- Performance: index attribution fields, ensure rollup jobs scale with appeal volume, paginate snapshot listings.

---

## KPIs / Success Criteria

- Attribution completeness: ≥ 95% of online gifts auto-tagged to an appeal.
- Time-to-setup: create appeal + tracking codes in ≤ 60 seconds (p95).
- Snapshot coverage: ≥ 90% of sends produce a solicitation snapshot (manual or integrated).
- Dashboard usability: > 80% of users rate appeal KPIs as clear/actionable.
- Integration stability: < 0.5% failed provider sync events per month.

---

## Default Settings (Recommended)

- Appeals enabled by default; creating an appeal auto-generates email/mail/social/QR tracking codes.
- Online forms read UTMs/QR params and set `tracking_code_id`/`appeal_id` automatically.
- Batch entry defaults to last used appeal for speed, with quick clear option.
- Marketing module: Mailchimp connector available; weekly RFM snapshots scheduled; AI suggestions opt-in per org.
- Response rate displayed as gifts / latest snapshot count with freshness indicator.

---

## Conclusion

1. Keep appeal attribution explicit and lightweight: one appeal object with optional parent, first-class tracking codes, and simple rollups.
2. Leverage the existing rollup/job framework so new metrics (appeal totals, response rates) align with contact/household patterns.
3. Integrate marketing providers instead of rebuilding them, storing enough metadata to power segmentation, AI assist, and dashboards.
4. Stage delivery: ship core attribution first, add segment + marketing sync, then layer advanced AI and multi-touch attribution as demand grows.
5. Maintain clear guardrails (idempotency, consent, audit) so attribution remains trustworthy as integrations expand.
