import { CoreApiClient } from 'twenty-client-sdk/core';
import {
  defineLogicFunction,
  type RoutePayload,
} from 'twenty-sdk/define';
import { loadBatchProcessingContext } from 'src/batch-processing/batch-loaders';
import {
  getGiftBatchWorkflowLimitMessage,
  isGiftBatchOverWorkflowLimit,
} from 'src/batch-processing/batch-processing.limits';
import { createBatchRouteLogger } from 'src/batch-processing/batch-route-logging';
import { processGiftStagingRows } from 'src/gift-staging-review/gift-ready-check.service';
import type {
  ProcessBatchRequest,
  ProcessBatchResponse,
} from 'src/batch-processing/batch-processing.types';

const updateBatch = async (
  client: CoreApiClient,
  batchId: string,
  data: Record<string, unknown>,
) => {
  await client.mutation({
    updateGiftBatch: {
      __args: {
        id: batchId,
        data,
      },
      id: true,
    },
  } as any);
};

const summarizeBatchOutcome = async (
  client: CoreApiClient,
  batchId: string,
) => {
  const refreshed = await loadBatchProcessingContext(client, batchId);
  const totalItems = refreshed.rows.length;
  const processedItems = refreshed.rows.filter(
    (row) => row.processingStatus === 'PROCESSED',
  ).length;
  const failedItems = refreshed.rows.filter(
    (row) => row.processingStatus === 'PROCESS_FAILED',
  ).length;
  const notReadyItems = refreshed.rows.filter(
    (row) =>
      row.processingStatus !== 'PROCESSED' &&
      row.processingStatus !== 'PROCESS_FAILED',
  ).length;

  return {
    totalItems,
    processedItems,
    failedItems,
    notReadyItems,
  };
};

const handler = async (
  event: RoutePayload<ProcessBatchRequest>,
): Promise<ProcessBatchResponse> => {
  const giftBatchId = event.body?.giftBatchId?.trim();

  if (!giftBatchId) {
    throw new Error('giftBatchId is required');
  }

  const logger = createBatchRouteLogger({
    route: 'process-batch',
    giftBatchId,
  });
  logger.info('started');

  const client = new CoreApiClient();
  let loaded: Awaited<ReturnType<typeof loadBatchProcessingContext>>;

  try {
    loaded = await loadBatchProcessingContext(client, giftBatchId);
  } catch (error) {
    logger.fail('context_load_failed', error);
    throw error;
  }

  const { batch, rows } = loaded;
  logger.info('context_loaded', { rowCount: rows.length });

  if (!batch) {
    logger.warn('batch_not_found');
    throw new Error('Batch not found');
  }

  if (isGiftBatchOverWorkflowLimit(rows.length)) {
    logger.warn('blocked_over_workflow_limit', {
      totalItems: rows.length,
    });
    throw new Error(getGiftBatchWorkflowLimitMessage(rows.length));
  }

  try {
    await updateBatch(client, giftBatchId, {
      status: 'PROCESSING',
    });
  } catch (error) {
    logger.fail('mark_processing_failed', error);
    throw error;
  }
  logger.info('batch_marked_processing');

  try {
    const processingResult = await processGiftStagingRows(client, rows);
    const executionMetrics = processingResult.executionMetrics;
    logger.info('rows_processed', {
      totalItems: processingResult.totalItems,
      processedItems: processingResult.processedItems,
      failedItems: processingResult.failedItems,
      notReadyItems: processingResult.notReadyItems,
      chunkCount: executionMetrics.chunkCount,
      batchPathProcessed: executionMetrics.batchPathProcessed,
      rowFallbackProcessed: executionMetrics.rowFallbackProcessed,
    });

    const { totalItems, processedItems, failedItems, notReadyItems } =
      await summarizeBatchOutcome(client, giftBatchId);
    logger.info('outcome_summarized', {
      totalItems,
      processedItems,
      failedItems,
      notReadyItems,
    });

    const batchStatus =
      processedItems === totalItems && failedItems === 0 && notReadyItems === 0
        ? 'PROCESSED'
        : 'PROCESSED_WITH_ISSUES';

    await updateBatch(client, giftBatchId, {
      status: batchStatus,
      processedGifts: processedItems,
      failedGifts: failedItems,
    });
    logger.info('batch_status_updated', { batchStatus });

    logger.info('completed', {
      totalItems,
      processedItems,
      failedItems,
      notReadyItems,
      batchStatus,
    });

    return {
      giftBatchId,
      batchStatus,
      totalItems,
      processedItems,
      failedItems,
      notReadyItems,
      executorMode: 'BOUNDED_HYBRID',
      chunkCount: executionMetrics.chunkCount,
      batchPathProcessed: executionMetrics.batchPathProcessed,
      batchPathFailed: executionMetrics.batchPathFailed,
      rowFallbackProcessed: executionMetrics.rowFallbackProcessed,
      rowFallbackFailed: executionMetrics.rowFallbackFailed,
    };
  } catch (error) {
    try {
      const { totalItems, processedItems, failedItems } =
        await summarizeBatchOutcome(client, giftBatchId);
      logger.warn('summarized_after_failure', {
        totalItems,
        processedItems,
        failedItems,
      });

      await updateBatch(client, giftBatchId, {
        status: 'PROCESSED_WITH_ISSUES',
        processedGifts: processedItems,
        failedGifts: failedItems,
      });
      logger.warn('batch_marked_processed_with_issues');
    } catch {
      await updateBatch(client, giftBatchId, {
        status: 'PROCESSED_WITH_ISSUES',
      });
      logger.warn('batch_marked_processed_with_issues_without_summary');
    }

    logger.fail('failed', error);
    throw error;
  }
};

export default defineLogicFunction({
  universalIdentifier: '0fae955c-25d4-4499-b6d2-edec52f33ef9',
  name: 'process-batch',
  description:
    'Processes the current batch of staged gifts and writes outcomes back to staging rows.',
  timeoutSeconds: 120,
  handler,
  httpRouteTriggerSettings: {
    path: '/batch-processing/process-batch',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
