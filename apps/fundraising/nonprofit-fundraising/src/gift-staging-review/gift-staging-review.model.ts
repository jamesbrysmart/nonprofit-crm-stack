import type {
  DerivedReviewState,
  DonorResolution,
  GiftStagingReviewRecord,
  PaymentState,
  ProcessingStatus,
  StoredGiftStagingRecord,
} from './gift-staging-review.types';
import type { PersonSummary } from 'src/manual-gift-entry/manual-gift-entry.types';
import { classifyBatchPreflight } from 'src/batch-processing/batch-processing.preflight';
import { normalizeGiftReadyStatus } from './gift-ready-status';

const coalesceString = (
  value: string | null | undefined,
  fallback = '',
): string => {
  if (typeof value !== 'string') {
    return fallback;
  }

  const trimmed = value.trim();

  return trimmed === '' ? fallback : trimmed;
};

export const buildPersonDisplayName = (person: PersonSummary | null): string => {
  if (!person) {
    return '';
  }

  const firstName = coalesceString(person.name?.firstName);
  const lastName = coalesceString(person.name?.lastName);
  const fullName = `${firstName} ${lastName}`.trim();

  if (fullName !== '') {
    return fullName;
  }

  return coalesceString(person.emails?.primaryEmail, 'Linked donor');
};

const buildEvidenceName = (
  donorFirstName: string,
  donorLastName: string,
  donorEmail: string,
) => {
  const fullName = `${donorFirstName} ${donorLastName}`.trim();

  if (fullName !== '') {
    return fullName;
  }

  return donorEmail !== '' ? donorEmail : 'Unknown donor evidence';
};

const formatAmountDisplay = (
  amount:
    | {
        amountMicros?: number | null;
        currencyCode?: string | null;
      }
    | string
    | null,
) => {
  if (typeof amount === 'string') {
    return coalesceString(amount, 'Unknown amount');
  }

  if (!amount || typeof amount.amountMicros !== 'number') {
    return 'Unknown amount';
  }

  const currencyCode = coalesceString(amount.currencyCode, 'GBP');

  return `${currencyCode} ${(amount.amountMicros / 1_000_000).toFixed(2)}`;
};

const mapDonorResolution = (
  storedValue: string | null | undefined,
  linkedDonor: PersonSummary | null,
): DonorResolution => {
  if (linkedDonor) {
    return 'CONFIRMED';
  }

  switch (storedValue) {
    case 'CONFIRMED':
      return 'CONFIRMED';
    case 'NEW_DONOR':
      return 'NEW_DONOR';
    case 'AMBIGUOUS':
      return 'AMBIGUOUS';
    default:
      return 'UNREVIEWED';
  }
};

const mapProcessingStatus = (
  storedValue: string | null | undefined,
): ProcessingStatus => {
  switch (storedValue) {
    case 'PROCESSED':
      return 'PROCESSED';
    case 'PROCESS_FAILED':
      return 'PROCESS_FAILED';
    default:
      return 'NOT_PROCESSED';
  }
};

const mapPaymentState = (
  storedValue: string | null | undefined,
): PaymentState | null => {
  switch (storedValue) {
    case 'AWAITING_PAYMENT':
    case 'PAYMENT_CONFIRMED':
    case 'PAYMENT_FAILED':
    case 'PAYMENT_EXPIRED':
      return storedValue;
    default:
      return null;
  }
};

export const buildGiftStagingReviewRecord = (
  stored: StoredGiftStagingRecord,
): GiftStagingReviewRecord => {
  const donorFirstName = coalesceString(stored.donorFirstName);
  const donorLastName = coalesceString(stored.donorLastName);
  const donorEmail = coalesceString(stored.donorEmail);
  const linkedDonor = stored.donor ?? null;
  const preflight = classifyBatchPreflight({
    amount:
      typeof stored.amount === 'string' ? null : stored.amount,
    donor: stored.donor,
    donorFirstName: stored.donorFirstName,
    donorLastName: stored.donorLastName,
    donorResolutionState: stored.donorResolutionState,
    giftDate: stored.giftDate,
    processingStatus: stored.processingStatus,
    provider: stored.provider,
    providerAgreementId: stored.providerAgreementId,
    providerIntervalCount: stored.providerIntervalCount,
    providerIntervalUnit: stored.providerIntervalUnit,
    sourceAppealName: stored.sourceAppealName,
    sourceFundName: stored.sourceFundName,
    appeal: stored.appeal,
    fund: stored.fund,
    recurringAgreement: stored.recurringAgreement,
  });

  return {
    id: stored.id,
    name: coalesceString(
      stored.name,
      buildEvidenceName(donorFirstName, donorLastName, donorEmail),
    ),
    intakeSource: coalesceString(stored.intakeSource, 'Unknown source'),
    amountDisplay: formatAmountDisplay(stored.amount),
    giftDate: coalesceString(stored.giftDate),
    donationType: coalesceString(stored.donationType),
    donorFirstName,
    donorLastName,
    donorEmail,
    donorPhone: coalesceString(stored.donorPhone),
    externalId: coalesceString(stored.externalId),
    sourceFingerprint: coalesceString(stored.sourceFingerprint),
    providerEventId: coalesceString(stored.providerEventId),
    provider: coalesceString(stored.provider),
    providerPaymentId: coalesceString(stored.providerPaymentId),
    paymentProviderCustomerId: coalesceString(
      stored.paymentProviderCustomerId,
    ),
    providerAgreementId: coalesceString(stored.providerAgreementId),
    providerIntervalUnit: coalesceString(stored.providerIntervalUnit),
    providerIntervalCount:
      typeof stored.providerIntervalCount === 'number'
        ? stored.providerIntervalCount
        : null,
    rawProviderEvidence: stored.rawProviderEvidence ?? null,
    sourceAppealName: coalesceString(stored.sourceAppealName),
    sourceFundName: coalesceString(stored.sourceFundName),
    appealId: coalesceString(stored.appeal?.id),
    appealName: coalesceString(stored.appeal?.name),
    appealDefaultFundId: coalesceString(stored.appeal?.defaultFund?.id),
    fundId: coalesceString(stored.fund?.id),
    fundName: coalesceString(stored.fund?.name),
    donorEvidenceName: buildEvidenceName(
      donorFirstName,
      donorLastName,
      donorEmail,
    ),
    donorResolution: mapDonorResolution(
      stored.donorResolutionState,
      linkedDonor,
    ),
    linkedDonor,
    linkedDonorName: buildPersonDisplayName(linkedDonor),
    giftReadyStatus: normalizeGiftReadyStatus(stored.giftReadyStatus),
    paymentState: mapPaymentState(stored.paymentState),
    processingStatus: mapProcessingStatus(stored.processingStatus),
    errorDetail: coalesceString(stored.errorDetail),
    giftAidRequested: stored.giftAidRequested ?? false,
    giftAidDeclarationCaptured: stored.giftAidDeclarationCaptured ?? false,
    giftAidDeclarationDate: coalesceString(stored.giftAidDeclarationDate),
    giftAidCoverageScope: coalesceString(stored.giftAidCoverageScope),
    giftAidDeclarationSource: coalesceString(stored.giftAidDeclarationSource),
    giftAidTextVersion: coalesceString(stored.giftAidTextVersion),
    giftAidDeclarationId: coalesceString(stored.giftAidDeclaration?.id),
    giftBatchId: coalesceString(stored.giftBatch?.id),
    giftBatchName: coalesceString(stored.giftBatch?.name, 'No batch'),
    committedGiftId: coalesceString(stored.committedGift?.id),
    committedGiftName: coalesceString(
      stored.committedGift?.name,
      stored.committedGift?.id ? 'Committed gift linked' : 'Not processed',
    ),
    preflightCategory: preflight.category,
    preflightIssueCodes: preflight.issueCodes,
  };
};

export const deriveReviewState = (
  record: GiftStagingReviewRecord,
): DerivedReviewState => {
  const hasLinkedDonor = Boolean(record.linkedDonor?.id);

  if (record.processingStatus === 'PROCESSED') {
    return {
      title: 'Processed',
      accent: '#1a7f37',
      background: '#eef9f0',
      reason: 'This gift has already been processed into a gift record.',
      nextAction:
        record.committedGiftId !== ''
          ? 'Open the gift record if you need to review the completed gift.'
          : 'This gift no longer needs review here.',
      hasBlocker: false,
    };
  }

  if (record.giftReadyStatus === 'NEEDS_REVIEW') {
    if (record.preflightIssueCodes.includes('DONOR_REVIEW_REQUIRED')) {
      if (record.errorDetail !== '') {
        return {
          title: 'Needs review',
          accent: '#9a6700',
          background: '#fff8c5',
          reason: record.errorDetail,
          nextAction:
            'Review the donor candidate, link the right donor, or correct the staged donor details before processing.',
          hasBlocker: true,
        };
      }

      return {
        title: 'Needs review',
        accent: '#9a6700',
        background: '#fff8c5',
        reason:
          'More than one donor could match this gift. Choose the right donor before processing.',
        nextAction:
          'Choose a donor now, or leave this for later review.',
        hasBlocker: true,
      };
    }

    if (record.preflightIssueCodes.includes('GIFT_DATE_REQUIRED')) {
      return {
        title: 'Needs review',
        accent: '#7c5d00',
        background: '#fff8e1',
        reason:
          'Gift date is missing. Add the date before processing this gift.',
        nextAction:
          'Open Details to update the gift date, then come back to processing when the row is complete.',
        hasBlocker: true,
      };
    }

    if (
      record.preflightIssueCodes.includes('AMOUNT_REQUIRED') ||
      record.preflightIssueCodes.includes('AMOUNT_INVALID') ||
      record.preflightIssueCodes.includes('CURRENCY_REQUIRED')
    ) {
      return {
        title: 'Needs review',
        accent: '#7c5d00',
        background: '#fff8e1',
        reason:
          'Amount details are incomplete or invalid. Fix the gift amount before processing this row.',
        nextAction:
          'Open Details to update the amount, then recheck the row before processing.',
        hasBlocker: true,
      };
    }

    if (record.preflightIssueCodes.includes('DONOR_EVIDENCE_REQUIRED')) {
      return {
        title: 'Needs review',
        accent: '#7c5d00',
        background: '#fff8e1',
        reason:
          'Donor evidence is incomplete. Add enough donor details before this gift can be processed.',
        nextAction:
          'Capture donor details or link the right donor, then come back to processing.',
        hasBlocker: true,
      };
    }

    if (record.preflightIssueCodes.includes('RECURRING_INTERVAL_INVALID')) {
      return {
        title: 'Needs review',
        accent: '#7c5d00',
        background: '#fff8e1',
        reason:
          'Recurring interval evidence is not in a supported shape for processing.',
        nextAction:
          'Review the recurring details before processing this row.',
        hasBlocker: true,
      };
    }

    if (
      record.preflightIssueCodes.includes('SOURCE_APPEAL_REVIEW_REQUIRED') ||
      record.preflightIssueCodes.includes('SOURCE_FUND_REVIEW_REQUIRED')
    ) {
      const needsAppeal = record.preflightIssueCodes.includes(
        'SOURCE_APPEAL_REVIEW_REQUIRED',
      );
      const needsFund = record.preflightIssueCodes.includes(
        'SOURCE_FUND_REVIEW_REQUIRED',
      );

      return {
        title: 'Needs review',
        accent: '#7c5d00',
        background: '#fff8e1',
        reason:
          needsAppeal && needsFund
            ? 'Source appeal/campaign and fund/designation are recorded but not yet linked.'
            : needsAppeal
              ? 'Source appeal/campaign is recorded but no appeal is linked yet.'
              : 'Source fund/designation is recorded but no fund is linked yet.',
        nextAction:
          'Review the source coding evidence and link the right appeal and/or fund before processing.',
        hasBlocker: true,
      };
    }
  }

  if (record.preflightCategory === 'READY') {
    return {
      title:
        record.giftReadyStatus === 'READY_TO_PROCESS'
          ? 'Ready to process'
          : 'Can likely be processed',
      accent: '#1a7f37',
      background: '#eef9f0',
      reason:
        record.giftReadyStatus === 'READY_TO_PROCESS'
          ? 'This gift has passed the current readiness checks and can be processed.'
          : 'This gift looks complete, but it has not been checked for readiness yet.',
      nextAction:
        record.giftReadyStatus === 'READY_TO_PROCESS'
          ? 'Process it now, or come back to it later from the queue or batch.'
          : 'Run the readiness check if you want to confirm this row before processing.',
      hasBlocker: false,
    };
  }

  if (record.processingStatus === 'PROCESS_FAILED') {
    return {
      title: 'Processing failed',
      accent: '#8a2d2d',
      background: '#fff5f5',
      reason:
        'A previous processing attempt failed, so this gift needs attention before you try again.',
      nextAction:
        'Fix the problem, then run the readiness check again before processing.',
      hasBlocker: true,
    };
  }

  if (!hasLinkedDonor && record.donorResolution === 'UNREVIEWED') {
    return {
      title: 'Needs donor review',
      accent: '#7c5d00',
      background: '#fff8e1',
      reason:
        'No donor has been confirmed yet. Review possible matches or confirm this as a new donor.',
      nextAction:
        'Find possible matches and choose the right donor, or leave this for later review.',
      hasBlocker: false,
    };
  }

  if (!hasLinkedDonor && record.donorResolution === 'NEW_DONOR') {
    return {
      title: 'New donor on processing',
      accent: '#57606a',
      background: '#f6f8fa',
      reason:
        'No existing donor was chosen. If this row is otherwise ready, processing will create a new donor.',
      nextAction:
        'Run the readiness check when you are satisfied, or come back later if more donor review is needed.',
      hasBlocker: false,
    };
  }

  return {
    title: 'Active review',
    accent: '#57606a',
    background: '#f6f8fa',
    reason:
      'The donor has been set, but this gift still needs a readiness check before processing.',
    nextAction:
      'Make any final changes, then run the readiness check when you are satisfied.',
    hasBlocker: false,
  };
};
