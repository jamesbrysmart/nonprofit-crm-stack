# Docker and Environment Approach for Twenty CRM Stack

This document outlines the current approach to Docker, build processes, and environment configuration for the `dev-stack` project, which orchestrates the Twenty CRM solution. It captures key decisions, implemented solutions, and known issues to serve as a reference for development and troubleshooting.

## 1. Project Structure and Submodules

The `dev-stack` repository acts as a "superproject" managing its constituent services (`fundraising-service`, `twenty-core`) as Git submodules within the `services/` directory. This structure allows for version pinning and independent development of each service.

## 2. Build Optimizations

To address resource-intensive builds and improve development efficiency:

*   **Twenty CRM (`twenty-core`):**
    *   `docker-compose.yml` uses build profiles (`fast` and `source`).
    *   By default, the `fast` profile is used, pulling pre-built `twentycrm/twenty` images (e.g., `v1.4.0`) to avoid resource-heavy source builds.
    *   The `source` profile is available for explicit source builds when needed.
*   **Fundraising Service (`fundraising-service`):**
    *   A `.dockerignore` file was created to reduce build context size.
    *   The `Dockerfile` uses a multi-stage build process for efficiency and smaller image size.

## 3. Database Initialization Strategy

The PostgreSQL database (`db` service) requires specific initialization for both the Twenty CRM and the fundraising service.

*   **Centralized Database Name:**
    *   The `PG_DATABASE_NAME` environment variable in `.env` is set to `postgres`. This aligns the entire stack to use the `postgres` database, which some internal Twenty CRM code paths default to.
*   **Database Initialization Scripts (mounted into `/docker-entrypoint-initdb.d`):**
    *   `db/init/00-twenty-init.sh`: This script is executed first. It connects to the `$POSTGRES_DB` (which is now `postgres`), ensures required extensions (`uuid-ossp`, `pgcrypto`) exist, and sets the database `search_path` to prefer the `core` schema once migrations create it. Schema creation itself is left to the Twenty application migrations.
        ```bash
        #!/bin/bash
        set -e
        psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<'EOSQL'
          CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
          CREATE EXTENSION IF NOT EXISTS "pgcrypto";
        EOSQL
        ```
    *   `db/init/01-init-fundraising-db.sh`: This script runs after `00-twenty-init.sh`. It connects to the `$POSTGRES_DB` (now `postgres`) and creates the `fundraising` database.
        ```bash
        #!/bin/bash
        set -e
        psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
            SELECT 'CREATE DATABASE fundraising'
            WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'fundraising')\gexec
        EOSQL
        ```

## 4. Environment Variable Management

Consistent and explicit environment variable configuration is crucial for inter-service communication and application behavior.

*   **Standardized DB Connection Variables:** For `server`, `server-src`, `worker`, and `worker-src` services in `docker-compose.yml`, the following variables are explicitly set to ensure all code paths connect to `db:5432/postgres`:
    *   `PG_DATABASE_URL`
    *   `DATABASE_URL`
    *   `PGHOST: db`
    *   `PGPORT: "5432"`
    *   `PGDATABASE: ${PG_DATABASE_NAME:-postgres}`
    *   `PGUSER: ${PG_DATABASE_USER:-postgres}`
    *   `PGPASSWORD: ${PG_DATABASE_PASSWORD:-postgres}`
    *   `PGSSLMODE: disable`
*   **Configuration Mode:**
    *   `IS_CONFIG_VARIABLES_IN_DB_ENABLED: "false"` is set for `server`, `server-src`, `worker`, and `worker-src`. This forces the application to read configuration from environment variables only, preventing premature database reads before migrations complete.
*   **Migration Control:**
    *   `DISABLE_DB_MIGRATIONS: "false"` for `server` and `server-src` (ensures migrations run).
    *   `DISABLE_DB_MIGRATIONS: "true"` for `worker` and `worker-src` (prevents workers from running migrations).
*   **Admin Credentials:** `ADMIN_EMAIL` and `ADMIN_PASSWORD` are passed from `.env` for first-boot setup.

## 5. Service Dependency Management

`depends_on` conditions are used in `docker-compose.yml` to ensure services start in the correct order and only when their dependencies are ready.

*   **`db-wait` service:** Ensures `db` and `redis` are ready before other services start.
*   **`gateway` service:**
    *   `depends_on` `server` with `condition: service_healthy`.
    *   `depends_on` `fundraising-service` with `condition: service_started` (to avoid issues with its healthcheck).

## 6. Image Tagging Policy

*   The `twentycrm/twenty` image tag is explicitly pinned to `v1.4.0` in the `.env` file (`TAG=v1.4.0`) instead of `latest` for reproducible builds and to prevent unexpected behavior changes.

## 7. Recommended Startup/Shutdown Procedure

For a clean and reliable start of the stack:

1.  **Ensure Clean State:**
    ```bash
    docker compose --profile fast down -v
    ```
    (Wait for this command to fully complete before proceeding.)
2.  **Start the Stack:**
    ```bash
    docker compose --profile fast up -d --build
    ```

## 8. Known Issues & Caveats

*   **Noisy `localhost|postgres` Connection Attempt:**
    *   **Description:** Despite all environment variable pinning, the `twenty-server` application still logs `Created new shared pg Pool for key "localhost|5432|postgres||no-ssl"` and subsequent `relation "core.workspace" does not exist` errors on startup.
    *   **Impact:** This error is non-fatal; the database tables are eventually created, and the application functions correctly. However, it creates noise in the logs and can be confusing.
    *   **Resolution:** This appears to be an internal application behavior within the `twenty-core` codebase that cannot be overridden by Docker Compose environment variables. It should be reported upstream to the `twentyhq/twenty` project for a proper fix.

*   **Fundraising Service Healthcheck:**
    *   **Description:** The default healthcheck for the `fundraising-service` (`test: ["CMD", "curl", "-f", "http://localhost:4500/health"]`) currently fails, even though the application itself reports successful startup.
    *   **Impact:** This prevents services that `depends_on` `fundraising-service` with `condition: service_healthy` from starting.
    *   **Current Workaround:** The `gateway` service's dependency on `fundraising-service` has been changed to `condition: service_started` to allow the stack to start.
    *   **Resolution:** Further investigation is needed to determine why the healthcheck fails. This could involve debugging the `/health` endpoint in the `fundraising-service` or adjusting the healthcheck parameters. This is a follow-up task.
