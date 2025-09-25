# Managed Extension Decision Spike — Households, Funds, Portal

Updated: 2025-09-25
Participants: Product, Engineering
Scope: Q4 FY25 managed-extension proof of concept

## Questions Under Review
- **Households**: Should new workspaces enable Household grouping by default or ship as an optional toggle?
- **Funds/Allocations**: Do we introduce Allocation records in the core fundraising module, or treat them as an optional add-on until we see demand?
- **Portal Strategy**: For public signup/donation experiences, do we maintain an in-repo template, a separate starter kit, or rely on third-party connectors during the POC?

## Context & Constraints
- The POC goal for Q4 FY25 is to validate the managed-extension approach (see `/docs/PROJECT_CONTEXT.md` §7 and §11).
- We want defaults that minimise setup friction for small UK nonprofits while keeping our options open for later modules (Volunteers, Grants, Programs).
- Metadata automation is still evolving; anything we ship must be reproducible via scripts or the documented UI checklist.

## Options & Trade-offs

### Households Default
- **Enable by default**
  - Pros: Familiar to NPSP admins, smoother donor family onboarding.
  - Cons: Adds object/UI complexity on day one; requires education for users who do not need Households.
- **Ship as optional toggle (current manual default)**
  - Pros: Keeps core data model simpler for small orgs; aligns with our guidance to avoid Person Account-style complexity.
  - Cons: Extra step for orgs that expect Households; needs clear runbook for enabling.

### Allocations/Funds in Core
- **Include in MVP schema**
  - Pros: Supports restricted gifts and Grant integration from day one.
  - Cons: Adds objects/fields and rollup logic that many small orgs may not need yet; complicates imports and dashboards.
- **Defer to optional module**
  - Pros: Keeps POC lean; we can introduce once we validate demand from Grants/Programs.
  - Cons: Requires later migration path if early adopters need allocations sooner than expected.

### Portal Strategy
- **In-repo minimal template**
  - Pros: Immediate example for volunteer signup/donation forms; easy for pilots to tweak.
  - Cons: Adds frontend surface we must maintain; complicates gateway config and auth story.
- **Separate starter kit repository**
  - Pros: Keeps dev-stack focused; allows independent evolution of portals.
  - Cons: Introduces another repo for pilots to learn; reduces discoverability.
- **Rely on connectors + guidance (no bundled portal for POC)**
  - Pros: Matches current payment connector focus; avoids premature frontend commitments.
  - Cons: Lacks an opinionated template, so pilots must bring their own forms or third-party tools.

## Interim Recommendation (Q4 FY25)
- **Households**: Ship POC with Households **disabled by default**, but document a one-click enable path (metadata script or UI instructions). Revisit once volunteer module requirements firm up.
- **Allocations/Funds**: Keep allocations **out of the core MVP**. Capture requirements during Grants planning and introduce as an optional add-on when we can validate real usage. Provide guidance for mapping GAU allocations during imports so data isn’t lost.
- **Portal Strategy**: For the POC, **lean on third-party donation/volunteer connectors plus documentation**. Produce a short “bring-your-own form” guide and defer bundled portal templates until we finish the volunteer UX spike.

## Revisit Triggers
- Households default reviewed when ≥2 pilot orgs request it during onboarding or when volunteer schema lands.
- Allocation scope re-evaluated before Grants module build or if a pilot requires restricted gift reporting.
- Portal decision reconsidered once volunteer signup prototype (Backlog item 13) demonstrates the desired UX.

## Next Actions
1. Record these interim defaults in `DECISIONS.md` (D-0015).
2. Update onboarding/runbook docs to reference the household toggle and external connector guidance.
3. Ensure backlog tickets reference this spike for revisit triggers (e.g., Phase 2 volunteer items).
