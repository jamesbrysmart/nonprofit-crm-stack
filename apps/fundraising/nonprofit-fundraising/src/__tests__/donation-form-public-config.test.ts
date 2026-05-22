import { describe, expect, it } from 'vitest';
import type { CoreApiClient } from 'twenty-client-sdk/core';
import { loadPublicDonationFormConfigWithClient } from 'src/logic-functions/get-public-donation-form-config';
import { publishDonationFormWithClient } from 'src/logic-functions/publish-donation-form';

const buildClient = (overrides: {
  query?: (input: unknown) => Promise<unknown>;
  mutation?: (input: unknown) => Promise<unknown>;
}): CoreApiClient =>
  ({
    query: overrides.query ?? (async () => ({})),
    mutation: overrides.mutation ?? (async () => ({})),
  }) as CoreApiClient;

describe('publishDonationFormWithClient', () => {
  it('publishes a valid Stripe donation form by stamping public and published state', async () => {
    process.env.TWENTY_API_URL = 'https://twenty.example.test';

    const client = buildClient({
      query: async () => ({
        donationForm: {
          id: 'df_123',
          publicId: null,
          status: 'DRAFT',
          paymentProvider: 'STRIPE',
          providerConfigKey: 'stripe-default',
          config: {
            mode: 'ONE_OFF',
            currencyCode: 'GBP',
          },
        },
      }),
      mutation: async (input) => {
        const update = (input as any)?.updateDonationForm?.__args?.data;
        expect(update.status).toBe('LIVE');
        expect(update.publicId).toMatch(/^df_/);
        expect(update.publishedVersion).toMatch(/^pub_/);
        expect(update.publishedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
        expect(update.publishedConfig).toEqual({
          mode: 'ONE_OFF',
          currencyCode: 'GBP',
        });

        return {
          updateDonationForm: {
            id: 'df_123',
          },
        };
      },
    });

    const result = await publishDonationFormWithClient(client, 'df_123');

    expect(result.donationFormId).toBe('df_123');
    expect(result.publicId).toMatch(/^df_/);
    expect(result.publishedVersion).toMatch(/^pub_/);
    expect(result.status).toBe('LIVE');
    expect(result.iframeUrl).toBe(
      `https://twenty.example.test/s/donation-forms/embed-frame?publicId=${result.publicId}`,
    );
    expect(result.embedSnippet).toContain(`<iframe src="${result.iframeUrl}"`);
    expect(result.embedSnippet).toContain('allow="payment *"');
  });

  it('rejects publish when provider config key is missing', async () => {
    const client = buildClient({
      query: async () => ({
        donationForm: {
          id: 'df_123',
          paymentProvider: 'STRIPE',
          providerConfigKey: null,
          config: {
            mode: 'ONE_OFF',
          },
        },
      }),
    });

    await expect(
      publishDonationFormWithClient(client, 'df_123'),
    ).rejects.toThrow('Provider config key is required before publishing');
  });
});

describe('loadPublicDonationFormConfigWithClient', () => {
  it('returns published config for a live donation form', async () => {
    const client = buildClient({
      query: async () => ({
        donationForm: {
          id: 'df_123',
          publicId: 'df_public_123',
          status: 'LIVE',
          publishedVersion: 'pub_2026-05-20_test',
          paymentProvider: 'STRIPE',
          publishedConfig: {
            mode: 'ONE_OFF',
            currencyCode: 'GBP',
            amountOptions: [1000, 2500, 5000],
          },
        },
      }),
    });

    const result = await loadPublicDonationFormConfigWithClient(
      client,
      'df_public_123',
    );

    expect(result).toEqual({
      ok: true,
      donationFormId: 'df_123',
      publicId: 'df_public_123',
      publishedVersion: 'pub_2026-05-20_test',
      paymentProvider: 'STRIPE',
      config: {
        mode: 'ONE_OFF',
        currencyCode: 'GBP',
        amountOptions: [1000, 2500, 5000],
      },
    });
  });

  it('rejects non-live forms', async () => {
    const client = buildClient({
      query: async () => ({
        donationForm: {
          id: 'df_123',
          publicId: 'df_public_123',
          status: 'DRAFT',
          publishedVersion: 'pub_2026-05-20_test',
          paymentProvider: 'STRIPE',
          publishedConfig: {
            mode: 'ONE_OFF',
          },
        },
      }),
    });

    await expect(
      loadPublicDonationFormConfigWithClient(client, 'df_public_123'),
    ).resolves.toEqual({
      ok: false,
      reason: 'not_live',
    });
  });
});
