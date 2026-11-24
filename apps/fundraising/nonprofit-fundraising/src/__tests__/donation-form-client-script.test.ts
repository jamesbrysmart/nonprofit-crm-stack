import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import {
  GENERATED_CLIENT_MODULE_PATH,
  bundleDonationFormClient,
  renderGeneratedClientModule,
} from '../../scripts/donation-form-client-bundle.mjs';

describe('donation form client script', () => {
  it('is generated from the current TypeScript source', async () => {
    const current = await readFile(GENERATED_CLIENT_MODULE_PATH, 'utf8');

    expect(
      current,
      'run `yarn build:donation-form-client` after changing src/donation-forms/embed-client',
    ).toBe(renderGeneratedClientModule(await bundleDonationFormClient()));
  });
});
