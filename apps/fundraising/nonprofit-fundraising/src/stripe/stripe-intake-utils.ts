import {
  DEFAULT_CURRENCY_CODE,
  type StripeCheckoutSession,
  type StripeInvoiceObject,
} from 'src/stripe/stripe-intake.types';

export const normalizeString = (value: string | null | undefined): string =>
  value?.trim() ?? '';

const hasCorrelationMetadata = (
  metadata: Record<string, string | null | undefined> | null | undefined,
): metadata is Record<string, string | null | undefined> =>
  normalizeString(metadata?.giftStagingId) !== '' ||
  normalizeString(metadata?.sourceFingerprint) !== '';

export const getInvoiceCorrelationMetadata = (
  invoice: StripeInvoiceObject,
): Record<string, string | null | undefined> | null => {
  if (hasCorrelationMetadata(invoice.metadata)) {
    return invoice.metadata;
  }

  if (hasCorrelationMetadata(invoice.parent?.subscription_details?.metadata)) {
    return invoice.parent?.subscription_details?.metadata ?? null;
  }

  const lineItemMetadata = invoice.lines?.data
    ?.map((line) => line?.metadata)
    .find((metadata) => hasCorrelationMetadata(metadata));

  return lineItemMetadata ?? null;
};

export const getInvoiceSubscriptionId = (
  invoice: StripeInvoiceObject | null | undefined,
): string | null =>
  getStripeObjectId(invoice?.subscription) ??
  getStripeObjectId(invoice?.parent?.subscription_details?.subscription) ??
  null;

export const formatUnixDate = (timestampSeconds: number): string =>
  new Date(timestampSeconds * 1000).toISOString().slice(0, 10);

export const toCurrencyCode = (currency: string | null | undefined): string => {
  const normalized = normalizeString(currency).toUpperCase();

  return normalized === '' ? DEFAULT_CURRENCY_CODE : normalized;
};

export const toAmountMicros = (
  amountMinorUnits: number | null | undefined,
): number => {
  if (!Number.isInteger(amountMinorUnits) || amountMinorUnits <= 0) {
    throw new Error('Stripe checkout session must include a positive amount_total');
  }

  return amountMinorUnits * 10_000;
};

export const splitDonorName = (
  fullName: string,
): { donorFirstName: string; donorLastName: string } => {
  const trimmed = normalizeString(fullName);

  if (trimmed === '') {
    throw new Error('Stripe checkout session must include a donor name');
  }

  const segments = trimmed.split(/\s+/).filter((segment) => segment.length > 0);
  const donorFirstName = segments[0] ?? '';
  const donorLastName = segments.slice(1).join(' ');

  if (donorFirstName === '') {
    throw new Error('Stripe checkout session must include a donor name');
  }

  return {
    donorFirstName,
    donorLastName,
  };
};

export const getProviderPaymentId = (
  paymentIntent: StripeCheckoutSession['payment_intent'],
): string | undefined => {
  if (typeof paymentIntent === 'string') {
    const normalized = normalizeString(paymentIntent);

    return normalized === '' ? undefined : normalized;
  }

  if (paymentIntent && typeof paymentIntent === 'object') {
    const normalized = normalizeString(paymentIntent.id);

    return normalized === '' ? undefined : normalized;
  }

  return undefined;
};

export const getStripeObjectId = (
  value: string | { id?: string | null } | null | undefined,
): string | undefined => {
  if (typeof value === 'string') {
    const normalized = normalizeString(value);

    return normalized === '' ? undefined : normalized;
  }

  if (value && typeof value === 'object') {
    const normalized = normalizeString(value.id);

    return normalized === '' ? undefined : normalized;
  }

  return undefined;
};
