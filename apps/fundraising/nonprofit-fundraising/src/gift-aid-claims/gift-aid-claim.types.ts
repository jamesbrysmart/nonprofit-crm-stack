export type GiftAidClaimBatchRecord = {
  id: string;
  name: string;
  status?: string | null;
  submittedAt?: string | null;
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
  giftAidStatus?: string | null;
  giftAidReasonCode?: string | null;
  amount?:
    | {
        amountMicros?: number | null;
        currencyCode?: string | null;
      }
    | null;
  donorFirstName?: string | null;
  donorLastName?: string | null;
  donorEmail?: string | null;
  giftAidDeclaration?: {
    id?: string | null;
  } | null;
};

export type GiftAidClaimWorkspaceRecord = {
  batch: GiftAidClaimBatchRecord | null;
  gifts: GiftAidClaimGiftRecord[];
  needsReviewGifts: GiftAidClaimGiftRecord[];
};

export type SubmitGiftAidClaimBatchResponse = {
  submittedBatchId: string;
  nextDraftBatchId: string;
  status: 'SUBMITTED';
};
