import { CoreApiClient } from 'twenty-client-sdk/core';
import { createGiftAidDeclarationService } from 'src/gift-aid/gift-aid.declarations';
import { attachGiftsToCurrentDraftClaimBatch } from 'src/gift-aid-claims/gift-aid-claim-batch';
import { isGiftAidEnabled } from 'src/gift-aid/gift-aid-config';
import { applyGiftAidMetadata } from 'src/gift-aid/gift-aid.policy';
import {
  hasLinkedDonorForProcessing,
  hasSufficientDonorEvidenceForNewDonor,
  isGiftStagingProcessable,
} from 'src/gift-staging-review/gift-staging-processability';
import { advanceRecurringAgreementExpectation } from 'src/recurring/recurring.service';
import type { RecurringAgreementCadence } from 'src/recurring/recurring.types';
import type { BatchProcessingRow } from './batch-processing.types';

const MAX_BATCH_SIZE = 60;
const GIFT_CREATE_CHUNK_SIZE = 30;
const WRITEBACK_CHUNK_SIZE = 60;
const CHUNK_DELAY_MS = 700;

type SuccessfulWriteback = {
  id: string;
  committedGiftId: string;
  recurringAgreementId?: string;
  processingStatus: 'PROCESSED';
  errorDetail: null;
  isReadyForProcessing: false;
  executionPath: 'BATCH' | 'ROW_FALLBACK';
  giftAidStatus: string | null;
};

type FailedWriteback = {
  id: string;
  processingStatus: 'PROCESS_FAILED';
  errorDetail: string;
  executionPath: 'BATCH' | 'ROW_FALLBACK';
};

type NotReadyWriteback = {
  id: string;
  processingStatus: 'NOT_PROCESSED';
  errorDetail: null;
};

type RowWriteback =
  | SuccessfulWriteback
  | FailedWriteback
  | NotReadyWriteback;

type BatchGiftEntry = {
  row: BatchProcessingRow;
  payload: Record<string, unknown>;
};

export type BatchExecutionMetrics = {
  chunkCount: number;
  batchPathProcessed: number;
  batchPathFailed: number;
  rowFallbackProcessed: number;
  rowFallbackFailed: number;
};

export type BatchCreateResult = {
  successfulWritebacks: SuccessfulWriteback[];
  failedWritebacks: FailedWriteback[];
  metrics: BatchExecutionMetrics;
};

class CorrelationContractFailure extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CorrelationContractFailure';
  }
}

const getRestConfig = () => {
  const apiBaseUrl = process.env.TWENTY_API_URL;
  const token =
    process.env.TWENTY_APP_ACCESS_TOKEN ?? process.env.TWENTY_API_KEY;

  if (!apiBaseUrl || !token) {
    throw new Error('Twenty REST configuration missing');
  }

  return {
    apiBaseUrl: apiBaseUrl.replace(/\/$/, ''),
    token,
  };
};

const sleep = async (delayMs: number) => {
  await new Promise((resolve) => setTimeout(resolve, delayMs));
};

const requestTwentyRest = async <T>({
  path,
  method,
  body,
}: {
  path: string;
  method: 'POST';
  body: unknown;
}): Promise<T> => {
  const { apiBaseUrl, token } = getRestConfig();
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const rawBody = await response.text();

  if (!response.ok) {
    throw new Error(rawBody || `Twenty REST request failed with ${response.status}`);
  }

  if (rawBody.trim() === '') {
    return null as T;
  }

  return JSON.parse(rawBody) as T;
};

const normalizeString = (value: string | null | undefined) =>
  typeof value === 'string' ? value.trim() : '';

const normalizeEmail = (value: string | null | undefined) =>
  normalizeString(value).toLowerCase();

const normalizeProviderForRecurringAgreement = (
  value: string | null | undefined,
) => normalizeString(value).toUpperCase();

const isProviderBackedRecurringStagingRow = (row: BatchProcessingRow) =>
  normalizeString(row.recurringAgreement?.id) === '' &&
  normalizeProviderForRecurringAgreement(row.provider) !== '' &&
  normalizeString(row.providerAgreementId) !== '';

const requiresRecurringRowFallback = (row: BatchProcessingRow) =>
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

const buildGiftPayloadFromRow = (row: BatchProcessingRow) => {
  const amountMicros = row.amount?.amountMicros;
  const currencyCode = normalizeString(row.amount?.currencyCode);
  const donorId = normalizeString(row.donor?.id);
  const donorFirstName = normalizeString(row.donorFirstName);
  const donorLastName = normalizeString(row.donorLastName);
  const donorEmail = normalizeString(row.donorEmail);
  const giftDate = normalizeString(row.giftDate);

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

type DonorEmailsUpdate = {
  donorId: string;
  emails: {
    primaryEmail: string | null;
    additionalEmails: string[] | null;
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

const applyLinkedDonorEmailUpdates = async (
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

const createGiftViaRowFallback = async (
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
    processingStatus: 'PROCESSED',
    errorDetail: null,
    isReadyForProcessing: false,
    executionPath: 'ROW_FALLBACK',
    ...(recurringAgreementId !== '' ? { recurringAgreementId } : {}),
    giftAidStatus:
      typeof payload.giftAidStatus === 'string' ? payload.giftAidStatus : null,
  };
};

const parseCreatedGiftIds = (
  response: unknown,
  expectedLength: number,
): string[] => {
  const body =
    response && typeof response === 'object'
      ? (response as { data?: { createGifts?: Array<{ id?: unknown }> } })
      : undefined;

  const created = Array.isArray(body?.data?.createGifts)
    ? body.data.createGifts
    : [];

  if (created.length !== expectedLength) {
    throw new CorrelationContractFailure(
      `Unexpected createGifts response length: expected ${expectedLength}, got ${created.length}`,
    );
  }

  return created.map((record) => {
    if (typeof record?.id !== 'string' || record.id.trim() === '') {
      throw new CorrelationContractFailure(
        'Batch create response missing gift id',
      );
    }

    return record.id.trim();
  });
};

const createBatchGiftChunk = async (
  entries: BatchGiftEntry[],
): Promise<SuccessfulWriteback[]> => {
  const response = await requestTwentyRest<unknown>({
    path: '/rest/batch/gifts?depth=0',
    method: 'POST',
    body: entries.map((entry) => entry.payload),
  });
  const giftIds = parseCreatedGiftIds(response, entries.length);

  const client = new CoreApiClient();
  await applyLinkedDonorEmailUpdates(
    client,
    entries.map((entry) => entry.row),
  );

  return entries.map((entry, index) => ({
    id: entry.row.id,
    committedGiftId: giftIds[index],
    processingStatus: 'PROCESSED' as const,
    errorDetail: null,
    isReadyForProcessing: false as const,
    executionPath: 'BATCH' as const,
    giftAidStatus:
      typeof entry.payload.giftAidStatus === 'string'
        ? (entry.payload.giftAidStatus as string)
        : null,
  }));
};

const chunkArray = <T,>(items: T[], size: number): T[][] => {
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
};

const buildFailedWriteback = ({
  rowId,
  errorDetail,
  executionPath,
}: {
  rowId: string;
  errorDetail: string;
  executionPath: 'BATCH' | 'ROW_FALLBACK';
}): FailedWriteback => {
  return {
    id: rowId,
    processingStatus: 'PROCESS_FAILED',
    errorDetail,
    executionPath,
  };
};

const createBatchChunkWithFallback = async (
  entries: BatchGiftEntry[],
): Promise<BatchCreateResult> => {
  if (entries.length === 0) {
    return {
      successfulWritebacks: [],
      failedWritebacks: [],
      metrics: {
        chunkCount: 0,
        batchPathProcessed: 0,
        batchPathFailed: 0,
        rowFallbackProcessed: 0,
        rowFallbackFailed: 0,
      },
    };
  }

  try {
    return {
      successfulWritebacks: await createBatchGiftChunk(entries),
      failedWritebacks: [],
      metrics: {
        chunkCount: 1,
        batchPathProcessed: 0,
        batchPathFailed: 0,
        rowFallbackProcessed: 0,
        rowFallbackFailed: 0,
      },
    };
  } catch (error) {
    if (error instanceof CorrelationContractFailure) {
      return {
        successfulWritebacks: [],
        failedWritebacks: entries.map((entry) =>
          buildFailedWriteback({
            rowId: entry.row.id,
            errorDetail: error.message,
            executionPath: 'BATCH',
          }),
        ),
        metrics: {
          chunkCount: 1,
          batchPathProcessed: 0,
          batchPathFailed: 0,
          rowFallbackProcessed: 0,
          rowFallbackFailed: 0,
        },
      };
    }

    if (entries.length === 1) {
      try {
        return {
          successfulWritebacks: [
            await createGiftViaRowFallback(entries[0].row),
          ],
          failedWritebacks: [],
          metrics: {
            chunkCount: 1,
            batchPathProcessed: 0,
            batchPathFailed: 0,
            rowFallbackProcessed: 0,
            rowFallbackFailed: 0,
          },
        };
      } catch (rowError) {
        return {
          successfulWritebacks: [],
          failedWritebacks: [
            buildFailedWriteback({
              rowId: entries[0].row.id,
              errorDetail:
                rowError instanceof Error
                  ? rowError.message
                  : 'Row fallback failed',
              executionPath: 'ROW_FALLBACK',
            }),
          ],
          metrics: {
            chunkCount: 1,
            batchPathProcessed: 0,
            batchPathFailed: 0,
            rowFallbackProcessed: 0,
            rowFallbackFailed: 0,
          },
        };
      }
    }

    const midpoint = Math.ceil(entries.length / 2);
    const left = await createBatchChunkWithFallback(entries.slice(0, midpoint));
    const right = await createBatchChunkWithFallback(entries.slice(midpoint));

    return {
      successfulWritebacks: [
        ...left.successfulWritebacks,
        ...right.successfulWritebacks,
      ],
      failedWritebacks: [...left.failedWritebacks, ...right.failedWritebacks],
      metrics: {
        chunkCount: left.metrics.chunkCount + right.metrics.chunkCount,
        batchPathProcessed: 0,
        batchPathFailed: 0,
        rowFallbackProcessed: 0,
        rowFallbackFailed: 0,
      },
    };
  }
};

const prepareBatchGiftEntries = async (
  rows: BatchProcessingRow[],
): Promise<{
  entries: BatchGiftEntry[];
  preflightFailures: FailedWriteback[];
  directRowFallbackSuccesses: SuccessfulWriteback[];
}> => {
  const entries: BatchGiftEntry[] = [];
  const preflightFailures: FailedWriteback[] = [];
  const directRowFallbackSuccesses: SuccessfulWriteback[] = [];
  const client = new CoreApiClient();
  const giftAidDeclarationService = createGiftAidDeclarationService(client);

  for (const row of rows) {
    try {
      // Recurring-linked rows stay on the explicit row path until batch create
      // has proven parity for linkage and next-expected advancement semantics.
      if (
        requiresRecurringRowFallback(row) ||
        !hasLinkedDonorForProcessing({ linkedDonorId: row.donor?.id })
      ) {
        directRowFallbackSuccesses.push(await createGiftViaRowFallback(row));
        continue;
      }

      const payload = await applyGiftAidMetadata(
        giftAidDeclarationService,
        buildGiftPayloadFromRow(row),
        isGiftAidEnabled(),
      );
      entries.push({
        row,
        payload,
      });
    } catch (error) {
      preflightFailures.push(
        buildFailedWriteback({
          rowId: row.id,
          errorDetail:
            error instanceof Error
              ? error.message
              : 'Unable to build gift payload for row',
          executionPath: 'ROW_FALLBACK',
        }),
      );
    }
  }

  return {
    entries,
    preflightFailures,
    directRowFallbackSuccesses,
  };
};

const writeBackChunk = async (chunk: RowWriteback[]) => {
  const persistedChunk = chunk.map((record) => {
    const persistedRecord: Record<string, unknown> = {
      id: record.id,
      processingStatus: record.processingStatus,
      errorDetail: record.errorDetail,
    };

    if ('committedGiftId' in record) {
      persistedRecord.committedGiftId = record.committedGiftId;
      persistedRecord.isReadyForProcessing = record.isReadyForProcessing;

      if (normalizeString(record.recurringAgreementId) !== '') {
        persistedRecord.recurringAgreementId = record.recurringAgreementId;
      }
    }

    return persistedRecord;
  });

  const response = await requestTwentyRest<unknown>({
    path: '/rest/batch/giftStagings?upsert=true&depth=0',
    method: 'POST',
    body: persistedChunk,
  });

  const body =
    response && typeof response === 'object'
      ? (response as {
          data?: { createGiftStagings?: Array<{ id?: unknown }> };
        })
      : undefined;

  const records = Array.isArray(body?.data?.createGiftStagings)
    ? body.data.createGiftStagings
    : [];

  const returnedIds = new Set(
    records
      .map((record) =>
        typeof record?.id === 'string' ? record.id.trim() : undefined,
      )
      .filter((id): id is string => Boolean(id)),
  );
  const expectedIds = new Set(persistedChunk.map((record) => record.id as string));

  if (returnedIds.size !== expectedIds.size) {
    throw new Error('Batch staging writeback returned unexpected id count');
  }

  for (const id of expectedIds) {
    if (!returnedIds.has(id)) {
      throw new Error(`Batch staging writeback missing id ${id}`);
    }
  }
};

const persistWritebacks = async (writebacks: RowWriteback[]) => {
  const chunks = chunkArray(writebacks, WRITEBACK_CHUNK_SIZE);

  for (let index = 0; index < chunks.length; index += 1) {
    await writeBackChunk(chunks[index]);

    if (index < chunks.length - 1) {
      await sleep(CHUNK_DELAY_MS);
    }
  }
};

export const executeBatchGiftProcessing = async (
  rows: BatchProcessingRow[],
): Promise<BatchCreateResult> => {
  const { entries, preflightFailures, directRowFallbackSuccesses } =
    await prepareBatchGiftEntries(rows);
  const chunks = chunkArray(entries, GIFT_CREATE_CHUNK_SIZE);
  const result: BatchCreateResult = {
    successfulWritebacks: [...directRowFallbackSuccesses],
    failedWritebacks: [...preflightFailures],
    metrics: {
      chunkCount: 0,
      batchPathProcessed: 0,
      batchPathFailed: 0,
      rowFallbackProcessed: 0,
      rowFallbackFailed: 0,
    },
  };

  for (let index = 0; index < chunks.length; index += 1) {
    const chunkResult = await createBatchChunkWithFallback(chunks[index]);
    result.successfulWritebacks.push(...chunkResult.successfulWritebacks);
    result.failedWritebacks.push(...chunkResult.failedWritebacks);
    result.metrics.chunkCount += chunkResult.metrics.chunkCount;

    if (index < chunks.length - 1) {
      await sleep(CHUNK_DELAY_MS);
    }
  }

  await persistWritebacks([
    ...result.successfulWritebacks,
    ...result.failedWritebacks,
  ]);

  if (isGiftAidEnabled()) {
    const claimableGiftIds = result.successfulWritebacks
      .filter((writeback) => writeback.giftAidStatus === 'CLAIMABLE')
      .map((writeback) => writeback.committedGiftId);

    if (claimableGiftIds.length > 0) {
      const client = new CoreApiClient();
      await attachGiftsToCurrentDraftClaimBatch(client, claimableGiftIds);
    }
  }

  result.metrics.batchPathProcessed = result.successfulWritebacks.filter(
    (writeback) => writeback.executionPath === 'BATCH',
  ).length;
  result.metrics.batchPathFailed = result.failedWritebacks.filter(
    (writeback) => writeback.executionPath === 'BATCH',
  ).length;
  result.metrics.rowFallbackProcessed = result.successfulWritebacks.filter(
    (writeback) => writeback.executionPath === 'ROW_FALLBACK',
  ).length;
  result.metrics.rowFallbackFailed = result.failedWritebacks.filter(
    (writeback) => writeback.executionPath === 'ROW_FALLBACK',
  ).length;

  return result;
};

export const buildNotReadyWritebacks = (
  rows: BatchProcessingRow[],
): NotReadyWriteback[] => {
  return rows
    .filter((row) => row.processingStatus !== 'PROCESS_FAILED')
    .map((row) => ({
      id: row.id,
      processingStatus: 'NOT_PROCESSED',
      errorDetail: null,
    }));
};

export const persistBatchRowWritebacks = async (
  writebacks: RowWriteback[],
) => {
  if (writebacks.length === 0) {
    return;
  }

  await persistWritebacks(writebacks);
};

export const canProcessBatchRow = (row: BatchProcessingRow) => {
  return isGiftStagingProcessable({
    processingStatus: row.processingStatus,
    donorResolutionState: row.donorResolutionState,
    donorFirstName: row.donorFirstName,
    donorLastName: row.donorLastName,
    linkedDonorId: row.donor?.id,
  });
};

export const getBatchProcessingLimits = () => {
  return {
    maxBatchSize: MAX_BATCH_SIZE,
    giftCreateChunkSize: GIFT_CREATE_CHUNK_SIZE,
    writebackChunkSize: WRITEBACK_CHUNK_SIZE,
    chunkDelayMs: CHUNK_DELAY_MS,
  };
};
