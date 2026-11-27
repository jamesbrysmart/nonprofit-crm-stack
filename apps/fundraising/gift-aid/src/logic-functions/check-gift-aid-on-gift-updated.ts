import {
  defineLogicFunction,
  type DatabaseEventBatchPayload,
  type ObjectRecordUpdateEvent,
} from 'twenty-sdk/define';

import {
  FUNDRAISING_DONOR_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER,
  FUNDRAISING_GIFT_AID_INTAKE_FIELD_UNIVERSAL_IDENTIFIER,
  FUNDRAISING_GIFT_DONOR_FIRST_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  FUNDRAISING_GIFT_DONOR_LAST_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  FUNDRAISING_GIFT_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
  FUNDRAISING_GIFT_DATE_FIELD_UNIVERSAL_IDENTIFIER,
  FUNDRAISING_GIFT_OBJECT_UNIVERSAL_IDENTIFIER,
  FUNDRAISING_GIFT_TYPE_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/fundraising-core';
import { CHECK_GIFT_AID_ON_GIFT_UPDATED_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { processGiftAidGifts } from 'src/gift-aid/process-gifts';

const handler = async (
  batch: DatabaseEventBatchPayload<ObjectRecordUpdateEvent<{ id: string }>>,
) => processGiftAidGifts(batch.events.map((event) => event.recordId));

export default defineLogicFunction({
  universalIdentifier: CHECK_GIFT_AID_ON_GIFT_UPDATED_UNIVERSAL_IDENTIFIER,
  name: 'check-gift-aid-on-gift-updated',
  description: 'Re-checks Gift Aid when a gift changes in a way that affects eligibility.',
  timeoutSeconds: 60,
  handler,
  eventTriggerSettings: {
    on: 'recordEvent',
    objectUniversalIdentifier: FUNDRAISING_GIFT_OBJECT_UNIVERSAL_IDENTIFIER,
    action: 'updated',
    batchMode: true,
    // Only eligibility inputs, so this function's own writes don't retrigger it
    watchedFieldUniversalIdentifiers: [
      FUNDRAISING_GIFT_AID_INTAKE_FIELD_UNIVERSAL_IDENTIFIER,
      FUNDRAISING_GIFT_DONOR_FIRST_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      FUNDRAISING_GIFT_DONOR_LAST_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      FUNDRAISING_GIFT_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
      FUNDRAISING_GIFT_DATE_FIELD_UNIVERSAL_IDENTIFIER,
      FUNDRAISING_GIFT_TYPE_FIELD_UNIVERSAL_IDENTIFIER,
      FUNDRAISING_DONOR_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER,
    ],
  },
});
