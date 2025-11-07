# Households & Donor Relationships — Lean, Modular Design (UK-first)

**Purpose:** Implementation-focused guidance for modelling households, person–organisation affiliations, and (later) person–person relationships in a **lean nonprofit CRM** for **small–mid orgs**, launching UK-first but globally aware. Use alongside `docs/PROJECT_CONTEXT.md` (data principles) and `docs/features/gift-receipts.md` / `recurring-donations.md` to keep data and stewardship behaviour aligned.

---

## Product Goals & Constraints

- **Simplicity over perfection:** Deliver the 80–90% most orgs need; avoid enterprise graph complexity.
- **Individuals first:** Every supporter is an individual contact; households only group and roll up.
- **Leverage the platform:** Prefer light schema that works with Twenty’s native person–org link and rollup tooling.
- **Global-ready:** UK defaults, but neutral naming so other regions slot in later.
- **Manual choice, not auto magic:** Make household creation/joining easy, but never automatic without confirmation.

---

## Core Principles

1. **Individual contacts are the atomic unit.** Donations, Gift Aid declarations, receipts, and consents attach to the person.
2. **Household as optional helper.** One contact may belong to at most one household (MVP). Households provide shared mail details and rollups, not a donor of record.
3. **Person↔Organisation affiliation uses native Twenty link.** Add lightweight metadata (role, dates) but avoid bespoke junctions unless required.
4. **Typed contact↔contact relationships are Phase 2+.** MVP ships without partner/parent objects; keep a path to add once demand is validated.
5. **Data quality via UX.** Inline dedupe, smart prompts, and clear defaults keep records clean; AI augments but never auto-commits structural changes.

---

## Minimal Data Model (Proposed)

### `contact`
- Core person fields (name, salutation variants, emails, phones).
- `householdId` (nullable FK) → household membership derived from this reference.
- `companyId` (lookup to organisation) with supporting metadata fields (`orgRole`, `orgTitle`, `orgDepartment`, `orgStartDate`, `orgEndDate`, `orgNotes`). This mirrors Twenty’s native person→organisation lookup rather than introducing a junction object.
- Mailing address field (single `ADDRESS` type for MVP, add alternates later).
- Gift Aid declaration FK (UK) and channel consents (per `docs/features/gift-receipts.md`).
- Contact-level rollups (lifetime, YTD, last gift) supplied by the managed rollup engine.

### `household`
- `id`, `name` (default `"{Surname} Household"` on create).
- `primaryContactId` (lookup to person; created manually in metadata UI, must be a member).
- Mailing fields: `envelopeName`, `salutation` (formal/informal) plus shared mailing `ADDRESS`.
- Shared address (defaults to primary contact, can diverge).
- Rollups materialised via the same engine used for contacts (lifetime total, YTD, last gift date + by whom).
- `createdAt`, `updatedAt`, audit metadata.

Membership is derived: any contact with `householdId = household.id` is a member. No separate members array needed unless Twenty surfaces one later.

### (Deferred) `contactContactRelationship`
- Phase 2+. If introduced: `fromContactId`, `toContactId`, `type` (Spouse/Partner, Parent/Child, Sibling, Other), reciprocity rules, optional `startDate`, `endDate`.

---

## Key Workflows

### Guided Create/Join Household
1. From a contact, choose **Add to household**.
2. Search for existing household (by name/address) or create new (`{Surname} Household`).
3. Confirm primary contact (default current contact), auto-generate envelope + salutation, inherit address with option to override.
4. Show members list with **Make primary / Remove** actions and a link to open the household record.
- **Pilot delivery:** Flow launches inside the Fundraising Admin console (our manual intake UI) before we wire it into core contact pages.

### Address Management
- Updating the household address prompts to apply to all members (default **Yes**).
- Updating an individual address prompts user to **split (remove from household)** or **update household address**.
- Gift Aid declarations remain per individual even when sharing addresses.
- **Pilot delivery:** Start with a manual “copy shared address to member” action instead of auto-sync to keep scope lean and reversible.

### Mailings & Receipting
- Print mail defaults to **one per household**, using household salutation/address; can override to individual per send.
- Email remains **per contact** by default; supports contact-level opt-out.
- Household rollups surface on both household and member contact pages for context.

### Person↔Organisation Affiliation
- Inline widget on contact: search organisation (lookup), choose role, mark as primary employer, capture title/department and dates.
- Lists and filters: “Board Members”, “Volunteers at Org X”, etc.

### Merge & Dedup
- On-create/import dedupe: match on email (all known), name + address, phone, fuzzy variants; prompt to merge or create new.
- Merge wizard must reassign gifts, household membership (choose resulting household + primary contact), affiliations, consents, and Gift Aid declarations; audit every decision.
- Merging two households: choose surviving household, move members, combine rollups (recompute), reconcile mailing fields.

---

## UX Priorities

- Contact page: **Household panel** (members list, primary badge, actions), rollup summary, address management prompts.
- Household record: members table with quick actions, rollup metrics, shared address editor, print-mail settings.
- Affiliation widget with badges for roles (Board, Employee) and quick add/edit.
- Smart suggestions surfaced inline (rules → AI): shared address + surname → “Add to household?”; corporate domain → “Link to organisation?”; joint name entry → “Split into two contacts + create household?”.
- Potential duplicates view with scores/reasons; queue for merge.

---

## Best Practices (What to Build First)

1. Individuals remain donors of record; households only aggregate and drive mail dedupe.
2. One household per contact (MVP); multi-household and complex graphs defer to Phase 3.
3. Keep household object thin—identify primary, manage shared mailing fields, surface rollups.
4. Reuse Twenty’s person→organisation lookup; extend with lightweight metadata fields on the contact.
5. Defer structured contact↔contact relationships; if surfaced, start with a single note-only field.
6. Drive data hygiene via guided flows, inline dedupe, and clear prompts (no silent automation).
7. Maintain consistent salutations: store contact + household formal/informal/envelope values; auto-generate, allow edits.
8. Roll up giving using the existing rollup job/service, recalculating when gifts change or nightly as needed.

---

## AI Augmentation (Phase 2+)

- **Dedup suggestions:** Fuzzy matching on nicknames, punctuation, and address normalisation; learn from merge outcomes.
- **Household inference:** Propose households based on address + surname + life stage; user confirms.
- **Affiliation inference:** Email domains or enrichment hint at employer/role; present as a prompt.
- **Anomaly detection:** Detect joint names or suspicious duplicates; offer guided split/merge.

AI never auto-commits; all structural changes require human confirmation.

---

## Reliability & Governance

- Full audit trail for merges, household membership changes, address propagation, affiliation edits (who/when/what).
- Imports use stable external IDs to keep household/affiliation links idempotent across re-runs.
- GDPR compliance: household mail uses shared address but respects individual channel consents and lawful basis.

---

## KPIs / Success Criteria

- Duplicate creation rate < 1% of new contacts monthly.
- Zero duplicate household letters in test mail runs.
- Add/join household in ≤ 30 seconds (p95).
- Merge accuracy > 98% (donations and links preserved).
- Adoption: > 80% new couples captured as two contacts + household (vs. joint-name contact).

---

## Release Slices (Proposal)

- **Release 0 — Admin Pilot (current focus)**
  - Add `householdId` to contacts and introduce a lean `household` object with shared `ADDRESS` + salutation fields.
  - Manage households from the Fundraising Admin console: search/add members, create new households, and manually copy addresses.
  - No rollups, suggestions, or dedupe automation yet—validate appetite and data expectations first.

- **Release 1 — Foundations**
  - Manual create/join household flow embedded on contact + household records with guided prompts.
  - Household record (members, primary, salutation/address fields) surfaced in core Twenty UI.
  - Household rollups (lifetime, YTD, last gift) powered by the existing rollup engine.
  - Print-mail dedupe toggle (one-per-household) and visibility of household rollups on contact pages.
- Person↔organisation lookup UI (role, primary employer metadata exposed on contact form).

- **Release 2 — Operations & Hygiene**
  - Merge wizard enhancements covering households, affiliations, consents, Gift Aid declarations.
  - Household dashboard (recent changes, rollup insights, potential duplicates).
  - Inline suggestions for householding/affiliations (rules-based, with future AI hooks).
  - Secondary addresses on contacts + household, with better propagation prompts.

- **Release 3 — Advanced Networks**
  - Typed reciprocal contact relationships (Spouse, Parent, etc.) with simple visualisation.
  - AI-powered dedupe/household inference at scale.
  - Multi-household membership (edge cases), more granular rollups, and enrichment integrations.

Roadmap may slim Release 1 further during planning; this breakdown sets initial prioritisation.

---

## Default Settings (Recommended)

- Feature available by default; household creation/joining requires explicit user action (guided prompt when appropriate).
- Creating a new contact with the same adult address triggers a prompt (“Join existing household?”) but never auto-adds without confirmation.
- Print mail default: send one per household unless overridden; email default: per individual.
- Person↔org roles seeded with Board, Employee, Volunteer, Alumni, Employer (editable picklist).

---

## Open Questions & Next Steps

- Validate how Twenty’s native merge handles child records/affiliations; schedule a spike to test merge flows end-to-end.
- Confirm rollup engine capabilities for household totals (incremental vs nightly) and performance impact.
- Determine whether Twenty exposes household membership arrays we can reuse; otherwise rely on `householdId`.
- Explore whether household records should support custom fields (e.g., notes, preferred comms) in Phase 2.
- Validate whether single `companyId` lookup is sufficient for most pilots or if secondary affiliations require an earlier enhancement.

---

## Conclusion

1. Treat individuals as the source of truth for giving, declarations, and consent; households exist to streamline stewardship.
2. Keep household schema thin and optional, with explicit user actions and clear prompts in the UI.
3. Reuse existing rollup and affiliation patterns to stay aligned with the managed extension approach.
4. Invest early in merge/dedupe flows so householding does not degrade data quality.
5. Stage delivery: ship core grouping and rollups first, then layer operational tooling and advanced relationships as the product matures.
