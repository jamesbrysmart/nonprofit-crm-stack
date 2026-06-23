import { CoreApiClient } from 'twenty-client-sdk/core';
import { postTwentyRest } from 'src/app-api/twenty-rest-client';
import {
  extractConnection,
  extractConnectionNodes,
} from 'src/core-api/core-api-results';
import type {
  DatabaseEventPayload,
  ObjectRecordCreateEvent,
  ObjectRecordDeleteEvent,
  ObjectRecordRestoreEvent,
  ObjectRecordUpdateEvent,
} from 'twenty-sdk/define';

const COMPANY_QUERY_CHUNK_SIZE = 25;
const RECORD_QUERY_PAGE_SIZE = 200;
const COMPANY_WRITEBACK_CHUNK_SIZE = 60;

type CurrencyAmount = {
  amountMicros?: number | null;
  currencyCode?: string | null;
};

type GiftRecord = {
  id: string;
  giftDate?: string | null;
  giftType?: string | null;
  amount?: CurrencyAmount | null;
  company?: {
    id?: string | null;
  } | null;
};

type OpportunityRecord = {
  id: string;
  applicationDeadline?: string | null;
  fundingPeriodEnd?: string | null;
  awardedAmount?: CurrencyAmount | null;
  company?: {
    id?: string | null;
  } | null;
};

type CompanyRollupRecord = {
  id: string;
  lifetimeGiftAmount?: CurrencyAmount | null;
  lastGiftDate?: string | null;
  awardedOpportunityAmount?: CurrencyAmount | null;
  awardedOpportunityCount?: number | null;
  nextApplicationDeadline?: string | null;
  nextFundingPeriodEnd?: string | null;
};

type CompanyRollupSummary = {
  companyId: string;
  lifetimeGiftAmount: CurrencyAmount;
  lastGiftDate: string | null;
  awardedOpportunityAmount: CurrencyAmount;
  awardedOpportunityCount: number;
  nextApplicationDeadline: string | null;
  nextFundingPeriodEnd: string | null;
};

type CompanyRollupWriteback = {
  id: string;
  lifetimeGiftAmount: CurrencyAmount;
  lastGiftDate: string | null;
  awardedOpportunityAmount: CurrencyAmount;
  awardedOpportunityCount: number;
  nextApplicationDeadline: string | null;
  nextFundingPeriodEnd: string | null;
};

type GiftCompanyEventRecord = {
  companyId?: string | null;
  giftDate?: string | null;
  giftType?: string | null;
  amount?: CurrencyAmount | null;
};

type OpportunityCompanyEventRecord = {
  companyId?: string | null;
  awardedAmount?: CurrencyAmount | null;
  applicationDeadline?: string | null;
  fundingPeriodEnd?: string | null;
};

const normalizeString = (value: string | null | undefined) =>
  typeof value === 'string' ? value.trim() : '';

const normalizeCurrencyCode = (value: string | null | undefined) => {
  const normalized = normalizeString(value).toUpperCase();

  return normalized === '' ? 'GBP' : normalized;
};

const normalizeDate = (value: string | null | undefined) =>
  normalizeString(value).split('T')[0] || null;

const includeInCashRollups = (giftType: string | null | undefined) =>
  normalizeString(giftType).toUpperCase() !== 'GIFT_IN_KIND';

const isPopulatedAmount = (amount: CurrencyAmount | null | undefined) =>
  Math.round(amount?.amountMicros ?? 0) !== 0;

const todayIsoDate = () => new Date().toISOString().split('T')[0];

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

const buildOrCompanyFilter = (companyIds: string[]) => ({
  or: companyIds.map((companyId) => ({
    companyId: {
      eq: companyId,
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
  current: CompanyRollupRecord,
  next: CompanyRollupSummary,
) =>
  areAmountsEqual(current.lifetimeGiftAmount, next.lifetimeGiftAmount) &&
  normalizeString(current.lastGiftDate) === normalizeString(next.lastGiftDate) &&
  areAmountsEqual(
    current.awardedOpportunityAmount,
    next.awardedOpportunityAmount,
  ) &&
  Math.round(current.awardedOpportunityCount ?? 0) ===
    next.awardedOpportunityCount &&
  normalizeString(current.nextApplicationDeadline) ===
    normalizeString(next.nextApplicationDeadline) &&
  normalizeString(current.nextFundingPeriodEnd) ===
    normalizeString(next.nextFundingPeriodEnd);

const findNearestFutureDate = (dates: Array<string | null | undefined>) => {
  const today = todayIsoDate();

  return (
    dates
      .map(normalizeDate)
      .filter((date): date is string => date !== null && date >= today)
      .sort()[0] ?? null
  );
};

export const computeCompanyRollupSummary = (
  companyId: string,
  gifts: GiftRecord[],
  opportunities: OpportunityRecord[],
  currentCompany?: CompanyRollupRecord,
): CompanyRollupSummary => {
  const includedGifts = gifts.filter((gift) =>
    includeInCashRollups(gift.giftType),
  );
  const sortedByGiftDate = [...includedGifts].sort((left, right) =>
    normalizeString(right.giftDate).localeCompare(normalizeString(left.giftDate)),
  );
  const cashCurrencyCode =
    normalizeCurrencyCode(sortedByGiftDate[0]?.amount?.currencyCode) ||
    normalizeCurrencyCode(currentCompany?.lifetimeGiftAmount?.currencyCode);
  const awardedOpportunities = opportunities.filter((opportunity) =>
    isPopulatedAmount(opportunity.awardedAmount),
  );
  const awardedCurrencyCode =
    normalizeCurrencyCode(
      awardedOpportunities[0]?.awardedAmount?.currencyCode,
    ) ||
    normalizeCurrencyCode(
      currentCompany?.awardedOpportunityAmount?.currencyCode,
    );

  return {
    companyId,
    lifetimeGiftAmount: {
      amountMicros: includedGifts.reduce(
        (sum, gift) => sum + Math.round(gift.amount?.amountMicros ?? 0),
        0,
      ),
      currencyCode: cashCurrencyCode,
    },
    lastGiftDate: normalizeDate(sortedByGiftDate[0]?.giftDate),
    awardedOpportunityAmount: {
      amountMicros: awardedOpportunities.reduce(
        (sum, opportunity) =>
          sum + Math.round(opportunity.awardedAmount?.amountMicros ?? 0),
        0,
      ),
      currencyCode: awardedCurrencyCode,
    },
    awardedOpportunityCount: awardedOpportunities.length,
    nextApplicationDeadline: findNearestFutureDate(
      opportunities.map((opportunity) => opportunity.applicationDeadline),
    ),
    nextFundingPeriodEnd: findNearestFutureDate(
      opportunities.map((opportunity) => opportunity.fundingPeriodEnd),
    ),
  };
};

const loadCompaniesByIds = async (
  client: CoreApiClient,
  companyIds: string[],
): Promise<Map<string, CompanyRollupRecord>> => {
  const companiesById = new Map<string, CompanyRollupRecord>();

  for (const chunk of chunkArray(companyIds, COMPANY_QUERY_CHUNK_SIZE)) {
    const result = await client.query({
      companies: {
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
            lastGiftDate: true,
            awardedOpportunityAmount: {
              amountMicros: true,
              currencyCode: true,
            },
            awardedOpportunityCount: true,
            nextApplicationDeadline: true,
            nextFundingPeriodEnd: true,
          },
        },
      },
    } as any);

    const companies = extractConnectionNodes<CompanyRollupRecord>(
      result,
      'companies',
    );

    for (const company of companies) {
      companiesById.set(company.id, company);
    }
  }

  return companiesById;
};

const loadCommittedGiftsForCompanies = async (
  client: CoreApiClient,
  companyIds: string[],
): Promise<Map<string, GiftRecord[]>> => {
  const giftsByCompanyId = new Map<string, GiftRecord[]>();

  companyIds.forEach((companyId) => {
    giftsByCompanyId.set(companyId, []);
  });

  for (const chunk of chunkArray(companyIds, COMPANY_QUERY_CHUNK_SIZE)) {
    let hasNextPage = true;
    let cursor: string | undefined;

    while (hasNextPage) {
      const result = await client.query({
        gifts: {
          __args: {
            first: RECORD_QUERY_PAGE_SIZE,
            ...(cursor ? { after: cursor } : {}),
            filter: buildOrCompanyFilter(chunk),
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
        const companyId = normalizeString(gift.company?.id);

        if (companyId === '' || !giftsByCompanyId.has(companyId)) {
          continue;
        }

        giftsByCompanyId.get(companyId)?.push(gift);
      }

      hasNextPage = giftConnection.pageInfo?.hasNextPage === true;
      cursor =
        typeof giftConnection.pageInfo?.endCursor === 'string'
          ? giftConnection.pageInfo.endCursor
          : undefined;
    }
  }

  return giftsByCompanyId;
};

const loadOpportunitiesForCompanies = async (
  client: CoreApiClient,
  companyIds: string[],
): Promise<Map<string, OpportunityRecord[]>> => {
  const opportunitiesByCompanyId = new Map<string, OpportunityRecord[]>();

  companyIds.forEach((companyId) => {
    opportunitiesByCompanyId.set(companyId, []);
  });

  for (const chunk of chunkArray(companyIds, COMPANY_QUERY_CHUNK_SIZE)) {
    let hasNextPage = true;
    let cursor: string | undefined;

    while (hasNextPage) {
      const result = await client.query({
        opportunities: {
          __args: {
            first: RECORD_QUERY_PAGE_SIZE,
            ...(cursor ? { after: cursor } : {}),
            filter: buildOrCompanyFilter(chunk),
          },
          edges: {
            node: {
              id: true,
              applicationDeadline: true,
              fundingPeriodEnd: true,
              awardedAmount: {
                amountMicros: true,
                currencyCode: true,
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

      const opportunityConnection = extractConnection<OpportunityRecord>(
        result,
        'opportunities',
      );
      const opportunities = opportunityConnection.edges.map((edge) => edge.node);

      for (const opportunity of opportunities) {
        const companyId = normalizeString(opportunity.company?.id);

        if (companyId === '' || !opportunitiesByCompanyId.has(companyId)) {
          continue;
        }

        opportunitiesByCompanyId.get(companyId)?.push(opportunity);
      }

      hasNextPage = opportunityConnection.pageInfo?.hasNextPage === true;
      cursor =
        typeof opportunityConnection.pageInfo?.endCursor === 'string'
          ? opportunityConnection.pageInfo.endCursor
          : undefined;
    }
  }

  return opportunitiesByCompanyId;
};

const loadAllCommittedGifts = async (
  client: CoreApiClient,
): Promise<Map<string, GiftRecord[]>> => {
  const giftsByCompanyId = new Map<string, GiftRecord[]>();
  let hasNextPage = true;
  let cursor: string | undefined;

  while (hasNextPage) {
    const result = await client.query({
      gifts: {
        __args: {
          first: RECORD_QUERY_PAGE_SIZE,
          ...(cursor ? { after: cursor } : {}),
          filter: {
            companyId: {
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
      const companyId = normalizeString(gift.company?.id);

      if (companyId === '') {
        continue;
      }

      const companyGifts = giftsByCompanyId.get(companyId) ?? [];
      companyGifts.push(gift);
      giftsByCompanyId.set(companyId, companyGifts);
    }

    hasNextPage = giftConnection.pageInfo?.hasNextPage === true;
    cursor =
      typeof giftConnection.pageInfo?.endCursor === 'string'
        ? giftConnection.pageInfo.endCursor
        : undefined;
  }

  return giftsByCompanyId;
};

const loadAllOpportunities = async (
  client: CoreApiClient,
): Promise<Map<string, OpportunityRecord[]>> => {
  const opportunitiesByCompanyId = new Map<string, OpportunityRecord[]>();
  let hasNextPage = true;
  let cursor: string | undefined;

  while (hasNextPage) {
    const result = await client.query({
      opportunities: {
        __args: {
          first: RECORD_QUERY_PAGE_SIZE,
          ...(cursor ? { after: cursor } : {}),
          filter: {
            companyId: {
              is: 'NOT_NULL',
            },
          },
        },
        edges: {
          node: {
            id: true,
            applicationDeadline: true,
            fundingPeriodEnd: true,
            awardedAmount: {
              amountMicros: true,
              currencyCode: true,
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

    const opportunityConnection = extractConnection<OpportunityRecord>(
      result,
      'opportunities',
    );
    const opportunities = opportunityConnection.edges.map((edge) => edge.node);

    for (const opportunity of opportunities) {
      const companyId = normalizeString(opportunity.company?.id);

      if (companyId === '') {
        continue;
      }

      const companyOpportunities =
        opportunitiesByCompanyId.get(companyId) ?? [];
      companyOpportunities.push(opportunity);
      opportunitiesByCompanyId.set(companyId, companyOpportunities);
    }

    hasNextPage = opportunityConnection.pageInfo?.hasNextPage === true;
    cursor =
      typeof opportunityConnection.pageInfo?.endCursor === 'string'
        ? opportunityConnection.pageInfo.endCursor
        : undefined;
  }

  return opportunitiesByCompanyId;
};

const loadCompanyIdsWithExistingRollups = async (
  client: CoreApiClient,
): Promise<string[]> => {
  const companyIds = new Set<string>();
  let hasNextPage = true;
  let cursor: string | undefined;

  while (hasNextPage) {
    const result = await client.query({
      companies: {
        __args: {
          first: RECORD_QUERY_PAGE_SIZE,
          ...(cursor ? { after: cursor } : {}),
          filter: {
            or: [
              {
                lastGiftDate: {
                  is: 'NOT_NULL',
                },
              },
              {
                awardedOpportunityCount: {
                  gt: 0,
                },
              },
              {
                nextApplicationDeadline: {
                  is: 'NOT_NULL',
                },
              },
              {
                nextFundingPeriodEnd: {
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

    const companyConnection = extractConnection<{ id: string }>(
      result,
      'companies',
    );
    const companies = companyConnection.edges.map((edge) => edge.node);

    for (const company of companies) {
      const companyId = normalizeString(company.id);

      if (companyId !== '') {
        companyIds.add(companyId);
      }
    }

    hasNextPage = companyConnection.pageInfo?.hasNextPage === true;
    cursor =
      typeof companyConnection.pageInfo?.endCursor === 'string'
        ? companyConnection.pageInfo.endCursor
        : undefined;
  }

  return [...companyIds];
};

const persistCompanyRollupWritebacks = async (
  writebacks: CompanyRollupWriteback[],
) => {
  for (const chunk of chunkArray(writebacks, COMPANY_WRITEBACK_CHUNK_SIZE)) {
    const response = await postTwentyRest<unknown>({
      path: '/rest/batch/companies?upsert=true&depth=0',
      body: chunk,
    });

    const companies =
      response &&
      typeof response === 'object' &&
      Array.isArray(
        (response as { data?: { createCompanies?: Array<{ id?: unknown }> } })
          .data?.createCompanies,
      )
        ? (
            response as { data?: { createCompanies?: Array<{ id?: unknown }> } }
          ).data?.createCompanies ?? []
        : [];

    const returnedIds = new Set(
      companies
        .map((company) =>
          typeof company?.id === 'string' ? company.id.trim() : undefined,
        )
        .filter((id): id is string => Boolean(id)),
    );

    for (const writeback of chunk) {
      if (!returnedIds.has(writeback.id)) {
        throw new Error(
          `Batch company rollup writeback missing id ${writeback.id}`,
        );
      }
    }
  }
};

export const collectCompanyIds = (
  companyIds: Array<string | null | undefined>,
) =>
  Array.from(
    new Set(
      companyIds
        .map((companyId) => normalizeString(companyId))
        .filter((companyId) => companyId !== ''),
    ),
  );

export const recomputeCompanyRollups = async (
  client: CoreApiClient,
  companyIds: Array<string | null | undefined>,
) => {
  const normalizedCompanyIds = collectCompanyIds(companyIds);

  if (normalizedCompanyIds.length === 0) {
    return {
      scannedCompanyCount: 0,
      updatedCompanyCount: 0,
    };
  }

  const [companiesById, giftsByCompanyId, opportunitiesByCompanyId] =
    await Promise.all([
      loadCompaniesByIds(client, normalizedCompanyIds),
      loadCommittedGiftsForCompanies(client, normalizedCompanyIds),
      loadOpportunitiesForCompanies(client, normalizedCompanyIds),
    ]);
  const writebacks: CompanyRollupWriteback[] = [];

  for (const companyId of normalizedCompanyIds) {
    const currentCompany = companiesById.get(companyId);

    if (!currentCompany) {
      continue;
    }

    const nextSummary = computeCompanyRollupSummary(
      companyId,
      giftsByCompanyId.get(companyId) ?? [],
      opportunitiesByCompanyId.get(companyId) ?? [],
      currentCompany,
    );

    if (areSummariesEqual(currentCompany, nextSummary)) {
      continue;
    }

    writebacks.push({
      id: companyId,
      lifetimeGiftAmount: nextSummary.lifetimeGiftAmount,
      lastGiftDate: nextSummary.lastGiftDate,
      awardedOpportunityAmount: nextSummary.awardedOpportunityAmount,
      awardedOpportunityCount: nextSummary.awardedOpportunityCount,
      nextApplicationDeadline: nextSummary.nextApplicationDeadline,
      nextFundingPeriodEnd: nextSummary.nextFundingPeriodEnd,
    });
  }

  if (writebacks.length > 0) {
    await persistCompanyRollupWritebacks(writebacks);
  }

  return {
    scannedCompanyCount: normalizedCompanyIds.length,
    updatedCompanyCount: writebacks.length,
  };
};

export const recomputeAllCompanyRollups = async (client: CoreApiClient) => {
  const [
    giftsByCompanyId,
    opportunitiesByCompanyId,
    companyIdsWithExistingRollups,
  ] = await Promise.all([
    loadAllCommittedGifts(client),
    loadAllOpportunities(client),
    loadCompanyIdsWithExistingRollups(client),
  ]);

  const companyIds = collectCompanyIds([
    ...giftsByCompanyId.keys(),
    ...opportunitiesByCompanyId.keys(),
    ...companyIdsWithExistingRollups,
  ]);

  return recomputeCompanyRollups(client, companyIds);
};

export const getAffectedCompanyIdsFromGiftCreate = (
  event: DatabaseEventPayload<ObjectRecordCreateEvent<GiftCompanyEventRecord>>,
) => collectCompanyIds([event.properties.after?.companyId]);

export const getAffectedCompanyIdsFromGiftUpdate = (
  event: DatabaseEventPayload<ObjectRecordUpdateEvent<GiftCompanyEventRecord>>,
) =>
  collectCompanyIds([
    event.properties.before?.companyId,
    event.properties.after?.companyId,
  ]);

export const getAffectedCompanyIdsFromGiftDelete = (
  event: DatabaseEventPayload<ObjectRecordDeleteEvent<GiftCompanyEventRecord>>,
) =>
  collectCompanyIds([
    event.properties.before?.companyId,
    event.properties.after?.companyId,
  ]);

export const getAffectedCompanyIdsFromGiftRestore = (
  event: DatabaseEventPayload<ObjectRecordRestoreEvent<GiftCompanyEventRecord>>,
) =>
  collectCompanyIds([
    event.properties.before?.companyId,
    event.properties.after?.companyId,
  ]);

export const getAffectedCompanyIdsFromOpportunityCreate = (
  event: DatabaseEventPayload<
    ObjectRecordCreateEvent<OpportunityCompanyEventRecord>
  >,
) => collectCompanyIds([event.properties.after?.companyId]);

export const getAffectedCompanyIdsFromOpportunityUpdate = (
  event: DatabaseEventPayload<
    ObjectRecordUpdateEvent<OpportunityCompanyEventRecord>
  >,
) =>
  collectCompanyIds([
    event.properties.before?.companyId,
    event.properties.after?.companyId,
  ]);

export const getAffectedCompanyIdsFromOpportunityDelete = (
  event: DatabaseEventPayload<
    ObjectRecordDeleteEvent<OpportunityCompanyEventRecord>
  >,
) =>
  collectCompanyIds([
    event.properties.before?.companyId,
    event.properties.after?.companyId,
  ]);

export const getAffectedCompanyIdsFromOpportunityRestore = (
  event: DatabaseEventPayload<
    ObjectRecordRestoreEvent<OpportunityCompanyEventRecord>
  >,
) =>
  collectCompanyIds([
    event.properties.before?.companyId,
    event.properties.after?.companyId,
  ]);
