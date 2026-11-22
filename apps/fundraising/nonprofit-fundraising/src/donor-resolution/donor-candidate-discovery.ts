import { CoreApiClient } from 'twenty-client-sdk/core';
import {
  extractConnection,
  extractConnectionNodes,
} from 'src/core-api/core-api-results';
import { chunkArray } from 'src/utils/chunk-array';
import type { PersonSummary } from 'src/manual-gift-entry/manual-gift-entry.types';

export type DonorCandidatePerson = PersonSummary & {
  emails?: {
    primaryEmail?: string | null;
    additionalEmails?: string[] | null;
  } | null;
};

export type PeopleByEmailMap<TPerson extends DonorCandidatePerson = DonorCandidatePerson> =
  Map<string, TPerson>;

type DonorCandidateSelectionOptions = {
  first?: number;
  includeAdditionalEmails?: boolean;
  includeMailingAddress?: boolean;
};

export const normalizeDonorCandidateEmail = (value: string | null | undefined) =>
  typeof value === 'string' ? value.trim().toLowerCase() : '';

export const normalizeDonorCandidateNamePart = (
  value: string | null | undefined,
) => (typeof value === 'string' ? value.trim() : '');

const buildPersonSelection = ({
  includeAdditionalEmails = false,
  includeMailingAddress = false,
}: DonorCandidateSelectionOptions = {}) => ({
  id: true,
  name: {
    firstName: true,
    lastName: true,
  },
  emails: {
    primaryEmail: true,
    ...(includeAdditionalEmails ? { additionalEmails: true } : {}),
  },
  ...(includeMailingAddress
    ? {
        mailingAddress: {
          addressStreet1: true,
          addressStreet2: true,
          addressCity: true,
          addressState: true,
          addressPostcode: true,
          addressCountry: true,
        },
      }
    : {}),
});

const buildExactNameFilter = ({
  firstName,
  lastName,
}: {
  firstName: string;
  lastName: string;
}) => ({
  and: [
    {
      name: {
        firstName: {
          ilike: firstName,
        },
      },
    },
    {
      name: {
        lastName: {
          ilike: lastName,
        },
      },
    },
  ],
});

export const isInitialNameEvidenceMatch = ({
  leftFirstName,
  rightFirstName,
  leftLastName,
  rightLastName,
}: {
  leftFirstName: string | null | undefined;
  rightFirstName: string | null | undefined;
  leftLastName: string | null | undefined;
  rightLastName: string | null | undefined;
}) => {
  const normalizedLeftFirstName =
    normalizeDonorCandidateNamePart(leftFirstName).toLowerCase();
  const normalizedRightFirstName =
    normalizeDonorCandidateNamePart(rightFirstName).toLowerCase();
  const normalizedLeftLastName =
    normalizeDonorCandidateNamePart(leftLastName).toLowerCase();
  const normalizedRightLastName =
    normalizeDonorCandidateNamePart(rightLastName).toLowerCase();

  if (
    normalizedLeftFirstName === '' ||
    normalizedRightFirstName === '' ||
    normalizedLeftLastName === '' ||
    normalizedLeftLastName !== normalizedRightLastName
  ) {
    return false;
  }

  if (normalizedLeftFirstName.length === 1) {
    return normalizedRightFirstName.startsWith(normalizedLeftFirstName);
  }

  if (normalizedRightFirstName.length === 1) {
    return normalizedLeftFirstName.startsWith(normalizedRightFirstName);
  }

  return false;
};

const buildInitialNameFilters = ({
  firstName,
  lastName,
}: {
  firstName: string;
  lastName: string;
}) => {
  if (firstName === '' || lastName === '') {
    return [];
  }

  const firstInitial = firstName[0];

  if (!firstInitial) {
    return [];
  }

  if (firstName.length === 1) {
    return [
      {
        and: [
          {
            name: {
              firstName: {
                ilike: `${firstInitial}%`,
              },
            },
          },
          {
            name: {
              lastName: {
                ilike: lastName,
              },
            },
          },
        ],
      },
    ];
  }

  return [
    {
      and: [
        {
          name: {
            firstName: {
              ilike: firstInitial,
            },
          },
        },
        {
          name: {
            lastName: {
              ilike: lastName,
            },
          },
        },
      ],
    },
  ];
};

const buildPrimaryEmailFilter = (email: string) => ({
  emails: {
    primaryEmail: {
      ilike: email,
    },
  },
});

const NAMES_PER_QUERY = 25;
const PEOPLE_PAGE_SIZE = 200;
const MAX_CANDIDATES_PER_NAME = 50;

export const buildExactNameKey = (firstName: string, lastName: string) =>
  `${normalizeDonorCandidateNamePart(firstName).toLowerCase()}\u0000${normalizeDonorCandidateNamePart(lastName).toLowerCase()}`;

// Exact (case-insensitive) name matches for many names at once: one paged
// query per group of names instead of one query per name. Keeps the same
// cap of 50 candidates per name as the previous per-name lookup.
export const loadPeopleByExactNames = async <
  TPerson extends DonorCandidatePerson = DonorCandidatePerson,
>({
  client,
  names,
  options,
}: {
  client: CoreApiClient;
  names: Array<{ firstName: string; lastName: string }>;
  options?: DonorCandidateSelectionOptions;
}): Promise<Map<string, TPerson[]>> => {
  const uniqueNames = new Map<string, { firstName: string; lastName: string }>();

  for (const name of names) {
    const firstName = normalizeDonorCandidateNamePart(name.firstName);
    const lastName = normalizeDonorCandidateNamePart(name.lastName);

    if (firstName !== '' && lastName !== '') {
      uniqueNames.set(buildExactNameKey(firstName, lastName), {
        firstName,
        lastName,
      });
    }
  }

  const peopleByName = new Map<string, TPerson[]>(
    [...uniqueNames.keys()].map((key) => [key, []]),
  );

  for (const nameGroup of chunkArray([...uniqueNames.values()], NAMES_PER_QUERY)) {
    let after: string | undefined;

    do {
      const result = await client.query({
        people: {
          __args: {
            first: PEOPLE_PAGE_SIZE,
            filter: { or: nameGroup.map(buildExactNameFilter) },
            ...(after ? { after } : {}),
          },
          edges: { node: buildPersonSelection(options) },
          pageInfo: { hasNextPage: true, endCursor: true },
        },
      } as any);
      const connection = extractConnection<TPerson>(result, 'people');

      for (const { node: person } of connection.edges) {
        const candidates = peopleByName.get(
          buildExactNameKey(
            person.name?.firstName ?? '',
            person.name?.lastName ?? '',
          ),
        );

        if (candidates && candidates.length < MAX_CANDIDATES_PER_NAME) {
          candidates.push(person);
        }
      }

      after =
        connection.pageInfo?.hasNextPage === true &&
        typeof connection.pageInfo.endCursor === 'string'
          ? connection.pageInfo.endCursor
          : undefined;
    } while (after);
  }

  return peopleByName;
};

export const loadPeopleByDonorReviewEvidence = async <
  TPerson extends DonorCandidatePerson = DonorCandidatePerson,
>({
  client,
  firstName,
  lastName,
  email,
  options,
}: {
  client: CoreApiClient;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  options?: DonorCandidateSelectionOptions;
}): Promise<TPerson[]> => {
  const checkedFirstName = normalizeDonorCandidateNamePart(firstName);
  const checkedLastName = normalizeDonorCandidateNamePart(lastName);
  const checkedEmail = normalizeDonorCandidateEmail(email);
  const filters: Array<Record<string, unknown>> = [];

  if (checkedFirstName !== '' && checkedLastName !== '') {
    filters.push(
      buildExactNameFilter({
        firstName: checkedFirstName,
        lastName: checkedLastName,
      }),
      ...buildInitialNameFilters({
        firstName: checkedFirstName,
        lastName: checkedLastName,
      }),
    );
  }

  if (checkedEmail !== '') {
    filters.push(buildPrimaryEmailFilter(checkedEmail));
  }

  if (filters.length === 0) {
    return [];
  }

  const result = await client.query({
    people: {
      __args: {
        first: options?.first ?? 20,
        filter: {
          ...(filters.length === 1 ? filters[0] : { or: filters }),
        },
      },
      edges: {
        node: buildPersonSelection(options),
      },
    },
  } as any);

  const candidates = extractConnectionNodes<TPerson>(result, 'people');
  const candidatesById = new Map<string, TPerson>();

  for (const candidate of candidates) {
    if (candidate.id) {
      candidatesById.set(candidate.id, candidate);
    }
  }

  return [...candidatesById.values()];
};

export const loadPeopleByPrimaryEmails = async <
  TPerson extends DonorCandidatePerson = DonorCandidatePerson,
>(
  client: CoreApiClient,
  emails: string[],
  options?: DonorCandidateSelectionOptions,
): Promise<PeopleByEmailMap<TPerson>> => {
  const normalizedEmails = [
    ...new Set(emails.map(normalizeDonorCandidateEmail).filter(Boolean)),
  ];

  if (normalizedEmails.length === 0) {
    return new Map();
  }

  const result = await client.query({
    people: {
      __args: {
        first: Math.max(normalizedEmails.length, options?.first ?? 20),
        filter: {
          or: normalizedEmails.map(buildPrimaryEmailFilter),
        },
      },
      edges: {
        node: buildPersonSelection(options),
      },
    },
  } as any);

  const people = extractConnectionNodes<TPerson>(result, 'people');
  const peopleByEmail = new Map<string, TPerson>();

  for (const person of people) {
    const email = normalizeDonorCandidateEmail(person.emails?.primaryEmail);

    if (email !== '') {
      peopleByEmail.set(email, person);
    }
  }

  return peopleByEmail;
};

