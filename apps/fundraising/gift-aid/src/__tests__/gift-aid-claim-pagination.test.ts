import { describe, expect, it, vi } from 'vitest';
import type { CoreApiClient } from 'twenty-client-sdk/core';
import {
  listGiftsForClaimBatch,
  refreshClaimBatchSummary,
} from 'src/gift-aid-claims/gift-aid-claim-batch.queries';
import { finalizeGiftAidClaimBatch } from 'src/gift-aid-claims/gift-aid-claim-batch';
import type {
  GiftAidClaimBatchRecord,
  GiftAidClaimGiftRecord,
} from 'src/gift-aid-claims/gift-aid-claim.types';

const gifts = (count: number): GiftAidClaimGiftRecord[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `gift_${index}`,
    giftAidStatus: 'CLAIMABLE',
    amount: { amountMicros: 10_000_000, currencyCode: 'GBP' },
  }));
const page = (
  records: GiftAidClaimGiftRecord[],
  hasNextPage = false,
  endCursor: string | null = null,
) => ({
  gifts: {
    edges: records.map((node) => ({ node })),
    pageInfo: { hasNextPage, endCursor },
  },
});
const clientWith = (query: ReturnType<typeof vi.fn>, mutation = vi.fn()) =>
  ({ query, mutation }) as unknown as CoreApiClient;

describe('claim gift pagination', () => {
  it('stops at a complete 200-record page', async () => {
    const records = gifts(200);
    const query = vi.fn().mockResolvedValue(page(records));
    expect(await listGiftsForClaimBatch(clientWith(query), 'claim_1')).toEqual(
      records,
    );
    expect(query).toHaveBeenCalledOnce();
  });

  it('does not persist an incomplete summary after a later page fails', async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce(page(gifts(200), true, 'cursor_200'))
      .mockRejectedValueOnce(new Error('Read failed'));
    const mutation = vi.fn();
    await expect(
      refreshClaimBatchSummary(clientWith(query, mutation), 'claim_1'),
    ).rejects.toThrow('Read failed');
    expect(mutation).not.toHaveBeenCalled();
  });

  it('rejects a truncated connection with no continuation cursor', async () => {
    const query = vi.fn().mockResolvedValue(page(gifts(200), true));
    await expect(
      listGiftsForClaimBatch(clientWith(query), 'claim_1'),
    ).rejects.toThrow('cursor');
  });

  it('rejects a repeated continuation cursor', async () => {
    const query = vi
      .fn()
      .mockResolvedValue(page(gifts(1), true, 'cursor_same'));
    await expect(
      listGiftsForClaimBatch(clientWith(query), 'claim_1'),
    ).rejects.toThrow('cursor');
    expect(query).toHaveBeenCalledTimes(2);
  });

  it('rejects malformed query responses rather than persisting a zero-gift summary', async () => {
    const mutation = vi.fn();
    await expect(
      refreshClaimBatchSummary(
        clientWith(vi.fn().mockResolvedValue({}), mutation),
        'claim_1',
      ),
    ).rejects.toThrow('gift');
    expect(mutation).not.toHaveBeenCalled();
  });

  it('blocks finalisation until a later-page gift is resolved, then opens the next draft', async () => {
    const firstPage = gifts(200);
    const lastGift: GiftAidClaimGiftRecord = {
      id: 'gift_200',
      giftAidStatus: 'NEEDS_REVIEW',
      amount: { amountMicros: 35_000_000, currencyCode: 'GBP' },
    };
    const batch: GiftAidClaimBatchRecord = {
      id: 'claim_1',
      name: 'Draft',
      status: 'DRAFT',
      hasBlockingIssues: false,
    };
    let nextDraft: GiftAidClaimBatchRecord | undefined;
    const query = vi.fn().mockImplementation(async (input) => {
      if (input.giftAidClaimBatches) {
        const filter = input.giftAidClaimBatches.__args.filter;
        return { giftAidClaimBatches: { edges: filter.id ? [{ node: batch }] : [] } };
      }
      const { after, filter } = input.gifts.__args;
      expect(filter).toEqual({ giftAidClaimBatchId: { eq: batch.id } });
      if (after === undefined) return page(firstPage, true, 'cursor_200');
      expect(after).toBe('cursor_200');
      return page([lastGift]);
    });
    const mutation = vi.fn().mockImplementation(async (input) => {
      if (input.createGiftAidClaimBatch) {
        nextDraft = { ...input.createGiftAidClaimBatch.__args.data, id: 'claim_2' };
        return { createGiftAidClaimBatch: nextDraft };
      }
      const { filter, data } = input.updateGiftAidClaimBatches.__args;
      expect(filter).toEqual({ id: { eq: batch.id }, status: { eq: 'DRAFT' } });
      Object.assign(batch, data);
      return { updateGiftAidClaimBatches: [{ id: batch.id }] };
    });
    const client = clientWith(query, mutation);

    await expect(finalizeGiftAidClaimBatch(client, batch.id)).rejects.toThrow(
      'blocking issues',
    );
    expect(batch).toMatchObject({
      status: 'DRAFT',
      giftCount: 201,
      totalAmount: { amountMicros: 2_000_000_000, currencyCode: 'GBP' },
      hasBlockingIssues: true,
      blockingIssueCount: 1,
    });
    expect(nextDraft).toBeUndefined();

    lastGift.giftAidStatus = 'CLAIMABLE';
    const result = await finalizeGiftAidClaimBatch(client, batch.id);

    expect(result).toMatchObject({
      claimBatchId: 'claim_1',
      nextDraftBatchId: 'claim_2',
      status: 'FINALIZED',
      submittedAt: expect.any(String),
    });
    expect(batch).toMatchObject({
      status: 'FINALIZED',
      submittedAt: result.submittedAt,
      giftCount: 201,
      totalAmount: { amountMicros: 2_035_000_000, currencyCode: 'GBP' },
      hasBlockingIssues: false,
      blockingIssueCount: 0,
    });
    expect(nextDraft).toMatchObject({
      id: 'claim_2',
      status: 'DRAFT',
      giftCount: 0,
      totalAmount: { amountMicros: 0, currencyCode: 'GBP' },
    });
  });
});
