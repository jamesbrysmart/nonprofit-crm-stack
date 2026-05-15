import { CoreApiClient } from 'twenty-client-sdk/core';
import { postTwentyRest } from 'src/app-api/twenty-rest-client';
import {
  getOrCreateCurrentDraftClaimBatch,
  loadClaimBatch,
  loadGiftAidClaimWorkspace,
  normalizeString,
  refreshClaimBatchSummary,
} from './gift-aid-claim-batch.queries';
import type { FinalizeGiftAidClaimBatchResponse } from './gift-aid-claim.types';

export { computeClaimBatchRollups } from './gift-aid-claim-batch-rollups';
export {
  getCurrentDraftClaimBatch,
  getOrCreateCurrentDraftClaimBatch,
  listGiftsForClaimBatch,
  listNeedsReviewGiftAidGifts,
  loadGiftAidClaimWorkspace,
  refreshClaimBatchSummary,
} from './gift-aid-claim-batch.queries';

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

  const response = await postTwentyRest<unknown>({
    path: '/rest/batch/gifts?upsert=true&depth=0',
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

export const finalizeGiftAidClaimBatch = async (
  client: CoreApiClient,
  batchId: string,
): Promise<FinalizeGiftAidClaimBatchResponse> => {
  const claimBatch = await loadClaimBatch(client, batchId);
  if (!claimBatch?.id) {
    throw new Error('Gift Aid claim batch not found');
  }

  if (claimBatch.status !== 'DRAFT') {
    throw new Error('Only draft Gift Aid claim batches can be finalized');
  }

  // Recompute claim readiness immediately before finalizing so cached rollups
  // cannot drift from the linked gifts that actually control the workflow.
  await refreshClaimBatchSummary(client, batchId);
  const refreshed = await loadGiftAidClaimWorkspace(client, batchId);
  const batch = refreshed.batch;

  if (!batch?.id) {
    throw new Error('Gift Aid claim batch not found after refresh');
  }

  if ((batch.giftCount ?? 0) === 0) {
    throw new Error('Gift Aid claim batch has no claimable gifts');
  }

  if (batch.hasBlockingIssues === true) {
    throw new Error('Gift Aid claim batch still has blocking issues');
  }

  const submittedAt = new Date().toISOString();

  await client.mutation({
    updateGiftAidClaimBatch: {
      __args: {
        id: batch.id,
        data: {
          status: 'FINALIZED',
          submittedAt,
        },
      },
      id: true,
    },
  } as any);

  try {
    const nextDraft = await getOrCreateCurrentDraftClaimBatch(client);

    return {
      claimBatchId: batch.id,
      nextDraftBatchId: nextDraft.id,
      status: 'FINALIZED',
      submittedAt,
      warningMessage: null,
    };
  } catch {
    return {
      claimBatchId: batch.id,
      nextDraftBatchId: null,
      status: 'FINALIZED',
      submittedAt,
      warningMessage:
        'Draft claim finalized, but the next draft batch could not be prepared automatically.',
    };
  }
};

export const submitGiftAidClaimBatch = finalizeGiftAidClaimBatch;
