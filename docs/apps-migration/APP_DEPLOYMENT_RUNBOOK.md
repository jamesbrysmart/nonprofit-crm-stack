# Fundraising App Deployment Runbook

Updated: 2026-06-11
Status: Working runbook (`v0`)
Purpose: Define the current lightweight, repeatable process for deploying and upgrading the shared `nonprofit-fundraising` app into client Twenty workspaces.

This is intentionally practical.

It is not a full release-management framework, and it should not pretend we have already verified every Twenty deployment behavior we may care about later.

Use this runbook for:

- first installs of the shared fundraising app into a client instance/workspace
- upgrades of that same shared app
- lightweight deployment recording and verification

This runbook governs the shared `nonprofit-fundraising` app artifact only.

Do not use this runbook as the source of truth for:

- the full client workspace operating model
- local app-dev sync behavior
- legacy integrated Docker runtime behavior
- workspace-specific configuration/change tracking
- separate client extension app operating rules
- integration/import/process operating rules
- bespoke client extensions that are not part of the shared fundraising app

For repo-local app workflow guidance, also read:

- [TWENTY_APP_DEV_WORKFLOW.md](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/TWENTY_APP_DEV_WORKFLOW.md)
- [CLIENT_WORKSPACE_OPERATIONS_MODEL.md](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/CLIENT_WORKSPACE_OPERATIONS_MODEL.md)

## 1. Current Working Posture

Current default:

- `nonprofit-fundraising` is a shared product app
- client-specific differences should default to workspace configuration, not core app variants
- if a client needs bespoke logic that does not clearly belong in the shared product, prefer a separate extension app over a client-specific fundraising app fork

This runbook is therefore built around one canonical version line for the shared app.

## 2. Versioning Policy

Current working policy:

- the shared fundraising app uses one canonical semver line
- the same version may be deployed to multiple clients only if it is the same artifact
- if the artifact changes, the version changes
- upgrades must always move forward to a higher version

Current intended interpretation:

- `patch`
  - bugfixes or corrections
  - no intentional workflow expansion
- `minor`
  - additive shared/productised functionality
  - new shared views, fields, flows, or capabilities expected to coexist safely
- `major`
  - materially risky structural change
  - removals, significant metadata reshaping, or operationally meaningful behavior changes

This is a working rule set, not a claim that every future release will map perfectly to semver without judgment.

Important clarification:

- semver describes the release shape
- conditional checks describe the operational verification needed for that release

Do not assume a `patch` release needs only minimal checks if it touches gift/payment processing, metadata behavior, or upgrade logic.

## 3. Shared App Boundary

Treat these as different kinds of change:

### Shared App Release

Belongs in `nonprofit-fundraising` only if it is intended to be shared/productised across clients.

Examples:

- shared fundraising workflows
- shared objects/fields/views that belong in the product
- shared payment, staging, batch, or reconciliation behavior
- shared native UI surfaces

### Workspace Configuration

Do not create a new fundraising app version just because a client needs workspace-specific setup.

Examples:

- extra client-facing labels
- client-specific views or reports
- import mappings
- donation form settings
- workspace configuration choices using existing shared app capabilities

Track these separately in the implementation/deployment ledger.

### Separate Extension App

If a client needs bespoke logic that is not clearly shared product functionality, prefer a separate app/extension.

Examples:

- bespoke integrations
- bespoke custom objects
- client-only workflows
- client-specific runtime logic that should not be carried by the shared fundraising app

This runbook does not define the versioning or deployment rules for those separate extension apps yet.

## 4. Artifact Identity

Before any client deployment, record at minimum:

- app version
- git commit used to build the artifact
- tarball filename/path
- tarball size
- tarball sha256 checksum
- target client instance
- target workspace

Recommended working rule:

- do not deploy from an unidentified local state
- do not treat "whatever is currently in `.twenty/output`" as enough release identity by itself

Placeholder:

- we have not yet locked the final long-term signing/provenance posture for client artifacts beyond basic artifact identity

## 5. Release Creation

Create and identify the release artifact once before any first install or upgrade procedure consumes it.

Current working steps:

- confirm the intended app version
- build the tarball using the current Twenty app workflow
- record artifact identity:
  - app version
  - git commit
  - tarball filename/path
  - tarball size
  - tarball sha256 checksum

Current working rule:

- first install and upgrade should consume an already-identified artifact
- do not rebuild mid-deployment unless you are intentionally creating a new release artifact

## 6. Pre-Deploy Questions

Before each deployment, answer these questions:

1. Is this a first install or an upgrade?
2. What version is being deployed?
3. What is the current installed version, if any?
4. Does this release touch:
   - gift/payment processing?
   - metadata?
   - migration/seed/upgrade logic?
5. Is the target change shared app functionality, workspace configuration, or a separate extension concern?

These answers determine which checks to run.

## 7. First Install Procedure

Use this for the first deployment of `nonprofit-fundraising` into a client workspace.

### Prechecks

- confirm target client instance and target workspace
- confirm intended app version
- confirm the identified release artifact to deploy
- confirm this is the shared fundraising app, not a bespoke client variant
- record pre-deploy details in the deployment ledger

### Deploy

- deploy the tarball to the target instance
- install the app into the target workspace

Placeholder:

- we have proven the basic tarball deploy/install path in non-client testing, but future sessions may still refine the exact preferred command sequence and operator ergonomics

### Verify

- run the core verification checklist
- run any triggered conditional checks
- record result in the deployment ledger

## 8. Upgrade Procedure

Use this when the client workspace already has the fundraising app installed.

### Prechecks

- confirm target client instance and target workspace
- confirm currently installed version
- confirm intended upgrade version
- classify release scope:
  - core-only
  - includes processing checks
  - includes metadata checks
  - includes migration/seed/upgrade checks
- record pre-upgrade details in the deployment ledger

### Deploy

- deploy the new version to the target instance
- run the workspace upgrade/install-forward step

Current working assumption for `v0`:

- upgrades move forward only
- do not attempt downgrade as part of the normal runbook

Placeholder:

- rollback posture is not yet fully proven for metadata-heavy releases and should not be treated as symmetric with upgrade
- for now, do not plan to use uninstall as a normal upgrade or rollback step for a live client workspace

### Verify

- run the core verification checklist
- run any triggered conditional checks
- record result in the deployment ledger

## 9. Core Verification Checklist

Run this for every first install and every upgrade.

- Confirm deployment target:
  - correct client instance
  - correct workspace
- Confirm app version:
  - expected version is the one now installed
- Confirm installation state:
  - app appears installed in Twenty
- Confirm core app surfaces:
  - expected navigation items/views are present
  - key app pages load without obvious runtime/UI failure
- Confirm one minimal interactive sanity check:
  - open one simple core record or create/open one simple non-payment record only if that can be done safely and quickly for the target workspace
- Confirm app runtime shape:
  - expected app logic/functions appear present for the release
- Record outcome:
  - pass / issue / blocked
  - brief notes

Current practical expectation:

- this should stay short enough to run every time
- this is a health check, not a substitute for processing-specific verification

Current caution:

- do not turn the baseline check into a full gift/payment flow by default
- use the conditional checks for deeper operational verification when release scope requires it

## 10. Conditional Checks

Add these only when the release touches the relevant area.

### Gift / Payment Processing

Add these checks if the release touches:

- donation intake
- gift creation
- gift staging
- batch processing
- Stripe or other payment-provider behavior
- recurring gifts
- refunds

Checks:

- exercise or inspect a representative gift flow
- confirm staging/processing still behaves at a basic level
- check for obvious duplicate, status, or processing regressions
- if provider-related, run the safest meaningful verification available for that release

Placeholder:

- the exact minimum provider-safe verification flow still needs refinement through repeated real deployments

### Metadata Changes

Add these checks if the release adds, removes, renames, or materially reshapes:

- objects
- fields
- views
- page layouts
- navigation items
- other app-owned metadata

Checks:

- confirm expected new metadata appears
- confirm important existing surfaces still load
- check for obvious sync regressions
- check whether the release touches app-owned layouts, views, or `SELECT` options that a client may have edited manually
- if client edits may exist on app-owned metadata, pause and decide whether to preserve them manually, migrate them to client-owned metadata, or accept that the app update will reapply product defaults
- if anything was intentionally removed, confirm the result matches expectation
- for early client upgrades, explicitly pause and confirm whether pre-upgrade backup/export posture has been considered before proceeding with metadata-heavy releases

Current caution:

- metadata changes should be treated as higher-risk than pure UI or logic fixes until we have more repeated deployment evidence
- app-owned metadata should be treated as upgrade-owned metadata: do not promise that manual edits to app-defined layouts, views, or select options will survive app updates until Twenty provides and we verify a native override ownership model
- current working preference is additive-first evolution for important schema-bearing changes:
  - add first
  - backfill/migrate
  - switch behavior
  - defer cleanup/removal to a later release where possible
- this is a cautious operating preference based on current understanding, not yet a fully proven release rule

### Migration / Seed / Upgrade Logic

Add these checks if the release touches:

- post-install logic
- seed behavior
- data backfill or reshape behavior
- upgrade-specific logic

Checks:

- confirm the intended seed/migration effect occurred
- check for obvious duplication or corruption side effects
- inspect key records/state for sanity after install/upgrade
- for early client upgrades, explicitly pause and confirm whether pre-upgrade backup/export posture has been considered before proceeding with migration-heavy releases

Placeholder:

- we have not yet fully proven the final repeatable migration-check posture for releases that change install/seed/upgrade logic materially
- install/upgrade logic should be treated cautiously until we have more repeated deployment evidence, especially where it changes existing client state rather than only adding new state

## 11. Deployment Ledger

At `v0`, the ledger can be lightweight, but it should exist.

Current ledger:

- [APP_DEPLOYMENT_LEDGER.md](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/APP_DEPLOYMENT_LEDGER.md)

Recommended fields:

- deployment date
- operator
- client name
- client instance URL/name
- workspace name/identifier
- app name
- app version
- git commit
- tarball artifact path/name
- tarball size
- deployment type
  - first install / upgrade
- release scope flags
  - processing
  - metadata
  - migration
- result
  - success / issue / blocked
- verification summary
- notes

Recommended separation:

- app deployment history
- workspace-specific configuration / implementation notes

Do not collapse these into one indistinct stream if that makes it harder to tell whether a change was:

- a new app release
- workspace configuration
- or a separate extension concern

## 12. Known Current Constraints

These are current practical constraints, not eternal rules.

- tarball deploy/install has been proven in pre-customer testing
- current Twenty source now indicates a 100 MB default tarball upload limit, but deployment size should still be recorded
- front-component packaging can still create large artifacts and should remain visible in release checks
- app-dev sync behavior should not be treated as the same thing as client deployability

Placeholder:

- we should continue updating this section as real client installs and upgrades reveal additional Twenty-specific sharp edges

## 13. Open Items

These remain intentionally open at `v0`:

- final rollback posture for metadata-heavy upgrades
- final evidence threshold for processing/integration verification
- final long-term provenance/checksum/signature expectations for client artifacts
- final rules for separate bespoke extension apps

Until those are better proven, prefer simple, explicit operator judgment over pretending the runbook is already final.
