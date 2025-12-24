# Twenty Extensibility Watch

_Living log of notable changes inside `services/twenty-core` that affect the future partner-module strategy._

## Cadence & Process

- **Frequency:** every ~2 weeks (or after major Twenty releases).
- **Steps:** `git fetch upstream`, check out `upstream/main`, skim `packages/twenty-apps`, `packages/twenty-cli`, `packages/twenty-sdk`, and related commits; capture highlights and open questions below.
- **Output:** summarize deltas here and bubble any required actions into ADRs/blueprints.

## Current Extensibility Surface (Dec 2025 snapshot)

- **twenty-cli** (packages/twenty-cli):
  - Now deprecated in favor of `twenty-sdk` (see `packages/twenty-cli/README.md`).
  - Command name stays `twenty`, but install guidance now points to `npm install -g twenty-sdk`.
- **create-twenty-app** (packages/create-twenty-app):
  - New scaffolder with prewired scripts (`yarn auth`, `yarn generate`, `yarn dev`, `yarn sync`, `yarn logs`, `yarn uninstall`) to wrap the `twenty` CLI.
  - Ships with a typed client generation flow (`yarn generate`) and guided entity creation.
- **What gets packaged today:** the `AppManifest` only includes the application definition, custom objects/fields, serverless functions (with route/cron/database triggers), and static sources (`services/twenty-core/packages/twenty-cli/src/types/config.types.ts`). No React/micro-frontend surface is described, and the CLI sync/dev commands merely watch files and re-upload the manifest bundle (`packages/twenty-cli/src/commands/app-dev.command.ts`).
- **Sample apps (packages/twenty-apps):**
  - `hello-world`: provisions a `postCard` custom object, deploys a `create-new-post-card` serverless function, and wires both an HTTP route trigger and a `people.created` database trigger. README still describes manual `.env` + `twenty auth login` + `twenty app sync` workflow.
  - `hacktoberfest-2025/*`: showcase multi-function apps (Fireflies, Mailchimp sync, etc.) but remain hackathon quality.
  - `rollup-engine`: early managed rollup example packaged as a Twenty app to prove serverless rollup execution.
- **SDK / shared packages:**
  - Object/field decorators renamed (from `object-metadata`/`field-metadata`) to simplified `object`/`field` helpers (`f4663038b6`, `534a2bf647`).
  - Composite field definitions migrated into `packages/twenty-shared/src/types` (`9880f192a5`), signaling a shared type contract for CLI + apps + services.
- **Gaps / limitations:**
  - No published marketplace installer yet; everything is still CLI-driven.
  - No documented manifest schema beyond the implicit structure in sample apps.
  - Serverless functions run within the workspace but lack formal guidance on secrets rotation or dependency packaging.

---

### Snapshot — 2025-11-13

**Context:** Synced to `upstream/main` commit `a39efeb1ab` (`[BREAKING_CHANGE/GRAPHQL/OBJECT_METADATA_CREATE_ONE] Remove object/fields/view-fields v1 implementation (#15823)`).

**Highlights**

1. **CLI gets workspace-aware auth flow** (`ab967bf81f`):
   - `twenty-cli auth` now surfaces the active workspace profile and echoes it on login/log-out/status.
   - Config file handling was simplified (config command removed; `ConfigService` refactored), hinting at future multi-profile support.
   - Action: when we build our partner starter kit, ensure `twenty auth login` output/examples mention workspace context to avoid confusion.

2. **SDK/package renaming to “object/field” terminology** (`f4663038b6`, `534a2bf647`):
   - `object-metadata` helpers/decorators renamed to `object`, `field-metadata` to `field`; corresponding imports updated across apps and the SDK.
   - `packages/twenty-apps/*/package.json` and sample objects were updated to the new names.
   - Action: audit our own metadata scripts/starter kit once we adopt the new SDK version so naming stays consistent (otherwise future CLI scaffolding may break).

3. **Composite field types migrate to `twenty-shared`** (`9880f192a5`):
   - All composite type definitions/utilities moved from the SDK into `packages/twenty-shared/src/types`, indicating they want shared consumption across CLI/server/client.
   - Modules should start importing composite helpers from `twenty-shared` rather than duplicating logic.

4. **twenty-apps structure unchanged but examples updated**:
   - `hello-world` and Hacktober apps now reference the renamed SDK utilities; no new sample apps landed yet.
   - `packages/twenty-apps/project.json` still only lists `scope:apps`, so no manifest changes to mirror yet.

5. **Tags & branches to watch**:
  - New tags `v1.10.7`, `v1.11.0` published.
  - Fresh upstream branches like `migration-and-upgrade-command-twenty-apps` and `sdk-on-demand-twenty-cli` suggest ongoing CLI work; monitor these for future breaking changes.

**Open Questions / Follow-ups**

- When will the renamed SDK packages be released to npm? We need versions before updating our starter kit.
- Are there upcoming CLI commands (from the `migration-and-upgrade-command-twenty-apps` branch) that partners should adopt for metadata migrations?
- Do the composite-type moves imply we can share declaration files between Twenty and partner modules, or are there licensing considerations for redistributing `twenty-shared`?

_Next review target: late November or after the Twenty roadmap conversation, whichever comes first._

---

### Snapshot — 2025-12-24

**Context:** Synced `services/twenty-core` to `upstream/main` at `06d0ac13c4` (after upgrading the stack to `twentycrm/twenty:v1.14`).

**Highlights**

1. **CLI shift to `twenty-sdk` + new scaffolder:**
   - `packages/twenty-cli/README.md` explicitly deprecates `twenty-cli` and instructs installing `twenty-sdk` instead; the `twenty` command name remains.
   - `packages/create-twenty-app/README.md` introduces the new scaffolder with scripts for `auth`, `generate`, `dev`, `sync`, `logs`, and `uninstall`.
   - The official docs now reference `create-twenty-app` and `twenty-sdk`, with `twenty app generate` producing a fully typed client and `twenty app logs` for function logs.

2. **Application settings UI improvements:**
   - `158a7a89d5` ("extensibility improve application settings section") updates the Applications settings UX, likely aligning with the new app tooling and log visibility.

3. **App catalog growth:**
   - Community apps (e.g., `packages/twenty-apps/community/fireflies`) were substantially expanded and moved out of Hacktoberfest examples, hinting at more maintainable app templates.

**Open Questions / Follow-ups**

- Confirm how the `twenty-sdk` CLI release cadence maps to image tags (is SDK decoupled from `twenty-core` or versioned in lockstep?).
- Validate whether `twenty app logs` requires a specific role/permission or feature flag in v1.14.
- Review the new `create-twenty-app` template expectations (Node 24 + Yarn 4) vs. our local tooling.
