# Fundraising App Deployment Ledger

Status: Working ledger (`v0`)
Purpose: Record deployed `nonprofit-fundraising` app artifacts for client workspaces.

This ledger records shared app deployments only. Track workspace-specific
configuration, imports, bespoke extension apps, and client operations separately
unless they are directly part of the shared app deployment event.

## Records

| Date | App | Version | Workspace | Artifact | Size | sha256 | Source | Type | Result | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 2026-07-02 | `nonprofit-fundraising` | `0.1.8` | `imara-twenty-com` / `https://imara.twenty.com` | `.twenty/output/nonprofit-fundraising-0.1.8.tgz` | 15M | `cdd84991224e04ef539ef08f1ca549196c66f95ecbf8776a2b81f7b7e52d03c2` | `nonprofit-fundraising-v0.1.8` / `26ca2065b66bba8e3d858b615d7787f95aca8608` | First pilot deployment | Success | Source snapshot commit created after confirming no code changes since artifact build/deploy. |
