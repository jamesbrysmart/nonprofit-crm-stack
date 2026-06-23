import type { CoreApiClient } from 'twenty-client-sdk/core';
import { extractConnectionNodes } from 'src/core-api/core-api-results';
import { persistGiftStagingBatchUpserts } from 'src/gift-staging/gift-staging-bulk-writeback';

const normalizeString = (value: string | null | undefined) =>
  typeof value === 'string' ? value.trim() : '';

type AppealSourceExternalMatchRow = {
  id: string;
  provider?: string | null;
  appealSourceExternalId?: string | null;
  appeal?: { id?: string | null } | null;
  appealSource?: { id?: string | null } | null;
};

type AppealSourceLookupRecord = {
  id?: string | null;
  externalId?: string | null;
  platform?: string | null;
  appeal?: {
    id?: string | null;
  } | null;
};

const loadAppealSourcesByExternalIds = async (
  client: CoreApiClient,
  externalIds: string[],
): Promise<AppealSourceLookupRecord[]> => {
  if (externalIds.length === 0) {
    return [];
  }

  const result = await client.query({
    appealSources: {
      __args: {
        first: 200,
        filter: {
          externalId: {
            in: externalIds,
          },
        },
      },
      edges: {
        node: {
          id: true,
          externalId: true,
          platform: true,
          appeal: {
            id: true,
          },
        },
      },
    },
  } as any);

  return extractConnectionNodes<AppealSourceLookupRecord>(result, 'appealSources');
};

const chooseAppealSourceMatch = ({
  row,
  matches,
}: {
  row: AppealSourceExternalMatchRow;
  matches: AppealSourceLookupRecord[];
}): AppealSourceLookupRecord | null => {
  if (matches.length === 0) {
    return null;
  }

  const rowProvider = normalizeString(row.provider).toUpperCase();
  const rowAppealId = normalizeString(row.appeal?.id);

  const providerScopedMatches =
    rowProvider === ''
      ? matches
      : matches.filter(
          (match) => normalizeString(match.platform).toUpperCase() === rowProvider,
        );

  const candidatePool =
    providerScopedMatches.length > 0 ? providerScopedMatches : matches;

  const compatibleMatches = candidatePool.filter((match) => {
    const matchAppealId = normalizeString(match.appeal?.id);

    return rowAppealId === '' || matchAppealId === '' || matchAppealId === rowAppealId;
  });

  return compatibleMatches.length === 1 ? compatibleMatches[0] ?? null : null;
};

export const resolveAppealSourceExternalIdsForRows = async <
  T extends AppealSourceExternalMatchRow,
>(
  client: CoreApiClient,
  rows: T[],
): Promise<T[]> => {
  const unresolvedRows = rows.filter((row) => {
    const externalId = normalizeString(row.appealSourceExternalId);
    const appealSourceId = normalizeString(row.appealSource?.id);

    return externalId !== '' && appealSourceId === '';
  });

  if (unresolvedRows.length === 0) {
    return rows;
  }

  const uniqueExternalIds = [
    ...new Set(
      unresolvedRows
        .map((row) => normalizeString(row.appealSourceExternalId))
        .filter((value) => value !== ''),
    ),
  ];

  const appealSources = await loadAppealSourcesByExternalIds(
    client,
    uniqueExternalIds,
  );
  const appealSourcesByExternalId = new Map<string, AppealSourceLookupRecord[]>();

  for (const appealSource of appealSources) {
    const externalId = normalizeString(appealSource.externalId);

    if (externalId === '') {
      continue;
    }

    const existing = appealSourcesByExternalId.get(externalId) ?? [];
    existing.push(appealSource);
    appealSourcesByExternalId.set(externalId, existing);
  }

  const writebacks: Array<{
    id: string;
    appealSourceId: string;
    appealId?: string;
  }> = [];

  const nextRows = rows.map((row) => {
    const externalId = normalizeString(row.appealSourceExternalId);
    const appealSourceId = normalizeString(row.appealSource?.id);

    if (externalId === '' || appealSourceId !== '') {
      return row;
    }

    const resolvedMatch = chooseAppealSourceMatch({
      row,
      matches: appealSourcesByExternalId.get(externalId) ?? [],
    });

    if (!resolvedMatch?.id) {
      return row;
    }

    const resolvedAppealId = normalizeString(resolvedMatch.appeal?.id);
    const rowAppealId = normalizeString(row.appeal?.id);

    writebacks.push({
      id: row.id,
      appealSourceId: normalizeString(resolvedMatch.id),
      ...(rowAppealId === '' && resolvedAppealId !== ''
        ? { appealId: resolvedAppealId }
        : {}),
    });

    return {
      ...row,
      appealSource: {
        ...(row.appealSource ?? {}),
        id: normalizeString(resolvedMatch.id),
      },
      ...(rowAppealId === '' && resolvedAppealId !== ''
        ? {
            appeal: {
              ...(row.appeal ?? {}),
              id: resolvedAppealId,
            },
          }
        : {}),
    };
  });

  if (writebacks.length > 0) {
    await persistGiftStagingBatchUpserts(writebacks);
  }

  return nextRows;
};
