import { chmod, mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { delimiter, dirname, join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { runTwenty } from './run-twenty';

describe('standalone Twenty CLI subprocess', () => {
  let root: string;

  const writeExecutable = async (path: string, source: string) => {
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, `#!/usr/bin/env node\n${source}\n`);
    await chmod(path, 0o755);
  };

  beforeEach(async () => {
    root = await mkdtemp(join(tmpdir(), 'fundraising-twenty-cli-'));
    vi.stubEnv('TWENTY_CLI', undefined);
  });

  afterEach(async () => {
    vi.unstubAllEnvs();
    await rm(root, { recursive: true, force: true });
  });

  it('skips project binaries, forwards environment credentials, and disables prompts', async () => {
    const packageManagerBin = join(root, 'package-manager-bin');
    const projectBin = join(root, 'app', 'node_modules', '.bin');
    const globalBin = join(root, 'global-bin');

    await writeExecutable(
      join(packageManagerBin, 'twenty'),
      "console.log('wrong binary');",
    );
    await writeExecutable(
      join(projectBin, 'twenty'),
      "console.log('wrong binary');",
    );
    await writeExecutable(
      join(globalBin, 'twenty'),
      'console.log(JSON.stringify({ ok: true, data: { args: process.argv.slice(2), apiUrl: process.env.TWENTY_API_URL, apiKey: process.env.TWENTY_API_KEY } }));',
    );
    vi.stubEnv(
      'PATH',
      [packageManagerBin, projectBin, globalBin, process.env.PATH].join(delimiter),
    );
    vi.stubEnv('BERRY_BIN_FOLDER', packageManagerBin);
    vi.stubEnv('TWENTY_API_URL', 'http://localhost:2020');
    vi.stubEnv('TWENTY_API_KEY', 'test-only-key');

    await expect(runTwenty(['app', 'apply', '--create'])).resolves.toEqual({
      ok: true,
      data: {
        args: ['app', 'apply', '--create', '--json', '--no-input'],
        apiUrl: 'http://localhost:2020',
        apiKey: 'test-only-key',
      },
    });
  });

  it('honors TWENTY_CLI and returns structured failures even with a nonzero exit', async () => {
    const cliPath = join(root, 'twenty');
    await writeExecutable(
      cliPath,
      "console.log(JSON.stringify({ ok: false, error: { code: 'APP_NOT_INSTALLED', message: 'Not installed.' } })); process.exitCode = 4;",
    );
    vi.stubEnv('TWENTY_CLI', cliPath);

    await expect(runTwenty(['app', 'uninstall', '--yes'])).resolves.toEqual({
      ok: false,
      error: { code: 'APP_NOT_INSTALLED', message: 'Not installed.' },
    });
  });

  it('explains how to select the CLI when the executable is missing', async () => {
    vi.stubEnv('TWENTY_CLI', join(root, 'missing', 'twenty'));

    await expect(runTwenty(['app', 'build'])).rejects.toThrow(
      'was not found. Install the Twenty CLI globally',
    );
  });

  it('rejects output that is not JSON', async () => {
    const cliPath = join(root, 'twenty');
    await writeExecutable(
      cliPath,
      "console.log('not JSON'); process.exitCode = 1;",
    );
    vi.stubEnv('TWENTY_CLI', cliPath);

    await expect(runTwenty(['app', 'build'])).rejects.toThrow(
      'app build exited with code 1 without a JSON result',
    );
  });
});
