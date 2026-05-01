import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk';
import { queueGiftAidClaimSubmission } from 'src/gift-aid-claims/gift-aid-claim-submission';

const queueHandler = async (event: RoutePayload<{ batchId?: string }>) => {
  const batchId = event.body?.batchId?.trim();

  if (!batchId) {
    throw new Error('batchId is required');
  }

  const client = new CoreApiClient();
  return await queueGiftAidClaimSubmission(client, batchId);
};

export default defineLogicFunction({
  universalIdentifier: '6d7fb9a1-eaf8-45c0-85bf-2c17a2d8f685',
  name: 'queue-gift-aid-claim-submission',
  description:
    'Queues a finalized Gift Aid claim batch for the bounded HMRC submission probe and writes durable submission state back.',
  timeoutSeconds: 30,
  handler: queueHandler,
  httpRouteTriggerSettings: {
    path: '/gift-aid-claims/queue-claim-submission',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
