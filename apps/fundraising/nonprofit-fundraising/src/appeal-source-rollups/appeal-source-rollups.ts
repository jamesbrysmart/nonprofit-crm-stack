import { CoreApiClient } from 'twenty-client-sdk/core';
import { postTwentyRest } from 'src/app-api/twenty-rest-client';
import {
  extractConnection,
  extractConnectionNodes,
} from 'src/core-api/core-api-results';
import type {
  DatabaseEventPayload,
  ObjectRecordDeleteEvent,
  ObjectRecordRestoreEvent,
  ObjectRecordUpdateEvent,
} from 'twenty-sdk/define';

const APPEAL_SOURCE_QUERY_CHUNK_SIZE = 25;
const GIFT_QUERY_PAGE_SIZE = 200;
const APPEAL_SOURCE_WRITEBACK_CHUNK_SIZE = 60;

type CurrencyAmount = {
  amountMicros?: number | null;
  currencyCode?: string | null;
};

type GiftRecord = {
  id: string;
  giftDate?: string | null;
  giftType?: string | null;
  amount?: CurrencyAmount | null;
  appealSource?: {
    id?: string | null;
  } | null;
  donor?: {
    id?: string | null;
  } | null;
  company?: {
    id?: string | null;
  } | null;
};

type AppealSourceRollupRecord = {
  id: string;
  raisedAmount?: CurrencyAmount | null;
  giftCount?: number | null;
  donorCount?: number | null;
  lastGiftAt?: string | null;
};

type AppealSourceRollupSummary = {
  appealSourceId: string;
  raisedAmount: {
    amountMicros: number;
    currencyCode: string;
  };
  giftCount: number;
  donorCount: number;
  lastGiftAt: string | null;
};

type AppealSourceRollupWriteback = {
  id: string;
  raisedAmount: {
    amountMicros: number;
    currencyCode: string;
  };
  giftCount: number;
  donorCount: number;
  lastGiftAt: string | null;
};

type GiftEventRecord = {
  appealSourceId?: string | null;
  donorId?: string | null;
  companyId?: string | null;
  giftDate?: string | null;
  amount?: CurrencyAmount | null;
};

const normalizeString = (value: string | null | undefined) =>
  typeof value === 'string' ? value.trim() : '';

const normalizeCurrencyCode = (value: string | null | undefined) => {
  const normalized = normalizeString(value).toUpperCase();

  return normalized === '' ? 'GBP' : normalized;
};

const includeInCashRollups = (giftType: string | null | undefined) =>
  normalizeString(giftType).toUpperCase() !== 'GIFT_IN_KIND';

const chunkArray = <T,>(items: T[], size: number): T[][] => {
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
};

const buildOrIdFilter = (ids: string[]) => ({
  or: ids.map((id) => ({
    id: {
      eq: id,
    },
  })),
});

const buildOrAppealSourceFilter = (appealSourceIds: string[]) => ({
  or: appealSourceIds.map((appealSourceId) => ({
    appealSourceId: {
      eq: appealSourceId,
    },
  })),
});

const areAmountsEqual = (
  left: CurrencyAmount | null | undefined,
  right: CurrencyAmount | null | undefined,
) =>
  Math.round(left?.amountMicros ?? 0) === Math.round(right?.amountMicros ?? 0) &&
  normalizeCurrencyCode(left?.currencyCode) ===
    normalizeCurrencyCode(right?.currencyCode);

const areSummariesEqual = (
  current: AppealSourceRollupRecord,
  next: AppealSourceRollupSummary,
) =>
  areAmountsEqual(current.raisedAmount, next.raisedAmount) &&
  Math.round(current.giftCount ?? 0) === next.giftCount &&
  Math.round(current.donorCount ?? 0) === next.donorCount &&
  normalizeString(current.lastGiftAt) === normalizeString(next.lastGiftAt);

export const collectAppealSourceIds = (
  appealSourceIds: Array<string | null | undefined>,
) =>
  Array.from(
    new Set(
      appealSourceIds
        .map((appealSourceId) => normalizeString(appealSourceId))
        .filter((appealSourceId) => appealSourceId !== ''),
    ),
  );

export const computeAppealSourceRollupSummary = (
  appealSourceId: string,
  gifts: GiftRecord[],
  currentAppealSource?: AppealSourceRollupRecord,
): AppealSourceRollupSummary => {
  const includedGifts = gifts.filter((gift) => includeInCashRollups(gift.giftType));
  const sortedByGiftDate = [...includedGifts].sort((left, right) =>
    normalizeString(right.giftDate).localeCompare(normalizeString(left.giftDate)),
  );
  const currencyCode =
    normalizeCurrencyCode(sortedByGiftDate[0]?.amount?.currencyCode) ||
    normalizeCurrencyCode(currentAppealSource?.raisedAmount?.currencyCode);
  const contributorIds = new Set<string>();

  for (const gift of includedGifts) {
    const donorId = normalizeString(gift.donor?.id);
    const companyId = normalizeString(gift.company?.id);

    if (donorId !== '') {
      contributorIds.add(`person:${donorId}`);
    }

    if (companyId !== '') {
      contributorIds.add(`company:${companyId}`);
    }
  }

  return {
    appealSourceId,
    raisedAmount: {
      amountMicros: includedGifts.reduce(
        (sum, gift) => sum + Math.round(gift.amount?.amountMicros ?? 0),
        0,
      ),
      currencyCode,
    },
    giftCount: includedGifts.length,
    donorCount: contributorIds.size,
    lastGiftAt: normalizeString(sortedByGiftDate[0]?.giftDate) || null,
  };
};

const loadAppealSourcesByIds = async (
  client: CoreApiClient,
  appealSourceIds: string[],
): Promise<Map<string, AppealSourceRollupRecord>> => {
  const appealSourcesById = new Map<string, AppealSourceRollupRecord>();

  for (const chunk of chunkArray(appealSourceIds, APPEAL_SOURCE_QUERY_CHUNK_SIZE)) {
    const result = await client.query({
      appealSources: {
        __args: {
          first: chunk.length,
          filter: buildOrIdFilter(chunk),
        },
        edges: {
          node: {
            id: true,
            raisedAmount: {
              amountMicros: true,
              currencyCode: true,
            },
            giftCount: true,
            donorCount: true,
            lastGiftAt: true,
          },
        },
      },
    } as any);

    const appealSources = extractConnectionNodes<AppealSourceRollupRecord>(
      result,
      'appealSources',
    );

    for (const appealSource of appealSources) {
      appealSourcesById.set(appealSource.id, appealSource);
    }
  }

  return appealSourcesById;
};

const loadCommittedGiftsForAppealSources = async (
  client: CoreApiClient,
  appealSourceIds: string[],
): Promise<Map<string, GiftRecord[]>> => {
  const giftsByAppealSourceId = new Map<string, GiftRecord[]>();

  appealSourceIds.forEach((appealSourceId) => {
    giftsByAppealSourceId.set(appealSourceId, []);
  });

  for (const chunk of chunkArray(appealSourceIds, APPEAL_SOURCE_QUERY_CHUNK_SIZE)) {
    let hasNextPage = true;
    let cursor: string | undefined;

    while (hasNextPage) {
      const result = await client.query({
        gifts: {
          __args: {
            first: GIFT_QUERY_PAGE_SIZE,
            ...(cursor ? { after: cursor } : {}),
            filter: buildOrAppealSourceFilter(chunk),
          },
          edges: {
            node: {
              id: true,
              giftDate: true,
              giftType: true,
              amount: {
                amountMicros: true,
                currencyCode: true,
              },
              appealSource: {
                id: true,
              },
              donor: {
                id: true,
              },
              company: {
                id: true,
              },
            },
          },
          pageInfo: {
            hasNextPage: true,
            endCursor: true,
          },
        },
      } as any);

      const giftConnection = extractConnection<GiftRecord>(result, 'gifts');
      const gifts = giftConnection.edges.map((edge) => edge.node);

      for (const gift of gifts) {
        const appealSourceId = normalizeString(gift.appealSource?.id);

        if (
          appealSourceId === '' ||
          !giftsByAppealSourceId.has(appealSourceId)
        ) {
          continue;
        }

        giftsByAppealSourceId.get(appealSourceId)?.push(gift);
      }

      hasNextPage = giftConnection.pageInfo?.hasNextPage === true;
      cursor =
        typeof giftConnection.pageInfo?.endCursor === 'string'
          ? giftConnection.pageInfo.endCursor
          : undefined;
    }
  }

  return giftsByAppealSourceId;
};

const loadAllCommittedGifts = async (
  client: CoreApiClient,
): Promise<Map<string, GiftRecord[]>> => {
  const giftsByAppealSourceId = new Map<string, GiftRecord[]>();
  let hasNextPage = true;
  let cursor: string | undefined;

  while (hasNextPage) {
    const result = await client.query({
      gifts: {
        __args: {
          first: GIFT_QUERY_PAGE_SIZE,
          ...(cursor ? { after: cursor } : {}),
          filter: {
            appealSourceId: {
              is: 'NOT_NULL',
            },
          },
        },
        edges: {
          node: {
            id: true,
            giftDate: true,
            giftType: true,
            amount: {
              amountMicros: true,
              currencyCode: true,
            },
            appealSource: {
              id: true,
            },
            donor: {
              id: true,
            },
            company: {
              id: true,
            },
          },
        },
        pageInfo: {
          hasNextPage: true,
          endCursor: true,
        },
      },
    } as any);

    const giftConnection = extractConnection<GiftRecord>(result, 'gifts');
    const gifts = giftConnection.edges.map((edge) => edge.node);

    for (const gift of gifts) {
      const appealSourceId = normalizeString(gift.appealSource?.id);

      if (appealSourceId === '') {
        continue;
      }

      const appealSourceGifts = giftsByAppealSourceId.get(appealSourceId) ?? [];
      appealSourceGifts.push(gift);
      giftsByAppealSourceId.set(appealSourceId, appealSourceGifts);
    }

    hasNextPage = giftConnection.pageInfo?.hasNextPage === true;
    cursor =
      typeof giftConnection.pageInfo?.endCursor === 'string'
        ? giftConnection.pageInfo.endCursor
        : undefined;
  }

  return giftsByAppealSourceId;
};

const loadAppealSourceIdsWithExistingRollups = async (
  client: CoreApiClient,
): Promise<string[]> => {
  const appealSourceIds = new Set<string>();
  let hasNextPage = true;
  let cursor: string | undefined;

  while (hasNextPage) {
    const result = await client.query({
      appealSources: {
        __args: {
          first: GIFT_QUERY_PAGE_SIZE,
          ...(cursor ? { after: cursor } : {}),
          filter: {
            or: [
              {
                giftCount: {
                  gt: 0,
                },
              },
              {
                donorCount: {
                  gt: 0,
                },
              },
              {
                lastGiftAt: {
                  is: 'NOT_NULL',
                },
              },
            ],
          },
        },
        edges: {
          node: {
            id: true,
          },
        },
        pageInfo: {
          hasNextPage: true,
          endCursor: true,
        },
      },
    } as any);

    const appealSourceConnection = extractConnection<{ id: string }>(
      result,
      'appealSources',
    );
    const appealSources = appealSourceConnection.edges.map((edge) => edge.node);

    for (const appealSource of appealSources) {
      const appealSourceId = normalizeString(appealSource.id);

      if (appealSourceId !== '') {
        appealSourceIds.add(appealSourceId);
      }
    }

    hasNextPage = appealSourceConnection.pageInfo?.hasNextPage === true;
    cursor =
      typeof appealSourceConnection.pageInfo?.endCursor === 'string'
        ? appealSourceConnection.pageInfo.endCursor
        : undefined;
  }

  return [...appealSourceIds];
};

const persistAppealSourceRollupWritebacks = async (
  writebacks: AppealSourceRollupWriteback[],
) => {
  for (const chunk of chunkArray(writebacks, APPEAL_SOURCE_WRITEBACK_CHUNK_SIZE)) {
    const response = await postTwentyRest<unknown>({
      path: '/rest/batch/appealSources?upsert=true&depth=0',
      body: chunk,
    });

    const appealSources =
      response &&
      typeof response === 'object' &&
      Array.isArray(
        (
          response as {
            data?: { createAppealSources?: Array<{ id?: unknown }> };
          }
        ).data?.createAppealSources,
      )
        ? (
            response as {
              data?: { createAppealSources?: Array<{ id?: unknown }> };
            }
          ).data?.createAppealSources ?? []
        : [];

    const returnedIds = new Set(
      appealSources
        .map((appealSource) =>
          typeof appealSource?.id === 'string'
            ? appealSource.id.trim()
            : undefined,
        )
        .filter((id): id is string => Boolean(id)),
    );

    for (const writeback of chunk) {
      if (!returnedIds.has(writeback.id)) {
        throw new Error(
          `Batch appeal source rollup writeback missing id ${writeback.id}`,
        );
      }
    }
  }
};

export const recomputeAppealSourceRollups = async (
  client: CoreApiClient,
  appealSourceIds: Array<string | null | undefined>,
) => {
  const normalizedAppealSourceIds = collectAppealSourceIds(appealSourceIds);

  if (normalizedAppealSourceIds.length === 0) {
    return {
      scannedAppealSourceCount: 0,
      updatedAppealSourceCount: 0,
    };
  }

  const [appealSourcesById, giftsByAppealSourceId] = await Promise.all([
    loadAppealSourcesByIds(client, normalizedAppealSourceIds),
    loadCommittedGiftsForAppealSources(client, normalizedAppealSourceIds),
  ]);
  const writebacks: AppealSourceRollupWriteback[] = [];

  for (const appealSourceId of normalizedAppealSourceIds) {
    const currentAppealSource = appealSourcesById.get(appealSourceId);

    if (!currentAppealSource) {
      continue;
    }

    const nextSummary = computeAppealSourceRollupSummary(
      appealSourceId,
      giftsByAppealSourceId.get(appealSourceId) ?? [],
      currentAppealSource,
    );

    if (areSummariesEqual(currentAppealSource, nextSummary)) {
      continue;
    }

    writebacks.push({
      id: appealSourceId,
      raisedAmount: nextSummary.raisedAmount,
      giftCount: nextSummary.giftCount,
      donorCount: nextSummary.donorCount,
      lastGiftAt: nextSummary.lastGiftAt,
    });
  }

  if (writebacks.length > 0) {
    await persistAppealSourceRollupWritebacks(writebacks);
  }

  return {
    scannedAppealSourceCount: normalizedAppealSourceIds.length,
    updatedAppealSourceCount: writebacks.length,
  };
};

export const recomputeAllAppealSourceRollups = async (client: CoreApiClient) => {
  const [giftsByAppealSourceId, appealSourceIdsWithExistingRollups] =
    await Promise.all([
      loadAllCommittedGifts(client),
      loadAppealSourceIdsWithExistingRollups(client),
    ]);

  const appealSourceIds = collectAppealSourceIds([
    ...giftsByAppealSourceId.keys(),
    ...appealSourceIdsWithExistingRollups,
  ]);

  return recomputeAppealSourceRollups(client, appealSourceIds);
};

export const getAffectedAppealSourceIdsFromGiftUpdate = (
  event: DatabaseEventPayload<ObjectRecordUpdateEvent<GiftEventRecord>>,
) =>
  collectAppealSourceIds([
    event.properties.before?.appealSourceId,
    event.properties.after?.appealSourceId,
  ]);

export const getAffectedAppealSourceIdsFromGiftDelete = (
  event: DatabaseEventPayload<ObjectRecordDeleteEvent<GiftEventRecord>>,
) =>
  collectAppealSourceIds([
    event.properties.before?.appealSourceId,
    event.properties.after?.appealSourceId,
  ]);

export const getAffectedAppealSourceIdsFromGiftRestore = (
  event: DatabaseEventPayload<ObjectRecordRestoreEvent<GiftEventRecord>>,
) =>
  collectAppealSourceIds([
    event.properties.before?.appealSourceId,
    event.properties.after?.appealSourceId,
  ]);
