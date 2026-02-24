# Testing & Quality Workflow (dev-stack)

Purpose: define the minimum quality bar for changes in this stack and point to the canonical commands (run what exists, not what we wish existed).

This is intentionally lightweight and is modeled on Twenty’s posture: run lint + type checks + relevant tests after changes, and reserve heavier end-to-end checks for wiring / critical flows.

## Sources of truth (commands)

- Fundraising service scripts: `services/fundraising-service/package.json`
- Stack bring-up and smoke checks: `docs/OPERATIONS_RUNBOOK.md`
- Twenty core checks (when relevant): `services/twenty-core/.github/workflows/*` and `services/twenty-core/CLAUDE.md`

When in doubt, run the exact scripts/targets defined in the owning package’s config rather than inventing new commands.

## Definition of done (default)

For any non-trivial change:

- Add or update tests when reasonable.
- Run the smallest relevant checks for the component you touched (lint + type checks + unit tests where applicable).
- TypeScript type checking for `services/fundraising-service` is enforced in strict mode via `services/fundraising-service/tsconfig.json`; run `npm -C services/fundraising-service run typecheck` as part of the default checks.
- When debugging, prefer running the single most relevant test file first (e.g., `npm -C services/fundraising-service test -- <path/to/file.spec.ts>`) before running the full suite.
- If the change affects runtime wiring (gateway/proxy/env/compose) or user-facing end-to-end behavior, run an end-to-end smoke check.
- Don’t “leave it red”: if checks fail and you’re not fixing it now, explicitly track it (e.g., `docs/POC-backlog.md`) and call it out in the session/PR summary.

## What to run (by change type)

| Change type | Minimum checks | Notes |
| --- | --- | --- |
| Docs-only (`docs/*`, ADRs, runbooks) | internal consistency scan | See `AGENTS.md` “Docs consistency”. If you changed operational steps, verify against scripts/config. |
| Wiring (`docker-compose*.yml`, `nginx/*`, `.env.example`) | bring-up + health + relevant smoke | Use `docs/OPERATIONS_RUNBOOK.md` as the canonical checklist. |
| Fundraising service (`services/fundraising-service/*`) | package lint + tests; smoke when end-to-end changes | Use `services/fundraising-service/package.json`. If you touched proxy/ingestion/staging/batch processing, run the gift smoke checks from `docs/OPERATIONS_RUNBOOK.md`. |
| Vendor sync (updating `services/twenty-core` pointer) | health + smoke checks | Treat as maintenance, not feature work. Validate the stack using `docs/OPERATIONS_RUNBOOK.md`. |
| Twenty core code change (`services/twenty-core/*`, exceptional) | Twenty Nx targets + relevant tests | Default posture: avoid edits; only do this when explicitly approved. |

## Fundraising: focused regression pack (gift-batch)

When changing gift-batch workflows, prefer this pack before wider runs:

- `npm test -- gift-batch/gift-batch-processing.service.spec.ts`
- `npm test -- gift-batch/gift-batch-donor-match.service.spec.ts`
- `npm test -- identity-resolution/person-identity.service.spec.ts`
- `npm test -- gift-staging/gift-staging.service.spec.ts`
- `npm test -- gift-staging/gift-staging-processing.service.spec.ts`
- `npm run client:build`

For batch-processing/rate-limit investigations, use the runbook’s `Batch smoke + retry ledger (gift-batch)` procedure so results are comparable across sessions. For deeper context, see `docs/solutions/gift-batch-processing.md`.

## Smoke tests are necessary (but not sufficient)

Smoke tests catch “main path works” failures (auth/proxy/gift creation/staging processing), but they do not replace unit tests for `services/fundraising-service`.
