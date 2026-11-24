// Donor-facing wording shared by the server-rendered form and its browser client.
export const resolveDonationTypeCopy = (donationType: string) =>
  donationType === 'RECURRING'
    ? {
        amountLegend: 'Choose your monthly amount',
        paymentHint:
          'Your card will be charged this amount every month. Card details are entered securely with Stripe.',
      }
    : {
        amountLegend: 'Choose an amount',
        paymentHint: 'Card details are entered securely with Stripe.',
      };

export const DONATION_FORM_SUBMISSION_ERROR_COPY: Record<string, string> = {
  INVALID_AMOUNT: 'Please choose a different amount and try again.',
  INVALID_SUBMISSION: 'Please check your details and try again.',
  FORM_UNAVAILABLE: 'This donation form is no longer available.',
  FORM_EXPIRED:
    'This page has been open for a while. Please reload it to continue. You have not been charged.',
};

export const DONATION_FORM_GENERIC_ERROR_COPY =
  'We could not start the secure payment. Please try again in a moment. You have not been charged.';
