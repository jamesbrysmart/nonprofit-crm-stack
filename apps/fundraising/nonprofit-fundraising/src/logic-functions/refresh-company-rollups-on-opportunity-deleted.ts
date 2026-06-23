import { CoreApiClient } from 'twenty-client-sdk/core';
import {
  defineLogicFunction,
  type DatabaseEventPayload,
  type ObjectRecordDeleteEvent,
} from 'twenty-sdk/define';
import {
  getAffectedCompanyIdsFromOpportunityDelete,
  recomputeCompanyRollups,
} from 'src/company-rollups/company-rollups';

type OpportunityRollupEventRecord = {
  companyId?: string | null;
};

const handler = async (
  event: DatabaseEventPayload<
    ObjectRecordDeleteEvent<OpportunityRollupEventRecord>
  >,
) => {
  const companyIds = getAffectedCompanyIdsFromOpportunityDelete(event);

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
  universalIdentifier: 'd87a358b-1cf1-4018-b788-65234b09d4f9',
  name: 'refresh-company-rollups-on-opportunity-deleted',
  description:
    'Recomputes company rollup fields when an opportunity is deleted.',
  timeoutSeconds: 30,
  handler,
  databaseEventTriggerSettings: {
    eventName: 'opportunity.deleted',
  },
});
