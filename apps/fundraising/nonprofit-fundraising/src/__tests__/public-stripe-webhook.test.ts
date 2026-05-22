import { createHmac } from 'node:crypto';
import { describe, expect, it, vi } from 'vitest';
import type { RoutePayload } from 'twenty-sdk/define';
import {
  publicStripeWebhookHandler,
  type PublicStripeWebhookResponse,
} from 'src/logic-functions/handle-public-stripe-webhook';
import * as stripeEventRouter from 'src/stripe/stripe-event-router';

const buildCheckoutSessionEvent = (): RoutePayload<stripeEventRouter.TrustedStripeEvent> => {
  const rawBody =
    '{"id":"evt_public_test","type":"checkout.session.completed","data":{"object":{"id":"cs_public_test","subscription":"sub_public_test"}}}';

  return {
    headers: {
      'stripe-signature': `t=1714000000,v1=${createStripeSignature(rawBody)}`,
    },
    queryStringParameters: {},
    pathParameters: {},
    body: {
      id: 'evt_public_test',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_public_test',
          subscription: 'sub_public_test',
        },
      },
    },
    rawBody,
    isBase64Encoded: false,
    requestContext: {
      http: {
        method: 'POST',
        path: '/s/stripe/webhook',
      },
    },
  };
};

describe('handle-public-stripe-webhook', () => {
  it('rejects invalid signatures without routing the event', async () => {
    const routeSpy = vi.spyOn(stripeEventRouter, 'routeTrustedStripeEvent');
    const event = buildCheckoutSessionEvent();
    event.headers['stripe-signature'] = 't=1714000000,v1=bad_signature';

    const previousSecret = process.env.STRIPE_WEBHOOK_SECRET;
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_public_test';

    try {
      const response = await publicStripeWebhookHandler(event);

      expect(response).toEqual({ received: false });
      expect(routeSpy).not.toHaveBeenCalled();
    } finally {
      restoreSecret(previousSecret);
    }
  });

  it('routes verified events into the existing Stripe event router', async () => {
    const routerResult: stripeEventRouter.StripeEventRoutingResult = {
      action: 'CREATE_RECURRING_GIFT_STAGING',
      result: {
        created: true,
        giftStagingId: 'gift-staging-id',
        sourceFingerprint: 'evt_public_test',
        externalId: 'cs_public_test',
        providerAgreementId: 'sub_public_test',
      },
    };
    const routeSpy = vi
      .spyOn(stripeEventRouter, 'routeTrustedStripeEvent')
      .mockResolvedValue(routerResult);

    const previousSecret = process.env.STRIPE_WEBHOOK_SECRET;
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_public_test';

    try {
      const response = await publicStripeWebhookHandler(
        buildCheckoutSessionEvent(),
      );

      expect(response).toEqual({
        received: true,
        ...routerResult,
      } satisfies PublicStripeWebhookResponse);
      expect(routeSpy).toHaveBeenCalledOnce();
      expect(routeSpy.mock.calls[0]?.[1]).toEqual({
        id: 'evt_public_test',
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_public_test',
            subscription: 'sub_public_test',
          },
        },
      });
    } finally {
      restoreSecret(previousSecret);
    }
  });

  it('rejects verified requests when the parsed body is not a Stripe event object', async () => {
    const routeSpy = vi.spyOn(stripeEventRouter, 'routeTrustedStripeEvent');
    const event = buildCheckoutSessionEvent();
    event.body = 'not-a-parsed-object' as never;

    const previousSecret = process.env.STRIPE_WEBHOOK_SECRET;
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_public_test';

    try {
      const response = await publicStripeWebhookHandler(event);

      expect(response).toEqual({ received: false });
      expect(routeSpy).not.toHaveBeenCalled();
    } finally {
      restoreSecret(previousSecret);
    }
  });

  it('logs an explicit operational error when Stripe confirms payment but the pre-payment staging row is missing', async () => {
    const routerResult: stripeEventRouter.StripeEventRoutingResult = {
      action: 'DONATION_FORM_GIFT_STAGING_MISSING',
      result: {
        updated: false,
        reason: 'MISSING_PREPAYMENT_GIFT_STAGING',
        sourceFingerprint: 'dfs_missing_public_test',
        externalId: 'cs_public_test',
        providerEventId: 'evt_public_test',
      },
    };
    vi.spyOn(stripeEventRouter, 'routeTrustedStripeEvent').mockResolvedValue(
      routerResult,
    );
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const previousSecret = process.env.STRIPE_WEBHOOK_SECRET;
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_public_test';

    try {
      const response = await publicStripeWebhookHandler(
        buildCheckoutSessionEvent(),
      );

      expect(response).toEqual({
        received: true,
        ...routerResult,
      } satisfies PublicStripeWebhookResponse);
      expect(errorSpy).toHaveBeenCalledOnce();
      expect(errorSpy.mock.calls[0]?.[0]).toContain(
        'stripe_webhook_missing_prepayment_gift_staging',
      );
    } finally {
      errorSpy.mockRestore();
      restoreSecret(previousSecret);
    }
  });
});

function createStripeSignature(rawBody: string) {
  return createHmac('sha256', 'whsec_public_test')
    .update(`1714000000.${rawBody}`, 'utf8')
    .digest('hex');
}

function restoreSecret(previousSecret: string | undefined) {
  if (previousSecret === undefined) {
    delete process.env.STRIPE_WEBHOOK_SECRET;
    return;
  }

  process.env.STRIPE_WEBHOOK_SECRET = previousSecret;
}
