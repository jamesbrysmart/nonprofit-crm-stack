import type { BatchProcessingRow } from './batch-processing.types';
import {
  hasLinkedDonorForProcessing,
  hasSufficientDonorEvidenceForNewDonor,
} from 'src/gift-staging-review/gift-staging-processability';

type BatchProcessingLikeRow = Pick<
  BatchProcessingRow,
  | 'amount'
  | 'donor'
  | 'donorFirstName'
  | 'donorLastName'
  | 'donorResolutionState'
  | 'giftDate'
  | 'processingStatus'
  | 'provider'
  | 'providerAgreementId'
  | 'providerIntervalCount'
  | 'providerIntervalUnit'
  | 'recurringAgreement'
  | 'sourceAppealName'
  | 'sourceFundName'
  | 'appeal'
  | 'fund'
>;

export type BatchPreflightIssueCode =
  | 'DONOR_REVIEW_REQUIRED'
  | 'DONOR_EVIDENCE_REQUIRED'
  | 'AMOUNT_REQUIRED'
  | 'AMOUNT_INVALID'
  | 'CURRENCY_REQUIRED'
  | 'GIFT_DATE_REQUIRED'
  | 'RECURRING_INTERVAL_INVALID'
  | 'SOURCE_APPEAL_REVIEW_REQUIRED'
  | 'SOURCE_FUND_REVIEW_REQUIRED';

export type BatchPreflightCategory =
  | 'PROCESSED'
  | 'FAILED'
  | 'READY'
  | 'NEEDS_REVIEW';

export type BatchPreflightResult = {
  category: BatchPreflightCategory;
  issueCodes: BatchPreflightIssueCode[];
};

const normalizeString = (value: string | null | undefined) =>
  typeof value === 'string' ? value.trim() : '';

const isProviderBackedRecurringRow = (row: BatchProcessingLikeRow) =>
  normalizeString(row.recurringAgreement?.id) === '' &&
  normalizeString(row.provider) !== '' &&
  normalizeString(row.providerAgreementId) !== '';

const hasSupportedRecurringCadence = (row: BatchProcessingLikeRow) => {
  if (!isProviderBackedRecurringRow(row)) {
    return true;
  }

  const unit = normalizeString(row.providerIntervalUnit).toLowerCase();
  const count = row.providerIntervalCount;

  if (
    unit === '' ||
    typeof count !== 'number' ||
    !Number.isInteger(count) ||
    count <= 0
  ) {
    return false;
  }

  return (
    (unit === 'week' && count === 1) ||
    (unit === 'month' && (count === 1 || count === 3)) ||
    (unit === 'year' && count === 1)
  );
};

export const classifyBatchPreflight = (
  row: BatchProcessingLikeRow,
): BatchPreflightResult => {
  const processingStatus = normalizeString(row.processingStatus).toUpperCase();

  if (processingStatus === 'PROCESSED') {
    return {
      category: 'PROCESSED',
      issueCodes: [],
    };
  }

  if (processingStatus === 'PROCESS_FAILED') {
    return {
      category: 'FAILED',
      issueCodes: [],
    };
  }

  const issueCodes: BatchPreflightIssueCode[] = [];
  const donorResolutionState = normalizeString(row.donorResolutionState).toUpperCase();
  const amountMicros = row.amount?.amountMicros;
  const currencyCode = normalizeString(row.amount?.currencyCode);
  const giftDate = normalizeString(row.giftDate);
  const sourceAppealName = normalizeString(row.sourceAppealName);
  const sourceFundName = normalizeString(row.sourceFundName);
  const linkedAppealId = normalizeString(row.appeal?.id);
  const linkedFundId = normalizeString(row.fund?.id);

  if (
    donorResolutionState === 'AMBIGUOUS'
  ) {
    issueCodes.push('DONOR_REVIEW_REQUIRED');
  }

  if (
    !hasLinkedDonorForProcessing({ linkedDonorId: row.donor?.id }) &&
    !hasSufficientDonorEvidenceForNewDonor({
      donorFirstName: row.donorFirstName,
      donorLastName: row.donorLastName,
    })
  ) {
    issueCodes.push('DONOR_EVIDENCE_REQUIRED');
  }

  if (typeof amountMicros !== 'number' || !Number.isFinite(amountMicros)) {
    issueCodes.push('AMOUNT_REQUIRED');
  } else if (amountMicros <= 0) {
    issueCodes.push('AMOUNT_INVALID');
  }

  if (currencyCode === '') {
    issueCodes.push('CURRENCY_REQUIRED');
  }

  if (giftDate === '') {
    issueCodes.push('GIFT_DATE_REQUIRED');
  }

  if (!hasSupportedRecurringCadence(row)) {
    issueCodes.push('RECURRING_INTERVAL_INVALID');
  }

  if (sourceAppealName !== '' && linkedAppealId === '') {
    issueCodes.push('SOURCE_APPEAL_REVIEW_REQUIRED');
  }

  if (sourceFundName !== '' && linkedFundId === '') {
    issueCodes.push('SOURCE_FUND_REVIEW_REQUIRED');
  }

  return {
    category: issueCodes.length === 0 ? 'READY' : 'NEEDS_REVIEW',
    issueCodes,
  };
};
