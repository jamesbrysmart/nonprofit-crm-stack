import { afterEach, describe, expect, it, vi } from 'vitest';
import type { RoutePayload } from 'twenty-sdk/define';
import type { CreateDonationFormCheckoutSessionRequest } from 'src/donation-forms/create-donation-form-checkout-session';
import { DonationFormSubmissionError } from 'src/donation-forms/donation-form-submission-error';

const checkout = vi.hoisted(() => ({ create: vi.fn() }));

vi.mock('src/core-api/rate-limit-retry', () => ({
  createCoreApiClient: () => ({}),
}));
vi.mock('src/donation-forms/create-donation-form-checkout-session', () => ({
  createDonationFormCheckoutSession: checkout.create,
}));

import { createDonationFormCheckoutSessionHandler } from 'src/logic-functions/create-donation-form-elements-checkout-session';

const request = (
  body: CreateDonationFormCheckoutSessionRequest | null,
): RoutePayload<CreateDonationFormCheckoutSessionRequest> => ({
  userWorkspaceId: null,
  headers: {},
  queryStringParameters: {},
  pathParameters: {},
  body: body as CreateDonationFormCheckoutSessionRequest,
  isBase64Encoded: false,
  requestContext: {
    http: {
      method: 'POST',
      path: '/s/donation-forms/create-elements-checkout-session',
    },
  },
});

describe('donation form checkout route', () => {
  afterEach(() => {
    checkout.create.mockReset();
    vi.restoreAllMocks();
  });

  it('returns the payment session', async () => {
    checkout.create.mockResolvedValue({ checkoutSessionClientSecret: 'cs' });

    await expect(
      createDonationFormCheckoutSessionHandler(request({ publicId: 'df_1' })),
    ).resolves.toEqual({ checkoutSessionClientSecret: 'cs' });
  });

  it('returns 400 with the refusal code and keeps the detail in the log', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    checkout.create.mockRejectedValue(
      new DonationFormSubmissionError('INVALID_AMOUNT', 'Amount too low'),
    );

    const response = await createDonationFormCheckoutSessionHandler(
      request({ publicId: 'df_1' }),
    );

    expect(response).toMatchObject({ status: 400, body: { code: 'INVALID_AMOUNT' } });
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('Amount too low'));
  });

  it('returns 500 without internal detail for unexpected failures', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    checkout.create.mockRejectedValue(new Error('Stripe secret key is not configured'));

    const response = await createDonationFormCheckoutSessionHandler(
      request({ publicId: 'df_1' }),
    );

    expect(response).toMatchObject({ status: 500, body: { code: 'CHECKOUT_FAILED' } });
    expect(JSON.stringify(response)).not.toContain('Stripe secret key');
  });

  it('refuses an empty body', async () => {
    const response = await createDonationFormCheckoutSessionHandler(request(null));

    expect(response).toMatchObject({ status: 400 });
    expect(checkout.create).not.toHaveBeenCalled();
  });
});
