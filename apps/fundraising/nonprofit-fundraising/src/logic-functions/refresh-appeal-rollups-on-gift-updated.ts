import { CoreApiClient } from 'twenty-client-sdk/core';
import {
  defineLogicFunction,
  type DatabaseEventPayload,
  type ObjectRecordUpdateEvent,
} from 'twenty-sdk/define';
import {
  APPEAL_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/fields/appeal-on-gift.field';
import {
  COMPANY_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/fields/company-on-gift.field';
import {
  DONOR_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/fields/donor-on-gift.field';
import {
  GIFT_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_DATE_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/objects/gift.object';
import {
  getAffectedAppealIdsFromGiftUpdate,
  recomputeAppealRollups,
} from 'src/appeal-rollups/appeal-rollups';

type GiftRollupEventRecord = {
  appealId?: string | null;
  donorId?: string | null;
  companyId?: string | null;
  giftDate?: string | null;
  amount?: {
    amountMicros?: number | null;
    currencyCode?: string | null;
  } | null;
};

const handler = async (
  event: DatabaseEventPayload<ObjectRecordUpdateEvent<GiftRollupEventRecord>>,
) => {
  const appealIds = getAffectedAppealIdsFromGiftUpdate(event);

  if (appealIds.length === 0) {
    return {
      scannedAppealCount: 0,
      updatedAppealCount: 0,
      skipped: 'No affected appeal ids in event payload',
    };
  }

  return recomputeAppealRollups(new CoreApiClient(), appealIds);
};

export default defineLogicFunction({
  universalIdentifier: 'b8ad9d06-8074-40da-8ee5-4e4d762efbf1',
  name: 'refresh-appeal-rollups-on-gift-updated',
  description:
    'Recomputes appeal rollup fields when a committed gift changes in a way that affects appeal totals, contributor counts, or recency.',
  timeoutSeconds: 30,
  handler,
  eventTriggerSettings: {
    on: 'recordEvent',
    objectUniversalIdentifier: GIFT_OBJECT_UNIVERSAL_IDENTIFIER,
    action: 'updated',
    watchedFieldUniversalIdentifiers: [
      APPEAL_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER,
      DONOR_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER,
      COMPANY_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER,
      GIFT_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
      GIFT_DATE_FIELD_UNIVERSAL_IDENTIFIER,
    ],
  },
});
