import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { queueGiftAidClaimSubmission } from 'src/gift-aid-claims/gift-aid-claim-submission';
import { CoreApiClient } from 'twenty-client-sdk/core';

const handler = async (event: RoutePayload<{ batchId?: string }>) => {
  const batchId = event.body?.batchId?.trim();

  if (!batchId) {
    throw new Error('batchId is required');
  }

  const client = new CoreApiClient();
  return await queueGiftAidClaimSubmission(client, batchId);
};

export default defineLogicFunction({
  universalIdentifier: '81f42033-bedb-417b-972e-5a8df9fa8094',
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
