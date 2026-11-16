import { describe, expect, it } from 'vitest';
import { resolveIntegrationTarget } from './integration-target';

describe('integration test target', () => {
  it('ignores a generic workspace target and has no default', () => {
    expect(
      resolveIntegrationTarget({
        TWENTY_API_URL: 'http://localhost:2020',
        TWENTY_API_KEY: 'dev-workspace-key',
      }),
    ).toEqual({ TWENTY_API_URL: '', TWENTY_API_KEY: '' });
  });

  it('uses only the explicitly configured integration target', () => {
    expect(
      resolveIntegrationTarget({
        TWENTY_INTEGRATION_API_URL: ' http://localhost:2021 ',
        TWENTY_INTEGRATION_API_KEY: 'disposable-key',
        TWENTY_API_URL: 'http://localhost:2020',
      }),
    ).toEqual({
      TWENTY_API_URL: 'http://localhost:2021',
      TWENTY_API_KEY: 'disposable-key',
    });
  });
});
