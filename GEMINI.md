## Gemini Added Memories
- This project orchestrates the 'twenty' CRM, PostgreSQL, Redis, 'fundraising-service', and Nginx gateway using Docker Compose.
- It is the central orchestration point for the AI-first non-profit CRM solution, which also involves the 'twenty-core' and 'fundraising-service' projects.
- When discussing how to build new features, always consult the DECISIONS.md file first to ensure the proposed approach aligns with established architectural principles.
- For this project, I should constantly consider whether the current approach is the best one and challenge it or suggest alternatives if I believe it can be done better, especially for foundational architectural decisions.
- When providing Docker commands, include a one-line explanation (e.g., what `-d`, `-f`, or `--force-recreate` do) so the team doesn’t have to look them up repeatedly.
- Architectural decisions should be recorded in `DECISIONS.md` as an ADR. This includes new decisions and updating existing ones if they are reconsidered.
- **Debugging Learning:** When host-based scripts (e.g., TypeORM migrations) connect to Docker services, ensure: 1. The service's port (e.g., 5432 for Postgres) is mapped to the host in `docker-compose.yml`. 2. The script's connection credentials (from `.env`) match the service's credentials in `docker-compose.yml`. 3. File generation paths in scripts (like `migration:generate`) match the paths where the tools expect to find them.
- **Debugging Learning:** Let Twenty's migrations create the `core` schema. The Postgres init script should only provision required extensions (e.g., `uuid-ossp`, `pgcrypto`) and can set the search_path once the schema exists; if the schema is pre-created, the app skips migrations and fails with missing `core.workspace`.
- **Debugging Learning: Environment Variable Overrides**
  - **Problem:** An environment variable in a Docker Compose service was consistently incorrect, leading to `401` errors, despite the `.env` file being correct.
  - **Cause:** A shell environment variable (`export VAR=...`) in the user's terminal session was overriding the value in the `.env` file. Docker Compose prioritizes shell environment variables over those in `.env` files.
  - **Solution:** Identify and `unset` the variable in the problematic shell session and check shell startup files (`.bashrc`, `.zshrc`) for persistent `export` statements.
- **Authentication:** Twenty's APIs are authenticated using a long-lived API key, which must be sent as a bearer token in the `Authorization` header (e.g., `Authorization: Bearer <API_KEY>`). The `x-api-key` header is incorrect.
- **Project Structure:** This project uses Git submodules to manage the `fundraising-service` and `twenty-core` repositories. These submodules live in `services/`; keep compose and docs aligned with that layout (see `docs/DECISIONS.md` D-0014).
- **Git Hygiene:** If a submodule errors with `Unable to create .../index.lock` or permission issues, run `sudo chown -R $(whoami):$(whoami) .git/modules/services/<submodule>` from the repo root before retrying `git add`.
- **Command Failures:** If npm/docker commands fail, retry once for transient issues; otherwise pause and ask the team to run the command manually instead of applying unfamiliar workarounds.
- **Submodule Code Constraint:** Avoid modifying third-party submodules like `twenty-core`; propose non-invasive solutions or route changes through the fork instead.
- At the start of a new session, read README.md, the relevant `docs/features/` specs, and `docs/DECISIONS.md`, and share your plan before making material changes.
- Use `docker compose` (with a space), not `docker-compose` (with a hyphen), as this project uses Docker Compose V2.
- **API Usage:** Never rely on assumptions for Twenty’s Data/Metadata APIs—always consult the live OpenAPI schemas or.
- **Data Persistence:** Avoid deleting the Twenty workspace. Be mindful of Docker commands like `docker compose down -v` that destroy data. When tearing down the environment, prefer `docker compose down` and only use the `-v` flag if explicitly confirmed that a database reset is intended.
- **Task Management:** If I see an outstanding task in my memory, I will ask if it's completed and for permission to update it to completed rather than running it blindly.
- **Known Issue:** Some staging rows (e.g., seeded `commit_failed` data) appear in Twenty and via the fundraising-service API but not in the React queue. Root cause still unknown; gather more telemetry (IDs/filters/pagination) before fixing.
- Reminder: Twenty metadata still uses the legacy `promotionStatus` field on gift staging; plan a migration to rename it to `processingStatus` and update all references once safe.

### TEMP NOTES – 2025-10-23 (remove after next session)
- Known UI bugs to fix next time: (1) `StagingQueue` misses the `useEffect` import and crashes at runtime; (2) recurring health widget counts “unlinked” rows but the component never sets `hasRecurringMetadata`; (3) `useGiftStagingList` should refetch when statuses/intake filters change. Leave code as-is for now; tackle alongside the next UI cleanup.
- Follow-up implementation focus: tighten manual-entry duplicate guard with committed gift checks, finish GoCardless ingestion + staging auto-promote policy, and add integration tests covering manual entry → staging queue → commit.
- Outstanding lint debt (run `npm run lint` in `services/fundraising-service`): existing violations in appeal/company/people/opportunity services, gift staging tests, GoCardless webhook, stripe webhook, and others currently block a clean pass. Revisit before the next sizable backend merge.
