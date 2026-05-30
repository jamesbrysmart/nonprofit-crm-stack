import { createHmac } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { stripeRouteProbeHandler } from 'src/logic-functions/stripe-route-probe';

describe('stripe-route-probe', () => {
  it('prefers event.rawBody for Stripe signature verification', async () => {
    const secret = 'whsec_test_secret';
    const rawBody =
      '{"id":"evt_test","type":"checkout.session.completed","data":{"object":{"object":"checkout.session"}}}';
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = `t=${timestamp},v1=${createStripeSignature({
      secret,
      rawBody,
      timestamp,
    })}`;

    const previousSecret = process.env.STRIPE_WEBHOOK_SECRET;
    process.env.STRIPE_WEBHOOK_SECRET = secret;

    try {
      const response = await stripeRouteProbeHandler({
        headers: { 'stripe-signature': signature },
        queryStringParameters: {},
        pathParameters: {},
        body: {
          type: 'checkout.session.completed',
          id: 'evt_test',
          data: { object: { object: 'checkout.session' } },
        },
        rawBody,
        isBase64Encoded: false,
        requestContext: {
          http: {
            method: 'POST',
            path: '/s/stripe/route-probe',
          },
        },
      });

      expect(response.hasRawBody).toBe(true);
      expect(response.verificationMethod).toBe('event-raw-body');
      expect(response.verificationMatched).toBe(true);
      expect(response.verificationError).toBeNull();
    } finally {
      if (previousSecret === undefined) {
        delete process.env.STRIPE_WEBHOOK_SECRET;
      } else {
        process.env.STRIPE_WEBHOOK_SECRET = previousSecret;
      }
    }
  });
});

function createStripeSignature({
  secret,
  rawBody,
  timestamp,
}: {
  secret: string;
  rawBody: string;
  timestamp: number;
}) {
  return createHmac('sha256', secret)
    .update(`${timestamp}.${rawBody}`, 'utf8')
    .digest('hex');
}
