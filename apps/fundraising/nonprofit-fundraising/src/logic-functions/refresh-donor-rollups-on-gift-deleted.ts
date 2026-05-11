import { CoreApiClient } from 'twenty-client-sdk/core';
import {
  defineLogicFunction,
  type DatabaseEventPayload,
  type ObjectRecordDeleteEvent,
} from 'twenty-sdk/define';
import {
  getAffectedDonorIdsFromGiftDelete,
  recomputeDonorRollups,
} from 'src/donor-rollups/donor-rollups';

type GiftRollupEventRecord = {
  donorId?: string | null;
};

const handler = async (
  event: DatabaseEventPayload<ObjectRecordDeleteEvent<GiftRollupEventRecord>>,
) => {
  const donorIds = getAffectedDonorIdsFromGiftDelete(event);

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
  universalIdentifier: '4d7be5f7-a17b-4229-bdd7-8aa27f136ce9',
  name: 'refresh-donor-rollups-on-gift-deleted',
  description:
    'Recomputes donor rollup fields when a committed gift is deleted.',
  timeoutSeconds: 30,
  handler,
  databaseEventTriggerSettings: {
    eventName: 'gift.deleted',
  },
});
