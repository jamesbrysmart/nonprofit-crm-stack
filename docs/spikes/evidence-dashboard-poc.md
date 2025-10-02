# Evidence.dev Dashboard POC

Updated: 2025-10-02  
Status: Paused (datasource registration fix pending)

## Purpose
Trialing **Evidence.dev** as the foundation for our modular reporting feature.

## Why Evidence.dev
- **Code-first approach:** Dashboards are written in **Markdown + SQL**, which fits our dev workflow and can be version-controlled in Git.
- **Polished output:** Generates static HTML dashboards with charts and text, customizable with CSS/HTML.
- **Integration-friendly:** Outputs can be hosted (Vercel/Netlify) or embedded in CRM UI. Static builds mean no always-on server required.
- **Lightweight multi-tenancy:** Dashboards can filter by org ID and be published per tenant. Auth handled by CRM.

## Considerations
- **Developer-maintained:** Clients don’t edit dashboards. Team is responsible for updates.
- **Data refresh:** Static unless rebuilt. Need cron/scheduled rebuild or server mode for live queries.
- **Filters & interactivity:** Supports inputs and parameters, but no full ad-hoc analysis.
- **Security:** No built-in user management. CRM must enforce permissions.

## Objective
- Validate Evidence.dev as a modular reporting layer for the Twenty Nonprofit Suite.
- Deliver a thin slice dashboard (e.g., gifts by month with YTD/LY comparison) without compromising the managed-extension boundary.
- Capture findings in `INTEGRATIONS.md` and `docs/POC-backlog.md` so follow-up work is traceable.

## Scope Assumptions
- Audience: internal stakeholders only for the POC; basic auth acceptable. Document that long-term we will need SSO or Twenty-session passthrough.
- Hosting: run Evidence as an optional Docker Compose service (profile-gated).
- Licensing/Cost: target free or self-hosted usage; confirm licensing implications before GA.
- Documentation: See appendix at end for session notes.

## Data Flow Options
1. **Direct API ingestion** – fastest for a demo, but adds latency/rate-limit concerns.
2. **Analytics warehouse** – sync from Twenty into Postgres/DuckDB and let Evidence read from there (current path; snapshot in `analytics.gifts_snapshot`).

## POC Deliverable
- Compose-managed Evidence service reading from the analytics snapshot.
- At least one dashboard showing gifts by month.
- Runbook covering snapshot refresh, service start/stop, and known limitations.

## Implementation Steps (ongoing)
1. Research Evidence connection methods and licensing (appendix).
2. Decide data source (API vs warehouse) – interim: warehouse snapshot with `load_gifts_snapshot.sql`.
3. Wire Evidence into Docker Compose (`profiles: ["dashboards"]`).
4. Provide seed scripts (`scripts/analytics/load_gifts_snapshot.sql`).
5. Scaffold Evidence project under `dashboards/evidence/` (official `devenv` image).
6. Document run instructions (`docs/REPORTING_EVIDENCE.md`).
7. TODO: automate `npx evidence sources` reliably and reinstate chart components once datasource resolved.

## Key Learnings
- Warehouse-first flow works: snapshot loader reliably stages fundraising data in Postgres and keeps us inside the managed-extension boundary.
- Evidence project lives comfortably in Git—Markdown + SQL changes are reviewable and easy to diff.
- Devenv is a productive dev loop; treat the current localhost resolution bug as a container quirk, not a blocker for production planning.
- Compose profiles let us ship dashboards as an optional slice so the CRM stack stays lightweight by default.
- Once the datasource registers, the existing page renders correctly; remaining work is pipeline hardening rather than rethinking the thin slice.
- Data-source decision tracked as `D-0016` (warehouse vs API). Warehouse option currently preferred but pending cost/ops analysis.

## Future Implementation Blueprint
1. **Data:** Promote `scripts/analytics/load_gifts_snapshot.sql` to a scheduled warehouse job, version the schema, and document refresh cadence.
2. **Evidence Project:** Keep `dashboards/evidence` as the canonical repo, add lint/tests as needed, and expand pages/components under version control.
3. **Build Pipeline:** In CI, run `npx evidence sources && npm run build` inside a container with warehouse access; persist `.evidence/meta` and static artefacts for deployment.
4. **Integration:** Serve the built Evidence site behind the CRM gateway or CDN so CRM auth/session logic governs access and embedding.
5. **Operations:** Document refresh + deploy steps and add smoke tests hitting the warehouse to catch schema drift early.

## Open Questions
- How do we secure API keys inside Compose? (`TODO:auth-plan`)
- Minimal dataset needed for first slice? (`TODO:data-scope`)
- Embedding/theming requirements for customer-facing dashboards? (`TODO:embedding`)

## Related Docs
- `INTEGRATIONS.md`, `docs/POC-backlog.md` updated with Evidence row and backlog item.
- `docs/REPORTING_EVIDENCE.md` (runbook).
- Implementation artefacts and the runnable Evidence workspace remain on branch `spike/evidence-warehouse-poc`; keep the branch for future reporting spikes even though it is not intended for production.

---

### Session log (2025-10-01)

- Snapshot staging working (`analytics.gifts_snapshot`).
- Evidence project scaffolded via `devenv`; custom SQL page renders raw table.
- Compose service updated to use official image, automated `npx evidence sources && npm run dev`.
- Outstanding: `npx evidence sources` still failing (connector config, DB creds), charts disabled until data source confirmed.
- Next session: re-run devenv `--init`, apply custom `pages/index.md` + `evidence.config.cjs`, regenerate sources, launch via compose, then reintroduce charts.

### Session log (2025-10-02)

- `docker compose --profile fast --profile dashboards up evidence` now starts reliably; Evidence UI reachable at `http://localhost:5600` while Twenty continues to occupy host port 3000.
- `scripts/analytics/load_gifts_snapshot.sql` refreshes the warehouse snapshot; verified 19 rows landed in `analytics.gifts_snapshot`.
- Evidence config (`evidence.config.cjs` + `sources/analytics/connection.yaml`) points to the Compose `db` service, but `npx evidence sources` run inside the devenv container still attempts `127.0.0.1:5432` and fails with `ECONNREFUSED`. Result: the `analytics` source is never registered and the dashboard page reports `Catalog Error: Table ... does not exist`.
- Likely root cause: Evidence CLI defaulting to localhost when metadata is missing; workaround is to run sources in a build stage or set explicit `PGHOST=db`/connection string before invoking the CLI. Needs follow-up before declaring the POC complete.
- Decision: pause implementation, document learnings, and outline production-ready plan (warehouse-first, build Evidence artefacts in CI, serve static output via CRM gateway). Record data-source choice as pending in `DECISIONS.md` (D-0016). Remaining work resumes once datasource registration issue is resolved.
