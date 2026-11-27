# Setup

Use Node.js from `.nvmrc` and Yarn 4. Install the standalone CLI globally:

```bash
npm install -g twenty
yarn install
```

This source defines the eventual cutover app. Its declarations, claim batches
and submission history belong to Gift Aid. It uses Fundraising's Gift,
intake evidence and Gift Details view. The declaration, claim and submission
definitions have their own metadata identifiers and retain the existing API
names and lifecycle fields.

For local development, start a server using the [local-server guide](https://docs.twenty.com/developers/extend/apps/getting-started/local-server).
Use a Fundraising build with the shared Gift metadata and the coordinated
cutover before applying this app. The current core app still evaluates Gift Aid
and enforces the refund guard. Its definitions use the same Gift Aid object and
field names. No organisational workspaces have Gift Aid records to migrate for
this pre-v1 cutover. Rehearse the upgrade on a disposable workspace with
representative core fundraising records and settings.

Once a workspace has the cutover build of Fundraising, apply Gift Aid with the
standard Twenty CLI commands:

```bash
twenty auth login --url https://your-workspace.twenty.com --name dev
twenty app apply --create
twenty app dev
```

The first apply registers and installs your app. Dev watches and syncs later source changes. `twenty app init` does not authenticate, start containers, or install the app.

## Validation

- `yarn lint`, `yarn typecheck` and `yarn test:unit` run local checks.
- `twenty app build` validates the package locally.
- `yarn test` exercises New Gift, declaration processing and finalization
  against the cutover pair. Set `TWENTY_INTEGRATION_API_URL`,
  `TWENTY_INTEGRATION_API_KEY` and the expected
  `TWENTY_INTEGRATION_WORKSPACE_ID` for an approved disposable workspace.
  Enable Gift Aid capture for that workspace. The suite creates fixtures
  and leaves them in that workspace.

Use the pinned Twenty client generated for the target metadata. When testing
new metadata that typed functions depend on, apply the metadata before those
function changes and regenerate the client with
`twenty app generate-client --remote <test-remote>`.
