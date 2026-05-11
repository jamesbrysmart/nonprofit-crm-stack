import { CoreApiClient } from 'twenty-client-sdk/core';
import {
  defineLogicFunction,
  type DatabaseEventPayload,
  type ObjectRecordRestoreEvent,
} from 'twenty-sdk/define';
import {
  getAffectedDonorIdsFromGiftRestore,
  recomputeDonorRollups,
} from 'src/donor-rollups/donor-rollups';

type GiftRollupEventRecord = {
  donorId?: string | null;
};

const handler = async (
  event: DatabaseEventPayload<ObjectRecordRestoreEvent<GiftRollupEventRecord>>,
) => {
  const donorIds = getAffectedDonorIdsFromGiftRestore(event);

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
  universalIdentifier: '524d687e-9fa5-43d1-a850-96c5644f3be9',
  name: 'refresh-donor-rollups-on-gift-restored',
  description:
    'Recomputes donor rollup fields when a committed gift is restored.',
  timeoutSeconds: 30,
  handler,
  databaseEventTriggerSettings: {
    eventName: 'gift.restored',
  },
});
