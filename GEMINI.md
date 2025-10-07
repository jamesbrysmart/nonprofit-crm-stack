## Gemini Added Memories
- This project orchestrates the 'twenty' CRM, PostgreSQL, Redis, 'fundraising-service', and Nginx gateway using Docker Compose.
- It is the central orchestration point for the AI-first non-profit CRM solution, which also involves the 'twenty-core' and 'fundraising-service' projects.
- When discussing how to build or extend features, review the relevant specs under `docs/features/` first, then check `DECISIONS.md` to confirm the approach still aligns with recorded architectural principles.
- For this project, I should constantly consider whether the current approach is the best one and challenge it or suggest alternatives if I believe it can be done better, especially for foundational architectural decisions.
- When providing Docker commands, include a one-line explanation (e.g., what `-d`, `-f`, or `--force-recreate` do) so the team doesn’t have to look them up repeatedly.
- Architectural decisions should be recorded in `DECISIONS.md` as an ADR. This includes new decisions and updating existing ones if they are reconsidered.
- **Debugging Learnings:** When host-based scripts (e.g., TypeORM migrations) connect to Docker services, ensure: 1. The service's port (e.g., 5432 for Postgres) is mapped to the host in `docker-compose.yml`. 2. The script's connection credentials (from `.env`) match the service's credentials in `docker-compose.yml`. 3. File generation paths in scripts (like `migration:generate`) match the paths where the tools expect to find them.
- **Debugging Learnings (2025-09-18):** Let Twenty's migrations create the `core` schema. The Postgres init script should only provision required extensions (e.g., `uuid-ossp`, `pgcrypto`) and can set the search_path once the schema exists; if the schema is pre-created, the app skips migrations and fails with missing `core.workspace`.
- **Authentication:** Twenty's APIs are authenticated using a long-lived API key, which must be sent as a bearer token in the `Authorization` header (e.g., `Authorization: Bearer <API_KEY>`). The `x-api-key` header is incorrect.
- **POC Status:** Metadata API still blocked. Fundraising-service now treats Twenty as the source of truth—`POST/GET /gifts` proxy directly to Twenty's REST API using `TWENTY_API_KEY` / `TWENTY_API_BASE_URL`; no local gift table.
- **TODO:** Track Metadata API status and document manual object/field setup until automation is available.
- **Project Structure:** This project uses Git submodules to manage the `fundraising-service` and `twenty-core` repositories. These submodules are located in the `services/` directory. Always ensure that the `docker-compose.yml` file and other configurations align with this structure. Refer to `DECISIONS.md` (D-0014) for more details.
- **Git Hygiene:** When submodule staging fails with `Unable to create .../index.lock` or `insufficient permission for adding an object`, reown the submodule Git data from the superproject root: `sudo chown -R jamesbryant:jamesbryant .git/modules/services/fundraising-service` (or the relevant submodule path) before retrying `git add`.
- **Command Failures:** If npm/docker commands fail in this environment, retry once for transient issues; otherwise pause and ask James to run the command manually instead of applying nonstandard workarounds.
- **Submodule Code Constraint:** Do not modify code within third-party Git submodules like `twenty-core`, as these changes can be overwritten or cause conflicts during updates. Propose non-invasive solutions or workarounds instead.
- At the start of a new session, read the contents of README.md, the relevant `docs/features/` specs, and DECISIONS.md to establish context.
- Before making material code changes, share the intent (summary/plan) and wait for explicit confirmation; detailed docs are guidance, not a green light to proceed without stakeholder sign-off.
- Use `docker compose` (with a space), not `docker-compose` (with a hyphen), as this project uses Docker Compose V2.
- Default to the `--profile fast` flag when running docker compose commands so we reuse prebuilt Twenty images unless we deliberately opt into the source profile.
- **Debugging Session (2025-09-12): Docker Compose Startup Issues for Twenty CRM Stack**
  - **Problem:** Multi-service Docker Compose stack (Twenty CRM, fundraising-service) failed to start reliably due to:
    1.  Race conditions (services starting before DB/Redis ready).
    2.  Missing `fundraising` database.
    3.  Resource-intensive `twenty-core` builds.
    4.  `twenty-server` failing to run migrations on fresh DB due to `localhost|postgres` connection attempt.
    5.  `fundraising-service` healthcheck failing.
    6.  Docker daemon race conditions during `down`/`up` commands.
  - **Diagnosis:**
    - Initial DB volume persistence caused init scripts to be skipped.
    - `twenty-server` had hardcoded/defaulted connection to `localhost:5432/postgres` in some code paths, ignoring `PGHOST`/`PGDATABASE` env vars.
    - `fundraising-service` healthcheck was too strict or endpoint not ready immediately.
    - Docker daemon sometimes had issues with rapid `down`/`up` sequences.
  - **Solution:**
    1.  Optimized builds (`.dockerignore`, multi-stage Dockerfiles, `fast` profile).
    2.  Robust DB initialization: `db/init/00-twenty-init.sh` (DB-agnostic schema/extensions for `postgres` DB) and `db/init/01-init-fundraising-db.sh` (creates `fundraising` DB).
    3.  Standardized DB env vars in `docker-compose.yml` for `server`/`worker` services, including `IS_CONFIG_VARIABLES_IN_DB_ENABLED: "false"`, `PGSSLMODE: disable`, `ADMIN_EMAIL`/`ADMIN_PASSWORD`.
    4.  Adjusted `gateway` `depends_on` for `fundraising-service` to `condition: service_started`.
    5.  Pinned `twentycrm/twenty` image to `v1.4.0`.
    6.  Established reliable startup procedure: `docker compose --profile fast down -v` (wait for completion) then `docker compose --profile fast up -d --build`.
  - **Remaining Issue:** `twenty-server` still logs `Created new shared pg Pool for key "localhost|5432|postgres||no-ssl"` and `relation "core.workspace" does not exist` errors on startup. This is non-fatal (tables are created), but noisy. Requires upstream fix.
- **Task Management:** If I see an outstanding task in my memory, I will ask if it's completed and for permission to update it to completed rather than running it blindly.
- **Docker Compose Profiles:** This project uses Docker Compose profiles to manage which services are started. The `fast` profile is used for development, which pulls pre-built images. Always use the `--profile fast` flag when running `docker compose` commands. Before making any changes to the `docker-compose.yml` file, always consult the `DOCKER_ENV_APPROACH.md` file.
- **Metadata API Blocker:** Programmatic creation of custom objects via the metadata API is currently blocked. The API returns an "Unknown argument 'input'" error when attempting to create an object with `curl`. This is a known issue, and the recommended approach is to wait for the "import and export twenty configurations" feature, which is expected by the end of Q3.
- **API Usage:** Never rely on assumptions for Twenty’s Data/Metadata APIs—always consult the live OpenAPI schemas or documented call examples (see `docs/TWENTY_METADATA_API.md` and linked schemas) before wiring requests. Codex lacks HTTP access, so when schema details are needed, explicitly ask James/Gemini CLI to fetch the relevant OpenAPI snippet before implementing changes.
- Today’s Progress (18/9/25):
  - Fundraising-service now forwards each successful POST /gifts to Twenty’s REST API using TWENTY_API_KEY /
  TWENTY_API_BASE_URL, logging failures without breaking the local save. Environment wiring (docker-
  compose.yml, .env.example) exposes those variables so the mirror works locally.
  - Manual smoke test: gateway → fundraising-service → fundraising DB → Twenty REST call (verified locally and via
  logs). Table recreation was done by hand; auto-migration wiring is captured as a follow-up in GEMINI.md and the issue
  doc.
  - Repo hygiene: Added mirror notes to docs/TWENTY_GIFTS_API.md, updated GEMINI.md memory and the GitHub issue progress
  section. No new commits today; current changes remain staged in working tree for next session.

  Next Session Ideas

  1. Finish TypeORM migration wiring so the gift table is created automatically.
  2. Improve mirror reliability (retry/backoff, richer payload) once migrations are solid.
- Today’s Progress (24/9/25):
  - Added request/response validation and 3-attempt retry/backoff to the fundraising-service proxy; docs now call out the smoke script (`npm run smoke:gifts`) and validation guardrails.
  - Smoke test script exercises full CRUD and leaves a “Persistent Smoke Test Gift” in Twenty for UI verification; failures now print the upstream payload for debugging.
  - Standardised `DATABASE_URL` handling: `.env` documents the canonical DSN and worker containers pin `PG_DATABASE_URL` to `postgres://postgres:postgres@db:5432/postgres`; worker health outage resolved by recreating `server`/`worker` after the change.
  - Next session ideas: add structured logging/alerting for retry flows; monitor the persistent smoke gift in Twenty to confirm API/UI parity over time.
- **Data Persistence:** Avoid deleting the Twenty workspace. Be mindful of Docker commands like `docker compose down -v` that destroy data. When tearing down the environment, prefer `docker compose down` and only use the `-v` flag if explicitly confirmed that a database reset is intended.
- **Debugging Learnings (2025-09-24): Environment Variable Overrides**
  - **Problem:** The `TWENTY_API_KEY` environment variable within a Docker Compose service (e.g., `fundraising-service`) was consistently incorrect, leading to `401 Workspace not found` errors, despite the `.env` file containing the correct key.
  - **Symptom:** `docker compose config` showed the incorrect key, and `docker compose exec <service> printenv TWENTY_API_KEY` also showed the incorrect key.
  - **Cause:** A shell environment variable (`export TWENTY_API_KEY=...`) in the user's terminal session was overriding the value in the `.env` file. Docker Compose prioritizes shell environment variables over those in `.env` files. The variable was a "ghost" key, different from both the current and previous `.env` values.
  - **Diagnostic Steps:**
    1.  Verify `.env` file content (correct).
    2.  Search project for old key (not found).
    3.  Run `docker compose config` to see resolved environment (showed incorrect key).
    4.  Run `echo $TWENTY_API_KEY` in the shell (showed blank or incorrect key, depending on shell context).
    5.  Crucially, starting a *new terminal session* and running `docker compose config` showed the *correct* key, proving the issue was session-specific.
  - **Solution:**
    1.  Identify and `unset TWENTY_API_KEY` in the problematic shell session.
    2.  Check shell startup files (`.bashrc`, `.zshrc`, `.profile`) for persistent `export` statements and remove them if found.
    3.  Restart Docker Compose services to pick up the corrected environment.
