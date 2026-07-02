import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import {
  collectAppealSourceIds,
  recomputeAllAppealSourceRollups,
  recomputeAppealSourceRollups,
} from 'src/appeal-source-rollups/appeal-source-rollups';

type RecomputeAppealSourceRollupsRequest = {
  appealSourceIds?: string[];
};

type RecomputeAppealSourceRollupsResponse = {
  mode: 'full' | 'targeted';
  scannedAppealSourceCount: number;
  updatedAppealSourceCount: number;
};

const handler = async (
  event: RoutePayload<RecomputeAppealSourceRollupsRequest>,
): Promise<RecomputeAppealSourceRollupsResponse> => {
  const appealSourceIds = collectAppealSourceIds(
    event.body?.appealSourceIds ?? [],
  );
  const client = new CoreApiClient();

  if (appealSourceIds.length === 0) {
    const result = await recomputeAllAppealSourceRollups(client);

    return {
      mode: 'full',
      ...result,
    };
  }

  const result = await recomputeAppealSourceRollups(client, appealSourceIds);

  return {
    mode: 'targeted',
    ...result,
  };
};

export default defineLogicFunction({
  universalIdentifier: '0dc3df24-7a1c-4f05-bfbc-e61bfd6ea489',
  name: 'recompute-appeal-source-rollups',
  description:
    'Manually recomputes appeal source rollup fields for a targeted appeal source set or the whole workspace after imports or repair work.',
  timeoutSeconds: 300,
  handler,
  httpRouteTriggerSettings: {
    path: '/appeal-source-rollups/recompute',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
