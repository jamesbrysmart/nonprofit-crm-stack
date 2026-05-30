import { describe, expect, it, vi } from 'vitest';
import type { CoreApiClient } from 'twenty-client-sdk/core';
import {
  createDonationFormCheckoutSessionWithDependencies,
  type CreateDonationFormCheckoutSessionRequest,
} from 'src/donation-forms/create-donation-form-checkout-session';

const buildClient = (overrides: {
  query?: (input: unknown) => Promise<unknown>;
  mutation?: (input: unknown) => Promise<unknown>;
}): CoreApiClient =>
  ({
    query: overrides.query ?? (async () => ({})),
    mutation: overrides.mutation ?? (async () => ({})),
  }) as CoreApiClient;

const baseRequest: CreateDonationFormCheckoutSessionRequest = {
  publicId: 'df_public_123',
  donationType: 'ONE_OFF',
  amountMinorUnits: 2500,
  donorFirstName: 'Ada',
  donorLastName: 'Lovelace',
  donorEmail: 'ada@example.org',
  supporterEmailOptOut: true,
  donorMailingAddress: {
    addressStreet1: '12 Test Street',
    addressCity: 'London',
    addressPostcode: 'SW1A 1AA',
    addressCountry: 'GB',
  },
  giftAidRequested: true,
  attribution: {
    referrer: 'https://charity.example.org/donate',
    utm: {
      utm_source: 'newsletter',
    },
  },
};

describe('createDonationFormCheckoutSessionWithDependencies', () => {
  process.env.TWENTY_API_URL = 'https://twenty.example.test';

  it('creates pre-payment gift staging before secure payment fields load and persists correlation metadata', async () => {
    const mutationCalls: Array<unknown> = [];
    const stripeSessionCreator = {
      createCheckoutSession: vi.fn().mockResolvedValue({
        id: 'cs_elements_123',
        clientSecret: 'cs_secret_elements_123',
      }),
    };
    const client = buildClient({
      query: async () => ({
        donationForm: {
          id: 'df_123',
          publicId: 'df_public_123',
          status: 'LIVE',
          paymentProvider: 'STRIPE',
          providerConfigKey: 'stripe-default',
          publishedVersion: 'pub_2026-05-20_test',
          publishedConfig: {
            title: 'Support our work',
            description: 'A one-off donation',
            currencyCode: 'GBP',
            amountOptions: [1000, 2500, 5000],
            thankYouMessage: 'Thanks for your donation.',
            giftAidEnabled: true,
            giftAidTextVersion: 'ga-2026-05',
            sourceAppealName: 'Spring Appeal',
          },
        },
      }),
      mutation: async (input) => {
        mutationCalls.push(input);
        const createArgs = (input as any)?.createGiftStaging?.__args?.data;
        if (createArgs) {
          expect(createArgs.paymentState).toBe('AWAITING_PAYMENT');
          expect(createArgs.donationFormId).toBe('df_123');
          expect(createArgs.donationFormPublishedVersion).toBe(
            'pub_2026-05-20_test',
          );
          expect(createArgs.amount).toEqual({
            currencyCode: 'GBP',
            amountMicros: 25_000_000,
          });
          expect(createArgs.giftAidRequested).toBe(true);
          expect(createArgs.giftAidDeclarationCaptured).toBe(true);
          expect(createArgs.giftAidDeclarationDate).toBe('2026-05-20');
          expect(createArgs.giftAidDeclarationSource).toBe(
            'donation_form_embed',
          );
          expect(createArgs.giftAidTextVersion).toBe('ga-2026-05');
          expect(createArgs.supporterEmailOptOut).toBe(true);
          return {
            createGiftStaging: {
              id: 'stg_elements_123',
            },
          };
        }

        const updateArgs = (input as any)?.updateGiftStaging?.__args;
        expect(updateArgs.id).toBe('stg_elements_123');
        expect(updateArgs.data.externalId).toBe('cs_elements_123');
        expect(updateArgs.data.rawProviderEvidence.checkoutSessionId).toBe(
          'cs_elements_123',
        );
        expect(updateArgs.data.rawProviderEvidence.metadata.giftStagingId).toBe(
          'stg_elements_123',
        );
        expect(updateArgs.data.rawProviderEvidence.supporterEmailOptOut).toBe(
          true,
        );
        expect(
          updateArgs.data.rawProviderEvidence.metadata.sourceFingerprint,
        ).toMatch(/^dfs_/);

        return {
          updateGiftStaging: {
            id: 'stg_elements_123',
          },
        };
      },
    });

    const result = await createDonationFormCheckoutSessionWithDependencies({
      client,
      request: baseRequest,
      dependencies: {
        stripeSessionCreator,
        publishableKey: 'pk_test_elements_123',
        now: new Date('2026-05-20T12:34:56.000Z'),
      },
    });

    expect(result).toEqual({
      donationFormId: 'df_123',
      donationFormPublishedVersion: 'pub_2026-05-20_test',
      giftStagingId: 'stg_elements_123',
      checkoutSessionId: 'cs_elements_123',
      checkoutSessionClientSecret: 'cs_secret_elements_123',
      publishableKey: 'pk_test_elements_123',
      sourceFingerprint: expect.stringMatching(/^dfs_/),
    });

    expect(stripeSessionCreator.createCheckoutSession).toHaveBeenCalledOnce();
    expect(mutationCalls).toHaveLength(2);

    const checkoutInput = stripeSessionCreator.createCheckoutSession.mock
      .calls[0]?.[0];
    expect(checkoutInput.client_reference_id).toMatch(/^dfs_/);
    expect(checkoutInput.metadata.giftStagingId).toBe('stg_elements_123');
    expect(checkoutInput.metadata.donationFormId).toBe('df_123');
    expect(checkoutInput.metadata.donationFormPublishedVersion).toBe(
      'pub_2026-05-20_test',
    );
    expect(checkoutInput.metadata.giftAidRequested).toBe('true');
    expect(checkoutInput.metadata.giftAidDeclarationDate).toBe('2026-05-20');
    expect(checkoutInput.ui_mode).toBe('elements');
    expect(checkoutInput.payment_method_types).toEqual(['card']);
    expect(checkoutInput.return_url).toBe(
      'https://twenty.example.test/s/donation-forms/embed-frame?publicId=df_public_123',
    );
    expect(checkoutInput.redirect_on_completion).toBeUndefined();
    expect(checkoutInput.success_url).toBeUndefined();
    expect(checkoutInput.cancel_url).toBeUndefined();
  });

  it('rejects amounts that are not allowed by the published form config', async () => {
    const client = buildClient({
      query: async () => ({
        donationForm: {
          id: 'df_123',
          publicId: 'df_public_123',
          status: 'LIVE',
          paymentProvider: 'STRIPE',
          providerConfigKey: 'stripe-default',
          publishedVersion: 'pub_2026-05-20_test',
          publishedConfig: {
            currencyCode: 'GBP',
            amountOptions: [1000, 2500, 5000],
            thankYouMessage: 'Thanks for your donation.',
          },
        },
      }),
    });

    await expect(
      createDonationFormCheckoutSessionWithDependencies({
        client,
        request: {
          ...baseRequest,
          amountMinorUnits: 2750,
        },
        dependencies: {
          stripeSessionCreator: {
            createCheckoutSession: vi.fn(),
          },
          publishableKey: 'pk_test_elements_123',
        },
      }),
    ).rejects.toThrow(
      'Donation amount is not allowed by the published donation form config',
    );
  });

  it('requires a publishable key for the Payment Element baseline', async () => {
    const client = buildClient({
      query: async () => ({
        donationForm: {
          id: 'df_123',
          publicId: 'df_public_123',
          status: 'LIVE',
          paymentProvider: 'STRIPE',
          providerConfigKey: 'stripe-default',
          publishedVersion: 'pub_2026-05-20_test',
          publishedConfig: {
            currencyCode: 'GBP',
            amountOptions: [1000, 2500, 5000],
          },
        },
      }),
    });

    await expect(
      createDonationFormCheckoutSessionWithDependencies({
        client,
        request: baseRequest,
        dependencies: {
          stripeSessionCreator: {
            createCheckoutSession: vi.fn(),
          },
        },
      }),
    ).rejects.toThrow(
      'Stripe publishable key is not configured for Payment Element donation forms',
    );
  });

  it('requires donor home address evidence before accepting a Gift Aid declaration', async () => {
    const client = buildClient({
      query: async () => ({
        donationForm: {
          id: 'df_123',
          publicId: 'df_public_123',
          status: 'LIVE',
          paymentProvider: 'STRIPE',
          providerConfigKey: 'stripe-default',
          publishedVersion: 'pub_2026-05-20_test',
          publishedConfig: {
            currencyCode: 'GBP',
            amountOptions: [1000, 2500, 5000],
            thankYouMessage: 'Thanks for your donation.',
            giftAidEnabled: true,
          },
        },
      }),
    });

    await expect(
      createDonationFormCheckoutSessionWithDependencies({
        client,
        request: {
          ...baseRequest,
          donorMailingAddress: undefined,
        },
        dependencies: {
          stripeSessionCreator: {
            createCheckoutSession: vi.fn(),
          },
          publishableKey: 'pk_test_elements_123',
          now: new Date('2026-05-20T12:34:56.000Z'),
        },
      }),
    ).rejects.toThrow(
      'Gift Aid requires the donor home address to be completed before payment.',
    );
  });

  it('does not make Stripe billing address mandatory solely because Gift Aid is selected', async () => {
    const stripeSessionCreator = {
      createCheckoutSession: vi.fn().mockResolvedValue({
        id: 'cs_elements_giftaid_123',
        clientSecret: 'cs_secret_elements_giftaid_123',
      }),
    };
    const client = buildClient({
      query: async () => ({
        donationForm: {
          id: 'df_123',
          publicId: 'df_public_123',
          status: 'LIVE',
          paymentProvider: 'STRIPE',
          providerConfigKey: 'stripe-default',
          publishedVersion: 'pub_2026-05-20_test',
          publishedConfig: {
            currencyCode: 'GBP',
            amountOptions: [1000, 2500, 5000],
            thankYouMessage: 'Thanks for your donation.',
            giftAidEnabled: true,
          },
        },
      }),
      mutation: async (input) => {
        const createArgs = (input as any)?.createGiftStaging?.__args?.data;
        if (createArgs) {
          return { createGiftStaging: { id: 'stg_giftaid_123' } };
        }

        return {
          updateGiftStaging: {
            id: 'stg_giftaid_123',
          },
        };
      },
    });

    await createDonationFormCheckoutSessionWithDependencies({
      client,
      request: baseRequest,
      dependencies: {
        stripeSessionCreator,
        publishableKey: 'pk_test_elements_123',
        now: new Date('2026-05-20T12:34:56.000Z'),
      },
    });

    const checkoutInput = stripeSessionCreator.createCheckoutSession.mock
      .calls[0]?.[0];
    expect(checkoutInput.billing_address_collection).toBe('auto');
  });

  it('creates a monthly recurring subscription-mode payment session when the published form is recurring', async () => {
    const stripeSessionCreator = {
      createCheckoutSession: vi.fn().mockResolvedValue({
        id: 'cs_elements_recurring_123',
        clientSecret: 'cs_secret_elements_recurring_123',
      }),
    };
    const client = buildClient({
      query: async () => ({
        donationForm: {
          id: 'df_recurring_123',
          publicId: 'df_public_123',
          status: 'LIVE',
          paymentProvider: 'STRIPE',
          providerConfigKey: 'stripe-default',
          publishedVersion: 'pub_2026-05-22_recurring',
          publishedConfig: {
            mode: 'RECURRING',
            title: 'Support monthly',
            description: 'A monthly donation',
            currencyCode: 'GBP',
            amountOptions: [1000, 2500, 5000],
            thankYouMessage: 'Thanks for your donation.',
            giftAidEnabled: false,
          },
        },
      }),
      mutation: async (input) => {
        const createArgs = (input as any)?.createGiftStaging?.__args?.data;
        if (createArgs) {
          expect(createArgs.donationType).toBe('RECURRING');
          expect(createArgs.paymentState).toBe('AWAITING_PAYMENT');
          expect(createArgs.providerIntervalUnit).toBe('month');
          expect(createArgs.providerIntervalCount).toBe(1);
          expect(createArgs.rawProviderEvidence.donationType).toBe('RECURRING');
          expect(createArgs.rawProviderEvidence.recurring).toEqual({
            intervalUnit: 'month',
            intervalCount: 1,
          });
          return {
            createGiftStaging: {
              id: 'stg_recurring_123',
            },
          };
        }

        return {
          updateGiftStaging: {
            id: 'stg_recurring_123',
          },
        };
      },
    });

    const result = await createDonationFormCheckoutSessionWithDependencies({
      client,
      request: {
        ...baseRequest,
        donationType: 'RECURRING',
      },
      dependencies: {
        stripeSessionCreator,
        publishableKey: 'pk_test_elements_123',
      },
    });

    expect(result.checkoutSessionId).toBe('cs_elements_recurring_123');

    const checkoutInput = stripeSessionCreator.createCheckoutSession.mock
      .calls[0]?.[0];
    expect(checkoutInput.mode).toBe('subscription');
    expect(checkoutInput.metadata.donationType).toBe('RECURRING');
    expect(checkoutInput.line_items).toEqual([
      {
        quantity: 1,
        price_data: {
          currency: 'gbp',
          unit_amount: 2500,
          recurring: {
            interval: 'month',
          },
          product_data: {
            name: 'Support monthly',
            description: 'A monthly donation',
          },
        },
      },
    ]);
  });

  it('supports one-off and monthly choices on the same published form', async () => {
    const stripeSessionCreator = {
      createCheckoutSession: vi.fn().mockResolvedValue({
        id: 'cs_elements_mixed_123',
        clientSecret: 'cs_secret_elements_mixed_123',
      }),
    };
    const client = buildClient({
      query: async () => ({
        donationForm: {
          id: 'df_mixed_123',
          publicId: 'df_public_123',
          status: 'LIVE',
          paymentProvider: 'STRIPE',
          providerConfigKey: 'stripe-default',
          publishedVersion: 'pub_2026-05-22_mixed',
          publishedConfig: {
            mode: 'ONE_OFF_AND_MONTHLY',
            title: 'Support our work',
            currencyCode: 'GBP',
            amountOptions: [1000, 2500, 5000],
            thankYouMessage: 'Thanks for your donation.',
          },
        },
      }),
      mutation: async (input) => {
        const createArgs = (input as any)?.createGiftStaging?.__args?.data;
        if (createArgs) {
          expect(createArgs.donationType).toBe('RECURRING');
          return { createGiftStaging: { id: 'stg_mixed_123' } };
        }

        return {
          updateGiftStaging: {
            id: 'stg_mixed_123',
          },
        };
      },
    });

    await createDonationFormCheckoutSessionWithDependencies({
      client,
      request: {
        ...baseRequest,
        donationType: 'RECURRING',
      },
      dependencies: {
        stripeSessionCreator,
        publishableKey: 'pk_test_elements_123',
      },
    });

    const checkoutInput = stripeSessionCreator.createCheckoutSession.mock
      .calls[0]?.[0];
    expect(checkoutInput.mode).toBe('subscription');
    expect(checkoutInput.metadata.donationType).toBe('RECURRING');
  });

  it('rejects disallowed donation types for the published form config', async () => {
    const client = buildClient({
      query: async () => ({
        donationForm: {
          id: 'df_123',
          publicId: 'df_public_123',
          status: 'LIVE',
          paymentProvider: 'STRIPE',
          providerConfigKey: 'stripe-default',
          publishedVersion: 'pub_2026-05-20_test',
          publishedConfig: {
            mode: 'ONE_OFF',
            currencyCode: 'GBP',
            amountOptions: [1000, 2500, 5000],
            thankYouMessage: 'Thanks for your donation.',
          },
        },
      }),
    });

    await expect(
      createDonationFormCheckoutSessionWithDependencies({
        client,
        request: {
          ...baseRequest,
          donationType: 'RECURRING',
        },
        dependencies: {
          stripeSessionCreator: {
            createCheckoutSession: vi.fn(),
          },
          publishableKey: 'pk_test_elements_123',
        },
      }),
    ).rejects.toThrow(
      'Donation type is not allowed by the published donation form config',
    );
  });
});
