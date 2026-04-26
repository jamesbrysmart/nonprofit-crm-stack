import {
  defineLogicFunction,
  type RoutePayload,
} from 'twenty-sdk';
import { CoreApiClient } from 'twenty-client-sdk/core';
import {
  buildNotReadyWritebacks,
  buildPendingWritebacks,
  canProcessBatchRow,
  executeBatchGiftProcessing,
  persistBatchRowWritebacks,
} from 'src/batch-processing/batch-processing.executor';
import type {
  BatchReviewRow,
  BatchSummaryRecord,
  ProcessBatchRequest,
  ProcessBatchResponse,
} from 'src/batch-processing/batch-processing.types';

const loadBatchAndRows = async (
  client: CoreApiClient,
  giftBatchId: string,
): Promise<{
  batch: BatchSummaryRecord | null;
  rows: BatchReviewRow[];
}> => {
  const result = await client.query({
    giftBatch: {
      __args: {
        filter: {
          id: { eq: giftBatchId },
        },
      },
      id: true,
      name: true,
      status: true,
      totalItems: true,
      processedItems: true,
      failedItems: true,
    },
    stagingReviewItems: {
      __args: {
        first: 100,
      },
      edges: {
        node: {
          id: true,
          name: true,
          donorFirstName: true,
          donorLastName: true,
          donorEmail: true,
          amount: true,
          giftDate: true,
          giftAidRequested: true,
          giftAidDeclarationCaptured: true,
          giftAidDeclarationDate: true,
          giftAidCoverageScope: true,
          giftAidDeclarationSource: true,
          giftAidTextVersion: true,
          giftAidDeclaration: {
            id: true,
          },
          donorResolutionState: true,
          donor: {
            id: true,
          },
          hasCoreGiftIssue: true,
          isReadyForProcessing: true,
          processingStatus: true,
          errorDetail: true,
          committedGift: {
            id: true,
            name: true,
          },
          giftBatch: {
            id: true,
          },
        },
      },
    },
  } as any);

  return {
    batch: (result?.giftBatch as BatchSummaryRecord | null) ?? null,
    rows:
      result?.stagingReviewItems?.edges
        ?.map((edge: { node: BatchReviewRow }) => edge.node)
        .filter((row: BatchReviewRow) => row.giftBatch?.id === giftBatchId) ?? [],
  };
};

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

const handler = async (
  event: RoutePayload<ProcessBatchRequest>,
): Promise<ProcessBatchResponse> => {
  const giftBatchId = event.body?.giftBatchId?.trim();

  if (!giftBatchId) {
    throw new Error('giftBatchId is required');
  }

  const client = new CoreApiClient();
  const { batch, rows } = await loadBatchAndRows(client, giftBatchId);

  if (!batch) {
    throw new Error('Batch not found');
  }

  await updateBatch(client, giftBatchId, {
    status: 'PROCESSING',
  });

  const processableRows = rows.filter((row) => canProcessBatchRow(row));
  const notReadyRows = rows.filter((row) => !canProcessBatchRow(row));

  await persistBatchRowWritebacks(buildNotReadyWritebacks(notReadyRows));
  await persistBatchRowWritebacks(buildPendingWritebacks(processableRows));

  let executionMetrics = {
    chunkCount: 0,
    batchPathProcessed: 0,
    batchPathFailed: 0,
    rowFallbackProcessed: 0,
    rowFallbackFailed: 0,
  };

  if (processableRows.length > 0) {
    try {
      const result = await executeBatchGiftProcessing(processableRows);
      executionMetrics = result.metrics;
    } catch (error) {
      await updateBatch(client, giftBatchId, {
        status: 'PROCESSED_WITH_ISSUES',
      });
      throw error;
    }
  }

  const refreshed = await loadBatchAndRows(client, giftBatchId);
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
};

export default defineLogicFunction({
  universalIdentifier: 'c7505782-5e1c-482a-bf05-58a8cb8e8f4b',
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
