import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const script = fileURLToPath(
  new URL('../../scripts/stripe-intake-fixtures.mjs', import.meta.url),
);
const blockNetwork = `data:text/javascript,${encodeURIComponent(
  'globalThis.fetch = () => { throw new Error("Fixture test must not contact a workspace"); };',
)}`;

describe('Stripe fixture credentials', () => {
  it.each([
    ['', ''],
    ['http://localhost:2020', ''],
    ['', 'test-only-key'],
    [' ', ' '],
  ])('rejects incomplete explicit credentials (%s)', (apiUrl, apiKey) => {
    const result = spawnSync(process.execPath, ['--import', blockNetwork, script], {
      env: {
        ...process.env,
        TWENTY_API_URL: apiUrl,
        TWENTY_API_KEY: apiKey,
      },
      encoding: 'utf8',
      timeout: 5_000,
    });

    expect(result.error).toBeUndefined();
    expect(result.status).toBe(1);
    expect(result.stderr).toContain(
      'Set TWENTY_API_URL and TWENTY_API_KEY explicitly',
    );
    expect(result.stdout).toBe('');
  });
});
