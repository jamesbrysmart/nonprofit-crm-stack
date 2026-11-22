import {
  defineLogicFunction,
  type DatabaseEventBatchPayload,
  type ObjectRecordRestoreEvent,
} from 'twenty-sdk/define';
import {
  getAffectedAppealSourceIdsFromGiftRestore,
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
  batch: DatabaseEventBatchPayload<ObjectRecordRestoreEvent<GiftRollupEventRecord>>,
) => {
  const appealSourceIds = batch.events.flatMap(getAffectedAppealSourceIdsFromGiftRestore);

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
  universalIdentifier: '02a2791b-5e76-4744-befa-de9441d03736',
  name: 'refresh-appeal-source-rollups-on-gift-restored',
  description:
    'Recomputes appeal source rollup fields when a committed gift is restored.',
  timeoutSeconds: 60,
  handler,
  eventTriggerSettings: {
    on: 'recordEvent',
    objectUniversalIdentifier: GIFT_OBJECT_UNIVERSAL_IDENTIFIER,
    action: 'restored',
    batchMode: true,
  },
});
