# Fundraising App Deployment Checklist Template

Status: Working template (`v0`)
Purpose: Provide a short operator-facing checklist for a live deployment session.

Use this alongside:

- [APP_DEPLOYMENT_RUNBOOK.md](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/APP_DEPLOYMENT_RUNBOOK.md)

## Deployment Record

- Date:
- Operator:
- Client:
- Client instance:
- Workspace:
- Deployment type:
  - first install / upgrade
- App version:
- Current installed version:
- Git commit:
- Tarball artifact:
- Tarball size:
- Tarball sha256:

## Scope Flags

- Gift/payment processing touched:
  - yes / no
- Metadata touched:
  - yes / no
- Migration/seed/upgrade logic touched:
  - yes / no

## Pre-Deploy

- Confirm target instance/workspace
- Confirm identified artifact matches intended release
- Confirm this is shared app deployment, not workspace config or separate extension work

## Deploy

- Tarball deployed to target instance
- App installed/upgraded in target workspace

## Core Verification

- App appears installed at expected version
- Expected navigation/views present
- Key app pages load without obvious runtime/UI failure
- Minimal interactive sanity check completed, if safe/applicable

## Conditional Verification

- Processing checks run, if required
- Metadata checks run, if required
- Migration/seed/upgrade checks run, if required

## Result

- Status:
  - success / issue / blocked
- Verification summary:
- Notes:
