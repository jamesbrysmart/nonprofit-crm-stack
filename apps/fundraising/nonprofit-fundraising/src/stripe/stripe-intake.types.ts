import type { MailingAddressEvidence } from 'src/gift-aid/gift-aid.types';

export const STRIPE_PROVIDER = 'STRIPE';
export const STRIPE_INTAKE_SOURCE = 'stripe_webhook';
export const STRIPE_GIFT_AID_SOURCE = 'stripe_checkout';
export const DEFAULT_CURRENCY_CODE = 'GBP';

export type StripeCheckoutSessionCustomerDetails = {
  email?: string | null;
  name?: string | null;
  phone?: string | null;
  address?: {
    line1?: string | null;
    line2?: string | null;
    city?: string | null;
    state?: string | null;
    postal_code?: string | null;
    country?: string | null;
  } | null;
};

export type StripeCheckoutSessionCustomField = {
  key?: string | null;
  text?: {
    value?: string | null;
  } | null;
  numeric?: {
    value?: string | null;
  } | null;
  dropdown?: {
    value?: string | null;
  } | null;
} | null;

export type StripeRecurringPriceEvidence = {
  recurring?: {
    interval?: string | null;
    interval_count?: number | null;
  } | null;
} | null;

export type StripeSubscriptionEvidence = {
  id?: string | null;
  metadata?: Record<string, string | null | undefined> | null;
  latest_invoice?:
    | string
    | {
        id?: string | null;
        payment_intent?: string | { id?: string | null } | null;
      }
    | null;
  items?: {
    data?: Array<{
      price?: StripeRecurringPriceEvidence;
    } | null>;
  } | null;
};

export type StripeCheckoutSession = {
  id?: string;
  amount_total?: number | null;
  currency?: string | null;
  created?: number;
  customer?: string | { id?: string | null } | null;
  customer_details?: StripeCheckoutSessionCustomerDetails | null;
  custom_fields?: StripeCheckoutSessionCustomField[] | null;
  metadata?: Record<string, string | null | undefined> | null;
  payment_intent?: string | { id?: string | null } | null;
  subscription?: string | StripeSubscriptionEvidence | null;
};

export type StripeInvoiceObject = {
  id?: string | null;
  currency?: string | null;
  total?: number | null;
  customer?: string | { id?: string | null } | null;
  customer_email?: string | null;
  payment_intent?: string | { id?: string | null } | null;
  subscription?: string | { id?: string | null } | null;
  metadata?: Record<string, string | null | undefined> | null;
  parent?: {
    subscription_details?: {
      metadata?: Record<string, string | null | undefined> | null;
      subscription?: string | { id?: string | null } | null;
    } | null;
  } | null;
  lines?: {
    data?: Array<{
      metadata?: Record<string, string | null | undefined> | null;
    } | null>;
  } | null;
};

export type PaymentEconomicsCurrencyAmount = {
  amountMicros: number;
  currencyCode: string;
};

export type RawProviderEvidence = {
  provider: 'STRIPE';
  eventType: string;
  checkoutSessionId?: string;
  invoiceId?: string;
  sourceFingerprint?: string;
  customerId?: string;
  paymentIntentId?: string;
  subscriptionId?: string;
  metadata?: Record<string, string>;
  customFields?: Record<string, string>;
  giftAid?: {
    requested?: boolean;
    declarationCaptured?: boolean;
    declarationDate?: string;
    declarationSource?: string;
    textVersion?: string;
    coverageScope?: string;
  };
  customerDetails?: {
    name?: string;
    email?: string;
    phone?: string;
    address?: MailingAddressEvidence;
  };
  recurring?: {
    intervalUnit?: string;
    intervalCount?: number;
  };
  paymentEconomicsLookup?: {
    attempted: boolean;
    path: string;
    subscriptionId?: string;
    latestInvoiceId?: string;
    paymentIntentId?: string;
    paymentIntentIdFound?: boolean;
    latestChargeId?: string;
    latestChargeIdFound?: boolean;
    balanceTransactionId?: string;
    balanceTransactionIdFound?: boolean;
    reason?: string;
  };
  paymentEconomics?: {
    paymentIntentId: string;
    latestChargeId?: string;
    balanceTransactionId?: string;
    grossPaymentAmount?: PaymentEconomicsCurrencyAmount;
    processingFeeAmount?: PaymentEconomicsCurrencyAmount;
    netReceivedAmount?: PaymentEconomicsCurrencyAmount;
  };
};

export type StripeCheckoutSessionCompletedEvent = {
  id?: string;
  type?: string;
  created?: number;
  data?: {
    object?: StripeCheckoutSession | null;
  } | null;
};

export type StripeInvoicePaymentPaidObject = {
  id?: string | null;
  amount_paid?: number | null;
  currency?: string | null;
  invoice?: string | StripeInvoiceObject | null;
  payment?: {
    type?: 'charge' | 'payment_intent' | 'payment_record' | null;
    payment_intent?: string | { id?: string | null } | null;
  } | null;
  status?: string | null;
};

export type StripeInvoicePaymentPaidEvent = {
  id?: string;
  type?: string;
  created?: number;
  data?: {
    object?: StripeInvoicePaymentPaidObject | null;
  } | null;
};

export type StripeOneOffGiftStagingInput = {
  name: string;
  intakeSource: typeof STRIPE_INTAKE_SOURCE;
  amount: {
    currencyCode: string;
    amountMicros: number;
  };
  giftDate: string;
  donationType: 'ONE_OFF' | 'RECURRING';
  paymentType: 'CARD';
  donorFirstName: string;
  donorLastName: string;
  donorEmail?: string;
  donorPhone?: string;
  externalId: string;
  sourceFingerprint: string;
  providerEventId: string;
  provider: typeof STRIPE_PROVIDER;
  providerPaymentId?: string;
  paymentProviderCustomerId?: string;
  providerAgreementId?: string | null;
  providerIntervalUnit?: string;
  providerIntervalCount?: number;
  donorMailingAddress?: MailingAddressEvidence;
  sourceAppealName?: string;
  sourceFundName?: string;
  rawProviderEvidence?: RawProviderEvidence;
  donorResolutionState: 'UNREVIEWED';
  giftReadyStatus: 'NEEDS_REVIEW';
  processingStatus: 'NOT_PROCESSED';
};

export type StripeOneOffGiftStagingResult =
  | {
      created: true;
      giftStagingId: string;
      sourceFingerprint: string;
      externalId: string;
    }
  | {
      created: false;
      giftStagingId: string;
      sourceFingerprint: string;
      externalId: string;
    };

export type StripeDonationFormGiftStagingUpdateResult =
  | {
      updated: true;
      giftStagingId: string;
      sourceFingerprint: string;
      externalId: string;
    }
  | {
      updated: false;
      reason: 'MISSING_PREPAYMENT_GIFT_STAGING';
      sourceFingerprint: string;
      externalId: string;
      providerEventId: string;
    };

export type GiftStagingLookupRecord = {
  id: string;
  rawProviderEvidence?: Record<string, unknown> | null;
};

export type StripePaymentEconomicsEvidence = {
  paymentIntentId: string;
  latestChargeId?: string;
  balanceTransactionId?: string;
  grossPaymentAmount?: PaymentEconomicsCurrencyAmount;
  processingFeeAmount?: PaymentEconomicsCurrencyAmount;
  netReceivedAmount?: PaymentEconomicsCurrencyAmount;
};

export type StripePaymentEconomicsRetriever = {
  retrievePaymentEconomics: (
    session: StripeCheckoutSession,
  ) => Promise<StripePaymentEconomicsEvidence | null>;
  retrievePaymentEconomicsFromPaymentIntentId: (
    paymentIntentId: string,
  ) => Promise<StripePaymentEconomicsEvidence | null>;
  retrieveInvoiceById: (
    invoiceId: string,
  ) => Promise<StripeInvoiceObject | null>;
  retrieveInvoicePaymentById: (
    invoicePaymentId: string,
  ) => Promise<StripeInvoicePaymentPaidObject | null>;
  findSubscriptionMetadata: (
    subscriptionId: string,
  ) => Promise<Record<string, string | null | undefined> | null>;
};

export type StripeOneOffStagingDependencies = {
  paymentEconomicsRetriever?: StripePaymentEconomicsRetriever | null;
};
