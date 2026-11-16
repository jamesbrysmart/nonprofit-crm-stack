import { CoreApiClient } from 'twenty-client-sdk/core';
import {
  defineLogicFunction,
  type DatabaseEventPayload,
  type ObjectRecordRestoreEvent,
} from 'twenty-sdk/define';
import {
  getAffectedCompanyIdsFromGiftRestore,
  recomputeCompanyRollups,
} from 'src/company-rollups/company-rollups';
import {
  GIFT_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

type GiftRollupEventRecord = {
  companyId?: string | null;
};

const handler = async (
  event: DatabaseEventPayload<ObjectRecordRestoreEvent<GiftRollupEventRecord>>,
) => {
  const companyIds = getAffectedCompanyIdsFromGiftRestore(event);

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
  universalIdentifier: '4ff46d1f-68ed-4df8-9583-cc0b569349a2',
  name: 'refresh-company-rollups-on-gift-restored',
  description:
    'Recomputes company rollup fields when a committed gift is restored.',
  timeoutSeconds: 30,
  handler,
  eventTriggerSettings: {
    on: 'recordEvent',
    objectUniversalIdentifier: GIFT_OBJECT_UNIVERSAL_IDENTIFIER,
    action: 'restored',
  },
});
