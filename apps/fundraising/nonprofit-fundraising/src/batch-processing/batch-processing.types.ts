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
  externalId: string | null;
  sourceFingerprint: string | null;
  providerEventId: string | null;
  provider: string | null;
  providerPaymentId: string | null;
  paymentProviderCustomerId: string | null;
  providerAgreementId: string | null;
  providerIntervalUnit: string | null;
  providerIntervalCount: number | null;
  donorPhone: string | null;
  rawProviderEvidence: unknown;
  donorResolutionState: string | null;
  donor: {
    id: string;
    emails?: {
      primaryEmail?: string | null;
      additionalEmails?: string[] | null;
    } | null;
  } | null;
  giftReadyStatus: GiftReadyStatus | null;
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
  autoLinkedRows: number;
  ambiguousRows: number;
  unchangedRows: number;
};

export type RunSelectedGiftStagingDonorMatchResponse = {
  selectedItemCount: number;
  totalCandidateRows: number;
  evaluatedRows: number;
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
