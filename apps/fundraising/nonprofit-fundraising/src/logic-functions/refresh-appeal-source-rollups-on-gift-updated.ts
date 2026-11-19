import { CoreApiClient } from 'twenty-client-sdk/core';
import {
  defineLogicFunction,
  type DatabaseEventBatchPayload,
  type ObjectRecordUpdateEvent,
} from 'twenty-sdk/define';
import {
  getAffectedAppealSourceIdsFromGiftUpdate,
  recomputeAppealSourceRollups,
} from 'src/appeal-source-rollups/appeal-source-rollups';
import {
  APPEAL_SOURCE_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER,
  COMPANY_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER,
  DONOR_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_DATE_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_OBJECT_UNIVERSAL_IDENTIFIER,
  GIFT_REPORTING_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

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
  batch: DatabaseEventBatchPayload<ObjectRecordUpdateEvent<GiftRollupEventRecord>>,
) => {
  const appealSourceIds = batch.events.flatMap(getAffectedAppealSourceIdsFromGiftUpdate);

  if (appealSourceIds.length === 0) {
    return {
      scannedAppealSourceCount: 0,
      updatedAppealSourceCount: 0,
      skipped: 'No affected appeal source ids in event batch',
    };
  }

  return recomputeAppealSourceRollups(new CoreApiClient(), appealSourceIds);
};

export default defineLogicFunction({
  universalIdentifier: '5b030657-6431-4f6f-8667-fa1e00321ebf',
  name: 'refresh-appeal-source-rollups-on-gift-updated',
  description:
    'Recomputes appeal source rollup fields when a committed gift changes in a way that affects source totals, contributor counts, or recency.',
  timeoutSeconds: 60,
  handler,
  eventTriggerSettings: {
    on: 'recordEvent',
    objectUniversalIdentifier: GIFT_OBJECT_UNIVERSAL_IDENTIFIER,
    action: 'updated',
    batchMode: true,
    watchedFieldUniversalIdentifiers: [
      GIFT_REPORTING_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
      APPEAL_SOURCE_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER,
      DONOR_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER,
      COMPANY_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER,
      GIFT_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
      GIFT_DATE_FIELD_UNIVERSAL_IDENTIFIER,
    ],
  },
});
