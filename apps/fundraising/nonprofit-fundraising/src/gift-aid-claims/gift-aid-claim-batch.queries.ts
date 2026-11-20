import { CoreApiClient } from 'twenty-client-sdk/core';
import {
  type Connection,
  extractConnectionNodes,
  extractMutationRecord,
  extractQueryRecord,
} from 'src/core-api/core-api-results';
import { postTwentyRest } from 'src/app-api/twenty-rest-client';
import {
  isSterlingAmount,
  NON_STERLING_GIFT_AID_REASON_CODE,
} from 'src/gift-aid/gift-aid-currency';
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

const listClaimGifts = async (
  client: CoreApiClient,
  filter: Record<string, unknown>,
): Promise<GiftAidClaimGiftRecord[]> => {
  const gifts: GiftAidClaimGiftRecord[] = [];
  const cursors = new Set<string>();
  let after: string | undefined;

  while (true) {
    const result = await client.query({
      gifts: {
        __args: {
          first: 200,
          filter,
          ...(after ? { after } : {}),
        },
        edges: { node: giftAidClaimGiftSelection },
        pageInfo: { hasNextPage: true, endCursor: true },
      },
    } as any);

    const connection = extractQueryRecord<Connection<GiftAidClaimGiftRecord>>(
      result,
      'gifts',
    );
    // Financial totals must never treat a malformed/incomplete response as an empty page.
    if (
      !Array.isArray(connection?.edges) ||
      typeof connection.pageInfo?.hasNextPage !== 'boolean'
    ) {
      throw new Error('Unable to load complete claim gift connection');
    }

    gifts.push(...connection.edges.map((edge) => edge.node));

    if (!connection.pageInfo.hasNextPage) return gifts;

    const cursor = connection.pageInfo.endCursor;
    if (
      typeof cursor !== 'string' ||
      cursor.trim() === '' ||
      cursors.has(cursor)
    ) {
      throw new Error(
        'Unable to continue loading claim gifts: invalid or repeated cursor',
      );
    }
    cursors.add(cursor);
    after = cursor;
  }
};

export const listGiftsForClaimBatch = (
  client: CoreApiClient,
  batchId: string,
): Promise<GiftAidClaimGiftRecord[]> =>
  listClaimGifts(client, { giftAidClaimBatchId: { eq: batchId } });

export const listNeedsReviewGiftAidGifts = async (
  client: CoreApiClient,
): Promise<GiftAidClaimGiftRecord[]> =>
  listClaimGifts(client, {
    and: [
      { giftAidStatus: { eq: 'NEEDS_REVIEW' } },
      { giftAidClaimBatchId: { is: 'NULL' } },
    ],
  });

// Gifts marked claimable before the sterling rule existed must not reach a
// claim; move them to review so the blocking worklist shows them.
const moveNonSterlingClaimableGiftsToReview = async (
  gifts: GiftAidClaimGiftRecord[],
): Promise<GiftAidClaimGiftRecord[]> => {
  const nonSterlingGiftIds = gifts
    .filter(
      (gift) =>
        gift.giftAidStatus === 'CLAIMABLE' && !isSterlingAmount(gift.amount),
    )
    .map((gift) => gift.id);

  if (nonSterlingGiftIds.length === 0) {
    return gifts;
  }

  const evaluatedAt = new Date().toISOString();
  const review = {
    giftAidStatus: 'NEEDS_REVIEW',
    giftAidReasonCode: NON_STERLING_GIFT_AID_REASON_CODE,
    giftAidDecisionSource: 'SYSTEM',
    giftAidLastEvaluatedAt: evaluatedAt,
  };

  await postTwentyRest<unknown>({
    path: '/rest/batch/gifts?upsert=true&depth=0',
    body: nonSterlingGiftIds.map((id) => ({ id, ...review })),
  });

  const movedIds = new Set(nonSterlingGiftIds);

  return gifts.map((gift) =>
    movedIds.has(gift.id) ? { ...gift, ...review } : gift,
  );
};

export const refreshClaimBatchSummary = async (
  client: CoreApiClient,
  batchId: string,
) => {
  const gifts = await moveNonSterlingClaimableGiftsToReview(
    await listGiftsForClaimBatch(client, batchId),
  );
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
  ).sort(
    (
      left: GiftAidClaimSubmissionRecord,
      right: GiftAidClaimSubmissionRecord,
    ) => {
      const leftTimestamp = left.submittedAt ?? left.completedAt ?? '';
      const rightTimestamp = right.submittedAt ?? right.completedAt ?? '';

      return rightTimestamp.localeCompare(leftTimestamp);
    },
  );

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

export const loadClaimBatch = async (
  client: CoreApiClient,
  batchId: string,
) => {
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
    extractQueryRecord<GiftAidClaimBatchRecord>(
      refreshed,
      'giftAidClaimBatch',
    ) ?? null
  );
};
