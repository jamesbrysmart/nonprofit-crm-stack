export type SaveGiftCodingRequest = {
  giftId: string;
  appealId?: string;
  appealSourceId?: string;
  fundId?: string;
  softCreditPersonId?: string;
  softCreditCompanyId?: string;
  softCreditType?: string;
};

export type SaveGiftCodingResponse = {
  giftId: string;
  appealId: string | null;
  appealSourceId: string | null;
  fundId: string | null;
  softCreditPersonId?: string | null;
  softCreditCompanyId?: string | null;
  softCreditType?: string | null;
};
