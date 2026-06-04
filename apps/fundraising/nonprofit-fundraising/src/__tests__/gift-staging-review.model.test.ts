import { describe, expect, it } from 'vitest';
import { deriveReviewState } from 'src/gift-staging-review/gift-staging-review.model';
import type { GiftStagingReviewRecord } from 'src/gift-staging-review/gift-staging-review.types';

const buildReviewRecord = (
  overrides?: Partial<GiftStagingReviewRecord>,
): GiftStagingReviewRecord =>
  ({
    id: 'gst_1',
    name: 'Test row',
    intakeSource: 'donation_form',
    amountDisplay: 'GBP 10.00',
    giftDate: '2026-06-02',
    donationType: 'RECURRING',
    paymentType: 'CARD',
    donorFirstName: 'Test',
    donorLastName: 'Donor',
    donorEmail: 'test@example.com',
    donorPhone: '',
    externalId: '',
    sourceFingerprint: '',
    providerEventId: '',
    provider: 'STRIPE',
    providerPaymentId: '',
    paymentProviderCustomerId: '',
    providerAgreementId: '',
    providerIntervalUnit: 'month',
    providerIntervalCount: 1,
    rawProviderEvidence: null,
    appealSourceExternalId: '',
    sourceAppealName: '',
    sourceFundName: '',
    appealId: '',
    appealName: '',
    appealSourceId: '',
    appealSourceName: '',
    appealDefaultFundId: '',
    fundId: '',
    fundName: '',
    softCreditPersonId: '',
    softCreditPersonName: '',
    softCreditCompanyId: '',
    softCreditCompanyName: '',
    softCreditType: '',
    donorEvidenceName: 'Test Donor',
    donorResolution: 'UNREVIEWED',
    linkedDonor: null,
    linkedDonorName: '',
    giftReadyStatus: 'NOT_READY',
    paymentState: null,
    processingStatus: 'NOT_PROCESSED',
    errorDetail: '',
    giftAidRequested: false,
    giftAidDeclarationCaptured: false,
    giftAidDeclarationDate: '',
    giftAidCoverageScope: '',
    giftAidDeclarationSource: '',
    giftAidTextVersion: '',
    giftAidDeclarationId: '',
    giftBatchId: '',
    giftBatchName: '',
    committedGiftId: '',
    committedGiftName: '',
    preflightCategory: 'NOT_READY',
    preflightIssueCodes: [],
    ...overrides,
  }) as GiftStagingReviewRecord;

describe('deriveReviewState', () => {
  it('returns awaiting-payment messaging for in-progress donation attempts', () => {
    const result = deriveReviewState(
      buildReviewRecord({
        paymentState: 'AWAITING_PAYMENT',
      }),
    );

    expect(result).toMatchObject({
      title: 'Awaiting payment',
      hasBlocker: false,
    });
    expect(result.reason).toContain('not finished payment confirmation');
  });

  it('returns expired-payment messaging for stale donation attempts', () => {
    const result = deriveReviewState(
      buildReviewRecord({
        paymentState: 'PAYMENT_EXPIRED',
      }),
    );

    expect(result).toMatchObject({
      title: 'Payment expired',
      hasBlocker: false,
    });
    expect(result.reason).toContain('did not complete payment');
  });

  it('uses attribution-style review messaging for unresolved appeal source external ids', () => {
    const result = deriveReviewState(
      buildReviewRecord({
        giftReadyStatus: 'NEEDS_REVIEW',
        preflightCategory: 'NEEDS_REVIEW',
        preflightIssueCodes: ['APPEAL_SOURCE_REVIEW_REQUIRED'],
        appealSourceExternalId: 'fm_123',
      }),
    );

    expect(result).toMatchObject({
      title: 'Needs review',
      hasBlocker: true,
    });
    expect(result.reason).toContain('external appeal source ID');
    expect(result.nextAction).toContain('appeal source');
  });
});
