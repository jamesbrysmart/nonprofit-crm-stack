import type { CoreApiClient, CoreSchema } from 'twenty-client-sdk/core';
import type {
  GiftAidClaimBatchRecord,
  GiftAidClaimGiftRecord,
} from './gift-aid-claim.types';
import { computeClaimBatchRollups } from './gift-aid-claim-batch-rollups';

const giftAidClaimBatchSelection = {
  id: true,
  name: true,
  status: true,
  submittedAt: true,
  latestSubmissionStatus: true,
  giftCount: true,
  totalAmount: { amountMicros: true, currencyCode: true },
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
  refundedAmount: { amountMicros: true },
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

const listClaimGifts = async (
  client: CoreApiClient,
  filter: CoreSchema.GiftFilterInput,
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
    });

    const connection = result.gifts;
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

export const loadClaimBatch = async (
  client: CoreApiClient,
  batchId: string,
): Promise<GiftAidClaimBatchRecord | undefined> => {
  const result = await client.query({
    giftAidClaimBatches: {
      __args: { first: 1, filter: { id: { eq: batchId } } },
      edges: { node: giftAidClaimBatchSelection },
    },
  });
  const batch = result.giftAidClaimBatches?.edges[0]?.node;
  return batch?.name == null ? undefined : { ...batch, name: batch.name };
};

export const refreshClaimBatchSummary = async (client: CoreApiClient, batchId: string) => {
  const summary = computeClaimBatchRollups(await listGiftsForClaimBatch(client, batchId));
  await client.mutation({
    updateGiftAidClaimBatches: {
      __args: {
        filter: { id: { eq: batchId }, status: { eq: 'DRAFT' } },
        data: summary,
      },
      id: true,
    },
  });
};
