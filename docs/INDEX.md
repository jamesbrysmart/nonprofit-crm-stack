# Docs Index (Source Map)

Goal: make `docs/` easy to navigate, reduce drift/contradictions, and clarify which documents are canonical vs working notes.

Use this as the entrypoint when you’re unsure where guidance lives.

## Canonical (“source of truth”)

Read these first when making decisions or changing how the system works.

- `DECISIONS.md` — ADR log: boundaries, defaults, trade-offs. Update only when a decision is made.
- `PROJECT_CONTEXT.md` — product thesis, module scope, principles, roadmap, open questions to track.

## Runbooks (“how to operate”)

Read these before running operational commands or changing operational behavior.

- `TESTING.md` — testing expectations for this stack + where the canonical commands live.
- `OPERATIONS_RUNBOOK.md` — bring-up/down, health endpoints, smoke checks, debugging, logging conventions.
- `DOCKER_ENV_APPROACH.md` — docker/env wiring approach, build strategy, env var management, storage notes.
- `METADATA_RUNBOOK.md` — metadata provisioning steps + verification checklist + watch log.
- `USER_RUNBOOK.md` — user-facing workflow guidance (how the UI should be used today).
- `REPORTING_EVIDENCE.md` — Evidence dashboard POC runbook and operational notes.

## UX / UI

- `UX_UI.md` — UI/UX principles + working notes + “as-built” status. Consult principles before UI changes; update as-built after.

## Feature specs (what we’re building)

These describe intended behavior and workflows at the feature level.

- `features/` — per-feature specs (donation intake, staging, reconciliation, receipts, recurring, households, campaigns/appeals).
- `solutions/` — cross-feature designs / “how we solve it” docs.
  - `solutions/gift-batch-processing.md` — canonical as-built solution notes for batch processing, donor-match/create-donors runs, invariants, and operating model.

## API / Reference notes (may drift)

These are helpful when implementing, but validate against upstream/API schemas when exactness matters.

- `TWENTY_GIFTS_API.md` — notes on Twenty gifts endpoints + proxy considerations.
- `TWENTY_METADATA_API.md` — Metadata API findings + gotchas + open questions.
- `TWENTY_AI_INTEGRATION.md` — notes on AI-related integration in Twenty context.
- `TWENTY_EXTENSIBILITY_WATCH.md` — release watch / notes on Twenty extensibility direction.

## Backlog / planning

- `POC-backlog.md` — POC execution backlog; source for “what’s next” and ownership.
- `spikes/` — experiments and one-off investigations; treat as historical context unless promoted into canonical docs.

## Contribution / governance

- `CONTRIBUTING.md` — contributor workflow guidance (branches, PRs, submodule update pattern).
- `LICENSE-ANALYSIS.md` — licensing implications and constraints.
- `PARTNER_MODULE_BLUEPRINT.md` — partner module concept notes (use when discussing packaging/partner approach).

## Consolidation candidates (do not delete without review)

These look duplicative or at risk of drifting. Preferred approach is to pick one canonical doc and turn the other into a short pointer.

- `data-model.md` vs `FUNDRAISING_DATA_MODEL.md` (and relevant ADRs) — consider making `data-model.md` a pointer or merging the overlapping sections.
- `ARCHITECTURE.md` overlaps with `DECISIONS.md` (data plane strategy) — decide whether `ARCHITECTURE.md` remains “working notes” or becomes a pointer to the ADR(s).
- `TWENTY_*` reference docs — consider adding “last verified against version X on date Y” to reduce accidental staleness.
