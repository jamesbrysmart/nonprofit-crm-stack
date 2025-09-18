# Bug: Twenty CRM `server` container logs "relation does not exist" on startup despite successful migrations

## Problem Description

The `twentycrm/twenty` image (specifically `v1.4.0` and potentially earlier versions) logs `relation "core.keyValuePair" does not exist` and `relation "core.workspace" does not exist` errors during startup, even when connected to a freshly initialized PostgreSQL database where migrations eventually succeed. This issue appears to stem from an internal code path attempting to connect to `localhost:5432/postgres` despite explicit environment variable configuration pointing to a different host and database.

## Steps to Reproduce

1.  **Prerequisites:**
    *   Docker and Docker Compose (v2.x) installed.
    *   A `.env` file in the project root with at least `PG_DATABASE_NAME=postgres`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` defined.
    *   The `twenty-core` and `fundraising-service` submodules initialized.
    *   The `db/init/00-twenty-init.sh` and `db/init/01-init-fundraising-db.sh` scripts in place (as detailed in `docs/DOCKER_ENV_APPROACH.md`).

2.  **Ensure Clean State:**
    ```bash
    docker compose --profile fast down -v
    ```
    (Wait for this command to fully complete.)

3.  **Start the Stack:**
    ```bash
    docker compose --profile fast up -d --build
    ```

4.  **Observe Logs:**
    ```bash
    docker compose --profile fast logs server
    ```

## Expected Behavior

The `server` container should start without logging any `relation "core.*" does not exist` errors or `query failed` messages related to missing relations. The `PgPoolSharedService` should only log connections to the configured `db` host and `postgres` database.

## Actual Behavior

The `server` container logs the following errors during startup:

```log
server-1  | [Nest] ... LOG [PgPoolSharedService] Created new shared pg Pool for key "localhost|5432|postgres||no-ssl"
server-1  | query failed: SELECT "KeyValuePair". ... relation "core.keyValuePair" does not exist
server-1  | error: error: relation "core.keyValuePair" does not exist
server-1  | [Nest] ... ERROR [UpgradeCommand] Command failed
server-1  | [Nest] ... LOG [UpgradeCommand] Command completed!
server-1  | Successfully migrated DB!
```

Despite these errors, the database tables (`core.keyValuePair`, `core.workspace`) are eventually created, and the application appears to function.

## Relevant Environment Details

*   **`docker-compose.yml` (relevant snippets for `server` service):**
    ```yaml
      server:
        image: twentycrm/twenty:${TAG:-v1.4.0}
        profiles: ["fast"]
        environment:
          NODE_PORT: 3000
          PG_DATABASE_URL: postgres://${PG_DATABASE_USER:-postgres}:${PG_DATABASE_PASSWORD:-postgres}@db:5432/${PG_DATABASE_NAME:-postgres}
          REDIS_URL: ${REDIS_URL:-redis://redis:6379}
          DATABASE_URL: postgres://${PG_DATABASE_USER:-postgres}:${PG_DATABASE_PASSWORD:-postgres}@db:5432/${PG_DATABASE_NAME:-postgres}
          PGHOST: db
          PGPORT: "5432"
          PGDATABASE: ${PG_DATABASE_NAME:-postgres}
          PGUSER: ${PG_DATABASE_USER:-postgres}
          PGPASSWORD: ${PG_DATABASE_PASSWORD:-postgres}
          PGSSLMODE: disable
          IS_CONFIG_VARIABLES_IN_DB_ENABLED: "false"
          DISABLE_DB_MIGRATIONS: "false"
          ADMIN_EMAIL: ${ADMIN_EMAIL}
          ADMIN_PASSWORD: ${ADMIN_PASSWORD}
          SERVER_URL: ${SERVER_URL}
          DISABLE_CRON_JOBS_REGISTRATION: ${DISABLE_CRON_JOBS_REGISTRATION}
          STORAGE_TYPE: ${STORAGE_TYPE}
          STORAGE_S3_REGION: ${STORAGE_S3_REGION}
          STORAGE_S3_NAME: ${STORAGE_S3_NAME}
          STORAGE_S3_ENDPOINT: ${STORAGE_S3_ENDPOINT}
          APP_SECRET: ${APP_SECRET:-replace_me_with_a_random_string}
    ```
*   **`.env` (relevant snippet):**
    ```
    TAG=v1.4.0
    PG_DATABASE_NAME=postgres
    ADMIN_EMAIL=your_admin_email@example.com
    ADMIN_PASSWORD=your_admin_password
    ```

## Proposed Cause / Impact

It appears that a specific code path within the `twenty-server` application, possibly related to early configuration loading or a specific module initialization, attempts to establish a PostgreSQL connection using hardcoded `localhost` and `postgres` database defaults, even when explicit environment variables are provided. This connection fails because no PostgreSQL server is running on `localhost` within the container, leading to the "relation does not exist" errors. While the main migration process eventually succeeds, these errors create unnecessary noise and confusion in the logs.

## Recommendation

This issue should be investigated and addressed upstream in the `twentyhq/twenty` project to ensure consistent database connection behavior across all code paths and to eliminate misleading error logs during startup.
## Related Issues / Known Caveats

### Fundraising Service Healthcheck

The `fundraising-service` reports successful startup in its logs, but its configured healthcheck (`test: ["CMD", "curl", "-f", "http://localhost:4500/health"]`) currently fails. This prevents services that `depends_on` `fundraising-service` with `condition: service_healthy` from starting.

As a workaround, the `gateway` service's dependency on `fundraising-service` has been changed to `condition: service_started` in `docker-compose.yml`.

Further investigation is needed to determine why the healthcheck fails. This could involve debugging the `/health` endpoint in the `fundraising-service` or adjusting the healthcheck parameters. This is a separate issue from the primary `localhost|postgres` connection problem.
---

# POC: Expose fundraising Gifts API via gateway

## Goal

Demonstrate the managed-extension approach by shipping a thin vertical slice where the fundraising-service owns Gift data and is reachable through the existing gateway, while keeping Twenty as the UX/home for users once metadata automation is available.

## User Story

As a fundraiser, I want to create and list Gifts through the unified CRM gateway so that fundraising functionality feels like part of Twenty even though the logic runs in the fundraising-service.

## Acceptance Criteria

- `fundraising-service` exposes REST endpoints (e.g., `POST /gifts`, `GET /gifts`, `GET /gifts/:id`) mounted at `/api/fundraising/gifts` via the nginx gateway.
- Gifts persist in the fundraising Postgres database using the existing TypeORM entity.
- The service validates `contactId` (and, if available, `campaignId`) against Twenty using the Data API or a stubbed adapter so we respect D-0001 boundaries.
- Automated or manual smoke test proves a request flowing from gateway → fundraising-service → fundraising DB.
- Technical notes capture how this will map to Twenty custom objects once the metadata API blocker is removed.

### Progress (2025-09-18)

- Added `GiftModule` in fundraising-service with `POST /gifts` and `GET /gifts` endpoints; nginx gateway now proxies `/api/fundraising/gifts`.
- Gift entity persists to the fundraising Postgres DB (`gift` table) with currency amount + timestamps; manual smoke test via `curl` confirmed inserts are readable through the gateway and the database reflects the rows.
- Twenty REST `POST /rest/gifts` validated separately—next step is wiring that call after local persistence so the CRM stays in sync.

## Notes / Follow-ups

- Do not modify `twenty-core`; keep the logic inside `fundraising-service`.
- Track progress on the metadata API blocker separately; once lifted we can mirror Gifts back into Twenty UI per D-0002.
- Revisit authentication once gateway session propagation work (D-0004) begins; short-term API key is acceptable.
