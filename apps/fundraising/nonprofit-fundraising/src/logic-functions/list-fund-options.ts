import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import type {
  FundSummary,
  ListFundOptionsResponse,
} from 'src/manual-gift-entry/manual-gift-entry.types';

const handler = async (
  _event: RoutePayload<Record<string, never>>,
): Promise<ListFundOptionsResponse> => {
  const client = new CoreApiClient();
  const result = await client.query({
    funds: {
      __args: {
        first: 100,
        filter: {
          isActive: {
            eq: true,
          },
        },
        orderBy: {
          name: 'AscNullsLast',
        },
      },
      edges: {
        node: {
          id: true,
          name: true,
          code: true,
          isActive: true,
        },
      },
    },
  } as any);

  return {
    funds:
      result?.funds?.edges?.map((edge: { node: FundSummary }) => edge.node) ??
      [],
  };
};

export default defineLogicFunction({
  universalIdentifier: '3f4d4c75-b3ec-49f4-9467-e0dccdbd091f',
  name: 'list-fund-options',
  description:
    'Lists active funds for manual gift entry and other relation-backed fundraising pickers.',
  timeoutSeconds: 10,
  handler,
  httpRouteTriggerSettings: {
    path: '/funds/options',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
