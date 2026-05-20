import { CoreApiClient } from 'twenty-client-sdk/core';
import {
  defineLogicFunction,
  type DatabaseEventPayload,
  type ObjectRecordRestoreEvent,
} from 'twenty-sdk/define';
import {
  getAffectedAppealIdsFromGiftRestore,
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
  event: DatabaseEventPayload<ObjectRecordRestoreEvent<GiftRollupEventRecord>>,
) => {
  const appealIds = getAffectedAppealIdsFromGiftRestore(event);

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
  universalIdentifier: '2bf95a16-e643-487c-b83f-6cddb8c8ac9f',
  name: 'refresh-appeal-rollups-on-gift-restored',
  description:
    'Recomputes appeal rollup fields when a committed gift is restored.',
  timeoutSeconds: 30,
  handler,
  databaseEventTriggerSettings: {
    eventName: 'gift.restored',
  },
});
