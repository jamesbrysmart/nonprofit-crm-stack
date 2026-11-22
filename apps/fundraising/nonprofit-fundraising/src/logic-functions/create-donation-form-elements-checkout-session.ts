import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import {
  createDonationFormCheckoutSession,
  type CreateDonationFormCheckoutSessionRequest,
  type CreateDonationFormPaymentSessionResponse,
} from 'src/donation-forms/create-donation-form-checkout-session';
import { createCoreApiClient } from 'src/core-api/rate-limit-retry';

const handler = async (
  event: RoutePayload<CreateDonationFormCheckoutSessionRequest>,
): Promise<CreateDonationFormPaymentSessionResponse> => {
  const body = event.body;

  if (!body) {
    throw new Error('Donation form submit body is required');
  }

  return createDonationFormCheckoutSession({
    client: createCoreApiClient(),
    request: body,
  });
};

export default defineLogicFunction({
  universalIdentifier: '6bd2a85e-b59b-4122-b82e-553291dddf0f',
  name: 'create-donation-form-elements-checkout-session',
  description:
    'Validates a public donation form submission, creates pre-payment gift staging, and returns Payment Element bootstrap data for the iframe donation form.',
  timeoutSeconds: 30,
  handler,
  httpRouteTriggerSettings: {
    path: '/donation-forms/create-elements-checkout-session',
    httpMethod: 'POST',
    isAuthRequired: false,
  },
});
