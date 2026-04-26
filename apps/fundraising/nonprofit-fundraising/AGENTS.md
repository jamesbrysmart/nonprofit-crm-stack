## Purpose

This app is the pilot Twenty app for nonprofit fundraising operations.

Treat it as real product work delivered in phases, not as a throwaway spike. The current focus is the core operational workflow inside the app, not the full future fundraising platform.

## Working Posture

- Keep this file lightweight and provisional until the workflow has been tested in practice.
- Keep work app-local by default.
- Prefer Twenty-native commands, front components, host affordances, variables, and metadata before inventing custom equivalents.
- Keep fundraising policy and workflow interpretation in app-local TypeScript modules rather than letting it spread through front components and metadata.
- Treat front components as workflow shells.
- Treat metadata as durable fact storage and be cautious about storing operator-facing meaning that may be better derived in code.

## Local Context

Start with local files first:

- `README.md` for current scope, structure, and seed-data notes
- `TWENTY_UI_STYLE_REFERENCE.md` for concrete Twenty-native UI and styling guidance for custom front components
- `src/constants/` for app-level identifiers
- `src/__tests__/` for the current test shape
- feature folders under `src/` for app-local workflow and domain logic

If wider product or migration context is needed and is not available locally, defer rather than guessing.

## Current Scope

Current first slices:

1. app foundation
2. manual gift entry
3. staging and review
4. bounded batch processing
5. Gift Aid

## Local Conventions

- Prefer feature folders for domain code.
- Keep front components thin where possible.
- Treat existing `universalIdentifier` values as stable assets.
- Make metadata changes in small, coherent groups.
- Follow `TWENTY_UI_STYLE_REFERENCE.md` when refining or extending front-component UI.
- Before adding a custom UI pattern, check whether Twenty-native UI or host affordances already cover it.

## Good Local Tasks

- component implementation inside an already-decided workflow
- UI refinement within the existing workflow semantics
- localized bug fixes with clear expected behavior
- test additions around existing app behavior
- tight refactors that preserve current behavior and boundaries
- route, metadata, or front-component wiring that stays within the current slice

## Escalate Instead Of Deciding

Defer to the user or a higher-context agent when work would:

- change workflow semantics or introduce a new operator mental model
- change intake-routing behavior or trust/staging rules
- add or redefine persisted fields whose meaning may be better derived
- introduce a new boundary to another service or a wider repo concern
- reshape synced metadata identities instead of extending them additively
- expand scope beyond the current slice without an explicit reason
- depend on wider product or migration context that is not available locally

## Validation

Prefer the smallest relevant local checks:

- `yarn lint`
- `yarn test:unit` for pure TypeScript/domain logic
- `yarn test` only when the Twenty app-dev integration harness is intentionally needed

Useful local commands:

- `yarn twenty help`
- `yarn twenty exec --postInstall`
