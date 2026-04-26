import { CoreApiClient } from 'twenty-client-sdk/core';

const STRIPE_PROVIDER = 'STRIPE';
const STRIPE_INTAKE_SOURCE = 'stripe_webhook';
const DEFAULT_CURRENCY_CODE = 'GBP';

type StripeCheckoutSessionCustomerDetails = {
  email?: string | null;
  name?: string | null;
};

type StripeCheckoutSession = {
  id?: string;
  amount_total?: number | null;
  currency?: string | null;
  created?: number;
  customer_details?: StripeCheckoutSessionCustomerDetails | null;
  payment_intent?: string | { id?: string | null } | null;
  subscription?: string | { id?: string | null } | null;
};

export type StripeCheckoutSessionCompletedEvent = {
  id?: string;
  type?: string;
  created?: number;
  data?: {
    object?: StripeCheckoutSession | null;
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
  donorFirstName: string;
  donorLastName: string;
  donorEmail?: string;
  externalId: string;
  sourceFingerprint: string;
  provider: typeof STRIPE_PROVIDER;
  providerPaymentId?: string;
  providerAgreementId?: string;
  donorResolutionState: 'UNREVIEWED';
  hasCoreGiftIssue: false;
  isReadyForProcessing: false;
  processingStatus: 'NOT_READY';
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

const normalizeString = (value: string | null | undefined): string =>
  value?.trim() ?? '';

const formatUnixDate = (timestampSeconds: number): string =>
  new Date(timestampSeconds * 1000).toISOString().slice(0, 10);

const toCurrencyCode = (currency: string | null | undefined): string => {
  const normalized = normalizeString(currency).toUpperCase();

  return normalized === '' ? DEFAULT_CURRENCY_CODE : normalized;
};

const toAmountMicros = (amountMinorUnits: number | null | undefined): number => {
  if (!Number.isInteger(amountMinorUnits) || amountMinorUnits <= 0) {
    throw new Error('Stripe checkout session must include a positive amount_total');
  }

  return amountMinorUnits * 10_000;
};

const splitDonorName = (
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

const getProviderPaymentId = (
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

const getStripeObjectId = (
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

const buildStagingName = (donorName: string): string =>
  `Stripe donation from ${donorName}`;

const buildRecurringStagingName = (donorName: string): string =>
  `Stripe recurring donation from ${donorName}`;

export const buildStripeOneOffGiftStagingInput = (
  event: StripeCheckoutSessionCompletedEvent,
): StripeOneOffGiftStagingInput => {
  if (event.type !== 'checkout.session.completed') {
    throw new Error('Stripe one-off staging only supports checkout.session.completed');
  }

  const eventId = normalizeString(event.id);

  if (eventId === '') {
    throw new Error('Stripe event id is required for sourceFingerprint');
  }

  const session = event.data?.object;

  if (!session) {
    throw new Error('Stripe checkout.session.completed event is missing data.object');
  }

  const externalId = normalizeString(session.id);

  if (externalId === '') {
    throw new Error('Stripe checkout session id is required');
  }

  const giftDateSource = session.created ?? event.created;

  if (!Number.isInteger(giftDateSource) || giftDateSource <= 0) {
    throw new Error('Stripe event must include a valid created timestamp');
  }

  const donorName = normalizeString(session.customer_details?.name);
  const donorEmail = normalizeString(session.customer_details?.email);
  const nameParts = splitDonorName(donorName);
  const providerPaymentId = getProviderPaymentId(session.payment_intent);
  const providerAgreementId = getStripeObjectId(session.subscription);

  return {
    name: providerAgreementId
      ? buildRecurringStagingName(donorName)
      : buildStagingName(donorName),
    intakeSource: STRIPE_INTAKE_SOURCE,
    amount: {
      currencyCode: toCurrencyCode(session.currency),
      amountMicros: toAmountMicros(session.amount_total),
    },
    giftDate: formatUnixDate(giftDateSource),
    donorFirstName: nameParts.donorFirstName,
    donorLastName: nameParts.donorLastName,
    ...(donorEmail !== '' ? { donorEmail } : {}),
    externalId,
    sourceFingerprint: eventId,
    provider: STRIPE_PROVIDER,
    ...(providerPaymentId ? { providerPaymentId } : {}),
    ...(providerAgreementId ? { providerAgreementId } : {}),
    donorResolutionState: 'UNREVIEWED',
    hasCoreGiftIssue: false,
    isReadyForProcessing: false,
    processingStatus: 'NOT_READY',
  };
};

export const createStripeOneOffGiftStaging = async (
  client: CoreApiClient,
  event: StripeCheckoutSessionCompletedEvent,
): Promise<StripeOneOffGiftStagingResult> => {
  const input = buildStripeOneOffGiftStagingInput(event);
  const existingId = await findGiftStagingBySourceFingerprint(
    client,
    input.sourceFingerprint,
  );

  if (existingId) {
    return {
      created: false,
      giftStagingId: existingId,
      sourceFingerprint: input.sourceFingerprint,
      externalId: input.externalId,
    };
  }

  const result = await client.mutation({
    createGiftStaging: {
      __args: {
        data: input,
      },
      id: true,
    },
  } as any);

  const recordId = result?.createGiftStaging?.id;

  if (typeof recordId !== 'string' || recordId === '') {
    throw new Error('Create gift staging response missing id');
  }

  return {
    created: true,
    giftStagingId: recordId,
    sourceFingerprint: input.sourceFingerprint,
    externalId: input.externalId,
  };
};

export const findGiftStagingBySourceFingerprint = async (
  client: CoreApiClient,
  sourceFingerprint: string,
): Promise<string | null> => {
  const normalized = normalizeString(sourceFingerprint);

  if (normalized === '') {
    throw new Error('sourceFingerprint is required');
  }

  const result = await client.query({
    giftStagings: {
      __args: {
        first: 1,
        filter: {
          sourceFingerprint: {
            eq: normalized,
          },
        },
      },
      edges: {
        node: {
          id: true,
        },
      },
    },
  } as any);

  const recordId = result?.giftStagings?.edges?.[0]?.node?.id;

  return typeof recordId === 'string' && recordId !== '' ? recordId : null;
};
