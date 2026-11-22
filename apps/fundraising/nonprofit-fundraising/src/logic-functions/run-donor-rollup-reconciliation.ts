import { defineLogicFunction } from 'twenty-sdk/define';
import { RUN_DONOR_ROLLUP_RECONCILIATION_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { recomputeAllDonorRollups } from 'src/donor-rollups/donor-rollups';
import { createCoreApiClient } from 'src/core-api/rate-limit-retry';

const handler = async () => recomputeAllDonorRollups(createCoreApiClient());

export default defineLogicFunction({
  universalIdentifier:
    RUN_DONOR_ROLLUP_RECONCILIATION_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'run-donor-rollup-reconciliation',
  description:
    'Rebuilds person giving summaries from committed gifts. Enqueued by the nightly schedule.',
  timeoutSeconds: 300,
  handler,
});
