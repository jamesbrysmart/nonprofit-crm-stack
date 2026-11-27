import type { CoreApiClient } from 'twenty-client-sdk/core';
import { getOrCreateDraft } from 'src/gift-aid/gift-aid-draft';
import { computeClaimBatchRollups } from './gift-aid-claim-batch-rollups';
import { listGiftsForClaimBatch, loadClaimBatch } from './gift-aid-claim-batch.queries';
import type { FinalizeGiftAidClaimBatchResponse } from './gift-aid-claim.types';

export const finalizeGiftAidClaimBatch = async (
  client: CoreApiClient,
  batchId: string,
): Promise<FinalizeGiftAidClaimBatchResponse> => {
  const batch = await loadClaimBatch(client, batchId);
  if (!batch) throw new Error('Gift Aid claim batch not found');
  if (batch.status !== 'DRAFT') {
    throw new Error('Only draft Gift Aid claim batches can be finalized');
  }

  // Read every linked Gift before deciding whether this draft can be closed.
  const summary = computeClaimBatchRollups(await listGiftsForClaimBatch(client, batchId));
  const canFinalize = summary.giftCount > 0 && !summary.hasBlockingIssues;
  const submittedAt = new Date().toISOString();
  const result = await client.mutation({
    updateGiftAidClaimBatches: {
      __args: {
        filter: {
          id: { eq: batchId },
          status: { eq: 'DRAFT' },
        },
        data: {
          ...summary,
          ...(canFinalize ? { status: 'FINALIZED', submittedAt, activeDraftKey: null } : {}),
        },
      },
      id: true,
    },
  });
  if (result.updateGiftAidClaimBatches?.length !== 1) {
    throw new Error('The Gift Aid draft changed while it was being finalized');
  }
  if (summary.giftCount === 0) throw new Error('Gift Aid claim batch has no claimable gifts');
  if (summary.hasBlockingIssues) throw new Error('Gift Aid claim batch still has blocking issues');

  let nextDraftBatchId: string | null = null;
  let warningMessage: string | null = null;
  try {
    nextDraftBatchId = (await getOrCreateDraft(client)).id;
  } catch {
    warningMessage = 'Draft claim finalized, but the next draft batch could not be prepared automatically.';
  }

  return { claimBatchId: batchId, submittedAt, status: 'FINALIZED', nextDraftBatchId, warningMessage };
};
