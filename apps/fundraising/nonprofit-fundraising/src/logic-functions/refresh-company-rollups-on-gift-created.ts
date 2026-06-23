import { CoreApiClient } from 'twenty-client-sdk/core';
import {
  defineLogicFunction,
  type DatabaseEventPayload,
  type ObjectRecordCreateEvent,
} from 'twenty-sdk/define';
import {
  getAffectedCompanyIdsFromGiftCreate,
  recomputeCompanyRollups,
} from 'src/company-rollups/company-rollups';

type GiftRollupEventRecord = {
  companyId?: string | null;
};

const handler = async (
  event: DatabaseEventPayload<ObjectRecordCreateEvent<GiftRollupEventRecord>>,
) => {
  const companyIds = getAffectedCompanyIdsFromGiftCreate(event);

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
  universalIdentifier: '1338fa5e-f5d7-4c38-812f-5389692cd622',
  name: 'refresh-company-rollups-on-gift-created',
  description:
    'Recomputes company rollup fields when a committed gift is created.',
  timeoutSeconds: 30,
  handler,
  databaseEventTriggerSettings: {
    eventName: 'gift.created',
  },
});
