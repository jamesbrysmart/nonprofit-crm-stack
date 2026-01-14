# Tenant Workflows

Store partner or tenant-specific workflow exports in subfolders here.

Suggested layout:
- `automations/n8n/tenants/<org>/workflows/*.json`
- `automations/n8n/tenants/<org>/README.md` with required credentials and a short description.

Keep secrets out of git. Use your deployment secret manager for credentials.
