export type BatchReviewRow = {
  id: string;
  name: string;
  donorFirstName: string | null;
  donorLastName: string | null;
  donorEmail: string | null;
  donorResolutionState: string | null;
  hasCoreGiftIssue: boolean | null;
  isReadyForProcessing: boolean | null;
  processingStatus: string | null;
  errorDetail: string | null;
  committedGift:
    | {
        id: string;
        name?: string | null;
      }
    | null;
};

export type BatchSummaryRecord = {
  id: string;
  name: string;
  source: string | null;
  status: string | null;
  totalItems: number | null;
  processedItems: number | null;
  failedItems: number | null;
};

export type GiftBatchReviewRecord = {
  id: string;
  name: string;
  source: string;
  status: string;
  totalItems: number;
  processedItems: number;
  failedItems: number;
  readyItems: number;
  blockedItems: number;
  unresolvedItems: number;
  rows: GiftBatchReviewRow[];
};

export type GiftBatchReviewRow = {
  id: string;
  name: string;
  donorEvidenceName: string;
  donorEmail: string;
  donorResolutionState: string;
  processingStatus: string;
  hasCoreGiftIssue: boolean;
  isReadyForProcessing: boolean;
  isProcessed: boolean;
  errorDetail: string;
  committedGiftName: string;
};
