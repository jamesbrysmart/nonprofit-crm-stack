import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CoreApiClient } from 'twenty-client-sdk/core';
import {
  expireAwaitingDonationFormPayments,
  loadAwaitingDonationFormPaymentIds,
} from 'src/donation-forms/donation-form-payment-expiry';
import { persistGiftStagingBatchUpserts } from 'src/gift-staging/gift-staging-bulk-writeback';

vi.mock('src/gift-staging/gift-staging-bulk-writeback', () => ({
  persistGiftStagingBatchUpserts: vi.fn(),
}));

describe('loadAwaitingDonationFormPaymentIds', () => {
  it('loads paginated donation-form rows awaiting payment', async () => {
    const client = {
      query: vi
        .fn()
        .mockResolvedValueOnce({
          giftStagings: {
            edges: [
              { node: { id: ' gst_1 ' } },
              { node: { id: 'gst_2' } },
            ],
            pageInfo: {
              hasNextPage: true,
              endCursor: 'cursor_2',
            },
          },
        })
        .mockResolvedValueOnce({
          giftStagings: {
            edges: [{ node: { id: 'gst_3' } }],
            pageInfo: {
              hasNextPage: false,
              endCursor: null,
            },
          },
        }),
    } as unknown as CoreApiClient;

    await expect(loadAwaitingDonationFormPaymentIds(client)).resolves.toEqual([
      'gst_1',
      'gst_2',
      'gst_3',
    ]);

    expect((client.query as any).mock.calls[0][0]).toMatchObject({
      giftStagings: {
        __args: {
          first: 200,
          filter: {
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
          },
        },
      },
    });

    expect((client.query as any).mock.calls[1][0]).toMatchObject({
      giftStagings: {
        __args: {
          after: 'cursor_2',
        },
      },
    });
  });
});

describe('expireAwaitingDonationFormPayments', () => {
  const persistMock = vi.mocked(persistGiftStagingBatchUpserts);

  beforeEach(() => {
    persistMock.mockReset();
  });

  it('writes matched rows back as payment expired', async () => {
    const client = {
      query: vi.fn().mockResolvedValue({
        giftStagings: {
          edges: [{ node: { id: 'gst_1' } }, { node: { id: 'gst_2' } }],
          pageInfo: {
            hasNextPage: false,
            endCursor: null,
          },
        },
      }),
    } as unknown as CoreApiClient;

    await expect(expireAwaitingDonationFormPayments(client)).resolves.toEqual({
      scannedCount: 2,
      expiredCount: 2,
    });

    expect(persistMock).toHaveBeenCalledWith(
      [
        { id: 'gst_1', paymentState: 'PAYMENT_EXPIRED' },
        { id: 'gst_2', paymentState: 'PAYMENT_EXPIRED' },
      ],
      {
        allowedIds: new Set(['gst_1', 'gst_2']),
      },
    );
  });

  it('skips writeback when nothing matches', async () => {
    const client = {
      query: vi.fn().mockResolvedValue({
        giftStagings: {
          edges: [],
          pageInfo: {
            hasNextPage: false,
            endCursor: null,
          },
        },
      }),
    } as unknown as CoreApiClient;

    await expect(expireAwaitingDonationFormPayments(client)).resolves.toEqual({
      scannedCount: 0,
      expiredCount: 0,
    });

    expect(persistMock).not.toHaveBeenCalled();
  });
});
