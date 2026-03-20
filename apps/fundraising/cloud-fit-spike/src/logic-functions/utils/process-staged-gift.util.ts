export interface GiftStagingProcessingPayload
  extends Record<string, unknown> {
  amount: {
    amountMicros: number;
    currencyCode: string;
  };
  donorId?: string;
  companyId?: string;
  donorFirstName?: string;
  donorLastName?: string;
  donorEmail?: string;
  organizationName?: string;
  externalId?: string;
  fundId?: string;
  appealId?: string;
  opportunityId?: string;
  recurringAgreementId?: string;
  giftDate?: string;
  expectedAt?: string;
  giftIntent?: string;
}

export interface GiftStagingProcessingRecord {
  id: string;
  processingStatus?: string;
  validationStatus?: string;
  dedupeStatus?: string;
  rawPayload?: string | Record<string, unknown>;
  giftId?: string;
  donorId?: string;
  companyId?: string;
  fundId?: string;
  appealId?: string;
  opportunityId?: string;
  recurringAgreementId?: string;
  expectedAt?: string;
  giftDate?: string;
  createdAt?: string;
}

const hasNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const isPlainObject = (
  value: unknown,
): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const canProcessGiftStaging = (
  stagingRecord: GiftStagingProcessingRecord,
): boolean => {
  const processingStatus = stagingRecord.processingStatus ?? 'pending';
  const eligibleStatuses = new Set(['ready_for_process', 'process_failed']);

  return eligibleStatuses.has(processingStatus);
};

export const parseGiftStagingRawPayload = (
  rawPayload: unknown,
): GiftStagingProcessingPayload | undefined => {
  if (isPlainObject(rawPayload)) {
    return rawPayload as GiftStagingProcessingPayload;
  }

  if (!hasNonEmptyString(rawPayload)) {
    return undefined;
  }

  try {
    const parsed: unknown = JSON.parse(rawPayload);

    if (isPlainObject(parsed)) {
      return parsed as GiftStagingProcessingPayload;
    }
  } catch {
    return undefined;
  }

  return undefined;
};

export const hasValidGiftProcessingPayload = (
  payload: GiftStagingProcessingPayload,
): boolean => {
  if (!isPlainObject(payload.amount)) {
    return false;
  }

  const currencyCode = payload.amount.currencyCode;
  const amountMicros = payload.amount.amountMicros;

  return (
    (hasNonEmptyString(payload.donorId) || hasNonEmptyString(payload.companyId)) &&
    hasNonEmptyString(currencyCode) &&
    typeof amountMicros === 'number' &&
    Number.isFinite(amountMicros)
  );
};

export const calculateNextExpectedAt = (
  stagingRecord: Pick<
    GiftStagingProcessingRecord,
    'expectedAt' | 'giftDate' | 'createdAt'
  >,
): string | undefined => {
  if (hasNonEmptyString(stagingRecord.expectedAt)) {
    return stagingRecord.expectedAt.trim();
  }

  const referenceDate = stagingRecord.giftDate ?? stagingRecord.createdAt;

  if (!hasNonEmptyString(referenceDate)) {
    return undefined;
  }

  const parsedDate = new Date(referenceDate);

  if (Number.isNaN(parsedDate.valueOf())) {
    return undefined;
  }

  parsedDate.setUTCMonth(parsedDate.getUTCMonth() + 1);

  return parsedDate.toISOString().slice(0, 10);
};

export const buildGiftCreateInput = (
  payload: GiftStagingProcessingPayload,
): Record<string, unknown> => {
  const data: Record<string, unknown> = {
    amount: payload.amount,
  };

  if (hasNonEmptyString(payload.externalId)) {
    data.externalId = payload.externalId.trim();
  }

  if (hasNonEmptyString(payload.giftDate)) {
    data.giftDate = payload.giftDate.trim();
  }

  if (hasNonEmptyString(payload.donorEmail)) {
    data.donorEmail = payload.donorEmail.trim();
  }

  if (hasNonEmptyString(payload.giftIntent)) {
    data.giftIntent = payload.giftIntent.trim();
  }

  if (hasNonEmptyString(payload.donorId)) {
    data.donorId = payload.donorId.trim();
  }

  if (hasNonEmptyString(payload.companyId)) {
    data.companyId = payload.companyId.trim();
  }

  if (hasNonEmptyString(payload.fundId)) {
    data.fundId = payload.fundId.trim();
  }

  if (hasNonEmptyString(payload.appealId)) {
    data.appealId = payload.appealId.trim();
  }

  if (hasNonEmptyString(payload.opportunityId)) {
    data.opportunityId = payload.opportunityId.trim();
  }

  if (hasNonEmptyString(payload.recurringAgreementId)) {
    data.recurringAgreementId = payload.recurringAgreementId.trim();
  }

  return data;
};

export const normalizeGiftStagingRecord = (
  record: Record<string, unknown>,
): GiftStagingProcessingRecord => ({
  id: String(record.id),
  processingStatus: hasNonEmptyString(record.processingStatus)
    ? record.processingStatus.trim()
    : undefined,
  validationStatus: hasNonEmptyString(record.validationStatus)
    ? record.validationStatus.trim()
    : undefined,
  dedupeStatus: hasNonEmptyString(record.dedupeStatus)
    ? record.dedupeStatus.trim()
    : undefined,
  rawPayload: hasNonEmptyString(record.rawPayload)
    ? record.rawPayload.trim()
    : isPlainObject(record.rawPayload)
      ? record.rawPayload
      : undefined,
  giftId: hasNonEmptyString((record.gift as Record<string, unknown> | undefined)?.id)
    ? String((record.gift as Record<string, unknown>).id).trim()
    : hasNonEmptyString(record.giftId)
      ? record.giftId.trim()
      : undefined,
  donorId: hasNonEmptyString((record.donor as Record<string, unknown> | undefined)?.id)
    ? String((record.donor as Record<string, unknown>).id).trim()
    : hasNonEmptyString(record.donorId)
      ? record.donorId.trim()
      : undefined,
  companyId: hasNonEmptyString((record.company as Record<string, unknown> | undefined)?.id)
    ? String((record.company as Record<string, unknown>).id).trim()
    : hasNonEmptyString(record.companyId)
      ? record.companyId.trim()
      : undefined,
  fundId: hasNonEmptyString((record.fund as Record<string, unknown> | undefined)?.id)
    ? String((record.fund as Record<string, unknown>).id).trim()
    : hasNonEmptyString(record.fundId)
      ? record.fundId.trim()
      : undefined,
  appealId: hasNonEmptyString((record.appeal as Record<string, unknown> | undefined)?.id)
    ? String((record.appeal as Record<string, unknown>).id).trim()
    : hasNonEmptyString(record.appealId)
      ? record.appealId.trim()
      : undefined,
  opportunityId: hasNonEmptyString(
    (record.opportunity as Record<string, unknown> | undefined)?.id,
  )
    ? String((record.opportunity as Record<string, unknown>).id).trim()
    : hasNonEmptyString(record.opportunityId)
      ? record.opportunityId.trim()
      : undefined,
  recurringAgreementId: hasNonEmptyString(
    (record.recurringAgreement as Record<string, unknown> | undefined)?.id,
  )
    ? String((record.recurringAgreement as Record<string, unknown>).id).trim()
    : hasNonEmptyString(record.recurringAgreementId)
      ? record.recurringAgreementId.trim()
      : undefined,
  expectedAt: hasNonEmptyString(record.expectedAt)
    ? record.expectedAt.trim()
    : undefined,
  giftDate: hasNonEmptyString(record.giftDate)
    ? record.giftDate.trim()
    : undefined,
  createdAt: hasNonEmptyString(record.createdAt)
    ? record.createdAt.trim()
    : undefined,
});
