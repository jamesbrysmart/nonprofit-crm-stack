import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import {
  createStripeRecurringGiftForConfidentMatch,
  type StripeRecurringCheckoutSessionCompletedEvent,
  type StripeRecurringFulfillmentResult,
} from 'src/stripe/stripe-recurring-fulfillment';

const handler = async (
  event: RoutePayload<StripeRecurringCheckoutSessionCompletedEvent>,
): Promise<StripeRecurringFulfillmentResult> => {
  const body = event.body;

  if (!body) {
    throw new Error('Stripe event body is required');
  }

  return createStripeRecurringGiftForConfidentMatch(new CoreApiClient(), body);
};

export default defineLogicFunction({
  universalIdentifier: 'f4ae44c4-4d6d-419c-95ac-95965bad7891',
  name: 'create-stripe-recurring-gift',
  description:
    'Authenticated internal route that creates a committed gift for a Stripe recurring payment with a confident agreement match.',
  timeoutSeconds: 15,
  handler,
  httpRouteTriggerSettings: {
    path: '/stripe/intake/create-recurring-gift',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
