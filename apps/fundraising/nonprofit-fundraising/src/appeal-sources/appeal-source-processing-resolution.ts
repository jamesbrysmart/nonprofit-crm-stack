import type { CoreApiClient } from 'twenty-client-sdk/core';
import type { BatchProcessingRow } from 'src/batch-processing/batch-processing.types';
import { extractConnectionNodes } from 'src/core-api/core-api-results';

const normalizeString = (value: string | null | undefined) =>
  typeof value === 'string' ? value.trim() : '';

type AppealSourceParentRecord = {
  id?: string | null;
  appeal?: {
    id?: string | null;
    defaultFund?: {
      id?: string | null;
      name?: string | null;
    } | null;
  } | null;
};

const loadAppealSourceParentsById = async (
  client: CoreApiClient,
  appealSourceIds: string[],
): Promise<Map<string, AppealSourceParentRecord>> => {
  const uniqueAppealSourceIds = [
    ...new Set(appealSourceIds.map(normalizeString).filter((id) => id !== '')),
  ];

  if (uniqueAppealSourceIds.length === 0) {
    return new Map();
  }

  const result = await client.query({
    appealSources: {
      __args: {
        first: uniqueAppealSourceIds.length,
        filter: {
          id: {
            in: uniqueAppealSourceIds,
          },
        },
      },
      edges: {
        node: {
          id: true,
          appeal: {
            id: true,
            defaultFund: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  } as any);

  return new Map(
    extractConnectionNodes<AppealSourceParentRecord>(result, 'appealSources')
      .map(
        (appealSource): [string, AppealSourceParentRecord] => [
          normalizeString(appealSource.id),
          appealSource,
        ],
      )
      .filter(([id]) => id !== ''),
  );
};

export const resolveAppealSourceParentsForProcessing = async (
  client: CoreApiClient,
  rows: BatchProcessingRow[],
): Promise<BatchProcessingRow[]> => {
  const appealSourceIds = rows
    .map((row) => normalizeString(row.appealSource?.id))
    .filter((appealSourceId) => appealSourceId !== '');

  if (appealSourceIds.length === 0) {
    return rows;
  }

  const appealSourceParents = await loadAppealSourceParentsById(
    client,
    appealSourceIds,
  );

  return rows.map((row) => {
    const appealSourceId = normalizeString(row.appealSource?.id);
    const appealSourceParent = appealSourceParents.get(appealSourceId);
    const parentAppealId = normalizeString(appealSourceParent?.appeal?.id);

    if (appealSourceId === '' || parentAppealId === '') {
      return row;
    }

    const rowAppealId = normalizeString(row.appeal?.id);
    const appealDefaultFund =
      row.appeal?.defaultFund ?? appealSourceParent?.appeal?.defaultFund ?? null;

    return {
      ...row,
      ...(rowAppealId === ''
        ? {
            appeal: {
              ...(row.appeal ?? {}),
              id: parentAppealId,
              defaultFund: appealDefaultFund,
            },
          }
        : {
            appeal:
              row.appeal && rowAppealId === parentAppealId
                ? {
                    ...row.appeal,
                    defaultFund: appealDefaultFund,
                  }
                : row.appeal,
          }),
      appealSource: {
        ...(row.appealSource ?? { id: appealSourceId }),
        appeal: {
          ...(row.appealSource?.appeal ?? {}),
          id: parentAppealId,
        },
      },
    };
  });
};
