import { defineLogicFunction } from 'twenty-sdk/define';
import { RUN_DONOR_ROLLUP_RECONCILIATION_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { enqueueSpreadNightlyJob } from 'src/scheduling/enqueue-spread-job';

const handler = async () =>
  enqueueSpreadNightlyJob({
    logicFunctionUniversalIdentifier:
      RUN_DONOR_ROLLUP_RECONCILIATION_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
    jobIdPrefix: 'donor-rollup-reconciliation',
  });

export default defineLogicFunction({
  universalIdentifier: 'b90b020c-ef72-4977-a645-18a4a6d95846',
  name: 'reconcile-donor-rollups-nightly',
  description:
    'Schedules the nightly donor rollup reconciliation, spread across an hour.',
  timeoutSeconds: 30,
  handler,
  cronTriggerSettings: {
    pattern: '0 3 * * *',
  },
});
