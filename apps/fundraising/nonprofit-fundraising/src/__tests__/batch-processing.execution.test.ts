import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { BatchProcessingRow } from 'src/batch-processing/batch-processing.types';

const mocks = vi.hoisted(() => ({
  post: vi.fn(),
  mutation: vi.fn(),
  persist: vi.fn(),
  effects: vi.fn(),
}));

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: vi.fn(function () {
    return { mutation: mocks.mutation };
  }),
}));
vi.mock('src/app-api/twenty-rest-client', () => ({
  postTwentyRest: mocks.post,
}));
vi.mock('src/gift-staging/gift-staging-bulk-writeback', () => ({
  persistGiftStagingBatchUpserts: mocks.persist,
}));
vi.mock('src/gift-aid/gift-aid-config', () => ({
  isGiftAidEnabled: () => false,
}));
vi.mock(
  'src/batch-processing/batch-processing.executor.effects',
  async (original) => ({
    ...(await original<
      typeof import('src/batch-processing/batch-processing.executor.effects')
    >()),
    runBatchProcessingSideEffects: mocks.effects,
  }),
);

import {
  executeBatchGiftProcessing,
  executeSingleGiftProcessing,
} from 'src/batch-processing/batch-processing.executor';

const row = (id = 'staging_1'): BatchProcessingRow => ({
  id,
  name: 'Staged donation',
  donorFirstName: 'Ada',
  donorLastName: 'Lovelace',
  donorEmail: 'ada@example.org',
  donorMailingAddress: null,
  amount: { amountMicros: 10_000_000, currencyCode: 'GBP' },
  giftDate: '2026-10-13',
  donationType: 'ONE_OFF',
  paymentType: 'CARD',
  externalId: null,
  sourceFingerprint: null,
  providerEventId: null,
  provider: null,
  providerPaymentId: null,
  coveredFeeAmount: null,
  grossPaymentAmount: null,
  processingFeeAmount: null,
  netReceivedAmount: null,
  providerPayoutReference: null,
  paymentProviderCustomerId: null,
  providerAgreementId: null,
  providerIntervalUnit: null,
  providerIntervalCount: null,
  donorPhone: null,
  supporterEmailOptOut: true,
  isAnonymousDonor: false,
  rawProviderEvidence: null,
  appealSourceExternalId: null,
  sourceAppealName: null,
  sourceFundName: null,
  donorResolutionState: 'LINKED',
  donor: { id: 'person_1', emails: { primaryEmail: 'old@example.org' } },
  softCreditPerson: null,
  softCreditCompany: null,
  softCreditType: null,
  fund: null,
  appeal: null,
  appealSource: null,
  giftReadyStatus: 'READY_TO_PROCESS',
  paymentState: null,
  processingStatus: 'NOT_PROCESSED',
  errorDetail: null,
  giftAidRequested: false,
  giftAidDeclarationCaptured: false,
  giftAidDeclarationDate: null,
  giftAidCoverageScope: null,
  giftAidDeclarationSource: null,
  giftAidTextVersion: null,
  giftAidDeclaration: null,
  recurringAgreement: null,
  committedGift: null,
});

beforeEach(() => {
  vi.resetAllMocks();
  mocks.post.mockResolvedValue({ data: { createGifts: [{ id: 'gift_1' }] } });
  mocks.mutation.mockResolvedValue({ updatePerson: { id: 'person_1' } });
  mocks.persist.mockResolvedValue(undefined);
  mocks.effects.mockResolvedValue(undefined);
});
afterEach(() => vi.restoreAllMocks());

describe('gift execution commit boundary', () => {
  it('preserves a confirmed gift when actual donor enrichment requests fail', async () => {
    mocks.mutation.mockRejectedValue(new Error('Donor update rejected'));
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const result = await executeSingleGiftProcessing(row());

    expect(result.writeback).toMatchObject({
      processingStatus: 'PROCESSED',
      committedGiftId: 'gift_1',
      executionPath: 'BATCH',
    });
    expect(result.stagingWritebackSucceeded).toBe(true);
    expect(mocks.post).toHaveBeenCalledOnce();
    expect(mocks.mutation).toHaveBeenCalledTimes(2);
    expect(warn).toHaveBeenCalledTimes(2);
    expect(mocks.persist.mock.calls[0][0][0].committedGiftId).toBe('gift_1');
  });

  it('does not create a second gift when a committed single-row response is lost', async () => {
    const committed: string[] = [];
    mocks.post.mockImplementation(async () => {
      committed.push('batch_gift');
      throw new Error('Connection closed after commit');
    });
    mocks.mutation.mockImplementation(async (input) => {
      if (input.createGift) {
        committed.push('fallback_gift');
        return { createGift: { id: 'fallback_gift' } };
      }
      return { updatePerson: { id: 'person_1' } };
    });

    const result = await executeSingleGiftProcessing(row());

    expect(committed).toEqual(['batch_gift']);
    expect(result.writeback).toMatchObject({
      processingStatus: 'PROCESS_FAILED',
      executionPath: 'BATCH',
    });
    expect(result.writeback.errorDetail).toContain('Reconcile');
    expect(mocks.post).toHaveBeenCalledOnce();
    expect(mocks.mutation).not.toHaveBeenCalled();
  });

  it('does not split and replay a chunk after its committed response is lost', async () => {
    let createdCount = 0;
    mocks.post.mockImplementation(async ({ body }) => {
      createdCount += body.length;
      if (mocks.post.mock.calls.length === 1) throw new Error('Response lost');
      return {
        data: {
          createGifts: body.map((_: unknown, index: number) => ({
            id: `retry_${index}`,
          })),
        },
      };
    });

    const result = await executeBatchGiftProcessing([row(), row('staging_2')]);

    expect(createdCount).toBe(2);
    expect(mocks.post).toHaveBeenCalledOnce();
    expect(result.successfulWritebacks).toEqual([]);
    expect(result.failedWritebacks).toHaveLength(2);
    expect(
      result.failedWritebacks.every((item) => item.executionPath === 'BATCH'),
    ).toBe(true);
  });

  it('does not try another creation path after a rejected request', async () => {
    mocks.post.mockRejectedValue(new Error('Invalid gift data'));

    const result = await executeSingleGiftProcessing(row());

    expect(result.writeback.processingStatus).toBe('PROCESS_FAILED');
    expect(mocks.post).toHaveBeenCalledOnce();
    expect(mocks.mutation).not.toHaveBeenCalled();
    expect(mocks.effects).not.toHaveBeenCalled();
  });

  it.each([
    { data: { createGifts: [] } },
    { data: { createGifts: [{ id: '' }] } },
  ])(
    'requires reconciliation for an uncorrelatable response %j',
    async (response) => {
      mocks.post.mockResolvedValue(response);

      const result = await executeSingleGiftProcessing(row());

      expect(result.writeback.processingStatus).toBe('PROCESS_FAILED');
      expect(result.writeback.errorDetail).toContain('Reconcile');
      expect(mocks.post).toHaveBeenCalledOnce();
      expect(mocks.mutation).not.toHaveBeenCalled();
    },
  );

  it('rejects duplicate returned IDs instead of linking two staged rows to one gift', async () => {
    mocks.post.mockResolvedValue({
      data: { createGifts: [{ id: 'gift_1' }, { id: 'gift_1' }] },
    });

    const result = await executeBatchGiftProcessing([row(), row('staging_2')]);

    expect(result.successfulWritebacks).toEqual([]);
    expect(result.failedWritebacks).toHaveLength(2);
    expect(mocks.mutation).not.toHaveBeenCalled();
  });

  it('returns the known gift ID when single-row staging reconciliation fails', async () => {
    mocks.persist.mockRejectedValue(new Error('Staging unavailable'));

    const result = await executeSingleGiftProcessing(row());

    expect(result.writeback).toMatchObject({
      committedGiftId: 'gift_1',
      processingStatus: 'PROCESSED',
    });
    expect(result.stagingWritebackSucceeded).toBe(false);
    expect(result.reconciliationError).toBe('Staging unavailable');
    expect(mocks.post).toHaveBeenCalledOnce();
  });

  it('includes known gift IDs in a batch staging reconciliation error', async () => {
    mocks.persist.mockRejectedValue(new Error('Staging unavailable'));

    await expect(executeBatchGiftProcessing([row()])).rejects.toThrow(
      'staging_1:gift_1',
    );
    expect(mocks.post).toHaveBeenCalledOnce();
  });
});
