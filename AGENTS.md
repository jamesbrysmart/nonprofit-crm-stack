# Agent Guide (dev-stack)

This file defines how Codex should work in the `dev-stack/` superproject. Treat this as the canonical “how we work” doc for Codex in this repo tree.

`GEMINI.md` can exist as a legacy prompt guide, but any stable guidance that affects how Codex operates should live here.

## Sources Of Truth (read before acting)
Use the docs below as the canonical source of truth; avoid “plausible” commands or assumptions from memory. If guidance appears to conflict, ask and/or verify against code/config, then propose a docs fix.

- Docs map / discovery entrypoint: `docs/INDEX.md`
- Onboarding / baseline setup: `README.md`
- Current app-local setup and conventions: `apps/fundraising/nonprofit-fundraising/README.md`
- Operations + runtime status notes for legacy/hybrid runtime work only: `docs/runbooks/OPERATIONS_RUNBOOK.md`
- Testing expectations and where commands live: `docs/TESTING.md`
- Architecture decisions and trade-offs: verify against current code plus the current canonical docs in `docs/` and `docs/apps-migration/`; do not assume an older ADR file is still canonical
- UI/UX guidelines: `docs/UX_UI.md`
- Broader product context/specs: `docs/PROJECT_CONTEXT.md` and relevant `docs/features/*`

When working on fundraising-to-Twenty migration questions, also check:

- `docs/apps-migration/INDEX.md`
- `docs/apps-migration/OVERVIEW.md`
- `docs/apps-migration/MIGRATION_WORKING_PATTERNS.md`
- `docs/apps-migration/UI_COMPONENTS_CATALOG.md`
- `docs/apps-migration/TWENTY_APP_DEV_WORKFLOW.md`
- `docs/apps-migration/TWENTY_NATIVE_REFERENCE.md`

Treat those migration notes as the main current guidance for fundraising app work unless code has clearly moved beyond them.

When the question is specifically about Twenty behavior, SDK surface, current app patterns, or likely supported implementation shape:

- inspect `services/twenty-core` first
- inspect the repo-local Twenty notes in `docs/apps-migration/*` second
- use web docs only when local code/docs are insufficient, when confirming current released workflow details, or when the user explicitly asks for web verification

## Defaults
- Prefer small, reversible changes. If a proposal affects architecture, wiring, or workflows, write a short plan first.
- No workarounds or hacky fixes by default. If something fails, stop and surface the root cause. Only propose a workaround if it’s truly the least-cost path and you’ve checked with the user first. MVP status doesn’t justify accruing avoidable debt.
- Prefer tidy code over compatibility shims or fallback aliases. When renaming, moving, or replacing code, update callers and delete stale paths rather than leaving fallbacks that can hide missed references or real bugs.
- Prefer deletion over addition when code is pre-client, unversioned, or confirmed legacy. Before adding fallback handling for an old field, component, route, or file, verify whether that old path should still exist; if not, remove the stale references instead.
- Do not add compatibility re-exports, ignored-field filters, legacy branches, or "just in case" abstractions unless backward compatibility is explicitly required.
- Add abstractions only when they remove current duplication, clarify a current workflow, or protect an important runtime boundary.
- Assume docs can drift: if something looks stale, verify against code/config rather than trusting the doc.
- For Twenty-specific questions, prefer local verification in `services/twenty-core` and repo docs before browsing the web. Do not default to web search when the answer is likely visible in the checked-out code or local reference notes.
- Keep changes scoped to the repo/submodule you’re working in; don’t “tidy up” unrelated areas unless asked.

## Operating model
- Codex remains the primary agent for higher-level reasoning, architecture, product/workflow framing, cross-app reasoning, and larger implementation sessions.
- Mistral Vibe may be used inside specific app repos for narrower execution work once the frame is already clear.
- App-local guidance for Mistral should live in each app repo’s `AGENTS.md`.
- Treat this as an evolving working pattern. Refine it based on real usage rather than trying to overdefine it in advance.

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
- Elevated-permission commands (environment-specific). Always request escalation when needed rather than retrying silently.
- `docker` / `docker compose` (any command that touches the Docker socket).
- legacy fundraising-service smoke scripts or gateway-path checks.
- `git push` (requires network + credentials outside the sandbox).
- API testing scripts that require Docker context or host networking (e.g., `curl` against container-only endpoints) should request escalation.
- For escalated commands that commonly run long (image pulls, compose bring-up), use a longer timeout by default so they do not require repeated approvals.
- Ask for permission before destructive or state-changing ops (e.g., `docker compose down -v`, wiping volumes, mass deletes).

## Commands, tooling, and tests (defaults)
- Prefer `docker compose` (v2). Explain flags briefly when suggesting commands.
- Do not assume the old local Docker gateway workflow is current. Prefer the app-first guidance in `README.md` and `docs/apps-migration/TWENTY_APP_DEV_WORKFLOW.md`.
- Do not treat `docs/runbooks/OPERATIONS_RUNBOOK.md` as a default “how to run the repo” guide; it is mainly legacy runtime context now.
- In `services/twenty-core`, use Yarn/Nx commands; avoid `npx` patterns that Yarn 4 blocks.
- For Twenty code/API/doc questions, search `services/twenty-core` and the local app docs before using external search.
- Testing is important:
  - Default: propose the smallest relevant lint/typecheck/unit-test commands for the area touched.
  - Ask before running long/broad suites or slow Docker pulls/builds, especially if they change local state.
- If a command fails due to transient infra (pulls, network, flakey healthchecks), retry once; if it still fails, stop and ask rather than guessing system-level fixes.

## “Definition of done” (adapt to scope)
- Run the smallest relevant checks for the packages you touched (lint/typecheck/tests).
- If a change alters behavior/config/ops, propose the smallest doc updates needed (see next section).

## Session wrap-up prompts (Codex)
- Before ending a coding session, proactively propose the smallest relevant check command(s) based on files changed.
- Default for `apps/fundraising/nonprofit-fundraising`: propose the smallest relevant app checks such as `yarn test:unit` or a focused `yarn test` run from that app.
- For docs or workflow questions about the fundraising app, check `apps/fundraising/nonprofit-fundraising/README.md` before falling back to older cross-repo notes.
- Treat `services/fundraising-service` checks as legacy-only unless the task explicitly touches that code.
- For wiring/compose/gateway changes: confirm first that the task is intentionally about the legacy integrated runtime before proposing Docker-based checks.
- If a file grows materially during iteration (large services/components), it’s fine to defer refactoring while the behavior is still in flux, but before “ready to ship” propose a split/extraction pass so we don’t commit hard-to-maintain 1000-line files.
- Prefer brief comments that explain *why* a non-obvious decision exists (trade-offs, constraints, safety checks), not what the code is doing line-by-line.

## Documentation hygiene (session wrap-up)
When a work session changes behavior, workflow, or assumptions, propose a tiny “docs delta” at the end:
- keep canonical docs aligned with the current app-first workflow and retire or quarantine legacy service-first guidance when it becomes misleading.
- `docs/runbooks/OPERATIONS_RUNBOOK.md` for legacy runtime status notes only when that runtime is still intentionally relevant.
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
