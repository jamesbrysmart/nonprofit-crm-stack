import { CoreApiClient } from 'twenty-client-sdk/core';
import {
  defineLogicFunction,
  type DatabaseEventBatchPayload,
  type ObjectRecordDeleteEvent,
} from 'twenty-sdk/define';
import {
  getAffectedDonorIdsFromGiftDelete,
  recomputeDonorRollups,
} from 'src/donor-rollups/donor-rollups';
import {
  GIFT_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

type GiftRollupEventRecord = {
  donorId?: string | null;
};

const handler = async (
  batch: DatabaseEventBatchPayload<ObjectRecordDeleteEvent<GiftRollupEventRecord>>,
) => {
  const donorIds = batch.events.flatMap(getAffectedDonorIdsFromGiftDelete);

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
  universalIdentifier: '4d7be5f7-a17b-4229-bdd7-8aa27f136ce9',
  name: 'refresh-donor-rollups-on-gift-deleted',
  description:
    'Recomputes donor rollup fields when a committed gift is deleted.',
  timeoutSeconds: 60,
  handler,
  eventTriggerSettings: {
    on: 'recordEvent',
    objectUniversalIdentifier: GIFT_OBJECT_UNIVERSAL_IDENTIFIER,
    action: 'deleted',
    batchMode: true,
  },
});
