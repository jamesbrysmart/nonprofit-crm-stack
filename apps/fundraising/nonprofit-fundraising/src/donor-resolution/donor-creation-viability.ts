import { CoreApiClient } from 'twenty-client-sdk/core';
import { extractConnectionNodes } from 'src/core-api/core-api-results';
import type { PersonSummary } from 'src/manual-gift-entry/manual-gift-entry.types';

export type PeopleByEmailMap = Map<string, PersonSummary>;

const normalizeEmail = (value: string | null | undefined) =>
  typeof value === 'string' ? value.trim().toLowerCase() : '';

const normalizeString = (value: string | null | undefined) =>
  typeof value === 'string' ? value.trim() : '';

export const buildConflictMessage = (
  email: string,
  conflictingPerson?: PersonSummary,
) => {
  const firstName = normalizeString(conflictingPerson?.name?.firstName);
  const lastName = normalizeString(conflictingPerson?.name?.lastName);
  const donorName = `${firstName} ${lastName}`.trim();

  if (donorName !== '') {
    return `This row cannot create a new donor because ${email} is already the primary email for ${donorName}. Link that donor or change the staged email first.`;
  }

  return `This row cannot create a new donor because ${email} is already the primary email for an existing donor. Link that donor or change the staged email first.`;
};

export const loadPeopleByPrimaryEmails = async (
  client: CoreApiClient,
  emails: string[],
): Promise<PeopleByEmailMap> => {
  const normalizedEmails = [...new Set(emails.map(normalizeEmail).filter(Boolean))];

  if (normalizedEmails.length === 0) {
    return new Map();
  }

  const result = await client.query({
    people: {
      __args: {
        first: Math.max(normalizedEmails.length, 20),
        filter: {
          or: normalizedEmails.map((email) => ({
            emails: {
              primaryEmail: {
                eq: email,
              },
            },
          })),
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

  const people = extractConnectionNodes<PersonSummary>(result, 'people');

  const peopleByEmail = new Map<string, PersonSummary>();

  for (const person of people) {
    const email = normalizeEmail(person.emails?.primaryEmail);

    if (email !== '') {
      peopleByEmail.set(email, person);
    }
  }

  return peopleByEmail;
};

export const findPrimaryEmailConflict = ({
  donorEmail,
  linkedDonorId,
  peopleByEmail,
}: {
  donorEmail: string | null | undefined;
  linkedDonorId?: string | null | undefined;
  peopleByEmail: Map<string, PersonSummary>;
}): PersonSummary | null => {
  const normalizedEmail = normalizeEmail(donorEmail);

  if (normalizedEmail === '') {
    return null;
  }

  const conflictingPerson = peopleByEmail.get(normalizedEmail);

  if (!conflictingPerson?.id) {
    return null;
  }

  if (
    normalizeString(linkedDonorId) !== '' &&
    conflictingPerson.id === normalizeString(linkedDonorId)
  ) {
    return null;
  }

  return conflictingPerson;
};
