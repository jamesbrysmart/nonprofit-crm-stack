import { CoreApiClient } from 'twenty-client-sdk/core';
import type {
  GiftAidClaimBatchRecord,
  GiftAidClaimGiftRecord,
  SubmitGiftAidClaimBatchResponse,
  GiftAidClaimWorkspaceRecord,
} from './gift-aid-claim.types';

const getNowIsoDate = () => new Date().toISOString();

const buildDraftBatchName = () => {
  const date = getNowIsoDate().slice(0, 10);
  return `Gift Aid draft ${date}`;
};

const getRestConfig = () => {
  const apiBaseUrl = process.env.TWENTY_API_URL;
  const token =
    process.env.TWENTY_APP_ACCESS_TOKEN ?? process.env.TWENTY_API_KEY;

  if (!apiBaseUrl || !token) {
    throw new Error('Twenty REST configuration missing');
  }

  return {
    apiBaseUrl: apiBaseUrl.replace(/\/$/, ''),
    token,
  };
};

const requestTwentyRest = async <T>({
  path,
  method,
  body,
}: {
  path: string;
  method: 'POST';
  body: unknown;
}): Promise<T> => {
  const { apiBaseUrl, token } = getRestConfig();
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const rawBody = await response.text();

  if (!response.ok) {
    throw new Error(rawBody || `Twenty REST request failed with ${response.status}`);
  }

  if (rawBody.trim() === '') {
    return null as T;
  }

  return JSON.parse(rawBody) as T;
};

const normalizeString = (value: string | null | undefined) =>
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
        node: {
          id: true,
          name: true,
          status: true,
          submittedAt: true,
          giftCount: true,
          totalAmount: true,
          hasBlockingIssues: true,
          blockingIssueCount: true,
          notes: true,
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
      notes: true,
    },
  } as any);

  return created.createGiftAidClaimBatch as GiftAidClaimBatchRecord;
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

export const attachGiftToCurrentDraftIfClaimable = async (
  client: CoreApiClient,
  giftId: string,
  payload: { giftAidStatus?: string | null; giftAidClaimBatchId?: string | null },
) => {
  if (
    !giftId ||
    payload.giftAidStatus !== 'CLAIMABLE' ||
    normalizeString(payload.giftAidClaimBatchId) !== ''
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

export const attachGiftsToCurrentDraftClaimBatch = async (
  client: CoreApiClient,
  giftIds: string[],
) => {
  if (giftIds.length === 0) {
    return;
  }

  const batch = await getOrCreateCurrentDraftClaimBatch(client);

  const response = await requestTwentyRest<unknown>({
    path: '/rest/batch/gifts?upsert=true&depth=0',
    method: 'POST',
    body: giftIds.map((id) => ({
      id,
      giftAidClaimBatchId: batch.id,
    })),
  });

  const body =
    response && typeof response === 'object'
      ? (response as {
          data?: { createGifts?: Array<{ id?: unknown }> };
        })
      : undefined;

  const records = Array.isArray(body?.data?.createGifts)
    ? body.data.createGifts
    : [];

  const returnedIds = new Set(
    records
      .map((record) =>
        typeof record?.id === 'string' ? record.id.trim() : undefined,
      )
      .filter((id): id is string => Boolean(id)),
  );

  if (returnedIds.size !== giftIds.length) {
    throw new Error('Gift Aid claim batch attach returned unexpected id count');
  }

  await refreshClaimBatchSummary(client, batch.id);
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
          donorFirstName: true,
          donorLastName: true,
          donorEmail: true,
          giftAidDeclaration: {
            id: true,
          },
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
        node: {
          id: true,
          name: true,
          giftAidStatus: true,
          giftAidReasonCode: true,
          amount: true,
          donorFirstName: true,
          donorLastName: true,
          donorEmail: true,
          giftAidDeclaration: {
            id: true,
          },
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
      notes: true,
    },
  } as any);

  return {
    batch: (result?.giftAidClaimBatch as GiftAidClaimBatchRecord | null) ?? null,
    gifts: await listGiftsForClaimBatch(client, batchId),
    needsReviewGifts: await listNeedsReviewGiftAidGifts(client),
  };
};

const loadClaimBatch = async (client: CoreApiClient, batchId: string) => {
  const refreshed = await client.query({
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
      notes: true,
    },
  } as any);

  return refreshed?.giftAidClaimBatch as GiftAidClaimBatchRecord | null;
};

export const submitGiftAidClaimBatch = async (
  client: CoreApiClient,
  batchId: string,
): Promise<SubmitGiftAidClaimBatchResponse> => {
  await refreshClaimBatchSummary(client, batchId);

  const claimBatch = await loadClaimBatch(client, batchId);
  if (!claimBatch?.id) {
    throw new Error('Gift Aid claim batch not found');
  }

  if (claimBatch.status !== 'DRAFT' && claimBatch.status !== 'SUBMISSION_FAILED') {
    throw new Error('Only draft claim batches can be finalized');
  }

  if ((claimBatch.giftCount ?? 0) === 0) {
    throw new Error('Gift Aid claim batch has no claimable gifts');
  }

  if (claimBatch.hasBlockingIssues === true) {
    throw new Error('Gift Aid claim batch still has blocking issues');
  }

  const completedAt = new Date().toISOString();

  await client.mutation({
    updateGiftAidClaimBatch: {
      __args: {
        id: claimBatch.id,
        data: {
          status: 'SUBMITTED',
          submittedAt: completedAt,
        },
      },
      id: true,
    },
  } as any);

  const nextDraft = await getOrCreateCurrentDraftClaimBatch(client);

  return {
    submittedBatchId: claimBatch.id,
    nextDraftBatchId: nextDraft.id,
    status: 'SUBMITTED',
  };
};
