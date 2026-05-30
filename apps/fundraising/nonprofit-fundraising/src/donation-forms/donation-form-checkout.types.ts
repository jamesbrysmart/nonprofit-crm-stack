import type Stripe from 'stripe';
import type { DonationFormDonationType, DonationFormPublishedConfig } from './donation-form-config';

export type DonationFormMailingAddress = {
  addressStreet1?: string | null;
  addressStreet2?: string | null;
  addressCity?: string | null;
  addressState?: string | null;
  addressPostcode?: string | null;
  addressCountry?: string | null;
};

export type CreateDonationFormCheckoutSessionRequest = {
  publicId?: string;
  donationType?: string;
  amountMinorUnits?: number;
  donorFirstName?: string;
  donorLastName?: string;
  donorEmail?: string;
  donorPhone?: string;
  donorMailingAddress?: DonationFormMailingAddress | null;
  giftAidRequested?: boolean;
  supporterEmailOptOut?: boolean;
  attribution?: {
    sourceAppealName?: string;
    sourceFundName?: string;
    referrer?: string;
    utm?: Record<string, string>;
    embedContext?: Record<string, unknown>;
  };
};

export type CreateDonationFormPaymentSessionResponse = {
  donationFormId: string;
  donationFormPublishedVersion: string;
  giftStagingId: string;
  checkoutSessionId: string;
  checkoutSessionClientSecret: string;
  publishableKey: string;
  sourceFingerprint: string;
};

export type DonationType = DonationFormDonationType;

export type StripeSessionResult = {
  id: string;
  url?: string | null;
  clientSecret?: string | null;
};

export type StripeCheckoutSessionCreator = {
  createCheckoutSession: (
    input: Stripe.Checkout.SessionCreateParams,
  ) => Promise<StripeSessionResult>;
};

export type DonationFormCheckoutDependencyOptions = {
  stripeSessionCreator: StripeCheckoutSessionCreator;
  now?: Date;
  publishableKey?: string;
};

export type PublishedDonationFormForCheckout = {
  donationFormId: string;
  publicId: string;
  publishedVersion: string;
  providerConfigKey: string;
  config: DonationFormPublishedConfig;
};
