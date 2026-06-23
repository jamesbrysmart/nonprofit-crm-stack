import { CoreApiClient } from 'twenty-client-sdk/core';
import {
  defineLogicFunction,
  type DatabaseEventPayload,
  type ObjectRecordDeleteEvent,
} from 'twenty-sdk/define';
import {
  getAffectedCompanyIdsFromGiftDelete,
  recomputeCompanyRollups,
} from 'src/company-rollups/company-rollups';

type GiftRollupEventRecord = {
  companyId?: string | null;
};

const handler = async (
  event: DatabaseEventPayload<ObjectRecordDeleteEvent<GiftRollupEventRecord>>,
) => {
  const companyIds = getAffectedCompanyIdsFromGiftDelete(event);

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
  universalIdentifier: '0d329a7d-0eb2-4d98-8cde-aabe1249edb4',
  name: 'refresh-company-rollups-on-gift-deleted',
  description:
    'Recomputes company rollup fields when a committed gift is deleted.',
  timeoutSeconds: 30,
  handler,
  databaseEventTriggerSettings: {
    eventName: 'gift.deleted',
  },
});
