import Stripe from 'stripe';
import type {
  DonationType,
  PublishedDonationFormForCheckout,
  StripeCheckoutSessionCreator,
  StripeCheckoutSessionInput,
} from './donation-form-checkout.types';
import { normalizeString } from 'src/utils/normalize-string';
import { buildDonationFormEmbedFrameUrl } from 'src/donation-forms/donation-form-urls';

export const DEFAULT_STRIPE_PROVIDER_CONFIG_KEY = 'stripe-default';

export const resolveStripeProviderConfigKey = (
  value: string | null | undefined,
): string => {
  const normalized = normalizeString(value);

  return normalized === '' ? DEFAULT_STRIPE_PROVIDER_CONFIG_KEY : normalized;
};

export const buildCheckoutReturnUrl = (publicId: string): string =>
  buildDonationFormEmbedFrameUrl(publicId);

export const resolveStripeApiKey = async (
  providerConfigKey: string,
): Promise<string> => {
  if (providerConfigKey !== DEFAULT_STRIPE_PROVIDER_CONFIG_KEY) {
    throw new Error(
      `Unsupported Stripe provider config key "${providerConfigKey}"`,
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
  if (providerConfigKey !== DEFAULT_STRIPE_PROVIDER_CONFIG_KEY) {
    throw new Error(
      `Unsupported Stripe provider config key "${providerConfigKey}"`,
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
}): StripeCheckoutSessionInput => {
  const config = published.config;
  const checkoutSessionInput: StripeCheckoutSessionInput = {
    mode: donationType === 'RECURRING' ? 'subscription' : 'payment',
    customer_email: donorEmail,
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
