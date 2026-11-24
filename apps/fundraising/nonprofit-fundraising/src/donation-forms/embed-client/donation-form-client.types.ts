import type { DonationFormDonationType } from 'src/donation-forms/donation-form-config';
import type { DonationFormRenderConfig } from 'src/donation-forms/donation-form-rendering';

export const DONATION_FORM_BOOTSTRAP_ELEMENT_ID = 'donation-form-bootstrap';

export type DonationFormClientBootstrap = {
  publicId: string;
  publishedVersion: string;
  config: DonationFormRenderConfig;
  donationTypeOptions: DonationFormDonationType[];
};

// The subset of Stripe.js (Checkout Sessions with Elements) that the form uses.
export type StripeCheckoutSession = {
  total?: { total?: { amount?: number } };
};

export type StripeCheckoutActions = {
  getSession: () => StripeCheckoutSession | undefined;
  confirm: (options: {
    redirect: 'if_required';
  }) => Promise<{ type: 'success' } | { type: 'error'; error?: { message?: string } }>;
};

export type StripePaymentElement = {
  mount: (selector: string) => void;
};

export type StripeCheckout = {
  createPaymentElement: (options: {
    fields: { billingDetails: { name: 'never' } };
  }) => StripePaymentElement;
  loadActions: () => Promise<
    | { type: 'success'; actions: StripeCheckoutActions }
    | { type: 'error'; error?: { message?: string } }
  >;
};

export type StripeClient = {
  initCheckoutElementsSdk: (options: {
    clientSecret: Promise<string>;
  }) => StripeCheckout;
};

export type StripeFactory = (publishableKey: string) => StripeClient;
