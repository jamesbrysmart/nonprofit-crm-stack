import { afterEach, describe, expect, it, vi } from 'vitest';
import { postAppRouteJson } from 'src/app-api/app-route-client';

const originalEnv = { ...process.env };

const configureAppApi = () => {
  process.env.TWENTY_API_URL = 'https://api.example.test';
  process.env.TWENTY_APP_ACCESS_TOKEN = 'test-token';
};

afterEach(() => {
  vi.unstubAllGlobals();
  process.env = { ...originalEnv };
});

describe('postAppRouteJson', () => {
  it('does not expose HTML gateway responses in thrown messages', async () => {
    configureAppApi();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        text: () =>
          Promise.resolve(
            JSON.stringify({
              statusCode: 500,
              error: 'Error',
              messages: [
                'Bad Gateway: <!DOCTYPE html><html><head><title>twenty.com | 502: Bad gateway</title></head><body>Cloudflare</body></html>',
              ],
              code: 'LOGIC_FUNCTION_EXECUTION_ERROR',
            }),
          ),
      }),
    );

    await expect(postAppRouteJson('/s/funds/options', {})).rejects.toThrow(
      'Twenty API is temporarily unavailable (status 500). Please refresh or try again shortly.',
    );
  });

  it('keeps plain application errors readable', async () => {
    configureAppApi();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        text: () =>
          Promise.resolve(
            JSON.stringify({
              statusCode: 400,
              messages: ['Error: Missing required field'],
            }),
          ),
      }),
    );

    await expect(postAppRouteJson('/s/funds/options', {})).rejects.toThrow(
      'Missing required field',
    );
  });

  it('does not expose generic logic function execution identifiers', async () => {
    configureAppApi();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        text: () =>
          Promise.resolve(
            JSON.stringify({
              statusCode: 500,
              error: 'Error',
              messages: [
                'Logic function execution failed for cae07256-313d-47ba-a317-7260055a830c',
              ],
              code: 'LOGIC_FUNCTION_EXECUTION_ERROR',
            }),
          ),
      }),
    );

    await expect(postAppRouteJson('/s/funds/options', {})).rejects.toThrow(
      'Twenty app route failed (status 500). Please refresh or try again shortly.',
    );
  });

  it('does not expose nested Cloudflare JSON gateway responses', async () => {
    configureAppApi();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        text: () =>
          Promise.resolve(
            JSON.stringify({
              statusCode: 500,
              error: 'Error',
              messages: [
                JSON.stringify({
                  title: 'Error 502: Bad gateway',
                  status: 502,
                  error_code: 502,
                  error_name: 'origin_bad_gateway',
                  cloudflare_error: true,
                  retryable: true,
                  retry_after: 60,
                }),
              ],
              code: 'LOGIC_FUNCTION_EXECUTION_ERROR',
            }),
          ),
      }),
    );

    await expect(
      postAppRouteJson('/s/batch-processing/check-batch', {
        giftBatchId: 'batch-id',
      }),
    ).rejects.toThrow(
      'Twenty API is temporarily unavailable (status 500). Please refresh or try again shortly.',
    );
  });
});
