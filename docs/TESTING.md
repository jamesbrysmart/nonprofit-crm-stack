# Testing Guide (dev-stack)

Purpose: make it clear what “good enough” testing looks like for changes in this stack, and where the canonical commands live.

## 0) Source of truth for commands

- **Fundraising service commands**: `services/fundraising-service/package.json` scripts.
- **Stack bring-up and smoke checks**: `docs/OPERATIONS_RUNBOOK.md`.
- **CI definition (if/when relevant)**: check workflow files in the repo that owns CI for the code you changed (e.g. `services/twenty-core/.github/workflows/*`).

When in doubt, prefer running the exact scripts/targets defined in the owning package’s config rather than inventing new commands.

## 1) Default expectations (definition of done)

For any code change:
- Add or update tests for the code you change when it’s reasonable to do so.
- Run the smallest relevant checks (lint + unit tests) for the component you changed.
- If the change affects runtime wiring (gateway/proxy/env/compose) or end-to-end behavior, run an end-to-end smoke check.
- Do not leave known failing tests/type errors “for later” without explicitly tracking it (e.g., in `docs/POC-backlog.md`) and calling it out in the session summary.

## 2) What to run (by change type)

### A) Docs-only changes (`docs/*`, runbooks, ADRs)
- Ensure the doc remains internally consistent (see `dev-stack/AGENTS.md` “Docs consistency” rule).
- If the doc changes operational steps, confirm they still match the actual scripts/config (don’t rely on memory).

### B) Compose / env / gateway wiring changes (`docker-compose*.yml`, `nginx/*`, `.env.example`)
- Validate the stack still comes up and health endpoints are reachable (see `docs/OPERATIONS_RUNBOOK.md`).
- Run the relevant smoke check(s) described in the runbook.

### C) Fundraising service changes (`services/fundraising-service/*`)
- Run the owning package’s lint and unit tests via `services/fundraising-service/package.json` scripts.
- If you changed Twenty proxy behavior, staging flows, or ingestion/processing, run the gift smoke test(s) referenced in `docs/OPERATIONS_RUNBOOK.md`.
- For focused debugging, use the test runner’s built-in filters (e.g., Jest `-t "<name>"`) rather than skipping the suite.

### D) Twenty core (`services/twenty-core/*`)
Default posture: we generally do not modify `services/twenty-core` in this stack.

If you explicitly approve a change there:
- Use Twenty’s own CI/workflow definitions and Nx targets as the source of truth (see `services/twenty-core/.github/workflows/*` and upstream docs within that repo).
- Keep diffs minimal and ensure the smallest relevant checks pass for the touched area (frontend/server/shared/etc.).

## 3) Smoke tests are not enough (but are necessary)

Smoke tests catch “does the main path work” failures (auth/proxy/gift creation/staging processing), but they do not replace unit tests. Treat smoke as:
- required when you change wiring or end-to-end behavior,
- insufficient alone for code changes in `services/fundraising-service`.

