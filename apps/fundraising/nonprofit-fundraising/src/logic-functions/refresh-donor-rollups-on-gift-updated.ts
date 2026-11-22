import {
  defineLogicFunction,
  type DatabaseEventBatchPayload,
  type ObjectRecordUpdateEvent,
} from 'twenty-sdk/define';
import {
  getAffectedDonorIdsFromGiftUpdate,
  recomputeDonorRollups,
} from 'src/donor-rollups/donor-rollups';
import {
  DONOR_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_DATE_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_OBJECT_UNIVERSAL_IDENTIFIER,
  GIFT_REPORTING_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_TYPE_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { createCoreApiClient } from 'src/core-api/rate-limit-retry';

type GiftRollupEventRecord = {
  donorId?: string | null;
  giftDate?: string | null;
  giftType?: string | null;
  amount?: {
    amountMicros?: number | null;
    currencyCode?: string | null;
  } | null;
};

const handler = async (
  batch: DatabaseEventBatchPayload<ObjectRecordUpdateEvent<GiftRollupEventRecord>>,
) => {
  const donorIds = batch.events.flatMap(getAffectedDonorIdsFromGiftUpdate);

  if (donorIds.length === 0) {
    return {
      scannedDonorCount: 0,
      updatedDonorCount: 0,
      skipped: 'No affected donor ids in event batch',
    };
  }

  return recomputeDonorRollups(createCoreApiClient(), donorIds);
};

export default defineLogicFunction({
  universalIdentifier: 'd7ae8294-f9d9-41a8-8df8-b568fc9da345',
  name: 'refresh-donor-rollups-on-gift-updated',
  description:
    'Recomputes donor rollup fields when a committed gift changes in a way that affects donor totals or recency.',
  timeoutSeconds: 60,
  handler,
  eventTriggerSettings: {
    on: 'recordEvent',
    objectUniversalIdentifier: GIFT_OBJECT_UNIVERSAL_IDENTIFIER,
    action: 'updated',
    batchMode: true,
    watchedFieldUniversalIdentifiers: [
      GIFT_REPORTING_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
      DONOR_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER,
      GIFT_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
      GIFT_DATE_FIELD_UNIVERSAL_IDENTIFIER,
      GIFT_TYPE_FIELD_UNIVERSAL_IDENTIFIER,
    ],
  },
});
