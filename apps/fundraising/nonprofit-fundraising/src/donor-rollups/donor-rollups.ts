import { CoreApiClient } from 'twenty-client-sdk/core';
import type {
  DatabaseEventPayload,
  ObjectRecordDeleteEvent,
  ObjectRecordRestoreEvent,
  ObjectRecordUpdateEvent,
} from 'twenty-sdk/define';

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
  amount?: CurrencyAmount | null;
  donor?: {
    id?: string | null;
  } | null;
};

type PersonRollupRecord = {
  id: string;
  lifetimeGiftAmount?: CurrencyAmount | null;
  lifetimeGiftCount?: number | null;
  lastGiftDate?: string | null;
};

type DonorRollupSummary = {
  donorId: string;
  lifetimeGiftAmount: {
    amountMicros: number;
    currencyCode: string;
  };
  lifetimeGiftCount: number;
  lastGiftDate: string | null;
};

type DonorRollupWriteback = {
  id: string;
  lifetimeGiftAmount: {
    amountMicros: number;
    currencyCode: string;
  };
  lifetimeGiftCount: number;
  lastGiftDate: string | null;
};

type GiftEventRecord = {
  donorId?: string | null;
  giftDate?: string | null;
  amount?: CurrencyAmount | null;
};

const normalizeString = (value: string | null | undefined) =>
  typeof value === 'string' ? value.trim() : '';

const normalizeCurrencyCode = (value: string | null | undefined) => {
  const normalized = normalizeString(value).toUpperCase();

  return normalized === '' ? 'GBP' : normalized;
};

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

const getRestConfig = () => {
  const apiBaseUrl = process.env.TWENTY_API_URL;
  const token =
    process.env.TWENTY_APP_ACCESS_TOKEN ?? process.env.TWENTY_API_KEY;

  if (!apiBaseUrl || !token) {
    throw new Error('Twenty REST configuration missing');
  }

  return {
    apiBaseUrl: apiBaseUrl.replace(/\/$/, ''),
    token,
  };
};

const requestTwentyRest = async <T>({
  path,
  method,
  body,
}: {
  path: string;
  method: 'POST';
  body: unknown;
}): Promise<T> => {
  const { apiBaseUrl, token } = getRestConfig();
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const rawBody = await response.text();

  if (!response.ok) {
    throw new Error(rawBody || `Twenty REST request failed with ${response.status}`);
  }

  if (rawBody.trim() === '') {
    return null as T;
  }

  return JSON.parse(rawBody) as T;
};

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
  areAmountsEqual(current.lifetimeGiftAmount, next.lifetimeGiftAmount) &&
  Math.round(current.lifetimeGiftCount ?? 0) === next.lifetimeGiftCount &&
  normalizeString(current.lastGiftDate) === normalizeString(next.lastGiftDate);

export const computeDonorRollupSummary = (
  donorId: string,
  gifts: GiftRecord[],
  currentPerson?: PersonRollupRecord,
): DonorRollupSummary => {
  const sortedByGiftDate = [...gifts].sort((left, right) =>
    normalizeString(right.giftDate).localeCompare(normalizeString(left.giftDate)),
  );
  const currencyCode =
    normalizeCurrencyCode(sortedByGiftDate[0]?.amount?.currencyCode) ||
    normalizeCurrencyCode(currentPerson?.lifetimeGiftAmount?.currencyCode);

  return {
    donorId,
    lifetimeGiftAmount: {
      amountMicros: gifts.reduce(
        (sum, gift) => sum + Math.round(gift.amount?.amountMicros ?? 0),
        0,
      ),
      currencyCode,
    },
    lifetimeGiftCount: gifts.length,
    lastGiftDate: normalizeString(sortedByGiftDate[0]?.giftDate) || null,
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
            lifetimeGiftCount: true,
            lastGiftDate: true,
          },
        },
      },
    } as any);

    const people =
      result?.people?.edges?.map(
        (edge: { node: PersonRollupRecord }) => edge.node,
      ) ?? [];

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
              amount: {
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

      const gifts =
        result?.gifts?.edges?.map((edge: { node: GiftRecord }) => edge.node) ??
        [];

      for (const gift of gifts) {
        const donorId = normalizeString(gift.donor?.id);

        if (donorId === '' || !giftsByDonorId.has(donorId)) {
          continue;
        }

        giftsByDonorId.get(donorId)?.push(gift);
      }

      hasNextPage = result?.gifts?.pageInfo?.hasNextPage === true;
      cursor =
        typeof result?.gifts?.pageInfo?.endCursor === 'string'
          ? result.gifts.pageInfo.endCursor
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
            amount: {
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

    const gifts =
      result?.gifts?.edges?.map((edge: { node: GiftRecord }) => edge.node) ??
      [];

    for (const gift of gifts) {
      const donorId = normalizeString(gift.donor?.id);

      if (donorId === '') {
        continue;
      }

      const donorGifts = giftsByDonorId.get(donorId) ?? [];
      donorGifts.push(gift);
      giftsByDonorId.set(donorId, donorGifts);
    }

    hasNextPage = result?.gifts?.pageInfo?.hasNextPage === true;
    cursor =
      typeof result?.gifts?.pageInfo?.endCursor === 'string'
        ? result.gifts.pageInfo.endCursor
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
          filter: {
            or: [
              {
                lifetimeGiftCount: {
                  gt: 0,
                },
              },
              {
                lastGiftDate: {
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

    const people =
      result?.people?.edges?.map((edge: { node: { id: string } }) => edge.node) ??
      [];

    for (const person of people) {
      const donorId = normalizeString(person.id);

      if (donorId !== '') {
        donorIds.add(donorId);
      }
    }

    hasNextPage = result?.people?.pageInfo?.hasNextPage === true;
    cursor =
      typeof result?.people?.pageInfo?.endCursor === 'string'
        ? result.people.pageInfo.endCursor
        : undefined;
  }

  return [...donorIds];
};

const persistDonorRollupWritebacks = async (writebacks: DonorRollupWriteback[]) => {
  for (const chunk of chunkArray(writebacks, PERSON_WRITEBACK_CHUNK_SIZE)) {
    const response = await requestTwentyRest<unknown>({
      path: '/rest/batch/people?upsert=true&depth=0',
      method: 'POST',
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
      lifetimeGiftCount: nextSummary.lifetimeGiftCount,
      lastGiftDate: nextSummary.lastGiftDate,
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
  event: DatabaseEventPayload<ObjectRecordUpdateEvent<GiftEventRecord>>,
) =>
  collectDonorIds([
    event.properties.before?.donorId,
    event.properties.after?.donorId,
  ]);

export const getAffectedDonorIdsFromGiftDelete = (
  event: DatabaseEventPayload<ObjectRecordDeleteEvent<GiftEventRecord>>,
) =>
  collectDonorIds([
    event.properties.before?.donorId,
    event.properties.after?.donorId,
  ]);

export const getAffectedDonorIdsFromGiftRestore = (
  event: DatabaseEventPayload<ObjectRecordRestoreEvent<GiftEventRecord>>,
) =>
  collectDonorIds([
    event.properties.before?.donorId,
    event.properties.after?.donorId,
  ]);
