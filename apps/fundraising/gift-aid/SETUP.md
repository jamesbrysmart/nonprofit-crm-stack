# Setup

Use Node.js from `.nvmrc` and Yarn 4. Install the standalone CLI globally:

```bash
npm install -g twenty
yarn install
```

The Gift Aid extension owns eligibility, declarations, claim batches and
submission history. It uses Fundraising's Gift, intake evidence and Gift
Details view. The declaration, claim and submission
definitions have their own metadata identifiers and retain the existing API
names and lifecycle fields.

For local development, start a server using the [local-server guide](https://docs.twenty.com/developers/extend/apps/getting-started/local-server).
Install or upgrade Fundraising first. Preview an upgrade from the pre-extraction
version with `twenty app plan` to confirm that the data deletions are limited to
the former core Gift Aid metadata. No organisational workspaces have Gift Aid
records to migrate for this pre-v1 cutover. Rehearse the upgrade on a disposable
workspace with representative core fundraising records and settings.

Apply Gift Aid with the standard Twenty CLI commands, then enable
`GIFT_AID_ENABLED` in Fundraising's workspace settings:

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

The local 2021 rehearsal on Twenty 2.59.2 used SDK 2.59.0 and CLI 2.61.0.
The in-place core upgrade retained ordinary fundraising records. Core worked
on its own. After installing Gift Aid, the paired checks exercised New Gift,
paid donation staging, draft refund cleanup, finalisation and the existing
refund block. A mock submission stored the donor address, snapshot and
response. Submission remains disabled by default.

Use the pinned Twenty client generated for the target metadata. When testing
new metadata that typed functions depend on, apply the metadata before those
function changes and regenerate the client with
`twenty app generate-client --remote <test-remote>`.

## Deferred hardening

- Fundraising rejects a refund on a gift already linked to a finalised claim.
  On Twenty 2.59.2, an overlapping refund and finalisation both succeeded.
  Submission validation blocked the resulting claim before creating an attempt.
  Review the operator's recovery path when work on the extension resumes.
- The rehearsal covered app routes and persisted outcomes. Browser and
  restricted-role journeys, Marketplace packaging and live HMRC submission
  remain for a future extension release.
