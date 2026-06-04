import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction, type CronPayload } from 'twenty-sdk/define';
import { expireAwaitingDonationFormPayments } from 'src/donation-forms/donation-form-payment-expiry';

type ExpireDonationFormPaymentsResponse = {
  mode: 'scheduled';
  scannedCount: number;
  expiredCount: number;
};

const handler = async (
  _event: CronPayload,
): Promise<ExpireDonationFormPaymentsResponse> => {
  const client = new CoreApiClient();
  const result = await expireAwaitingDonationFormPayments(client);

  return {
    mode: 'scheduled',
    ...result,
  };
};

export default defineLogicFunction({
  universalIdentifier: '87594ebb-2c50-46f0-aa92-4e5f0901e033',
  name: 'expire-donation-form-payments-nightly',
  description:
    'Marks stale donation-form payment attempts as expired so they no longer remain indefinitely awaiting payment.',
  timeoutSeconds: 300,
  handler,
  cronTriggerSettings: {
    pattern: '0 2 * * *',
  },
});
