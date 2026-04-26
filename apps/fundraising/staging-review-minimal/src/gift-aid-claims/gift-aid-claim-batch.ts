import { CoreApiClient } from 'twenty-client-sdk/core';
import type {
  GiftAidClaimBatchRecord,
  GiftAidClaimGiftRecord,
  GiftAidClaimWorkspaceRecord,
} from './gift-aid-claim.types';

const getNowIsoDate = () => new Date().toISOString();

const buildDraftBatchName = () => {
  const date = getNowIsoDate().slice(0, 10);
  return `Gift Aid draft ${date}`;
};

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
        node: {
          id: true,
          name: true,
          status: true,
          submittedAt: true,
          giftCount: true,
          totalAmount: true,
          hasBlockingIssues: true,
          blockingIssueCount: true,
        },
      },
    },
  } as any);

  return result?.giftAidClaimBatches?.edges?.[0]?.node as
    | GiftAidClaimBatchRecord
    | undefined;
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
      id: true,
      name: true,
      status: true,
      submittedAt: true,
      giftCount: true,
      totalAmount: true,
      hasBlockingIssues: true,
      blockingIssueCount: true,
    },
  } as any);

  return created.createGiftAidClaimBatch as GiftAidClaimBatchRecord;
};

export const attachGiftToCurrentDraftIfClaimable = async (
  client: CoreApiClient,
  giftId: string,
  payload: { giftAidStatus?: string | null; giftAidClaimBatchId?: string | null },
) => {
  if (
    !giftId ||
    payload.giftAidStatus !== 'CLAIMABLE' ||
    (typeof payload.giftAidClaimBatchId === 'string' &&
      payload.giftAidClaimBatchId.trim() !== '')
  ) {
    return;
  }

  const batch = await getOrCreateCurrentDraftClaimBatch(client);
  await client.mutation({
    updateGift: {
      __args: {
        id: giftId,
        data: {
          giftAidClaimBatch: {
            connect: {
              where: {
                id: batch.id,
              },
            },
          },
        },
      },
      id: true,
    },
  } as any);

  await refreshClaimBatchSummary(client, batch.id);
};

export const refreshClaimBatchSummary = async (
  client: CoreApiClient,
  batchId: string,
) => {
  const gifts = await listGiftsForClaimBatch(client, batchId);
  const claimableGifts = gifts.filter((gift) => gift.giftAidStatus === 'CLAIMABLE');
  const blockingIssueCount = gifts.filter(
    (gift) => gift.giftAidStatus !== 'CLAIMABLE',
  ).length;
  const totalAmountMicros = claimableGifts.reduce((sum, gift) => {
    return sum + (gift.amount?.amountMicros ?? 0);
  }, 0);

  await client.mutation({
    updateGiftAidClaimBatch: {
      __args: {
        id: batchId,
        data: {
          giftCount: claimableGifts.length,
          totalAmount: {
            amountMicros: totalAmountMicros,
            currencyCode: 'GBP',
          },
          hasBlockingIssues: blockingIssueCount > 0,
          blockingIssueCount,
        },
      },
      id: true,
    },
  } as any);
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
        node: {
          id: true,
          name: true,
          giftAidStatus: true,
          giftAidReasonCode: true,
          amount: true,
        },
      },
    },
  } as any);

  return (
    result?.gifts?.edges?.map(
      (edge: { node: GiftAidClaimGiftRecord }) => edge.node,
    ) ?? []
  );
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
      id: true,
      name: true,
      status: true,
      submittedAt: true,
      giftCount: true,
      totalAmount: true,
      hasBlockingIssues: true,
      blockingIssueCount: true,
    },
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
        node: {
          id: true,
          name: true,
          giftAidStatus: true,
          giftAidReasonCode: true,
          amount: true,
        },
      },
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
          completedAt: true,
          externalSubmissionId: true,
          correlationId: true,
          failureCode: true,
          failureMessage: true,
          snapshotJson: true,
          responseJson: true,
        },
      },
    },
  } as any);

  return {
    batch: (result?.giftAidClaimBatch as GiftAidClaimBatchRecord | null) ?? null,
    gifts:
      result?.gifts?.edges?.map(
        (edge: { node: GiftAidClaimGiftRecord }) => edge.node,
      ) ?? [],
    submissions:
      result?.giftAidClaimSubmissions?.edges?.map(
        (edge: { node: any }) => edge.node,
      ) ?? [],
  };
};
