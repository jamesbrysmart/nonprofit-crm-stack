import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import {
  getGiftBatchWorkflowLimitMessage,
  isGiftBatchOverWorkflowLimit,
} from 'src/batch-processing/batch-processing.limits';
import { runDonorMatchOnRows } from 'src/batch-donor-match/batch-donor-match.service';
import { loadBatchDonorMatchContext } from 'src/batch-processing/batch-loaders';
import type {
  BatchDonorMatchRequest,
  BatchDonorMatchResponse,
} from 'src/batch-donor-match/batch-donor-match.types';

const handler = async (
  event: RoutePayload<BatchDonorMatchRequest>,
): Promise<BatchDonorMatchResponse> => {
  const giftBatchId =
    typeof event.body?.giftBatchId === 'string' ? event.body.giftBatchId.trim() : '';

  if (giftBatchId === '') {
    throw new Error('giftBatchId is required');
  }

  const client = new CoreApiClient();
  const { batch, rows } = await loadBatchDonorMatchContext(client, giftBatchId);

  if (!batch) {
    throw new Error('Batch not found');
  }

  if (isGiftBatchOverWorkflowLimit(batch.totalItems)) {
    throw new Error(getGiftBatchWorkflowLimitMessage(batch.totalItems));
  }
  const result = await runDonorMatchOnRows(client, rows);

  return {
    giftBatchId,
    ...result,
  };
};

export default defineLogicFunction({
  universalIdentifier: '6448d2f5-91fc-465c-8204-ee0ffcbfdcb8',
  name: 'run-batch-donor-match',
  description:
    'Runs a conservative donor-match pass for one gift batch and writes safe outcomes back to staging rows.',
  timeoutSeconds: 120,
  handler,
  httpRouteTriggerSettings: {
    path: '/batch-processing/run-donor-match',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
