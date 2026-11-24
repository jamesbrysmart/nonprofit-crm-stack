import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { Response } from 'twenty-sdk/logic-function';
import {
  createDonationFormCheckoutSession,
  type CreateDonationFormCheckoutSessionRequest,
  type CreateDonationFormPaymentSessionResponse,
} from 'src/donation-forms/create-donation-form-checkout-session';
import { DonationFormSubmissionError } from 'src/donation-forms/donation-form-submission-error';
import { createCoreApiClient } from 'src/core-api/rate-limit-retry';

// The public form maps `code` to donor-facing wording; messages are for logs.
const errorResponse = (status: number, code: string) =>
  new Response({ code }, { status });

export const createDonationFormCheckoutSessionHandler = async (
  event: RoutePayload<CreateDonationFormCheckoutSessionRequest>,
): Promise<CreateDonationFormPaymentSessionResponse | Response> => {
  const body = event.body;

  if (!body) {
    return errorResponse(400, 'INVALID_SUBMISSION');
  }

  try {
    return await createDonationFormCheckoutSession({
      client: createCoreApiClient(),
      request: body,
    });
  } catch (error) {
    if (error instanceof DonationFormSubmissionError) {
      console.warn(
        JSON.stringify({
          event: 'donation_form_submission_refused',
          code: error.code,
          message: error.message,
        }),
      );

      return errorResponse(400, error.code);
    }

    console.error(
      JSON.stringify({
        event: 'donation_form_checkout_failed',
        message: error instanceof Error ? error.message : String(error),
      }),
    );

    return errorResponse(500, 'CHECKOUT_FAILED');
  }
};

export default defineLogicFunction({
  universalIdentifier: '6bd2a85e-b59b-4122-b82e-553291dddf0f',
  name: 'create-donation-form-elements-checkout-session',
  description:
    'Validates a public donation form submission, creates pre-payment gift staging, and returns Payment Element bootstrap data for the iframe donation form.',
  timeoutSeconds: 30,
  handler: createDonationFormCheckoutSessionHandler,
  httpRouteTriggerSettings: {
    path: '/donation-forms/create-elements-checkout-session',
    httpMethod: 'POST',
    isAuthRequired: false,
  },
});
