import type { CoreApiClient } from 'twenty-client-sdk/core';
import {
  buildNotReadyWritebacks,
  executeBatchGiftProcessing,
  persistBatchRowWritebacks,
} from 'src/batch-processing/batch-processing.executor';
import { classifyBatchPreflight } from 'src/batch-processing/batch-processing.preflight';
import type { BatchProcessingRow } from 'src/batch-processing/batch-processing.types';
import { persistGiftStagingBatchUpserts } from 'src/gift-staging/gift-staging-bulk-writeback';
import { loadGiftReadyEvaluations } from './gift-ready-status';

export type GiftReadyCheckRowsResult = {
  checkedAt: string;
  actualItemCount: number;
  readyItems: number;
  needsReviewItems: number;
  failedItems: number;
  processedItems: number;
};

export const checkGiftStagingRowsReadiness = async (
  client: CoreApiClient,
  rows: BatchProcessingRow[],
): Promise<GiftReadyCheckRowsResult> => {
  const evaluations = await loadGiftReadyEvaluations(client, rows);
  const checkedAt = new Date().toISOString();

  const counts = rows.reduce(
    (summary, row) => {
      const evaluation = evaluations.get(row.id) ?? {
        giftReadyStatus: 'NEEDS_REVIEW' as const,
        preflight: classifyBatchPreflight(row),
        hasPrimaryEmailConflict: false,
      };
      const category =
        evaluation.preflight.category === 'PROCESSED' ||
        evaluation.preflight.category === 'FAILED'
          ? evaluation.preflight.category
          : evaluation.giftReadyStatus === 'READY_TO_PROCESS'
            ? 'READY'
            : 'NEEDS_REVIEW';
      summary.actualItemCount += 1;

      switch (category) {
        case 'PROCESSED':
          summary.processedItems += 1;
          break;
        case 'FAILED':
          summary.failedItems += 1;
          break;
        case 'READY':
          summary.readyItems += 1;
          break;
        case 'NEEDS_REVIEW':
          summary.needsReviewItems += 1;
          break;
      }

      return summary;
    },
    {
      actualItemCount: 0,
      processedItems: 0,
      failedItems: 0,
      readyItems: 0,
      needsReviewItems: 0,
    },
  );

  await persistGiftStagingBatchUpserts(
    rows.map((row) => ({
      id: row.id,
      giftReadyStatus:
        row.processingStatus === 'PROCESSED' ||
        row.processingStatus === 'PROCESS_FAILED'
          ? null
          : evaluations.get(row.id)?.giftReadyStatus ?? 'NEEDS_REVIEW',
      errorDetail: null,
    })),
  );

  return {
    checkedAt,
    actualItemCount: counts.actualItemCount,
    readyItems: counts.readyItems,
    needsReviewItems: counts.needsReviewItems,
    failedItems: counts.failedItems,
    processedItems: counts.processedItems,
  };
};

export const processGiftStagingRows = async (
  client: CoreApiClient,
  rows: BatchProcessingRow[],
) => {
  const evaluations = await loadGiftReadyEvaluations(client, rows);
  const processableRows = rows.filter(
    (row) =>
      row.processingStatus !== 'PROCESSED' &&
      row.processingStatus !== 'PROCESS_FAILED' &&
      evaluations.get(row.id)?.giftReadyStatus === 'READY_TO_PROCESS',
  );
  const notReadyRows = rows.filter(
    (row) =>
      row.processingStatus !== 'PROCESSED' &&
      row.processingStatus !== 'PROCESS_FAILED' &&
      evaluations.get(row.id)?.giftReadyStatus !== 'READY_TO_PROCESS',
  );

  await persistBatchRowWritebacks(buildNotReadyWritebacks(notReadyRows));

  let executionMetrics = {
    chunkCount: 0,
    batchPathProcessed: 0,
    batchPathFailed: 0,
    rowFallbackProcessed: 0,
    rowFallbackFailed: 0,
  };
  let processedItems = 0;
  let failedItems = 0;

  if (processableRows.length > 0) {
    const result = await executeBatchGiftProcessing(processableRows);
    executionMetrics = result.metrics;
    processedItems = result.successfulWritebacks.length;
    failedItems = result.failedWritebacks.length;
  }

  return {
    totalItems: rows.length,
    processedItems,
    failedItems,
    notReadyItems: notReadyRows.length,
    executionMetrics,
  };
};
