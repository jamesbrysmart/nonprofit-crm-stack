import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import {
  routeTrustedStripeEvent,
  type StripeEventRoutingResult,
  type TrustedStripeEvent,
} from 'src/stripe/stripe-event-router';
import { verifyStripeWebhookEvent } from 'src/stripe/stripe-webhook-verification';

export type PublicStripeWebhookResponse =
  | { received: false }
  | ({ received: true } & StripeEventRoutingResult);

const isTrustedStripeEventBody = (
  body: unknown,
): body is TrustedStripeEvent => {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return false;
  }

  const record = body as Record<string, unknown>;

  if ('id' in record && typeof record.id !== 'string') {
    return false;
  }

  if ('type' in record && typeof record.type !== 'string') {
    return false;
  }

  if (
    'data' in record &&
    record.data !== null &&
    record.data !== undefined &&
    (typeof record.data !== 'object' || Array.isArray(record.data))
  ) {
    return false;
  }

  return true;
};

export const publicStripeWebhookHandler = async (
  event: RoutePayload<TrustedStripeEvent>,
): Promise<PublicStripeWebhookResponse> => {
  const verification = verifyStripeWebhookEvent(event);

  if (!verification.ok) {
    console.warn(
      JSON.stringify({
        event: 'stripe_webhook_rejected',
        reason: verification.reason,
        eventId: verification.eventId,
        eventType: verification.eventType,
      }),
    );

    return { received: false };
  }

  const body = event.body;

  if (!isTrustedStripeEventBody(body)) {
    console.warn(
      JSON.stringify({
        event: 'stripe_webhook_rejected',
        reason: 'invalid_event_body',
        eventId: verification.eventId,
        eventType: verification.eventType,
      }),
    );

    return { received: false };
  }

  const result = await routeTrustedStripeEvent(new CoreApiClient(), body);

  if (result.action === 'DONATION_FORM_GIFT_STAGING_MISSING') {
    console.error(
      JSON.stringify({
        event: 'stripe_webhook_missing_prepayment_gift_staging',
        eventId: verification.eventId,
        eventType: verification.eventType,
        sourceFingerprint: result.result.sourceFingerprint,
        checkoutSessionId: result.result.externalId,
        providerEventId: result.result.providerEventId,
      }),
    );
  }

  console.log(
    JSON.stringify({
      event: 'stripe_webhook_processed',
      eventId: verification.eventId,
      eventType: verification.eventType,
      action: result.action,
    }),
  );

  return {
    received: true,
    ...result,
  };
};

export default defineLogicFunction({
  universalIdentifier: '611f1dc9-2db2-4946-a0b9-a84c29f6e3d5',
  name: 'handle-public-stripe-webhook',
  description:
    'Public Stripe webhook route that verifies the Stripe signature and routes verified events into the nonprofit fundraising intake paths.',
  timeoutSeconds: 15,
  handler: publicStripeWebhookHandler,
  httpRouteTriggerSettings: {
    path: '/stripe/webhook',
    httpMethod: 'POST',
    isAuthRequired: false,
    forwardedRequestHeaders: ['stripe-signature'],
  },
});
