import { afterEach, describe, expect, it, vi } from 'vitest';
import type { CoreApiClient } from 'twenty-client-sdk/core';
import { loadPublishedDonationFormForCheckout } from 'src/donation-forms/donation-form-checkout-repository';
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

afterEach(() => vi.unstubAllEnvs());

describe('publishDonationFormWithClient', () => {
  it('publishes the saved mixed checkout config and returns its embed details', async () => {
    vi.stubEnv('TWENTY_API_URL', 'https://twenty.example.test');
    vi.stubEnv('TWENTY_FUNCTIONS_URL', undefined);
    const appeal = {
      id: 'apl_123',
      name: 'Spring Appeal',
      defaultFund: { id: 'fund_123', name: 'General Fund' },
    };
    const config = {
      mode: 'ONE_OFF_AND_MONTHLY',
      currencyCode: 'GBP',
      amountOptions: [1000, 2500, 5000],
      thankYouMessage: 'Thanks for supporting our work.',
      defaultAppeal: appeal,
      defaultAppealSource: {
        id: 'src_123',
        name: 'Website Donation Page',
        appeal,
      },
    };
    const mutation = vi
      .fn()
      .mockResolvedValue({ updateDonationForm: { id: 'df_123' } });
    const client = buildClient({
      query: async () => ({
        donationForm: {
          id: 'df_123',
          publicId: null,
          status: 'DRAFT',
          paymentProvider: 'STRIPE',
          providerConfigKey: null,
          config,
        },
      }),
      mutation,
    });

    const result = await publishDonationFormWithClient(client, 'df_123');

    expect(result).toMatchObject({
      donationFormId: 'df_123',
      publicId: expect.stringMatching(/^df_/),
      publishedVersion: expect.stringMatching(/^pub_/),
      status: 'LIVE',
    });
    expect(mutation).toHaveBeenCalledExactlyOnceWith({
      updateDonationForm: {
        __args: {
          id: 'df_123',
          data: {
            status: 'LIVE',
            publicId: result.publicId,
            publishedVersion: result.publishedVersion,
            publishedAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/),
            providerConfigKey: 'stripe-default',
            publishedConfig: config,
          },
        },
        id: true,
      },
    });
    expect(result.iframeUrl).toBe(
      `https://twenty.example.test/s/donation-forms/embed-frame?publicId=${result.publicId}`,
    );
    expect(result.embedSnippet).toContain(`<iframe src="${result.iframeUrl}"`);
    expect(result.embedSnippet).toContain('allow="payment *"');
  });

  it('rejects publish when the saved config cannot accept a donation amount', async () => {
    const mutation = vi.fn();
    const client = buildClient({
      mutation,
      query: async () => ({
        donationForm: {
          id: 'df_123',
          paymentProvider: 'STRIPE',
          providerConfigKey: 'stripe-default',
          config: {
            mode: 'ONE_OFF',
            currencyCode: 'GBP',
          },
        },
      }),
    });

    await expect(
      publishDonationFormWithClient(client, 'df_123'),
    ).rejects.toThrow(
      'Donation form needs suggested amounts or a valid custom minimum before publishing',
    );
    expect(mutation).not.toHaveBeenCalled();
  });
});

describe('loadPublicDonationFormConfigWithClient', () => {
  it('reports an unknown form as not found rather than failing', async () => {
    const client = buildClient({
      query: async () => ({ donationForms: { edges: [] } }),
    });

    await expect(
      loadPublicDonationFormConfigWithClient(client, 'df_missing'),
    ).resolves.toEqual({ ok: false, reason: 'not_found' });
  });

  it.each([
    { workspaceOption: undefined, formOption: true, expected: false },
    { workspaceOption: 'true', formOption: false, expected: false },
    { workspaceOption: 'true', formOption: true, expected: true },
  ])('returns Gift Aid $expected for a live form with workspace $workspaceOption and form $formOption', async ({
    workspaceOption,
    formOption,
    expected,
  }) => {
    vi.stubEnv('GIFT_AID_ENABLED', workspaceOption);
    const client = buildClient({
      query: async () => ({
        donationForms: { edges: [{ node: {
          id: 'df_123',
          publicId: 'df_public_123',
          status: 'LIVE',
          publishedVersion: 'pub_2026-05-20_test',
          paymentProvider: 'STRIPE',
          publishedConfig: {
            mode: 'ONE_OFF',
            currencyCode: 'GBP',
            amountOptions: [1000, 2500, 5000],
            giftAidEnabled: formOption,
          },
        } }] },
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
        giftAidEnabled: expected,
      },
    });
  });

  it('rejects non-live forms', async () => {
    const client = buildClient({
      query: async () => ({
        donationForms: { edges: [{ node: {
          id: 'df_123',
          publicId: 'df_public_123',
          status: 'DRAFT',
          publishedVersion: 'pub_2026-05-20_test',
          paymentProvider: 'STRIPE',
          publishedConfig: {
            mode: 'ONE_OFF',
          },
        } }] },
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

describe('loadPublishedDonationFormForCheckout', () => {
  it('refuses an unknown form as unavailable to the donor', async () => {
    const client = buildClient({
      query: async () => ({ donationForms: { edges: [] } }),
    });

    await expect(
      loadPublishedDonationFormForCheckout(client, 'df_missing'),
    ).rejects.toThrow(expect.objectContaining({ code: 'FORM_UNAVAILABLE' }));
  });

  it('falls back to the default Stripe provider config key when the field is blank', async () => {
    const client = buildClient({
      query: async () => ({
        donationForms: { edges: [{ node: {
          id: 'df_123',
          publicId: 'df_public_123',
          status: 'LIVE',
          publishedVersion: 'pub_2026-05-20_test',
          paymentProvider: 'STRIPE',
          providerConfigKey: null,
          publishedConfig: {
            mode: 'ONE_OFF',
            currencyCode: 'GBP',
            amountOptions: [1000, 2500, 5000],
          },
        } }] },
      }),
    });

    await expect(
      loadPublishedDonationFormForCheckout(client, 'df_public_123'),
    ).resolves.toMatchObject({
      donationFormId: 'df_123',
      providerConfigKey: 'stripe-default',
    });
  });
});
