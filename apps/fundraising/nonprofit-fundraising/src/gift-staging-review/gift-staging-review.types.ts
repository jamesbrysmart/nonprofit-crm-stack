import type {
  DuplicateCheckResponse,
  AppealSummary,
  FundSummary,
  PersonSummary,
} from 'src/manual-gift-entry/manual-gift-entry.types';
import type {
  BatchPreflightCategory,
  BatchPreflightIssueCode,
} from 'src/batch-processing/batch-processing.preflight';
import type { GiftReadyStatus } from './gift-ready-status';

export type DonorResolution =
  | 'UNREVIEWED'
  | 'AMBIGUOUS'
  | 'NEW_DONOR'
  | 'CONFIRMED';

export type ProcessingStatus =
  | 'NOT_PROCESSED'
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
  donationType: string | null;
  donorFirstName: string | null;
  donorLastName: string | null;
  donorEmail: string | null;
  donorPhone: string | null;
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
  externalId: string | null;
  sourceFingerprint: string | null;
  providerEventId: string | null;
  provider: string | null;
  providerPaymentId: string | null;
  paymentProviderCustomerId: string | null;
  providerAgreementId: string | null;
  providerIntervalUnit: string | null;
  providerIntervalCount: number | null;
  rawProviderEvidence: unknown;
  sourceAppealName: string | null;
  sourceFundName: string | null;
  donorResolutionState: string | null;
  donor: PersonSummary | null;
  giftReadyStatus: GiftReadyStatus | null;
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
  recurringAgreement:
    | {
        id: string;
      }
    | null;
  appeal:
    | {
        id: string;
        name?: string | null;
        defaultFund?: {
          id?: string | null;
          name?: string | null;
        } | null;
      }
    | null;
  fund:
    | {
        id: string;
        name?: string | null;
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
  donationType: string;
  donorFirstName: string;
  donorLastName: string;
  donorEmail: string;
  donorPhone: string;
  externalId: string;
  sourceFingerprint: string;
  providerEventId: string;
  provider: string;
  providerPaymentId: string;
  paymentProviderCustomerId: string;
  providerAgreementId: string;
  providerIntervalUnit: string;
  providerIntervalCount: number | null;
  rawProviderEvidence: unknown;
  sourceAppealName: string;
  sourceFundName: string;
  appealId: string;
  appealName: string;
  appealDefaultFundId: string;
  fundId: string;
  fundName: string;
  donorEvidenceName: string;
  donorResolution: DonorResolution;
  linkedDonor: PersonSummary | null;
  linkedDonorName: string;
  giftReadyStatus: GiftReadyStatus;
  processingStatus: ProcessingStatus;
  errorDetail: string;
  giftAidRequested: boolean;
  giftAidDeclarationCaptured: boolean;
  giftAidDeclarationDate: string;
  giftAidCoverageScope: string;
  giftAidDeclarationSource: string;
  giftAidTextVersion: string;
  giftAidDeclarationId: string;
  giftBatchId: string;
  giftBatchName: string;
  committedGiftId: string;
  committedGiftName: string;
  preflightCategory: BatchPreflightCategory;
  preflightIssueCodes: BatchPreflightIssueCode[];
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

export type GiftCodingSelectionState = {
  appealId: string;
  fundId: string;
};

export type GiftCodingOptions = {
  appeals: AppealSummary[];
  funds: FundSummary[];
};
