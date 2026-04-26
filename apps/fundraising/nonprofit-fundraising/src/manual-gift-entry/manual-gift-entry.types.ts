import type { GiftAidCaptureInput } from 'src/gift-aid/gift-aid.types';

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

export type DonorDuplicateCheckStatus =
  | 'NO_MATCH'
  | 'SINGLE_EXACT_MATCH'
  | 'MULTIPLE_EXACT_MATCHES';

export type DuplicateCheckRequest = {
  donorFirstName?: string;
  donorLastName?: string;
};

export type DuplicateCheckResponse = {
  status: DonorDuplicateCheckStatus;
  checkedFirstName: string;
  checkedLastName: string;
  candidates: PersonSummary[];
};

export type ManualGiftDonorChoice = 'USE_EXISTING' | 'CREATE_NEW';

export type ManualGiftEntryRequest = GiftAidCaptureInput & {
  donorFirstName?: string;
  donorLastName?: string;
  donorEmail?: string;
  amountValue?: string;
  giftDate?: string;
  donorChoice?: ManualGiftDonorChoice;
  selectedDonorId?: string;
  selectedRecurringAgreementId?: string;
};

export type ManualGiftEntryResponse = {
  giftId: string;
  donorId: string;
  donorChoice: ManualGiftDonorChoice;
  recurringAgreementId?: string | null;
};
