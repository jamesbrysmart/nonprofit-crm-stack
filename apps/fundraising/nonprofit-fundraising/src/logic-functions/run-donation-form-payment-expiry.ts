import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';
import { RUN_DONATION_FORM_PAYMENT_EXPIRY_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { expireAwaitingDonationFormPayments } from 'src/donation-forms/donation-form-payment-expiry';

const handler = async () =>
  expireAwaitingDonationFormPayments(new CoreApiClient());

export default defineLogicFunction({
  universalIdentifier:
    RUN_DONATION_FORM_PAYMENT_EXPIRY_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'run-donation-form-payment-expiry',
  description:
    'Marks stale donation-form payment attempts as expired. Enqueued by the nightly schedule.',
  timeoutSeconds: 300,
  handler,
});
