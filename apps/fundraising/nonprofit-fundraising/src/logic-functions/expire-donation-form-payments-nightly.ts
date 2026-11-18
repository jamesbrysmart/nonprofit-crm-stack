import { defineLogicFunction } from 'twenty-sdk/define';
import { RUN_DONATION_FORM_PAYMENT_EXPIRY_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { enqueueSpreadNightlyJob } from 'src/scheduling/enqueue-spread-job';

const handler = async () =>
  enqueueSpreadNightlyJob({
    logicFunctionUniversalIdentifier:
      RUN_DONATION_FORM_PAYMENT_EXPIRY_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
    jobIdPrefix: 'donation-form-payment-expiry',
  });

export default defineLogicFunction({
  universalIdentifier: '87594ebb-2c50-46f0-aa92-4e5f0901e033',
  name: 'expire-donation-form-payments-nightly',
  description:
    'Schedules the nightly expiry of stale donation-form payment attempts, spread across an hour.',
  timeoutSeconds: 30,
  handler,
  cronTriggerSettings: {
    pattern: '0 2 * * *',
  },
});
