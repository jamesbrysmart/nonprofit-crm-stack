import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import type {
  CompanyDuplicateCheckResponse,
  CompanySummary,
} from 'src/manual-gift-entry/manual-gift-entry.types';

type CheckCompanyDuplicatesBody = {
  companyName?: string;
};

const normalizeString = (value: string | undefined) => value?.trim() ?? '';

const buildResult = (
  checkedCompanyName: string,
  candidates: CompanySummary[],
): CompanyDuplicateCheckResponse => {
  if (candidates.length === 0) {
    return {
      status: 'NO_MATCH',
      checkedCompanyName,
      candidates,
    };
  }

  if (candidates.length === 1) {
    return {
      status: 'SINGLE_EXACT_MATCH',
      checkedCompanyName,
      candidates,
    };
  }

  return {
    status: 'MULTIPLE_EXACT_MATCHES',
    checkedCompanyName,
    candidates,
  };
};

const handler = async (
  event: RoutePayload<CheckCompanyDuplicatesBody>,
): Promise<CompanyDuplicateCheckResponse> => {
  const checkedCompanyName = normalizeString(event.body?.companyName);

  if (checkedCompanyName === '') {
    return buildResult(checkedCompanyName, []);
  }

  const client = new CoreApiClient();
  const result = await client.query({
    companies: {
      __args: {
        first: 20,
        filter: {
          name: {
            eq: checkedCompanyName,
          },
        },
      },
      edges: {
        node: {
          id: true,
          name: true,
        },
      },
    },
  } as any);

  const candidates =
    result?.companies?.edges?.map(
      (edge: { node: CompanySummary }) => edge.node,
    ) ?? [];

  return buildResult(checkedCompanyName, candidates);
};

export default defineLogicFunction({
  universalIdentifier: '3d420798-c12c-49ba-96d1-dcfa3fd0ded8',
  name: 'check-company-duplicates',
  description:
    'Checks exact company-name matches against Twenty companies for manual gift entry.',
  timeoutSeconds: 10,
  handler,
  httpRouteTriggerSettings: {
    path: '/company-resolution/check-company-duplicates',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
