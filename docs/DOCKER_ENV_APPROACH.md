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
    *   `.env` now defines a canonical `DATABASE_URL=postgres://postgres:postgres@db:5432/postgres`; the worker services additionally pin `PG_DATABASE_URL` directly to that string to prevent host shell overrides from introducing `localhost` DSNs. After editing `.env`, recreate `server` and `worker` (`docker compose --profile fast up -d --force-recreate server worker`) so the new value is applied.
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

## 7. Upgrading Twenty CRM

This guide provides a safe and repeatable process for upgrading the Twenty CRM version for this project.

### Core Principles (Non-Negotiable)

1.  **Backup First**: Always create a full database backup before starting any upgrade.
2.  **Upgrade Sequentially**: You **must not** skip versions. Upgrade one minor version at a time (e.g., to go from `1.4.0` to `1.6.0`, you must upgrade `1.4.0` -> `1.5.x` -> `1.6.0`).
3.  **Preserve Data**: Never use the `-v` flag with `docker compose down` during an upgrade, as it will delete your database volume.

---

### Step-by-Step Upgrade Process

#### Step 1: Pre-Upgrade Checks & Backup

1.  **Commit Changes:** Ensure your current work is committed to Git so you have a clean state.
2.  **Check Running Services**: Make sure the `db` container is running before trying to back it up.
    ```bash
    docker compose --profile fast ps
    ```
3.  **Backup the Database:** Run the following command from the project root to create a timestamped backup of your PostgreSQL database. This command executes `pg_dumpall` inside the running `db` container.

    ```bash
    # This command dumps the entire database to a local .sql file
    docker compose exec -T db pg_dumpall -U ${PG_DATABASE_USER:-postgres} > "db-backup-$(date +%Y%m%d-%H%M%S).sql"
    ```

#### Step 2: Perform the Upgrade (Repeat for Each Version)

You will repeat these steps for each sequential version you need to apply (e.g., for `v1.5.0`, then for `v1.6.0`).

1.  **Update Version Tag:**
    *   Open the `.env` file in the project root.
    *   Update the `TAG` variable to the *next sequential version*. For example: `TAG=v1.5.0`.

2.  **Pull the New Image:**
    *   Download the new container image specified by the `TAG`.

    ```bash
    # This pulls the images for the services in the 'fast' profile
    docker compose --profile fast pull
    ```

3.  **Stop Services & Apply New Version:**
    *   Take the stack down. The new image will be used on the next startup.

    ```bash
    # This stops and removes containers without deleting the 'db-data' volume
    docker compose --profile fast down
    ```

4.  **Start and Monitor Migrations:**
    *   Start the core services. The `server` container will automatically run any necessary database migrations.
    *   Watch the logs to ensure the migrations complete successfully.

    ```bash
    # Start the core services in detached mode
    docker compose --profile fast up -d server worker db redis

    # Follow the server logs to monitor the upgrade
    docker compose logs -f server
    ```
    *   Look for messages indicating database migration or upgrade success. Once the logs are stable and the `server` is healthy, press `Ctrl+C` to stop watching.

#### Step 3: Finalize and Verify

1.  **Start All Services:**
    *   Once the final version is upgraded and stable, bring the entire stack online.

    ```bash
    # This starts all services defined in the compose file with the 'fast' profile
    docker compose --profile fast up -d
    ```

2.  **Verify Health:**
    *   Check that all services are running and healthy.

    ```bash
    docker compose ps
    ```

3.  **Run Smoke Test:**
    *   Execute the project's smoke test to ensure the `fundraising-service` can still communicate with Twenty.

    ```bash
    cd services/fundraising-service
    npm run smoke:gifts
    cd ../..
    ```

4.  **Manual Check:**
    *   Log in to the Twenty UI. Check the settings or about page to confirm the new version number and verify that your data is intact.

### Troubleshooting

*   **Permissions Errors After Upgrade:** If you see authorization or permission errors in the UI, you may need to flush the application cache.
    ```bash
    # This executes the cache flush command inside the server container
    docker compose exec server yarn command:prod cache:flush
    ```
*   **Restoring from Backup:** If the upgrade fails catastrophically, you can restore your database. First, reset your environment (`docker compose down -v`), bring the `db` service up (`docker compose up -d db`), and then run:
    ```bash
    # This command restores the database from your backup file
    cat <your-backup-file.sql> | docker compose exec -T db psql -U ${PG_DATABASE_USER:-postgres}
    ```

## 8. Recommended Startup/Shutdown Procedure

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
    Wait for the command to finish (the shell prompt returns) before running follow-up commands such as `docker compose ps` or log checks; issuing new Docker commands while Compose is still starting/stopping services can produce misleading results.

## 9. Known Issues & Caveats

*   **Noisy `localhost|postgres` Connection Attempt:**
    *   **Description:** Despite all environment variable pinning, the `twenty-server` application still logs `Created new shared pg Pool for key "localhost|5432|postgres||no-ssl"` and subsequent `relation "core.workspace" does not exist` errors on startup.
    *   **Impact:** This error is non-fatal; the database tables are eventually created, and the application functions correctly. However, it creates noise in the logs and can be confusing.
    *   **Resolution:** This appears to be an internal application behavior within the `twenty-core` codebase that cannot be overridden by Docker Compose environment variables. It should be reported upstream to the `twentyhq/twenty` project for a proper fix.

*   **Fundraising Service Healthcheck:**
    *   **Status (2025-02):** The custom Node-based healthcheck in `docker-compose.yml` now passes; `docker compose ps fundraising-service` reports `healthy` and `curl http://localhost:4500/health` returns `{"status":"ok"}`.
    *   **Action:** Update any remaining Compose dependencies to rely on `condition: service_healthy` where helpful; no follow-up debugging required unless future regressions appear.
