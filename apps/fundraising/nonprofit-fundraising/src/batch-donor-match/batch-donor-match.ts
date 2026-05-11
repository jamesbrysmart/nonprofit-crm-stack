import type {
  BatchDonorMatchGroup,
  BatchDonorMatchOutcome,
  BatchDonorMatchRow,
  ExactDonorCandidate,
} from './batch-donor-match.types';

const normalizeString = (value: string | null | undefined) =>
  typeof value === 'string' ? value.trim() : '';

const normalizeEmail = (value: string | null | undefined) =>
  normalizeString(value).toLowerCase();

export const canEvaluateBatchDonorMatchRow = (row: BatchDonorMatchRow) => {
  return (
    normalizeString(row.donorResolutionState) === 'UNREVIEWED' &&
    normalizeString(row.processingStatus) !== 'PROCESSED' &&
    normalizeString(row.donor?.id) === '' &&
    normalizeString(row.donorFirstName) !== '' &&
    normalizeString(row.donorLastName) !== ''
  );
};

export const groupRowsForBatchDonorMatch = (
  rows: BatchDonorMatchRow[],
): BatchDonorMatchGroup[] => {
  const groups = new Map<string, BatchDonorMatchGroup>();

  for (const row of rows) {
    if (!canEvaluateBatchDonorMatchRow(row)) {
      continue;
    }

    const firstName = normalizeString(row.donorFirstName);
    const lastName = normalizeString(row.donorLastName);
    const email = normalizeEmail(row.donorEmail);
    const key = `${firstName}\u0000${lastName}\u0000${email}`;
    const existing = groups.get(key);

    if (existing) {
      existing.rows.push(row);
      continue;
    }

    groups.set(key, {
      firstName,
      lastName,
      email,
      rows: [row],
    });
  }

  return [...groups.values()];
};

const donorHasExactEmail = (
  donor: ExactDonorCandidate,
  email: string,
) => {
  const primaryEmail = normalizeEmail(donor.emails?.primaryEmail);

  if (primaryEmail !== '' && primaryEmail === email) {
    return true;
  }

  const additionalEmails = Array.isArray(donor.emails?.additionalEmails)
    ? donor.emails.additionalEmails
    : [];

  return additionalEmails.some(
    (candidateEmail) => normalizeEmail(candidateEmail) === email,
  );
};

export const determineBatchDonorMatchOutcome = ({
  email,
  candidates,
}: {
  email: string;
  candidates: ExactDonorCandidate[];
}): BatchDonorMatchOutcome => {
  const exactEmailCandidates = candidates.filter((candidate) =>
    donorHasExactEmail(candidate, email),
  );

  if (exactEmailCandidates.length === 1) {
    return {
      kind: 'CONFIRMED',
      donorId: exactEmailCandidates[0].id,
    };
  }

  if (exactEmailCandidates.length > 1) {
    return {
      kind: 'AMBIGUOUS',
      candidateCount: exactEmailCandidates.length,
    };
  }

  if (candidates.length > 0) {
    return {
      kind: 'AMBIGUOUS',
      candidateCount: candidates.length,
    };
  }

  return {
    kind: 'UNREVIEWED',
    candidateCount: candidates.length,
  };
};
