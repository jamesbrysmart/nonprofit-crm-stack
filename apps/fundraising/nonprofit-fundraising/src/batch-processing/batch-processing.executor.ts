import { CoreApiClient } from 'twenty-client-sdk/core';
import { postTwentyRest } from 'src/app-api/twenty-rest-client';
import { classifyBatchPreflight } from 'src/batch-processing/batch-processing.preflight';
import { createGiftAidDeclarationService } from 'src/gift-aid/gift-aid.declarations';
import { isGiftAidEnabled } from 'src/gift-aid/gift-aid-config';
import { applyGiftAidMetadata } from 'src/gift-aid/gift-aid.policy';
import { persistGiftStagingBatchUpserts } from 'src/gift-staging/gift-staging-bulk-writeback';
import { hasLinkedDonorForProcessing } from 'src/gift-staging-review/gift-staging-processability';
import {
  applyLinkedDonorEmailUpdates,
  buildGiftPayloadFromRow,
  createGiftViaRowFallback,
  normalizeString,
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

export {
  deriveLinkedDonorEmailUpdate,
  deriveRecurringCadenceFromProviderEvidence,
} from './batch-processing.executor.support';

const MAX_BATCH_SIZE = 60;
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

class CorrelationContractFailure extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CorrelationContractFailure';
  }
}

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
  const response = await postTwentyRest<unknown>({
    path: '/rest/batch/gifts?depth=0',
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
    donorId: normalizeString(entry.row.donor?.id),
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
    giftReadyStatus: null,
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

export const persistBatchRowWritebacks = async (
  writebacks: RowWriteback[],
) => {
  if (writebacks.length === 0) {
    return;
  }

  await persistWritebacks(writebacks);
};

export const canProcessBatchRow = (row: BatchProcessingRow) => {
  return classifyBatchPreflight(row).category === 'READY';
};

export const getBatchProcessingLimits = () => {
  return {
    maxBatchSize: MAX_BATCH_SIZE,
    giftCreateChunkSize: GIFT_CREATE_CHUNK_SIZE,
    writebackChunkSize: WRITEBACK_CHUNK_SIZE,
    chunkDelayMs: CHUNK_DELAY_MS,
  };
};
