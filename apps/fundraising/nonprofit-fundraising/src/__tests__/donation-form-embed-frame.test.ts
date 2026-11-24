import { afterEach, describe, expect, it, vi } from 'vitest';
import type { RoutePayload } from 'twenty-sdk/define';

const loader = vi.hoisted(() => ({ load: vi.fn() }));

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: vi.fn(function () {
    return {};
  }),
}));
vi.mock('src/logic-functions/get-public-donation-form-config', () => ({
  loadPublicDonationFormConfigWithClient: loader.load,
}));
vi.mock('src/donation-forms/build-donation-form-embed-document', () => ({
  buildDonationFormEmbedDocument: () => '<!doctype html><title>Donate</title>',
}));
vi.mock('src/donation-forms/donation-form-rendering', () => ({
  buildDonationFormStaticDocument: () => '<!doctype html><title>Unavailable</title>',
}));

import { donationFormEmbedFrameHandler } from 'src/logic-functions/get-donation-form-embed-frame';

const embedRequest = (publicId: string): RoutePayload<Record<string, never>> => ({
  userWorkspaceId: null,
  headers: {},
  queryStringParameters: { publicId },
  pathParameters: {},
  body: null as unknown as Record<string, never>,
  isBase64Encoded: false,
  requestContext: {
    http: { method: 'GET', path: '/s/donation-forms/embed-frame' },
  },
});

describe('donation form embed frame', () => {
  afterEach(() => {
    loader.load.mockReset();
  });

  it('serves the published form as HTML', async () => {
    loader.load.mockResolvedValue({
      ok: true,
      publicId: 'df_test',
      publishedVersion: 1,
      config: {},
    });

    const response = await donationFormEmbedFrameHandler(embedRequest('df_test'));

    expect(response.headers).toEqual({
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store',
    });
    expect(response.body).toBe('<!doctype html><title>Donate</title>');
  });

  it('serves the unavailable page as HTML', async () => {
    loader.load.mockResolvedValue({ ok: false, reason: 'not_found' });

    const response = await donationFormEmbedFrameHandler(embedRequest('df_missing'));

    expect(response.headers).toEqual({
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store',
    });
    expect(response.body).toBe('<!doctype html><title>Unavailable</title>');
  });
});
