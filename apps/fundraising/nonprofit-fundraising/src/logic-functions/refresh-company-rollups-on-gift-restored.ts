import {
  defineLogicFunction,
  type DatabaseEventBatchPayload,
  type ObjectRecordRestoreEvent,
} from 'twenty-sdk/define';
import {
  getAffectedCompanyIdsFromGiftRestore,
  recomputeCompanyRollups,
} from 'src/company-rollups/company-rollups';
import {
  GIFT_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { createCoreApiClient } from 'src/core-api/rate-limit-retry';

type GiftRollupEventRecord = {
  companyId?: string | null;
};

const handler = async (
  batch: DatabaseEventBatchPayload<ObjectRecordRestoreEvent<GiftRollupEventRecord>>,
) => {
  const companyIds = batch.events.flatMap(getAffectedCompanyIdsFromGiftRestore);

  if (companyIds.length === 0) {
    return {
      scannedCompanyCount: 0,
      updatedCompanyCount: 0,
      skipped: 'No affected company ids in event batch',
    };
  }

  return recomputeCompanyRollups(createCoreApiClient(), companyIds);
};

export default defineLogicFunction({
  universalIdentifier: '4ff46d1f-68ed-4df8-9583-cc0b569349a2',
  name: 'refresh-company-rollups-on-gift-restored',
  description:
    'Recomputes company rollup fields when a committed gift is restored.',
  timeoutSeconds: 60,
  handler,
  eventTriggerSettings: {
    on: 'recordEvent',
    objectUniversalIdentifier: GIFT_OBJECT_UNIVERSAL_IDENTIFIER,
    action: 'restored',
    batchMode: true,
  },
});
