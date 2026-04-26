export type GiftAidClaimBatchStatus =
  | 'DRAFT'
  | 'SUBMITTING'
  | 'SUBMITTED'
  | 'SUBMISSION_FAILED';

export type GiftAidClaimSubmissionStatus = 'QUEUED' | 'SENT' | 'FAILED';

export type GiftAidClaimSubmissionEnvironment = 'TEST' | 'LIVE';

export type GiftAidClaimBatchRecord = {
  id: string;
  name: string;
  status: GiftAidClaimBatchStatus;
  submittedAt?: string | null;
  giftCount?: number | null;
  totalAmount?: {
    amountMicros?: number | null;
    currencyCode?: string | null;
  } | null;
  hasBlockingIssues?: boolean | null;
  blockingIssueCount?: number | null;
};

export type GiftAidClaimGiftRecord = {
  id: string;
  name?: string | null;
  giftAidStatus?: string | null;
  giftAidReasonCode?: string | null;
  amount?: {
    amountMicros?: number | null;
    currencyCode?: string | null;
  } | null;
};

export type GiftAidClaimSubmissionRecord = {
  id: string;
  name: string;
  status: GiftAidClaimSubmissionStatus;
  environment: GiftAidClaimSubmissionEnvironment;
  submittedAt?: string | null;
  completedAt?: string | null;
  externalSubmissionId?: string | null;
  correlationId?: string | null;
  failureCode?: string | null;
  failureMessage?: string | null;
  snapshotJson?: string | null;
  responseJson?: string | null;
};

export type GiftAidClaimSubmissionSnapshot = {
  schemaVersion: 'gift-aid-claim-submission/v1';
  batchId: string;
  batchName: string;
  giftCount: number;
  totalAmountMicros: number;
  giftIds: string[];
  environment: GiftAidClaimSubmissionEnvironment;
};

export type GiftAidClaimWorkspaceRecord = {
  batch: GiftAidClaimBatchRecord | null;
  gifts: GiftAidClaimGiftRecord[];
  submissions: GiftAidClaimSubmissionRecord[];
};
