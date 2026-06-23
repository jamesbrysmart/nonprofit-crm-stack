import { useEffect, useState } from 'react';
import { CoreApiClient } from 'twenty-client-sdk/core';
import {
  buildGiftStagingReviewRecord,
} from 'src/gift-staging-review/gift-staging-review.model';
import {
  evaluateGiftReadyRow,
} from 'src/gift-staging-review/gift-ready-status';
import { loadPeopleByPrimaryEmails } from 'src/donor-resolution/donor-creation-viability';
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
      paymentType: true,
      donorFirstName: true,
      donorLastName: true,
      donorEmail: true,
      donorPhone: true,
      isAnonymousDonor: true,
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
      appealSourceExternalId: true,
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
      softCreditPerson: {
        id: true,
        name: {
          firstName: true,
          lastName: true,
        },
        emails: {
          primaryEmail: true,
        },
      },
      softCreditCompany: {
        id: true,
        name: true,
      },
      softCreditType: true,
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
  } as any);

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

      const peopleByEmail = await loadPeopleByPrimaryEmails(
        new CoreApiClient(),
        loadedRecord.donor?.id ? [] : [loadedRecord.donorEmail ?? ''],
      );
      const evaluation = evaluateGiftReadyRow({
        row: {
          id: loadedRecord.id,
          amount:
            typeof loadedRecord.amount === 'string'
              ? null
              : loadedRecord.amount,
          donor: loadedRecord.donor,
          donorEmail: loadedRecord.donorEmail,
          donorFirstName: loadedRecord.donorFirstName,
          donorLastName: loadedRecord.donorLastName,
          isAnonymousDonor: loadedRecord.isAnonymousDonor,
          donorResolutionState: loadedRecord.donorResolutionState,
          giftDate: loadedRecord.giftDate,
          paymentType: loadedRecord.paymentType,
          paymentState: loadedRecord.paymentState,
          processingStatus: loadedRecord.processingStatus,
          provider: loadedRecord.provider,
          providerAgreementId: loadedRecord.providerAgreementId,
          providerIntervalCount: loadedRecord.providerIntervalCount,
          providerIntervalUnit: loadedRecord.providerIntervalUnit,
          appealSourceExternalId: loadedRecord.appealSourceExternalId,
          sourceAppealName: loadedRecord.sourceAppealName,
          sourceFundName: loadedRecord.sourceFundName,
          appeal: loadedRecord.appeal,
          appealSource: loadedRecord.appealSource,
          fund: loadedRecord.fund,
          recurringAgreement: loadedRecord.recurringAgreement,
        },
        peopleByEmail,
      });
      const nextRecord = buildGiftStagingReviewRecord(
        loadedRecord,
        evaluation.preflight,
      );
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
      onInvalidate: () => {
        void refresh();
      },
    });
  }, [recordId]);

  return {
    record,
    loading,
    error,
    refresh,
  };
};
