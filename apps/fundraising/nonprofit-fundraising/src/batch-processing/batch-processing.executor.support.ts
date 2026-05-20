import { CoreApiClient } from 'twenty-client-sdk/core';
import { createGiftAidDeclarationService } from 'src/gift-aid/gift-aid.declarations';
import { isGiftAidEnabled } from 'src/gift-aid/gift-aid-config';
import { applyGiftAidMetadata } from 'src/gift-aid/gift-aid.policy';
import {
  hasLinkedDonorForProcessing,
  hasSufficientDonorEvidenceForNewDonor,
} from 'src/gift-staging-review/gift-staging-processability';
import { advanceRecurringAgreementExpectation } from 'src/recurring/recurring.service';
import type { RecurringAgreementCadence } from 'src/recurring/recurring.types';
import type { GiftReadyStatus } from 'src/gift-staging-review/gift-ready-status';
import type { BatchProcessingRow } from './batch-processing.types';

export type SuccessfulWriteback = {
  id: string;
  committedGiftId: string;
  donorId: string;
  appealId?: string;
  recurringAgreementId?: string;
  processingStatus: 'PROCESSED';
  errorDetail: null;
  giftReadyStatus: GiftReadyStatus | null;
  executionPath: 'BATCH' | 'ROW_FALLBACK';
  giftAidStatus: string | null;
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

export const normalizeString = (value: string | null | undefined) =>
  typeof value === 'string' ? value.trim() : '';

const normalizeEmail = (value: string | null | undefined) =>
  normalizeString(value).toLowerCase();

const normalizeProviderForRecurringAgreement = (
  value: string | null | undefined,
) => normalizeString(value).toUpperCase();

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

export const buildGiftPayloadFromRow = (row: BatchProcessingRow) => {
  const amountMicros = row.amount?.amountMicros;
  const currencyCode = normalizeString(row.amount?.currencyCode);
  const donorId = normalizeString(row.donor?.id);
  const donorFirstName = normalizeString(row.donorFirstName);
  const donorLastName = normalizeString(row.donorLastName);
  const donorEmail = normalizeString(row.donorEmail);
  const giftDate = normalizeString(row.giftDate);
  const explicitFundId = normalizeString(row.fund?.id);
  const appealId = normalizeString(row.appeal?.id);
  const defaultFundId = normalizeString(row.appeal?.defaultFund?.id);
  const fundId = explicitFundId !== '' ? explicitFundId : defaultFundId;

  if (typeof amountMicros !== 'number' || !Number.isFinite(amountMicros) || amountMicros <= 0) {
    throw new Error('Row amount is not valid for batch processing');
  }

  if (currencyCode === '') {
    throw new Error('Row currency is not valid for batch processing');
  }

  if (
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

  return {
    name: row.name,
    amount: {
      currencyCode,
      amountMicros: Math.round(amountMicros),
    },
    giftDate,
    donorFirstName,
    donorLastName,
    ...(donorEmail !== '' ? { donorEmail } : {}),
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
    ...(donorId !== '' ? { donorId } : {}),
    ...(appealId !== '' ? { appealId } : {}),
    ...(fundId !== '' ? { fundId } : {}),
    giftAidRequested: row.giftAidRequested === true,
    giftAidDeclarationCaptured: row.giftAidDeclarationCaptured === true,
    ...(normalizeString(row.giftAidDeclarationDate) !== ''
      ? { giftAidDeclarationDate: normalizeString(row.giftAidDeclarationDate) }
      : {}),
    ...(normalizeString(row.giftAidCoverageScope) !== ''
      ? { giftAidCoverageScope: normalizeString(row.giftAidCoverageScope) }
      : {}),
    ...(normalizeString(row.giftAidDeclarationSource) !== ''
      ? {
          giftAidDeclarationSource: normalizeString(
            row.giftAidDeclarationSource,
          ),
        }
      : {}),
    ...(normalizeString(row.giftAidTextVersion) !== ''
      ? { giftAidTextVersion: normalizeString(row.giftAidTextVersion) }
      : {}),
    ...(normalizeString(row.giftAidDeclaration?.id) !== ''
      ? { giftAidDeclarationId: normalizeString(row.giftAidDeclaration?.id) }
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

export const applyLinkedDonorEmailUpdates = async (
  client: CoreApiClient,
  rows: BatchProcessingRow[],
) => {
  for (const row of rows) {
    const update = deriveLinkedDonorEmailUpdate(row);

    if (!update) {
      continue;
    }

    try {
      await client.mutation({
        updatePerson: {
          __args: {
            id: update.donorId,
            data: {
              emails: update.emails,
            },
          },
          id: true,
        },
      } as any);
    } catch (error) {
      console.warn(
        'Non-blocking donor email enrichment failed',
        row.id,
        error instanceof Error ? error.message : String(error),
      );
    }
  }
};

const ensurePersonForRowFallback = async (
  client: CoreApiClient,
  row: BatchProcessingRow,
) => {
  const donorFirstName = normalizeString(row.donorFirstName);
  const donorLastName = normalizeString(row.donorLastName);
  const donorEmail = normalizeString(row.donorEmail);
  const donorMailingAddress = row.donorMailingAddress;

  if (donorFirstName === '' || donorLastName === '') {
    throw new Error(
      'Donor first name and last name are required before processing a new donor',
    );
  }

  const result = await client.mutation({
    createPerson: {
      __args: {
        data: {
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
        },
      },
      id: true,
    },
  } as any);

  const personId = normalizeString(result?.createPerson?.id);

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
  provider: string;
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
  } as any);

  const agreement = result?.recurringAgreements?.edges?.[0]?.node as
    | ProviderRecurringAgreementRecord
    | undefined;
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
  payload: Record<string, unknown>;
}): Promise<string> => {
  const provider = normalizeProviderForRecurringAgreement(row.provider);
  const providerAgreementId = normalizeString(row.providerAgreementId);
  const donorId = normalizeString(payload.donorId as string | undefined);

  if (provider === '') {
    throw new Error(
      'Provider is required before creating a provider-backed recurring agreement',
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
  } as any);

  const createdAgreementId = normalizeString(result?.createRecurringAgreement?.id);

  if (createdAgreementId === '') {
    throw new Error('Create recurring agreement response missing id');
  }

  return createdAgreementId;
};

export const createGiftViaRowFallback = async (
  row: BatchProcessingRow,
): Promise<SuccessfulWriteback> => {
  const client = new CoreApiClient();
  const giftAidDeclarationService = createGiftAidDeclarationService(client);
  let payload = buildGiftPayloadFromRow(row);
  let donorId = normalizeString(payload.donorId as string | undefined);

  if (donorId === '') {
    donorId = await ensurePersonForRowFallback(client, row);
    payload = {
      ...payload,
      donorId,
    };
  }

  payload = await applyGiftAidMetadata(
    giftAidDeclarationService,
    payload,
    isGiftAidEnabled(),
  );
  let recurringAgreementId = normalizeString(
    payload.recurringAgreementId as string | undefined,
  );
  const declarationId = normalizeString(payload.giftAidDeclarationId);

  if (recurringAgreementId === '' && isProviderBackedRecurringStagingRow(row)) {
    recurringAgreementId = await createProviderBackedRecurringAgreement({
      client,
      row,
      payload,
    });
  }

  const createData = { ...payload } as Record<string, unknown>;
  delete createData.donorId;
  delete createData.donorMailingAddress;
  delete createData.giftAidDeclarationId;
  delete createData.recurringAgreementId;
  const appealId = normalizeString(payload.appealId as string | undefined);
  const fundId = normalizeString(payload.fundId as string | undefined);
  delete createData.appealId;
  delete createData.fundId;
  const result = await client.mutation({
    createGift: {
      __args: {
        data: {
          ...createData,
          donor: {
            connect: {
              where: {
                id: donorId,
              },
            },
          },
          ...(declarationId !== ''
            ? {
                giftAidDeclaration: {
                  connect: {
                    where: {
                      id: declarationId,
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
        },
      },
      id: true,
    },
  } as any);

  const giftId = result?.createGift?.id;

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

  await applyLinkedDonorEmailUpdates(client, [row]);

  return {
    id: row.id,
    committedGiftId: giftId,
    donorId,
    ...(appealId !== '' ? { appealId } : {}),
    processingStatus: 'PROCESSED',
    errorDetail: null,
    giftReadyStatus: null,
    executionPath: 'ROW_FALLBACK',
    ...(recurringAgreementId !== '' ? { recurringAgreementId } : {}),
    giftAidStatus:
      typeof payload.giftAidStatus === 'string' ? payload.giftAidStatus : null,
  };
};
