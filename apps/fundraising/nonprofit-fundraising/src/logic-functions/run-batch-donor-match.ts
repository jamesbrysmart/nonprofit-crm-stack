import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import {
  determineBatchDonorMatchOutcome,
  groupRowsForBatchDonorMatch,
} from 'src/batch-donor-match/batch-donor-match';
import type {
  BatchDonorMatchRequest,
  BatchDonorMatchResponse,
  BatchDonorMatchRow,
  ExactDonorCandidate,
} from 'src/batch-donor-match/batch-donor-match.types';
import { persistGiftStagingBatchUpserts } from 'src/gift-staging/gift-staging-bulk-writeback';

type BatchSummaryRecord = {
  id: string;
};

const normalizeString = (value: string | null | undefined) =>
  typeof value === 'string' ? value.trim() : '';

const loadBatchAndRows = async (
  client: CoreApiClient,
  giftBatchId: string,
): Promise<{
  batch: BatchSummaryRecord | null;
  rows: BatchDonorMatchRow[];
}> => {
  const result = await client.query({
    giftBatch: {
      __args: {
        filter: {
          id: { eq: giftBatchId },
        },
      },
      id: true,
    },
    giftStagings: {
      __args: {
        first: 200,
        filter: {
          giftBatchId: {
            eq: giftBatchId,
          },
        },
      },
      edges: {
        node: {
          id: true,
          donorFirstName: true,
          donorLastName: true,
          donorEmail: true,
          donorResolutionState: true,
          processingStatus: true,
          donor: {
            id: true,
          },
        },
      },
    },
  } as any);

  return {
    batch: (result?.giftBatch as BatchSummaryRecord | null) ?? null,
    rows:
      result?.giftStagings?.edges?.map(
        (edge: { node: BatchDonorMatchRow }) => edge.node,
      ) ?? [],
  };
};

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

const handler = async (
  event: RoutePayload<BatchDonorMatchRequest>,
): Promise<BatchDonorMatchResponse> => {
  const giftBatchId = normalizeString(event.body?.giftBatchId);

  if (giftBatchId === '') {
    throw new Error('giftBatchId is required');
  }

  const client = new CoreApiClient();
  const { batch, rows } = await loadBatchAndRows(client, giftBatchId);

  if (!batch) {
    throw new Error('Batch not found');
  }

  const groupedRows = groupRowsForBatchDonorMatch(rows);
  const rowIds = new Set(rows.map((row) => row.id));
  const writebacks: Array<Record<string, unknown> & { id: string }> = [];
  let autoLinkedRows = 0;
  let ambiguousRows = 0;

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

    if (outcome.kind === 'CONFIRMED') {
      autoLinkedRows += group.rows.length;
      writebacks.push(
        ...group.rows.map((row) => ({
          id: row.id,
          donorId: outcome.donorId,
          donorResolutionState: 'CONFIRMED',
          isReadyForProcessing: false,
          processingStatus: 'NOT_PROCESSED',
          errorDetail: null,
        })),
      );
      continue;
    }

    if (outcome.kind === 'AMBIGUOUS') {
      ambiguousRows += group.rows.length;
      writebacks.push(
        ...group.rows.map((row) => ({
          id: row.id,
          donorId: null,
          donorResolutionState: 'AMBIGUOUS',
          isReadyForProcessing: false,
          processingStatus: 'NOT_PROCESSED',
          errorDetail: null,
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
    giftBatchId,
    totalCandidateRows: rows.filter(
      (row) =>
        normalizeString(row.processingStatus) !== 'PROCESSED' &&
        normalizeString(row.donorResolutionState) === 'UNREVIEWED',
    ).length,
    evaluatedRows,
    autoLinkedRows,
    ambiguousRows,
    unchangedRows: evaluatedRows - autoLinkedRows - ambiguousRows,
  };
};

export default defineLogicFunction({
  universalIdentifier: '6448d2f5-91fc-465c-8204-ee0ffcbfdcb8',
  name: 'run-batch-donor-match',
  description:
    'Runs a conservative donor-match pass for one gift batch and writes safe outcomes back to staging rows.',
  timeoutSeconds: 120,
  handler,
  httpRouteTriggerSettings: {
    path: '/batch-processing/run-donor-match',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
