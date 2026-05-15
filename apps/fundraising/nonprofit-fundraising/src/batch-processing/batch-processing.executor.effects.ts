import { CoreApiClient } from 'twenty-client-sdk/core';
import { attachGiftsToCurrentDraftClaimBatch } from 'src/gift-aid-claims/gift-aid-claim-batch';
import { isGiftAidEnabled } from 'src/gift-aid/gift-aid-config';
import {
  collectDonorIds,
  recomputeDonorRollups,
} from 'src/donor-rollups/donor-rollups';
import type { FailedWriteback, SuccessfulWriteback } from './batch-processing.executor.support';

export const runBatchProcessingSideEffects = async (
  successfulWritebacks: SuccessfulWriteback[],
) => {
  if (isGiftAidEnabled()) {
    const claimableGiftIds = successfulWritebacks
      .filter((writeback) => writeback.giftAidStatus === 'CLAIMABLE')
      .map((writeback) => writeback.committedGiftId);

    if (claimableGiftIds.length > 0) {
      try {
        const client = new CoreApiClient();
        await attachGiftsToCurrentDraftClaimBatch(client, claimableGiftIds);
      } catch (error) {
        console.warn(
          'Non-blocking Gift Aid draft attachment failed after batch processing',
          claimableGiftIds,
          error instanceof Error ? error.message : String(error),
        );
      }
    }
  }

  const donorIdsToRecompute = collectDonorIds(
    successfulWritebacks.map((writeback) => writeback.donorId),
  );

  if (donorIdsToRecompute.length > 0) {
    try {
      const client = new CoreApiClient();
      await recomputeDonorRollups(client, donorIdsToRecompute);
    } catch (error) {
      console.warn(
        'Non-blocking donor rollup recompute failed after batch processing',
        donorIdsToRecompute,
        error instanceof Error ? error.message : String(error),
      );
    }
  }
};

export const finalizeBatchExecutionMetrics = ({
  successfulWritebacks,
  failedWritebacks,
  metrics,
}: {
  successfulWritebacks: SuccessfulWriteback[];
  failedWritebacks: FailedWriteback[];
  metrics: {
    batchPathProcessed: number;
    batchPathFailed: number;
    rowFallbackProcessed: number;
    rowFallbackFailed: number;
  };
}) => {
  metrics.batchPathProcessed = successfulWritebacks.filter(
    (writeback) => writeback.executionPath === 'BATCH',
  ).length;
  metrics.batchPathFailed = failedWritebacks.filter(
    (writeback) => writeback.executionPath === 'BATCH',
  ).length;
  metrics.rowFallbackProcessed = successfulWritebacks.filter(
    (writeback) => writeback.executionPath === 'ROW_FALLBACK',
  ).length;
  metrics.rowFallbackFailed = failedWritebacks.filter(
    (writeback) => writeback.executionPath === 'ROW_FALLBACK',
  ).length;
};
