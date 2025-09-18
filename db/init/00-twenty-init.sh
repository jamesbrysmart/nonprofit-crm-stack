#!/usr/bin/env bash
set -euo pipefail

# Create extensions in the actual primary DB so migrations can use them
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<'SQL'
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
SQL

# Ensure the search_path is core-first for that DB
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<SQL
ALTER DATABASE "$POSTGRES_DB" SET search_path = core, public;
SQL
