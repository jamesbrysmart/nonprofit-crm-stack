import { CoreApiClient } from 'twenty-client-sdk/core';
import {
  defineLogicFunction,
  type DatabaseEventPayload,
  type ObjectRecordRestoreEvent,
} from 'twenty-sdk/define';
import {
  getAffectedAppealSourceIdsFromGiftRestore,
  recomputeAppealSourceRollups,
} from 'src/appeal-source-rollups/appeal-source-rollups';

type GiftRollupEventRecord = {
  appealSourceId?: string | null;
};

const handler = async (
  event: DatabaseEventPayload<ObjectRecordRestoreEvent<GiftRollupEventRecord>>,
) => {
  const appealSourceIds = getAffectedAppealSourceIdsFromGiftRestore(event);

  if (appealSourceIds.length === 0) {
    return {
      scannedAppealSourceCount: 0,
      updatedAppealSourceCount: 0,
      skipped: 'No affected appeal source ids in event payload',
    };
  }

  return recomputeAppealSourceRollups(new CoreApiClient(), appealSourceIds);
};

export default defineLogicFunction({
  universalIdentifier: '02a2791b-5e76-4744-befa-de9441d03736',
  name: 'refresh-appeal-source-rollups-on-gift-restored',
  description:
    'Recomputes appeal source rollup fields when a committed gift is restored.',
  timeoutSeconds: 30,
  handler,
  databaseEventTriggerSettings: {
    eventName: 'gift.restored',
  },
});
