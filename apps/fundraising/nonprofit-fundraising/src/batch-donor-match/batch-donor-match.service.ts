import { CoreApiClient } from 'twenty-client-sdk/core';
import {
  buildConflictMessage,
  findPrimaryEmailConflict,
  loadPeopleByPrimaryEmails,
} from 'src/donor-resolution/donor-creation-viability';
import { persistGiftStagingBatchUpserts } from 'src/gift-staging/gift-staging-bulk-writeback';
import {
  determineBatchDonorMatchOutcome,
  groupRowsForBatchDonorMatch,
} from './batch-donor-match';
import type {
  BatchDonorMatchRow,
  ExactDonorCandidate,
} from './batch-donor-match.types';

const findExistingDonorsByCaseNormalizedName = async ({
  client,
  firstName,
  lastName,
}: {
  client: CoreApiClient;
  firstName: string;
  lastName: string;
}): Promise<ExactDonorCandidate[]> => {
  const result = await client.query({
    people: {
      __args: {
        first: 50,
        filter: {
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
            additionalEmails: true,
          },
        },
      },
    },
  } as any);

  return (
    result?.people?.edges?.map(
      (edge: { node: ExactDonorCandidate }) => edge.node,
    ) ?? []
  );
};

export type DonorMatchRowsResult = {
  totalCandidateRows: number;
  evaluatedRows: number;
  autoLinkedRows: number;
  ambiguousRows: number;
  unchangedRows: number;
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

  for (const group of groupedRows) {
    const candidates = await findExistingDonorsByCaseNormalizedName({
      client,
      firstName: group.firstName,
      lastName: group.lastName,
    });

    const outcome = determineBatchDonorMatchOutcome({
      email: group.email,
      candidates,
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
        typeof row.processingStatus === 'string'
          ? row.processingStatus.trim() !== 'PROCESSED' &&
            row.donorResolutionState?.trim() === 'UNREVIEWED'
          : row.donorResolutionState?.trim() === 'UNREVIEWED',
    ).length,
    evaluatedRows,
    autoLinkedRows,
    ambiguousRows,
    unchangedRows: evaluatedRows - autoLinkedRows - ambiguousRows,
  };
};
