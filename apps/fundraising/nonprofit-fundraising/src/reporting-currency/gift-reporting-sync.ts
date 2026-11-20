import { CoreApiClient } from 'twenty-client-sdk/core';
import { postTwentyRest } from 'src/app-api/twenty-rest-client';
import { extractConnection } from 'src/core-api/core-api-results';
import {
  hasSameReportingValue,
  resolveGiftReportingValue,
  type GiftReportingInput,
} from 'src/reporting-currency/gift-reporting-value';
import { getReportingCurrencyCode } from 'src/reporting-currency/reporting-currency';
import { chunkArray } from 'src/utils/chunk-array';

type GiftReportingRecord = GiftReportingInput & { id: string };

const PAGE_SIZE = 200;
const WRITE_CHUNK_SIZE = 60;

const MONEY_SELECTION = { amountMicros: true, currencyCode: true };

const GIFT_REPORTING_SELECTION = {
  id: true,
  amount: MONEY_SELECTION,
  reportingAmount: MONEY_SELECTION,
  reportingAmountStatus: true,
  grossPaymentAmount: MONEY_SELECTION,
};

const loadGiftPage = async (
  client: CoreApiClient,
  filter: Record<string, unknown> | undefined,
  after: string | undefined,
) => {
  const result = await client.query({
    gifts: {
      __args: {
        first: PAGE_SIZE,
        ...(filter ? { filter } : {}),
        ...(after ? { after } : {}),
      },
      edges: { node: GIFT_REPORTING_SELECTION },
      pageInfo: { hasNextPage: true, endCursor: true },
    },
  } as any);
  const connection = extractConnection<GiftReportingRecord>(result, 'gifts');

  return {
    gifts: connection.edges.map((edge) => edge.node),
    nextCursor:
      connection.pageInfo?.hasNextPage === true &&
      typeof connection.pageInfo.endCursor === 'string'
        ? connection.pageInfo.endCursor
        : undefined,
  };
};

const writeChangedReportingValues = async (
  gifts: GiftReportingRecord[],
  reportingCurrencyCode: string,
) => {
  const changes = gifts.flatMap((gift) => {
    const next = resolveGiftReportingValue(gift, reportingCurrencyCode);

    return hasSameReportingValue(gift, next)
      ? []
      : [
          {
            id: gift.id,
            reportingAmount: next.reportingAmount ?? {
              amountMicros: null,
              currencyCode: null,
            },
            reportingAmountStatus: next.reportingAmountStatus,
          },
        ];
  });

  for (const changeChunk of chunkArray(changes, WRITE_CHUNK_SIZE)) {
    await postTwentyRest<unknown>({
      path: '/rest/batch/gifts?upsert=true&depth=0',
      body: changeChunk,
    });
  }

  return changes.length;
};

// Gifts are reloaded rather than read from event payloads, so a partial
// payload can never clear a value. Without a reporting currency nothing runs.
export const syncGiftReportingValues = async (giftIds: string[]) => {
  const reportingCurrencyCode = getReportingCurrencyCode();
  const uniqueIds = [...new Set(giftIds.filter((id) => id !== ''))];

  if (!reportingCurrencyCode || uniqueIds.length === 0) {
    return { checkedCount: 0, updatedCount: 0, reportingCurrencyCode };
  }

  const client = new CoreApiClient();
  let updatedCount = 0;

  for (const idChunk of chunkArray(uniqueIds, PAGE_SIZE)) {
    const { gifts } = await loadGiftPage(
      client,
      { or: idChunk.map((id) => ({ id: { eq: id } })) },
      undefined,
    );

    updatedCount += await writeChangedReportingValues(
      gifts,
      reportingCurrencyCode,
    );
  }

  return {
    checkedCount: uniqueIds.length,
    updatedCount,
    reportingCurrencyCode,
  };
};

export const backfillAllGiftReportingValues = async () => {
  const reportingCurrencyCode = getReportingCurrencyCode();

  if (!reportingCurrencyCode) {
    throw new Error(
      'Set the REPORTING_CURRENCY app setting before backfilling reporting amounts.',
    );
  }

  const client = new CoreApiClient();
  let checkedCount = 0;
  let updatedCount = 0;
  let cursor: string | undefined;

  do {
    const page = await loadGiftPage(client, undefined, cursor);

    checkedCount += page.gifts.length;
    updatedCount += await writeChangedReportingValues(
      page.gifts,
      reportingCurrencyCode,
    );
    cursor = page.nextCursor;
  } while (cursor);

  return { checkedCount, updatedCount, reportingCurrencyCode };
};
