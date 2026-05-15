import { useEffect, useState } from 'react';
import { AppPath, navigate } from 'twenty-sdk/front-component';
import {
  buildGiftStagingQueryParams,
  loadGiftBatchReview,
  type GiftStagingQueueScope,
} from 'src/gift-batch-review/gift-batch-review.data';
import { subscribeToGiftBatchInvalidated } from 'src/gift-batch-review/gift-batch-sync';
import type { GiftBatchReviewRecord } from 'src/gift-batch-review/gift-batch-review.types';

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

    const shouldShowLoadingState = record === null;

    if (shouldShowLoadingState) {
      setLoading(true);
    }

    setError(null);

    try {
      const loadedRecord = await loadGiftBatchReview(recordId);

      if (!loadedRecord) {
        if (record === null) {
          setRecord(null);
        }
        setError('Batch not found');
        return;
      }

      setRecord(loadedRecord);
    } catch (loadError) {
      if (record === null) {
        setRecord(null);
      }
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
