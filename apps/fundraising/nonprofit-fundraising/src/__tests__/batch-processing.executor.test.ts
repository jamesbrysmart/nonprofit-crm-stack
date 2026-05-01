import { describe, expect, it } from 'vitest';

import {
  canProcessBatchRow,
  deriveRecurringCadenceFromProviderEvidence,
} from 'src/batch-processing/batch-processing.executor';
import type { BatchProcessingRow } from 'src/batch-processing/batch-processing.types';

describe('deriveRecurringCadenceFromProviderEvidence', () => {
  it.each([
    ['week', 1, 'WEEKLY', 1],
    ['month', 1, 'MONTHLY', 1],
    ['month', 3, 'QUARTERLY', 1],
    ['year', 1, 'ANNUAL', 1],
  ])(
    'maps provider interval %s/%s to %s',
    (providerIntervalUnit, providerIntervalCount, cadence, intervalCount) => {
      expect(
        deriveRecurringCadenceFromProviderEvidence({
          providerIntervalUnit,
          providerIntervalCount,
        }),
      ).toEqual({
        cadence,
        intervalCount,
      });
    },
  );

  it('rejects missing provider interval evidence', () => {
    expect(() =>
      deriveRecurringCadenceFromProviderEvidence({
        providerIntervalUnit: null,
        providerIntervalCount: 1,
      }),
    ).toThrow('Provider recurring interval unit is required');

    expect(() =>
      deriveRecurringCadenceFromProviderEvidence({
        providerIntervalUnit: 'month',
        providerIntervalCount: null,
      }),
    ).toThrow('Provider recurring interval count is required');
  });

  it('rejects intervals that cannot be represented safely yet', () => {
    expect(() =>
      deriveRecurringCadenceFromProviderEvidence({
        providerIntervalUnit: 'day',
        providerIntervalCount: 14,
      }),
    ).toThrow('Unsupported provider recurring interval 14 day');
  });
});

const buildProcessingRow = (
  overrides: Partial<BatchProcessingRow> = {},
): BatchProcessingRow => ({
  id: 'staging_1',
  name: 'Row',
  donorFirstName: 'Ada',
  donorLastName: 'Lovelace',
  donorEmail: 'ada@example.com',
  donorMailingAddress: null,
  amount: {
    amountMicros: 10_000_000,
    currencyCode: 'GBP',
  },
  giftDate: '2026-05-01',
  donationType: 'ONE_OFF',
  externalId: null,
  sourceFingerprint: null,
  providerEventId: null,
  provider: 'STRIPE',
  providerPaymentId: null,
  paymentProviderCustomerId: null,
  providerAgreementId: null,
  providerIntervalUnit: null,
  providerIntervalCount: null,
  donorPhone: null,
  rawProviderEvidence: null,
  donorResolutionState: 'UNREVIEWED',
  donor: null,
  hasCoreGiftIssue: false,
  isReadyForProcessing: true,
  processingStatus: 'NOT_READY',
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
  ...overrides,
});

describe('canProcessBatchRow', () => {
  it('allows a ready row with a linked donor', () => {
    expect(
      canProcessBatchRow(
        buildProcessingRow({
          donorResolutionState: 'CONFIRMED',
          donor: { id: 'person_1' },
        }),
      ),
    ).toBe(true);
  });

  it('allows a ready row with no linked donor when sufficient new-donor evidence is present', () => {
    expect(
      canProcessBatchRow(
        buildProcessingRow({
          donorResolutionState: 'UNRESOLVED',
          donor: null,
        }),
      ),
    ).toBe(true);
  });

  it('blocks an ambiguous donor row without a linked donor', () => {
    expect(
      canProcessBatchRow(
        buildProcessingRow({
          donorResolutionState: 'AMBIGUOUS',
          donor: null,
        }),
      ),
    ).toBe(false);
  });

  it('blocks a donorless row when the minimum new-donor evidence is incomplete', () => {
    expect(
      canProcessBatchRow(
        buildProcessingRow({
          donorFirstName: '',
          donorLastName: 'Lovelace',
          donor: null,
        }),
      ),
    ).toBe(false);
  });
});
