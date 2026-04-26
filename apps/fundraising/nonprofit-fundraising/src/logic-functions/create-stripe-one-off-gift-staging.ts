import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import {
  createStripeOneOffGiftStaging,
  type StripeCheckoutSessionCompletedEvent,
  type StripeOneOffGiftStagingResult,
} from 'src/stripe/stripe-one-off-staging';

const handler = async (
  event: RoutePayload<StripeCheckoutSessionCompletedEvent>,
): Promise<StripeOneOffGiftStagingResult> => {
  const body = event.body;

  if (!body) {
    throw new Error('Stripe event body is required');
  }

  const client = new CoreApiClient();

  return createStripeOneOffGiftStaging(client, body);
};

export default defineLogicFunction({
  universalIdentifier: '4f4dc433-1a92-4cb3-9ba6-f2c5aac53c53',
  name: 'create-stripe-one-off-gift-staging',
  description:
    'Authenticated internal route that maps a verified Stripe checkout.session.completed event into a staged gift.',
  timeoutSeconds: 15,
  handler,
  httpRouteTriggerSettings: {
    path: '/stripe/intake/create-one-off-gift-staging',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
