import { CoreApiClient } from 'twenty-client-sdk/core';
import { postTwentyRest } from 'src/app-api/twenty-rest-client';
import {
  findLargestByReportingValue,
  getReportingCurrencyCode,
  normalizeCurrencyCode,
  sumReportingValues,
} from 'src/reporting-currency/reporting-currency';
import {
  extractConnection,
  extractConnectionNodes,
} from 'src/core-api/core-api-results';
import type {
  ObjectRecordDeleteEvent,
  ObjectRecordRestoreEvent,
  ObjectRecordUpdateEvent,
} from 'twenty-sdk/define';
import { normalizeString } from 'src/utils/normalize-string';

const DONOR_QUERY_CHUNK_SIZE = 25;
const GIFT_QUERY_PAGE_SIZE = 200;
const PERSON_WRITEBACK_CHUNK_SIZE = 60;

type CurrencyAmount = {
  amountMicros?: number | null;
  currencyCode?: string | null;
};

type GiftRecord = {
  id: string;
  giftDate?: string | null;
  giftType?: string | null;
  amount?: CurrencyAmount | null;
  reportingAmount?: CurrencyAmount | null;
  donor?: {
    id?: string | null;
  } | null;
};

type PersonRollupRecord = {
  id: string;
  lifetimeGiftAmount?: CurrencyAmount | null;
  giftCount?: number | null;
  firstGiftDate?: string | null;
  lastGiftDate?: string | null;
  lastGiftAmount?: CurrencyAmount | null;
  largestGiftAmount?: CurrencyAmount | null;
};

// Monetary totals are undefined while no reporting currency is configured, so
// the write-back leaves the stored values untouched.
type DonorRollupSummary = {
  donorId: string;
  lifetimeGiftAmount?: CurrencyAmount;
  giftCount: number;
  firstGiftDate: string | null;
  lastGiftDate: string | null;
  lastGiftAmount: CurrencyAmount | null;
  largestGiftAmount?: CurrencyAmount | null;
};

type DonorRollupWriteback = {
  id: string;
  lifetimeGiftAmount?: CurrencyAmount;
  giftCount: number;
  firstGiftDate: string | null;
  lastGiftDate: string | null;
  lastGiftAmount: CurrencyAmount | null;
  largestGiftAmount?: CurrencyAmount | null;
};

type GiftEventRecord = {
  donorId?: string | null;
  giftDate?: string | null;
  amount?: CurrencyAmount | null;
};

const normalizeGiftCurrencyCode = (value: string | null | undefined) =>
  normalizeCurrencyCode(value);

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

const buildOrDonorFilter = (donorIds: string[]) => ({
  or: donorIds.map((donorId) => ({
    donorId: {
      eq: donorId,
    },
  })),
});

export const buildDonorExistingRollupsFilter = () => ({
  or: [
    {
      giftCount: {
        gt: 0,
      },
    },
    {
      firstGiftDate: {
        is: 'NOT_NULL',
      },
    },
    {
      lastGiftDate: {
        is: 'NOT_NULL',
      },
    },
    {
      lastGiftAmount: {
        amountMicros: {
          is: 'NOT_NULL',
        },
      },
    },
    {
      largestGiftAmount: {
        amountMicros: {
          is: 'NOT_NULL',
        },
      },
    },
  ],
});

const areAmountsEqual = (
  left: CurrencyAmount | null | undefined,
  right: CurrencyAmount | null | undefined,
) =>
  Math.round(left?.amountMicros ?? 0) === Math.round(right?.amountMicros ?? 0) &&
  normalizeCurrencyCode(left?.currencyCode) ===
    normalizeCurrencyCode(right?.currencyCode);

const areSummariesEqual = (
  current: PersonRollupRecord,
  next: DonorRollupSummary,
) =>
  (next.lifetimeGiftAmount === undefined ||
    areAmountsEqual(current.lifetimeGiftAmount, next.lifetimeGiftAmount)) &&
  Math.round(current.giftCount ?? 0) === next.giftCount &&
  normalizeString(current.firstGiftDate) ===
    normalizeString(next.firstGiftDate) &&
  normalizeString(current.lastGiftDate) === normalizeString(next.lastGiftDate) &&
  areAmountsEqual(current.lastGiftAmount, next.lastGiftAmount) &&
  (next.largestGiftAmount === undefined ||
    areAmountsEqual(current.largestGiftAmount, next.largestGiftAmount));

// The last gift is a fact about one gift, so it keeps its own currency; the
// lifetime total and largest gift only use reporting-currency values.
export const computeDonorRollupSummary = (
  donorId: string,
  gifts: GiftRecord[],
  _currentPerson?: PersonRollupRecord,
  reportingCurrencyCode: string | null = getReportingCurrencyCode(),
): DonorRollupSummary => {
  const includedGifts = gifts.filter((gift) =>
    includeInCashRollups(gift.giftType),
  );
  const sortedByGiftDate = [...includedGifts].sort((left, right) =>
    normalizeString(right.giftDate).localeCompare(normalizeString(left.giftDate)),
  );
  const sortedByGiftDateAscending = [...includedGifts].sort((left, right) =>
    normalizeString(left.giftDate).localeCompare(normalizeString(right.giftDate)),
  );
  const lastGift = sortedByGiftDate[0];
  const lastGiftCurrencyCode = normalizeGiftCurrencyCode(lastGift?.amount?.currencyCode);

  return {
    donorId,
    ...(reportingCurrencyCode
      ? {
          lifetimeGiftAmount: sumReportingValues(
            includedGifts,
            reportingCurrencyCode,
          ).total,
          largestGiftAmount: findLargestByReportingValue(
            includedGifts,
            reportingCurrencyCode,
          ),
        }
      : {}),
    giftCount: includedGifts.length,
    firstGiftDate:
      normalizeString(sortedByGiftDateAscending[0]?.giftDate) || null,
    lastGiftDate: normalizeString(lastGift?.giftDate) || null,
    lastGiftAmount:
      lastGift && lastGiftCurrencyCode !== ''
        ? {
            amountMicros: Math.round(lastGift.amount?.amountMicros ?? 0),
            currencyCode: lastGiftCurrencyCode,
          }
        : null,
  };
};

const loadPeopleByIds = async (
  client: CoreApiClient,
  donorIds: string[],
): Promise<Map<string, PersonRollupRecord>> => {
  const peopleById = new Map<string, PersonRollupRecord>();

  for (const chunk of chunkArray(donorIds, DONOR_QUERY_CHUNK_SIZE)) {
    const result = await client.query({
      people: {
        __args: {
          first: chunk.length,
          filter: buildOrIdFilter(chunk),
        },
        edges: {
          node: {
            id: true,
            lifetimeGiftAmount: {
              amountMicros: true,
              currencyCode: true,
            },
            giftCount: true,
            firstGiftDate: true,
            lastGiftDate: true,
            lastGiftAmount: {
              amountMicros: true,
              currencyCode: true,
            },
            largestGiftAmount: {
              amountMicros: true,
              currencyCode: true,
            },
          },
        },
      },
    } as any);

    const people = extractConnectionNodes<PersonRollupRecord>(result, 'people');

    for (const person of people) {
      peopleById.set(person.id, person);
    }
  }

  return peopleById;
};

const loadCommittedGiftsForDonors = async (
  client: CoreApiClient,
  donorIds: string[],
): Promise<Map<string, GiftRecord[]>> => {
  const giftsByDonorId = new Map<string, GiftRecord[]>();

  donorIds.forEach((donorId) => {
    giftsByDonorId.set(donorId, []);
  });

  for (const chunk of chunkArray(donorIds, DONOR_QUERY_CHUNK_SIZE)) {
    let hasNextPage = true;
    let cursor: string | undefined;

    while (hasNextPage) {
      const result = await client.query({
        gifts: {
          __args: {
            first: GIFT_QUERY_PAGE_SIZE,
            ...(cursor ? { after: cursor } : {}),
            filter: buildOrDonorFilter(chunk),
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
              reportingAmount: {
                amountMicros: true,
                currencyCode: true,
              },
              donor: {
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
        const donorId = normalizeString(gift.donor?.id);

        if (donorId === '' || !giftsByDonorId.has(donorId)) {
          continue;
        }

        giftsByDonorId.get(donorId)?.push(gift);
      }

      hasNextPage = giftConnection.pageInfo?.hasNextPage === true;
      cursor =
        typeof giftConnection.pageInfo?.endCursor === 'string'
          ? giftConnection.pageInfo.endCursor
          : undefined;
    }
  }

  return giftsByDonorId;
};

const loadAllCommittedGifts = async (
  client: CoreApiClient,
): Promise<Map<string, GiftRecord[]>> => {
  const giftsByDonorId = new Map<string, GiftRecord[]>();
  let hasNextPage = true;
  let cursor: string | undefined;

  while (hasNextPage) {
    const result = await client.query({
      gifts: {
        __args: {
          first: GIFT_QUERY_PAGE_SIZE,
          ...(cursor ? { after: cursor } : {}),
          filter: {
            donorId: {
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
            reportingAmount: {
              amountMicros: true,
              currencyCode: true,
            },
            donor: {
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
      const donorId = normalizeString(gift.donor?.id);

      if (donorId === '') {
        continue;
      }

      const donorGifts = giftsByDonorId.get(donorId) ?? [];
      donorGifts.push(gift);
      giftsByDonorId.set(donorId, donorGifts);
    }

    hasNextPage = giftConnection.pageInfo?.hasNextPage === true;
    cursor =
      typeof giftConnection.pageInfo?.endCursor === 'string'
        ? giftConnection.pageInfo.endCursor
        : undefined;
  }

  return giftsByDonorId;
};

const loadDonorIdsWithExistingRollups = async (
  client: CoreApiClient,
): Promise<string[]> => {
  const donorIds = new Set<string>();
  let hasNextPage = true;
  let cursor: string | undefined;

  while (hasNextPage) {
    const result = await client.query({
      people: {
        __args: {
          first: GIFT_QUERY_PAGE_SIZE,
          ...(cursor ? { after: cursor } : {}),
          filter: buildDonorExistingRollupsFilter(),
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

    const peopleConnection = extractConnection<{ id: string }>(result, 'people');
    const people = peopleConnection.edges.map((edge) => edge.node);

    for (const person of people) {
      const donorId = normalizeString(person.id);

      if (donorId !== '') {
        donorIds.add(donorId);
      }
    }

    hasNextPage = peopleConnection.pageInfo?.hasNextPage === true;
    cursor =
      typeof peopleConnection.pageInfo?.endCursor === 'string'
        ? peopleConnection.pageInfo.endCursor
        : undefined;
  }

  return [...donorIds];
};

const persistDonorRollupWritebacks = async (writebacks: DonorRollupWriteback[]) => {
  for (const chunk of chunkArray(writebacks, PERSON_WRITEBACK_CHUNK_SIZE)) {
    const response = await postTwentyRest<unknown>({
      path: '/rest/batch/people?upsert=true&depth=0',
      body: chunk,
    });

    const people =
      response &&
      typeof response === 'object' &&
      Array.isArray(
        (response as { data?: { createPeople?: Array<{ id?: unknown }> } }).data
          ?.createPeople,
      )
        ? (
            response as { data?: { createPeople?: Array<{ id?: unknown }> } }
          ).data?.createPeople ?? []
        : [];

    const returnedIds = new Set(
      people
        .map((person) =>
          typeof person?.id === 'string' ? person.id.trim() : undefined,
        )
        .filter((id): id is string => Boolean(id)),
    );

    for (const writeback of chunk) {
      if (!returnedIds.has(writeback.id)) {
        throw new Error(`Batch donor rollup writeback missing id ${writeback.id}`);
      }
    }
  }
};

export const collectDonorIds = (donorIds: Array<string | null | undefined>) =>
  Array.from(
    new Set(
      donorIds
        .map((donorId) => normalizeString(donorId))
        .filter((donorId) => donorId !== ''),
    ),
  );

export const recomputeDonorRollups = async (
  client: CoreApiClient,
  donorIds: Array<string | null | undefined>,
) => {
  const normalizedDonorIds = collectDonorIds(donorIds);

  if (normalizedDonorIds.length === 0) {
    return {
      scannedDonorCount: 0,
      updatedDonorCount: 0,
    };
  }

  const [peopleById, giftsByDonorId] = await Promise.all([
    loadPeopleByIds(client, normalizedDonorIds),
    loadCommittedGiftsForDonors(client, normalizedDonorIds),
  ]);
  const writebacks: DonorRollupWriteback[] = [];

  for (const donorId of normalizedDonorIds) {
    const currentPerson = peopleById.get(donorId);

    if (!currentPerson) {
      continue;
    }

    const nextSummary = computeDonorRollupSummary(
      donorId,
      giftsByDonorId.get(donorId) ?? [],
      currentPerson,
    );

    if (areSummariesEqual(currentPerson, nextSummary)) {
      continue;
    }

    writebacks.push({
      id: donorId,
      lifetimeGiftAmount: nextSummary.lifetimeGiftAmount,
      giftCount: nextSummary.giftCount,
      firstGiftDate: nextSummary.firstGiftDate,
      lastGiftDate: nextSummary.lastGiftDate,
      lastGiftAmount: nextSummary.lastGiftAmount,
      largestGiftAmount: nextSummary.largestGiftAmount,
    });
  }

  if (writebacks.length > 0) {
    await persistDonorRollupWritebacks(writebacks);
  }

  return {
    scannedDonorCount: normalizedDonorIds.length,
    updatedDonorCount: writebacks.length,
  };
};

export const recomputeAllDonorRollups = async (client: CoreApiClient) => {
  const [giftsByDonorId, donorIdsWithExistingRollups] = await Promise.all([
    loadAllCommittedGifts(client),
    loadDonorIdsWithExistingRollups(client),
  ]);

  const donorIds = collectDonorIds([
    ...giftsByDonorId.keys(),
    ...donorIdsWithExistingRollups,
  ]);

  return recomputeDonorRollups(client, donorIds);
};

export const getAffectedDonorIdsFromGiftUpdate = (
  event: ObjectRecordUpdateEvent<GiftEventRecord>,
) =>
  collectDonorIds([
    event.properties.before?.donorId,
    event.properties.after?.donorId,
  ]);

export const getAffectedDonorIdsFromGiftDelete = (
  event: ObjectRecordDeleteEvent<GiftEventRecord>,
) =>
  collectDonorIds([
    event.properties.before?.donorId,
    event.properties.after?.donorId,
  ]);

export const getAffectedDonorIdsFromGiftRestore = (
  event: ObjectRecordRestoreEvent<GiftEventRecord>,
) =>
  collectDonorIds([
    event.properties.before?.donorId,
    event.properties.after?.donorId,
  ]);
