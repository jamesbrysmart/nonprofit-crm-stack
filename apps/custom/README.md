# Custom Apps

Org-specific extensions that should remain isolated from reusable modules.

## Creating a Twenty App (placeholder)
- Prefer `create-twenty-app` or a local `twenty-sdk` setup for scaffolding.
- Keep app code in its own folder under `apps/custom/<org-or-feature>/`.
- Store runtime variables in the app config; do not hardcode API keys.
- Use `twenty app sync` to deploy to a workspace.
- Add a minimal test or smoke script where practical; run it before syncing.

## Custom Code Best Practices (draft)
- Keep functions small and idempotent; retries should be safe.
- Validate inputs explicitly; log structured errors with a clear event name.
- Avoid direct database access; use Twenty APIs so schema changes remain safe.
- Rate-limit outbound calls and honor backoff/retry headers.
- Treat config as immutable at runtime; redeploy after changes.
- Capture versioning in the app metadata so upgrades are traceable.
