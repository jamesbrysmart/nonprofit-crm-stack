import { postTwentyRest } from 'src/app-api/twenty-rest-client';
import { createGiftAidDeclarationService } from 'src/gift-aid/gift-aid.declarations';
import { buildGiftAidIntake } from 'src/gift-aid/gift-aid-intake';
import { isGiftAidEnabled } from 'src/gift-aid/gift-aid-config';
import { applyGiftAidMetadata } from 'src/gift-aid/gift-aid.policy';
import { persistGiftStagingBatchUpserts } from 'src/gift-staging/gift-staging-bulk-writeback';
import { hasLinkedDonorForProcessing } from 'src/gift-staging-review/gift-staging-processability';
import {
  applyLinkedDonorUpdates,
  buildGiftPayloadFromRow,
  createGiftViaRowFallback,
  requiresRecurringRowFallback,
  type BatchGiftEntry,
  type FailedWriteback,
  type NotReadyWriteback,
  type RowWriteback,
  type SuccessfulWriteback,
} from './batch-processing.executor.support';
import {
  finalizeBatchExecutionMetrics,
  runBatchProcessingSideEffects,
} from './batch-processing.executor.effects';
import type { BatchProcessingRow } from './batch-processing.types';
import { normalizeString } from 'src/utils/normalize-string';
import { chunkArray } from 'src/utils/chunk-array';
import { isRateLimitError } from 'src/core-api/rate-limit-retry';
import { createCoreApiClient } from 'src/core-api/rate-limit-retry';

export {
  buildNewPersonCreateData,
  deriveLinkedDonorEmailUpdate,
  deriveLinkedDonorSupporterEmailOptOutUpdate,
  deriveRecurringCadenceFromProviderEvidence,
} from './batch-processing.executor.support';

const GIFT_CREATE_CHUNK_SIZE = 30;
const WRITEBACK_CHUNK_SIZE = 60;
const CHUNK_DELAY_MS = 700;

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

export type SingleGiftProcessingResult = {
  writeback: RowWriteback;
  stagingWritebackSucceeded: boolean;
  reconciliationError: string | null;
};

const sleep = async (delayMs: number) => {
  await new Promise((resolve) => setTimeout(resolve, delayMs));
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
    throw new Error(
      `Unexpected createGifts response length: expected ${expectedLength}, got ${created.length}`,
    );
  }

  const ids = created.map((record) => {
    if (typeof record?.id !== 'string' || record.id.trim() === '') {
      throw new Error('Batch create response missing gift id');
    }

    return record.id.trim();
  });

  if (new Set(ids).size !== ids.length) {
    throw new Error('Batch create response contains duplicate gift ids');
  }

  return ids;
};

class GiftCreateRateLimitedError extends Error {
  constructor(readonly rateLimitError: unknown) {
    super('Gift creation was rate limited before it ran');
  }
}

// parseCreatedGiftIds guarantees one ID per entry; this keeps that explicit.
const giftIdAt = (giftIds: string[], index: number) => {
  const giftId = giftIds[index];

  if (giftId === undefined) {
    throw new Error(`Created gift response has no ID for entry ${index}`);
  }

  return giftId;
};

const createBatchGiftChunk = async (
  entries: BatchGiftEntry[],
): Promise<SuccessfulWriteback[]> => {
  let response: unknown;

  try {
    response = await postTwentyRest<unknown>({
      path: '/rest/batch/gifts?depth=0',
      body: entries.map((entry) => entry.payload),
    });
  } catch (error) {
    // Twenty rejects a rate-limited request before running it.
    if (isRateLimitError(error)) {
      throw new GiftCreateRateLimitedError(error);
    }

    throw error;
  }

  const giftIds = parseCreatedGiftIds(response, entries.length);

  await applyLinkedDonorUpdates(entries.map((entry) => entry.row));

  return entries.map((entry, index) => ({
    id: entry.row.id,
    committedGiftId: giftIdAt(giftIds, index),
    donorId: normalizeString(entry.row.donor?.id),
    ...(normalizeString(entry.payload.companyId as string | undefined) !== ''
      ? {
          companyId: normalizeString(
            entry.payload.companyId as string | undefined,
          ),
        }
      : {}),
    ...(normalizeString(entry.payload.appealId as string | undefined) !== ''
      ? {
          appealId: normalizeString(
            entry.payload.appealId as string | undefined,
          ),
        }
      : {}),
    ...(normalizeString(entry.payload.appealSourceId as string | undefined) !==
    ''
      ? {
          appealSourceId: normalizeString(
            entry.payload.appealSourceId as string | undefined,
          ),
        }
      : {}),
    processingStatus: 'PROCESSED' as const,
    errorDetail: null,
    giftReadyStatus: null,
    executionPath: 'BATCH' as const,
    giftAidStatus:
      typeof entry.payload.giftAidStatus === 'string'
        ? (entry.payload.giftAidStatus as string)
        : null,
  }));
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
    giftReadyStatus: null,
    executionPath,
  };
};

const executeBatchGiftChunk = async (
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
    if (error instanceof GiftCreateRateLimitedError) {
      return {
        successfulWritebacks: [],
        failedWritebacks: entries.map((entry) =>
          buildFailedWriteback({
            rowId: entry.row.id,
            errorDetail:
              'Twenty is rate limiting requests, so no gift was created for this row. It is safe to process it again shortly.',
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

    // A failed response does not prove the server rolled back its write.
    // Splitting or switching to row creation can duplicate committed gifts.
    const reason =
      error instanceof Error ? error.message : 'Gift creation failed';
    return {
      successfulWritebacks: [],
      failedWritebacks: entries.map((entry) =>
        buildFailedWriteback({
          rowId: entry.row.id,
          errorDetail: `Gift creation outcome could not be confirmed. Reconcile before retrying. ${reason}`,
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
  const client = createCoreApiClient();
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

      const intake = buildGiftPayloadFromRow(row);
      const payload = await applyGiftAidMetadata(
        giftAidDeclarationService,
        intake,
        isGiftAidEnabled(),
      );
      entries.push({
        row,
        payload: { ...payload, ...buildGiftAidIntake(intake, row.donor?.id) },
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

const persistWritebacks = async (writebacks: RowWriteback[]) => {
  await persistGiftStagingBatchUpserts(
    writebacks.map((record) => {
      const persistedRecord: Record<string, unknown> = {
        id: record.id,
        processingStatus: record.processingStatus,
        errorDetail: record.errorDetail,
      };

      if ('committedGiftId' in record) {
        persistedRecord.committedGiftId = record.committedGiftId;
        persistedRecord.giftReadyStatus = record.giftReadyStatus;

        if (normalizeString(record.recurringAgreementId) !== '') {
          persistedRecord.recurringAgreementId = record.recurringAgreementId;
        }
      } else if ('giftReadyStatus' in record) {
        persistedRecord.giftReadyStatus = record.giftReadyStatus;
      }

      return persistedRecord as { id: string } & Record<string, unknown>;
    }),
    {
      chunkSize: WRITEBACK_CHUNK_SIZE,
      delayMs: CHUNK_DELAY_MS,
    },
  );
};

export const executeSingleGiftProcessing = async (
  row: BatchProcessingRow,
): Promise<SingleGiftProcessingResult> => {
  const { entries, preflightFailures, directRowFallbackSuccesses } =
    await prepareBatchGiftEntries([row]);

  let writeback: RowWriteback | null =
    directRowFallbackSuccesses[0] ?? preflightFailures[0] ?? null;

  if (!writeback && entries[0]) {
    const chunkResult = await executeBatchGiftChunk([entries[0]]);
    writeback =
      chunkResult.successfulWritebacks[0] ??
      chunkResult.failedWritebacks[0] ??
      null;
  }

  if (!writeback) {
    throw new Error('Single-row processing produced no writeback result');
  }

  let stagingWritebackSucceeded = true;
  let reconciliationError: string | null = null;

  try {
    await persistWritebacks([writeback]);
  } catch (error) {
    stagingWritebackSucceeded = false;
    reconciliationError =
      error instanceof Error
        ? error.message
        : 'Staging reconciliation failed after processing';
  }

  if ('committedGiftId' in writeback) {
    await runBatchProcessingSideEffects([writeback]);
  }

  return {
    writeback,
    stagingWritebackSucceeded,
    reconciliationError,
  };
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

  for (const [index, chunk] of chunks.entries()) {
    const chunkResult = await executeBatchGiftChunk(chunk);
    result.successfulWritebacks.push(...chunkResult.successfulWritebacks);
    result.failedWritebacks.push(...chunkResult.failedWritebacks);
    result.metrics.chunkCount += chunkResult.metrics.chunkCount;

    if (index < chunks.length - 1) {
      await sleep(CHUNK_DELAY_MS);
    }
  }

  try {
    await persistWritebacks([
      ...result.successfulWritebacks,
      ...result.failedWritebacks,
    ]);
  } catch (error) {
    const reason =
      error instanceof Error ? error.message : 'Staging writeback failed';
    const committedIds = result.successfulWritebacks
      .map((writeback) => `${writeback.id}:${writeback.committedGiftId}`)
      .join(', ');
    throw new Error(
      `Staging reconciliation failed. Reconcile before retrying. ${reason}` +
        (committedIds ? ` Committed staging:gift ids: ${committedIds}` : ''),
    );
  }

  await runBatchProcessingSideEffects(result.successfulWritebacks);
  finalizeBatchExecutionMetrics({
    successfulWritebacks: result.successfulWritebacks,
    failedWritebacks: result.failedWritebacks,
    metrics: result.metrics,
  });

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
      giftReadyStatus: 'NEEDS_REVIEW',
    }));
};

export const persistBatchRowWritebacks = async (writebacks: RowWriteback[]) => {
  if (writebacks.length === 0) {
    return;
  }

  await persistWritebacks(writebacks);
};

