import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { extractConnectionNodes } from 'src/core-api/core-api-results';
import type {
  AppealSummary,
  ListAppealOptionsResponse,
} from 'src/manual-gift-entry/manual-gift-entry.types';

const handler = async (
  _event: RoutePayload<Record<string, never>>,
): Promise<ListAppealOptionsResponse> => {
  const client = new CoreApiClient();
  const result = await client.query({
    appeals: {
      __args: {
        first: 100,
        filter: {
          status: {
            in: ['ACTIVE'],
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
          status: true,
          defaultFund: {
            id: true,
            name: true,
          },
        },
      },
    },
  } as any);

  return {
    appeals: extractConnectionNodes<AppealSummary>(result, 'appeals'),
  };
};

export default defineLogicFunction({
  universalIdentifier: 'ad1361fa-4cec-4696-8055-cd375f989af7',
  name: 'list-appeal-options',
  description:
    'Lists active appeals for manual gift entry and other relation-backed fundraising pickers.',
  timeoutSeconds: 10,
  handler,
  httpRouteTriggerSettings: {
    path: '/appeals/options',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
