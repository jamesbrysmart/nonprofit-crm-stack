import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { queueGiftAidClaimSubmission } from 'src/gift-aid-claims/gift-aid-claim-submission';

const handler = async (event: RoutePayload<{ batchId?: string }>) => {
  const batchId = event.body?.batchId?.trim();

  if (!batchId) {
    throw new Error('batchId is required');
  }

  const client = new CoreApiClient();
  return await queueGiftAidClaimSubmission(client, batchId);
};

export default defineLogicFunction({
  universalIdentifier: '787bb4c2-5a9d-4fb5-b29f-1e95f94bc7c7',
  name: 'queue-gift-aid-claim-submission',
  description:
    'Queues a finalized Gift Aid claim batch for the HMRC submission probe and records durable submission results.',
  timeoutSeconds: 30,
  handler,
  httpRouteTriggerSettings: {
    path: '/gift-aid-claims/queue-claim-submission',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
