export type BatchReviewRow = {
  id: string;
  name: string;
  donorFirstName: string | null;
  donorLastName: string | null;
  donorEmail: string | null;
  amount:
    | {
        amountMicros?: number | null;
        currencyCode?: string | null;
      }
    | null;
  giftDate: string | null;
  provider: string | null;
  providerAgreementId: string | null;
  donorResolutionState: string | null;
  isReadyForProcessing: boolean | null;
  processingStatus: string | null;
  errorDetail: string | null;
  donor:
    | {
        id: string;
      }
    | null;
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
  totalValueDisplay: string;
  eligibleItems: number;
  processedItems: number;
  failedItems: number;
  readyItems: number;
  unresolvedItems: number;
  ambiguousItems: number;
  rows: GiftBatchReviewRow[];
};

export type GiftBatchReviewRow = {
  id: string;
  name: string;
  donorEvidenceName: string;
  donorEmail: string;
  amountDisplay: string;
  giftDate: string;
  provider: string;
  providerAgreementId: string;
  donorResolutionState: string;
  processingStatus: string;
  isReadyForProcessing: boolean;
  isProcessable: boolean;
  isProcessed: boolean;
  errorDetail: string;
  committedGiftName: string;
};
