import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { finalizeGiftAidClaimBatch } from 'src/gift-aid-claims/gift-aid-claim-batch';
import { CoreApiClient } from 'twenty-client-sdk/core';

const handler = async (event: RoutePayload<{ batchId?: string }>) => {
  const batchId = event.body?.batchId?.trim();

  if (!batchId) {
    throw new Error('batchId is required');
  }

  const client = new CoreApiClient();
  return await finalizeGiftAidClaimBatch(client, batchId);
};

export default defineLogicFunction({
  universalIdentifier: '35704d88-8333-4ab8-b1dc-26e78f621e4e',
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
