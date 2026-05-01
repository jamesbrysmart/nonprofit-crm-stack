import { CoreApiClient } from 'twenty-client-sdk/core';
import type {
  GiftAidClaimBatchRecord,
  GiftAidClaimGiftRecord,
  GiftAidClaimWorkspaceRecord,
} from './gift-aid-claim.types';

export const computeClaimBatchRollups = (gifts: GiftAidClaimGiftRecord[]) => {
  const claimableGifts = gifts.filter((gift) => gift.giftAidStatus === 'CLAIMABLE');
  const blockingIssueCount = gifts.filter(
    (gift) => gift.giftAidStatus !== 'CLAIMABLE',
  ).length;

  return {
    giftCount: claimableGifts.length,
    totalAmount: {
      amountMicros: claimableGifts.reduce(
        (sum, gift) => sum + (gift.amount?.amountMicros ?? 0),
        0,
      ),
      currencyCode:
        claimableGifts.find((gift) => gift.amount?.currencyCode)?.amount
          ?.currencyCode ?? 'GBP',
    },
    hasBlockingIssues: blockingIssueCount > 0,
    blockingIssueCount,
  };
};

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
          giftDate: true,
          giftAidStatus: true,
          giftAidReasonCode: true,
          giftAidDecisionSource: true,
          giftAidDeclarationId: true,
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
          giftDate: true,
          giftAidStatus: true,
          giftAidReasonCode: true,
          giftAidDecisionSource: true,
          giftAidDeclarationId: true,
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
          submittedToHmrcAt: true,
          lastPolledAt: true,
          completedAt: true,
          externalSubmissionId: true,
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

  const batch = (result?.giftAidClaimBatch as GiftAidClaimBatchRecord | null) ?? null;
  const gifts =
    result?.gifts?.edges?.map(
      (edge: { node: GiftAidClaimGiftRecord }) => edge.node,
    ) ?? [];
  const submissions =
    result?.giftAidClaimSubmissions?.edges?.map((edge: { node: any }) => edge.node) ??
    [];

  if (!batch) {
    return {
      batch: null,
      gifts,
      submissions,
    };
  }

  return {
    batch: {
      ...batch,
      ...computeClaimBatchRollups(gifts),
    },
    gifts,
    submissions,
  };
};

const loadClaimBatch = async (
  client: CoreApiClient,
  batchId: string,
): Promise<GiftAidClaimBatchRecord | null> => {
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
  } as any);

  return result?.giftAidClaimBatch as GiftAidClaimBatchRecord | null;
};

export const finalizeGiftAidClaimBatch = async (
  client: CoreApiClient,
  batchId: string,
) => {
  const claimBatch = await loadClaimBatch(client, batchId);
  if (!claimBatch?.id) {
    throw new Error('Gift Aid claim batch not found');
  }

  if (claimBatch.status !== 'DRAFT') {
    throw new Error('Only draft Gift Aid claim batches can be finalized');
  }

  await refreshClaimBatchSummary(client, batchId);
  const refreshed = await loadGiftAidClaimWorkspace(client, batchId);
  const batch = refreshed.batch;

  if (!batch?.id) {
    throw new Error('Gift Aid claim batch not found after refresh');
  }

  if ((batch.giftCount ?? 0) === 0) {
    throw new Error('Gift Aid claim batch has no claimable gifts');
  }

  if (batch.hasBlockingIssues) {
    throw new Error('Gift Aid claim batch still has blocking issues');
  }

  const submittedAt = new Date().toISOString();
  await client.mutation({
    updateGiftAidClaimBatch: {
      __args: {
        id: batch.id,
        data: {
          status: 'SUBMITTED',
          submittedAt,
        },
      },
      id: true,
      status: true,
      submittedAt: true,
    },
  } as any);

  const nextDraftBatch = await getOrCreateCurrentDraftClaimBatch(client);

  return {
    claimBatchId: batch.id,
    status: 'SUBMITTED' as const,
    submittedAt,
    nextDraftBatchId: nextDraftBatch.id,
  };
};
