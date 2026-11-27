import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

// Use an explicitly selected workspace that already has both apps installed.
const apiUrl = process.env.TWENTY_INTEGRATION_API_URL;
const apiKey = process.env.TWENTY_INTEGRATION_API_KEY;
if (apiUrl && apiKey) {
  process.env.TWENTY_API_URL = apiUrl;
  process.env.TWENTY_API_KEY = apiKey;
}

export default defineConfig({
  plugins: [
    tsconfigPaths({
      projects: ['tsconfig.spec.json'],
      ignoreConfigErrors: true,
    }),
  ],
  test: {
    testTimeout: 120_000,
    hookTimeout: 120_000,
    fileParallelism: false,
    include: ['src/**/*.integration-test.ts'],
    globalSetup: ['src/__tests__/global-setup.ts'],
  },
});
