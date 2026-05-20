import { CoreApiClient } from 'twenty-client-sdk/core';
import {
  defineLogicFunction,
  type DatabaseEventPayload,
  type ObjectRecordDeleteEvent,
} from 'twenty-sdk/define';
import {
  getAffectedAppealIdsFromGiftDelete,
  recomputeAppealRollups,
} from 'src/appeal-rollups/appeal-rollups';

type GiftRollupEventRecord = {
  appealId?: string | null;
  donorId?: string | null;
  companyId?: string | null;
  giftDate?: string | null;
  amount?: {
    amountMicros?: number | null;
    currencyCode?: string | null;
  } | null;
};

const handler = async (
  event: DatabaseEventPayload<ObjectRecordDeleteEvent<GiftRollupEventRecord>>,
) => {
  const appealIds = getAffectedAppealIdsFromGiftDelete(event);

  if (appealIds.length === 0) {
    return {
      scannedAppealCount: 0,
      updatedAppealCount: 0,
      skipped: 'No affected appeal ids in event payload',
    };
  }

  return recomputeAppealRollups(new CoreApiClient(), appealIds);
};

export default defineLogicFunction({
  universalIdentifier: 'de71ea1f-c2fe-462f-a3d9-39e77e069347',
  name: 'refresh-appeal-rollups-on-gift-deleted',
  description:
    'Recomputes appeal rollup fields when a committed gift is deleted.',
  timeoutSeconds: 30,
  handler,
  databaseEventTriggerSettings: {
    eventName: 'gift.deleted',
  },
});
