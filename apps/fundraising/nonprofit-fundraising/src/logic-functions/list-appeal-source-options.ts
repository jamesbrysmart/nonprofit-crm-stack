import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { extractConnectionNodes } from 'src/core-api/core-api-results';
import type {
  AppealSourceSummary,
  ListAppealSourceOptionsRequest,
  ListAppealSourceOptionsResponse,
} from 'src/manual-gift-entry/manual-gift-entry.types';

const normalizeString = (value: string | null | undefined) =>
  typeof value === 'string' ? value.trim() : '';

const handler = async (
  event: RoutePayload<ListAppealSourceOptionsRequest>,
): Promise<ListAppealSourceOptionsResponse> => {
  const client = new CoreApiClient();
  const appealId = normalizeString(event.body?.appealId);
  const result = await client.query({
    appealSources: {
      __args: {
        first: 200,
        filter: {
          status: {
            in: ['ACTIVE'],
          },
          ...(appealId !== ''
            ? {
                appealId: {
                  eq: appealId,
                },
              }
            : {}),
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
          sourceType: true,
          fundraiserPerson: {
            id: true,
            name: {
              firstName: true,
              lastName: true,
            },
            emails: {
              primaryEmail: true,
            },
          },
          fundraiserCompany: {
            id: true,
            name: true,
          },
          appeal: {
            id: true,
            name: true,
            defaultFund: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  } as any);

  return {
    appealSources: extractConnectionNodes<AppealSourceSummary>(
      result,
      'appealSources',
    ),
  };
};

export default defineLogicFunction({
  universalIdentifier: 'eb3d79d0-a10a-4fa6-b491-f0169e988565',
  name: 'list-appeal-source-options',
  description:
    'Lists active appeal sources for fundraising attribution pickers, optionally filtered to one appeal.',
  timeoutSeconds: 10,
  handler,
  httpRouteTriggerSettings: {
    path: '/appeal-sources/options',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
