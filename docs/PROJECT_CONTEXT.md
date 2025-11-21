# Twenty Nonprofit Suite — Project Context

Updated: 2025-09-25  \
Audience: Engineers, product, and AI dev tools (prompt context)  \
Goal: Build a free-licensed, modular, NPSP-style nonprofit suite on top of Twenty CRM, optimized for UK small–mid nonprofits. Prioritize Fundraising first; add Volunteers, Grants, and Programs/Services as optional modules. Keep the data model simple, the UX sane, and extensions easy.

## 1) Product Thesis (TL;DR)

**Why now:** Salesforce has shifted innovation from NPSP to the new Nonprofit Cloud (NPC). Many small–mid orgs find NPC costly/complex and are reluctant to migrate.

**Our wedge:** Deliver the 80/20 of nonprofit CRM (donors, recurring gifts, Gift Aid, basic campaigns, simple reports) with low complexity, modular add-ons, and easier custom experiences than Salesforce can offer.

**Positioning:** “If you love NPSP’s practicality but don’t want NPC’s overhead, use Twenty Nonprofit Suite.”

## 2) Target Users & Constraints

- **Primary:** UK charities with 2–50 CRM users; budget-sensitive; limited admin capacity; need Gift Aid & GDPR.
- **Secondary:** Global small–mid nonprofits that want an open, modular stack.
- **Non-goal (for now):** Enterprise-scale features, heavy OmniStudio-style config, complex grantmaking-as-a-funder.

## 3) Design Principles

- Modular by default: Fundraising core; Volunteers, Grants, Programs as add-ons.
- Sane defaults, minimal config: Admins shouldn’t fight triggers/rollups/workflows.
- Simple data model: Clear real-world entities; avoid junction sprawl unless justified.
- UK-ready: First-class Gift Aid, GDPR consent & retention hygiene.
- Open & extensible: Free-licensed core; clean APIs; easy custom experiences (web forms/portals).
- AI-first ergonomics: AI helpers for setup, mappings, and routine automation—without hiding the model.

### 3a) Platform Alignment Principles

- **Reuse Twenty first:** Always prefer Twenty-native APIs, components, and patterns before building bespoke functionality. Only add managed-extension logic when the platform cannot meet the requirement or we need extra metadata/guardrails.
- **Configurable by design:** Ship default behaviours that work for most nonprofits, but structure code and data so matching rules, thresholds, or automations can be adjusted per workspace in the future (feature flags, metadata, or admin UI). Document assumptions and revisit criteria whenever we add new flows.

### 3b) Twenty's Architectural Vision: Self-Improving Software

Félix Malfait's article "Self-Improving Software" (twenty.dev/self-improving-software/) provides key insights into the architectural philosophy behind Twenty, particularly its approach to extensibility and AI integration.

**Key Takeaways:**
*   **Hybrid AI/Fixed Code:** Software will combine AI's flexibility (for pattern discovery) with stable, deterministic code (for reliable execution), mirroring human learning.
*   **Multi-tenancy & Extensibility:** The platform is designed for secure, efficient multi-tenancy, leveraging Micro-VMs (for isolated serverless functions), Micro-Frontends, and a shared, metadata-driven database. This enables powerful customization without compromising core stability.
*   **Imperative Engine vs. Declarative Configuration:** This distinction is crucial. AI (and community contributions) are envisioned to excel at generating *declarative* business rules within constrained environments (like our `rollups.json`), while the core imperative engine remains with the team. This aligns perfectly with our Rollup Engine's design.
*   **Embedded Feedback Loops:** The importance of tightly integrated tools that provide immediate feedback to AI and developers for continuous improvement.

## 4) Modules & Must-Haves

### A. Fundraising (Phase 1 – priority)

**What it covers:** Constituents, donations, recurring gifts, campaigns, basic stewardship, Gift Aid.

**MVP**

- Contacts & Accounts (people & orgs), optional Household grouping.
- Donations (one-off, recurring, pledges); Payment Schedules for pledges/grants.
- **Receipts (first slice):** receipt state lives on Gift (`receiptStatus`, `receiptSentAt`, `receiptPolicyApplied`, `receiptChannel`, `receiptTemplateVersion`, `receiptError`, `receiptDedupeKey`); email-only send; no separate receipt object. Recurring annual acknowledgement tracked on `RecurringAgreement` (`annualReceiptStatus`, `annualReceiptSentAt`, `annualReceiptPeriod`, `annualReceiptPolicy`). Attach PDF to the Gift via Twenty Files only if/when supported; otherwise skip attachment.
- Gift Aid: Declarations, eligibility tagging, claim totals, export/report scaffolding.
- Campaigns: Attribute donations; simple hierarchy; ROI basics.
- Core rollups: Lifetime giving, YTD/LY, last/first gift—fast & reliable.
- Reports/Dashboards: Top donors, LYBUNT/SYBUNT, campaign performance.
- Integration hooks: Payment/donation form connectors (JustGiving/PayPal/etc.).

**Nice-to-have (later)**

- Stewardship templates (tasks/checklists), receipt generation, predictive “lapse risk”.

### B. Volunteer Management (Phase 2 – optional)

**What it covers:** Volunteer profiles, jobs, shifts, hours, simple signup.

**MVP**

- Volunteer profiles (skills/interests/availability) on Contact.
- Volunteer Opportunity / Job / Shift / Attendance objects.
- Hours logging & rollups; basic reports.
- Public signup links or light portal page.

**Later**

- Matching suggestions, calendar views, reminders.

### C. Grants (incoming) (Phase 3 – optional)

**What it covers:** Institutional fundraising (applications → awards → payments).

**MVP**

- Grant records (deadlines, status, amounts).
- Deliverables/Requirements checklist + reminders.
- Payment Schedules for awards.
- Pipeline & won/lost reporting.

**Later**

- Renewal actions, allocation tagging to programs/budgets.

### D. Programs & Services (Phase 4 – optional)

**What it covers:** Program catalogs, participant enrollments, service delivery, basic outcomes.

**MVP**

- Program (and optional Sub-program).
- Program Enrollment/Engagement (person ↔ program, dates, status).
- Service Delivery logs (individual + bulk entry).
- People served / services delivered dashboards.

**Later**

- Basic outcomes framework; lightweight mobile entry forms.

## 5) Data Model (High-level)

Keep it obvious. Prefer one clear object per real-world concept. Only add extension/junction when the value is proven.

- **Core:** Contact, Account (Org), optional Household, Donation, PaymentSchedule, Campaign
- **Fund Allocations (optional):** Allocation (if splitting a donation to funds)
- **Volunteers:** VolunteerOpportunity, VolunteerJob, VolunteerShift, VolunteerAttendance
- **Grants:** Grant, GrantDeliverable (for deadlines/requirements)
- **Programs:** Program, ProgramEnrollment, ServiceDelivery, (optional) Outcome

**Notes vs Salesforce:**

- Avoid Person Account complexity; keep Households optional and simple.
- Prefer fast deterministic rollups (materialized columns or scheduled jobs) over brittle trigger webs.
- Design Gift Aid natively (declarations, eligibility, claim export), which NPSP lacks out-of-box.
- Keep Campaigns straightforward (no heavy marketing cloud dependency).

## 6) Where NPSP/NPC Hurt (and our stance)

| Pain Point (NPSP/NPC) | Our Approach |
| --- | --- |
| NPC complexity & cost for small orgs | Lean core + optional modules, free-licensed, low admin load |
| Trigger/rollup brittleness & data loads | Materialized rollups or scheduled jobs; import-safe pipelines |
| Gift Aid missing (NPSP) | Native Gift Aid from Day 1 |
| Volunteer mgmt via old V4S | Modern, integrated volunteer module + simple public signup |
| Grants tracked like generic Opps | Dedicated Grant + Deliverables + payments |
| Program mgmt (PMM) object sprawl | Minimal schema: Program / Enrollment / Service Delivery |
| Experience Cloud friction/cost | DIY custom experiences (forms/portals) with clean APIs |
| Migration uncertainty to NPC | Provide NPSP→Twenty mappings & AI-assisted import |

## 7) Roadmap (Phased, modular)

Fundraising gets ongoing enhancements even as later modules start.

**Quarter focus:** For Q4 FY25 (Oct–Dec 2025) our primary goal is to ship the managed-extension proof of concept. Longer-term success measures (pilot satisfaction scoring, expanded modules) remain documented for future planning but are not execution priorities in this quarter.

### Phase 1 – Fundraising & Core CRM (MVP)

**Key outcomes:** Contacts/Accounts (with optional Households), Donations (one-off, recurring, pledges), Payment Schedules, Campaigns, Gift Aid declarations/export, dependable rollups, starter dashboards, and import + payment connector scaffolding.

**Primary workstreams** (see `/docs/POC-backlog.md#phase-1--fundraising--core-crm-mvp` for tickets):

- Core CRM data + API hardening (owner: Engineering) – finish Gift CRUD proxy work, implement rollups, scaffold campaign attribution, wire payment connector shims.
- Gift Aid and compliance (owner: Engineering + Product) – automate declaration capture, build export template, document GDPR consent/retention flows.
- Onboarding & migration (owner: Product) – metadata runbook, <60 minute pilot setup playbook, 50k-record import drill, CSV templates.

**Dependencies/gates:** Metadata provisioning script or UI checklist, reliable smoke tests, structured logging on retries, decisions in `docs/PROJECT_CONTEXT.md` §11 (households, allocations, portal) locked ahead of GA (see `/docs/POC-backlog.md#11-managed-extension-decision-spike-households-funds-portal`).

**Exit checks:** Success criteria in Section 10 for fundraising (first donation in <60 minutes, Gift Aid export, import at scale) met and documented.

### Phase 2 – Volunteers

**Key outcomes:** Volunteer profiles on Contact, Opportunity/Job/Shift/Attendance objects, hours rollups, volunteer list/report views, and public signup surface.

**Primary workstreams** (track in `/docs/POC-backlog.md#phase-2--volunteers`):

- Data model + metadata (owner: Engineering) – provision volunteer objects/fields, align with household/contact decisions, plan rollups.
- Experience layer (owner: Product) – define portal/signup template, basic scheduling UX, notifications.
- Reporting & compliance (owner: Engineering) – ensure GDPR opt-ins propagate, dashboards for hours and engagement.

**Dependencies/gates:** Phase 1 rollup patterns reused, portal strategy from Section 11 resolved, Gift Aid/consent groundwork extended to volunteer data.

**Exit checks:** Volunteer signup to recorded shift in <3 clicks, baseline reports available, privacy posture documented.

### Phase 3 – Grants (incoming)

**Key outcomes:** Grant pipeline (applications → awards → payments), deliverable tracking, payment schedules, and renewal nudges.

**Primary workstreams** (track in `/docs/POC-backlog.md#phase-3--grants-incoming`):

- Metadata + workflow (owner: Engineering) – grant objects/fields, status flows, deliverable reminders.
- Financial alignment (owner: Product) – align allocations/fund strategy, integrate with fundraising rollups.
- Reporting (owner: Engineering) – pipeline dashboards, renewal alerts, export requirements.

**Dependencies/gates:** Allocation/Fund decision from Section 11, payment schedule learnings from Phase 1, webhook/automation infrastructure.

**Exit checks:** Grants surfaced alongside donations with accurate payment schedule tracking and renewal prompts.

### Phase 4 – Programs/Services

**Key outcomes:** Program catalog, enrollment tracking, service delivery logging (single + bulk), impact views, early outcomes scaffolding.

**Primary workstreams** (track in `/docs/POC-backlog.md#phase-4--programsservices`):

- Schema + metadata (owner: Engineering) – program/enrollment/service delivery objects, optional outcome schema.
- Delivery UX (owner: Product) – bulk entry ergonomics, mobile-friendly capture, participant portal decisions.
- Impact analytics (owner: Engineering + Data) – dashboards for people served, outcomes captured, data retention.

**Dependencies/gates:** Portal strategy confirmation, outcome schema go/no-go (Section 11), data quality tooling.

**Exit checks:** Programs can be launched with clear enrollment states, services logged quickly, and impact views populated.

### Cross-phase

- GDPR consent & retention features; receipt templates; data quality tools.
- AI helpers (field mapping, dedupe suggestions, stewardship prompts).
- NPSP migration kit (CSV templates, field mappings, validators).
- Observability and operations: structured logging with request IDs, health/runbook parity between docs and compose. Tickets live under `/docs/POC-backlog.md#cross-phase--platform`.

## 8) Non-Functional & Policy

- **Licensing:** Core free-licensed; clear contribution guidelines.
- **Privacy:** GDPR-ready (consent capture, right-to-erasure workflow, retention flags).
- **Performance:** Rollups must be fast and import-safe; batch jobs observable & retryable.
- **DX:** Strong API/SDK; first-class CSV/JSON import; infra as code samples; seeds & demo data.
- **Docs:** Guided setup per module; copy-paste snippets for common tasks; example portals.

## 9) Migration Notes (from NPSP)

**Mappings (indicative):**

- Contact → Contact; Account (HH/Org) → Household/Org
- Opportunity (Donation) → Donation; Payments → PaymentSchedule/Installments
- RD2 (Recurring) → Donation (Recurring config)
- GAU Allocation → Allocation (optional)
- Campaign → Campaign

**Approach:** CSV templates + AI-assisted field mapping; dry-run validator; idempotent imports; rollup rebuild after load.

## 10) Success Criteria (early)

- Setup to first donation recorded < 60 minutes (no engineer required).
- Gift Aid declaration + eligible donation + export works out-of-box.
- Import 50k historic donations without manual trigger toggling; rollups correct.
- Volunteer signup link → shift attendance recorded in < 3 clicks.
- Admins consistently rate setup clarity ≥ 8/10 in pilot feedback.

## 11) Open Questions / Decisions to Track

- Households: Default on or off? (Lean toward off by default, easy toggle.) — see interim answer in `DECISIONS.md` D-0015.
- Allocations/Funds: Ship in core or optional? (Likely optional to avoid noise.) — see D-0015 for current stance.
- Portal strategy: Ship minimal in-repo template vs separate starter kit? — interim guidance recorded in D-0015.
- Payments: Which UK processors to target first for connectors?
- Outcomes: Minimal schema now vs defer until Program module adoption validated?

## 12) File Conventions (suggested)

- `/docs/PROJECT_CONTEXT.md` (this file)
- `/docs/data-model/` (ERD, object refs)
- `/docs/migrations/npsp-mapping.md`
- `/docs/modules/{fundraising|volunteers|grants|programs}.md`
- `/examples/portals/*` (signup/donation mini-apps)

## One-line prompt hint for AI tools

“You are implementing a lean, modular NPSP-style nonprofit suite on Twenty CRM for UK small–mid charities. Fundraising (with Gift Aid, recurring, simple rollups) is Phase 1. Volunteers, Grants, and Programs are optional modules with minimal schemas. Prefer sane defaults, simple rollups, and clean APIs for custom experiences. See /docs/PROJECT_CONTEXT.md for constraints.”
