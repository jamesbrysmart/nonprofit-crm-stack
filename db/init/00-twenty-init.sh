#!/bin/bash
set -e
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<'EOSQL'
  CREATE SCHEMA IF NOT EXISTS core;
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
  CREATE EXTENSION IF NOT EXISTS "pgcrypto";
EOSQL
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<EOSQL
  ALTER DATABASE "$POSTGRES_DB" SET search_path = core, public;
EOSQL
