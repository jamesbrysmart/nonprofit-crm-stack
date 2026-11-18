import type { ThemeColor } from 'twenty-ui/theme';
import type {
  GiftAidClaimBatchStatus,
  GiftAidClaimSubmissionEnvironment,
  GiftAidClaimSubmissionRecord,
  GiftAidClaimSubmissionStatus,
} from 'src/gift-aid-claims/gift-aid-claim.types';

// Labels match the select options on the claim batch and submission objects.
const CLAIM_STATUS_LABELS: Record<GiftAidClaimBatchStatus, string> = {
  DRAFT: 'Draft',
  FINALIZED: 'Finalized',
};

const SUBMISSION_STATUS_LABELS: Record<GiftAidClaimSubmissionStatus, string> = {
  QUEUED: 'Queued',
  BUILT: 'Built',
  ACKNOWLEDGED: 'Acknowledged',
  AWAITING_RESPONSE: 'Awaiting response',
  RESPONDED: 'Responded',
  FAILED: 'Failed',
  TIMED_OUT: 'Timed out',
};

const ENVIRONMENT_LABELS: Record<GiftAidClaimSubmissionEnvironment, string> = {
  TEST: 'Test',
  LIVE: 'Live',
};

export const formatClaimStatus = (status?: GiftAidClaimBatchStatus | null) =>
  status ? CLAIM_STATUS_LABELS[status] ?? status : 'Unknown';

export const formatSubmissionStatus = (
  status?: GiftAidClaimSubmissionStatus | null,
) => (status ? SUBMISSION_STATUS_LABELS[status] ?? status : 'Not queued');

export const formatSubmissionEnvironment = (
  environment?: GiftAidClaimSubmissionEnvironment | null,
) => (environment ? ENVIRONMENT_LABELS[environment] ?? environment : 'Unknown');

export const getSubmissionStatusColor = (
  status?: GiftAidClaimSubmissionStatus | null,
): ThemeColor =>
  status === 'FAILED' || status === 'TIMED_OUT'
    ? 'amber'
    : status === 'RESPONDED'
      ? 'green'
      : 'gray';

export const formatDateTime = (value?: string | null) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('en-GB', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(date);
};

const submissionTime = (submission: GiftAidClaimSubmissionRecord) =>
  Date.parse(submission.submittedAt ?? submission.completedAt ?? '') || 0;

export const getLatestSubmission = (
  submissions: GiftAidClaimSubmissionRecord[],
) =>
  [...submissions].sort(
    (left, right) => submissionTime(right) - submissionTime(left),
  )[0] ?? null;
