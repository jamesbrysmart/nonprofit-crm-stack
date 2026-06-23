import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { extractConnectionNodes } from 'src/core-api/core-api-results';
import type {
  DuplicateCheckResponse,
  PersonSummary,
} from 'src/manual-gift-entry/manual-gift-entry.types';

type CheckDonorDuplicatesBody = {
  donorFirstName?: string;
  donorLastName?: string;
  donorEmail?: string;
};

const normalizeNamePart = (value: string | undefined) => value?.trim() ?? '';
const normalizeEmail = (value: string | undefined) =>
  value?.trim().toLowerCase() ?? '';

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
  const checkedEmail = normalizeEmail(event.body?.donorEmail);

  if (
    checkedFirstName === '' &&
    checkedLastName === '' &&
    checkedEmail === ''
  ) {
    return buildResult(checkedFirstName, checkedLastName, []);
  }

  const client = new CoreApiClient();
  const filters: Array<Record<string, unknown>> = [];

  if (checkedFirstName !== '' && checkedLastName !== '') {
    filters.push({
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
    });
  }

  if (checkedEmail !== '') {
    filters.push({
      emails: {
        primaryEmail: {
          eq: checkedEmail,
        },
      },
    });
  }

  const result = await client.query({
    people: {
      __args: {
        first: 20,
        filter: {
          ...(filters.length === 1 ? filters[0] : { or: filters }),
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
          mailingAddress: {
            addressStreet1: true,
            addressStreet2: true,
            addressCity: true,
            addressState: true,
            addressPostcode: true,
            addressCountry: true,
          },
        },
      },
    },
  } as any);

  const candidates = extractConnectionNodes<PersonSummary>(result, 'people');

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
