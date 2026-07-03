# Fundraising App Deployment Ledger

Status: Working ledger (`v0`)
Purpose: Record deployed `nonprofit-fundraising` app artifacts for client workspaces.

This ledger records shared app deployments only. Track workspace-specific
configuration, imports, bespoke extension apps, and client operations separately
unless they are directly part of the shared app deployment event.

## Records

| Date | App | Version | Workspace | Artifact | Size | sha256 | Source | Type | Result | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 2026-07-03 | `nonprofit-fundraising` | `0.1.10` | `imara-twenty-com` / `https://imara.twenty.com` | `.twenty/output/nonprofit-fundraising-0.1.10.tgz` | 14M | `1e65aba9858c5caf8a7bb86e7170cea9191afda1cbc57e1d1c3b1d21ff2fde66` | `nonprofit-fundraising-v0.1.10` / `5fc7cab65f9da360ed8a41a9fdd442fda55b0f43` | Pilot deployment update | Success | Built from source state after `f881f6a25c9fcf4dcaba2c5911abd1f0b295e9ae`; checks reported: `yarn typecheck`, `yarn test:unit` (26 files, 162 tests passed). |
| 2026-07-02 | `nonprofit-fundraising` | `0.1.9` | `imara-twenty-com` / `https://imara.twenty.com` | `.twenty/output/nonprofit-fundraising-0.1.9.tgz` | 15M | `835ccce9711aabfe30279f644c08fe46daa5f020ebb2d57586d8a73b34bad6d1` | `nonprofit-fundraising-v0.1.9` / `1347f1bd` | Pilot deployment update | Success | Built from source state after `8dcfcc59`; checks reported: `yarn typecheck`, `yarn test:unit`. |
| 2026-07-02 | `nonprofit-fundraising` | `0.1.8` | `imara-twenty-com` / `https://imara.twenty.com` | `.twenty/output/nonprofit-fundraising-0.1.8.tgz` | 15M | `cdd84991224e04ef539ef08f1ca549196c66f95ecbf8776a2b81f7b7e52d03c2` | `nonprofit-fundraising-v0.1.8` / `26ca2065b66bba8e3d858b615d7787f95aca8608` | First pilot deployment | Success | Source snapshot commit created after confirming no code changes since artifact build/deploy. |
