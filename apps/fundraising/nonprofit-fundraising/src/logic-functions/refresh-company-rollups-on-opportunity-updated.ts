import { CoreApiClient } from 'twenty-client-sdk/core';
import {
  defineLogicFunction,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
  type DatabaseEventBatchPayload,
  type ObjectRecordUpdateEvent,
} from 'twenty-sdk/define';
import {
  getAffectedCompanyIdsFromOpportunityUpdate,
  recomputeCompanyRollups,
} from 'src/company-rollups/company-rollups';
import {
  APPLICATION_DEADLINE_ON_OPPORTUNITY_FIELD_UNIVERSAL_IDENTIFIER,
  AWARDED_AMOUNT_ON_OPPORTUNITY_FIELD_UNIVERSAL_IDENTIFIER,
  FUNDING_PERIOD_END_ON_OPPORTUNITY_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

type OpportunityRollupEventRecord = {
  companyId?: string | null;
  awardedAmount?: {
    amountMicros?: number | null;
    currencyCode?: string | null;
  } | null;
  applicationDeadline?: string | null;
  fundingPeriodEnd?: string | null;
};

const handler = async (
  batch: DatabaseEventBatchPayload<
    ObjectRecordUpdateEvent<OpportunityRollupEventRecord>
  >,
) => {
  const companyIds = batch.events.flatMap(getAffectedCompanyIdsFromOpportunityUpdate);

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
  universalIdentifier: '27b8e157-e86f-4575-8408-8dfd78bb4bfb',
  name: 'refresh-company-rollups-on-opportunity-updated',
  description:
    'Recomputes company rollup fields when an opportunity changes in a way that affects awarded funding or future funding dates.',
  timeoutSeconds: 60,
  handler,
  eventTriggerSettings: {
    on: 'recordEvent',
    objectUniversalIdentifier:
      STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
    action: 'updated',
    batchMode: true,
    watchedFieldUniversalIdentifiers: [
      STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.fields.company
        .universalIdentifier,
      AWARDED_AMOUNT_ON_OPPORTUNITY_FIELD_UNIVERSAL_IDENTIFIER,
      APPLICATION_DEADLINE_ON_OPPORTUNITY_FIELD_UNIVERSAL_IDENTIFIER,
      FUNDING_PERIOD_END_ON_OPPORTUNITY_FIELD_UNIVERSAL_IDENTIFIER,
    ],
  },
});
