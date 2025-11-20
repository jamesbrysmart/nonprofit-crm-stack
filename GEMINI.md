# GEMINI.md

This guide keeps Gemini aligned with the non-profit CRM stack’s conventions so we give consistent, high-quality help across the superproject and its submodules.

## Project Overview
- The root repo orchestrates Twenty Core, the fundraising-service, PostgreSQL, Redis, and the Nginx gateway with Docker Compose; Twenty plus the fundraising module deliver the AI-first CRM.
- Git submodules under `services/` track the upstream apps—keep Compose config, docs, and ADRs (`docs/DECISIONS.md`) synchronized with their versions (see decision D-0014).
- Before proposing architecture or feature work, read the latest `README.md`, relevant `docs/features/*`, and `docs/DECISIONS.md`, then share a plan so we only make well-vetted moves.
- When discussing alternatives, challenge the status quo constructively; record any agreed changes as an ADR update in `DECISIONS.md`.

## Initial Setup
1. Clone with submodules so Twenty and the fundraising-service are checked out at matching commits: `git clone --recurse-submodules <repo-url>`.
2. Copy environment files (`cp .env.example .env` and mirror the submodule `.env.example` files) and fill in secrets such as `TOKEN` or `TWENTY_API_KEY`.
3. Install dependencies if needed inside each submodule (`cd services/twenty-core && yarn install`, same for fundraising-service).
4. Bring up the stack from the repo root with Docker Compose V2: `docker compose up --build -d` (# `--build` forces image rebuilds; `-d` runs containers detached). Always mention what flags mean when sharing Compose commands.
5. Access the apps once containers are healthy: Twenty at http://localhost:3000 and the fundraising gateway at http://localhost:4000/fundraising (unless nginx config overrides it).

## Key Commands
Always prefer `docker compose` (with a space) and give a one-line explanation for every Compose command. Use Yarn-native Nx invocations inside `services/twenty-core` because Yarn 4 disables `npx` by default.

### Stack Orchestration (repo root)
```bash
docker compose up --build -d  # Build fresh images (--build) and start everything in the background (-d).
docker compose down           # Stop containers but keep volumes/data intact.
docker compose logs -f svc    # Stream logs (-f) for a single service (replace svc with postgres, gateway, etc.).
git submodule update --remote --merge  # Pull latest commits for each submodule when we need to track upstream.
```

### Twenty Core (services/twenty-core)
```bash
yarn start  # Run frontend + backend + worker concurrently via Nx targets.
yarn nx start twenty-front  # Frontend dev server (Vite).
yarn nx start twenty-server  # Backend NestJS server.
yarn nx run twenty-server:worker  # Background worker queue.

yarn nx test twenty-front  # Frontend unit tests (Jest + React Testing Library).
yarn nx test twenty-server  # Backend unit tests.
yarn nx run twenty-server:test:integration:with-db-reset  # Integration suite with a database reset.

yarn nx lint twenty-front         # Frontend lint.
yarn nx lint twenty-server        # Backend lint.
yarn nx lint twenty-front --fix   # Auto-fix lint issues when possible.
yarn nx typecheck twenty-front    # TypeScript project references check.
yarn nx typecheck twenty-server
yarn nx fmt twenty-front          # Code formatting helpers.
yarn nx fmt twenty-server

yarn nx build twenty-front  # Production build.
yarn nx build twenty-server

yarn nx database:reset twenty-server          # Drop + recreate the DB schema.
yarn nx run twenty-server:database:init:prod  # Initialize production schema locally.
yarn nx run twenty-server:database:migrate:prod  # Apply migrations.
yarn nx run twenty-server:typeorm migration:generate src/database/typeorm/core/migrations/[name] -d src/database/typeorm/core/core.datasource.ts  # Generate a migration; ensure the path matches Nx expectations.
yarn nx run twenty-server:command workspace:sync-metadata  # Sync workspace metadata.

yarn nx run twenty-front:graphql:generate  # Regenerate GraphQL types.
```
When testing the UI end to end, click “Continue with Email” and use the prefilled credentials.

### Fundraising Service (services/fundraising-service)
```bash
npm run lint  # Current priority—fix violations in appeal/company/people/opportunity services, staging tests, and webhook handlers.
npm test      # Run the service’s Jest suites when making backend changes here.
```

## Architecture & Principles
- Twenty Frontend: React 18, TypeScript, Recoil for global state, Emotion for styling, GraphQL via Apollo Client.
- Twenty Backend: NestJS modules, TypeORM with PostgreSQL, Redis for caching/sessions, GraphQL Yoga, BullMQ for background jobs.
- Nx workspace rules: functional components only, named exports only, prefer `type` aliases over `interface` unless extending third-party types, favor string literal unions over enums (except GraphQL enums), and never use `any`.
- State updates should go through event handlers rather than broad `useEffect` listeners where possible.
- Styling and i18n: follow Emotion’s styled-component patterns and use Lingui for localization; components live in their own directories with collocated tests and stories.
- Database expectations: PostgreSQL primary store, Redis caches/sessions, TypeORM migrations manage schema, ClickHouse powers analytics when enabled.
- API authentication: Twenty’s APIs expect `Authorization: Bearer <API_KEY>`; do not send `x-api-key`.
- Preserve workspace data—only run `docker compose down -v` when a destructive reset is explicitly approved.

## Development Workflow
- Kick off each session by reviewing `README.md`, relevant `docs/features/*`, and `docs/DECISIONS.md`, then share a short plan before large edits.
- When brainstorming features, consult `DECISIONS.md` first; add or update ADRs whenever we settle on a new architectural direction.
- Before committing, run linting, type checking, and the tests that cover your change scope; verify database migrations are correct and GraphQL schema updates remain backward compatible.
- Use `docker compose` (space) everywhere, and explain flags whenever sharing commands (team norm).
- Treat submodules as upstream projects: avoid invasive edits directly inside `services/twenty-core`; propose changes via forks or configuration when possible.
- Retry failed npm/Docker commands once for transient issues; if they still fail, pause and ask a teammate to run the command rather than guessing at system-level fixes.
- Always confirm whether outstanding tasks from prior work sessions are still relevant before running scripts on autopilot.

## Testing Strategy
- **Unit tests:** Jest for both frontend and backend packages; add or update suites alongside new features.
- **Integration tests:** backend workflows such as staging queue, webhooks, and database interactions should run through Nx integration targets or dedicated scripts before merges.
- **Storybook:** use Storybook builds/tests to validate UI components in isolation and prevent regressions in Emotion/Lingui usage.
- **E2E tests:** Playwright scenarios cover manual entry → staging queue → commit and critical CRM navigation; extend them when new flows become business critical.

## Definition of Done (pre-MVP guardrails)
- Lint and type-check the packages you touched (e.g., `yarn nx lint <proj>`, `yarn nx typecheck <proj>` or `npm run lint` in fundraising-service).
- Run the smallest set of unit/integration/Storybook/Playwright tests that exercise your change; if something cannot yet pass, document why in the PR.
- Update docs/ADRs/environment samples when the change alters behavior, config, or dependencies (even a short note in `DECISIONS.md`).
- Call out any debt you knowingly leave behind (e.g., TODO with owner + follow-up) so the team can prioritize it openly.
- These guardrails describe the target; if the pre-MVP codebase blocks compliance, surface the gap rather than silently skipping the step.

## Debugging & Operational Notes
- Host-launched scripts (e.g., TypeORM migrations) need the service ports exposed (e.g., Postgres 5432) plus matching credentials in `.env`; ensure generated files land where Nx expects.
- Let Twenty run its own migrations—don’t pre-create the `core` schema in Postgres init scripts or migrations will be skipped, causing missing `core.workspace` errors.
- Shell-exported environment variables override `.env` when running Docker Compose; `unset` conflicting exports and check your shell startup files if values refuse to change.
- For API troubleshooting, remember the gateway uses a long-lived API key in the `Authorization` header.
- Git hygiene: if a submodule reports `.git/modules/.../index.lock` permission issues, run `sudo chown -R $(whoami):$(whoami) .git/modules/services/<submodule>` from the repo root before retrying `git add`.
- Avoid deleting the Twenty workspace unintentionally—prefer `docker compose down` without `-v` and confirm before wiping volumes.
- Known data issue: some seeded `commit_failed` staging rows appear in Twenty and via the fundraising-service API but not in the React queue. Gather IDs/filters/pagination details before attempting a fix.

## Important Files & References
- `README.md` – high-level stack overview and onboarding instructions.
- `docs/DECISIONS.md` – authoritative ADR log (consult before planning, update after decisions).
- `docs/features/*` – per-feature specs; mention changes here when tweaking scope.
- `docker-compose.yml` & `.env(.example)` files – source of truth for service wiring, ports, and credentials.
- `services/twenty-core/CLAUDE.md` – upstream coding expectations to mirror when advising on core app work.
- `services/fundraising-service/` docs/scripts – fundraising-specific environment variables, migrations, and npm workflows.

## Current Priorities & Follow-Ups
- **Lint debt:** `npm run lint` inside `services/fundraising-service` currently fails (appeal/company/people/opportunity modules, staging tests, GoCardless + Stripe webhooks). Clear these before the next major backend merge.
- **UI bugs awaiting cleanup:**
   1. `StagingQueue` missed a `useEffect` import, causing a runtime crash.
   2. The recurring health widget counts “unlinked” rows but never sets `hasRecurringMetadata`.
   3. `useGiftStagingList` does not refetch when statuses/intake filters change.
   Address these alongside the next UI cleanup so we stop regressing queue visibility.
- **Workflow improvements:** tighten the manual-entry duplicate guard with committed gift checks, finish GoCardless ingestion plus staging auto-promote policy, and add integration tests for manual entry → staging queue → commit.
- **Metadata rename backlog:** plan a migration to rename the legacy `promotionStatus` field on gift staging to `processingStatus` throughout Twenty metadata once it is safe.
