import type { GiftReadyStatus } from 'src/gift-staging-review/gift-ready-status';

export type BatchStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'PROCESSED'
  | 'PROCESSED_WITH_ISSUES';

export type GiftStagingProcessingStatus =
  | 'NOT_PROCESSED'
  | 'PROCESSED'
  | 'PROCESS_FAILED';

export type GiftStagingPaymentState =
  | 'AWAITING_PAYMENT'
  | 'PAYMENT_CONFIRMED'
  | 'PAYMENT_FAILED'
  | 'PAYMENT_EXPIRED';

export type BatchSummaryRecord = {
  id: string;
  name: string;
  status: BatchStatus | string | null;
  source?: string | null;
  totalItems: number | null;
  processedItems: number | null;
  failedItems: number | null;
  expectedItemCount?: number | null;
  expectedTotalAmount?:
    | {
        amountMicros?: number | null;
        currencyCode?: string | null;
      }
    | null;
};

export type BatchProcessingRow = {
  id: string;
  name: string;
  donorFirstName: string | null;
  donorLastName: string | null;
  donorEmail: string | null;
  donorMailingAddress:
    | {
        addressStreet1?: string | null;
        addressStreet2?: string | null;
        addressCity?: string | null;
        addressState?: string | null;
        addressPostcode?: string | null;
        addressCountry?: string | null;
      }
    | null;
  amount:
    | {
        amountMicros?: number | null;
        currencyCode?: string | null;
      }
    | null;
  giftDate: string | null;
  donationType: string | null;
  paymentType: string | null;
  externalId: string | null;
  sourceFingerprint: string | null;
  providerEventId: string | null;
  provider: string | null;
  providerPaymentId: string | null;
  coveredFeeAmount:
    | {
        amountMicros?: number | null;
        currencyCode?: string | null;
      }
    | null;
  grossPaymentAmount:
    | {
        amountMicros?: number | null;
        currencyCode?: string | null;
      }
    | null;
  processingFeeAmount:
    | {
        amountMicros?: number | null;
        currencyCode?: string | null;
      }
    | null;
  netReceivedAmount:
    | {
        amountMicros?: number | null;
        currencyCode?: string | null;
      }
    | null;
  providerPayoutReference: string | null;
  paymentProviderCustomerId: string | null;
  providerAgreementId: string | null;
  providerIntervalUnit: string | null;
  providerIntervalCount: number | null;
  donorPhone: string | null;
  supporterEmailOptOut: boolean | null;
  isAnonymousDonor: boolean | null;
  rawProviderEvidence: unknown;
  appealSourceExternalId: string | null;
  sourceAppealName: string | null;
  sourceFundName: string | null;
  donorResolutionState: string | null;
  donor: {
    id: string;
    supporterEmailOptOut?: boolean | null;
    emails?: {
      primaryEmail?: string | null;
      additionalEmails?: string[] | null;
    } | null;
  } | null;
  softCreditPerson?: {
    id: string;
    name?: {
      firstName?: string | null;
      lastName?: string | null;
    } | null;
  } | null;
  softCreditCompany?: {
    id: string;
    name?: string | null;
  } | null;
  softCreditType?: string | null;
  fund: {
    id: string;
    name?: string | null;
  } | null;
  appeal: {
    id: string;
    name?: string | null;
    defaultFund?: {
      id?: string | null;
      name?: string | null;
    } | null;
  } | null;
  appealSource: {
    id: string;
    name?: string | null;
    appeal?: {
      id?: string | null;
    } | null;
  } | null;
  giftReadyStatus: GiftReadyStatus | null;
  paymentState: GiftStagingPaymentState | null;
  processingStatus: string | null;
  errorDetail: string | null;
  giftAidRequested: boolean | null;
  giftAidDeclarationCaptured: boolean | null;
  giftAidDeclarationDate: string | null;
  giftAidCoverageScope: string | null;
  giftAidDeclarationSource: string | null;
  giftAidTextVersion: string | null;
  giftAidDeclaration: {
    id: string;
  } | null;
  recurringAgreement: {
    id: string;
  } | null;
  committedGift: {
    id: string;
    name?: string | null;
  } | null;
};

export type ProcessBatchRequest = {
  giftBatchId: string;
};

export type RunBatchDonorMatchRequest = {
  giftBatchId: string;
};

export type RunSelectedGiftStagingDonorMatchRequest = {
  giftStagingIds: string[];
};

export type CheckBatchRequest = {
  giftBatchId: string;
};

export type CheckSelectedGiftStagingReadinessRequest = {
  giftStagingIds: string[];
};

export type ProcessSelectedGiftStagingRequest = {
  giftStagingIds: string[];
};

export type UpdateBatchGiftCodingRequest = {
  giftBatchId: string;
  defaultAppealId?: string | null;
  defaultAppealSourceId?: string | null;
  defaultFundId?: string | null;
};

export type ProcessBatchResponse = {
  giftBatchId: string;
  batchStatus: BatchStatus;
  totalItems: number;
  processedItems: number;
  failedItems: number;
  notReadyItems: number;
  executorMode: 'BOUNDED_HYBRID';
  chunkCount: number;
  batchPathProcessed: number;
  batchPathFailed: number;
  rowFallbackProcessed: number;
  rowFallbackFailed: number;
};

export type RunBatchDonorMatchResponse = {
  giftBatchId: string;
  totalCandidateRows: number;
  evaluatedRows: number;
  alreadyConfirmedRows: number;
  autoLinkedRows: number;
  ambiguousRows: number;
  unchangedRows: number;
};

export type RunSelectedGiftStagingDonorMatchResponse = {
  selectedItemCount: number;
  totalCandidateRows: number;
  evaluatedRows: number;
  alreadyConfirmedRows: number;
  autoLinkedRows: number;
  ambiguousRows: number;
  unchangedRows: number;
};

export type CheckBatchResponse = {
  giftBatchId: string;
  checkedAt: string;
  actualItemCount: number;
  expectedItemCount: number | null;
  itemCountMatchesExpected: boolean | null;
  expectedTotalDisplay: string | null;
  actualTotalDisplay: string;
  totalMatchesExpected: boolean | null;
  readyItems: number;
  needsReviewItems: number;
  failedItems: number;
  processedItems: number;
};

export type CheckSelectedGiftStagingReadinessResponse = {
  selectedItemCount: number;
  checkedAt: string;
  readyItems: number;
  needsReviewItems: number;
  failedItems: number;
  processedItems: number;
};

export type ProcessSelectedGiftStagingResponse = {
  selectedItemCount: number;
  processedItems: number;
  failedItems: number;
  notReadyItems: number;
  executorMode: 'BOUNDED_HYBRID';
  chunkCount: number;
  batchPathProcessed: number;
  batchPathFailed: number;
  rowFallbackProcessed: number;
  rowFallbackFailed: number;
};

export type UpdateBatchGiftCodingResponse = {
  giftBatchId: string;
  targetedItemCount: number;
  updatedRowCount: number;
  appealUpdatedCount: number;
  appealSourceUpdatedCount: number;
  fundUpdatedCount: number;
};
