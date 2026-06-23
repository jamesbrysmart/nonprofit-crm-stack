import { CoreApiClient } from 'twenty-client-sdk/core';
import {
  defineLogicFunction,
  type DatabaseEventPayload,
  type ObjectRecordRestoreEvent,
} from 'twenty-sdk/define';
import {
  getAffectedCompanyIdsFromOpportunityRestore,
  recomputeCompanyRollups,
} from 'src/company-rollups/company-rollups';

type OpportunityRollupEventRecord = {
  companyId?: string | null;
};

const handler = async (
  event: DatabaseEventPayload<
    ObjectRecordRestoreEvent<OpportunityRollupEventRecord>
  >,
) => {
  const companyIds = getAffectedCompanyIdsFromOpportunityRestore(event);

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
  universalIdentifier: 'bdd3ceed-d1ce-45ef-9490-7b522c19aeec',
  name: 'refresh-company-rollups-on-opportunity-restored',
  description:
    'Recomputes company rollup fields when an opportunity is restored.',
  timeoutSeconds: 30,
  handler,
  databaseEventTriggerSettings: {
    eventName: 'opportunity.restored',
  },
});
