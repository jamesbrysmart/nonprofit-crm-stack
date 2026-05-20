import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import {
  collectAppealIds,
  recomputeAllAppealRollups,
  recomputeAppealRollups,
} from 'src/appeal-rollups/appeal-rollups';

type RecomputeAppealRollupsRequest = {
  appealIds?: string[];
};

type RecomputeAppealRollupsResponse = {
  mode: 'full' | 'targeted';
  scannedAppealCount: number;
  updatedAppealCount: number;
};

const handler = async (
  event: RoutePayload<RecomputeAppealRollupsRequest>,
): Promise<RecomputeAppealRollupsResponse> => {
  const appealIds = collectAppealIds(event.body?.appealIds ?? []);
  const client = new CoreApiClient();

  if (appealIds.length === 0) {
    const result = await recomputeAllAppealRollups(client);

    return {
      mode: 'full',
      ...result,
    };
  }

  const result = await recomputeAppealRollups(client, appealIds);

  return {
    mode: 'targeted',
    ...result,
  };
};

export default defineLogicFunction({
  universalIdentifier: '8af72bb9-600d-4806-a8ab-a58cb81a2246',
  name: 'recompute-appeal-rollups',
  description:
    'Manually recomputes appeal rollup fields for a targeted appeal set or the whole workspace after imports or repair work.',
  timeoutSeconds: 300,
  handler,
  httpRouteTriggerSettings: {
    path: '/appeal-rollups/recompute',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
