export type GiftAidClaimBatchStatus =
  | 'DRAFT'
  | 'SUBMITTED';

export type GiftAidClaimSubmissionStatus =
  | 'QUEUED'
  | 'BUILT'
  | 'SENT'
  | 'FAILED';

export type GiftAidClaimSubmissionEnvironment = 'TEST' | 'LIVE';

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
  giftDate?: string | null;
  giftAidStatus?: string | null;
  giftAidReasonCode?: string | null;
  giftAidDecisionSource?: string | null;
  giftAidDeclarationId?: string | null;
  donorFirstName?: string | null;
  donorLastName?: string | null;
  donorEmail?: string | null;
  donor?: {
    id?: string | null;
    mailingAddress?: MailingAddress;
  } | null;
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
  submittedToHmrcAt?: string | null;
  lastPolledAt?: string | null;
  completedAt?: string | null;
  externalSubmissionId?: string | null;
  correlationId?: string | null;
  transactionId?: string | null;
  failureCode?: string | null;
  failureMessage?: string | null;
  snapshotJson?: string | null;
  snapshotHash?: string | null;
  responseJson?: string | null;
  errorSummaryJson?: string | null;
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
};
