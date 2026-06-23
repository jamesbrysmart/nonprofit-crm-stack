import { CoreApiClient } from 'twenty-client-sdk/core';
import {
  extractConnectionNodes,
  extractMutationRecord,
} from 'src/core-api/core-api-results';
import { recomputeDonorRollups } from 'src/donor-rollups/donor-rollups';
import { advanceRecurringAgreementExpectation } from 'src/recurring/recurring.service';
import {
  createStripeOneOffGiftStaging,
  type StripeOneOffGiftStagingResult,
} from 'src/stripe/stripe-one-off-staging';

const STRIPE_PROVIDER = 'STRIPE';
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

export type StripeRecurringCheckoutSessionCompletedEvent = {
  id?: string;
  type?: string;
  created?: number;
  data?: {
    object?: StripeCheckoutSession | null;
  } | null;
};

type MatchedRecurringAgreement = {
  id: string;
  name: string | null;
  providerAgreementId: string | null;
  person: {
    id: string;
    name?: {
      firstName?: string | null;
      lastName?: string | null;
    } | null;
    emails?: {
      primaryEmail?: string | null;
    } | null;
  } | null;
};

export type StripeRecurringFulfillmentResult =
  | {
      created: true;
      giftId: string;
      recurringAgreementId: string;
      sourceFingerprint: string;
      externalId: string;
      nextExpectedAt: string;
    }
  | {
      created: false;
      reason:
        | 'DUPLICATE_SOURCE_FINGERPRINT'
        | 'NO_STRIPE_SUBSCRIPTION'
        | 'NO_CONFIDENT_RECURRING_AGREEMENT_MATCH'
        | 'MATCHED_AGREEMENT_MISSING_DONOR';
      giftId?: string;
      recurringAgreementId?: string;
      sourceFingerprint: string;
      externalId: string;
      providerAgreementId: string | null;
    };

export type StripeRecurringUnmatchedStagingResult =
  | {
      created: true;
      giftStagingId: string;
      sourceFingerprint: string;
      externalId: string;
      providerAgreementId: string;
    }
  | {
      created: false;
      giftStagingId: string;
      sourceFingerprint: string;
      externalId: string;
      providerAgreementId: string;
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
  if (
    typeof amountMinorUnits !== 'number' ||
    !Number.isInteger(amountMinorUnits) ||
    amountMinorUnits <= 0
  ) {
    throw new Error('Stripe checkout session must include a positive amount_total');
  }

  return amountMinorUnits * 10_000;
};

const getStripeObjectId = (
  value: string | { id?: string | null } | null | undefined,
): string | null => {
  if (typeof value === 'string') {
    const normalized = normalizeString(value);

    return normalized === '' ? null : normalized;
  }

  if (value && typeof value === 'object') {
    const normalized = normalizeString(value.id);

    return normalized === '' ? null : normalized;
  }

  return null;
};

const getEventParts = (event: StripeRecurringCheckoutSessionCompletedEvent) => {
  if (event.type !== 'checkout.session.completed') {
    throw new Error(
      'Stripe recurring fulfillment only supports checkout.session.completed',
    );
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

  if (
    typeof giftDateSource !== 'number' ||
    !Number.isInteger(giftDateSource) ||
    giftDateSource <= 0
  ) {
    throw new Error('Stripe event must include a valid created timestamp');
  }
  const createdTimestamp: number = giftDateSource;

  return {
    eventId,
    session,
    externalId,
    giftDate: formatUnixDate(createdTimestamp),
  };
};

const findGiftBySourceFingerprint = async (
  client: CoreApiClient,
  sourceFingerprint: string,
): Promise<string | null> => {
  const result = await client.query({
    gifts: {
      __args: {
        first: 1,
        filter: {
          sourceFingerprint: {
            eq: sourceFingerprint,
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

  const giftId = extractConnectionNodes<{ id?: string | null }>(result, 'gifts')[0]
    ?.id;

  return typeof giftId === 'string' && giftId !== '' ? giftId : null;
};

const findRecurringAgreementByStripeSubscription = async (
  client: CoreApiClient,
  stripeSubscriptionId: string,
): Promise<MatchedRecurringAgreement | null> => {
  const result = await client.query({
    recurringAgreements: {
      __args: {
        first: 1,
        filter: {
          and: [
            {
              provider: {
                eq: STRIPE_PROVIDER,
              },
            },
            {
              providerAgreementId: {
                eq: stripeSubscriptionId,
              },
            },
          ],
        },
      },
      edges: {
        node: {
          id: true,
          name: true,
          providerAgreementId: true,
          person: {
            id: true,
            name: {
              firstName: true,
              lastName: true,
            },
            emails: {
              primaryEmail: true,
            },
          },
        },
      },
    },
  } as any);

  return (
    extractConnectionNodes<MatchedRecurringAgreement>(
      result,
      'recurringAgreements',
    )[0] ?? null
  );
};

export const createStripeRecurringGiftForConfidentMatch = async (
  client: CoreApiClient,
  event: StripeRecurringCheckoutSessionCompletedEvent,
): Promise<StripeRecurringFulfillmentResult> => {
  const { eventId, session, externalId, giftDate } = getEventParts(event);
  const providerAgreementId = getStripeObjectId(session.subscription);

  if (!providerAgreementId) {
    return {
      created: false,
      reason: 'NO_STRIPE_SUBSCRIPTION',
      sourceFingerprint: eventId,
      externalId,
      providerAgreementId: null,
    };
  }

  const agreement = await findRecurringAgreementByStripeSubscription(
    client,
    providerAgreementId,
  );

  if (!agreement) {
    return {
      created: false,
      reason: 'NO_CONFIDENT_RECURRING_AGREEMENT_MATCH',
      sourceFingerprint: eventId,
      externalId,
      providerAgreementId,
    };
  }

  const donorId = normalizeString(agreement.person?.id);
  const donorFirstName = normalizeString(agreement.person?.name?.firstName);
  const donorLastName = normalizeString(agreement.person?.name?.lastName);

  if (donorId === '' || donorFirstName === '' || donorLastName === '') {
    return {
      created: false,
      reason: 'MATCHED_AGREEMENT_MISSING_DONOR',
      sourceFingerprint: eventId,
      externalId,
      providerAgreementId,
    };
  }

  const existingGiftId = await findGiftBySourceFingerprint(client, eventId);
  if (existingGiftId) {
    return {
      created: false,
      reason: 'DUPLICATE_SOURCE_FINGERPRINT',
      giftId: existingGiftId,
      recurringAgreementId: agreement.id,
      sourceFingerprint: eventId,
      externalId,
      providerAgreementId,
    };
  }

  const providerPaymentId = getStripeObjectId(session.payment_intent);
  const result = await client.mutation({
    createGift: {
      __args: {
        data: {
          name: `Recurring Stripe gift for ${agreement.name ?? providerAgreementId}`,
          amount: {
            currencyCode: toCurrencyCode(session.currency),
            amountMicros: toAmountMicros(session.amount_total),
          },
          giftDate,
          donorFirstName,
          donorLastName,
          donorEmail:
            normalizeString(session.customer_details?.email) ||
            normalizeString(agreement.person?.emails?.primaryEmail) ||
            null,
          paymentType: 'CARD',
          externalId,
          sourceFingerprint: eventId,
          provider: STRIPE_PROVIDER,
          ...(providerPaymentId ? { providerPaymentId } : {}),
          donor: {
            connect: {
              where: {
                id: donorId,
              },
            },
          },
          recurringAgreement: {
            connect: {
              where: {
                id: agreement.id,
              },
            },
          },
        },
      },
      id: true,
    },
  } as any);

  const giftId = extractMutationRecord<{ id?: string | null }>(
    result,
    'createGift',
  )?.id;

  if (typeof giftId !== 'string' || giftId === '') {
    throw new Error('Create recurring Stripe gift response missing id');
  }

  const nextExpectedAt = await advanceRecurringAgreementExpectation(
    client,
    agreement.id,
    giftDate,
  );

  try {
    await recomputeDonorRollups(client, [donorId]);
  } catch (error) {
    console.warn(
      'Non-blocking donor rollup recompute failed after Stripe recurring gift create',
      donorId,
      error instanceof Error ? error.message : String(error),
    );
  }

  return {
    created: true,
    giftId,
    recurringAgreementId: agreement.id,
    sourceFingerprint: eventId,
    externalId,
    nextExpectedAt,
  };
};

export const createStripeRecurringGiftStagingForReview = async (
  client: CoreApiClient,
  event: StripeRecurringCheckoutSessionCompletedEvent,
): Promise<StripeRecurringUnmatchedStagingResult> => {
  const { session } = getEventParts(event);
  const providerAgreementId = getStripeObjectId(session.subscription);

  if (!providerAgreementId) {
    throw new Error('Stripe recurring staging requires a subscription id');
  }

  const result: StripeOneOffGiftStagingResult =
    await createStripeOneOffGiftStaging(client, event);

  return {
    created: result.created,
    giftStagingId: result.giftStagingId,
    sourceFingerprint: result.sourceFingerprint,
    externalId: result.externalId,
    providerAgreementId,
  };
};
