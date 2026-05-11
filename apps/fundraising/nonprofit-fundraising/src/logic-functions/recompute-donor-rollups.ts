import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import {
  collectDonorIds,
  recomputeAllDonorRollups,
  recomputeDonorRollups,
} from 'src/donor-rollups/donor-rollups';

type RecomputeDonorRollupsRequest = {
  donorIds?: string[];
};

type RecomputeDonorRollupsResponse = {
  mode: 'full' | 'targeted';
  scannedDonorCount: number;
  updatedDonorCount: number;
};

const handler = async (
  event: RoutePayload<RecomputeDonorRollupsRequest>,
): Promise<RecomputeDonorRollupsResponse> => {
  const donorIds = collectDonorIds(event.body?.donorIds ?? []);
  const client = new CoreApiClient();

  if (donorIds.length === 0) {
    const result = await recomputeAllDonorRollups(client);

    return {
      mode: 'full',
      ...result,
    };
  }

  const result = await recomputeDonorRollups(client, donorIds);

  return {
    mode: 'targeted',
    ...result,
  };
};

export default defineLogicFunction({
  universalIdentifier: 'a49a0fb4-3df8-48e8-ac99-8fd1f6f758d4',
  name: 'recompute-donor-rollups',
  description:
    'Manually recomputes donor rollup fields for a targeted donor set or the whole workspace after imports or repair work.',
  timeoutSeconds: 300,
  handler,
  httpRouteTriggerSettings: {
    path: '/donor-rollups/recompute',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
