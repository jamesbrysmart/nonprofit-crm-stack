import type {
  GiftAidCaptureInput,
  MailingAddressEvidence,
} from 'src/gift-aid/gift-aid.types';
import type { SoftCreditType } from 'src/soft-credits/soft-credit-integrity';

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

export type CompanySummary = {
  id: string;
  name?: string | null;
};

export type OpportunitySummary = {
  id: string;
  name?: string | null;
  company?: {
    id?: string | null;
    name?: string | null;
  } | null;
};

export type FundSummary = {
  id: string;
  name?: string | null;
  code?: string | null;
  isActive?: boolean | null;
};

export type AppealSummary = {
  id: string;
  name?: string | null;
  status?: string | null;
  defaultFund?: {
    id?: string | null;
    name?: string | null;
  } | null;
};

export type AppealSourceSummary = {
  id: string;
  name?: string | null;
  status?: string | null;
  sourceType?: string | null;
  appeal?: {
    id?: string | null;
    name?: string | null;
    defaultFund?: {
      id?: string | null;
      name?: string | null;
    } | null;
  } | null;
};

export type DonorDuplicateCheckStatus =
  | 'NO_MATCH'
  | 'SINGLE_EXACT_MATCH'
  | 'MULTIPLE_EXACT_MATCHES';

export type DuplicateCheckRequest = {
  donorFirstName?: string;
  donorLastName?: string;
  donorEmail?: string;
};

export type DuplicateCheckResponse = {
  status: DonorDuplicateCheckStatus;
  checkedFirstName: string;
  checkedLastName: string;
  candidates: PersonSummary[];
};

export type CompanyDuplicateCheckRequest = {
  companyName?: string;
};

export type CompanyDuplicateCheckResponse = {
  status: DonorDuplicateCheckStatus;
  checkedCompanyName: string;
  candidates: CompanySummary[];
};

export type ManualGiftDonorChoice = 'USE_EXISTING' | 'CREATE_NEW';
export type ManualGiftCompanyChoice = 'USE_EXISTING' | 'CREATE_NEW';
export type ManualGiftDonorType = 'INDIVIDUAL' | 'COMPANY';

export type ManualGiftPaymentType =
  | 'CARD'
  | 'DIRECT_DEBIT'
  | 'BANK_TRANSFER'
  | 'CASH'
  | 'CHEQUE'
  | 'OTHER';

export type ManualGiftEntryRequest = GiftAidCaptureInput & {
  donorType?: ManualGiftDonorType;
  donorFirstName?: string;
  donorLastName?: string;
  donorEmail?: string;
  donorMailingAddress?: MailingAddressEvidence | null;
  companyName?: string;
  amountValue?: string;
  currencyCode?: string;
  paymentType?: ManualGiftPaymentType;
  giftDate?: string;
  selectedFundId?: string;
  selectedAppealId?: string;
  selectedAppealSourceId?: string;
  selectedSoftCreditPersonId?: string;
  selectedSoftCreditCompanyId?: string;
  selectedSoftCreditType?: SoftCreditType;
  selectedOpportunityId?: string;
  donorChoice?: ManualGiftDonorChoice;
  selectedDonorId?: string;
  companyChoice?: ManualGiftCompanyChoice;
  selectedCompanyId?: string;
  selectedRecurringAgreementId?: string;
};

export type ManualGiftEntryResponse = {
  giftId: string;
  donorType: ManualGiftDonorType;
  donorId?: string | null;
  companyId?: string | null;
  donorChoice?: ManualGiftDonorChoice | null;
  companyChoice?: ManualGiftCompanyChoice | null;
  recurringAgreementId?: string | null;
};

export type SearchOpportunitiesRequest = {
  query?: string;
  companyId?: string;
};

export type SearchOpportunitiesResponse = {
  opportunities: OpportunitySummary[];
};

export type ListFundOptionsResponse = {
  funds: FundSummary[];
};

export type ListAppealOptionsResponse = {
  appeals: AppealSummary[];
};

export type ListAppealSourceOptionsRequest = {
  appealId?: string;
};

export type ListAppealSourceOptionsResponse = {
  appealSources: AppealSourceSummary[];
};

export type ManualGiftDuplicateCheckRequest = {
  donorType?: ManualGiftDonorType;
  selectedDonorId?: string;
  selectedCompanyId?: string;
  amountValue?: string;
  currencyCode?: string;
  giftDate?: string;
};

export type ManualGiftDuplicateMatch = {
  kind: 'COMMITTED_GIFT' | 'STAGED_GIFT';
  id: string;
  name: string;
  giftDate: string;
  amountMicros: number;
  currencyCode: string;
  status?: string | null;
  giftBatchName?: string | null;
};

export type ManualGiftDuplicateCheckResponse = {
  matches: ManualGiftDuplicateMatch[];
};
