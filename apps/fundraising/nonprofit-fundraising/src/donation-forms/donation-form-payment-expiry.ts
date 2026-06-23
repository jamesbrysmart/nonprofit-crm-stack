import { CoreApiClient } from 'twenty-client-sdk/core';
import {
  extractConnection,
  extractConnectionNodes,
} from 'src/core-api/core-api-results';
import { persistGiftStagingBatchUpserts } from 'src/gift-staging/gift-staging-bulk-writeback';

const GIFT_STAGING_QUERY_PAGE_SIZE = 200;

type GiftStagingAwaitingPaymentRow = {
  id: string;
};

const normalizeString = (value: unknown) =>
  typeof value === 'string' ? value.trim() : '';

const buildAwaitingDonationFormPaymentFilter = () => ({
  and: [
    {
      intakeSource: {
        eq: 'donation_form',
      },
    },
    {
      paymentState: {
        eq: 'AWAITING_PAYMENT',
      },
    },
  ],
});

export const loadAwaitingDonationFormPaymentIds = async (
  client: CoreApiClient,
): Promise<string[]> => {
  const ids: string[] = [];
  let hasNextPage = true;
  let cursor: string | undefined;

  while (hasNextPage) {
    const result = await client.query({
      giftStagings: {
        __args: {
          first: GIFT_STAGING_QUERY_PAGE_SIZE,
          ...(cursor ? { after: cursor } : {}),
          filter: buildAwaitingDonationFormPaymentFilter(),
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

    const stagingConnection = extractConnection<GiftStagingAwaitingPaymentRow>(
      result,
      'giftStagings',
    );
    const pageRows = extractConnectionNodes<GiftStagingAwaitingPaymentRow>(
      result,
      'giftStagings',
    );

    ids.push(
      ...pageRows
        .map((row) => normalizeString(row.id))
        .filter((id): id is string => id !== ''),
    );

    hasNextPage = stagingConnection.pageInfo?.hasNextPage === true;
    cursor =
      typeof stagingConnection.pageInfo?.endCursor === 'string'
        ? stagingConnection.pageInfo.endCursor
        : undefined;
  }

  return ids;
};

export const expireAwaitingDonationFormPayments = async (
  client: CoreApiClient,
): Promise<{
  scannedCount: number;
  expiredCount: number;
}> => {
  const ids = await loadAwaitingDonationFormPaymentIds(client);

  if (ids.length > 0) {
    await persistGiftStagingBatchUpserts(
      ids.map((id) => ({
        id,
        paymentState: 'PAYMENT_EXPIRED',
      })),
      {
        allowedIds: new Set(ids),
      },
    );
  }

  return {
    scannedCount: ids.length,
    expiredCount: ids.length,
  };
};
