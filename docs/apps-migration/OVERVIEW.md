# Fundraising App Overview

Updated: 2026-05-27
Status: Working guide (`current app + transition`)
Purpose: Define the current state of the fundraising app, the remaining transition work away from the legacy hybrid service model, and the principles that should guide the next implementation phases.

This doc is no longer just a case for starting a migration.

The migration is already materially underway:

- `apps/fundraising/nonprofit-fundraising` is now the main fundraising implementation surface in this repo
- substantial workflow, metadata, UI, and integration logic already lives in the app
- the remaining questions are mostly about hardening, completion, boundary discipline, and retirement of legacy service-era assumptions

This doc exists to keep that framing explicit.

## 1. Current Position

The repo has already moved beyond “should we migrate fundraising into Twenty apps?”

The active position is:

- the fundraising app is the primary product direction
- Twenty should remain the main system of record and host environment
- the legacy `fundraising-service` should now be treated as historical prior art, transitional runtime context, or an explicit exception path only where still required

That does not mean every open architecture question is settled.

It does mean the default assumption for new work should be:

- build or refine the app,
- do not start from the service,
- and do not write docs as if the app is still a hypothetical next step.

## 2. Why The Transition Still Matters

Even though the app is now the main implementation surface, the transition is not “done” in the operational sense.

The remaining work still matters because we need to:

- retire misleading service-first docs and assumptions
- decide which remaining legacy boundaries are still justified
- keep current app code aligned with Twenty’s evolving app/runtime contract
- finish hardening the workflows that are already implemented
- avoid carrying historical hybrid decisions forward just because they already exist

So this is now better understood as:

- a current app program with transition and retirement work,

not:

- an abstract pre-implementation migration exercise.

## 3. What Is Already True

The following should now be treated as current repo reality:

- the app already owns substantial fundraising workflow behavior
- the app already contains real metadata, front components, logic functions, and tests
- app-specific docs are no longer just planning notes; many now describe live implementation direction
- new sessions should expect to find significant product logic in `nonprofit-fundraising`, not be surprised by it

This matters because older phrasing such as:

- “moving functionality into apps”
- “first pilot app” as if nothing meaningful exists yet
- “review before migrating”

can now create the wrong mental model if left unqualified.

## 4. Current Goals

Product goals:

- keep the fundraising workflows that provide real user value
- simplify or redesign workflows where the old service-era shape was doing the right job in the wrong way
- complete the move toward a coherent fundraising experience inside Twenty

UX/UI goals:

- make the app feel native to Twenty where native surfaces are strong
- use custom UI where workflow-heavy fundraising tasks genuinely need it
- avoid recreating a separate service-era shell inside the app

Technical goals:

- keep app-owned logic and metadata boundaries clean
- harden the implementation that already exists rather than narrating it as future intent
- remove or quarantine legacy runtime assumptions that keep confusing new sessions
- preserve any still-useful external/service boundary only where the app/runtime genuinely benefits from it

## 5. Non-Goals

- This is not a blind lift-and-shift of `fundraising-service`.
- This is not a commitment to preserve every historical service surface.
- This is not a full rewrite of implemented app work just because some early docs were phrased as migration notes.
- This is not an excuse to keep legacy hybrid assumptions alive in docs once they are actively misleading.

## 6. Current Scope Framing

This work now includes:

- hardening the existing fundraising app
- clarifying current versus historical architecture in docs
- tightening app-runtime and metadata decisions where implementation is already real
- continuing to refine the fundraising attribution model around distinct `Fund`, `Appeal`, and child `AppealSource` concepts without treating the current shape as frozen
- deciding what remaining legacy boundaries should stay, shrink, or disappear
- continuing feature work in the app without regressing into service-first patterns

This work does not imply:

- every current implementation detail is final
- every service-era concept should survive unchanged
- the app must absorb every possible integration/runtime concern immediately if a narrower boundary remains cleaner for now

## 7. Implementation Principles

Use these principles for current work:

- Treat the app as real implementation, not speculative migration.
- Review and improve existing app behavior before extending it blindly.
- Preserve user value, not historical implementation accidents.
- Prefer Twenty-native surfaces first, but use custom app logic and UI where workflow quality depends on it.
- Keep derived operational meaning in TypeScript unless first-class metadata is clearly justified.
- Keep retirement pressure visible: if a legacy boundary or doc is still present, either justify it or mark it as legacy explicitly.
- Use Twenty’s official app docs as canonical for setup/build/dev workflow; record repo-specific implications here, not duplicate setup steps.

## 8. Open Questions That Still Matter

The open questions are now mostly about quality and boundaries, not whether the app approach is real.

The most important current ones are:

- where a companion runtime or external adapter is still the right hedge for public or provider-facing flows
- which operator-facing meanings should remain derived versus materialized into metadata
- how far we should lean on current observed Twenty runtime behavior versus app-owned protective patterns
- which remaining service-era assumptions can now be deleted rather than preserved as “transition context”

These are implementation-shaping questions for a live app, not reasons to narrate the repo as if migration has barely begun.

## 9. Recommended Reading Order

For the current app and transition posture, read in this order:

- [INDEX.md](docs/apps-migration/INDEX.md)
- [PILOT_APP_IMPLEMENTATION_PLAN.md](docs/apps-migration/PILOT_APP_IMPLEMENTATION_PLAN.md)
- [MIGRATION_WORKING_PATTERNS.md](docs/apps-migration/MIGRATION_WORKING_PATTERNS.md)
- [TWENTY_APP_DEV_WORKFLOW.md](docs/apps-migration/TWENTY_APP_DEV_WORKFLOW.md)
- [REVIEW_POSTURE.md](docs/apps-migration/REVIEW_POSTURE.md)
- [APP_HARDENING_BACKLOG.md](docs/apps-migration/APP_HARDENING_BACKLOG.md)

Use the older migration-review docs as supporting context, not as evidence that the app is still mostly hypothetical.
