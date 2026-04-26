import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import type {
  DuplicateCheckResponse,
  PersonSummary,
} from 'src/manual-gift-entry/manual-gift-entry.types';

type CheckDonorDuplicatesBody = {
  donorFirstName?: string;
  donorLastName?: string;
};

const normalizeNamePart = (value: string | undefined) => value?.trim() ?? '';

const buildResult = (
  checkedFirstName: string,
  checkedLastName: string,
  candidates: PersonSummary[],
): DuplicateCheckResponse => {
  if (candidates.length === 0) {
    return {
      status: 'NO_MATCH',
      checkedFirstName,
      checkedLastName,
      candidates,
    };
  }

  if (candidates.length === 1) {
    return {
      status: 'SINGLE_EXACT_MATCH',
      checkedFirstName,
      checkedLastName,
      candidates,
    };
  }

  return {
    status: 'MULTIPLE_EXACT_MATCHES',
    checkedFirstName,
    checkedLastName,
    candidates,
  };
};

const handler = async (
  event: RoutePayload<CheckDonorDuplicatesBody>,
): Promise<DuplicateCheckResponse> => {
  const checkedFirstName = normalizeNamePart(event.body?.donorFirstName);
  const checkedLastName = normalizeNamePart(event.body?.donorLastName);

  if (checkedFirstName === '' || checkedLastName === '') {
    return buildResult(checkedFirstName, checkedLastName, []);
  }

  const client = new CoreApiClient();
  const result = await client.query({
    people: {
      __args: {
        first: 20,
        filter: {
          and: [
            {
              name: {
                firstName: {
                  eq: checkedFirstName,
                },
              },
            },
            {
              name: {
                lastName: {
                  eq: checkedLastName,
                },
              },
            },
          ],
        },
      },
      edges: {
        node: {
          id: true,
          name: {
            firstName: true,
            lastName: true,
          },
          emails: {
            primaryEmail: true,
          },
        },
      },
    },
  } as any);

  const candidates =
    result?.people?.edges?.map(
      (edge: { node: PersonSummary }) => edge.node,
    ) ?? [];

  return buildResult(checkedFirstName, checkedLastName, candidates);
};

export default defineLogicFunction({
  universalIdentifier: '0f0da29b-d02f-4714-ab7e-ed148a3cbbdc',
  name: 'check-donor-duplicates',
  description:
    'Checks exact first-name and last-name matches against Twenty people for manual gift entry.',
  timeoutSeconds: 10,
  handler,
  httpRouteTriggerSettings: {
    path: '/donor-resolution/check-donor-duplicates',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
