import { describe, expect, it } from 'vitest';
import { classifyBatchPreflight } from 'src/batch-processing/batch-processing.preflight';
import type { BatchProcessingRow } from 'src/batch-processing/batch-processing.types';

const buildRow = (
  overrides: Partial<BatchProcessingRow> = {},
): BatchProcessingRow => ({
  id: 'row-1',
  name: 'Smoke row',
  donorFirstName: 'Ada',
  donorLastName: 'Lovelace',
  donorEmail: 'ada@example.org',
  donorMailingAddress: null,
  amount: {
    amountMicros: 10_000_000,
    currencyCode: 'GBP',
  },
  giftDate: '2026-05-12',
  donationType: null,
  paymentType: 'CARD',
  externalId: null,
  sourceFingerprint: null,
  providerEventId: null,
  provider: null,
  providerPaymentId: null,
  paymentProviderCustomerId: null,
  providerAgreementId: null,
  providerIntervalUnit: null,
  providerIntervalCount: null,
  donorPhone: null,
  supporterEmailOptOut: null,
  isAnonymousDonor: false,
  rawProviderEvidence: null,
  appealSourceExternalId: null,
  sourceAppealName: null,
  sourceFundName: null,
  donorResolutionState: 'UNREVIEWED',
  donor: null,
  fund: null,
  appeal: null,
  appealSource: null,
  giftReadyStatus: 'NEEDS_REVIEW',
  paymentState: null,
  processingStatus: 'NOT_PROCESSED',
  errorDetail: null,
  giftAidRequested: null,
  giftAidDeclarationCaptured: null,
  giftAidDeclarationDate: null,
  giftAidCoverageScope: null,
  giftAidDeclarationSource: null,
  giftAidTextVersion: null,
  giftAidDeclaration: null,
  recurringAgreement: null,
  committedGift: null,
  ...overrides,
});

describe('classifyBatchPreflight', () => {
  it('treats rows with core gift data and donor evidence as ready', () => {
    expect(classifyBatchPreflight(buildRow())).toEqual({
      category: 'READY',
      issueCodes: [],
    });
  });

  it('keeps ambiguous donor rows in needs review', () => {
    expect(
      classifyBatchPreflight(
        buildRow({
          donorResolutionState: 'AMBIGUOUS',
        }),
      ),
    ).toEqual({
      category: 'NEEDS_REVIEW',
      issueCodes: ['DONOR_REVIEW_REQUIRED'],
    });
  });

  it('flags missing core gift fields as needs review', () => {
    expect(
      classifyBatchPreflight(
        buildRow({
          amount: null,
          giftDate: null,
        }),
      ),
    ).toEqual({
      category: 'NEEDS_REVIEW',
      issueCodes: ['AMOUNT_REQUIRED', 'CURRENCY_REQUIRED', 'GIFT_DATE_REQUIRED'],
    });
  });

  it('flags missing payment type as needs review', () => {
    expect(
      classifyBatchPreflight(
        buildRow({
          paymentType: null,
        }),
      ),
    ).toEqual({
      category: 'NEEDS_REVIEW',
      issueCodes: ['PAYMENT_TYPE_REQUIRED'],
    });
  });

  it('flags unsupported provider recurring cadence as needs review', () => {
    expect(
      classifyBatchPreflight(
        buildRow({
          provider: 'STRIPE',
          providerAgreementId: 'sub_123',
          providerIntervalUnit: 'day',
          providerIntervalCount: 1,
        }),
      ),
    ).toEqual({
      category: 'NEEDS_REVIEW',
      issueCodes: ['RECURRING_INTERVAL_INVALID'],
    });
  });

  it('flags unresolved source coding evidence as needs review', () => {
    expect(
      classifyBatchPreflight(
        buildRow({
          appealSourceExternalId: 'fm_123',
        }),
      ),
    ).toEqual({
      category: 'NEEDS_REVIEW',
      issueCodes: ['APPEAL_SOURCE_REVIEW_REQUIRED'],
    });

    expect(
      classifyBatchPreflight(
        buildRow({
          sourceAppealName: 'Spring Appeal 2026',
        }),
      ),
    ).toEqual({
      category: 'NEEDS_REVIEW',
      issueCodes: ['SOURCE_APPEAL_REVIEW_REQUIRED'],
    });

    expect(
      classifyBatchPreflight(
        buildRow({
          sourceFundName: 'Emergency Relief',
        }),
      ),
    ).toEqual({
      category: 'NEEDS_REVIEW',
      issueCodes: ['SOURCE_FUND_REVIEW_REQUIRED'],
    });
  });

  it('allows an explicitly anonymous one-off gift without donor evidence', () => {
    expect(
      classifyBatchPreflight(
        buildRow({
          donorFirstName: '',
          donorLastName: '',
          donorEmail: '',
          isAnonymousDonor: true,
        }),
      ),
    ).toEqual({
      category: 'READY',
      issueCodes: [],
    });
  });

  it('blocks explicitly anonymous recurring gifts for now', () => {
    expect(
      classifyBatchPreflight(
        buildRow({
          donorFirstName: '',
          donorLastName: '',
          donorEmail: '',
          isAnonymousDonor: true,
          provider: 'STRIPE',
          providerAgreementId: 'sub_123',
          providerIntervalUnit: 'month',
          providerIntervalCount: 1,
        }),
      ),
    ).toEqual({
      category: 'NEEDS_REVIEW',
      issueCodes: ['ANONYMOUS_DONOR_RECURRING_UNSUPPORTED'],
    });
  });

  it('does not flag source coding evidence when canonical coding is already linked', () => {
    expect(
      classifyBatchPreflight(
        buildRow({
          appealSourceExternalId: 'fm_123',
          appealSource: {
            id: 'appeal-source-1',
            name: 'Fundraiser page',
            appeal: null,
          },
        } as Partial<BatchProcessingRow>),
      ),
    ).toEqual({
      category: 'READY',
      issueCodes: [],
    });

    expect(
      classifyBatchPreflight(
        buildRow({
          sourceAppealName: 'Spring Appeal 2026',
          appeal: {
            id: 'appeal-1',
            name: 'Spring Appeal 2026',
            defaultFund: null,
          },
        }),
      ),
    ).toEqual({
      category: 'READY',
      issueCodes: [],
    });

    expect(
      classifyBatchPreflight(
        buildRow({
          sourceFundName: 'Emergency Relief',
          fund: {
            id: 'fund-1',
            name: 'Emergency Response Fund',
          },
        }),
      ),
    ).toEqual({
      category: 'READY',
      issueCodes: [],
    });
  });

  it('preserves processed and failed rows as their own categories', () => {
    expect(
      classifyBatchPreflight(
        buildRow({
          processingStatus: 'PROCESSED',
        }),
      ).category,
    ).toBe('PROCESSED');

    expect(
      classifyBatchPreflight(
        buildRow({
          processingStatus: 'PROCESS_FAILED',
        }),
      ).category,
    ).toBe('FAILED');
  });
});
