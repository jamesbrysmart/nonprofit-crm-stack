export type SaveGiftCodingRequest = {
  giftId: string;
  appealId?: string;
  fundId?: string;
};

export type SaveGiftCodingResponse = {
  giftId: string;
  appealId: string | null;
  fundId: string | null;
};
