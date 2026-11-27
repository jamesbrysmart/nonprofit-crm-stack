import { describe, expect, it } from 'vitest';
import {
  buildGiftStagingReviewRecord,
  deriveReviewIssues,
  deriveReviewState,
} from 'src/gift-staging-review/gift-staging-review.model';
import type { StoredGiftStagingRecord } from 'src/gift-staging-review/gift-staging-review.types';

const stagedGift: StoredGiftStagingRecord = {
  id: 'staged-gift',
  name: 'Ada Lovelace’s donation',
  intakeSource: 'donation_form',
  amount: { amountMicros: 10_000_000, currencyCode: 'GBP' },
  giftDate: '2026-06-02',
  donationType: 'ONE_OFF',
  paymentType: 'CARD',
  donorFirstName: 'Ada',
  donorLastName: 'Lovelace',
  donorEmail: 'ada@example.org',
  donorPhone: null,
  isAnonymousDonor: false,
  donorMailingAddress: null,
  externalId: null,
  sourceFingerprint: null,
  providerEventId: null,
  provider: 'STRIPE',
  providerPaymentId: null,
  paymentProviderCustomerId: null,
  providerAgreementId: null,
  providerIntervalUnit: null,
  providerIntervalCount: null,
  rawProviderEvidence: null,
  appealSourceExternalId: null,
  sourceAppealName: null,
  sourceFundName: null,
  donorResolutionState: 'CONFIRMED',
  donor: { id: 'ada' },
  giftReadyStatus: 'NEEDS_REVIEW',
  paymentState: 'PAYMENT_CONFIRMED',
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
  appeal: null,
  appealSource: null,
  softCreditPerson: null,
  softCreditCompany: null,
  softCreditType: null,
  fund: null,
  giftBatch: null,
  committedGift: null,
};

const projectGift = (overrides: Partial<StoredGiftStagingRecord>) =>
  buildGiftStagingReviewRecord({ ...stagedGift, ...overrides });

describe('staged gift review', () => {
  it.each([
    ['AWAITING_PAYMENT', 'Awaiting payment', 'not finished payment confirmation'],
    ['PAYMENT_EXPIRED', 'Payment expired', 'did not complete payment'],
  ] as const)(
    'keeps %s separate from coding issues that need operator action',
    (paymentState, title, reason) => {
      const gift = projectGift({
        paymentState,
        appealSourceExternalId: 'provider-source',
      });

      expect(deriveReviewState(gift)).toMatchObject({
        title,
        reason: expect.stringContaining(reason),
      });
      expect(deriveReviewIssues(gift)).toEqual([]);
    },
  );

  it('shows unresolved source evidence even after an earlier readiness check', () => {
    const uncheckedCoding = {
      ...stagedGift,
      giftReadyStatus: 'READY_TO_PROCESS',
      appealSourceExternalId: 'provider-source',
    } satisfies StoredGiftStagingRecord;
    const pending = buildGiftStagingReviewRecord(uncheckedCoding);

    expect(pending.giftReadyStatus).toBe('NEEDS_REVIEW');
    expect(deriveReviewState(pending)).toMatchObject({
      title: 'Needs review',
      reason: expect.stringContaining('external appeal source ID'),
    });

    const corrected = {
      ...uncheckedCoding,
      appeal: { id: 'appeal' },
      appealSource: { id: 'source', appeal: { id: 'appeal' } },
      giftReadyStatus: 'NEEDS_REVIEW',
    } satisfies StoredGiftStagingRecord;
    expect(deriveReviewState(buildGiftStagingReviewRecord(corrected)).title)
      .toBe('Can likely be processed');

    const checked = buildGiftStagingReviewRecord({
      ...corrected,
      giftReadyStatus: 'READY_TO_PROCESS',
    });
    expect(deriveReviewState(checked).title).toBe('Ready to process');
    expect(deriveReviewIssues(checked)).toEqual([]);
  });

  it('shows both an existing-donor conflict and a missing payment type', () => {
    const gift = buildGiftStagingReviewRecord(
      {
        ...stagedGift,
        donor: null,
        donorResolutionState: 'NEW_DONOR',
        paymentType: null,
      },
      {
        category: 'NEEDS_REVIEW',
        issueCodes: ['PAYMENT_TYPE_REQUIRED', 'DONOR_PRIMARY_EMAIL_CONFLICT'],
      },
    );

    const labels = deriveReviewIssues(gift).map(({ label }) => label).sort();
    expect(labels).toEqual([
      'Email already belongs to an existing donor',
      'Payment type is missing',
    ]);
  });

  it('presents an invalid amount and missing currency as one correction', () => {
    const gift = projectGift({ amount: { amountMicros: 0, currencyCode: null } });

    expect(deriveReviewIssues(gift).map(({ label }) => label)).toEqual([
      'Amount or currency is incomplete or invalid',
    ]);
  });
});
