import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { extractConnectionNodes } from 'src/core-api/core-api-results';
import type {
  CompanySummary,
  SearchCompaniesResponse,
} from 'src/manual-gift-entry/manual-gift-entry.types';

type SearchCompaniesBody = {
  query?: string;
};

const normalizeString = (value: string | undefined) => value?.trim() ?? '';

const handler = async (
  event: RoutePayload<SearchCompaniesBody>,
): Promise<SearchCompaniesResponse> => {
  const query = normalizeString(event.body?.query);

  if (query.length < 2) {
    return { companies: [] };
  }

  const client = new CoreApiClient();
  const result = await client.query({
    companies: {
      __args: {
        first: 20,
        filter: {
          name: {
            ilike: `%${query}%`,
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

  return {
    companies: extractConnectionNodes<CompanySummary>(result, 'companies'),
  };
};

export default defineLogicFunction({
  universalIdentifier: '3d420798-c12c-49ba-96d1-dcfa3fd0ded8',
  name: 'search-companies',
  description:
    'Searches company records for explicit company selection in manual gift entry.',
  timeoutSeconds: 10,
  handler,
  httpRouteTriggerSettings: {
    path: '/companies/search',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
