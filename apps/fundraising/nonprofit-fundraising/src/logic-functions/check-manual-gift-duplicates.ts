import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import type {
  ManualGiftDonorType,
  ManualGiftDuplicateCheckRequest,
  ManualGiftDuplicateCheckResponse,
  ManualGiftDuplicateMatch,
} from 'src/manual-gift-entry/manual-gift-entry.types';

const normalizeString = (value: string | undefined) => value?.trim() ?? '';

const normalizeCurrencyCode = (currencyCode: string | undefined) =>
  normalizeString(currencyCode).toUpperCase();

const parseAmountMicros = (amountValue: string | undefined) => {
  const parsed = Number.parseFloat(normalizeString(amountValue));

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return Math.round(parsed * 1_000_000);
};

const getDonorType = (
  donorType: ManualGiftDonorType | undefined,
): ManualGiftDonorType => {
  switch (donorType) {
    case 'COMPANY':
      return 'COMPANY';
    default:
      return 'INDIVIDUAL';
  }
};

const normalizeGiftDate = (giftDate: string | undefined) =>
  normalizeString(giftDate);

const buildCommittedGiftMatches = (
  gifts:
    | Array<{
        id: string;
        name?: string | null;
        giftDate?: string | null;
        amount?: {
          amountMicros?: number | null;
          currencyCode?: string | null;
        } | null;
      }>
    | undefined,
  targetAmountMicros: number,
  targetCurrencyCode: string,
): ManualGiftDuplicateMatch[] =>
  (gifts ?? [])
    .filter(
      (gift) =>
        gift.amount?.amountMicros === targetAmountMicros &&
        normalizeCurrencyCode(gift.amount?.currencyCode ?? undefined) ===
          targetCurrencyCode,
    )
    .map((gift) => ({
      kind: 'COMMITTED_GIFT',
      id: gift.id,
      name: normalizeString(gift.name ?? undefined) || 'Committed gift',
      giftDate: normalizeGiftDate(gift.giftDate ?? undefined),
      amountMicros: gift.amount?.amountMicros ?? targetAmountMicros,
      currencyCode:
        normalizeCurrencyCode(gift.amount?.currencyCode ?? undefined) ||
        targetCurrencyCode,
      status: 'PROCESSED',
    }));

const buildStagedGiftMatches = (
  rows:
    | Array<{
        id: string;
        name?: string | null;
        giftDate?: string | null;
        amount?: {
          amountMicros?: number | null;
          currencyCode?: string | null;
        } | null;
        processingStatus?: string | null;
        giftBatch?: {
          name?: string | null;
        } | null;
      }>
    | undefined,
  targetAmountMicros: number,
  targetCurrencyCode: string,
): ManualGiftDuplicateMatch[] =>
  (rows ?? [])
    .filter(
      (row) =>
        row.amount?.amountMicros === targetAmountMicros &&
        normalizeCurrencyCode(row.amount?.currencyCode ?? undefined) ===
          targetCurrencyCode,
    )
    .map((row) => ({
      kind: 'STAGED_GIFT',
      id: row.id,
      name: normalizeString(row.name ?? undefined) || 'Staged gift',
      giftDate: normalizeGiftDate(row.giftDate ?? undefined),
      amountMicros: row.amount?.amountMicros ?? targetAmountMicros,
      currencyCode:
        normalizeCurrencyCode(row.amount?.currencyCode ?? undefined) ||
        targetCurrencyCode,
      status: row.processingStatus ?? null,
      giftBatchName: row.giftBatch?.name ?? null,
    }));

const handler = async (
  event: RoutePayload<ManualGiftDuplicateCheckRequest>,
): Promise<ManualGiftDuplicateCheckResponse> => {
  const donorType = getDonorType(event.body?.donorType);
  const selectedDonorId = normalizeString(event.body?.selectedDonorId);
  const selectedCompanyId = normalizeString(event.body?.selectedCompanyId);
  const giftDate = normalizeGiftDate(event.body?.giftDate);
  const currencyCode = normalizeCurrencyCode(event.body?.currencyCode);
  const amountMicros = parseAmountMicros(event.body?.amountValue);

  if (
    giftDate === '' ||
    currencyCode === '' ||
    amountMicros === null ||
    (donorType === 'INDIVIDUAL' && selectedDonorId === '') ||
    (donorType === 'COMPANY' && selectedCompanyId === '')
  ) {
    return { matches: [] };
  }

  const client = new CoreApiClient();

  if (donorType === 'COMPANY') {
    const result = await client.query({
      gifts: {
        __args: {
          first: 20,
          filter: {
            and: [
              {
                companyId: {
                  eq: selectedCompanyId,
                },
              },
              {
                giftDate: {
                  eq: giftDate,
                },
              },
            ],
          },
        },
        edges: {
          node: {
            id: true,
            name: true,
            giftDate: true,
            amount: {
              amountMicros: true,
              currencyCode: true,
            },
          },
        },
      },
    } as any);

    const matches = buildCommittedGiftMatches(
      result?.gifts?.edges?.map(
        (edge: { node: ManualGiftDuplicateMatch }) => edge.node,
      ),
      amountMicros,
      currencyCode,
    );

    return { matches };
  }

  const result = await client.query({
    gifts: {
      __args: {
        first: 20,
        filter: {
          and: [
            {
              donorId: {
                eq: selectedDonorId,
              },
            },
            {
              giftDate: {
                eq: giftDate,
              },
            },
          ],
        },
      },
      edges: {
        node: {
          id: true,
          name: true,
          giftDate: true,
          amount: {
            amountMicros: true,
            currencyCode: true,
          },
        },
      },
    },
    giftStagings: {
      __args: {
        first: 20,
        filter: {
          and: [
            {
              donorId: {
                eq: selectedDonorId,
              },
            },
            {
              giftDate: {
                eq: giftDate,
              },
            },
          ],
        },
      },
      edges: {
        node: {
          id: true,
          name: true,
          giftDate: true,
          amount: {
            amountMicros: true,
            currencyCode: true,
          },
          processingStatus: true,
          giftBatch: {
            name: true,
          },
        },
      },
    },
  } as any);

  const matches = [
    ...buildCommittedGiftMatches(
      result?.gifts?.edges?.map(
        (edge: { node: ManualGiftDuplicateMatch }) => edge.node,
      ),
      amountMicros,
      currencyCode,
    ),
    ...buildStagedGiftMatches(
      result?.giftStagings?.edges?.map(
        (edge: { node: ManualGiftDuplicateMatch }) => edge.node,
      ),
      amountMicros,
      currencyCode,
    ),
  ];

  return { matches };
};

export default defineLogicFunction({
  universalIdentifier: 'd3e213f2-35cb-4f12-a626-a6d6fa55820e',
  name: 'check-manual-gift-duplicates',
  description:
    'Checks for likely duplicate staged or committed gifts during manual gift entry.',
  timeoutSeconds: 10,
  handler,
  httpRouteTriggerSettings: {
    path: '/manual-gift-entry/check-duplicates',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
