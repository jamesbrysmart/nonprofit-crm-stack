import { CoreApiClient } from 'twenty-client-sdk/core';
import {
  defineLogicFunction,
  type DatabaseEventBatchPayload,
  type ObjectRecordUpdateEvent,
} from 'twenty-sdk/define';
import {
  getAffectedAppealIdsFromGiftUpdate,
  recomputeAppealRollups,
} from 'src/appeal-rollups/appeal-rollups';
import {
  APPEAL_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER,
  COMPANY_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER,
  DONOR_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_DATE_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_OBJECT_UNIVERSAL_IDENTIFIER,
  GIFT_REPORTING_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

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
  batch: DatabaseEventBatchPayload<ObjectRecordUpdateEvent<GiftRollupEventRecord>>,
) => {
  const appealIds = batch.events.flatMap(getAffectedAppealIdsFromGiftUpdate);

  if (appealIds.length === 0) {
    return {
      scannedAppealCount: 0,
      updatedAppealCount: 0,
      skipped: 'No affected appeal ids in event batch',
    };
  }

  return recomputeAppealRollups(new CoreApiClient(), appealIds);
};

export default defineLogicFunction({
  universalIdentifier: 'b8ad9d06-8074-40da-8ee5-4e4d762efbf1',
  name: 'refresh-appeal-rollups-on-gift-updated',
  description:
    'Recomputes appeal rollup fields when a committed gift changes in a way that affects appeal totals, contributor counts, or recency.',
  timeoutSeconds: 60,
  handler,
  eventTriggerSettings: {
    on: 'recordEvent',
    objectUniversalIdentifier: GIFT_OBJECT_UNIVERSAL_IDENTIFIER,
    action: 'updated',
    batchMode: true,
    watchedFieldUniversalIdentifiers: [
      GIFT_REPORTING_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
      APPEAL_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER,
      DONOR_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER,
      COMPANY_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER,
      GIFT_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
      GIFT_DATE_FIELD_UNIVERSAL_IDENTIFIER,
    ],
  },
});
