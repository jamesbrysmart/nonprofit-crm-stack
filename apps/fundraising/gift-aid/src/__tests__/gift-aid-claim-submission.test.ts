import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CoreApiClient, CoreSchema } from 'twenty-client-sdk/core';
import { queueGiftAidClaimSubmission } from 'src/gift-aid-claims/gift-aid-claim-submission';
import { runGiftAidHmrcSubmission } from 'src/gift-aid-claims/gift-aid-hmrc-runner';

vi.mock('src/gift-aid-claims/gift-aid-hmrc-runner', () => ({
  runGiftAidHmrcSubmission: vi.fn(),
}));

describe('Gift Aid claim submission', () => {
  beforeEach(() => {
    vi.mocked(runGiftAidHmrcSubmission).mockReset();
  });

  it('records the snapshot and runner result once a finalized claim is submitted', async () => {
    let latestStatus: string | undefined;
    const query = vi.fn(async (selection: CoreSchema.QueryGenqlSelection) => {
      if (selection.giftAidClaimBatches) {
        return {
          giftAidClaimBatches: { edges: [{ node: { id: 'batch-1', name: 'Claim', status: 'FINALIZED' } }] },
        };
      }
      if (selection.giftAidClaimSubmissions) {
        return {
          giftAidClaimSubmissions: {
            edges: latestStatus ? [{ node: { status: latestStatus } }] : [],
          },
        };
      }
      return {
        gifts: {
          edges: [{
            node: {
              id: 'gift-1',
              giftAidStatus: 'CLAIMABLE',
              amount: { currencyCode: 'GBP', amountMicros: 20_000_000 },
              donor: { mailingAddress: { addressPostcode: 'SW1A 1AA' } },
              giftAidDeclaration: { id: 'declaration-1' },
            },
          }],
          pageInfo: { hasNextPage: false },
        },
      };
    });
    const mutation = vi.fn(async (selection: CoreSchema.MutationGenqlSelection) => {
      if (selection.createGiftAidClaimSubmission) {
        return { createGiftAidClaimSubmission: { id: 'submission-1' } };
      }
      if (selection.updateGiftAidClaimSubmission && typeof selection.updateGiftAidClaimSubmission === 'object') {
        latestStatus = selection.updateGiftAidClaimSubmission.__args.data.status ?? undefined;
        return { updateGiftAidClaimSubmission: { id: 'submission-1' } };
      }
      return { updateGiftAidClaimBatch: { id: 'batch-1' } };
    });
    vi.mocked(runGiftAidHmrcSubmission).mockResolvedValue({
      ok: true,
      status: 'RESPONDED',
      transactionId: 'transaction-1',
      submittedToHmrcAt: '2025-02-01T00:00:00.000Z',
      responseBody: {},
      completedAt: '2026-11-27T12:00:00.000Z',
    });
    const client = { query, mutation } as unknown as CoreApiClient;

    await expect(queueGiftAidClaimSubmission(client, 'batch-1')).resolves.toMatchObject({
      claimBatchId: 'batch-1',
      submissionId: 'submission-1',
      status: 'RESPONDED',
    });
    expect(mutation).toHaveBeenCalledWith({
      createGiftAidClaimSubmission: expect.objectContaining({
        __args: {
          data: expect.objectContaining({
            giftAidClaimBatch: { connect: { where: { id: 'batch-1' } } },
            snapshotHash: expect.stringMatching(/^[a-f0-9]{64}$/),
            snapshotJson: expect.objectContaining({
              batch: expect.objectContaining({ totalAmountMicros: 20_000_000 }),
              gifts: [expect.objectContaining({
                id: 'gift-1',
                giftAidDeclarationId: 'declaration-1',
                donorMailingAddress: expect.objectContaining({ addressPostcode: 'SW1A 1AA' }),
              })],
            }),
          }),
        },
      }),
    });
    expect(mutation).toHaveBeenCalledWith({
      updateGiftAidClaimSubmission: expect.objectContaining({
        __args: {
          id: 'submission-1',
          data: expect.objectContaining({ status: 'RESPONDED', transactionId: 'transaction-1' }),
        },
      }),
    });

    await expect(queueGiftAidClaimSubmission(client, 'batch-1')).rejects.toThrow('already has a responded submission');
    expect(runGiftAidHmrcSubmission).toHaveBeenCalledTimes(1);
  });
});
