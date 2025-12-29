# Partner Module Blueprint (Working Draft)

_Last updated: 2025-??-?? • Owners: Architecture / Partnerships_

This note captures the first pass at how external partners can build light extensions on top of our Twenty-powered nonprofit CRM. It mirrors the same conversations we are having with Twenty: start with today’s proven fork/submodule pattern, keep everything open, and leave room to adopt their official extensibility surface once it matures. Treat this as a living guidance doc, not a legal contract.

## 1. Purpose & Audience

- **Audience:** non-profit specialists (partners) with a small dev team, plus our internal product/architecture leads.
- **Goal:** let partners add focused functionality (extra metadata, UI, automations) without forcing us to own their roadmap or compromising the integrity of our managed modules (fundraising, rollups, etc.).
- **Scope:** MVP guidance for the first partner; expect to revise after the first integration and after the Twenty roadmap meeting.

## 2. Licensing Stance (mirror Twenty)

- We inherit Twenty’s dual-license posture (AGPLv3 + optional commercial license in the future). Every partner module distributed with or hosted alongside our stack must be AGPL-compatible today.
- Rationale:
  - Aligns with Twenty for potential future commercial agreements and avoids relicensing complexity.
  - Guarantees that improvements to partner modules remain open so other nonprofits can benefit.
  - Leaves us the option to negotiate dual-license terms later if we launch a managed cloud offering; we will revisit contributor agreements before that happens.
- Implication: partners retain their IP but must publish source for any hosted deployment per AGPL. If a partner wants proprietary terms later, we can discuss case-by-case once we have a dual-license story.

## 3. Module Scope & UX Expectations

- Partners extend the **existing** UX rather than replacing it. Think “add nonprofit-sub-niche features” (extra review steps, bespoke data fields, lightweight UI panels) while reusing our fundraising UI, data model, and rollups.
- Modules should be incremental: small services/UI packages that bolt on, not full vertical rewrites. They should not fork fundraising-service or Twenty themselves.
- When adding UI, render within `/modules/<partner>` behind the same gateway so users experience consistent navigation/auth.

## 4. Development & Integration Model

1. **Independent repo:** partner creates their own Git repo (recommended under their org) licensed under AGPLv3. This keeps ownership clean and lets them move autonomously.
2. **Submodule/manifest handshake:** we consume the module via a Git submodule (or similar pointer) inside `services/partners/<partner-module>`. Each module must expose a manifest describing:
   - Required Twenty metadata (objects/fields, picklists) and idempotent scripts to provision them.
   - API scopes and event/webhook subscriptions.
   - HTTP routes (UI + API) that the gateway should proxy.
   - Health/readiness endpoints and expected configuration/env vars.
3. **Starter kit:** we will provide a thin template (Nest service + React panel + metadata scripts + Dockerfile) so partners can scaffold quickly and align with our logging/auth conventions.
4. **Auth & data access:** modules call Twenty through the same API credentials/patterns fundraising-service uses. No direct DB access or bespoke persistence without an approved ADR.

### 4a. Client-Specific Extensions (draft)

- **Managed hosting:** allow bespoke code for a single org when it is paid for and isolated to their deployment. Keep changes inside the partner module or a dedicated submodule to avoid polluting core services.
- **Cloud/SaaS:** do not ship bespoke code per org until Twenty provides a safe per-tenant code surface. Use toggleable modules, Twenty apps, and declarative workflows instead.
- **Decision rule:** if the logic is reusable for multiple orgs, promote it into a toggleable module; if it is truly one-off, keep it isolated and document the support boundary.

## 5. Certification & Guardrails (light-touch for MVP)

- **Checklists before inclusion in our stack:**
  - Manifest validated (schema + metadata scripts reviewed).
  - Liveness/health endpoints exposed; structured logging includes `x-request-id`.
  - Smoke tests covering critical flows (ingest → UI → write-back) with sample data.
  - Security review lite: secrets stored via `.env`, no hard-coded API keys, dependencies patched.
- **Ongoing ownership:** partners operate their modules and support their customers. We reserve the right to pause updates (freeze submodule pointer) if regressions or vulnerabilities appear.
- Expectation is collaborative iteration—the first partner will work closely with us, so we’ll refine the checklist together and document lessons learned in `docs/DECISIONS.md`.

## 6. Engagement & Hosting Model

- **Default:** partner hosts and manages their module deployments, including client relationships and support obligations. We provide integration guidance and share our dev stack so they can test locally.
- **Optional future path:** if we later launch a hosted offering, we may offer a “managed runtime” where we host approved partner modules under separate commercial terms.
- Support boundaries should be spelled out in partner agreements: we remain accountable for our core modules; partners own their extensions.

## 7. Roadmap Alignment & Evolution

- Today’s approach mirrors our current “fork + managed services” architecture. As Twenty’s official extensibility (twenty-sdk apps, micro-frontends, serverless) matures and hits parity with our needs, we plan to pivot toward packaging modules for their marketplace. This blueprint will evolve accordingly.
- Revisit triggers:
  - Twenty delivers documented support for our metadata/rollup needs.
  - Multiple partners require a heavier certification or shared hosting model.
  - Licensing or commercial discussions with Twenty necessitate changes.

## 8. Immediate Next Steps

1. Finalize the starter kit (metadata script template, Nest/React skeleton, manifest spec).
2. Share this blueprint with the first partner and gather feedback on repo structure + guardrails.
3. Update `docs/DECISIONS.md` once the partner approach and licensing stance settle post-discussion with Twenty.

_Questions, tweaks, or partner feedback should be captured inline here until we promote the content into formal ADRs._
