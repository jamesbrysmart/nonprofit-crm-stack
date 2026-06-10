import type { GiftReadyStatus } from 'src/gift-staging-review/gift-ready-status';

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
  giftReadyStatus: GiftReadyStatus | null;
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
  appeal:
    | {
        id: string;
        name?: string | null;
      }
    | null;
  fund:
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
  expectedItemCount: number | null;
  defaultAppeal:
    | {
        id: string;
        name?: string | null;
        defaultFund?:
          | {
              id?: string | null;
              name?: string | null;
            }
          | null;
      }
    | null;
  defaultFund:
    | {
        id: string;
        name?: string | null;
      }
    | null;
  defaultAppealSource:
    | {
        id: string;
        name?: string | null;
        appeal?:
          | {
              id?: string | null;
            }
          | null;
      }
    | null;
  expectedTotalAmount:
    | {
        amountMicros?: number | null;
        currencyCode?: string | null;
      }
    | null;
};

export type GiftBatchReviewRecord = {
  id: string;
  name: string;
  source: string;
  status: string;
  totalItems: number;
  isOverWorkflowLimit: boolean;
  workflowLimitMessage: string | null;
  totalValueDisplay: string;
  expectedItemCount: number | null;
  defaultAppealId: string;
  defaultAppealName: string;
  defaultAppealDefaultFundId: string;
  defaultAppealDefaultFundName: string;
  defaultFundId: string;
  defaultFundName: string;
  defaultAppealSourceId: string;
  defaultAppealSourceName: string;
  expectedTotalAmount:
    | {
        amountMicros?: number | null;
        currencyCode?: string | null;
      }
    | null;
  expectedTotalValueDisplay: string;
  eligibleItems: number;
  processedItems: number;
  failedItems: number;
  readyItems: number;
  needsReviewItems: number;
  ambiguousItems: number;
  unprocessedItems: number;
  uncodedAppealItems: number;
  uncodedFundItems: number;
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
  giftReadyStatus: GiftReadyStatus;
  isProcessable: boolean;
  isProcessed: boolean;
  errorDetail: string;
  committedGiftName: string;
  appealId: string;
  fundId: string;
};
