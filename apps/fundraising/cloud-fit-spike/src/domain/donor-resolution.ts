export interface DonorResolutionContact {
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface DuplicatePersonCandidates {
  candidateIds: string[];
  emailMatchedId?: string;
  fallbackId?: string;
}

const isPlainObject = (
  value: unknown,
): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const normalizeOptionalString = (value: unknown): string | undefined => {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : undefined;
};

export const normalizeDonorResolutionContact = (input: {
  donorFirstName?: unknown;
  donorLastName?: unknown;
  donorEmail?: unknown;
}): DonorResolutionContact => ({
  firstName: normalizeOptionalString(input.donorFirstName),
  lastName: normalizeOptionalString(input.donorLastName),
  email: normalizeOptionalString(input.donorEmail),
});

export const canLookupDuplicateDonors = (
  contact: DonorResolutionContact,
): boolean => Boolean(contact.firstName && contact.lastName);

export const canCreatePersonFromContact = (
  contact: DonorResolutionContact,
): boolean => Boolean(contact.firstName && contact.lastName);

export const pickPreferredDuplicatePersonId = (
  response: unknown,
  email?: string,
): DuplicatePersonCandidates | undefined => {
  if (!isPlainObject(response)) {
    return undefined;
  }

  const data = response.data;

  if (!Array.isArray(data) || data.length === 0) {
    return undefined;
  }

  const normalizedEmail = normalizeOptionalString(email)?.toLowerCase();
  const candidateIds = new Set<string>();
  let emailMatchedId: string | undefined;
  let fallbackId: string | undefined;

  for (const entry of data) {
    if (!isPlainObject(entry)) {
      continue;
    }

    const duplicates = entry.personDuplicates;

    if (!Array.isArray(duplicates) || duplicates.length === 0) {
      continue;
    }

    for (const duplicate of duplicates) {
      if (!isPlainObject(duplicate)) {
        continue;
      }

      const duplicateId = normalizeOptionalString(duplicate.id);

      if (!duplicateId) {
        continue;
      }

      candidateIds.add(duplicateId);

      if (!fallbackId) {
        fallbackId = duplicateId;
      }

      if (!normalizedEmail) {
        continue;
      }

      const duplicateEmails = duplicate.emails;

      if (!isPlainObject(duplicateEmails)) {
        continue;
      }

      const primaryEmail = normalizeOptionalString(duplicateEmails.primaryEmail);

      if (primaryEmail?.toLowerCase() === normalizedEmail) {
        emailMatchedId = duplicateId;
        break;
      }
    }

    if (emailMatchedId) {
      break;
    }
  }

  if (candidateIds.size === 0) {
    return undefined;
  }

  return {
    candidateIds: Array.from(candidateIds),
    emailMatchedId,
    fallbackId,
  };
};

export const chooseResolvedPersonId = (options: {
  duplicateMatchedId?: string;
  emailMatchedId?: string;
  nameMatchedId?: string;
}): string | undefined =>
  options.duplicateMatchedId ??
  options.emailMatchedId ??
  options.nameMatchedId;
