import { MetadataApiClient } from 'twenty-client-sdk/metadata';
import { APPLICATION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { FUNDRAISING_APP_UNIVERSAL_IDENTIFIER } from 'src/constants/fundraising-core';

export async function setup() {
  const { TWENTY_INTEGRATION_API_URL, TWENTY_INTEGRATION_API_KEY, TWENTY_INTEGRATION_WORKSPACE_ID } =
    process.env;

  if (!TWENTY_INTEGRATION_API_URL || !TWENTY_INTEGRATION_API_KEY || !TWENTY_INTEGRATION_WORKSPACE_ID) {
    throw new Error('Set the integration API URL, key and expected disposable workspace ID');
  }

  const client = new MetadataApiClient({
    url: `${TWENTY_INTEGRATION_API_URL.replace(/\/$/, '')}/metadata`,
    headers: { Authorization: `Bearer ${TWENTY_INTEGRATION_API_KEY}` },
  });
  const result = await client.query({
    currentWorkspace: { id: true },
    findManyApplications: { universalIdentifier: true },
  });

  if (result.currentWorkspace.id !== TWENTY_INTEGRATION_WORKSPACE_ID) {
    throw new Error('The connected workspace is not the expected integration workspace');
  }
  for (const appId of [FUNDRAISING_APP_UNIVERSAL_IDENTIFIER, APPLICATION_UNIVERSAL_IDENTIFIER]) {
    if (!result.findManyApplications.some((app) => app.universalIdentifier === appId)) {
      throw new Error(`Install both Fundraising and Gift Aid in the integration workspace (missing ${appId})`);
    }
  }
}
