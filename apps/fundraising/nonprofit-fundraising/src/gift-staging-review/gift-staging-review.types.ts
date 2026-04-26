import type {
  DuplicateCheckResponse,
  PersonSummary,
} from 'src/manual-gift-entry/manual-gift-entry.types';

export type DonorResolution =
  | 'UNREVIEWED'
  | 'AMBIGUOUS'
  | 'UNRESOLVED'
  | 'CONFIRMED';

export type ProcessingStatus =
  | 'NOT_READY'
  | 'READY'
  | 'PROCESSED'
  | 'PROCESS_FAILED';

export type StoredGiftStagingRecord = {
  id: string;
  name: string;
  intakeSource: string | null;
  amount:
    | {
        amountMicros?: number | null;
        currencyCode?: string | null;
      }
    | string
    | null;
  giftDate: string | null;
  donorFirstName: string | null;
  donorLastName: string | null;
  donorEmail: string | null;
  donorResolutionState: string | null;
  donor: PersonSummary | null;
  hasCoreGiftIssue: boolean | null;
  isReadyForProcessing: boolean | null;
  processingStatus: string | null;
  errorDetail: string | null;
  giftAidRequested: boolean | null;
  giftAidDeclarationCaptured: boolean | null;
  giftAidDeclarationDate: string | null;
  giftAidCoverageScope: string | null;
  giftAidDeclarationSource: string | null;
  giftAidTextVersion: string | null;
  giftAidDeclaration:
    | {
        id: string;
      }
    | null;
  giftBatch:
    | {
        id: string;
        name?: string | null;
      }
    | null;
  committedGift:
    | {
        id: string;
        name?: string | null;
      }
    | null;
};

export type GiftStagingReviewRecord = {
  id: string;
  name: string;
  intakeSource: string;
  amountDisplay: string;
  giftDate: string;
  donorFirstName: string;
  donorLastName: string;
  donorEmail: string;
  donorEvidenceName: string;
  donorResolution: DonorResolution;
  linkedDonor: PersonSummary | null;
  linkedDonorName: string;
  hasCoreGiftIssue: boolean;
  isReadyForProcessing: boolean;
  processingStatus: ProcessingStatus;
  errorDetail: string;
  giftAidRequested: boolean;
  giftAidDeclarationCaptured: boolean;
  giftAidDeclarationDate: string;
  giftAidCoverageScope: string;
  giftAidDeclarationSource: string;
  giftAidTextVersion: string;
  giftAidDeclarationId: string;
  giftBatchName: string;
  committedGiftName: string;
};

export type DerivedReviewState = {
  title: string;
  accent: string;
  background: string;
  reason: string;
  nextAction: string;
  hasBlocker: boolean;
};

export type GiftStagingReviewData = {
  record: GiftStagingReviewRecord;
  duplicateCheckResult: DuplicateCheckResponse | null;
};
