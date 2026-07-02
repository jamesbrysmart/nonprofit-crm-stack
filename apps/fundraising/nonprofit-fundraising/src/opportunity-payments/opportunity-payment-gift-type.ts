import type { ManualGiftType } from 'src/manual-gift-entry/manual-gift-entry.types';

export type OpportunityFundingType = string | null | undefined;

export const deriveGiftTypeForOpportunityPayment = (
  fundingType: OpportunityFundingType,
): ManualGiftType => {
  switch ((fundingType ?? '').trim().toUpperCase()) {
    case 'CORPORATE_SPONSORSHIP':
      return 'SPONSORSHIP';
    case 'GRANT':
    case 'TRUST_FOUNDATION':
    case 'STATUTORY_BID':
      return 'GRANT';
    case 'MAJOR_GIFT':
    case 'OTHER':
    default:
      return 'DONATION';
  }
};
