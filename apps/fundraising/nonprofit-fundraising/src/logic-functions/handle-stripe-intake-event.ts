import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import {
  routeTrustedStripeEvent,
  type StripeEventRoutingResult,
  type TrustedStripeEvent,
} from 'src/stripe/stripe-event-router';

const handler = async (
  event: RoutePayload<TrustedStripeEvent>,
): Promise<StripeEventRoutingResult> => {
  const body = event.body;

  if (!body) {
    throw new Error('Stripe event body is required');
  }

  return routeTrustedStripeEvent(new CoreApiClient(), body);
};

export default defineLogicFunction({
  universalIdentifier: 'f9320458-b513-4bdd-9e61-632bed2f1314',
  name: 'handle-stripe-intake-event',
  description:
    'Authenticated internal route that classifies a trusted Stripe event into the current nonprofit fundraising intake paths.',
  timeoutSeconds: 15,
  handler,
  httpRouteTriggerSettings: {
    path: '/stripe/intake/handle-event',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
