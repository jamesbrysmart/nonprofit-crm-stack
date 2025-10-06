# Twenty Core Data Model Overview

**Purpose**  
Capture the baseline CRM objects we inherit from Twenty so downstream modules (Fundraising, Marketing, Events) can rely on a stable set of records without re-inventing them.

---

## Core Objects (Current Understanding)

| Object | Description | Notes |
| --- | --- | --- |
| `Person` | Atomic supporter record. Holds names, email/phone surfaces, consents, and Gift Aid declarations. | Gift entry and receipting treat this as the donor of record. |
| `Organisation` | Companies, trusts, or institutions we relate to people. | Used for corporate gifts, grantmakers, and employment/volunteer affiliations. |
| `Task` / `Activity` | Lightweight timeline entries for follow-ups. | Opportunities and stewardship flows attach here instead of bespoke notes tables. |
| `File` / `Attachment` | Shared file storage referenced by other objects. | Avoid duplicating upload logic in modules; link back here. |

> **To do:** confirm actual field names/enums from the synced Twenty schema once metadata automation stabilises. The table reflects working assumptions from the feature specs and current proxy code.

---

## Relationships & Dependencies

- `Person` ↔ `Organisation`: we reuse Twenty’s person→organisation lookup rather than building a custom junction (see `docs/features/households.md`).
- `Person` ↔ `Task`: activities reference people (and optionally organisations) but stay provider-agnostic.
- `Person` ↔ `Consent`/`GiftAidDeclaration`: stored on the core object so Fundraising modules can query eligibility without extra joins.

Keep these relationships immutable where possible—any downstream module that needs additional context should extend via new objects rather than mutating core schemas.

---

## Open Questions

- How will Twenty expose custom metadata automation for creating related objects (e.g., recurring agreements)?
- Do we need explicit audit tables in core for merges and consent changes, or can modules consume Twenty’s logs directly?
- Are there additional core picklists (e.g., person type, lifecycle stage) we should standardise before modules reference them?
- Where should household-style grouping live (part of a nonprofit core module vs. duplicated across fundraising/marketing)?

Document answers here as the platform team closes spikes.

---

## References

- `docs/features/households.md`
- Twenty API schema snapshot (`services/fundraising-service/src/graphql/twenty-schema.graphql`)
- Metadata automation runbook (`docs/METADATA_RUNBOOK.md`)
