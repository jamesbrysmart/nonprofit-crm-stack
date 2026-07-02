import { CoreApiClient } from 'twenty-client-sdk/core';
import {
  defineLogicFunction,
  type DatabaseEventPayload,
  type ObjectRecordDeleteEvent,
} from 'twenty-sdk/define';
import {
  getAffectedAppealSourceIdsFromGiftDelete,
  recomputeAppealSourceRollups,
} from 'src/appeal-source-rollups/appeal-source-rollups';

type GiftRollupEventRecord = {
  appealSourceId?: string | null;
};

const handler = async (
  event: DatabaseEventPayload<ObjectRecordDeleteEvent<GiftRollupEventRecord>>,
) => {
  const appealSourceIds = getAffectedAppealSourceIdsFromGiftDelete(event);

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
  universalIdentifier: 'b64613b9-8019-439f-b3c1-4bb89ac18500',
  name: 'refresh-appeal-source-rollups-on-gift-deleted',
  description:
    'Recomputes appeal source rollup fields when a committed gift is deleted.',
  timeoutSeconds: 30,
  handler,
  databaseEventTriggerSettings: {
    eventName: 'gift.deleted',
  },
});
