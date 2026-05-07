import type {
  RecurringAgreementHealth,
  RecurringAgreementReviewRecord,
  StoredRecurringAgreementRecord,
} from './recurring.types';

const normalizeString = (value: string | null | undefined) =>
  typeof value === 'string' ? value.trim() : '';

const parseDateOnly = (value: string | null | undefined) => {
  const normalized = normalizeString(value);

  if (normalized === '') {
    return null;
  }

  const parsed = new Date(`${normalized}T00:00:00Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const dayDiff = (left: Date, right: Date) => {
  const oneDayMs = 24 * 60 * 60 * 1000;
  return Math.floor((left.getTime() - right.getTime()) / oneDayMs);
};

const formatAmount = (
  amount:
    | {
        amountMicros?: number | null;
        currencyCode?: string | null;
      }
    | null
    | undefined,
) => {
  const amountMicros = amount?.amountMicros;
  const currencyCode = normalizeString(amount?.currencyCode) || 'GBP';

  if (typeof amountMicros !== 'number' || !Number.isFinite(amountMicros)) {
    return 'Unknown amount';
  }

  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currencyCode,
  }).format(amountMicros / 1_000_000);
};

export const buildRecurringPersonDisplayName = (
  person:
    | {
        name?: {
          firstName?: string | null;
          lastName?: string | null;
        } | null;
      }
    | null
    | undefined,
) => {
  const firstName = normalizeString(person?.name?.firstName);
  const lastName = normalizeString(person?.name?.lastName);
  const fullName = `${firstName} ${lastName}`.trim();

  return fullName === '' ? 'Unlinked donor' : fullName;
};

export const deriveRecurringHealth = (
  record: Pick<StoredRecurringAgreementRecord, 'status' | 'nextExpectedAt'>,
  now = new Date(),
): RecurringAgreementHealth => {
  const status = normalizeString(record.status) || 'ACTIVE';
  const nextExpectedDate = parseDateOnly(record.nextExpectedAt);

  if (status === 'PAUSED') {
    return {
      state: 'PAUSED',
      label: 'Paused',
      message: 'This agreement is paused, so no fulfilment is currently expected.',
      daysDelta: null,
    };
  }

  if (status === 'CANCELED') {
    return {
      state: 'CANCELED',
      label: 'Canceled',
      message: 'This agreement is canceled and no longer active.',
      daysDelta: null,
    };
  }

  if (status === 'COMPLETED') {
    return {
      state: 'COMPLETED',
      label: 'Completed',
      message: 'This agreement is completed and no further fulfilment is expected.',
      daysDelta: null,
    };
  }

  if (status === 'DELINQUENT') {
    return {
      state: 'DELINQUENT',
      label: 'Delinquent',
      message: 'This agreement is delinquent and needs attention.',
      daysDelta: nextExpectedDate ? dayDiff(now, nextExpectedDate) : null,
    };
  }

  if (!nextExpectedDate) {
    return {
      state: 'NO_EXPECTATION',
      label: 'No expectation',
      message: 'No next expected date is set yet.',
      daysDelta: null,
    };
  }

  const daysDelta = dayDiff(now, nextExpectedDate);

  if (daysDelta > 0) {
    return {
      state: 'OVERDUE',
      label: 'Overdue',
      message: `Next fulfillment appears overdue by ${daysDelta} day${daysDelta === 1 ? '' : 's'}.`,
      daysDelta,
    };
  }

  return {
    state: 'ON_TRACK',
    label: 'On track',
    message: 'This agreement is within its expected fulfilment window.',
    daysDelta,
  };
};

export const buildRecurringAgreementReviewRecord = (
  record: StoredRecurringAgreementRecord,
): RecurringAgreementReviewRecord => {
  return {
    id: record.id,
    name: normalizeString(record.name) || 'Unnamed recurring agreement',
    status: normalizeString(record.status) || 'ACTIVE',
    cadence: normalizeString(record.cadence) || 'MONTHLY',
    intervalCount:
      typeof record.intervalCount === 'number' && Number.isFinite(record.intervalCount)
        ? record.intervalCount
        : 1,
    amountLabel: formatAmount(record.amount),
    startDate: record.startDate,
    endDate: record.endDate,
    nextExpectedAt: record.nextExpectedAt,
    provider: normalizeString(record.provider) || 'MANUAL',
    providerAgreementId: normalizeString(record.providerAgreementId) || null,
    providerPaymentMethodId:
      normalizeString(record.providerPaymentMethodId) || null,
    mandateReference: normalizeString(record.mandateReference) || null,
    donorName: buildRecurringPersonDisplayName(record.person),
    donorId: normalizeString(record.person?.id) || null,
    donorEmail: normalizeString(record.person?.emails?.primaryEmail) || null,
    health: deriveRecurringHealth(record),
    recentGifts: record.gifts,
    recentGiftStagings: record.giftStagings,
  };
};
