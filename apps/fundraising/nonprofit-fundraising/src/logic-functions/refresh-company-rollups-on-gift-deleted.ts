import { CoreApiClient } from 'twenty-client-sdk/core';
import {
  defineLogicFunction,
  type DatabaseEventBatchPayload,
  type ObjectRecordDeleteEvent,
} from 'twenty-sdk/define';
import {
  getAffectedCompanyIdsFromGiftDelete,
  recomputeCompanyRollups,
} from 'src/company-rollups/company-rollups';
import {
  GIFT_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

type GiftRollupEventRecord = {
  companyId?: string | null;
};

const handler = async (
  batch: DatabaseEventBatchPayload<ObjectRecordDeleteEvent<GiftRollupEventRecord>>,
) => {
  const companyIds = batch.events.flatMap(getAffectedCompanyIdsFromGiftDelete);

  if (companyIds.length === 0) {
    return {
      scannedCompanyCount: 0,
      updatedCompanyCount: 0,
      skipped: 'No affected company ids in event batch',
    };
  }

  return recomputeCompanyRollups(new CoreApiClient(), companyIds);
};

export default defineLogicFunction({
  universalIdentifier: '0d329a7d-0eb2-4d98-8cde-aabe1249edb4',
  name: 'refresh-company-rollups-on-gift-deleted',
  description:
    'Recomputes company rollup fields when a committed gift is deleted.',
  timeoutSeconds: 60,
  handler,
  eventTriggerSettings: {
    on: 'recordEvent',
    objectUniversalIdentifier: GIFT_OBJECT_UNIVERSAL_IDENTIFIER,
    action: 'deleted',
    batchMode: true,
  },
});
