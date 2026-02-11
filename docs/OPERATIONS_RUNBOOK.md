# dev-stack Operations Runbook (POC baseline)

_Last updated: 2025-10-21_

This quick-start runbook captures the minimum steps to operate and diagnose the managed-extension stack during hosted deployments and pilots. Update it as new behaviours land.

## 3. Hosted deployment operations

### TLS and gateway
- In hosted environments, TLS is typically terminated by the platform; nginx `gateway` remains the entry point for Twenty + fundraising.
- Build the gateway container from `nginx/Dockerfile` so platforms do not need file mounts.

### Backups and restore drill
- Enable daily automated Postgres backups with a clear retention policy.
- Run a monthly restore drill into a fresh environment; verify login plus a couple of known records.
- Restore ownership: if we host, we own restores; if the client self-hosts, the client owns restores (we provide runbook/support); managed hosting should make restore ownership explicit in the agreement.

### n8n (optional but deployed)
- Serve at `https://automations.<domain>` with strong auth.
- Use persistent storage and set `N8N_ENCRYPTION_KEY`.

## 1. Bring the stack up / down

```bash
# clean restart (preserves DB volume)
docker compose down
docker compose up -d
```

> Note: When running these commands through Codex CLI, rerun with a higher timeout if the harness cancels them early—otherwise long pulls may stop before `worker`/`gateway` come up.

Local development with host-accessible ports (UI, `server:3000`, db/redis/minio):

```bash
docker compose -f docker-compose.yml -f docker-compose.local.yml up -d
```

Key checks while starting:
- `docker compose ps` – expect `server`, `fundraising-service`, `gateway`, `redis`, `db` to reach `healthy`.
- `npm run smoke:gifts:docker` from `services/fundraising-service` – runs the smoke script inside the fundraising-service container so `gateway:80` resolves reliably, and leaves a “Persistent Smoke Test Gift” in Twenty for UI confirmation. Reads `TWENTY_API_KEY` from `.env` (or set `SMOKE_AUTH_TOKEN` explicitly).
- `GATEWAY_BASE=http://localhost:4000 npm run smoke:gifts` from `services/fundraising-service` – host-side alternative if you can reach the gateway directly. (Without the `GATEWAY_BASE` override the host can’t resolve `gateway:80`.)
- If you are running metadata provisioning scripts locally, keep `SERVER_URL=http://localhost:3000` so REST metadata calls can loop back without 500s. Use the gateway URL in hosted deployments.

## 2. Health & readiness endpoints

Service | Endpoint | Notes
---|---|---
Fundraising service | `http://localhost:4500/health` | Returns `{"status":"ok"}` once Nest is ready.
Twenty gateway (nginx) | `http://localhost:4000/health` | Proxied to fundraising-service; requires fundraising-service to be healthy.
Twenty core (`server`) | `http://localhost:3000/healthz` | Requires DB migrations; check compose logs if it flaps between `starting`/`unhealthy`.

Use `docker compose ps <service>` to see the health result and `docker compose logs <service>` for detail.

### Fundraising admin UI (POC)
- Entry point: `http://localhost:4000/fundraising/`. The UI is served via the main gateway.
- Requires Gift metadata field `donorId` (lookup to Person) and Metadata runbook steps for `Gift date`.
- Each submission creates a Person via Twenty `/people`, then a Gift via `/gifts`, linking the new person through `donorId`.
- Success banner surfaces the gift id and links to the Twenty gifts list (`/objects/gifts`).

## 4. Structured logs & request IDs

- Every inbound HTTP request now carries an `x-request-id`. If the client does not provide one, the proxy mints a UUID and echoes it back.
- Logs emitted by `fundraising-service` are JSON with the following keys:
  - `timestamp`, `level`, `message`
  - `requestId` (if available)
  - `event` (e.g. `twenty_proxy_attempt`, `twenty_proxy_retry`, `twenty_proxy_network_error`, `twenty_proxy_http_error`, `twenty_proxy_success`)
  - `method`, `path`, `url`, `status`, `durationMs`, `attempt`, `maxAttempts`, `delayMs`
- Sample command to tail logs:
  ```bash
  docker compose logs fundraising-service -f
  ```
- When debugging a failure, search for the `requestId` in both the fundraising-service logs and the Twenty core logs (if available) to follow the request through the stack.

## 5. Common diagnostics

Scenario | Command(s)
---|---
Run smoke test (preferred local) | `cd services/fundraising-service && npm run smoke:gifts:docker`
Run smoke test (host-side) | `cd services/fundraising-service && GATEWAY_BASE=http://localhost:4000 npm run smoke:gifts`
Run smoke test (hosted/VPS, unverified) | `cd services/fundraising-service && SMOKE_GIFTS_BASE=https://your-gateway SMOKE_AUTH_TOKEN=<api-key> npm run smoke:gifts`
Check environment variables inside a container | `docker compose exec fundraising-service env | sort`
Restart a single service | `docker compose restart fundraising-service`
Inspect Compose health details | 1. Find the container name with `docker compose ps`<br>2. `docker inspect --format '{{json .State.Health}}' <container_name>`

### Batch smoke + retry ledger (gift-batch)

Use this when validating batch throughput, retry pressure, and fallback behavior.

1. Run the batch smoke profile (30 rows, all scenarios):
   ```bash
   cd services/fundraising-service
   node scripts/smoke-gift-batch-bulk.mjs --rows=30 --scenario=all
   ```
2. Capture structured logs from fundraising-service:
   ```bash
   cd /home/jamesbryant/workspace/dev-stack
   docker compose logs fundraising-service --since 30m --tail 4000 > /tmp/fundraising-smoke.log
   ```
3. (Optional but recommended) narrow to the run window before counting:
   ```bash
   awk 'match($0, /"timestamp":"([^"]+)"/, a) { ts=a[1]; if (ts >= "2026-02-11T13:48:18.000Z" && ts <= "2026-02-11T13:52:53.999Z") print $0; }' /tmp/fundraising-smoke.log > /tmp/fundraising-smoke-window.log
   ```
   Replace start/end timestamps with your run window.
4. Count retry pressure:
   ```bash
   rg -c '"event":"twenty_proxy_retry"' /tmp/fundraising-smoke-window.log
   rg -c '"status":429' /tmp/fundraising-smoke-window.log
   ```
5. Identify where retries came from (context breakdown):
   ```bash
   rg '"event":"twenty_proxy_retry"' /tmp/fundraising-smoke-window.log | sed -n 's/.*"context":"\([^"]*\)".*/\1/p' | sort | uniq -c | sort -nr
   ```
6. Drill into endpoint/method hot spots (example: `GiftStagingApiClient`):
   ```bash
   awk 'match($0,/"context":"GiftStagingApiClient"/) && match($0,/"event":"twenty_proxy_retry"/) { m=""; p=""; if (match($0,/"method":"[^"]+"/)) m=substr($0,RSTART+10,RLENGTH-11); if (match($0,/"path":"[^"]+"/)) p=substr($0,RSTART+8,RLENGTH-9); if (m!="" && p!="") print m " " p }' /tmp/fundraising-smoke-window.log | sort | uniq -c | sort -nr
   ```
7. Confirm no critical integrity signals:
   ```bash
   rg -n 'gift_batch_.*correlation_contract_failure|gift_batch_.*run_failed|gift_batch_.*run_finished' /tmp/fundraising-smoke-window.log
   ```

Interpretation guidance:
- High `GiftStagingApiClient` retries during smoke often indicates row-level setup/verification pressure in the harness (seed + status updates + readbacks), not necessarily a regression in core batch create/writeback paths.
- Prioritize `correlation_contract_failure` and `run_failed` checks first; then analyze retry distribution.
- Compare trend deltas as a set (`logical`, `attempts`, `retries`), not single metrics in isolation; see `docs/solutions/gift-batch-processing.md` for quick-rubric interpretation.

### Gift batch processing run (staging queue)

Canonical behavior/reference doc: `docs/solutions/gift-batch-processing.md`.

- Start run: `POST /api/fundraising/gift-batches/:batchId/process`
  - Optional body: `{ "maxRows": <number> }` to cap the run for controlled testing.
- Poll run status: `GET /api/fundraising/gift-batches/:batchId/process/:runId`
- Guardrail: only one active run per batch is allowed at a time.
- Run pacing: `FUNDRAISING_BATCH_PROCESS_ROW_DELAY_MS` (default `600`) controls delay between staged-row processing attempts.
- Batch status updates:
  - `processing` while run is active.
  - `processed` on full success.
  - `processed_with_issues` when deferred/errors remain.
- Staging list filter gotcha (important):
  - Twenty REST list endpoints parse `filter`, `order_by`, `starting_after`, `ending_before`.
  - Query params like `giftBatchId`, `sort`, and `cursor` are fundraising-service API params, not native Twenty list params.
  - If calling Twenty directly (`/rest/giftStagings`), use `filter=giftBatchId[eq]:"<batchId>"` (plus `order_by` / `starting_after` as needed) or batch scoping will be ignored.

### Donor-match run (staging queue)

- Start run: `POST /api/fundraising/gift-batches/:batchId/donor-match`
  - Optional body: `{ "maxRows": <number> }` to cap candidate rows in the run.
- Poll run status: `GET /api/fundraising/gift-batches/:batchId/donor-match/:runId`
- Create donors run:
  - Start: `POST /api/fundraising/gift-batches/:batchId/donor-match/create-donors/run`
  - Poll: `GET /api/fundraising/gift-batches/:batchId/donor-match/create-donors/run/:runId`
- Candidate scope:
  - donor-match evaluates unresolved candidate rows by default (already-linked rows are skipped for efficiency).
- Run pacing knobs:
  - `FUNDRAISING_DONOR_MATCH_LOOKUP_DELAY_MS`
  - `FUNDRAISING_DONOR_MATCH_LOOKUP_BATCH_SIZE` (clamped to max `60`)
  - `FUNDRAISING_DONOR_MATCH_CREATE_CHUNK_SIZE` (clamped to max `60`)
  - `FUNDRAISING_DONOR_MATCH_CREATE_DELAY_MS`

### Gift batch invariant expectations (refactor safety)

Canonical invariant context also lives in `docs/solutions/gift-batch-processing.md` and `docs/ARCHITECTURE.md`.

Use these as operator-facing checks when validating refactors and incident behavior:

- Scope integrity:
  - only in-batch rows are acted on (`giftBatchId` must match selected batch).
  - fundraising list params must continue translating to Twenty-native params (`filter`, `order_by`, `starting_after`/`ending_before`).
- Run integrity:
  - one active run per `batchId + runType` (`process-batch`, `donor-match`, `create-donors`).
  - process-batch stale recovery remains active: if batch is `processing` with no active in-memory process run, batch is marked failed/recoverable.
  - run and batch status transitions stay coherent with resumability behavior.
- Donor-match integrity:
  - donor-match candidate universe is unresolved rows by default.
  - each processed candidate row receives explicit persisted outcome metadata.
- Write safety:
  - nullable updates keep strict semantics (`undefined` no-change, `null` clear).
  - batch upsert safety checks remain enforced (max 60, unique/non-empty IDs, non-empty updates, strict response ID-set validation).
  - `trustIds` fast-path is only allowed with bounded allowed IDs.
- Failure handling:
  - normal batch failures keep split/isolation fallback.
  - correlation-contract failures on create paths do not split/retry create (to avoid duplicate side effects).
- Progress truthfulness:
  - processed counters advance only after successful staging writeback.
- Current intentional operational rule:
  - recurring-linked rows remain row-path until explicit batch-path parity work is shipped.

## 6. Feature flags & settings toggles (AI / Applications)

- The stack reads feature flags from the database only when `IS_CONFIG_VARIABLES_IN_DB_ENABLED` is `"true"` for **both** `server` and `worker` in `docker-compose.yml`. We have this set in our repo; if you rebase onto upstream compose, confirm it remains.
- After any change to `docker-compose.yml`, restart the containers that read the flag and flush cache:
  ```bash
  docker compose up -d --force-recreate server worker
  docker compose exec redis redis-cli FLUSHALL   # or run `npx nx run twenty-server:command cache:flush` from services/twenty-core
  ```
- Toggle individual flags via SQL. Example (AI & Applications):
  ```bash
  docker compose exec -T db psql -U postgres -d ${PG_DATABASE_NAME:-default} -c "UPDATE core.\"featureFlag\" SET value = true WHERE key = 'IS_AI_ENABLED';"
  docker compose exec -T db psql -U postgres -d ${PG_DATABASE_NAME:-default} -c "INSERT INTO core.\"featureFlag\" (key, value) SELECT 'IS_AI_ENABLED', true WHERE NOT EXISTS (SELECT 1 FROM core.\"featureFlag\" WHERE key = 'IS_AI_ENABLED');"

  docker compose exec -T db psql -U postgres -d ${PG_DATABASE_NAME:-default} -c "UPDATE core.\"featureFlag\" SET value = true WHERE key = 'IS_APPLICATION_ENABLED';"
  docker compose exec -T db psql -U postgres -d ${PG_DATABASE_NAME:-default} -c "INSERT INTO core.\"featureFlag\" (key, value) SELECT 'IS_APPLICATION_ENABLED', true WHERE NOT EXISTS (SELECT 1 FROM core.\"featureFlag\" WHERE key = 'IS_APPLICATION_ENABLED');"
  ```
- Remember to flush cache again after inserting/updating flags. The Applications UI still requires Twenty ≥ 1.8, so on older images the settings screen may not render even though the backend respects the flag. See `docs/TWENTY_AI_INTEGRATION.md` for more context.

## 7. Known quirks (tracked)

- Twenty core still logs `Created new shared pg Pool for key "localhost|5432|postgres||no-ssl"` during boot. It is noisy but harmless.
- Metadata automation for lookup fields remains manual; run `npm run smoke:gifts:docker` after any metadata change to confirm proxy health.

## 8. Imports, migrations, and API rate limits (Twenty core)

Use this guidance for **data migrations**, **integrations**, and **large imports** that call Twenty’s APIs directly. This is the
canonical operational summary so we can avoid re-learning rate limits in future spikes.

**Documented limits (Twenty docs, 2026-02-05):**
- **Requests per minute:** 100 (per API key / workspace).
- **Records per batch call:** 60.
- **Throughput:** ~6,000 records/minute at max batch size (theoretical).
- **Sustained imports:** add ≥600ms delay between requests; use exponential backoff on 429.

**Observed batch behavior (local stack spike, 2026-02-05):**
- `/batch/*` endpoints are **atomic**: one invalid record fails the whole batch (no partial success).
- Error responses return a batch-level `messages[]` only (no per-item error payload).
- Success responses return **full records** (ids + timestamps), not just IDs.

**Practical implications:**
- Pre-validate and normalize records **before** batching, or be prepared to split failing batches.
- On batch failure, split into smaller batches (binary split) to isolate bad rows and continue.
- For large imports, prefer `/batch/*` with chunks of **30–60** and ≥600–800ms delay.
- Gateway staging calls **fan out** into multiple Twenty API calls; keep staging ingestion rates lower than raw batch imports.

If you observe 429s in logs, slow the import immediately and increase backoff time before retrying.

---

_Keep this document in sync with compose changes, health endpoints, and logging behaviour as we flesh out the runbook backlog item._
