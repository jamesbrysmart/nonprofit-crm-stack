import { useEffect, useState } from 'react';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { useRecordId } from 'twenty-sdk/front-component';
import {
  buildRecurringAgreementReviewRecord,
} from 'src/recurring/recurring.model';
import { loadRecurringAgreementById } from 'src/recurring/recurring.service';
import type { RecurringAgreementReviewRecord } from 'src/recurring/recurring.types';

const loadRecurringAgreementReview = async (recordId: string) => {
  const client = new CoreApiClient();
  const record = await loadRecurringAgreementById(client, recordId);

  return record ? buildRecurringAgreementReviewRecord(record) : null;
};

export const useRecurringAgreementReviewRecord = () => {
  const recordId = useRecordId();
  const [record, setRecord] = useState<RecurringAgreementReviewRecord | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!recordId) {
        setError('No recurring agreement selected');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const loaded = await loadRecurringAgreementReview(recordId);

        if (!loaded) {
          setRecord(null);
          setError('Recurring agreement not found');
          return;
        }

        setRecord(loaded);
      } catch (loadError) {
        setRecord(null);
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Unable to load recurring agreement',
        );
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, [recordId]);

  return {
    recordId,
    record,
    loading,
    error,
  };
};
