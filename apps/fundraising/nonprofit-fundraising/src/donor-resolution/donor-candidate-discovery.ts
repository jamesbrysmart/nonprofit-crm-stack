import { CoreApiClient } from 'twenty-client-sdk/core';
import { extractConnectionNodes } from 'src/core-api/core-api-results';
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

export const loadPeopleByExactNameEvidence = async <
  TPerson extends DonorCandidatePerson = DonorCandidatePerson,
>({
  client,
  firstName,
  lastName,
  options,
}: {
  client: CoreApiClient;
  firstName: string;
  lastName: string;
  options?: DonorCandidateSelectionOptions;
}): Promise<TPerson[]> => {
  const checkedFirstName = normalizeDonorCandidateNamePart(firstName);
  const checkedLastName = normalizeDonorCandidateNamePart(lastName);

  if (checkedFirstName === '' || checkedLastName === '') {
    return [];
  }

  const result = await client.query({
    people: {
      __args: {
        first: options?.first ?? 50,
        filter: buildExactNameFilter({
          firstName: checkedFirstName,
          lastName: checkedLastName,
        }),
      },
      edges: {
        node: buildPersonSelection(options),
      },
    },
  } as any);

  return extractConnectionNodes<TPerson>(result, 'people');
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

export const loadPeopleByExactDonorEvidence = async <
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

  return extractConnectionNodes<TPerson>(result, 'people');
};
