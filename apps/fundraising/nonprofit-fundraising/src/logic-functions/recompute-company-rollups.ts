import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import {
  collectCompanyIds,
  recomputeAllCompanyRollups,
  recomputeCompanyRollups,
} from 'src/company-rollups/company-rollups';

type RecomputeCompanyRollupsRequest = {
  companyIds?: string[];
};

type RecomputeCompanyRollupsResponse = {
  mode: 'full' | 'targeted';
  scannedCompanyCount: number;
  updatedCompanyCount: number;
};

const handler = async (
  event: RoutePayload<RecomputeCompanyRollupsRequest>,
): Promise<RecomputeCompanyRollupsResponse> => {
  const companyIds = collectCompanyIds(event.body?.companyIds ?? []);
  const client = new CoreApiClient();

  if (companyIds.length === 0) {
    const result = await recomputeAllCompanyRollups(client);

    return {
      mode: 'full',
      ...result,
    };
  }

  const result = await recomputeCompanyRollups(client, companyIds);

  return {
    mode: 'targeted',
    ...result,
  };
};

export default defineLogicFunction({
  universalIdentifier: 'f154d498-66fe-4649-b0e5-9188f3c454bd',
  name: 'recompute-company-rollups',
  description:
    'Manually recomputes company funding relationship rollup fields for a targeted company set or the whole workspace.',
  timeoutSeconds: 300,
  handler,
  httpRouteTriggerSettings: {
    path: '/company-rollups/recompute',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
