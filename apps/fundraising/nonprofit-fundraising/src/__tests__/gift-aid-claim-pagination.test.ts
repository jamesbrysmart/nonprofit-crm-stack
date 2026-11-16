import { describe, expect, it, vi } from 'vitest';
import type { CoreApiClient } from 'twenty-client-sdk/core';
import {
  listGiftsForClaimBatch,
  listNeedsReviewGiftAidGifts,
  refreshClaimBatchSummary,
} from 'src/gift-aid-claims/gift-aid-claim-batch.queries';
import { finalizeGiftAidClaimBatch } from 'src/gift-aid-claims/gift-aid-claim-batch';
import type { GiftAidClaimGiftRecord } from 'src/gift-aid-claims/gift-aid-claim.types';

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

  it('persists totals for all 201 gifts and a blocking issue on the later page', async () => {
    const records = gifts(201);
    records[200].giftAidStatus = 'NEEDS_REVIEW';
    const query = vi
      .fn()
      .mockResolvedValueOnce(page(records.slice(0, 200), true, 'cursor_200'))
      .mockResolvedValueOnce(page(records.slice(200)));
    const mutation = vi
      .fn()
      .mockResolvedValue({ updateGiftAidClaimBatch: { id: 'claim_1' } });

    await refreshClaimBatchSummary(clientWith(query, mutation), 'claim_1');

    expect(query).toHaveBeenCalledTimes(2);
    expect(query.mock.calls[1][0].gifts.__args).toMatchObject({
      after: 'cursor_200',
      first: 200,
      filter: { giftAidClaimBatchId: { eq: 'claim_1' } },
    });
    expect(
      mutation.mock.calls[0][0].updateGiftAidClaimBatch.__args.data,
    ).toEqual({
      giftCount: 201,
      totalAmount: { amountMicros: 2_000_000_000, currencyCode: 'GBP' },
      hasBlockingIssues: true,
      blockingIssueCount: 1,
    });
  });

  it('loads later review-queue pages using the same filter', async () => {
    const records = gifts(201);
    const query = vi
      .fn()
      .mockResolvedValueOnce(page(records.slice(0, 200), true, 'cursor_200'))
      .mockResolvedValueOnce(page(records.slice(200)));
    expect(await listNeedsReviewGiftAidGifts(clientWith(query))).toEqual(
      records,
    );
    expect(query.mock.calls[1][0].gifts.__args.filter).toEqual(
      query.mock.calls[0][0].gifts.__args.filter,
    );
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

  it('refuses finalisation when the only blocking gift is beyond the first page', async () => {
    const records = gifts(201);
    records[200].giftAidStatus = 'NEEDS_REVIEW';
    const batch = { id: 'claim_1', name: 'Draft', status: 'DRAFT' };
    const query = vi.fn().mockImplementation(async (input) => {
      if (input.giftAidClaimBatch)
        return {
          giftAidClaimBatch: batch,
          giftAidClaimSubmissions: { edges: [] },
        };
      if (input.gifts.__args.filter.and) return page([]);
      return input.gifts.__args.after
        ? page(records.slice(200))
        : page(records.slice(0, 200), true, 'cursor_200');
    });
    const mutation = vi
      .fn()
      .mockResolvedValue({ updateGiftAidClaimBatch: { id: 'claim_1' } });
    await expect(
      finalizeGiftAidClaimBatch(clientWith(query, mutation), 'claim_1'),
    ).rejects.toThrow('blocking issues');
    expect(
      mutation.mock.calls.every(
        ([input]) =>
          input.updateGiftAidClaimBatch.__args.data.status !== 'FINALIZED',
      ),
    ).toBe(true);
  });
});
