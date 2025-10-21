# dev-stack Operations Runbook (POC baseline)

_Last updated: 2025-10-21_

This quick-start runbook captures the minimum steps to operate and diagnose the managed-extension stack during the Phase 1 POC. Update it as new behaviours land.

## 1. Bring the stack up / down

```bash
# clean restart (be patient; compose tears everything down first)
docker compose down -v

docker compose up -d --build
```

Key checks while starting:
- `docker compose ps` – expect `server`, `fundraising-service`, `gateway`, `redis`, `db` to reach `healthy`.
- `npm run smoke:gifts` from `services/fundraising-service` – validates proxy → Twenty flow and leaves a “Persistent Smoke Test Gift” in Twenty for UI confirmation.

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
Inspect Compose health details | 1. Find the container name with `docker compose ps`<br>2. `docker inspect --format '{{json .State.Health}}' <container_name>`

## 5. Known quirks (tracked)

- Twenty core still logs `Created new shared pg Pool for key "localhost|5432|postgres||no-ssl"` during boot. It is noisy but harmless.
- Metadata automation for lookup fields remains manual; run `npm run smoke:gifts` after any metadata change to confirm proxy health.

---

_Keep this document in sync with compose changes, health endpoints, and logging behaviour as we flesh out the runbook backlog item._
