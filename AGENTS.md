# Agent Guide (dev-stack)

This file defines how Codex should work in the `dev-stack/` superproject. Treat this as the canonical “how we work” doc for Codex in this repo tree.

`GEMINI.md` can exist as a legacy prompt guide, but any stable guidance that affects how Codex operates should live here.

## Sources Of Truth (read before acting)
Use the docs below as the canonical source of truth; avoid “plausible” commands or assumptions from memory. If guidance appears to conflict, ask and/or verify against code/config, then propose a docs fix.

- Docs map / discovery entrypoint: `docs/INDEX.md`
- Onboarding / baseline setup: `README.md`
- Operations + “how to run” + smoke tests + debugging: `docs/OPERATIONS_RUNBOOK.md` (and `docs/DOCKER_ENV_APPROACH.md` when Docker/env details matter)
- Testing expectations and where commands live: `docs/TESTING.md`
- Architecture decisions and trade-offs: `docs/DECISIONS.md`
- UI/UX guidelines: `docs/UX_UI.md`
- Automation patterns and tool choices: `docs/AUTOMATIONS.md`
- Integrations (inbound/outbound flows): `docs/INTEGRATIONS.md`
- Broader product context/specs: `docs/PROJECT_CONTEXT.md` and relevant `docs/features/*`

## Defaults
- Prefer small, reversible changes. If a proposal affects architecture, wiring, or workflows, write a short plan first.
- No workarounds or hacky fixes by default. If something fails, stop and surface the root cause. Only propose a workaround if it’s truly the least-cost path and you’ve checked with the user first. MVP status doesn’t justify accruing avoidable debt.
- Assume docs can drift: if something looks stale, verify against code/config rather than trusting the doc.
- Keep changes scoped to the repo/submodule you’re working in; don’t “tidy up” unrelated areas unless asked.

## Git + submodules (important)
This repo is a superproject with submodules under `services/`.

- **Solo project note:** assume you are the only contributor. Avoid repeated coordination warnings about others changing branches or pointers; focus on the rules below.
- Branch naming: feel free to create your own branch names without needing to ask.

- Always run `git status` (superproject) before and after edits; call out any submodule pointer changes explicitly.
- Do not update submodule pointers (or run `git submodule update --remote`) unless explicitly asked.
- If a task requires changes in a submodule:
  - Commit inside the submodule repo first.
  - Then update the superproject pointer in `dev-stack/` in a separate commit (only if/when requested).
- If there is risk of accidental pointer updates, stop and ask before staging/committing.

## Permissions & safety gates
- If a task requires elevated permissions in the environment, ask for approval rather than stopping.
- Ask for permission before any git command that is not read-only.
  - Read-only (ok by default): `git status`, `git diff`, `git log`, `git show`, `git rev-parse`, `git branch --show-current`, `git remote -v`, `git submodule status`.
  - Requires permission first: `git add`, `git commit`, `git checkout`/`git switch`/`git restore`, `git reset`, `git clean`, `git merge`/`git rebase`/`git cherry-pick`, `git pull`/`git push`/`git fetch`, `git submodule update`, and anything that moves pointers or discards work.
- Ask for permission before destructive or state-changing ops (e.g., `docker compose down -v`, wiping volumes, mass deletes).

## Commands, tooling, and tests (defaults)
- Prefer `docker compose` (v2). Explain flags briefly when suggesting commands.
- For local dev bring-up and host-accessible ports, the local override is documented in `README.md` and `docs/OPERATIONS_RUNBOOK.md` (do not duplicate commands here).
- In `services/twenty-core`, use Yarn/Nx commands; avoid `npx` patterns that Yarn 4 blocks.
- Testing is important:
  - Default: propose the smallest relevant lint/typecheck/unit-test commands for the area touched.
  - Ask before running long/broad suites or slow Docker pulls/builds, especially if they change local state.
- If a command fails due to transient infra (pulls, network, flakey healthchecks), retry once; if it still fails, stop and ask rather than guessing system-level fixes.

## “Definition of done” (adapt to scope)
- Run the smallest relevant checks for the packages you touched (lint/typecheck/tests).
- If a change alters behavior/config/ops, propose the smallest doc updates needed (see next section).

## Documentation hygiene (session wrap-up)
When a work session changes behavior, workflow, or assumptions, propose a tiny “docs delta” at the end:
- `docs/DECISIONS.md` only for real decisions/trade-offs (don’t churn it for trivia).
- `docs/OPERATIONS_RUNBOOK.md` for new operational commands, smoke tests, debug steps, health endpoints, or known failure modes.
- `README.md` only for onboarding-level changes.
- If guidance is duplicated across docs, prefer consolidating by making one doc canonical and replacing duplicates with links (do not delete docs without asking).

## Docs consistency (avoid contradictions)
- When editing any documentation file, do a quick “internal consistency scan” before finishing:
  - skim earlier sections you might contradict,
  - search the doc for key terms you changed (feature names, env vars, commands),
  - reconcile conflicting statements rather than appending “but also…” notes.
- If information is context-dependent (local dev vs hosted pilot), add a short scope note so guidance doesn’t conflict.

## UI changes (our code)
- Before UI/interface changes in our code, consult `docs/UX_UI.md` for general guidelines (Tailwind conventions, UX principles).
- After UI changes, update the “as-built” notes in `docs/UX_UI.md` so the doc stays aligned with reality.

## Third-party fork policy: `services/twenty-core`
- Default: do not modify `services/twenty-core` (treat as third-party forked code).
- Exception: only change it when explicitly approved by the user (e.g., a critical bugfix). Keep diffs minimal and document the rationale in the relevant doc.

## Operational guardrails (common pitfalls)
- Avoid wiping volumes/data (`docker compose down -v`) unless explicitly confirmed.
- Be careful with environment-variable overrides: shell-exported values can override `.env` (verify when values “refuse” to change).
- Let Twenty own its migrations/boot sequence; avoid “helpful” manual DB setup unless the runbooks explicitly call for it.
