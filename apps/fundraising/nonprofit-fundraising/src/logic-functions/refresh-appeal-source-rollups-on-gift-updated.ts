import { CoreApiClient } from 'twenty-client-sdk/core';
import {
  defineLogicFunction,
  type DatabaseEventPayload,
  type ObjectRecordUpdateEvent,
} from 'twenty-sdk/define';
import {
  getAffectedAppealSourceIdsFromGiftUpdate,
  recomputeAppealSourceRollups,
} from 'src/appeal-source-rollups/appeal-source-rollups';

type GiftRollupEventRecord = {
  appealSourceId?: string | null;
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
  const appealSourceIds = getAffectedAppealSourceIdsFromGiftUpdate(event);

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
  universalIdentifier: '5b030657-6431-4f6f-8667-fa1e00321ebf',
  name: 'refresh-appeal-source-rollups-on-gift-updated',
  description:
    'Recomputes appeal source rollup fields when a committed gift changes in a way that affects source totals, contributor counts, or recency.',
  timeoutSeconds: 30,
  handler,
  databaseEventTriggerSettings: {
    eventName: 'gift.updated',
    updatedFields: [
      'appealSource',
      'appealSourceId',
      'donor',
      'donorId',
      'company',
      'companyId',
      'amount',
      'giftDate',
    ],
  },
});
