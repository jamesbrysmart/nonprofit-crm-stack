import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CoreApiClient } from 'twenty-client-sdk/core';
import type { BatchProcessingRow } from 'src/batch-processing/batch-processing.types';
import { processGiftStagingRows } from 'src/gift-staging-review/gift-ready-check.service';

const mocks = vi.hoisted(() => ({
  post: vi.fn(),
  query: vi.fn(),
  mutation: vi.fn(),
  persist: vi.fn(),
  effects: vi.fn(),
}));

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: vi.fn(function () {
    return { query: mocks.query, mutation: mocks.mutation };
  }),
}));
vi.mock('src/app-api/twenty-rest-client', () => ({
  postTwentyRest: mocks.post,
}));
vi.mock('src/gift-staging/gift-staging-bulk-writeback', () => ({
  persistGiftStagingBatchUpserts: mocks.persist,
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

const row = (
  id = 'staging_1',
  overrides: Partial<BatchProcessingRow> = {},
): BatchProcessingRow => ({
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
  donorResolutionState: 'CONFIRMED',
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
  recurringAgreement: null,
  committedGift: null,
  ...overrides,
});

const giftCreateCalls = () =>
  mocks.post.mock.calls.filter(([request]) =>
    String(request?.path).startsWith('/rest/batch/gifts'),
  );

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv('GIFT_AID_ENABLED', 'false');
  mocks.post.mockResolvedValue({ data: { createGifts: [{ id: 'gift_1' }] } });
  mocks.mutation.mockResolvedValue({ updatePerson: { id: 'person_1' } });
  mocks.persist.mockResolvedValue(undefined);
  mocks.effects.mockResolvedValue(undefined);
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

it.each([
  { enabled: 'false', requested: true, expected: undefined },
  { enabled: 'true', requested: false, expected: { giftAidRequested: false } },
  {
    enabled: 'true',
    requested: true,
    expected: {
      donorIdAtCapture: 'person_1',
      giftAidRequested: true,
      giftAidDeclarationCaptured: true,
      giftAidDeclarationDate: '2026-10-13',
      giftAidDeclarationSource: 'donation_form',
    },
  },
])('adds the expected Gift Aid intake to the single create with capture $enabled and request $requested', async ({
  enabled,
  requested,
  expected,
}) => {
  vi.stubEnv('GIFT_AID_ENABLED', enabled);

  const result = await executeSingleGiftProcessing(row('staging_1', {
    giftAidRequested: requested,
    giftAidDeclarationCaptured: requested,
    giftAidDeclarationDate: '2026-10-13',
    giftAidDeclarationSource: 'donation_form',
  }));

  expect(result.writeback).toMatchObject({
    processingStatus: 'PROCESSED',
    committedGiftId: 'gift_1',
  });
  const creates = giftCreateCalls();
  expect(creates).toHaveLength(1);
  expect(creates[0][0].body[0].giftAidIntake).toEqual(expected);
  expect(mocks.mutation).not.toHaveBeenCalledWith(
    expect.objectContaining({ updateGift: expect.anything() }),
  );
});

it('commits eligible rows with their financial values and resolved coding', async () => {
  vi.stubEnv('REPORTING_CURRENCY', 'GBP');
  mocks.query.mockResolvedValue({
    appealSources: {
      edges: [
        {
          node: {
            id: 'source_1',
            appeal: { id: 'appeal_1', defaultFund: { id: 'fund_1' } },
          },
        },
      ],
    },
  });
  mocks.post.mockResolvedValueOnce({
    data: { createGifts: [{ id: 'gift_gbp' }, { id: 'gift_eur' }] },
  });

  const result = await processGiftStagingRows(new CoreApiClient(), [
    row('staging_gbp', {
      externalId: 'bank-ref-40',
      amount: { amountMicros: 40_000_000, currencyCode: 'GBP' },
      paymentType: 'BANK_TRANSFER',
      appealSource: { id: 'source_1' },
    }),
    row('awaiting_payment', { paymentState: 'AWAITING_PAYMENT' }),
    row('staging_eur', {
      provider: 'STRIPE',
      providerPaymentId: 'pi_eur',
      paymentState: 'PAYMENT_CONFIRMED',
      amount: { amountMicros: 30_000_000, currencyCode: 'EUR' },
      donor: { id: 'person_2' },
      appealSource: { id: 'source_1' },
      appeal: { id: 'appeal_1' },
      fund: { id: 'fund_override' },
      softCreditPerson: { id: 'introducer' },
      softCreditType: 'INTRODUCER',
    }),
    row('already_processed', {
      processingStatus: 'PROCESSED',
      committedGift: { id: 'existing_gift' },
    }),
    row('requires_reconciliation', {
      processingStatus: 'PROCESS_FAILED',
      errorDetail: 'Reconcile before retrying',
    }),
  ]);

  expect(result).toMatchObject({
    totalItems: 5,
    processedItems: 2,
    notReadyItems: 1,
    failedItems: 0,
  });
  const creates = giftCreateCalls();
  expect(creates).toHaveLength(1);
  const gifts = creates[0][0].body;
  expect(gifts).toMatchObject([
    {
      donorId: 'person_1',
      externalId: 'bank-ref-40',
      paymentType: 'BANK_TRANSFER',
      appealId: 'appeal_1',
      appealSourceId: 'source_1',
      fundId: 'fund_1',
      amount: { amountMicros: 40_000_000, currencyCode: 'GBP' },
      reportingAmount: { amountMicros: 40_000_000, currencyCode: 'GBP' },
      reportingAmountStatus: 'SAME_CURRENCY',
    },
    {
      donorId: 'person_2',
      provider: 'STRIPE',
      providerPaymentId: 'pi_eur',
      appealId: 'appeal_1',
      appealSourceId: 'source_1',
      fundId: 'fund_override',
      softCreditPersonId: 'introducer',
      softCreditType: 'INTRODUCER',
      amount: { amountMicros: 30_000_000, currencyCode: 'EUR' },
      reportingAmountStatus: 'MISSING',
    },
  ]);
  expect(gifts[1]).not.toHaveProperty('reportingAmount');
  const writebacks = mocks.persist.mock.calls.flatMap(([records]) => records);
  expect(writebacks).toMatchObject([
    {
      id: 'awaiting_payment',
      processingStatus: 'NOT_PROCESSED',
      giftReadyStatus: 'NEEDS_REVIEW',
    },
    {
      id: 'staging_gbp',
      processingStatus: 'PROCESSED',
      committedGiftId: 'gift_gbp',
    },
    {
      id: 'staging_eur',
      processingStatus: 'PROCESSED',
      committedGiftId: 'gift_eur',
    },
  ]);
});

describe('gift execution commit boundary', () => {
  it('preserves a confirmed gift when actual donor enrichment requests fail', async () => {
    mocks.post
      .mockResolvedValueOnce({ data: { createGifts: [{ id: 'gift_1' }] } })
      .mockRejectedValueOnce(new Error('Donor update rejected'));
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const result = await executeSingleGiftProcessing(row());

    expect(result.writeback).toMatchObject({
      processingStatus: 'PROCESSED',
      committedGiftId: 'gift_1',
      executionPath: 'BATCH',
    });
    expect(result.stagingWritebackSucceeded).toBe(true);
    // One gift create, then one bulk donor update for both enrichments.
    expect(mocks.post).toHaveBeenCalledTimes(2);
    expect(mocks.post.mock.calls[1][0].path).toContain('/rest/batch/people');
    expect(mocks.mutation).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledOnce();
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
    expect(mocks.effects).not.toHaveBeenCalled();
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

  it('sends donor enrichment for a chunk as one bulk request, one entry per donor', async () => {
    mocks.post.mockImplementation(async ({ path, body }) =>
      String(path).startsWith('/rest/batch/gifts')
        ? {
            data: {
              createGifts: body.map((_: unknown, index: number) => ({
                id: `gift_${index + 1}`,
              })),
            },
          }
        : {},
    );

    await executeBatchGiftProcessing([row(), row('staging_2')]);

    const personCalls = mocks.post.mock.calls.filter(([request]) =>
      String(request?.path).startsWith('/rest/batch/people'),
    );

    expect(giftCreateCalls()).toHaveLength(1);
    expect(personCalls).toHaveLength(1);
    expect(personCalls[0][0].body).toHaveLength(1);
    expect(personCalls[0][0].body[0].id).toBe('person_1');
    expect(mocks.mutation).not.toHaveBeenCalled();
  });

  it('reports a rate-limited create as safe to retry, not as needing reconciliation', async () => {
    mocks.post.mockRejectedValue(
      Object.assign(new Error('Rate limit exceeded'), {
        errors: [{ extensions: { code: 'RATE_LIMITED', retryAfterMs: 100 } }],
      }),
    );

    const result = await executeBatchGiftProcessing([row(), row('staging_2')]);

    expect(result.successfulWritebacks).toEqual([]);
    expect(result.failedWritebacks).toHaveLength(2);
    for (const failed of result.failedWritebacks) {
      expect(failed.errorDetail).toContain('no gift was created');
      expect(failed.errorDetail).not.toContain('Reconcile');
    }
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
    expect(giftCreateCalls()).toHaveLength(1);
  });

  it('includes known gift IDs in a batch staging reconciliation error', async () => {
    mocks.persist.mockRejectedValue(new Error('Staging unavailable'));

    await expect(executeBatchGiftProcessing([row()])).rejects.toThrow(
      'staging_1:gift_1',
    );
    expect(giftCreateCalls()).toHaveLength(1);
  });
});
