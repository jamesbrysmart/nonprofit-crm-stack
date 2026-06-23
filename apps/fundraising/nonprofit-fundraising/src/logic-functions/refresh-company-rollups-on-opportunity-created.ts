import { CoreApiClient } from 'twenty-client-sdk/core';
import {
  defineLogicFunction,
  type DatabaseEventPayload,
  type ObjectRecordCreateEvent,
} from 'twenty-sdk/define';
import {
  getAffectedCompanyIdsFromOpportunityCreate,
  recomputeCompanyRollups,
} from 'src/company-rollups/company-rollups';

type OpportunityRollupEventRecord = {
  companyId?: string | null;
};

const handler = async (
  event: DatabaseEventPayload<
    ObjectRecordCreateEvent<OpportunityRollupEventRecord>
  >,
) => {
  const companyIds = getAffectedCompanyIdsFromOpportunityCreate(event);

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
  universalIdentifier: 'bf0576d8-8eb9-4be1-a6a5-0785cfe6b77c',
  name: 'refresh-company-rollups-on-opportunity-created',
  description:
    'Recomputes company rollup fields when an opportunity is created.',
  timeoutSeconds: 30,
  handler,
  databaseEventTriggerSettings: {
    eventName: 'opportunity.created',
  },
});
