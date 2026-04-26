export type DonorResolution =
  | 'UNREVIEWED'
  | 'AMBIGUOUS'
  | 'UNRESOLVED'
  | 'CONFIRMED';

export type ProcessingOutcome = 'NOT_RUN' | 'FAILED';

export type PersonSummary = {
  id: string;
  name?: {
    firstName?: string | null;
    lastName?: string | null;
  } | null;
  emails?: {
    primaryEmail?: string | null;
  } | null;
};

export type StoredStagingReviewRecord = {
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
  donor: PersonSummary | null;
  processingOutcome: string | null;
  hasCoreGiftIssue: boolean | null;
  isReadyForProcessing: boolean | null;
};

export type StagingReviewRecord = {
  id: string;
  name: string;
  donorFirstName: string;
  donorLastName: string;
  donorEmail: string;
  donorEvidenceName: string;
  amount: string;
  giftDate: string | null;
  donorResolution: DonorResolution;
  linkedDonor: PersonSummary | null;
  linkedDonorName: string;
  giftAidRequested: boolean;
  giftAidDeclarationCaptured: boolean;
  giftAidDeclarationDate: string | null;
  giftAidCoverageScope: string;
  giftAidDeclarationSource: string;
  giftAidTextVersion: string;
  giftAidDeclarationId: string | null;
  processingOutcome: ProcessingOutcome;
  hasCoreGiftIssue: boolean;
  isReadyForProcessing: boolean;
};

export type DerivedReviewState = {
  queueMeaning:
    | 'READY_NOW'
    | 'FAILED_FOLLOW_UP'
    | 'BLOCKED'
    | 'NEEDS_DONOR_REVIEW'
    | 'ACTIVE_REVIEW';
  title: string;
  accent: string;
  background: string;
  reason: string;
  nextAction: string;
  hasBlocker: boolean;
};

export type DonorDuplicateCheckStatus =
  | 'NO_MATCH'
  | 'SINGLE_EXACT_MATCH'
  | 'MULTIPLE_EXACT_MATCHES';

export type DonorDuplicateCheckResult = {
  status: DonorDuplicateCheckStatus;
  checkedFirstName: string;
  checkedLastName: string;
  candidates: PersonSummary[];
};
