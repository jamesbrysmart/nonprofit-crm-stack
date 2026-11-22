import {
  defineLogicFunction,
  type DatabaseEventBatchPayload,
  type ObjectRecordDeleteEvent,
} from 'twenty-sdk/define';
import {
  getAffectedAppealSourceIdsFromGiftDelete,
  recomputeAppealSourceRollups,
} from 'src/appeal-source-rollups/appeal-source-rollups';
import {
  GIFT_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { createCoreApiClient } from 'src/core-api/rate-limit-retry';

type GiftRollupEventRecord = {
  appealSourceId?: string | null;
};

const handler = async (
  batch: DatabaseEventBatchPayload<ObjectRecordDeleteEvent<GiftRollupEventRecord>>,
) => {
  const appealSourceIds = batch.events.flatMap(getAffectedAppealSourceIdsFromGiftDelete);

  if (appealSourceIds.length === 0) {
    return {
      scannedAppealSourceCount: 0,
      updatedAppealSourceCount: 0,
      skipped: 'No affected appeal source ids in event batch',
    };
  }

  return recomputeAppealSourceRollups(createCoreApiClient(), appealSourceIds);
};

export default defineLogicFunction({
  universalIdentifier: 'b64613b9-8019-439f-b3c1-4bb89ac18500',
  name: 'refresh-appeal-source-rollups-on-gift-deleted',
  description:
    'Recomputes appeal source rollup fields when a committed gift is deleted.',
  timeoutSeconds: 60,
  handler,
  eventTriggerSettings: {
    on: 'recordEvent',
    objectUniversalIdentifier: GIFT_OBJECT_UNIVERSAL_IDENTIFIER,
    action: 'deleted',
    batchMode: true,
  },
});
