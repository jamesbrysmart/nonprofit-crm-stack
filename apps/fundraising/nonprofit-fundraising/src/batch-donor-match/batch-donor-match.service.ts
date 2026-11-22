import { CoreApiClient } from 'twenty-client-sdk/core';
import {
  buildConflictMessage,
  findPrimaryEmailConflict,
  loadPeopleByPrimaryEmails,
} from 'src/donor-resolution/donor-creation-viability';
import { normalizeDonorResolutionState } from 'src/donor-resolution/donor-resolution-state';
import {
  buildExactNameKey,
  loadPeopleByExactNames,
} from 'src/donor-resolution/donor-candidate-discovery';
import { persistGiftStagingBatchUpserts } from 'src/gift-staging/gift-staging-bulk-writeback';
import { isPaymentConfirmedOrNotRequired } from 'src/gift-staging-review/gift-staging-processability';
import {
  determineBatchDonorMatchOutcome,
  groupRowsForBatchDonorMatch,
} from './batch-donor-match';
import type {
  BatchDonorMatchRow,
  ExactDonorCandidate,
} from './batch-donor-match.types';

export type DonorMatchRowsResult = {
  totalCandidateRows: number;
  evaluatedRows: number;
  alreadyConfirmedRows: number;
  autoLinkedRows: number;
  ambiguousRows: number;
  unchangedRows: number;
};

const isAlreadyConfirmedDonorMatch = (row: BatchDonorMatchRow) => {
  const processingStatus =
    typeof row.processingStatus === 'string'
      ? row.processingStatus.trim().toUpperCase()
      : '';
  const donorResolutionState =
    normalizeDonorResolutionState(row.donorResolutionState);

  return (
    processingStatus !== 'PROCESSED' &&
    row.isAnonymousDonor !== true &&
    ((typeof row.donor?.id === 'string' && row.donor.id.trim() !== '') ||
      donorResolutionState === 'CONFIRMED')
  );
};

export const runDonorMatchOnRows = async (
  client: CoreApiClient,
  rows: BatchDonorMatchRow[],
): Promise<DonorMatchRowsResult> => {
  const groupedRows = groupRowsForBatchDonorMatch(rows);
  const rowIds = new Set(rows.map((row) => row.id));
  const writebacks: Array<Record<string, unknown> & { id: string }> = [];
  let autoLinkedRows = 0;
  let ambiguousRows = 0;
  const peopleByEmail = await loadPeopleByPrimaryEmails(
    client,
    groupedRows.map((group) => group.email),
  );

  const peopleByName = await loadPeopleByExactNames<ExactDonorCandidate>({
    client,
    names: groupedRows,
    options: { includeAdditionalEmails: true },
  });

  for (const group of groupedRows) {
    const nameCandidates =
      peopleByName.get(buildExactNameKey(group.firstName, group.lastName)) ?? [];
    const emailCandidate = group.email === '' ? null : peopleByEmail.get(group.email) ?? null;
    const emailCandidates =
      emailCandidate === null
        ? []
        : [
            {
              ...emailCandidate,
              emails: {
                primaryEmail: emailCandidate.emails?.primaryEmail ?? null,
                additionalEmails: null,
              },
            } satisfies ExactDonorCandidate,
          ];

    const outcome = determineBatchDonorMatchOutcome({
      email: group.email,
      nameCandidates,
      emailCandidates,
    });
    const primaryEmailConflict = findPrimaryEmailConflict({
      donorEmail: group.email,
      peopleByEmail,
    });

    if (outcome.kind === 'CONFIRMED') {
      autoLinkedRows += group.rows.length;
      writebacks.push(
        ...group.rows.map((row) => ({
          id: row.id,
          donorId: outcome.donorId,
          donorResolutionState: 'CONFIRMED',
          giftReadyStatus: 'NEEDS_REVIEW',
          processingStatus: 'NOT_PROCESSED',
          errorDetail: null,
        })),
      );
      continue;
    }

    if (outcome.kind === 'AMBIGUOUS' || primaryEmailConflict) {
      ambiguousRows += group.rows.length;
      writebacks.push(
        ...group.rows.map((row) => ({
          id: row.id,
          donorId: null,
          donorResolutionState: 'AMBIGUOUS',
          giftReadyStatus: 'NEEDS_REVIEW',
          processingStatus: 'NOT_PROCESSED',
          errorDetail: primaryEmailConflict
            ? buildConflictMessage(group.email, primaryEmailConflict)
            : null,
        })),
      );
    }
  }

  await persistGiftStagingBatchUpserts(writebacks, {
    allowedIds: rowIds,
  });

  const evaluatedRows = groupedRows.reduce(
    (sum, group) => sum + group.rows.length,
    0,
  );

  return {
    totalCandidateRows: rows.filter(
      (row) =>
        isPaymentConfirmedOrNotRequired(row) &&
        row.isAnonymousDonor !== true &&
        (typeof row.processingStatus === 'string'
          ? row.processingStatus.trim().toUpperCase()
          : '') !== 'PROCESSED' &&
        normalizeDonorResolutionState(row.donorResolutionState) ===
          'UNREVIEWED',
    ).length,
    evaluatedRows,
    alreadyConfirmedRows: rows.filter(isAlreadyConfirmedDonorMatch).length,
    autoLinkedRows,
    ambiguousRows,
    unchangedRows: evaluatedRows - autoLinkedRows - ambiguousRows,
  };
};
