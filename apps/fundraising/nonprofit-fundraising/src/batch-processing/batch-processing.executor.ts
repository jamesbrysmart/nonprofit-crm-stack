import { CoreApiClient } from 'twenty-client-sdk/core';
import { createGiftAidDeclarationService } from 'src/gift-aid/gift-aid.declarations';
import { attachGiftsToCurrentDraftClaimBatch } from 'src/gift-aid-claims/gift-aid-claim-batch';
import { isGiftAidEnabled } from 'src/gift-aid/gift-aid-config';
import { applyGiftAidMetadata } from 'src/gift-aid/gift-aid.policy';
import { advanceRecurringAgreementExpectation } from 'src/recurring/recurring.service';
import type { BatchProcessingRow } from './batch-processing.types';

const MAX_BATCH_SIZE = 60;
const GIFT_CREATE_CHUNK_SIZE = 30;
const WRITEBACK_CHUNK_SIZE = 60;
const CHUNK_DELAY_MS = 700;

type SuccessfulWriteback = {
  id: string;
  committedGiftId: string;
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
  processingStatus: 'NOT_READY';
  errorDetail: null;
};

type PendingWriteback = {
  id: string;
  processingStatus: 'PENDING';
  errorDetail: null;
};

type RowWriteback =
  | SuccessfulWriteback
  | FailedWriteback
  | NotReadyWriteback
  | PendingWriteback;

type BatchGiftEntry = {
  row: BatchProcessingRow;
  payload: Record<string, unknown>;
};

const requiresRecurringRowFallback = (row: BatchProcessingRow) =>
  normalizeString(row.recurringAgreement?.id) !== '';

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

  if (donorId === '') {
    throw new Error('Linked donor is required for batch processing');
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
    donorId,
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

const createGiftViaRowFallback = async (
  row: BatchProcessingRow,
): Promise<SuccessfulWriteback> => {
  const client = new CoreApiClient();
  const giftAidDeclarationService = createGiftAidDeclarationService(client);
  const payload = await applyGiftAidMetadata(
    giftAidDeclarationService,
    buildGiftPayloadFromRow(row),
    isGiftAidEnabled(),
  );
  const recurringAgreementId = normalizeString(
    payload.recurringAgreementId as string | undefined,
  );
  const donorId = normalizeString(payload.donorId);
  const declarationId = normalizeString(payload.giftAidDeclarationId);
  const createData = { ...payload } as Record<string, unknown>;
  delete createData.donorId;
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

  return {
    id: row.id,
    committedGiftId: giftId,
    processingStatus: 'PROCESSED',
    errorDetail: null,
    isReadyForProcessing: false,
    executionPath: 'ROW_FALLBACK',
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
      if (requiresRecurringRowFallback(row)) {
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

export const buildPendingWritebacks = (
  rows: BatchProcessingRow[],
): PendingWriteback[] => {
  return rows.map((row) => ({
    id: row.id,
    processingStatus: 'PENDING',
    errorDetail: null,
  }));
};

export const buildNotReadyWritebacks = (
  rows: BatchProcessingRow[],
): NotReadyWriteback[] => {
  return rows
    .filter((row) => row.processingStatus !== 'PROCESS_FAILED')
    .map((row) => ({
      id: row.id,
      processingStatus: 'NOT_READY',
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
  return Boolean(
    row.processingStatus !== 'PROCESSED' &&
      row.isReadyForProcessing === true &&
      row.hasCoreGiftIssue !== true &&
      row.donorResolutionState === 'CONFIRMED' &&
      row.donor?.id,
  );
};

export const getBatchProcessingLimits = () => {
  return {
    maxBatchSize: MAX_BATCH_SIZE,
    giftCreateChunkSize: GIFT_CREATE_CHUNK_SIZE,
    writebackChunkSize: WRITEBACK_CHUNK_SIZE,
    chunkDelayMs: CHUNK_DELAY_MS,
  };
};
