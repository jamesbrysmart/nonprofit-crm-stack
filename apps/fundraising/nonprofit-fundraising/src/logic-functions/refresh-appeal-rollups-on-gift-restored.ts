import {
  defineLogicFunction,
  type DatabaseEventBatchPayload,
  type ObjectRecordRestoreEvent,
} from 'twenty-sdk/define';
import {
  getAffectedAppealIdsFromGiftRestore,
  recomputeAppealRollups,
} from 'src/appeal-rollups/appeal-rollups';
import {
  GIFT_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { createCoreApiClient } from 'src/core-api/rate-limit-retry';

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
  batch: DatabaseEventBatchPayload<ObjectRecordRestoreEvent<GiftRollupEventRecord>>,
) => {
  const appealIds = batch.events.flatMap(getAffectedAppealIdsFromGiftRestore);

  if (appealIds.length === 0) {
    return {
      scannedAppealCount: 0,
      updatedAppealCount: 0,
      skipped: 'No affected appeal ids in event batch',
    };
  }

  return recomputeAppealRollups(createCoreApiClient(), appealIds);
};

export default defineLogicFunction({
  universalIdentifier: '2bf95a16-e643-487c-b83f-6cddb8c8ac9f',
  name: 'refresh-appeal-rollups-on-gift-restored',
  description:
    'Recomputes appeal rollup fields when a committed gift is restored.',
  timeoutSeconds: 60,
  handler,
  eventTriggerSettings: {
    on: 'recordEvent',
    objectUniversalIdentifier: GIFT_OBJECT_UNIVERSAL_IDENTIFIER,
    action: 'restored',
    batchMode: true,
  },
});
