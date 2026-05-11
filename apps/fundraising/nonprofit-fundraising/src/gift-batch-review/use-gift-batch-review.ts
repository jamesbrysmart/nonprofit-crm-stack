import { useEffect, useState } from 'react';
import { AppPath, navigate } from 'twenty-sdk/front-component';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { buildGiftBatchReviewRecord } from 'src/gift-batch-review/gift-batch-review.model';
import { subscribeToGiftBatchInvalidated } from 'src/gift-batch-review/gift-batch-sync';
import type {
  BatchSummaryRecord,
  BatchReviewRow,
  GiftBatchReviewRecord,
} from 'src/gift-batch-review/gift-batch-review.types';

export type GiftStagingQueueScope =
  | 'all'
  | 'ambiguous'
  | 'failed'
  | 'not-ready'
  | 'needs-donor-review'
  | 'ready';

export const buildGiftStagingQueryParams = (
  batchId: string,
  scope: GiftStagingQueueScope,
): Record<string, string | string[]> => {
  const queryParams: Record<string, string | string[]> = {
    'filter[giftBatch][IS]': [batchId],
  };

  switch (scope) {
    case 'ambiguous':
      queryParams['filter[donorResolutionState][IS]'] = ['AMBIGUOUS'];
      break;
    case 'failed':
      queryParams['filter[processingStatus][IS]'] = ['PROCESS_FAILED'];
      break;
    case 'not-ready':
      queryParams['filter[isReadyForProcessing][IS]'] = 'false';
      queryParams['filter[processingStatus][IS_NOT]'] = ['PROCESSED'];
      break;
    case 'needs-donor-review':
      queryParams['filter[donorResolutionState][IS_NOT]'] = ['CONFIRMED'];
      break;
    case 'ready':
      queryParams['filter[isReadyForProcessing][IS]'] = 'true';
      queryParams['filter[processingStatus][IS_NOT]'] = ['PROCESSED'];
      break;
    case 'all':
    default:
      break;
  }

  return queryParams;
};

export const openGiftBatchQueue = async (
  batchId: string,
  scope: GiftStagingQueueScope,
) => {
  await navigate(
    AppPath.RecordIndexPage,
    {
      objectNamePlural: 'giftStagings',
    },
    buildGiftStagingQueryParams(batchId, scope),
  );
};

export const loadGiftBatchReview = async (
  recordId: string,
): Promise<GiftBatchReviewRecord | null> => {
  const client = new CoreApiClient();
  const result = await client.query({
    giftBatch: {
      __args: {
        filter: {
          id: { eq: recordId },
        },
      },
      id: true,
      name: true,
      source: true,
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
            eq: recordId,
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
          amount: {
            amountMicros: true,
            currencyCode: true,
          },
          giftDate: true,
          provider: true,
          providerAgreementId: true,
          donorResolutionState: true,
          donor: {
            id: true,
          },
          isReadyForProcessing: true,
          processingStatus: true,
          errorDetail: true,
          committedGift: {
            id: true,
            name: true,
          },
        },
      },
    },
  } as any);

  const batch = result?.giftBatch as BatchSummaryRecord | null;

  if (!batch) {
    return null;
  }

  const rows =
    result?.giftStagings?.edges?.map(
      (edge: { node: BatchReviewRow }) => edge.node,
    ) ?? [];

  return buildGiftBatchReviewRecord(batch, rows);
};

export const useGiftBatchReview = (recordId: string | null | undefined) => {
  const [record, setRecord] = useState<GiftBatchReviewRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    if (!recordId) {
      setRecord(null);
      setError('No batch selected');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const loadedRecord = await loadGiftBatchReview(recordId);

      if (!loadedRecord) {
        setRecord(null);
        setError('Batch not found');
        return;
      }

      setRecord(loadedRecord);
    } catch (loadError) {
      setRecord(null);
      setError(
        loadError instanceof Error ? loadError.message : 'Unable to load batch',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, [recordId]);

  useEffect(() => {
    if (!recordId) {
      return;
    }

    return subscribeToGiftBatchInvalidated({
      recordId,
      onInvalidate: refresh,
    });
  }, [recordId]);

  return {
    record,
    loading,
    error,
    refresh,
  };
};
