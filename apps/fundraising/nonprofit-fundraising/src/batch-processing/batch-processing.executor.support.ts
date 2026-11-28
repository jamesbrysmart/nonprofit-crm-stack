import { CoreApiClient } from 'twenty-client-sdk/core';
import { buildGiftAidIntake } from 'src/gift-aid/gift-aid-intake';
import {
  extractConnectionNodes,
  extractMutationRecord,
} from 'src/core-api/core-api-results';
import {
  hasLinkedDonorForProcessing,
  hasSufficientDonorEvidenceForNewDonor,
} from 'src/gift-staging-review/gift-staging-processability';
import { advanceRecurringAgreementExpectation } from 'src/recurring/recurring.service';
import type { RecurringAgreementCadence } from 'src/recurring/recurring.types';
import type { GiftReadyStatus } from 'src/gift-staging-review/gift-ready-status';
import {
  resolveSoftCreditSelection,
  SOFT_CREDIT_TYPE_VALUES,
  type SoftCreditType,
} from 'src/soft-credits/soft-credit-integrity';
import { buildGiftName } from 'src/gifts/gift-name';
import type { BatchProcessingRow } from './batch-processing.types';
import {
  withGiftReportingValue,
} from 'src/reporting-currency/gift-reporting-value';
import { getReportingCurrencyCode } from 'src/reporting-currency/reporting-currency';
import { normalizeString } from 'src/utils/normalize-string';
import { createCoreApiClient } from 'src/core-api/rate-limit-retry';
import { postTwentyRest } from 'src/app-api/twenty-rest-client';
import { chunkArray } from 'src/utils/chunk-array';
import type { CoreSchema } from 'twenty-client-sdk/core';

export type SuccessfulWriteback = {
  id: string;
  committedGiftId: string;
  donorId: string;
  companyId?: string;
  appealId?: string;
  appealSourceId?: string;
  recurringAgreementId?: string;
  processingStatus: 'PROCESSED';
  errorDetail: null;
  giftReadyStatus: GiftReadyStatus | null;
  executionPath: 'BATCH' | 'ROW_FALLBACK';
};

export type FailedWriteback = {
  id: string;
  processingStatus: 'PROCESS_FAILED';
  errorDetail: string;
  giftReadyStatus: null;
  executionPath: 'BATCH' | 'ROW_FALLBACK';
};

export type NotReadyWriteback = {
  id: string;
  processingStatus: 'NOT_PROCESSED';
  errorDetail: null;
  giftReadyStatus: 'NEEDS_REVIEW';
};

export type RowWriteback =
  | SuccessfulWriteback
  | FailedWriteback
  | NotReadyWriteback;

export type BatchGiftEntry = {
  row: BatchProcessingRow;
  payload: Record<string, unknown>;
};

export type DonorEmailsUpdate = {
  donorId: string;
  emails: {
    primaryEmail: string | null;
    additionalEmails: string[] | null;
  };
};

export type DonorSupporterEmailOptOutUpdate = {
  donorId: string;
  supporterEmailOptOut: true;
};

type GiftCreatePayload = ReturnType<typeof buildGiftPayloadFromRow>;

const buildOptionalCurrencyValue = (
  value:
    | {
        amountMicros?: number | null;
        currencyCode?: string | null;
      }
    | null
    | undefined,
) => {
  const amountMicros = value?.amountMicros;
  const currencyCode = normalizeString(value?.currencyCode);

  if (
    typeof amountMicros !== 'number' ||
    !Number.isFinite(amountMicros) ||
    currencyCode === ''
  ) {
    return null;
  }

  return {
    amountMicros: Math.round(amountMicros),
    currencyCode,
  };
};

const normalizeEmail = (value: string | null | undefined) =>
  normalizeString(value).toLowerCase();

const normalizeProviderForRecurringAgreement = (
  value: string | null | undefined,
) => normalizeString(value).toUpperCase();

// The recurring agreement's provider options.
const RECURRING_AGREEMENT_PROVIDERS: readonly CoreSchema.RecurringAgreementProviderEnum[] =
  ['STRIPE', 'GOCARDLESS', 'MANUAL', 'IMPORTED'];

// A staged soft-credit type must be one of the gift field's options.
const toGiftSoftCreditType = (
  value: string | null | undefined,
): SoftCreditType | null => {
  const normalized = normalizeString(value).toUpperCase();

  if (normalized === '') {
    return null;
  }

  const softCreditType = SOFT_CREDIT_TYPE_VALUES.find(
    (candidate) => candidate === normalized,
  );

  if (!softCreditType) {
    throw new Error(
      `Soft credit type "${normalized}" is not supported. Supported types: ${SOFT_CREDIT_TYPE_VALUES.join(', ')}.`,
    );
  }

  return softCreditType;
};

const toRecurringAgreementProvider = (
  value: string,
): CoreSchema.RecurringAgreementProviderEnum | null =>
  RECURRING_AGREEMENT_PROVIDERS.find((provider) => provider === value) ?? null;

const normalizeGiftPaymentType = (value: string | null | undefined) => {
  const normalized = normalizeString(value).toUpperCase();

  switch (normalized) {
    case 'CARD':
    case 'DIRECT_DEBIT':
    case 'BANK_TRANSFER':
    case 'CASH':
    case 'CHEQUE':
    case 'OTHER':
      return normalized;
    default:
      return '';
  }
};

export const isProviderBackedRecurringStagingRow = (row: BatchProcessingRow) =>
  normalizeString(row.recurringAgreement?.id) === '' &&
  normalizeProviderForRecurringAgreement(row.provider) !== '' &&
  normalizeString(row.providerAgreementId) !== '';

export const requiresRecurringRowFallback = (row: BatchProcessingRow) =>
  normalizeString(row.recurringAgreement?.id) !== '' ||
  isProviderBackedRecurringStagingRow(row);

type DerivedRecurringCadence = {
  cadence: RecurringAgreementCadence;
  intervalCount: number;
};

export const deriveRecurringCadenceFromProviderEvidence = ({
  providerIntervalUnit,
  providerIntervalCount,
}: {
  providerIntervalUnit: string | null | undefined;
  providerIntervalCount: number | null | undefined;
}): DerivedRecurringCadence => {
  const unit = normalizeString(providerIntervalUnit).toLowerCase();

  if (unit === '') {
    throw new Error(
      'Provider recurring interval unit is required before creating a recurring agreement',
    );
  }

  if (
    typeof providerIntervalCount !== 'number' ||
    !Number.isInteger(providerIntervalCount) ||
    providerIntervalCount <= 0
  ) {
    throw new Error(
      'Provider recurring interval count is required before creating a recurring agreement',
    );
  }

  if (unit === 'week' && providerIntervalCount === 1) {
    return { cadence: 'WEEKLY', intervalCount: 1 };
  }

  if (unit === 'month' && providerIntervalCount === 1) {
    return { cadence: 'MONTHLY', intervalCount: 1 };
  }

  if (unit === 'month' && providerIntervalCount === 3) {
    return { cadence: 'QUARTERLY', intervalCount: 1 };
  }

  if (unit === 'year' && providerIntervalCount === 1) {
    return { cadence: 'ANNUAL', intervalCount: 1 };
  }

  throw new Error(
    `Unsupported provider recurring interval ${providerIntervalCount} ${unit}`,
  );
};

export const buildGiftPayloadFromRow = (row: BatchProcessingRow) =>
  withGiftReportingValue(
    buildGiftPayloadWithoutReporting(row),
    row.reportingAmount,
    getReportingCurrencyCode(),
  );

const buildGiftPayloadWithoutReporting = (row: BatchProcessingRow) => {
  const amountMicros = row.amount?.amountMicros;
  const currencyCode = normalizeString(row.amount?.currencyCode);
  const donorId = normalizeString(row.donor?.id);
  const donorFirstName = normalizeString(row.donorFirstName);
  const donorLastName = normalizeString(row.donorLastName);
  const donorEmail = normalizeString(row.donorEmail);
  const isAnonymousDonor = row.isAnonymousDonor === true;
  const giftDate = normalizeString(row.giftDate);
  const paymentType = normalizeGiftPaymentType(row.paymentType);
  const explicitFundId = normalizeString(row.fund?.id);
  const appealId = normalizeString(row.appeal?.id);
  const appealSourceId = normalizeString(row.appealSource?.id);
  const appealSourceAppealId = normalizeString(row.appealSource?.appeal?.id);
  const defaultFundId = normalizeString(row.appeal?.defaultFund?.id);
  const fundId = explicitFundId !== '' ? explicitFundId : defaultFundId;
  const softCreditSelection = resolveSoftCreditSelection({
    softCreditPersonId: normalizeString(row.softCreditPerson?.id),
    softCreditCompanyId: normalizeString(row.softCreditCompany?.id),
    softCreditType: row.softCreditType,
  });

  if (typeof amountMicros !== 'number' || !Number.isFinite(amountMicros) || amountMicros <= 0) {
    throw new Error('Row amount is not valid for batch processing');
  }

  if (currencyCode === '') {
    throw new Error('Row currency is not valid for batch processing');
  }

  if (
    isAnonymousDonor &&
    (normalizeString(row.recurringAgreement?.id) !== '' ||
      isProviderBackedRecurringStagingRow(row))
  ) {
    throw new Error(
      'Anonymous donor gifts are not yet supported for recurring processing',
    );
  }

  if (
    !isAnonymousDonor &&
    !hasLinkedDonorForProcessing({ linkedDonorId: row.donor?.id }) &&
    !hasSufficientDonorEvidenceForNewDonor(row)
  ) {
    throw new Error(
      'Donor first name and last name are required before processing a new donor',
    );
  }

  if (giftDate === '') {
    throw new Error('Gift date is required for batch processing');
  }

  if (paymentType === '') {
    throw new Error('Payment type is required before batch processing');
  }

  if (
    appealSourceId !== '' &&
    (appealId === '' || appealSourceAppealId === '' || appealSourceAppealId !== appealId)
  ) {
    throw new Error(
      'Appeal source does not belong to the selected appeal for batch processing',
    );
  }

  return {
    name: buildGiftName({
      giftType: 'DONATION',
      donorName: `${donorFirstName} ${donorLastName}`.trim(),
      isAnonymousDonor,
      amountMicros: Math.round(amountMicros),
      currencyCode,
      giftDate,
    }),
    amount: {
      currencyCode,
      amountMicros: Math.round(amountMicros),
    },
    giftDate,
    donorFirstName,
    donorLastName,
    ...(donorEmail !== '' ? { donorEmail } : {}),
    ...(isAnonymousDonor ? { isAnonymousDonor: true } : {}),
    paymentType,
    ...(normalizeString(row.externalId) !== ''
      ? { externalId: normalizeString(row.externalId) }
      : {}),
    ...(normalizeString(row.sourceFingerprint) !== ''
      ? { sourceFingerprint: normalizeString(row.sourceFingerprint) }
      : {}),
    ...(normalizeString(row.provider) !== ''
      ? { provider: normalizeString(row.provider) }
      : {}),
    ...(normalizeString(row.providerPaymentId) !== ''
      ? { providerPaymentId: normalizeString(row.providerPaymentId) }
      : {}),
    ...(buildOptionalCurrencyValue(row.coveredFeeAmount)
      ? { coveredFeeAmount: buildOptionalCurrencyValue(row.coveredFeeAmount) }
      : {}),
    ...(buildOptionalCurrencyValue(row.grossPaymentAmount)
      ? {
          grossPaymentAmount: buildOptionalCurrencyValue(
            row.grossPaymentAmount,
          ),
        }
      : {}),
    ...(buildOptionalCurrencyValue(row.processingFeeAmount)
      ? {
          processingFeeAmount: buildOptionalCurrencyValue(
            row.processingFeeAmount,
          ),
        }
      : {}),
    ...(buildOptionalCurrencyValue(row.netReceivedAmount)
      ? {
          netReceivedAmount: buildOptionalCurrencyValue(row.netReceivedAmount),
        }
      : {}),
    ...(normalizeString(row.providerPayoutReference) !== ''
      ? { providerPayoutReference: normalizeString(row.providerPayoutReference) }
      : {}),
    ...(donorId !== '' ? { donorId } : {}),
    ...(appealId !== '' ? { appealId } : {}),
    ...(appealSourceId !== '' ? { appealSourceId } : {}),
    ...(fundId !== '' ? { fundId } : {}),
    ...(softCreditSelection.mode === 'set' &&
    softCreditSelection.softCreditPersonId !== ''
      ? { softCreditPersonId: softCreditSelection.softCreditPersonId }
      : {}),
    ...(softCreditSelection.mode === 'set' &&
    softCreditSelection.softCreditCompanyId !== ''
      ? { softCreditCompanyId: softCreditSelection.softCreditCompanyId }
      : {}),
    ...(softCreditSelection.mode === 'set'
      ? { softCreditType: softCreditSelection.softCreditType }
      : {}),
    ...(normalizeString(row.recurringAgreement?.id) !== ''
      ? {
          recurringAgreementId: normalizeString(row.recurringAgreement?.id),
        }
      : {}),
  };
};

export const deriveLinkedDonorEmailUpdate = (
  row: BatchProcessingRow,
): DonorEmailsUpdate | null => {
  const donorId = normalizeString(row.donor?.id);
  const stagedEmail = normalizeString(row.donorEmail);
  const normalizedStagedEmail = normalizeEmail(row.donorEmail);

  if (donorId === '' || stagedEmail === '' || normalizedStagedEmail === '') {
    return null;
  }

  const primaryEmail = normalizeString(row.donor?.emails?.primaryEmail);
  const additionalEmails = Array.isArray(row.donor?.emails?.additionalEmails)
    ? row.donor.emails.additionalEmails
        .map((email) => normalizeString(email))
        .filter((email) => email !== '')
    : [];

  const knownEmails = new Set(
    [primaryEmail, ...additionalEmails]
      .map((email) => normalizeEmail(email))
      .filter((email) => email !== ''),
  );

  if (knownEmails.has(normalizedStagedEmail)) {
    return null;
  }

  return {
    donorId,
    emails: {
      primaryEmail: primaryEmail === '' ? null : primaryEmail,
      additionalEmails:
        additionalEmails.length > 0
          ? [...additionalEmails, stagedEmail]
          : [stagedEmail],
    },
  };
};

export const deriveLinkedDonorSupporterEmailOptOutUpdate = (
  row: BatchProcessingRow,
): DonorSupporterEmailOptOutUpdate | null => {
  const donorId = normalizeString(row.donor?.id);

  if (donorId === '' || row.supporterEmailOptOut !== true) {
    return null;
  }

  // This flag is intentionally sticky. A staged false/null value never clears
  // an existing donor opt-out, so the only write we derive here is true -> true.
  if (row.donor?.supporterEmailOptOut === true) {
    return null;
  }

  return {
    donorId,
    supporterEmailOptOut: true,
  };
};

export const buildNewPersonCreateData = (row: BatchProcessingRow) => {
  const donorFirstName = normalizeString(row.donorFirstName);
  const donorLastName = normalizeString(row.donorLastName);
  const donorEmail = normalizeString(row.donorEmail);
  const donorMailingAddress = row.donorMailingAddress;

  if (donorFirstName === '' || donorLastName === '') {
    throw new Error(
      'Donor first name and last name are required before processing a new donor',
    );
  }

  return {
    name: {
      firstName: donorFirstName,
      lastName: donorLastName,
    },
    ...(donorEmail !== ''
      ? {
          emails: {
            primaryEmail: donorEmail,
          },
        }
      : {}),
    ...(donorMailingAddress
      ? {
          mailingAddress: donorMailingAddress,
        }
      : {}),
    ...(row.supporterEmailOptOut === true
      ? {
          supporterEmailOptOut: true,
        }
      : {}),
  };
};

const PERSON_UPDATE_CHUNK_SIZE = 60;

// Email and supporter opt-out enrichment for already-linked donors, sent as one
// bulk write per chunk instead of a request per row. Non-blocking: the gifts
// are already committed, so a failure is logged rather than failing the row.
export const applyLinkedDonorUpdates = async (rows: BatchProcessingRow[]) => {
  const updatesByDonorId = new Map<
    string,
    { id: string; emails?: DonorEmailsUpdate['emails']; supporterEmailOptOut?: true }
  >();

  for (const row of rows) {
    const emailUpdate = deriveLinkedDonorEmailUpdate(row);
    const optOutUpdate = deriveLinkedDonorSupporterEmailOptOutUpdate(row);

    for (const donorId of [emailUpdate?.donorId, optOutUpdate?.donorId]) {
      if (donorId && !updatesByDonorId.has(donorId)) {
        updatesByDonorId.set(donorId, { id: donorId });
      }
    }

    if (emailUpdate) {
      updatesByDonorId.get(emailUpdate.donorId)!.emails = emailUpdate.emails;
    }

    if (optOutUpdate) {
      updatesByDonorId.get(optOutUpdate.donorId)!.supporterEmailOptOut = true;
    }
  }

  for (const chunk of chunkArray(
    [...updatesByDonorId.values()],
    PERSON_UPDATE_CHUNK_SIZE,
  )) {
    try {
      await postTwentyRest<unknown>({
        path: '/rest/batch/people?upsert=true&depth=0',
        body: chunk,
      });
    } catch (error) {
      console.warn(
        'Non-blocking donor enrichment failed',
        chunk.map((update) => update.id).join(', '),
        error instanceof Error ? error.message : String(error),
      );
    }
  }
};

const ensurePersonForRowFallback = async (
  client: CoreApiClient,
  row: BatchProcessingRow,
) => {
  const result = await client.mutation({
    createPerson: {
      __args: {
        data: buildNewPersonCreateData(row),
      },
      id: true,
    },
  });

  const personId = normalizeString(
    extractMutationRecord<{ id?: string | null }>(result, 'createPerson')?.id,
  );

  if (personId === '') {
    throw new Error('Create person response missing id');
  }

  return personId;
};

type ProviderRecurringAgreementRecord = {
  id: string;
};

const findRecurringAgreementByProviderAgreementId = async ({
  client,
  provider,
  providerAgreementId,
}: {
  client: CoreApiClient;
  provider: CoreSchema.RecurringAgreementProviderEnum;
  providerAgreementId: string;
}): Promise<string | null> => {
  const result = await client.query({
    recurringAgreements: {
      __args: {
        first: 1,
        filter: {
          provider: {
            eq: provider,
          },
          providerAgreementId: {
            eq: providerAgreementId,
          },
        },
      },
      edges: {
        node: {
          id: true,
        },
      },
    },
  });

  const agreement = extractConnectionNodes<ProviderRecurringAgreementRecord>(
    result,
    'recurringAgreements',
  )[0];
  const agreementId = normalizeString(agreement?.id);

  return agreementId === '' ? null : agreementId;
};

const buildProviderRecurringAgreementName = (row: BatchProcessingRow) => {
  const donorName = [row.donorFirstName, row.donorLastName]
    .map(normalizeString)
    .filter(Boolean)
    .join(' ');
  const provider = normalizeProviderForRecurringAgreement(row.provider);

  if (donorName !== '' && provider !== '') {
    return `${provider} recurring agreement for ${donorName}`;
  }

  if (donorName !== '') {
    return `Recurring agreement for ${donorName}`;
  }

  return row.name;
};

const createProviderBackedRecurringAgreement = async ({
  client,
  row,
  payload,
}: {
  client: CoreApiClient;
  row: BatchProcessingRow;
  payload: GiftCreatePayload;
}): Promise<string> => {
  const providerValue = normalizeProviderForRecurringAgreement(row.provider);
  const providerAgreementId = normalizeString(row.providerAgreementId);
  const donorId = normalizeString(payload.donorId as string | undefined);

  if (providerValue === '') {
    throw new Error(
      'Provider is required before creating a provider-backed recurring agreement',
    );
  }

  const provider = toRecurringAgreementProvider(providerValue);

  if (!provider) {
    throw new Error(
      `Recurring agreements cannot use provider "${providerValue}". Supported providers: ${RECURRING_AGREEMENT_PROVIDERS.join(', ')}.`,
    );
  }

  if (providerAgreementId === '') {
    throw new Error(
      'Provider agreement ID is required before creating a provider-backed recurring agreement',
    );
  }

  const existingAgreementId = await findRecurringAgreementByProviderAgreementId({
    client,
    provider,
    providerAgreementId,
  });

  if (existingAgreementId) {
    return existingAgreementId;
  }

  const { cadence, intervalCount } = deriveRecurringCadenceFromProviderEvidence({
    providerIntervalUnit: row.providerIntervalUnit,
    providerIntervalCount: row.providerIntervalCount,
  });

  const result = await client.mutation({
    createRecurringAgreement: {
      __args: {
        data: {
          name: buildProviderRecurringAgreementName(row),
          status: 'ACTIVE',
          cadence,
          intervalCount,
          amount: payload.amount,
          startDate: payload.giftDate,
          nextExpectedAt: payload.giftDate,
          provider,
          providerAgreementId,
          person: {
            connect: {
              where: {
                id: donorId,
              },
            },
          },
        },
      },
      id: true,
    },
  });

  const createdAgreementId = normalizeString(
    extractMutationRecord<{ id?: string | null }>(
      result,
      'createRecurringAgreement',
    )?.id,
  );

  if (createdAgreementId === '') {
    throw new Error('Create recurring agreement response missing id');
  }

  return createdAgreementId;
};

export const createGiftViaRowFallback = async (
  row: BatchProcessingRow,
): Promise<SuccessfulWriteback> => {
  const client = createCoreApiClient();
  let payload: GiftCreatePayload = buildGiftPayloadFromRow(row);
  let donorId = normalizeString(payload.donorId as string | undefined);
  const isAnonymousDonor = row.isAnonymousDonor === true;

  if (donorId === '' && !isAnonymousDonor) {
    donorId = await ensurePersonForRowFallback(client, row);
    payload = {
      ...payload,
      donorId,
    };
  }

  let recurringAgreementId = normalizeString(
    payload.recurringAgreementId as string | undefined,
  );

  if (recurringAgreementId === '' && isProviderBackedRecurringStagingRow(row)) {
    recurringAgreementId = await createProviderBackedRecurringAgreement({
      client,
      row,
      payload,
    });
  }

  const createData = { ...payload, ...buildGiftAidIntake(row, donorId) } as Record<string, unknown>;
  delete createData.donorId;
  delete createData.companyId;
  delete createData.donorMailingAddress;
  delete createData.recurringAgreementId;
  const appealId = normalizeString(payload.appealId as string | undefined);
  const companyId = normalizeString(
    (payload as Record<string, unknown>).companyId as string | undefined,
  );
  const appealSourceId = normalizeString(
    payload.appealSourceId as string | undefined,
  );
  const fundId = normalizeString(payload.fundId as string | undefined);
  const softCreditPersonId = normalizeString(
    payload.softCreditPersonId as string | undefined,
  );
  const softCreditCompanyId = normalizeString(
    payload.softCreditCompanyId as string | undefined,
  );
  const softCreditType = toGiftSoftCreditType(
    payload.softCreditType as string | undefined,
  );
  delete createData.appealId;
  delete createData.appealSourceId;
  delete createData.fundId;
  delete createData.softCreditPersonId;
  delete createData.softCreditCompanyId;
  delete createData.softCreditType;
  const result = await client.mutation({
    createGift: {
      __args: {
        data: {
          ...createData,
          ...(donorId !== ''
            ? {
                donor: {
                  connect: {
                    where: {
                      id: donorId,
                    },
                  },
                },
              }
            : {}),
          ...(companyId !== ''
            ? {
                company: {
                  connect: {
                    where: {
                      id: companyId,
                    },
                  },
                },
              }
            : {}),
          ...(recurringAgreementId !== ''
            ? {
                recurringAgreement: {
                  connect: {
                    where: {
                      id: recurringAgreementId,
                    },
                  },
                },
              }
            : {}),
          ...(appealId !== ''
            ? {
                appeal: {
                  connect: {
                    where: {
                      id: appealId,
                    },
                  },
                },
              }
            : {}),
          ...(appealSourceId !== ''
            ? {
                appealSource: {
                  connect: {
                    where: {
                      id: appealSourceId,
                    },
                  },
                },
              }
            : {}),
          ...(fundId !== ''
            ? {
                fund: {
                  connect: {
                    where: {
                      id: fundId,
                    },
                  },
                },
              }
            : {}),
          ...(softCreditPersonId !== ''
            ? {
                softCreditPerson: {
                  connect: {
                    where: {
                      id: softCreditPersonId,
                    },
                  },
                },
                softCreditType,
              }
            : {}),
          ...(softCreditCompanyId !== ''
            ? {
                softCreditCompany: {
                  connect: {
                    where: {
                      id: softCreditCompanyId,
                    },
                  },
                },
                softCreditType,
              }
            : {}),
        },
      },
      id: true,
    },
  });

  const giftId = extractMutationRecord<{ id?: string | null }>(
    result,
    'createGift',
  )?.id;

  if (typeof giftId !== 'string' || giftId === '') {
    throw new Error('Create gift response missing id');
  }

  if (recurringAgreementId !== '') {
    await advanceRecurringAgreementExpectation(
      client,
      recurringAgreementId,
      normalizeString(payload.giftDate),
    );
  }

  await applyLinkedDonorUpdates([row]);

  return {
    id: row.id,
    committedGiftId: giftId,
    donorId,
    ...(companyId !== '' ? { companyId } : {}),
    ...(appealId !== '' ? { appealId } : {}),
    ...(appealSourceId !== '' ? { appealSourceId } : {}),
    processingStatus: 'PROCESSED',
    errorDetail: null,
    giftReadyStatus: null,
    executionPath: 'ROW_FALLBACK',
    ...(recurringAgreementId !== '' ? { recurringAgreementId } : {}),
  };
};
