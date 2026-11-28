import { RestApiClient } from 'twenty-client-sdk/rest';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { deriveRefundState } from 'src/gift-lifecycle/gift-refund';
import type {
  RecordGiftRefundRequest,
  RecordGiftRefundResponse,
} from 'src/gift-lifecycle/gift-refund.types';
import { getDefaultCurrencyCode } from 'src/reporting-currency/reporting-currency';
import { normalizeString } from 'src/utils/normalize-string';
import { createCoreApiClient, withRateLimitRetry } from 'src/core-api/rate-limit-retry';

type GiftRefundRecord = {
  id: string;
  amount?: {
    amountMicros?: number | null;
    currencyCode?: string | null;
  } | null;
  refundedAmount?: {
    amountMicros?: number | null;
    currencyCode?: string | null;
  } | null;
  updatedAt: string;
  giftAidClaimBatchId?: string | null;
  giftAidClaimBatch?: {
    id?: string | null;
    status?: string | null;
    name?: string | null;
  } | null;
};

const normalizeAmountMicros = (value: number | null | undefined) => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.round(value));
};

const normalizeRefundedAt = (value: string) => {
  const normalized = normalizeString(value);

  if (normalized === '') {
    throw new Error('Refund date is required');
  }

  const parsed = new Date(normalized);

  if (Number.isNaN(parsed.getTime())) {
    throw new Error('Refund date is invalid');
  }

  return parsed.toISOString();
};

const loadGiftForRefund = async (giftId: string) => {
  // REST expands whichever relations are installed. The typed core client
  // deliberately has no dependency on the extension's schema.
  const client = new RestApiClient({ runAs: 'application' });
  const result = await withRateLimitRetry(() =>
    client.get<{ data: { gift: GiftRefundRecord | null } }>(
      `/rest/gifts/${encodeURIComponent(giftId)}`,
      { query: { depth: 1 } },
    ),
  );
  return result.data.gift;
};

const handler = async (
  event: RoutePayload<RecordGiftRefundRequest>,
): Promise<RecordGiftRefundResponse> => {
  const giftId = normalizeString(event.body?.giftId);
  const refundedAmountMicros = normalizeAmountMicros(
    event.body?.refundedAmountMicros,
  );
  const refundDate = normalizeRefundedAt(event.body?.refundDate ?? '');
  const refundNote = normalizeString(event.body?.refundNote ?? '');

  if (giftId === '') {
    throw new Error('Gift id is required');
  }

  if (refundedAmountMicros <= 0) {
    throw new Error('Refunded amount must be greater than zero');
  }

  const client = createCoreApiClient();
  const gift = await loadGiftForRefund(giftId);

  if (!gift?.id) {
    throw new Error('Gift not found');
  }

  const originalAmountMicros = normalizeAmountMicros(gift.amount?.amountMicros);
  const currencyCode = normalizeString(gift.amount?.currencyCode) || getDefaultCurrencyCode();

  if (originalAmountMicros <= 0) {
    throw new Error('Gift amount is missing or invalid');
  }

  if (refundedAmountMicros > originalAmountMicros) {
    throw new Error('Refunded amount cannot exceed the original gift amount');
  }

  const claimStatus = gift.giftAidClaimBatch?.status;
  if (claimStatus === 'FINALIZED') {
    throw new Error('This gift is in a finalized Gift Aid claim. Its refund cannot be recorded here.');
  }
  if ((gift.giftAidClaimBatchId || gift.giftAidClaimBatch?.id) && claimStatus !== 'DRAFT') {
    throw new Error('Unable to verify the linked Gift Aid claim before recording the refund.');
  }

  const result = await client.mutation({
    updateGifts: {
      __args: {
        filter: { id: { eq: giftId }, updatedAt: { eq: gift.updatedAt } },
        data: {
          refundedAmount: {
            amountMicros: refundedAmountMicros,
            currencyCode,
          },
          refundDate,
          refundNote: refundNote === '' ? null : refundNote,
        },
      },
      id: true,
    },
  });
  if (result.updateGifts?.length !== 1) {
    throw new Error('This gift changed while recording the refund. Reload it and try again.');
  }

  return {
    giftId,
    refundedAmountMicros,
    refundDate,
    refundState: deriveRefundState({
      amount: gift.amount,
      refundedAmount: {
        amountMicros: refundedAmountMicros,
        currencyCode,
      },
    }),
  };
};

export default defineLogicFunction({
  universalIdentifier: '089331e2-6154-4d48-bdc0-c27bcf00e17f',
  name: 'record-gift-refund',
  description:
    'Records a full or partial refund on a committed gift.',
  timeoutSeconds: 15,
  handler,
  httpRouteTriggerSettings: {
    path: '/gifts/record-refund',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
