import { CoreApiClient } from 'twenty-client-sdk/core';
import type {
  RecurringAgreementCadence,
  RecurringAgreementSummary,
  StoredRecurringAgreementRecord,
} from './recurring.types';

const normalizeString = (value: string | null | undefined) =>
  typeof value === 'string' ? value.trim() : '';

const normalizeIntervalCount = (value: number | null | undefined) => {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    return 1;
  }

  return Math.round(value);
};

const parseDateOnly = (value: string | null | undefined) => {
  const normalized = normalizeString(value);

  if (normalized === '') {
    return null;
  }

  const parsed = new Date(`${normalized}T00:00:00Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatDateOnly = (value: Date) => value.toISOString().slice(0, 10);

const addCadence = (
  anchor: Date,
  cadence: string,
  intervalCount: number,
): Date => {
  const next = new Date(anchor.getTime());
  const safeCadence = normalizeString(cadence) as RecurringAgreementCadence;
  const step = normalizeIntervalCount(intervalCount);

  switch (safeCadence) {
    case 'WEEKLY':
      next.setUTCDate(next.getUTCDate() + 7 * step);
      return next;
    case 'QUARTERLY':
      next.setUTCMonth(next.getUTCMonth() + 3 * step);
      return next;
    case 'ANNUAL':
      next.setUTCFullYear(next.getUTCFullYear() + step);
      return next;
    case 'CUSTOM':
    case 'MONTHLY':
    default:
      next.setUTCMonth(next.getUTCMonth() + step);
      return next;
  }
};

export const searchRecurringAgreements = async (
  client: CoreApiClient,
  query: string,
): Promise<RecurringAgreementSummary[]> => {
  const normalizedQuery = normalizeString(query).toLowerCase();
  const result = await client.query({
    recurringAgreements: {
      __args: {
        first: 100,
      },
      edges: {
        node: {
          id: true,
          name: true,
          status: true,
          cadence: true,
          intervalCount: true,
          nextExpectedAt: true,
          provider: true,
          amount: {
            amountMicros: true,
            currencyCode: true,
          },
          providerAgreementId: true,
          mandateReference: true,
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

  const agreements =
    result?.recurringAgreements?.edges?.map(
      (
        edge: {
          node: RecurringAgreementSummary & {
            providerAgreementId?: string | null;
            mandateReference?: string | null;
          };
        },
      ) => edge.node,
    ) ?? [];

  if (normalizedQuery === '') {
    return agreements.slice(0, 20);
  }

  return agreements
    .filter((agreement) => {
      const donorName = `${normalizeString(
        agreement.person?.name?.firstName,
      )} ${normalizeString(agreement.person?.name?.lastName)}`.trim();
      const haystack = [
        agreement.name,
        agreement.status,
        agreement.provider,
        donorName,
        (agreement as { providerAgreementId?: string | null }).providerAgreementId,
        (agreement as { mandateReference?: string | null }).mandateReference,
      ]
        .map((value) => normalizeString(value).toLowerCase())
        .join(' ');

      return haystack.includes(normalizedQuery);
    })
    .slice(0, 20);
};

export const loadRecurringAgreementById = async (
  client: CoreApiClient,
  recurringAgreementId: string,
): Promise<StoredRecurringAgreementRecord | null> => {
  const result = await client.query({
    recurringAgreement: {
      __args: {
        filter: {
          id: {
            eq: recurringAgreementId,
          },
        },
      },
      id: true,
      name: true,
      status: true,
      cadence: true,
      intervalCount: true,
      amount: {
        amountMicros: true,
        currencyCode: true,
      },
      startDate: true,
      endDate: true,
      nextExpectedAt: true,
      provider: true,
      providerAgreementId: true,
      providerPaymentMethodId: true,
      mandateReference: true,
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
    gifts: {
      __args: {
        first: 10,
        filter: {
          recurringAgreementId: {
            eq: recurringAgreementId,
          },
        },
      },
      edges: {
        node: {
          id: true,
          name: true,
          giftDate: true,
          amount: true,
          donorFirstName: true,
          donorLastName: true,
        },
      },
    },
    giftStagings: {
      __args: {
        first: 10,
        filter: {
          recurringAgreementId: {
            eq: recurringAgreementId,
          },
        },
      },
      edges: {
        node: {
          id: true,
          name: true,
          giftDate: true,
          processingStatus: true,
          donorFirstName: true,
          donorLastName: true,
        },
      },
    },
  } as any);

  const agreement = result?.recurringAgreement as
    | Omit<StoredRecurringAgreementRecord, 'gifts' | 'giftStagings'>
    | null;

  if (!agreement) {
    return null;
  }

  return {
    ...agreement,
    gifts:
      result?.gifts?.edges?.map(
        (edge: { node: StoredRecurringAgreementRecord['gifts'][number] }) =>
          edge.node,
      ) ?? [],
    giftStagings:
      result?.giftStagings?.edges?.map(
        (edge: {
          node: StoredRecurringAgreementRecord['giftStagings'][number];
        }) => edge.node,
      ) ?? [],
  };
};

export const advanceRecurringAgreementExpectation = async (
  client: CoreApiClient,
  recurringAgreementId: string,
  fulfilledGiftDate: string,
) => {
  const agreement = await loadRecurringAgreementById(client, recurringAgreementId);

  if (!agreement) {
    throw new Error('Recurring agreement not found');
  }

  const fulfilledAt = parseDateOnly(fulfilledGiftDate);

  if (!fulfilledAt) {
    throw new Error('Fulfilled gift date is required to advance expectation');
  }

  const currentExpectation = parseDateOnly(agreement.nextExpectedAt);
  const startDate = parseDateOnly(agreement.startDate);
  // Keep recurring expectation anchored on the agreement schedule rather than
  // letting each payment date redefine the commitment rhythm.
  const anchor = currentExpectation ?? startDate ?? fulfilledAt;
  const nextExpectedAt = formatDateOnly(
    addCadence(anchor, agreement.cadence, agreement.intervalCount ?? 1),
  );

  await client.mutation({
    updateRecurringAgreement: {
      __args: {
        id: recurringAgreementId,
        data: {
          nextExpectedAt,
        },
      },
      id: true,
    },
  } as any);

  return nextExpectedAt;
};
