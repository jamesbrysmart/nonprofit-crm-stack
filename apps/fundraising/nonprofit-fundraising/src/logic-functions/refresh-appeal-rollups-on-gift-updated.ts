import { CoreApiClient } from 'twenty-client-sdk/core';
import {
  defineLogicFunction,
  type DatabaseEventPayload,
  type ObjectRecordUpdateEvent,
} from 'twenty-sdk/define';
import {
  getAffectedAppealIdsFromGiftUpdate,
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
  event: DatabaseEventPayload<ObjectRecordUpdateEvent<GiftRollupEventRecord>>,
) => {
  const appealIds = getAffectedAppealIdsFromGiftUpdate(event);

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
  universalIdentifier: 'b8ad9d06-8074-40da-8ee5-4e4d762efbf1',
  name: 'refresh-appeal-rollups-on-gift-updated',
  description:
    'Recomputes appeal rollup fields when a committed gift changes in a way that affects appeal totals, contributor counts, or recency.',
  timeoutSeconds: 30,
  handler,
  databaseEventTriggerSettings: {
    eventName: 'gift.updated',
    updatedFields: [
      'appeal',
      'appealId',
      'donor',
      'donorId',
      'company',
      'companyId',
      'amount',
      'giftDate',
    ],
  },
});
