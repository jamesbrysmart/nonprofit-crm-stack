import { useEffect, useState } from 'react';
import { CoreApiClient } from 'twenty-client-sdk/core';
import {
  buildGiftStagingReviewRecord,
} from 'src/gift-staging-review/gift-staging-review.model';
import { subscribeToGiftStagingRecordInvalidated } from './gift-staging-record-sync';
import type {
  GiftStagingReviewRecord,
  StoredGiftStagingRecord,
} from 'src/gift-staging-review/gift-staging-review.types';

const loadStoredRecord = async (
  recordId: string,
): Promise<StoredGiftStagingRecord | null> => {
  const client = new CoreApiClient();
  const result = await client.query({
    giftStaging: {
      __args: {
        filter: {
          id: { eq: recordId },
        },
      },
      id: true,
      name: true,
      intakeSource: true,
      amount: {
        amountMicros: true,
        currencyCode: true,
      },
      giftDate: true,
      donationType: true,
      donorFirstName: true,
      donorLastName: true,
      donorEmail: true,
      donorPhone: true,
      donorMailingAddress: {
        addressStreet1: true,
        addressStreet2: true,
        addressCity: true,
        addressState: true,
        addressPostcode: true,
        addressCountry: true,
      },
      externalId: true,
      sourceFingerprint: true,
      providerEventId: true,
      provider: true,
      providerPaymentId: true,
      paymentProviderCustomerId: true,
      providerAgreementId: true,
      providerIntervalUnit: true,
      providerIntervalCount: true,
      rawProviderEvidence: true,
      sourceAppealName: true,
      sourceFundName: true,
      donorResolutionState: true,
      donor: {
        id: true,
        name: {
          firstName: true,
          lastName: true,
        },
        emails: {
          primaryEmail: true,
        },
      },
      giftReadyStatus: true,
      paymentState: true,
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
      appeal: {
        id: true,
        name: true,
        defaultFund: {
          id: true,
          name: true,
        },
      },
      appealSource: {
        id: true,
        name: true,
        appeal: {
          id: true,
        },
      },
      fund: {
        id: true,
        name: true,
      },
      giftBatch: {
        id: true,
        name: true,
      },
      committedGift: {
        id: true,
        name: true,
      },
    },
  } as never);

  return (result?.giftStaging as StoredGiftStagingRecord | null) ?? null;
};

export const useGiftStagingReviewRecord = (recordId: string | null) => {
  const [record, setRecord] = useState<GiftStagingReviewRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async (): Promise<GiftStagingReviewRecord | null> => {
    if (!recordId) {
      setError('No record selected');
      setRecord(null);
      setLoading(false);
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const loadedRecord = await loadStoredRecord(recordId);

      if (!loadedRecord) {
        setRecord(null);
        setError('Record not found');
        return null;
      }

      const nextRecord = buildGiftStagingReviewRecord(loadedRecord);
      setRecord(nextRecord);

      return nextRecord;
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : String(loadError),
      );
      setRecord(null);
      return null;
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

    return subscribeToGiftStagingRecordInvalidated({
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
