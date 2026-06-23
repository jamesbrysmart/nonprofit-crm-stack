import { CoreApiClient } from 'twenty-client-sdk/core';
import type {
  BatchGiftCodingRow,
  BatchProcessingRow,
  BatchSummaryRecord,
} from './batch-processing.types';
import type { BatchDonorMatchRow } from 'src/batch-donor-match/batch-donor-match.types';
import {
  extractConnection,
  extractConnectionNodes,
  extractQueryRecord,
} from 'src/core-api/core-api-results';

const BATCH_GIFT_CODING_QUERY_PAGE_SIZE = 200;

type BatchDonorMatchSummaryRecord = {
  id: string;
};

type BatchGiftCodingSummaryRecord = {
  id: string;
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
      processedGifts: true,
      failedGifts: true,
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
          paymentType: true,
          externalId: true,
          sourceFingerprint: true,
          providerEventId: true,
          provider: true,
          providerPaymentId: true,
          coveredFeeAmount: {
            amountMicros: true,
            currencyCode: true,
          },
          grossPaymentAmount: {
            amountMicros: true,
            currencyCode: true,
          },
          processingFeeAmount: {
            amountMicros: true,
            currencyCode: true,
          },
          netReceivedAmount: {
            amountMicros: true,
            currencyCode: true,
          },
          providerPayoutReference: true,
          paymentProviderCustomerId: true,
          providerAgreementId: true,
          providerIntervalUnit: true,
          providerIntervalCount: true,
          donorPhone: true,
          supporterEmailOptOut: true,
          isAnonymousDonor: true,
          rawProviderEvidence: true,
          appealSourceExternalId: true,
          sourceAppealName: true,
          sourceFundName: true,
          donorResolutionState: true,
          donor: {
            id: true,
            supporterEmailOptOut: true,
            emails: {
              primaryEmail: true,
              additionalEmails: true,
            },
          },
          softCreditPerson: {
            id: true,
            name: {
              firstName: true,
              lastName: true,
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
    batch: extractQueryRecord<BatchSummaryRecord>(result, 'giftBatch') ?? null,
    rows: extractConnectionNodes<BatchProcessingRow>(result, 'giftStagings'),
  };
};

export const loadBatchGiftCodingContext = async (
  client: CoreApiClient,
  giftBatchId: string,
): Promise<{
  batch: BatchGiftCodingSummaryRecord | null;
  rows: BatchGiftCodingRow[];
}> => {
  let batch: BatchGiftCodingSummaryRecord | null = null;
  const rows: BatchGiftCodingRow[] = [];
  let after: string | undefined;
  let hasNextPage = true;

  while (hasNextPage) {
    const giftStagingsArgs: Record<string, unknown> = {
      first: BATCH_GIFT_CODING_QUERY_PAGE_SIZE,
      filter: {
        giftBatchId: {
          eq: giftBatchId,
        },
      },
    };

    if (after) {
      giftStagingsArgs.after = after;
    }

    const result = await client.query({
      giftBatch: {
        __args: {
          filter: {
            id: { eq: giftBatchId },
          },
        },
        id: true,
      },
      giftStagings: {
        __args: giftStagingsArgs,
        edges: {
          node: {
            id: true,
            processingStatus: true,
            fund: {
              id: true,
            },
            appeal: {
              id: true,
            },
            appealSource: {
              id: true,
              appeal: {
                id: true,
              },
            },
          },
        },
        pageInfo: {
          hasNextPage: true,
          endCursor: true,
        },
      },
    } as any);

    batch =
      batch ??
      extractQueryRecord<BatchGiftCodingSummaryRecord>(result, 'giftBatch') ??
      null;

    const connection = extractConnection<BatchGiftCodingRow>(
      result,
      'giftStagings',
    );

    rows.push(...connection.edges.map((edge) => edge.node));

    hasNextPage = connection.pageInfo?.hasNextPage === true;
    after =
      typeof connection.pageInfo?.endCursor === 'string'
        ? connection.pageInfo.endCursor
        : undefined;

    if (hasNextPage && !after) {
      throw new Error('Unable to continue loading batch coding rows.');
    }
  }

  return {
    batch,
    rows,
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
          isAnonymousDonor: true,
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
    batch:
      extractQueryRecord<BatchDonorMatchSummaryRecord>(result, 'giftBatch') ??
      null,
    rows: extractConnectionNodes<BatchDonorMatchRow>(result, 'giftStagings'),
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
          isAnonymousDonor: true,
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

  return extractConnectionNodes<BatchDonorMatchRow>(result, 'giftStagings');
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
          paymentType: true,
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
          supporterEmailOptOut: true,
          rawProviderEvidence: true,
          appealSourceExternalId: true,
          sourceAppealName: true,
          sourceFundName: true,
          donorResolutionState: true,
          donor: {
            id: true,
            supporterEmailOptOut: true,
            emails: {
              primaryEmail: true,
              additionalEmails: true,
            },
          },
          softCreditPerson: {
            id: true,
            name: {
              firstName: true,
              lastName: true,
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

  return extractConnectionNodes<BatchProcessingRow>(result, 'giftStagings');
};
