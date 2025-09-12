#!/bin/bash
set -e

# Idempotently create the fundraising database
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    SELECT 'CREATE DATABASE fundraising'
    WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'fundraising')\gexec
EOSQL

# Connect to the fundraising database and idempotently create the extension
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "fundraising" <<-EOSQL
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
EOSQL
