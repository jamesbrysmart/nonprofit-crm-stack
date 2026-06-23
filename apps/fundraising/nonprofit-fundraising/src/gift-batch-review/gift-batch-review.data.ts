import { CoreApiClient } from 'twenty-client-sdk/core';
import {
  extractConnection,
  extractConnectionNodes,
  extractQueryRecord,
} from 'src/core-api/core-api-results';
import { buildGiftBatchReviewRecord } from './gift-batch-review.model';
import type {
  BatchSummaryRecord,
  BatchReviewRow,
  GiftBatchReviewRecord,
} from './gift-batch-review.types';

export type GiftStagingQueueScope =
  | 'all'
  | 'failed'
  | 'not-ready'
  | 'ready'
  | 'possible-donor-matches';

export const buildGiftStagingQueryParams = (
  batchId: string,
  scope: GiftStagingQueueScope,
): Record<string, string | string[]> => {
  const queryParams: Record<string, string | string[]> = {
    'filter[giftBatch][IS]': [batchId],
  };

  switch (scope) {
    case 'failed':
      queryParams['filter[processingStatus][IS]'] = ['PROCESS_FAILED'];
      break;
    case 'not-ready':
      queryParams['filter[giftReadyStatus][IS]'] = ['NEEDS_REVIEW'];
      queryParams['filter[processingStatus][IS_NOT]'] = [
        'PROCESSED',
        'PROCESS_FAILED',
      ];
      break;
    case 'ready':
      queryParams['filter[giftReadyStatus][IS]'] = ['READY_TO_PROCESS'];
      queryParams['filter[processingStatus][IS_NOT]'] = [
        'PROCESSED',
        'PROCESS_FAILED',
      ];
      break;
    case 'possible-donor-matches':
      queryParams['filter[donorResolutionState][IS]'] = ['AMBIGUOUS'];
      queryParams['filter[processingStatus][IS_NOT]'] = [
        'PROCESSED',
        'PROCESS_FAILED',
      ];
      break;
    case 'all':
    default:
      break;
  }

  return queryParams;
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
      processedGifts: true,
      failedGifts: true,
      expectedItemCount: true,
      defaultAppeal: {
        id: true,
        name: true,
        defaultFund: {
          id: true,
          name: true,
        },
      },
      defaultFund: {
        id: true,
        name: true,
      },
      defaultAppealSource: {
        id: true,
        name: true,
        appeal: {
          id: true,
        },
      },
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
          giftReadyStatus: true,
          processingStatus: true,
          errorDetail: true,
          committedGift: {
            id: true,
            name: true,
          },
          appeal: {
            id: true,
            name: true,
          },
          fund: {
            id: true,
            name: true,
          },
        },
      },
      totalCount: true,
    },
  } as any);

  const batch = extractQueryRecord<BatchSummaryRecord>(result, 'giftBatch') ?? null;

  if (!batch) {
    return null;
  }

  const giftStagingsConnection = extractConnection<BatchReviewRow>(
    result,
    'giftStagings',
  );
  const rows = extractConnectionNodes<BatchReviewRow>(result, 'giftStagings');

  return buildGiftBatchReviewRecord(batch, rows, {
    attachedItemCount: giftStagingsConnection.totalCount,
  });
};
