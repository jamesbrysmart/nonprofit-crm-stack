# Client Workspace Operations Model

Updated: 2026-06-11
Status: Working note (`v0`)
Purpose: Define the broader client-workspace operating model around the shared fundraising app without overloading the app deployment runbook.

This note is intentionally lightweight.

It does not try to fully solve client operations yet.

Its job is to define the main layers in a client workspace, the basic change-model boundary between them, and the need for a shared operating/recording approach across those layers.

## 1. Why This Exists

The shared fundraising app deployment runbook is necessary, but it is not the whole operational picture for a real client workspace.

In practice, a client workspace may include multiple interacting layers:

- the base Twenty workspace
- the shared `nonprofit-fundraising` app
- workspace-specific configuration/customisation
- separate client extension apps
- integrations/imports/processes
- live client data and usage

If we only track app releases well, but allow the rest of those layers to drift independently, we will still end up with an unclear client operating state.

## 2. Scope

This note is about how the layers of a client workspace fit together.

It is not:

- the shared fundraising app deployment runbook
- the full extension-app runbook
- a full integration operations runbook
- a final governance framework for all client operations

For the shared app deployment process, use:

- [APP_DEPLOYMENT_RUNBOOK.md](/home/jamesbryant/workspace/dev-stack/docs/apps-migration/APP_DEPLOYMENT_RUNBOOK.md)

## 3. Current Layer Model

Treat a client workspace as having at least these layers.

### Base Twenty Workspace

This includes:

- workspace existence and identity
- core Twenty capabilities
- native permissions/settings model
- base operational environment provided by the hosted/self-hosted Twenty instance

Current working rule:

- do not assume changes at this layer are governed by the fundraising app deployment process

### Shared `nonprofit-fundraising` App

This includes:

- the shared productised fundraising functionality
- app-owned metadata and runtime behavior that belongs in the common product
- shared app versioning, deployment, install, and upgrade behavior

Current working rule:

- govern this layer through the shared app deployment runbook

### Workspace-Specific Configuration

This includes:

- labels
- reports
- views
- mappings
- donation form settings
- operational choices using existing app capabilities

Current working rule:

- do not treat workspace-specific configuration as a new shared app version
- track it separately from app release history

Placeholder:

- we have not yet finalized the best lightweight recording model for these changes

### Separate Client Extension Apps

This includes:

- bespoke client functionality that does not clearly belong in the shared app
- client-specific integrations, workflows, objects, or runtime logic where necessary

Current working rule:

- if something does not clearly belong in the shared fundraising product, prefer a separate extension app over a client-specific fundraising app variant

Placeholder:

- the deployment/versioning runbook for separate client extension apps still needs its own working note

### Integrations / Imports / Processes

This includes:

- import mappings and import operations
- recurring operational data processes
- integration-specific runtime behavior
- external system touchpoints

Current working rule:

- do not assume these changes are fully captured by app deployment records alone

### Live Client Data And Usage

This includes:

- client-owned records and activity
- the operational effects of releases and configuration changes
- upgrade sensitivity created by real usage, not just metadata state

Current working rule:

- once a client workspace is live, operational safety must be judged in the context of existing data and usage, not only release mechanics

## 4. Backup And Recovery Posture

Backup and recovery should be treated as a workspace-level operational concern, not only an app-deployment concern.

Current cautious working posture:

- before early live-client upgrades, especially metadata-heavy or migration-heavy ones, confirm what backup/export capability exists for the client environment
- do not assume app rollback and workspace recovery are the same thing
- for now, do not assume uninstall is a safe recovery path for a live client workspace

This note is intentionally cautious rather than definitive.

We are not yet claiming a final proven backup/recovery runbook for client workspaces.

Current practical implication:

- for early client operations, backup/export awareness should be part of release judgment even where the exact restore/runbook mechanics are still being verified

Placeholder:

- the exact hosting-specific backup and restore mechanics still need to be verified through real client-environment operation
- the right minimum “backup checked” gate before higher-risk upgrades still needs refinement through repeated use

## 5. Change Categories

For now, classify client-workspace changes into these buckets:

- shared app deployment
- workspace configuration change
- client extension app change
- integration/import/process change

This is a lightweight working classification, not a final taxonomy.

Its purpose is to prevent changes from being recorded as an undifferentiated stream.

## 6. Recording Model

Current working recommendation:

- keep one overall client implementation/operations ledger view
- but distinguish clearly between change categories

At minimum, the recording model should let us answer:

- what shared app version is installed?
- what workspace-specific configuration changes have been applied?
- what separate extension apps are installed and at what versions?
- what integration/import/process changes have been made?
- what is still only a planned change versus a completed change?

Current practical implication:

- app deployment records should not be the only source of truth for client workspace change history

Placeholder:

- we have not yet finalized where this combined ledger should live or what exact format it should use

## 7. Relationship To Twenty Workspace Version Control

Twenty now appears to be developing or describing a workspace version-control capability.

Current posture:

- acknowledge it as potentially relevant
- do not depend on it yet as the primary safety mechanism for shared app installs/upgrades

It is most likely to matter for:

- workspace configuration history
- review of non-app workspace changes
- future rollback/review models for some workspace-level changes

It is not yet proven enough in our operating model to replace:

- app artifact identity
- deployment ledger discipline
- explicit install/upgrade verification

Placeholder:

- future verification is needed on how Twenty workspace version control interacts with app-owned metadata installs/upgrades and client-specific workspace configuration

## 8. Immediate Working Rules

For now:

- keep the shared app deployment runbook narrow and artifact-focused
- track workspace-specific configuration separately from shared app releases
- avoid client-specific variants of the shared fundraising app unless there is a strong reason
- prefer separate extension apps for genuinely bespoke client logic
- maintain a wider client change record across all layers, not just app deployment events

## 9. Open Items

These still need to be designed through real usage:

- the lightweight combined ledger model across all layers
- the working runbook for separate client extension apps
- the operating model for integrations/imports/process changes
- the practical use of Twenty workspace version control
- the right level of review/approval discipline for non-app workspace changes

Until those are better proven, prefer explicit layer separation and simple recorded judgment over pretending the whole workspace lifecycle is already formalized.
