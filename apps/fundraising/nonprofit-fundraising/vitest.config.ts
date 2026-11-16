import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';
import { resolveIntegrationTarget } from './src/__tests__/integration-target';

const target = resolveIntegrationTarget(process.env);

// Replace any inherited generic target so globalSetup and the CLI it spawns can
// only see the explicit integration target (test.env only applies to workers)
process.env.TWENTY_API_URL = target.TWENTY_API_URL;
process.env.TWENTY_API_KEY = target.TWENTY_API_KEY;

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
    env: target,
  },
});
