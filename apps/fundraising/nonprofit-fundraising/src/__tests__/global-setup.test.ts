import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { setup, teardown } from './global-setup';
import { runTwenty } from './run-twenty';

vi.mock('./run-twenty', () => ({ runTwenty: vi.fn() }));

const notInstalled = {
  ok: false,
  error: { code: 'APP_NOT_INSTALLED', message: 'Not installed.' },
} as const;

const uninstallFailed = {
  ok: false,
  error: { code: 'PERMISSION_DENIED', message: 'Cannot uninstall.' },
} as const;

describe('integration-test lifecycle', () => {
  beforeEach(() => {
    vi.mocked(runTwenty).mockReset();
    vi.stubEnv('TWENTY_API_URL', 'http://localhost:2020');
    vi.stubEnv('TWENTY_API_KEY', 'test-key');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null)));
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it.each([
    ['no existing installation', notInstalled],
    ['an existing installation', { ok: true, data: {} } as const],
  ])('cleans up and applies with %s', async (_description, cleanupResult) => {
    vi.mocked(runTwenty)
      .mockResolvedValueOnce(cleanupResult)
      .mockResolvedValueOnce({ ok: true, data: {} });

    await setup();

    expect(fetch).toHaveBeenCalledExactlyOnceWith('http://localhost:2020/healthz');
    expect(runTwenty).toHaveBeenNthCalledWith(1, ['app', 'uninstall', '--yes']);
    expect(runTwenty).toHaveBeenNthCalledWith(2, ['app', 'apply', '--create']);
    expect(runTwenty).toHaveBeenCalledTimes(2);
  });

  it.each(['TWENTY_API_URL', 'TWENTY_API_KEY'])('requires %s', async (name) => {
    vi.stubEnv(name, undefined);

    await expect(setup()).rejects.toThrow('must be set');
    await expect(teardown()).rejects.toThrow('must be set');
    expect(fetch).not.toHaveBeenCalled();
    expect(runTwenty).not.toHaveBeenCalled();
  });

  it('stops before app commands when the server is unreachable', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('Connection refused'));

    await expect(setup()).rejects.toThrow('Twenty server is not reachable');
    expect(runTwenty).not.toHaveBeenCalled();
  });

  it('stops before app commands when the health check fails', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 503 }));

    await expect(setup()).rejects.toThrow('returned 503');
    expect(runTwenty).not.toHaveBeenCalled();
  });

  it('does not apply when cleanup fails', async () => {
    vi.mocked(runTwenty).mockResolvedValue(uninstallFailed);

    await expect(setup()).rejects.toThrow('PERMISSION_DENIED Cannot uninstall.');
    expect(runTwenty).toHaveBeenCalledExactlyOnceWith([
      'app',
      'uninstall',
      '--yes',
    ]);
  });

  it('reports apply failures', async () => {
    vi.mocked(runTwenty)
      .mockResolvedValueOnce(notInstalled)
      .mockResolvedValueOnce({
        ok: false,
        error: { code: 'APPLY_FAILED', message: 'Apply failed.' },
      });

    await expect(setup()).rejects.toThrow(
      'App apply failed: APPLY_FAILED Apply failed.',
    );
  });

  it('reports cleanup failures during teardown', async () => {
    vi.mocked(runTwenty).mockResolvedValue(uninstallFailed);

    await expect(teardown()).rejects.toThrow('PERMISSION_DENIED Cannot uninstall.');
  });

  it('allows teardown when the app is already absent', async () => {
    vi.mocked(runTwenty).mockResolvedValue(notInstalled);

    await expect(teardown()).resolves.toBeUndefined();
  });
});
