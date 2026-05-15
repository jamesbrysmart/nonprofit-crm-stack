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

  const client = new CoreApiClient();
  const { batch, rows } = await loadBatchProcessingContext(client, giftBatchId);

  if (!batch) {
    throw new Error('Batch not found');
  }

  if (isGiftBatchOverWorkflowLimit(batch.totalItems)) {
    throw new Error(getGiftBatchWorkflowLimitMessage(batch.totalItems));
  }

  await updateBatch(client, giftBatchId, {
    status: 'PROCESSING',
  });

  try {
    const processingResult = await processGiftStagingRows(client, rows);
    const executionMetrics = processingResult.executionMetrics;

    const { totalItems, processedItems, failedItems, notReadyItems } =
      await summarizeBatchOutcome(client, giftBatchId);

    const batchStatus =
      processedItems === totalItems && failedItems === 0 && notReadyItems === 0
        ? 'PROCESSED'
        : 'PROCESSED_WITH_ISSUES';

    await updateBatch(client, giftBatchId, {
      status: batchStatus,
      totalItems,
      processedItems,
      failedItems,
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

      await updateBatch(client, giftBatchId, {
        status: 'PROCESSED_WITH_ISSUES',
        totalItems,
        processedItems,
        failedItems,
      });
    } catch {
      await updateBatch(client, giftBatchId, {
        status: 'PROCESSED_WITH_ISSUES',
      });
    }

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
