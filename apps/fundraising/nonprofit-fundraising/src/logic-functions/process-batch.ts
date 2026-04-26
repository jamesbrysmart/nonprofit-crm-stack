import { CoreApiClient } from 'twenty-client-sdk/core';
import {
  defineLogicFunction,
  type RoutePayload,
} from 'twenty-sdk/define';
import {
  buildNotReadyWritebacks,
  buildPendingWritebacks,
  canProcessBatchRow,
  executeBatchGiftProcessing,
  persistBatchRowWritebacks,
} from 'src/batch-processing/batch-processing.executor';
import type {
  BatchProcessingRow,
  BatchSummaryRecord,
  ProcessBatchRequest,
  ProcessBatchResponse,
} from 'src/batch-processing/batch-processing.types';

const loadBatchAndRows = async (
  client: CoreApiClient,
  giftBatchId: string,
): Promise<{
  batch: BatchSummaryRecord | null;
  rows: BatchProcessingRow[];
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
    giftStagings: {
      __args: {
        first: 200,
        filter: {
          giftBatchId: {
            eq: giftBatchId,
          },
        },
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
          donorResolutionState: true,
          donor: {
            id: true,
          },
          hasCoreGiftIssue: true,
          isReadyForProcessing: true,
          processingStatus: true,
          errorDetail: true,
          giftAidRequested: true,
          giftAidDeclarationCaptured: true,
          giftAidDeclarationDate: true,
          giftAidCoverageScope: true,
          giftAidDeclarationSource: true,
          giftAidTextVersion: true,
          giftAidDeclaration: {
            id: true,
          },
          recurringAgreement: {
            id: true,
          },
          committedGift: {
            id: true,
            name: true,
          },
        },
      },
    },
  } as any);

  return {
    batch: (result?.giftBatch as BatchSummaryRecord | null) ?? null,
    rows:
      result?.giftStagings?.edges?.map(
        (edge: { node: BatchProcessingRow }) => edge.node,
      ) ?? [],
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

  // Keep write pressure low by doing one routing writeback pass before any
  // create calls rather than churning row state throughout the core loop.
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
    const result = await executeBatchGiftProcessing(processableRows);
    executionMetrics = result.metrics;
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
