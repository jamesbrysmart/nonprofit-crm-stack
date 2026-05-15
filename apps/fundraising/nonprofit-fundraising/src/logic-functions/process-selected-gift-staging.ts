import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { loadGiftStagingRowsForProcessing } from 'src/batch-processing/batch-loaders';
import { processGiftStagingRows } from 'src/gift-staging-review/gift-ready-check.service';
import type {
  ProcessSelectedGiftStagingRequest,
  ProcessSelectedGiftStagingResponse,
} from 'src/batch-processing/batch-processing.types';

const normalizeSelectedIds = (ids: string[] | null | undefined) =>
  [...new Set((ids ?? []).map((id) => id.trim()).filter((id) => id !== ''))];

const handler = async (
  event: RoutePayload<ProcessSelectedGiftStagingRequest>,
): Promise<ProcessSelectedGiftStagingResponse> => {
  const giftStagingIds = normalizeSelectedIds(event.body?.giftStagingIds);

  if (giftStagingIds.length === 0) {
    throw new Error('At least one giftStagingId is required');
  }

  const client = new CoreApiClient();
  const rows = await loadGiftStagingRowsForProcessing(client, giftStagingIds);

  if (rows.length !== giftStagingIds.length) {
    throw new Error('Some selected staging rows could not be loaded');
  }

  const result = await processGiftStagingRows(client, rows);

  return {
    selectedItemCount: rows.length,
    processedItems: result.processedItems,
    failedItems: result.failedItems,
    notReadyItems: result.notReadyItems,
    executorMode: 'BOUNDED_HYBRID',
    chunkCount: result.executionMetrics.chunkCount,
    batchPathProcessed: result.executionMetrics.batchPathProcessed,
    batchPathFailed: result.executionMetrics.batchPathFailed,
    rowFallbackProcessed: result.executionMetrics.rowFallbackProcessed,
    rowFallbackFailed: result.executionMetrics.rowFallbackFailed,
  };
};

export default defineLogicFunction({
  universalIdentifier: '86476d1a-f1f1-43ca-851a-7e90f1a1f53e',
  name: 'process-selected-gift-staging',
  description: 'Processes the currently selected staged gift rows.',
  timeoutSeconds: 120,
  handler,
  httpRouteTriggerSettings: {
    path: '/gift-staging/process-selected',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
