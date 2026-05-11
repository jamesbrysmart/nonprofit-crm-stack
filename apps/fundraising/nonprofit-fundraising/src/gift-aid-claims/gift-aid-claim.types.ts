export type GiftAidClaimBatchStatus = 'DRAFT' | 'FINALIZED';

export type GiftAidClaimSubmissionStatus =
  | 'QUEUED'
  | 'BUILT'
  | 'ACKNOWLEDGED'
  | 'AWAITING_RESPONSE'
  | 'RESPONDED'
  | 'FAILED'
  | 'TIMED_OUT';

export type GiftAidClaimSubmissionEnvironment = 'TEST' | 'LIVE';

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue =
  | JsonPrimitive
  | { [key: string]: JsonValue }
  | JsonValue[];

export type MailingAddress = {
  addressStreet1?: string | null;
  addressStreet2?: string | null;
  addressCity?: string | null;
  addressState?: string | null;
  addressPostcode?: string | null;
  addressCountry?: string | null;
} | null;

export type GiftAidClaimBatchRecord = {
  id: string;
  name: string;
  status?: GiftAidClaimBatchStatus | null;
  submittedAt?: string | null;
  latestSubmissionStatus?: GiftAidClaimSubmissionStatus | null;
  giftCount?: number | null;
  totalAmount?:
    | {
        amountMicros?: number | null;
        currencyCode?: string | null;
      }
    | null;
  hasBlockingIssues?: boolean | null;
  blockingIssueCount?: number | null;
  notes?: string | null;
};

export type GiftAidClaimGiftRecord = {
  id: string;
  name?: string | null;
  giftDate?: string | null;
  giftAidStatus?: string | null;
  giftAidReasonCode?: string | null;
  giftAidDecisionSource?: string | null;
  amount?:
    | {
        amountMicros?: number | null;
        currencyCode?: string | null;
      }
    | null;
  donorFirstName?: string | null;
  donorLastName?: string | null;
  donorEmail?: string | null;
  donor?: {
    id?: string | null;
    mailingAddress?: MailingAddress;
  } | null;
  giftAidDeclaration?: {
    id?: string | null;
  } | null;
};

export type GiftAidClaimSubmissionRecord = {
  id: string;
  name: string;
  status: GiftAidClaimSubmissionStatus;
  environment: GiftAidClaimSubmissionEnvironment;
  submittedAt?: string | null;
  submittedToHmrcAt?: string | null;
  lastPolledAt?: string | null;
  completedAt?: string | null;
  correlationId?: string | null;
  transactionId?: string | null;
  failureCode?: string | null;
  failureMessage?: string | null;
  snapshotJson?: JsonValue;
  snapshotHash?: string | null;
  responseJson?: JsonValue;
  errorSummaryJson?: JsonValue;
};

export type GiftAidClaimSubmissionSnapshot = {
  schemaVersion: 'gift-aid-claim-submission/v1';
  batch: {
    id: string;
    name: string;
    submittedAt?: string | null;
    giftCount: number;
    totalAmountMicros: number;
    blockingIssueCount: number;
    hasBlockingIssues: boolean;
  };
  gifts: Array<{
    id: string;
    giftDate?: string | null;
    giftAidStatus?: string | null;
    giftAidReasonCode?: string | null;
    giftAidDecisionSource?: string | null;
    giftAidDeclarationId?: string | null;
    donorFirstName?: string | null;
    donorLastName?: string | null;
    donorEmail?: string | null;
    donorMailingAddress?: MailingAddress;
    amountMicros: number;
    currencyCode: string;
  }>;
  environment: GiftAidClaimSubmissionEnvironment;
};

export type GiftAidClaimWorkspaceRecord = {
  batch: GiftAidClaimBatchRecord | null;
  gifts: GiftAidClaimGiftRecord[];
  submissions: GiftAidClaimSubmissionRecord[];
  needsReviewGifts: GiftAidClaimGiftRecord[];
};

export type FinalizeGiftAidClaimBatchResponse = {
  claimBatchId: string;
  submittedAt: string;
  nextDraftBatchId: string;
  status: 'FINALIZED';
};

export type QueueGiftAidClaimSubmissionResponse = {
  claimBatchId: string;
  submissionId: string;
  status:
    | 'BUILT'
    | 'ACKNOWLEDGED'
    | 'AWAITING_RESPONSE'
    | 'RESPONDED'
    | 'FAILED'
    | 'TIMED_OUT';
};
