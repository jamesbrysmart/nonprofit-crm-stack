import { readFile, writeFile } from 'node:fs/promises';
import {
  GENERATED_CLIENT_MODULE_PATH,
  bundleDonationFormClient,
  renderGeneratedClientModule,
} from './donation-form-client-bundle.mjs';

const generated = renderGeneratedClientModule(await bundleDonationFormClient());
const current = await readFile(GENERATED_CLIENT_MODULE_PATH, 'utf8').catch(() => '');

if (process.argv.includes('--check')) {
  if (current !== generated) {
    console.error('Donation form client is out of date: run `yarn build:donation-form-client`.');
    process.exit(1);
  }
} else if (current !== generated) {
  await writeFile(GENERATED_CLIENT_MODULE_PATH, generated);
  console.log('Updated', GENERATED_CLIENT_MODULE_PATH);
} else {
  console.log('Donation form client is up to date.');
}
