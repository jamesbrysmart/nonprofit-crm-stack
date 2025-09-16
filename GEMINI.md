## Gemini Added Memories
- This project orchestrates the 'twenty' CRM, PostgreSQL, Redis, 'fundraising-service', and Nginx gateway using Docker Compose.
- It is the central orchestration point for the AI-first non-profit CRM solution, which also involves the 'twenty-core' and 'fundraising-service' projects.
- When discussing how to build new features, always consult the DECISIONS.md file first to ensure the proposed approach aligns with established architectural principles.
- For this project, I should constantly consider whether the current approach is the best one and challenge it or suggest alternatives if I believe it can be done better, especially for foundational architectural decisions.
- Architectural decisions should be recorded in `DECISIONS.md` as an ADR. This includes new decisions and updating existing ones if they are reconsidered.
- **Debugging Learnings:** When host-based scripts (e.g., TypeORM migrations) connect to Docker services, ensure: 1. The service's port (e.g., 5432 for Postgres) is mapped to the host in `docker-compose.yml`. 2. The script's connection credentials (from `.env`) match the service's credentials in `docker-compose.yml`. 3. File generation paths in scripts (like `migration:generate`) match the paths where the tools expect to find them.
- **Authentication:** Twenty's APIs are authenticated using a long-lived API key, which must be sent as a bearer token in the `Authorization` header (e.g., `Authorization: Bearer <API_KEY>`). The `x-api-key` header is incorrect.
- **POC Status:** The POC task 'Create API endpoints for Gifts' (Issue #1 in `nonprofit-crm-fundraising-service`) is currently blocked. Refer to the issue for details on the blocker and the plan to revisit after Q3's 'import/export configurations' feature.
- **Project Structure:** This project uses Git submodules to manage the `fundraising-service` and `twenty-core` repositories. These submodules are located in the `services/` directory. Always ensure that the `docker-compose.yml` file and other configurations align with this structure. Refer to `DECISIONS.md` (D-0014) for more details.
- **Submodule Code Constraint:** Do not modify code within third-party Git submodules like `twenty-core`, as these changes can be overwritten or cause conflicts during updates. Propose non-invasive solutions or workarounds instead.
- At the start of a new session, read the contents of README.md and DECISIONS.md to establish context.
- Use `docker compose` (with a space), not `docker-compose` (with a hyphen), as this project uses Docker Compose V2.
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
- **Follow-up Task: Investigate Fundraising Service Healthcheck**
  - The `fundraising-service` healthcheck (`test: ["CMD", "curl", "-f", "http://localhost:4500/health"]`) currently fails, even though the application itself starts successfully.
  - This issue is currently worked around by setting `gateway`'s dependency to `condition: service_started`.
  - Further investigation is needed to debug the healthcheck or its endpoint.
- **Docker Compose Profiles:** This project uses Docker Compose profiles to manage which services are started. The `fast` profile is used for development, which pulls pre-built images. Always use the `--profile fast` flag when running `docker compose` commands. Before making any changes to the `docker-compose.yml` file, always consult the `DOCKER_ENV_APPROACH.md` file.