import {
  loadPeopleByPrimaryEmails,
  normalizeDonorCandidateEmail,
  type PeopleByEmailMap,
} from './donor-candidate-discovery';
import type { PersonSummary } from 'src/manual-gift-entry/manual-gift-entry.types';

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

export { loadPeopleByPrimaryEmails };
export type { PeopleByEmailMap };

export const findPrimaryEmailConflict = ({
  donorEmail,
  linkedDonorId,
  peopleByEmail,
}: {
  donorEmail: string | null | undefined;
  linkedDonorId?: string | null | undefined;
  peopleByEmail: Map<string, PersonSummary>;
}): PersonSummary | null => {
  const normalizedEmail = normalizeDonorCandidateEmail(donorEmail);

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
