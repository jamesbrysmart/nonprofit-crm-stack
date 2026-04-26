import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk';
import { submitGiftAidClaimBatch } from 'src/gift-aid-claims/gift-aid-claim-submission';

const handler = async (event: RoutePayload<{ batchId?: string }>) => {
  const batchId = event.body?.batchId?.trim();

  if (!batchId) {
    throw new Error('batchId is required');
  }

  const client = new CoreApiClient();
  return await submitGiftAidClaimBatch(client, batchId);
};

export default defineLogicFunction({
  universalIdentifier: '6d7fb9a1-eaf8-45c0-85bf-2c17a2d8f685',
  name: 'submit-gift-aid-claim-batch',
  description:
    'Submits a Gift Aid claim batch through the bounded submission probe and writes durable submission state back.',
  timeoutSeconds: 30,
  handler,
  httpRouteTriggerSettings: {
    path: '/gift-aid-claims/submit-claim-batch',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
