import { CoreApiClient } from 'twenty-client-sdk/core';
import {
  defineLogicFunction,
  type DatabaseEventPayload,
  type ObjectRecordUpdateEvent,
} from 'twenty-sdk/define';
import {
  getAffectedDonorIdsFromGiftUpdate,
  recomputeDonorRollups,
} from 'src/donor-rollups/donor-rollups';

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
  event: DatabaseEventPayload<ObjectRecordUpdateEvent<GiftRollupEventRecord>>,
) => {
  const donorIds = getAffectedDonorIdsFromGiftUpdate(event);

  if (donorIds.length === 0) {
    return {
      scannedDonorCount: 0,
      updatedDonorCount: 0,
      skipped: 'No affected donor ids in event payload',
    };
  }

  return recomputeDonorRollups(new CoreApiClient(), donorIds);
};

export default defineLogicFunction({
  universalIdentifier: 'd7ae8294-f9d9-41a8-8df8-b568fc9da345',
  name: 'refresh-donor-rollups-on-gift-updated',
  description:
    'Recomputes donor rollup fields when a committed gift changes in a way that affects donor totals or recency.',
  timeoutSeconds: 30,
  handler,
  databaseEventTriggerSettings: {
    eventName: 'gift.updated',
    updatedFields: ['donor', 'donorId', 'amount', 'giftDate', 'giftType'],
  },
});
