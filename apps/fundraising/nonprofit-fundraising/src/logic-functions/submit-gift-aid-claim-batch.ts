import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { finalizeGiftAidClaimBatch } from 'src/gift-aid-claims/gift-aid-claim-batch';

const handler = async (event: RoutePayload<{ batchId?: string }>) => {
  const batchId = event.body?.batchId?.trim();

  if (!batchId) {
    throw new Error('batchId is required');
  }

  const client = new CoreApiClient();
  return await finalizeGiftAidClaimBatch(client, batchId);
};

export default defineLogicFunction({
  universalIdentifier: '0656d64b-3e08-4b31-b57d-3eb5b3d3493f',
  name: 'finalize-gift-aid-claim-batch',
  description:
    'Finalizes a clean Gift Aid draft claim batch and prepares the next draft.',
  timeoutSeconds: 30,
  handler,
  httpRouteTriggerSettings: {
    path: '/gift-aid-claims/finalize-claim-batch',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
