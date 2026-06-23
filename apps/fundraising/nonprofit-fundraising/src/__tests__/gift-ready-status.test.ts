import { describe, expect, it } from 'vitest';
import { evaluateGiftReadyRow } from 'src/gift-staging-review/gift-ready-status';

describe('evaluateGiftReadyRow', () => {
  it('reports primary email conflict alongside other blockers', () => {
    const evaluation = evaluateGiftReadyRow({
      row: {
        id: 'row-1',
        amount: {
          amountMicros: 10_000_000,
          currencyCode: 'GBP',
        },
        donor: null,
        donorEmail: 'ada@example.org',
        donorFirstName: 'Ada',
        donorLastName: 'Lovelace',
        isAnonymousDonor: false,
        donorResolutionState: 'UNREVIEWED',
        giftDate: '2026-05-12',
        paymentType: null,
        paymentState: null,
        processingStatus: 'NOT_PROCESSED',
        provider: null,
        providerAgreementId: null,
        providerIntervalCount: null,
        providerIntervalUnit: null,
        appealSourceExternalId: null,
        sourceAppealName: null,
        sourceFundName: null,
        appeal: null,
        appealSource: null,
        fund: null,
        recurringAgreement: null,
      },
      peopleByEmail: new Map([
        [
          'ada@example.org',
          {
            id: 'person-1',
            name: {
              firstName: 'Ada',
              lastName: 'Lovelace',
            },
            emails: {
              primaryEmail: 'ada@example.org',
            },
          },
        ],
      ]),
    });

    expect(evaluation.giftReadyStatus).toBe('NEEDS_REVIEW');
    expect(evaluation.preflight).toEqual({
      category: 'NEEDS_REVIEW',
      issueCodes: [
        'PAYMENT_TYPE_REQUIRED',
        'DONOR_PRIMARY_EMAIL_CONFLICT',
      ],
    });
    expect(evaluation.hasPrimaryEmailConflict).toBe(true);
  });
});
