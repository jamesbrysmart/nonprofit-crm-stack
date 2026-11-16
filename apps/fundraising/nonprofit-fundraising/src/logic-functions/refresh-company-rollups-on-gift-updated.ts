import { CoreApiClient } from 'twenty-client-sdk/core';
import {
  defineLogicFunction,
  type DatabaseEventPayload,
  type ObjectRecordUpdateEvent,
} from 'twenty-sdk/define';
import {
  getAffectedCompanyIdsFromGiftUpdate,
  recomputeCompanyRollups,
} from 'src/company-rollups/company-rollups';
import {
  COMPANY_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_DATE_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_OBJECT_UNIVERSAL_IDENTIFIER,
  GIFT_TYPE_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

type GiftRollupEventRecord = {
  companyId?: string | null;
  giftDate?: string | null;
  giftType?: string | null;
  amount?: {
    amountMicros?: number | null;
    currencyCode?: string | null;
  } | null;
};

const handler = async (
  event: DatabaseEventPayload<ObjectRecordUpdateEvent<GiftRollupEventRecord>>,
) => {
  const companyIds = getAffectedCompanyIdsFromGiftUpdate(event);

  if (companyIds.length === 0) {
    return {
      scannedCompanyCount: 0,
      updatedCompanyCount: 0,
      skipped: 'No affected company ids in event payload',
    };
  }

  return recomputeCompanyRollups(new CoreApiClient(), companyIds);
};

export default defineLogicFunction({
  universalIdentifier: '826cd87f-831a-4e27-acfa-ed46eb4c1f69',
  name: 'refresh-company-rollups-on-gift-updated',
  description:
    'Recomputes company rollup fields when a committed gift changes in a way that affects company totals or recency.',
  timeoutSeconds: 30,
  handler,
  eventTriggerSettings: {
    on: 'recordEvent',
    objectUniversalIdentifier: GIFT_OBJECT_UNIVERSAL_IDENTIFIER,
    action: 'updated',
    watchedFieldUniversalIdentifiers: [
      COMPANY_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER,
      GIFT_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
      GIFT_DATE_FIELD_UNIVERSAL_IDENTIFIER,
      GIFT_TYPE_FIELD_UNIVERSAL_IDENTIFIER,
    ],
  },
});
