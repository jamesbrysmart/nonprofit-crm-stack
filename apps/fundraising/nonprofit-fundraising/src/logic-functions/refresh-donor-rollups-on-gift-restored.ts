import { CoreApiClient } from 'twenty-client-sdk/core';
import {
  defineLogicFunction,
  type DatabaseEventBatchPayload,
  type ObjectRecordRestoreEvent,
} from 'twenty-sdk/define';
import {
  getAffectedDonorIdsFromGiftRestore,
  recomputeDonorRollups,
} from 'src/donor-rollups/donor-rollups';
import {
  GIFT_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

type GiftRollupEventRecord = {
  donorId?: string | null;
};

const handler = async (
  batch: DatabaseEventBatchPayload<ObjectRecordRestoreEvent<GiftRollupEventRecord>>,
) => {
  const donorIds = batch.events.flatMap(getAffectedDonorIdsFromGiftRestore);

  if (donorIds.length === 0) {
    return {
      scannedDonorCount: 0,
      updatedDonorCount: 0,
      skipped: 'No affected donor ids in event batch',
    };
  }

  return recomputeDonorRollups(new CoreApiClient(), donorIds);
};

export default defineLogicFunction({
  universalIdentifier: '524d687e-9fa5-43d1-a850-96c5644f3be9',
  name: 'refresh-donor-rollups-on-gift-restored',
  description:
    'Recomputes donor rollup fields when a committed gift is restored.',
  timeoutSeconds: 60,
  handler,
  eventTriggerSettings: {
    on: 'recordEvent',
    objectUniversalIdentifier: GIFT_OBJECT_UNIVERSAL_IDENTIFIER,
    action: 'restored',
    batchMode: true,
  },
});
