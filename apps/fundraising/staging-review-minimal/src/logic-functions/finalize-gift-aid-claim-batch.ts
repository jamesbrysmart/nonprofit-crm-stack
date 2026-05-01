import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk';
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
  universalIdentifier: '57e79941-9e37-4217-993a-2247a1754907',
  name: 'finalize-gift-aid-claim-batch',
  description:
    'Finalizes a Gift Aid claim batch after recomputing claim readiness from linked gifts.',
  timeoutSeconds: 30,
  handler,
  httpRouteTriggerSettings: {
    path: '/gift-aid-claims/finalize-claim-batch',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
