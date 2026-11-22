import {
  defineLogicFunction,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
  type DatabaseEventBatchPayload,
  type ObjectRecordCreateEvent,
} from 'twenty-sdk/define';
import {
  getAffectedCompanyIdsFromOpportunityCreate,
  recomputeCompanyRollups,
} from 'src/company-rollups/company-rollups';
import { createCoreApiClient } from 'src/core-api/rate-limit-retry';

type OpportunityRollupEventRecord = {
  companyId?: string | null;
};

const handler = async (
  batch: DatabaseEventBatchPayload<
    ObjectRecordCreateEvent<OpportunityRollupEventRecord>
  >,
) => {
  const companyIds = batch.events.flatMap(getAffectedCompanyIdsFromOpportunityCreate);

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
  universalIdentifier: 'bf0576d8-8eb9-4be1-a6a5-0785cfe6b77c',
  name: 'refresh-company-rollups-on-opportunity-created',
  description:
    'Recomputes company rollup fields when an opportunity is created.',
  timeoutSeconds: 60,
  handler,
  eventTriggerSettings: {
    on: 'recordEvent',
    objectUniversalIdentifier:
      STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
    action: 'created',
    batchMode: true,
  },
});
