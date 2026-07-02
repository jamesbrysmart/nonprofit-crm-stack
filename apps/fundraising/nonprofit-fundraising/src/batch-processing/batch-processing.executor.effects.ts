import { CoreApiClient } from 'twenty-client-sdk/core';
import {
  collectAppealIds,
  recomputeAppealRollups,
} from 'src/appeal-rollups/appeal-rollups';
import {
  collectAppealSourceIds,
  recomputeAppealSourceRollups,
} from 'src/appeal-source-rollups/appeal-source-rollups';
import {
  collectCompanyIds,
  recomputeCompanyRollups,
} from 'src/company-rollups/company-rollups';
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

  const companyIdsToRecompute = collectCompanyIds(
    successfulWritebacks.map((writeback) => writeback.companyId),
  );

  if (companyIdsToRecompute.length > 0) {
    try {
      const client = new CoreApiClient();
      await recomputeCompanyRollups(client, companyIdsToRecompute);
    } catch (error) {
      console.warn(
        'Non-blocking company rollup recompute failed after batch processing',
        companyIdsToRecompute,
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  const appealIdsToRecompute = collectAppealIds(
    successfulWritebacks.map((writeback) => writeback.appealId),
  );

  if (appealIdsToRecompute.length > 0) {
    try {
      const client = new CoreApiClient();
      await recomputeAppealRollups(client, appealIdsToRecompute);
    } catch (error) {
      console.warn(
        'Non-blocking appeal rollup recompute failed after batch processing',
        appealIdsToRecompute,
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  const appealSourceIdsToRecompute = collectAppealSourceIds(
    successfulWritebacks.map((writeback) => writeback.appealSourceId),
  );

  if (appealSourceIdsToRecompute.length > 0) {
    try {
      const client = new CoreApiClient();
      await recomputeAppealSourceRollups(client, appealSourceIdsToRecompute);
    } catch (error) {
      console.warn(
        'Non-blocking appeal source rollup recompute failed after batch processing',
        appealSourceIdsToRecompute,
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
