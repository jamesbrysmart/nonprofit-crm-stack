import { CoreApiClient } from 'twenty-client-sdk/core';
import type {
  BatchProcessingRow,
  BatchSummaryRecord,
} from './batch-processing.types';
import type { BatchDonorMatchRow } from 'src/batch-donor-match/batch-donor-match.types';

type BatchDonorMatchSummaryRecord = {
  id: string;
  totalItems: number | null;
};

const buildIdFilter = (ids: string[]) => ({
  id: {
    in: ids,
  },
});

export const loadBatchProcessingContext = async (
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
      source: true,
      status: true,
      totalItems: true,
      processedItems: true,
      failedItems: true,
      expectedItemCount: true,
      expectedTotalAmount: {
        amountMicros: true,
        currencyCode: true,
      },
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
          donorMailingAddress: {
            addressStreet1: true,
            addressStreet2: true,
            addressCity: true,
            addressState: true,
            addressPostcode: true,
            addressCountry: true,
          },
          amount: {
            amountMicros: true,
            currencyCode: true,
          },
          giftDate: true,
          donationType: true,
          externalId: true,
          sourceFingerprint: true,
          providerEventId: true,
          provider: true,
          providerPaymentId: true,
          paymentProviderCustomerId: true,
          providerAgreementId: true,
          providerIntervalUnit: true,
          providerIntervalCount: true,
          donorPhone: true,
          rawProviderEvidence: true,
          sourceAppealName: true,
          sourceFundName: true,
          donorResolutionState: true,
          donor: {
            id: true,
            emails: {
              primaryEmail: true,
              additionalEmails: true,
            },
          },
          fund: {
            id: true,
            name: true,
          },
          appeal: {
            id: true,
            name: true,
            defaultFund: {
              id: true,
              name: true,
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

export const loadBatchDonorMatchContext = async (
  client: CoreApiClient,
  giftBatchId: string,
): Promise<{
  batch: BatchDonorMatchSummaryRecord | null;
  rows: BatchDonorMatchRow[];
}> => {
  const result = await client.query({
    giftBatch: {
      __args: {
        filter: {
          id: { eq: giftBatchId },
        },
      },
      id: true,
      totalItems: true,
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
          donorFirstName: true,
          donorLastName: true,
          donorEmail: true,
          donorResolutionState: true,
          paymentState: true,
          processingStatus: true,
          donor: {
            id: true,
          },
        },
      },
    },
  } as any);

  return {
    batch: (result?.giftBatch as BatchDonorMatchSummaryRecord | null) ?? null,
    rows:
      result?.giftStagings?.edges?.map(
        (edge: { node: BatchDonorMatchRow }) => edge.node,
      ) ?? [],
  };
};

export const loadGiftStagingRowsForDonorMatch = async (
  client: CoreApiClient,
  giftStagingIds: string[],
): Promise<BatchDonorMatchRow[]> => {
  const result = await client.query({
    giftStagings: {
      __args: {
        first: giftStagingIds.length,
        filter: buildIdFilter(giftStagingIds),
      },
      edges: {
        node: {
          id: true,
          donorFirstName: true,
          donorLastName: true,
          donorEmail: true,
          donorResolutionState: true,
          paymentState: true,
          processingStatus: true,
          donor: {
            id: true,
          },
        },
      },
    },
  } as any);

  return (
    result?.giftStagings?.edges?.map(
      (edge: { node: BatchDonorMatchRow }) => edge.node,
    ) ?? []
  );
};

export const loadGiftStagingRowsForProcessing = async (
  client: CoreApiClient,
  giftStagingIds: string[],
): Promise<BatchProcessingRow[]> => {
  const result = await client.query({
    giftStagings: {
      __args: {
        first: giftStagingIds.length,
        filter: buildIdFilter(giftStagingIds),
      },
      edges: {
        node: {
          id: true,
          name: true,
          donorFirstName: true,
          donorLastName: true,
          donorEmail: true,
          donorMailingAddress: {
            addressStreet1: true,
            addressStreet2: true,
            addressCity: true,
            addressState: true,
            addressPostcode: true,
            addressCountry: true,
          },
          amount: {
            amountMicros: true,
            currencyCode: true,
          },
          giftDate: true,
          donationType: true,
          externalId: true,
          sourceFingerprint: true,
          providerEventId: true,
          provider: true,
          providerPaymentId: true,
          paymentProviderCustomerId: true,
          providerAgreementId: true,
          providerIntervalUnit: true,
          providerIntervalCount: true,
          donorPhone: true,
          rawProviderEvidence: true,
          sourceAppealName: true,
          sourceFundName: true,
          donorResolutionState: true,
          donor: {
            id: true,
            emails: {
              primaryEmail: true,
              additionalEmails: true,
            },
          },
          fund: {
            id: true,
            name: true,
          },
          appeal: {
            id: true,
            name: true,
            defaultFund: {
              id: true,
              name: true,
            },
          },
          giftReadyStatus: true,
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

  return (
    result?.giftStagings?.edges?.map(
      (edge: { node: BatchProcessingRow }) => edge.node,
    ) ?? []
  );
};
