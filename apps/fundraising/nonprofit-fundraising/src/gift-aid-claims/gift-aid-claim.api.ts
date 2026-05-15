import type {
  FinalizeGiftAidClaimBatchResponse,
  QueueGiftAidClaimSubmissionResponse,
} from 'src/gift-aid-claims/gift-aid-claim.types';
import { broadcastGiftAidClaimWorkspaceInvalidated } from 'src/gift-aid-claims/gift-aid-claim-workspace-sync';
import { postAppRouteJson } from 'src/app-api/app-route-client';

export const finalizeGiftAidClaimBatch = async (payload: {
  batchId: string;
}): Promise<FinalizeGiftAidClaimBatchResponse> => {
  const parsed = await postAppRouteJson<FinalizeGiftAidClaimBatchResponse>(
    '/s/gift-aid-claims/finalize-claim-batch',
    payload,
  );
  broadcastGiftAidClaimWorkspaceInvalidated(payload.batchId);

  return parsed;
};

export const queueGiftAidClaimSubmission = async (payload: {
  batchId: string;
}): Promise<QueueGiftAidClaimSubmissionResponse> => {
  const parsed = await postAppRouteJson<QueueGiftAidClaimSubmissionResponse>(
    '/s/gift-aid-claims/queue-claim-submission',
    payload,
  );
  broadcastGiftAidClaimWorkspaceInvalidated(payload.batchId);

  return parsed;
};
