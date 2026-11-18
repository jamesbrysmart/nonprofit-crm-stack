import type {
  FinalizeGiftAidClaimBatchResponse,
  QueueGiftAidClaimSubmissionResponse,
} from 'src/gift-aid-claims/gift-aid-claim.types';
import { postAppRouteJson } from 'src/app-api/app-route-client';

export const finalizeGiftAidClaimBatch = (payload: {
  batchId: string;
}): Promise<FinalizeGiftAidClaimBatchResponse> =>
  postAppRouteJson<FinalizeGiftAidClaimBatchResponse>(
    '/s/gift-aid-claims/finalize-claim-batch',
    payload,
  );

export const queueGiftAidClaimSubmission = (payload: {
  batchId: string;
}): Promise<QueueGiftAidClaimSubmissionResponse> =>
  postAppRouteJson<QueueGiftAidClaimSubmissionResponse>(
    '/s/gift-aid-claims/queue-claim-submission',
    payload,
  );
