import { CoreApiClient } from 'twenty-client-sdk/core';
import { applyGiftAidMetadata } from 'src/gift-aid/gift-aid.policy';
import { attachGiftToCurrentDraftIfClaimable } from 'src/gift-aid-claims/gift-aid-claim-batch';
import type { BatchReviewRow } from './batch-processing.types';

const MAX_BATCH_SIZE = 60;
const GIFT_CREATE_CHUNK_SIZE = 30;
const WRITEBACK_CHUNK_SIZE = 60;
const CHUNK_DELAY_MS = 700;
const isGiftAidEnabled =
  (process.env.GIFT_AID_ENABLED ?? 'false').toLowerCase() === 'true';

type SuccessfulWriteback = {
  id: string;
  committedGiftId: string;
  processingStatus: 'PROCESSED';
  processingOutcome: 'NOT_RUN';
  errorDetail: null;
  isReadyForProcessing: false;
  executionPath: 'BATCH' | 'ROW_FALLBACK';
};

type FailedWriteback = {
  id: string;
  processingStatus: 'PROCESS_FAILED';
  processingOutcome: 'FAILED';
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

export type RowWriteback =
  | SuccessfulWriteback
  | FailedWriteback
  | NotReadyWriteback
  | PendingWriteback;

type BatchGiftEntry = {
  row: BatchReviewRow;
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
  method: 'POST' | 'PATCH';
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

const parseAmountMicros = (amountValue: string) => {
  const sanitized = amountValue.replace(/[^0-9.-]/g, '');
  const parsed = Number.parseFloat(sanitized);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`Amount "${amountValue}" is not a valid positive amount`);
  }

  return Math.round(parsed * 1_000_000);
};

const buildGiftPayloadFromRow = (row: BatchReviewRow) => {
  if (!row.donor?.id) {
    throw new Error('Linked donor is required for batch gift creation');
  }

  return {
    name: `Gift from ${(row.donorFirstName ?? '').trim()} ${(row.donorLastName ?? '').trim()}`.trim(),
    amount: {
      currencyCode: 'GBP',
      amountMicros: parseAmountMicros(row.amount),
    },
    giftDate: row.giftDate
      ? row.giftDate.slice(0, 10)
      : new Date().toISOString().slice(0, 10),
    donorFirstName: row.donorFirstName ?? '',
    donorLastName: row.donorLastName ?? '',
    ...(row.donorEmail ? { donorEmail: row.donorEmail } : {}),
    donorId: row.donor.id,
    giftAidRequested: row.giftAidRequested === true,
    giftAidDeclarationCaptured: row.giftAidDeclarationCaptured === true,
    ...(row.giftAidDeclarationDate
      ? { giftAidDeclarationDate: row.giftAidDeclarationDate.slice(0, 10) }
      : {}),
    ...(row.giftAidCoverageScope
      ? { giftAidCoverageScope: row.giftAidCoverageScope }
      : {}),
    ...(row.giftAidDeclarationSource
      ? { giftAidDeclarationSource: row.giftAidDeclarationSource }
      : {}),
    ...(row.giftAidTextVersion ? { giftAidTextVersion: row.giftAidTextVersion } : {}),
    ...(row.giftAidDeclaration?.id
      ? { giftAidDeclarationId: row.giftAidDeclaration.id }
      : {}),
  };
};

const buildEvaluatedGiftPayloadFromRow = async (
  client: CoreApiClient,
  row: BatchReviewRow,
) => {
  return await applyGiftAidMetadata(
    client,
    buildGiftPayloadFromRow(row) as any,
    isGiftAidEnabled,
  );
};

const createGiftViaRowFallback = async (
  row: BatchReviewRow,
): Promise<SuccessfulWriteback> => {
  const client = new CoreApiClient();
  const payload = await buildEvaluatedGiftPayloadFromRow(client, row);
  const result = await client.mutation({
    createGift: {
      __args: {
        data: payload,
      },
      id: true,
    },
  } as any);

  const giftId = result?.createGift?.id;

  if (typeof giftId !== 'string' || giftId === '') {
    throw new Error('Create gift response missing id');
  }

  await attachGiftToCurrentDraftIfClaimable(client, giftId, payload as any);

  return {
    id: row.id,
    committedGiftId: giftId,
    processingStatus: 'PROCESSED',
    processingOutcome: 'NOT_RUN',
    errorDetail: null,
    isReadyForProcessing: false,
    executionPath: 'ROW_FALLBACK',
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

  for (const [index, entry] of entries.entries()) {
    await attachGiftToCurrentDraftIfClaimable(
      client,
      giftIds[index],
      entry.payload as any,
    );
  }

  return entries.map((entry, index) => ({
    id: entry.row.id,
    committedGiftId: giftIds[index],
    processingStatus: 'PROCESSED' as const,
    processingOutcome: 'NOT_RUN' as const,
    errorDetail: null,
    isReadyForProcessing: false as const,
    executionPath: 'BATCH' as const,
  }));
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
        failedWritebacks: entries.map((entry) => ({
          id: entry.row.id,
          processingStatus: 'PROCESS_FAILED' as const,
          processingOutcome: 'FAILED' as const,
          errorDetail: error.message,
          executionPath: 'BATCH' as const,
        })),
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
            {
              id: entries[0].row.id,
              processingStatus: 'PROCESS_FAILED',
              processingOutcome: 'FAILED',
              errorDetail:
                rowError instanceof Error
                  ? rowError.message
                  : 'Row fallback failed',
              executionPath: 'ROW_FALLBACK',
            },
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
    processingOutcome: 'FAILED',
    errorDetail,
    executionPath,
  };
};

const prepareBatchGiftEntries = async (
  rows: BatchReviewRow[],
): Promise<{
  entries: BatchGiftEntry[];
  preflightFailures: FailedWriteback[];
}> => {
  const client = new CoreApiClient();
  const entries: BatchGiftEntry[] = [];
  const preflightFailures: FailedWriteback[] = [];

  for (const row of rows) {
    try {
      entries.push({
        row,
        payload: await buildEvaluatedGiftPayloadFromRow(client, row),
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
  };
};

const writeBackChunk = async (chunk: RowWriteback[]) => {
  const persistedChunk = chunk.map((record) => {
    if ('executionPath' in record) {
      const persistedRecord = { ...record };
      delete persistedRecord.executionPath;

      return persistedRecord;
    }

    return record;
  });

  const response = await requestTwentyRest<unknown>({
    path: '/rest/batch/stagingReviewItems?upsert=true&depth=0',
    method: 'POST',
    body: persistedChunk,
  });

  const body =
    response && typeof response === 'object'
      ? (response as {
          data?: { createStagingReviewItems?: Array<{ id?: unknown }> };
        })
      : undefined;

  const records = Array.isArray(body?.data?.createStagingReviewItems)
    ? body.data.createStagingReviewItems
    : [];

  const returnedIds = new Set(
    records
      .map((record) =>
        typeof record?.id === 'string' ? record.id.trim() : undefined,
      )
      .filter((id): id is string => Boolean(id)),
  );
  const expectedIds = new Set(persistedChunk.map((record) => record.id));

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
  rows: BatchReviewRow[],
): Promise<BatchCreateResult> => {
  const { entries, preflightFailures } = await prepareBatchGiftEntries(rows);
  const chunks = chunkArray(entries, GIFT_CREATE_CHUNK_SIZE);
  const result: BatchCreateResult = {
    successfulWritebacks: [],
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
  rows: BatchReviewRow[],
): PendingWriteback[] => {
  return rows.map((row) => ({
    id: row.id,
    processingStatus: 'PENDING',
    errorDetail: null,
  }));
};

export const buildNotReadyWritebacks = (
  rows: BatchReviewRow[],
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

export const canProcessBatchRow = (row: BatchReviewRow) => {
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
