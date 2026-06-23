import { CoreApiClient } from 'twenty-client-sdk/core';
import {
  extractConnectionNodes,
  extractMutationRecord,
  extractQueryRecord,
} from 'src/core-api/core-api-results';
import { computeClaimBatchRollups } from './gift-aid-claim-batch-rollups';
import type {
  GiftAidClaimBatchRecord,
  GiftAidClaimGiftRecord,
  GiftAidClaimSubmissionRecord,
  GiftAidClaimWorkspaceRecord,
} from './gift-aid-claim.types';

const getNowIsoDate = () => new Date().toISOString();

const buildDraftBatchName = () => {
  const date = getNowIsoDate().slice(0, 10);
  return `Gift Aid draft ${date}`;
};

const giftAidClaimBatchSelection = {
  id: true,
  name: true,
  status: true,
  submittedAt: true,
  latestSubmissionStatus: true,
  giftCount: true,
  totalAmount: true,
  hasBlockingIssues: true,
  blockingIssueCount: true,
  notes: true,
} as const;

const giftAidClaimGiftSelection = {
  id: true,
  name: true,
  giftDate: true,
  giftAidStatus: true,
  giftAidReasonCode: true,
  giftAidDecisionSource: true,
  amount: {
    amountMicros: true,
    currencyCode: true,
  },
  donorFirstName: true,
  donorLastName: true,
  donorEmail: true,
  donor: {
    id: true,
    mailingAddress: {
      addressStreet1: true,
      addressStreet2: true,
      addressCity: true,
      addressState: true,
      addressPostcode: true,
      addressCountry: true,
    },
  },
  giftAidDeclaration: {
    id: true,
  },
} as const;

export const normalizeString = (value: string | null | undefined) =>
  typeof value === 'string' ? value.trim() : '';

export const getCurrentDraftClaimBatch = async (
  client: CoreApiClient,
): Promise<GiftAidClaimBatchRecord | undefined> => {
  const result = await client.query({
    giftAidClaimBatches: {
      __args: {
        first: 10,
        filter: {
          status: {
            eq: 'DRAFT',
          },
        },
      },
      edges: {
        node: giftAidClaimBatchSelection,
      },
    },
  } as any);

  return extractConnectionNodes<GiftAidClaimBatchRecord>(
    result,
    'giftAidClaimBatches',
  )[0];
};

export const getOrCreateCurrentDraftClaimBatch = async (
  client: CoreApiClient,
): Promise<GiftAidClaimBatchRecord> => {
  const existing = await getCurrentDraftClaimBatch(client);
  if (existing?.id) {
    return existing;
  }

  const created = await client.mutation({
    createGiftAidClaimBatch: {
      __args: {
        data: {
          name: buildDraftBatchName(),
          status: 'DRAFT',
          giftCount: 0,
          totalAmount: {
            amountMicros: 0,
            currencyCode: 'GBP',
          },
          hasBlockingIssues: false,
          blockingIssueCount: 0,
        },
      },
      ...giftAidClaimBatchSelection,
    },
  } as any);

  return extractMutationRecord<GiftAidClaimBatchRecord>(
    created,
    'createGiftAidClaimBatch',
  ) as GiftAidClaimBatchRecord;
};

export const listGiftsForClaimBatch = async (
  client: CoreApiClient,
  batchId: string,
): Promise<GiftAidClaimGiftRecord[]> => {
  const result = await client.query({
    gifts: {
      __args: {
        first: 200,
        filter: {
          giftAidClaimBatchId: {
            eq: batchId,
          },
        },
      },
      edges: {
        node: giftAidClaimGiftSelection,
      },
    },
  } as any);

  return extractConnectionNodes<GiftAidClaimGiftRecord>(result, 'gifts');
};

export const listNeedsReviewGiftAidGifts = async (
  client: CoreApiClient,
): Promise<GiftAidClaimGiftRecord[]> => {
  const result = await client.query({
    gifts: {
      __args: {
        first: 200,
        filter: {
          and: [
            {
              giftAidStatus: {
                eq: 'NEEDS_REVIEW',
              },
            },
            {
              giftAidClaimBatchId: {
                is: 'NULL',
              },
            },
          ],
        },
      },
      edges: {
        node: giftAidClaimGiftSelection,
      },
    },
  } as any);

  return extractConnectionNodes<GiftAidClaimGiftRecord>(result, 'gifts');
};

export const refreshClaimBatchSummary = async (
  client: CoreApiClient,
  batchId: string,
) => {
  const gifts = await listGiftsForClaimBatch(client, batchId);
  const rollups = computeClaimBatchRollups(gifts);

  await client.mutation({
    updateGiftAidClaimBatch: {
      __args: {
        id: batchId,
        data: {
          giftCount: rollups.giftCount,
          totalAmount: rollups.totalAmount,
          hasBlockingIssues: rollups.hasBlockingIssues,
          blockingIssueCount: rollups.blockingIssueCount,
        },
      },
      id: true,
    },
  } as any);
};

export const loadGiftAidClaimWorkspace = async (
  client: CoreApiClient,
  batchId: string,
): Promise<GiftAidClaimWorkspaceRecord> => {
  const result = await client.query({
    giftAidClaimBatch: {
      __args: {
        filter: {
          id: { eq: batchId },
        },
      },
      ...giftAidClaimBatchSelection,
    },
    giftAidClaimSubmissions: {
      __args: {
        first: 50,
        filter: {
          giftAidClaimBatchId: {
            eq: batchId,
          },
        },
      },
      edges: {
        node: {
          id: true,
          name: true,
          status: true,
          environment: true,
          submittedAt: true,
          submittedToHmrcAt: true,
          lastPolledAt: true,
          completedAt: true,
          correlationId: true,
          transactionId: true,
          failureCode: true,
          failureMessage: true,
          snapshotJson: true,
          snapshotHash: true,
          responseJson: true,
          errorSummaryJson: true,
        },
      },
    },
  } as any);

  const gifts = await listGiftsForClaimBatch(client, batchId);
  const needsReviewGifts = await listNeedsReviewGiftAidGifts(client);
  const batch =
    extractQueryRecord<GiftAidClaimBatchRecord>(result, 'giftAidClaimBatch') ??
    null;
  const submissions = extractConnectionNodes<GiftAidClaimSubmissionRecord>(
    result,
    'giftAidClaimSubmissions',
  ).sort((left: GiftAidClaimSubmissionRecord, right: GiftAidClaimSubmissionRecord) => {
      const leftTimestamp = left.submittedAt ?? left.completedAt ?? '';
      const rightTimestamp = right.submittedAt ?? right.completedAt ?? '';

      return rightTimestamp.localeCompare(leftTimestamp);
    });

  if (!batch) {
    return {
      batch: null,
      gifts,
      submissions,
      needsReviewGifts,
    };
  }

  return {
    batch: {
      ...batch,
      ...computeClaimBatchRollups(gifts),
    },
    gifts,
    submissions,
    needsReviewGifts,
  };
};

export const loadClaimBatch = async (client: CoreApiClient, batchId: string) => {
  const refreshed = await client.query({
    giftAidClaimBatch: {
      __args: {
        filter: {
          id: { eq: batchId },
        },
      },
      ...giftAidClaimBatchSelection,
    },
  } as any);

  return (
    extractQueryRecord<GiftAidClaimBatchRecord>(refreshed, 'giftAidClaimBatch') ??
    null
  );
};
