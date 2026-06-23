import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { extractConnectionNodes } from 'src/core-api/core-api-results';
import type {
  OpportunitySummary,
  SearchOpportunitiesResponse,
} from 'src/manual-gift-entry/manual-gift-entry.types';

type SearchOpportunitiesBody = {
  query?: string;
  companyId?: string;
};

const normalizeString = (value: string | undefined) => value?.trim() ?? '';

const handler = async (
  event: RoutePayload<SearchOpportunitiesBody>,
): Promise<SearchOpportunitiesResponse> => {
  const query = normalizeString(event.body?.query);
  const companyId = normalizeString(event.body?.companyId);

  if (query.length < 2) {
    return { opportunities: [] };
  }

  const client = new CoreApiClient();
  const result = await client.query({
    opportunities: {
      __args: {
        first: 20,
        filter: {
          and: [
            {
              name: {
                ilike: `%${query}%`,
              },
            },
            ...(companyId !== ''
              ? [
                  {
                    companyId: {
                      eq: companyId,
                    },
                  },
                ]
              : []),
          ],
        },
      },
      edges: {
        node: {
          id: true,
          name: true,
          company: {
            id: true,
            name: true,
          },
        },
      },
    },
  } as any);

  return {
    opportunities: extractConnectionNodes<OpportunitySummary>(
      result,
      'opportunities',
    ),
  };
};

export default defineLogicFunction({
  universalIdentifier: 'd883a67d-2c7c-4ec4-90d4-c1fcd13b0c3c',
  name: 'search-opportunities',
  description:
    'Searches opportunities for manual gift entry, optionally filtered by company.',
  timeoutSeconds: 10,
  handler,
  httpRouteTriggerSettings: {
    path: '/opportunities/search',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
