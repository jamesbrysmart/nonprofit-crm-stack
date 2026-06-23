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

const APPEAL_QUERY_CHUNK_SIZE = 25;
const GIFT_QUERY_PAGE_SIZE = 200;
const APPEAL_WRITEBACK_CHUNK_SIZE = 60;

type CurrencyAmount = {
  amountMicros?: number | null;
  currencyCode?: string | null;
};

type GiftRecord = {
  id: string;
  giftDate?: string | null;
  giftType?: string | null;
  amount?: CurrencyAmount | null;
  appeal?: {
    id?: string | null;
  } | null;
  donor?: {
    id?: string | null;
  } | null;
  company?: {
    id?: string | null;
  } | null;
};

type AppealRollupRecord = {
  id: string;
  raisedAmount?: CurrencyAmount | null;
  giftCount?: number | null;
  donorCount?: number | null;
  lastGiftAt?: string | null;
};

type AppealRollupSummary = {
  appealId: string;
  raisedAmount: {
    amountMicros: number;
    currencyCode: string;
  };
  giftCount: number;
  donorCount: number;
  lastGiftAt: string | null;
};

type AppealRollupWriteback = {
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
  appealId?: string | null;
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

const buildOrAppealFilter = (appealIds: string[]) => ({
  or: appealIds.map((appealId) => ({
    appealId: {
      eq: appealId,
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
  current: AppealRollupRecord,
  next: AppealRollupSummary,
) =>
  areAmountsEqual(current.raisedAmount, next.raisedAmount) &&
  Math.round(current.giftCount ?? 0) === next.giftCount &&
  Math.round(current.donorCount ?? 0) === next.donorCount &&
  normalizeString(current.lastGiftAt) === normalizeString(next.lastGiftAt);

export const collectAppealIds = (appealIds: Array<string | null | undefined>) =>
  Array.from(
    new Set(
      appealIds
        .map((appealId) => normalizeString(appealId))
        .filter((appealId) => appealId !== ''),
    ),
  );

export const computeAppealRollupSummary = (
  appealId: string,
  gifts: GiftRecord[],
  currentAppeal?: AppealRollupRecord,
): AppealRollupSummary => {
  const includedGifts = gifts.filter((gift) => includeInCashRollups(gift.giftType));
  const sortedByGiftDate = [...includedGifts].sort((left, right) =>
    normalizeString(right.giftDate).localeCompare(normalizeString(left.giftDate)),
  );
  const currencyCode =
    normalizeCurrencyCode(sortedByGiftDate[0]?.amount?.currencyCode) ||
    normalizeCurrencyCode(currentAppeal?.raisedAmount?.currencyCode);
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
    appealId,
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

const loadAppealsByIds = async (
  client: CoreApiClient,
  appealIds: string[],
): Promise<Map<string, AppealRollupRecord>> => {
  const appealsById = new Map<string, AppealRollupRecord>();

  for (const chunk of chunkArray(appealIds, APPEAL_QUERY_CHUNK_SIZE)) {
    const result = await client.query({
      appeals: {
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

    const appeals = extractConnectionNodes<AppealRollupRecord>(
      result,
      'appeals',
    );

    for (const appeal of appeals) {
      appealsById.set(appeal.id, appeal);
    }
  }

  return appealsById;
};

const loadCommittedGiftsForAppeals = async (
  client: CoreApiClient,
  appealIds: string[],
): Promise<Map<string, GiftRecord[]>> => {
  const giftsByAppealId = new Map<string, GiftRecord[]>();

  appealIds.forEach((appealId) => {
    giftsByAppealId.set(appealId, []);
  });

  for (const chunk of chunkArray(appealIds, APPEAL_QUERY_CHUNK_SIZE)) {
    let hasNextPage = true;
    let cursor: string | undefined;

    while (hasNextPage) {
      const result = await client.query({
        gifts: {
          __args: {
            first: GIFT_QUERY_PAGE_SIZE,
            ...(cursor ? { after: cursor } : {}),
            filter: buildOrAppealFilter(chunk),
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
              appeal: {
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
        const appealId = normalizeString(gift.appeal?.id);

        if (appealId === '' || !giftsByAppealId.has(appealId)) {
          continue;
        }

        giftsByAppealId.get(appealId)?.push(gift);
      }

      hasNextPage = giftConnection.pageInfo?.hasNextPage === true;
      cursor =
        typeof giftConnection.pageInfo?.endCursor === 'string'
          ? giftConnection.pageInfo.endCursor
          : undefined;
    }
  }

  return giftsByAppealId;
};

const loadAllCommittedGifts = async (
  client: CoreApiClient,
): Promise<Map<string, GiftRecord[]>> => {
  const giftsByAppealId = new Map<string, GiftRecord[]>();
  let hasNextPage = true;
  let cursor: string | undefined;

  while (hasNextPage) {
    const result = await client.query({
      gifts: {
        __args: {
          first: GIFT_QUERY_PAGE_SIZE,
          ...(cursor ? { after: cursor } : {}),
          filter: {
            appealId: {
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
            appeal: {
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
      const appealId = normalizeString(gift.appeal?.id);

      if (appealId === '') {
        continue;
      }

      const appealGifts = giftsByAppealId.get(appealId) ?? [];
      appealGifts.push(gift);
      giftsByAppealId.set(appealId, appealGifts);
    }

    hasNextPage = giftConnection.pageInfo?.hasNextPage === true;
    cursor =
      typeof giftConnection.pageInfo?.endCursor === 'string'
        ? giftConnection.pageInfo.endCursor
        : undefined;
  }

  return giftsByAppealId;
};

const loadAppealIdsWithExistingRollups = async (
  client: CoreApiClient,
): Promise<string[]> => {
  const appealIds = new Set<string>();
  let hasNextPage = true;
  let cursor: string | undefined;

  while (hasNextPage) {
    const result = await client.query({
      appeals: {
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

    const appealConnection = extractConnection<{ id: string }>(
      result,
      'appeals',
    );
    const appeals = appealConnection.edges.map((edge) => edge.node);

    for (const appeal of appeals) {
      const appealId = normalizeString(appeal.id);

      if (appealId !== '') {
        appealIds.add(appealId);
      }
    }

    hasNextPage = appealConnection.pageInfo?.hasNextPage === true;
    cursor =
      typeof appealConnection.pageInfo?.endCursor === 'string'
        ? appealConnection.pageInfo.endCursor
        : undefined;
  }

  return [...appealIds];
};

const persistAppealRollupWritebacks = async (
  writebacks: AppealRollupWriteback[],
) => {
  for (const chunk of chunkArray(writebacks, APPEAL_WRITEBACK_CHUNK_SIZE)) {
    const response = await postTwentyRest<unknown>({
      path: '/rest/batch/appeals?upsert=true&depth=0',
      body: chunk,
    });

    const appeals =
      response &&
      typeof response === 'object' &&
      Array.isArray(
        (response as { data?: { createAppeals?: Array<{ id?: unknown }> } }).data
          ?.createAppeals,
      )
        ? (
            response as { data?: { createAppeals?: Array<{ id?: unknown }> } }
          ).data?.createAppeals ?? []
        : [];

    const returnedIds = new Set(
      appeals
        .map((appeal) =>
          typeof appeal?.id === 'string' ? appeal.id.trim() : undefined,
        )
        .filter((id): id is string => Boolean(id)),
    );

    for (const writeback of chunk) {
      if (!returnedIds.has(writeback.id)) {
        throw new Error(`Batch appeal rollup writeback missing id ${writeback.id}`);
      }
    }
  }
};

export const recomputeAppealRollups = async (
  client: CoreApiClient,
  appealIds: Array<string | null | undefined>,
) => {
  const normalizedAppealIds = collectAppealIds(appealIds);

  if (normalizedAppealIds.length === 0) {
    return {
      scannedAppealCount: 0,
      updatedAppealCount: 0,
    };
  }

  const [appealsById, giftsByAppealId] = await Promise.all([
    loadAppealsByIds(client, normalizedAppealIds),
    loadCommittedGiftsForAppeals(client, normalizedAppealIds),
  ]);
  const writebacks: AppealRollupWriteback[] = [];

  for (const appealId of normalizedAppealIds) {
    const currentAppeal = appealsById.get(appealId);

    if (!currentAppeal) {
      continue;
    }

    const nextSummary = computeAppealRollupSummary(
      appealId,
      giftsByAppealId.get(appealId) ?? [],
      currentAppeal,
    );

    if (areSummariesEqual(currentAppeal, nextSummary)) {
      continue;
    }

    writebacks.push({
      id: appealId,
      raisedAmount: nextSummary.raisedAmount,
      giftCount: nextSummary.giftCount,
      donorCount: nextSummary.donorCount,
      lastGiftAt: nextSummary.lastGiftAt,
    });
  }

  if (writebacks.length > 0) {
    await persistAppealRollupWritebacks(writebacks);
  }

  return {
    scannedAppealCount: normalizedAppealIds.length,
    updatedAppealCount: writebacks.length,
  };
};

export const recomputeAllAppealRollups = async (client: CoreApiClient) => {
  const [giftsByAppealId, appealIdsWithExistingRollups] = await Promise.all([
    loadAllCommittedGifts(client),
    loadAppealIdsWithExistingRollups(client),
  ]);

  const appealIds = collectAppealIds([
    ...giftsByAppealId.keys(),
    ...appealIdsWithExistingRollups,
  ]);

  return recomputeAppealRollups(client, appealIds);
};

export const getAffectedAppealIdsFromGiftUpdate = (
  event: DatabaseEventPayload<ObjectRecordUpdateEvent<GiftEventRecord>>,
) =>
  collectAppealIds([
    event.properties.before?.appealId,
    event.properties.after?.appealId,
  ]);

export const getAffectedAppealIdsFromGiftDelete = (
  event: DatabaseEventPayload<ObjectRecordDeleteEvent<GiftEventRecord>>,
) =>
  collectAppealIds([
    event.properties.before?.appealId,
    event.properties.after?.appealId,
  ]);

export const getAffectedAppealIdsFromGiftRestore = (
  event: DatabaseEventPayload<ObjectRecordRestoreEvent<GiftEventRecord>>,
) =>
  collectAppealIds([
    event.properties.before?.appealId,
    event.properties.after?.appealId,
  ]);
