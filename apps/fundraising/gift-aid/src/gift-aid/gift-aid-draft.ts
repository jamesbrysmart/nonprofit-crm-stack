import { CoreApiClient } from 'twenty-client-sdk/core';

const getCurrentDraft = async (client: CoreApiClient): Promise<{ id: string } | undefined> => {
  const { giftAidClaimBatches } = await client.query({
    giftAidClaimBatches: {
      __args: { first: 2, filter: { status: { eq: 'DRAFT' } } },
      edges: { node: { id: true } },
    },
  });

  if (!giftAidClaimBatches) throw new Error('Reading Gift Aid drafts returned no result');
  if (giftAidClaimBatches.edges.length > 1) {
    throw new Error('More than one Gift Aid draft is open');
  }
  return giftAidClaimBatches.edges[0]?.node;
};

export const getOrCreateDraft = async (client: CoreApiClient): Promise<{ id: string }> => {
  const draft = await getCurrentDraft(client);
  if (draft) return draft;

  try {
    const { createGiftAidClaimBatch } = await client.mutation({
      createGiftAidClaimBatch: {
        __args: {
          data: {
            name: `Gift Aid draft ${new Date().toISOString().slice(0, 10)}`,
            status: 'DRAFT',
            activeDraftKey: 'CURRENT',
            giftCount: 0,
            blockingIssueCount: 0,
            hasBlockingIssues: false,
            totalAmount: { amountMicros: 0, currencyCode: 'GBP' },
          },
        },
        id: true,
      },
    });
    if (!createGiftAidClaimBatch) throw new Error('Creating a Gift Aid draft returned no record');
    return createGiftAidClaimBatch;
  } catch (error) {
    // A concurrent writer may already have created the uniquely keyed draft.
    const current = await getCurrentDraft(client);
    if (!current) throw error;
    return current;
  }
};
