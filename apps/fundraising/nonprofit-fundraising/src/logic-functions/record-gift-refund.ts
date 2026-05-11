import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { refreshClaimBatchSummary } from 'src/gift-aid-claims/gift-aid-claim-batch';
import { deriveRefundState } from 'src/gift-lifecycle/gift-refund';
import type {
  RecordGiftRefundRequest,
  RecordGiftRefundResponse,
} from 'src/gift-lifecycle/gift-refund.types';

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
  giftAidClaimBatch?: {
    id?: string | null;
    status?: string | null;
    name?: string | null;
  } | null;
};

const normalizeString = (value: string | null | undefined) =>
  typeof value === 'string' ? value.trim() : '';

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

const loadGiftForRefund = async (
  client: CoreApiClient,
  giftId: string,
): Promise<GiftRefundRecord | null> => {
  const result = await client.query({
    gift: {
      __args: {
        filter: {
          id: { eq: giftId },
        },
      },
      id: true,
      amount: {
        amountMicros: true,
        currencyCode: true,
      },
      refundedAmount: {
        amountMicros: true,
        currencyCode: true,
      },
      giftAidClaimBatch: {
        id: true,
        status: true,
        name: true,
      },
    },
  } as any);

  return (result?.gift as GiftRefundRecord | null) ?? null;
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

  const client = new CoreApiClient();
  const gift = await loadGiftForRefund(client, giftId);

  if (!gift?.id) {
    throw new Error('Gift not found');
  }

  const originalAmountMicros = normalizeAmountMicros(gift.amount?.amountMicros);
  const currencyCode = normalizeString(gift.amount?.currencyCode) || 'GBP';

  if (originalAmountMicros <= 0) {
    throw new Error('Gift amount is missing or invalid');
  }

  if (refundedAmountMicros > originalAmountMicros) {
    throw new Error('Refunded amount cannot exceed the original gift amount');
  }

  const linkedClaimBatchId = normalizeString(gift.giftAidClaimBatch?.id);
  const linkedClaimBatchStatus = normalizeString(gift.giftAidClaimBatch?.status);

  if (linkedClaimBatchId !== '' && linkedClaimBatchStatus === 'FINALIZED') {
    const claimBatchName = normalizeString(gift.giftAidClaimBatch?.name);

    throw new Error(
      claimBatchName === ''
        ? 'This gift is already in finalized Gift Aid claim work. Refund follow-up for finalized claims is not implemented yet.'
        : `This gift is already in finalized Gift Aid claim work (${claimBatchName}). Refund follow-up for finalized claims is not implemented yet.`,
    );
  }

  await client.mutation({
    updateGift: {
      __args: {
        id: giftId,
        data: {
          refundedAmount: {
            amountMicros: refundedAmountMicros,
            currencyCode,
          },
          refundDate,
          refundNote: refundNote === '' ? null : refundNote,
          giftAidStatus: 'NOT_CLAIMABLE',
          giftAidReasonCode: 'gift_refunded_or_reversed',
          giftAidDecisionSource: 'SYSTEM',
          giftAidLastEvaluatedAt: new Date().toISOString(),
          ...(linkedClaimBatchId !== ''
            ? {
                giftAidClaimBatch: {
                  disconnect: true,
                },
              }
            : {}),
        },
      },
      id: true,
    },
  } as any);

  if (linkedClaimBatchId !== '' && linkedClaimBatchStatus === 'DRAFT') {
    await refreshClaimBatchSummary(client, linkedClaimBatchId);
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
    'Records a full or partial refund on a committed gift and updates first-pass Gift Aid claim state.',
  timeoutSeconds: 15,
  handler,
  httpRouteTriggerSettings: {
    path: '/gifts/record-refund',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
