import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { postAppRouteJson } from 'src/app-api/app-route-client';

const route = '/s/batch-processing/check-batch';
const body = { giftBatchId: 'batch-id' };
const functionsUrl = 'https://functions.example.test';

beforeEach(() => {
  vi.stubEnv('TWENTY_API_URL', 'https://workspace.example.test');
  vi.stubEnv('TWENTY_FUNCTIONS_URL', functionsUrl);
  vi.stubEnv('TWENTY_APP_ACCESS_TOKEN', 'initial-token');
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe('postAppRouteJson', () => {
  it.each([
    ['HTML gateway page', '<!DOCTYPE html><html><title>502</title></html>'],
    ['JSON gateway response', JSON.stringify({ status: 502, cloudflare_error: true })],
  ])('replaces a wrapped %s with an actionable message', async (_kind, message) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      Response.json({
        code: 'LOGIC_FUNCTION_EXECUTION_ERROR',
        messages: [message],
      }, { status: 500 }),
    ));

    await expect(postAppRouteJson(route, body)).rejects.toThrow(
      'Twenty API is temporarily unavailable (status 500). Please refresh or try again shortly.',
    );
  });

  it('keeps a validation message readable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      Response.json({ messages: ['Error: Gift batch not found'] }, { status: 400 }),
    ));

    await expect(postAppRouteJson(route, body)).rejects.toThrow(
      'Gift batch not found',
    );
  });

  it('replaces an execution ID with an actionable message', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      Response.json({
        code: 'LOGIC_FUNCTION_EXECUTION_ERROR',
        messages: ['Logic function execution failed for cae07256-313d-47ba-a317-7260055a830c'],
      }, { status: 500 }),
    ));

    await expect(postAppRouteJson(route, body)).rejects.toThrow(
      'Twenty app route failed (status 500). Please refresh or try again shortly.',
    );
  });

  it('retries an expired session once with the same request and a refreshed token', async () => {
    const requestAccessTokenRefresh = vi.fn().mockResolvedValue('fresh-token');
    vi.stubGlobal('frontComponentHostCommunicationApi', {
      requestAccessTokenRefresh,
    });
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(Response.json({ message: 'Token expired' }, { status: 401 }))
      .mockResolvedValueOnce(Response.json({ readyItems: 1 }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(postAppRouteJson(route, body)).resolves.toEqual({ readyItems: 1 });
    expect(requestAccessTokenRefresh).toHaveBeenCalledOnce();
    expect(fetchMock.mock.calls.map(([url, request]) => ({
      url,
      method: request.method,
      body: JSON.parse(request.body),
      authorization: new Headers(request.headers).get('Authorization'),
    }))).toEqual([
      {
        url: `${functionsUrl}/batch-processing/check-batch`,
        method: 'POST',
        body,
        authorization: 'Bearer initial-token',
      },
      {
        url: `${functionsUrl}/batch-processing/check-batch`,
        method: 'POST',
        body,
        authorization: 'Bearer fresh-token',
      },
    ]);
  });

  it('reports a forbidden action without refreshing the token or replaying the request', async () => {
    const requestAccessTokenRefresh = vi.fn();
    vi.stubGlobal('frontComponentHostCommunicationApi', {
      requestAccessTokenRefresh,
    });
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({ message: 'You are not authorized' }, { status: 403 }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(postAppRouteJson(route, body)).rejects.toThrow(
      'You are not authorized',
    );
    expect(requestAccessTokenRefresh).not.toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledOnce();
  });
});
