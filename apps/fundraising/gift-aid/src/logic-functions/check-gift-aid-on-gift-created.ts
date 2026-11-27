import {
  defineLogicFunction,
  type DatabaseEventBatchPayload,
  type ObjectRecordCreateEvent,
} from 'twenty-sdk/define';

import { FUNDRAISING_GIFT_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/fundraising-core';
import { CHECK_GIFT_AID_ON_GIFT_CREATED_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { markGiftsChecked } from 'src/logic-functions/mark-gifts-checked';

const handler = async (
  batch: DatabaseEventBatchPayload<ObjectRecordCreateEvent<{ id: string }>>,
) => markGiftsChecked(batch.events.map((event) => event.recordId));

export default defineLogicFunction({
  universalIdentifier: CHECK_GIFT_AID_ON_GIFT_CREATED_UNIVERSAL_IDENTIFIER,
  name: 'check-gift-aid-on-gift-created',
  description: 'Checks Gift Aid for gifts created in Fundraising for Twenty.',
  timeoutSeconds: 60,
  handler,
  eventTriggerSettings: {
    on: 'recordEvent',
    objectUniversalIdentifier: FUNDRAISING_GIFT_OBJECT_UNIVERSAL_IDENTIFIER,
    action: 'created',
    batchMode: true,
  },
});
