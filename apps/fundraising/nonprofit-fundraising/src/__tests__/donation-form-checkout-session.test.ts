import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { CoreApiClient } from 'twenty-client-sdk/core';
import {
  createDonationFormCheckoutSessionWithDependencies,
  type CreateDonationFormCheckoutSessionRequest,
  type StripeCheckoutSessionCreator,
} from 'src/donation-forms/create-donation-form-checkout-session';
import type { DonationFormPublishedConfig } from 'src/donation-forms/donation-form-config';

const form = {
  id: 'df_123',
  publicId: 'df_public_123',
  status: 'LIVE',
  paymentProvider: 'STRIPE',
  providerConfigKey: 'stripe-default',
  publishedVersion: 'pub_2026-05-20_test',
};

const baseRequest: CreateDonationFormCheckoutSessionRequest = {
  publicId: form.publicId,
  donationType: 'ONE_OFF',
  amountMinorUnits: 2500,
  donorFirstName: 'Ada',
  donorLastName: 'Lovelace',
  donorEmail: 'ada@example.org',
  donorPhone: '+44 20 7946 0958',
  supporterEmailOptOut: true,
  donorMailingAddress: {
    addressStreet1: '12 Test Street',
    addressCity: 'London',
    addressPostcode: 'SW1A 1AA',
    addressCountry: 'GB',
  },
  giftAidRequested: true,
  attribution: { referrer: 'https://charity.example.org/donate' },
};

const checkoutFixture = (config: Partial<DonationFormPublishedConfig> = {}) => {
  const mutation = vi.fn()
    .mockResolvedValueOnce({ createGiftStaging: { id: 'staging-1' } })
    .mockResolvedValueOnce({ updateGiftStaging: { id: 'staging-1' } });
  const client = {
    query: vi.fn().mockResolvedValue({
      donationForms: {
        edges: [{
          node: {
            ...form,
            publishedConfig: {
              mode: 'ONE_OFF',
              currencyCode: 'GBP',
              amountOptions: [1000, 2500, 5000],
              ...config,
            },
          },
        }],
      },
    }),
    mutation,
  } as unknown as CoreApiClient;
  const createCheckoutSession = vi.fn<StripeCheckoutSessionCreator['createCheckoutSession']>()
    .mockResolvedValue({ id: 'cs_elements', clientSecret: 'cs_secret' });

  const submit = (
    request: Partial<CreateDonationFormCheckoutSessionRequest> = {},
    publishableKey = 'pk_test_elements',
  ) =>
    createDonationFormCheckoutSessionWithDependencies({
      client,
      request: { ...baseRequest, ...request },
      dependencies: {
        stripeSessionCreator: { createCheckoutSession },
        publishableKey,
        now: new Date('2026-05-20T12:34:56.000Z'),
      },
    });

  return { submit, mutation, createCheckoutSession };
};

describe('donation form checkout', () => {
  beforeEach(() => {
    vi.stubEnv('TWENTY_API_URL', 'https://twenty.example.test');
    vi.stubEnv('TWENTY_FUNCTIONS_URL', undefined);
  });

  afterEach(() => vi.unstubAllEnvs());

  it.each([
    ['ONE_OFF_AND_MONTHLY', 'ONE_OFF', 'payment'],
    ['ONE_OFF_AND_MONTHLY', 'RECURRING', 'subscription'],
    ['RECURRING', 'RECURRING', 'subscription'],
  ] as const)('%s form correlates a %s selection with its staging row', async (mode, donationType, stripeMode) => {
    const { submit, mutation, createCheckoutSession } = checkoutFixture({
      mode,
      giftAidEnabled: true,
      giftAidTextVersion: 'ga-2026-05',
      defaultAppealSource: {
        id: 'source-1',
        appeal: {
          id: 'appeal-1',
          defaultFund: { id: 'fund-1' },
        },
      },
    });

    const result = await submit({ donationType });
    const { sourceFingerprint } = result;
    expect(result).toEqual({
      donationFormId: form.id,
      donationFormPublishedVersion: form.publishedVersion,
      giftStagingId: 'staging-1',
      checkoutSessionId: 'cs_elements',
      checkoutSessionClientSecret: 'cs_secret',
      publishableKey: 'pk_test_elements',
      sourceFingerprint: expect.stringMatching(/^dfs_/),
    });

    const metadata = {
      sourceFingerprint,
      giftStagingId: 'staging-1',
      donationFormId: form.id,
      donationFormPublishedVersion: form.publishedVersion,
      donationType,
      giftAidRequested: 'true',
      giftAidDeclarationDate: '2026-05-20',
    };
    const address = baseRequest.donorMailingAddress;
    expect(mutation).toHaveBeenCalledTimes(2);
    expect(mutation).toHaveBeenNthCalledWith(1, {
      createGiftStaging: expect.objectContaining({
        __args: {
          data: expect.objectContaining({
            sourceFingerprint,
            donationType,
            amount: { amountMicros: 25_000_000, currencyCode: 'GBP' },
            paymentType: 'CARD',
            paymentState: 'AWAITING_PAYMENT',
            ...(stripeMode === 'subscription' ? {
              providerIntervalUnit: 'month',
              providerIntervalCount: 1,
            } : {}),
            donationFormId: form.id,
            donationFormPublishedVersion: form.publishedVersion,
            appeal: { connect: { where: { id: 'appeal-1' } } },
            appealSource: { connect: { where: { id: 'source-1' } } },
            fund: { connect: { where: { id: 'fund-1' } } },
            donorPhone: baseRequest.donorPhone,
            donorMailingAddress: address,
            supporterEmailOptOut: true,
            giftAidRequested: true,
            giftAidDeclarationCaptured: true,
            giftAidDeclarationDate: '2026-05-20',
            giftAidDeclarationSource: 'donation_form_embed',
            giftAidTextVersion: 'ga-2026-05',
          }),
        },
      }),
    });
    expect(createCheckoutSession).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        mode: stripeMode,
        ui_mode: 'elements',
        client_reference_id: sourceFingerprint,
        metadata: expect.objectContaining(metadata),
        return_url: `https://twenty.example.test/s/donation-forms/embed-frame?publicId=${form.publicId}`,
        line_items: [expect.objectContaining({
          quantity: 1,
          price_data: expect.objectContaining({
            currency: 'gbp',
            unit_amount: 2500,
            ...(stripeMode === 'subscription' ? { recurring: { interval: 'month' } } : {}),
          }),
        })],
      }),
    );
    const stripeRequest = createCheckoutSession.mock.calls[0]?.[0];
    expect(stripeRequest?.billing_address_collection).toBeUndefined();
    expect(stripeRequest?.phone_number_collection).toBeUndefined();
    expect(stripeRequest?.redirect_on_completion).toBeUndefined();
    expect(stripeRequest?.success_url).toBeUndefined();
    expect(stripeRequest?.cancel_url).toBeUndefined();
    if (stripeMode === 'payment') {
      expect(stripeRequest?.line_items?.[0]?.price_data?.recurring).toBeUndefined();
    }
    expect(mutation).toHaveBeenNthCalledWith(2, {
      updateGiftStaging: expect.objectContaining({
        __args: {
          id: 'staging-1',
          data: expect.objectContaining({
            externalId: 'cs_elements',
            rawProviderEvidence: expect.objectContaining({
              checkoutSessionId: 'cs_elements',
              metadata: expect.objectContaining(metadata),
              ...(stripeMode === 'subscription'
                ? { recurring: { intervalUnit: 'month', intervalCount: 1 } }
                : {}),
              supporterEmailOptOut: true,
              attribution: baseRequest.attribution,
            }),
          }),
        },
      }),
    });
    const [stageOrder, updateOrder] = mutation.mock.invocationCallOrder;
    const [checkoutOrder] = createCheckoutSession.mock.invocationCallOrder;
    expect(stageOrder ?? NaN).toBeLessThan(checkoutOrder ?? NaN);
    expect(checkoutOrder ?? NaN).toBeLessThan(updateOrder ?? NaN);
  });

  it('allows payment without treating a Gift Aid request as a captured declaration when the address is absent', async () => {
    const { submit, mutation, createCheckoutSession } = checkoutFixture({ giftAidEnabled: true });

    await expect(submit({ donorMailingAddress: undefined })).resolves.toMatchObject({
      checkoutSessionId: 'cs_elements',
    });
    expect(mutation).toHaveBeenNthCalledWith(1, {
      createGiftStaging: expect.objectContaining({
        __args: {
          data: expect.objectContaining({
            giftAidRequested: true,
            giftAidDeclarationCaptured: false,
          }),
        },
      }),
    });
    expect(createCheckoutSession).toHaveBeenCalledOnce();
  });

  it.each([
    {
      label: 'an unlisted amount',
      request: { amountMinorUnits: 2750 },
      error: 'Donation amount is not allowed by the published donation form config',
    },
    {
      label: 'a disallowed monthly payment',
      request: { donationType: 'RECURRING' },
      error: 'Donation type is not allowed by the published donation form config',
    },
    {
      label: 'an incomplete required address',
      config: { requireAddress: true },
      request: { donorMailingAddress: { addressPostcode: 'SW1A 1AA' } },
      error: 'This donation form requires the donor address before payment',
    },
    {
      label: 'missing Stripe publishable key',
      publishableKey: '',
      error: 'Stripe publishable key is not configured',
    },
  ])('refuses $label before staging or contacting Stripe', async ({ request, config, publishableKey, error }) => {
    const { submit, mutation, createCheckoutSession } = checkoutFixture(config);

    await expect(submit(request, publishableKey)).rejects.toThrow(error);
    expect(mutation).not.toHaveBeenCalled();
    expect(createCheckoutSession).not.toHaveBeenCalled();
  });

  it.each(['ada.example.org', 'ada@', 'ada @example.org', 'ada@gmailcom'])(
    'rejects the email address %s before staging or contacting Stripe',
    async (donorEmail) => {
      const { submit, mutation, createCheckoutSession } = checkoutFixture();

      await expect(submit({ donorEmail })).rejects.toThrow(
        expect.objectContaining({ code: 'INVALID_SUBMISSION' }),
      );
      expect(mutation).not.toHaveBeenCalled();
      expect(createCheckoutSession).not.toHaveBeenCalled();
    },
  );
});
