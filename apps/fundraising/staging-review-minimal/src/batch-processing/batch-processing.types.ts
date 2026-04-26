export type BatchStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'PROCESSED'
  | 'PROCESSED_WITH_ISSUES';

export type StagedGiftProcessingStatus =
  | 'NOT_READY'
  | 'PENDING'
  | 'PROCESSED'
  | 'PROCESS_FAILED';

export type BatchSummaryRecord = {
  id: string;
  name: string;
  status: BatchStatus;
  totalItems: number;
  processedItems: number;
  failedItems: number;
};

export type BatchReviewRow = {
  id: string;
  name: string;
  donorFirstName: string | null;
  donorLastName: string | null;
  donorEmail: string | null;
  amount: string;
  giftDate: string | null;
  giftAidRequested: boolean | null;
  giftAidDeclarationCaptured: boolean | null;
  giftAidDeclarationDate: string | null;
  giftAidCoverageScope: string | null;
  giftAidDeclarationSource: string | null;
  giftAidTextVersion: string | null;
  giftAidDeclaration: {
    id: string;
  } | null;
  donorResolutionState: string | null;
  donor: {
    id: string;
    name?: {
      firstName?: string | null;
      lastName?: string | null;
    } | null;
  } | null;
  hasCoreGiftIssue: boolean | null;
  isReadyForProcessing: boolean | null;
  processingStatus: string | null;
  errorDetail: string | null;
  committedGift: {
    id: string;
    name?: string | null;
  } | null;
  giftBatch: {
    id: string;
  } | null;
};

export type ProcessBatchRequest = {
  giftBatchId: string;
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
