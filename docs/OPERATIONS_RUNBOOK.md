# dev-stack Operations Runbook (POC baseline)

_Last updated: 2025-02-07_

This quick-start runbook captures the minimum steps to operate and diagnose the managed-extension stack during the Phase 1 POC. Update it as new behaviours land.

## 1. Bring the stack up / down

```bash
# clean restart (be patient; compose tears everything down first)
docker compose --profile fast down -v

docker compose --profile fast up -d --build
```

Key checks while starting:
- `docker compose ps` – expect `server`, `fundraising-service`, `gateway`, `redis`, `db` to reach `healthy`.
- `npm run smoke:gifts` from `services/fundraising-service` – validates proxy → Twenty flow and leaves a “Persistent Smoke Test Gift” in Twenty for UI confirmation.

## 2. Health & readiness endpoints

Service | Endpoint | Notes
---|---|---
Fundraising service | `http://localhost:4500/health` | Returns `{"status":"ok"}` once Nest is ready.
Twenty gateway (nginx) | `http://localhost:4000/health` | Proxied to fundraising-service; requires fundraising-service to be healthy.
Twenty core (`server`) | `http://localhost:3000/health` | Requires DB migrations; check compose logs if it flaps between `starting`/`unhealthy`.

Use `docker compose ps <service>` to see the health result and `docker compose logs <service>` for detail.

### Fundraising admin UI (POC)
- Entry point: `http://localhost:4000/fundraising/`. The UI is served via the main gateway.
- Requires Gift metadata field `donorId` (lookup to Person) and Metadata runbook steps for `Gift date`.
- Each submission creates a Person via Twenty `/people`, then a Gift via `/gifts`, linking the new person through `donorId`.
- Success banner surfaces the gift id and links to the Twenty gifts list (`/objects/gifts`).

## 3. Structured logs & request IDs

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

## 4. Common diagnostics

Scenario | Command(s)
---|---
Run smoke test only | `cd services/fundraising-service && npm run smoke:gifts`
Check environment variables inside a container | `docker compose exec fundraising-service env | sort`
Restart a single service | `docker compose restart fundraising-service`
Inspect Compose health details | `docker inspect --format '{{json .State.Health}}' dev-stack-fundraising-service-1`

## 5. Known quirks (tracked)

- Twenty core still logs `Created new shared pg Pool for key "localhost|5432|postgres||no-ssl"` during boot. It is noisy but harmless.
- Metadata automation for lookup fields remains manual; run `npm run smoke:gifts` after any metadata change to confirm proxy health.

## 6. Gift staging toggle (scaffold)

- `FUNDRAISING_ENABLE_GIFT_STAGING=true` enables the staging flow inside the fundraising-service.
- `FUNDRAISING_STAGING_AUTO_PROMOTE_DEFAULT` (default `true`) controls whether newly staged rows auto-commit when validation passes. Until batch-level review toggles exist, prefer setting this to `false` so rows require explicit approval.
- When enabled, inbound gifts write to `gift_staging` via the REST API (logs `gift_staging_stage`). Successful commits emit `gift_staging_committed` with the resulting gift id.
- If a request sets `autoPromote=false` (or the org default resolves to false) the service now returns a staging acknowledgement payload (`data.giftStaging`, `meta.stagedOnly=true`) and defers the gift creation step for manual approval.
- Manual processing endpoint: `POST /gift-staging/:id/promote` returns one of `{status: 'committed'|'deferred'|'error', ...}`. Use only when staging is enabled; otherwise the route responds with `503 Service Unavailable`.
- Reviewers can update staging statuses via `PATCH /gift-staging/:id/status` (supply `promotionStatus`, `validationStatus`, `dedupeStatus`; raw payload is preserved automatically if omitted).
- Leave the flag unset/false to retain the classic direct-to-gift behaviour while staging metadata is provisioned.

### Smoke test

- Run `docker compose --profile fast exec -e SMOKE_GIFTS_BASE=http://gateway/api/fundraising fundraising-service npm run smoke:gifts`.
- Flow: stage (autoPromote=false) → mark ready → promote → cleanup → legacy gift CRUD → persistent gift. A warning about missing `rawPayload` may appear if the API omits it; behaviour still passes.

---

_Keep this document in sync with compose changes, health endpoints, and logging behaviour as we flesh out the runbook backlog item._
