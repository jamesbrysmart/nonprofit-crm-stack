import Stripe from 'stripe';
import { normalizeDonationFormString } from './donation-form-config';
import type {
  DonationType,
  PublishedDonationFormForCheckout,
  StripeCheckoutSessionCreator,
} from './donation-form-checkout.types';

const normalizeString = normalizeDonationFormString;

export const buildCheckoutReturnUrl = (publicId: string): string => {
  const baseUrl = process.env.TWENTY_API_URL?.trim();

  if (!baseUrl) {
    throw new Error('TWENTY_API_URL is required to create donation form payment sessions');
  }

  const returnUrl = new URL('/s/donation-forms/embed-frame', baseUrl);
  returnUrl.searchParams.set('publicId', publicId);

  return returnUrl.toString();
};

export const resolveStripeApiKey = async (
  providerConfigKey: string,
): Promise<string> => {
  if (providerConfigKey !== 'stripe-default') {
    throw new Error(
      `Unsupported Stripe provider config key "${providerConfigKey}" in this spike`,
    );
  }

  const apiKey = normalizeString(
    process.env.STRIPE_SECRET_KEY,
  );

  if (apiKey === '') {
    throw new Error('Stripe secret key is not configured');
  }

  return apiKey;
};

export const resolveStripePublishableKey = (providerConfigKey: string): string => {
  if (providerConfigKey !== 'stripe-default') {
    throw new Error(
      `Unsupported Stripe provider config key "${providerConfigKey}" in this spike`,
    );
  }

  const publishableKey = normalizeString(process.env.STRIPE_PUBLISHABLE_KEY);

  if (publishableKey === '') {
    throw new Error(
      'Stripe publishable key is not configured for Payment Element donation forms',
    );
  }

  return publishableKey;
};

export const createStripeSessionCreator = (
  stripeApiKey: string,
): StripeCheckoutSessionCreator => {
  const stripe = new Stripe(stripeApiKey);

  return {
    createCheckoutSession: async (input) => {
      const session = await stripe.checkout.sessions.create(input);

      if (normalizeString(session.id) === '') {
        throw new Error('Stripe checkout session response missing id');
      }

      return {
        id: session.id,
        url: session.url,
        clientSecret: session.client_secret,
      };
    },
  };
};

export const buildStripeCheckoutSessionInput = ({
  published,
  donationType,
  donorEmail,
  currencyCode,
  amountMinorUnits,
  metadata,
  sourceFingerprint,
}: {
  published: PublishedDonationFormForCheckout;
  donationType: DonationType;
  donorEmail: string;
  currencyCode: string;
  amountMinorUnits: number;
  metadata: Record<string, string>;
  sourceFingerprint: string;
}): Stripe.Checkout.SessionCreateParams => {
  const config = published.config;
  const checkoutSessionInput: Stripe.Checkout.SessionCreateParams = {
    mode: donationType === 'RECURRING' ? 'subscription' : 'payment',
    customer_email: donorEmail,
    billing_address_collection:
      config.requireAddress === true ? 'required' : 'auto',
    phone_number_collection: {
      enabled: config.collectPhone === true,
    },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: currencyCode,
          unit_amount: amountMinorUnits,
          ...(donationType === 'RECURRING'
            ? {
                recurring: {
                  interval: 'month',
                },
              }
            : {}),
          product_data: {
            name:
              normalizeString(config.title) ||
              (donationType === 'RECURRING' ? 'Monthly donation' : 'Donation'),
            ...(normalizeString(config.description) !== ''
              ? { description: normalizeString(config.description) }
              : {}),
          },
        },
      },
    ],
    metadata,
    client_reference_id: sourceFingerprint,
    ...(donationType === 'RECURRING'
      ? {
          subscription_data: {
            metadata,
          },
        }
      : {}),
  };

  checkoutSessionInput.ui_mode = 'elements';
  checkoutSessionInput.payment_method_types = ['card'];
  checkoutSessionInput.return_url = buildCheckoutReturnUrl(published.publicId);

  return checkoutSessionInput;
};
