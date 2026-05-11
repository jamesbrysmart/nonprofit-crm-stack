import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction, type CronPayload } from 'twenty-sdk/define';
import { recomputeAllDonorRollups } from 'src/donor-rollups/donor-rollups';

type ReconcileDonorRollupsResponse = {
  mode: 'scheduled';
  scannedDonorCount: number;
  updatedDonorCount: number;
};

const handler = async (
  _event: CronPayload,
): Promise<ReconcileDonorRollupsResponse> => {
  const client = new CoreApiClient();
  const result = await recomputeAllDonorRollups(client);

  return {
    mode: 'scheduled',
    ...result,
  };
};

export default defineLogicFunction({
  universalIdentifier: 'b90b020c-ef72-4977-a645-18a4a6d95846',
  name: 'reconcile-donor-rollups-nightly',
  description:
    'Runs a daily donor rollup reconciliation to rebuild person giving summaries from committed gifts.',
  timeoutSeconds: 300,
  handler,
  cronTriggerSettings: {
    pattern: '0 3 * * *',
  },
});
