import type { DonorDuplicateCheckResult } from 'src/staging-review/staging-review.types';

export type ManualGiftDonorChoice = 'USE_EXISTING' | 'CREATE_NEW';

export type ManualGiftEntryRequest = {
  donorFirstName: string;
  donorLastName: string;
  donorEmail?: string;
  amountValue: string;
  giftDate: string;
  giftAidRequested?: boolean;
  giftAidDeclarationCaptured?: boolean;
  giftAidDeclarationDate?: string;
  giftAidCoverageScope?: string;
  giftAidDeclarationSource?: string;
  giftAidTextVersion?: string;
  donorChoice: ManualGiftDonorChoice;
  selectedDonorId?: string;
};

export type ManualGiftEntryResponse = {
  giftId?: string;
  donorChoice: ManualGiftDonorChoice;
};

export type DuplicateCheckRequest = {
  donorFirstName: string;
  donorLastName: string;
};

export type DuplicateCheckResponse = DonorDuplicateCheckResult;
