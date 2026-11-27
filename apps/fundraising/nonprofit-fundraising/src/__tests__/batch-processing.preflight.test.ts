import { describe, expect, it } from 'vitest';
import { classifyBatchPreflight } from 'src/batch-processing/batch-processing.preflight';

type PreflightRow = Parameters<typeof classifyBatchPreflight>[0];

const buildRow = (overrides: Partial<PreflightRow> = {}): PreflightRow => ({
  donorFirstName: 'Ada',
  donorLastName: 'Lovelace',
  amount: {
    amountMicros: 10_000_000,
    currencyCode: 'GBP',
  },
  giftDate: '2026-05-12',
  paymentType: 'CARD',
  provider: null,
  providerAgreementId: null,
  providerIntervalUnit: null,
  providerIntervalCount: null,
  isAnonymousDonor: false,
  appealSourceExternalId: null,
  sourceAppealName: null,
  sourceFundName: null,
  donorResolutionState: 'UNREVIEWED',
  donor: null,
  fund: null,
  appeal: null,
  appealSource: null,
  processingStatus: 'NOT_PROCESSED',
  recurringAgreement: null,
  ...overrides,
});

describe('classifyBatchPreflight', () => {
  it('treats rows with core gift data and donor evidence as ready', () => {
    expect(classifyBatchPreflight(buildRow())).toEqual({
      category: 'READY',
      issueCodes: [],
    });
  });

  it('requires complete donor names when no donor is linked', () => {
    const row = buildRow({ donorFirstName: '' });

    expect(classifyBatchPreflight(row)).toEqual({
      category: 'NEEDS_REVIEW',
      issueCodes: ['DONOR_EVIDENCE_REQUIRED'],
    });
    expect(
      classifyBatchPreflight({ ...row, donor: { id: 'person_1' } }),
    ).toEqual({ category: 'READY', issueCodes: [] });
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

  it('requires explicit review for initial-only donor evidence while unreviewed', () => {
    expect(
      classifyBatchPreflight(
        buildRow({
          donorFirstName: 'J',
          donorLastName: 'Smith',
          donorResolutionState: 'UNREVIEWED',
        }),
      ),
    ).toEqual({
      category: 'NEEDS_REVIEW',
      issueCodes: ['DONOR_REVIEW_REQUIRED'],
    });

    expect(
      classifyBatchPreflight(
        buildRow({
          donorFirstName: 'A',
          donorLastName: 'M',
          donorResolutionState: null,
        }),
      ),
    ).toEqual({
      category: 'NEEDS_REVIEW',
      issueCodes: ['DONOR_REVIEW_REQUIRED'],
    });

    expect(
      classifyBatchPreflight(
        buildRow({
          donorFirstName: 'James',
          donorLastName: 'S',
          donorResolutionState: 'UNREVIEWED',
        }),
      ),
    ).toEqual({
      category: 'NEEDS_REVIEW',
      issueCodes: ['DONOR_REVIEW_REQUIRED'],
    });
  });

  it('allows reviewed initial-only donor evidence on the new-donor path', () => {
    expect(
      classifyBatchPreflight(
        buildRow({
          donorFirstName: 'J',
          donorLastName: 'Smith',
          donorResolutionState: 'NEW_DONOR',
        }),
      ),
    ).toEqual({
      category: 'READY',
      issueCodes: [],
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
        }),
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
