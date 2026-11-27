import { describe, expect, it } from 'vitest';
import { MetadataApiClient } from 'twenty-client-sdk/metadata';
import { APPLICATION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import type { DuplicateCheckResponse } from 'src/manual-gift-entry/manual-gift-entry.types';
import { callAppRoute, getIntegrationApiConfig } from './test-helpers';

describe('App installation', () => {
  it('registers the fundraising app in the workspace', async () => {
    const client = new MetadataApiClient();
    const { findManyApplications } = await client.query({
      findManyApplications: {
        universalIdentifier: true,
      },
    });
    expect(findManyApplications).toContainEqual({
      universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
    });
  });

  it('requires authentication to look up potential donors', async () => {
    const path = '/s/donor-resolution/check-donor-duplicates';
    const { apiUrl } = getIntegrationApiConfig();
    const anonymous = await fetch(`${apiUrl}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
      credentials: 'omit',
      redirect: 'error',
    });

    expect([401, 403]).toContain(anonymous.status);
    await expect(callAppRoute<DuplicateCheckResponse>(path, {})).resolves
      .toMatchObject({ status: 'NO_MATCH', candidates: [] });
  });
});
