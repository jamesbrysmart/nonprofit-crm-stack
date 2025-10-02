# Evidence Dashboard POC Runbook

_Updated: 2025-10-02_

This guide explains how to work with the Evidence.dev prototype and the analytics snapshot it depends on.

## 1. Refresh the analytics snapshot

```bash
cat scripts/analytics/load_gifts_snapshot.sql \
  | docker compose --profile fast exec -T db \
    psql -U postgres -d postgres
```

The script creates (or refreshes) `analytics.gifts_snapshot` with gift data sourced from Twenty's workspace schema. Rerun whenever fresh data is needed for the dashboards.

## 2. Run the Evidence service via Compose

```bash
# start Evidence on port 5600 alongside the stack (uses evidencedev/devenv:latest)
docker compose --profile dashboards up evidence
```

Environment variables (defaults set in `evidence.config.cjs` and docker-compose):

- `EVIDENCE_DB_HOST` (defaults to `db`)
- `EVIDENCE_DB_PORT` (defaults to `5432`)
- `EVIDENCE_DB_NAME` (defaults to `postgres`)
- `EVIDENCE_DB_SCHEMA` (defaults to `analytics`)
- `EVIDENCE_DB_USER` (defaults to `postgres`)
- `EVIDENCE_DB_PASSWORD`

> Known issue (2025-10-02): the devenv entrypoint currently fails to register the `analytics` datasource because `npx evidence sources` inside the container attempts `127.0.0.1:5432`. After the service starts, rerun the command manually from the container shell once networking is confirmed:

```bash
docker compose --profile fast --profile dashboards exec evidence \
  bash -lc "cd /evidence-workspace && npx evidence sources"
```

If you prefer to run Evidence locally instead of inside Docker, ensure your system has build tooling (`python3`, `make`, `g++`) available before executing `npm install` in `dashboards/evidence`. Running `npx evidence sources` locally also requires the `evidence.plugins.yaml` file (already included).

## 3. Access the dashboard

Once the container is running, open `http://localhost:5600`. The default page (`src/pages/index.md`) plots total gift amount per month and shows the underlying table.

## 4. Shutdown / cleanup

```bash
docker compose --profile dashboards down evidence
```

## Notes & TODOs

- Current setup pulls data from Twenty's Postgres schema. For production, revisit the data-source decision and document API-based ingestion if needed.
- Authentication is basic (no Evidence user management). Long-term, integrate with the CRM gateway.
- Multiple workspace support is out of scope; the snapshot currently reads a single workspace schema.
- Datasource registration bug: rerun `npx evidence sources` from within the container (see above). Investigate why the CLI defaults to `127.0.0.1` despite `EVIDENCE_DB_HOST=db`; long-term fix is required before declaring the POC complete.
- Future blueprint (see `docs/spikes/evidence-dashboard-poc.md`): schedule the snapshot refresh, build Evidence artefacts in CI, and serve the static site through the CRM gateway once datasource registration is reliable.
- Data-source strategy is `D-0016` (pending). Current instructions assume the warehouse snapshot path; revisit once cost/ops analysis is complete.
- Full POC workspace lives on branch `spike/evidence-warehouse-poc`; retain that branch for future iterations even though the project is not shipping to production yet.
