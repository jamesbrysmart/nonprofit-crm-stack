import type { CoreApiClient } from 'twenty-client-sdk/core';
import {
  buildNotReadyWritebacks,
  executeBatchGiftProcessing,
  executeSingleGiftProcessing,
  persistBatchRowWritebacks,
} from 'src/batch-processing/batch-processing.executor';
import { resolveAppealSourceExternalIdsForRows } from 'src/appeal-sources/appeal-source-external-id-resolution';
import { resolveAppealSourceParentsForProcessing } from 'src/appeal-sources/appeal-source-processing-resolution';
import { classifyBatchPreflight } from 'src/batch-processing/batch-processing.preflight';
import type { BatchProcessingRow } from 'src/batch-processing/batch-processing.types';
import { persistGiftStagingBatchUpserts } from 'src/gift-staging/gift-staging-bulk-writeback';
import {
  loadGiftReadyEvaluations,
  type GiftReadyStatus,
} from './gift-ready-status';

export type GiftReadyCheckRowsResult = {
  checkedAt: string;
  actualItemCount: number;
  readyItems: number;
  needsReviewItems: number;
  failedItems: number;
  processedItems: number;
};

export type SingleGiftStagingProcessingResult = {
  processingStatus: 'NOT_PROCESSED' | 'PROCESSED' | 'PROCESS_FAILED';
  committedGiftId: string | null;
  recurringAgreementId: string | null;
  executionPath: 'BATCH' | 'ROW_FALLBACK' | null;
  stagingWritebackSucceeded: boolean;
  reconciliationError: string | null;
  errorDetail: string | null;
};

export const checkGiftStagingRowsReadiness = async (
  client: CoreApiClient,
  rows: BatchProcessingRow[],
): Promise<GiftReadyCheckRowsResult> => {
  const resolvedRows = await resolveAppealSourceExternalIdsForRows(client, rows);
  const evaluations = await loadGiftReadyEvaluations(client, resolvedRows);
  const checkedAt = new Date().toISOString();

  const counts = resolvedRows.reduce(
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

  const writebacks = resolvedRows
    .map((row) => {
      const nextGiftReadyStatus =
        row.processingStatus === 'PROCESSED' ||
        row.processingStatus === 'PROCESS_FAILED'
          ? null
          : evaluations.get(row.id)?.giftReadyStatus ?? 'NEEDS_REVIEW';

      if (row.giftReadyStatus === nextGiftReadyStatus && row.errorDetail === null) {
        return null;
      }

      return {
        id: row.id,
        giftReadyStatus: nextGiftReadyStatus,
        errorDetail: null,
      };
    })
    .filter(
      (writeback): writeback is {
        id: string;
        giftReadyStatus: GiftReadyStatus | null;
        errorDetail: null;
      } => writeback !== null,
    );

  await persistGiftStagingBatchUpserts(writebacks);

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
    // One bulk lookup keeps appeal-source attribution deterministic without
    // turning the high-volume gift create path into per-row relation reads.
    const resolvedProcessableRows = await resolveAppealSourceParentsForProcessing(
      client,
      processableRows,
    );
    const result = await executeBatchGiftProcessing(resolvedProcessableRows);
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

export const processSingleGiftStagingRow = async (
  client: CoreApiClient,
  row: BatchProcessingRow,
): Promise<SingleGiftStagingProcessingResult> => {
  const evaluations = await loadGiftReadyEvaluations(client, [row]);
  const evaluation = evaluations.get(row.id);

  if (
    row.processingStatus === 'PROCESSED' ||
    row.processingStatus === 'PROCESS_FAILED' ||
    evaluation?.giftReadyStatus !== 'READY_TO_PROCESS'
  ) {
    await persistBatchRowWritebacks(buildNotReadyWritebacks([row]));

    return {
      processingStatus: 'NOT_PROCESSED',
      committedGiftId: row.committedGift?.id ?? null,
      recurringAgreementId: row.recurringAgreement?.id ?? null,
      executionPath: null,
      stagingWritebackSucceeded: true,
      reconciliationError: null,
      errorDetail: row.errorDetail,
    };
  }

  const [resolvedRow] = await resolveAppealSourceParentsForProcessing(client, [
    row,
  ]);
  const result = await executeSingleGiftProcessing(resolvedRow);

  if ('committedGiftId' in result.writeback) {
    return {
      processingStatus: 'PROCESSED',
      committedGiftId: result.writeback.committedGiftId,
      recurringAgreementId: result.writeback.recurringAgreementId ?? null,
      executionPath: result.writeback.executionPath,
      stagingWritebackSucceeded: result.stagingWritebackSucceeded,
      reconciliationError: result.reconciliationError,
      errorDetail: null,
    };
  }

  if (result.writeback.processingStatus === 'PROCESS_FAILED') {
    return {
      processingStatus: 'PROCESS_FAILED',
      committedGiftId: null,
      recurringAgreementId: null,
      executionPath: result.writeback.executionPath,
      stagingWritebackSucceeded: result.stagingWritebackSucceeded,
      reconciliationError: result.reconciliationError,
      errorDetail: result.writeback.errorDetail,
    };
  }

  return {
    processingStatus: 'NOT_PROCESSED',
    committedGiftId: null,
    recurringAgreementId: null,
    executionPath: null,
    stagingWritebackSucceeded: result.stagingWritebackSucceeded,
    reconciliationError: result.reconciliationError,
    errorDetail: result.writeback.errorDetail,
  };
};
