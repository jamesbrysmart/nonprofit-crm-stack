export type GiftAidCaptureInput = {
  giftAidRequested?: boolean | null;
  giftAidDeclarationCaptured?: boolean | null;
  giftAidDeclarationDate?: string | null;
  giftAidCoverageScope?: string | null;
  giftAidDeclarationSource?: string | null;
  giftAidTextVersion?: string | null;
  giftAidDeclarationId?: string | null;
};

export type MailingAddressEvidence = {
  addressStreet1?: string | null;
  addressStreet2?: string | null;
  addressCity?: string | null;
  addressState?: string | null;
  addressPostcode?: string | null;
  addressCountry?: string | null;
};

export type OnlineGiftAidEvidenceInput = {
  giftAidRequested?: boolean | null;
  donorFirstName?: string | null;
  donorLastName?: string | null;
  donorMailingAddress?: MailingAddressEvidence | null;
  declarationDate?: string | null;
  fallbackCaptureDate?: string | null;
  declarationSource?: string | null;
  textVersion?: string | null;
  coverageScope?: string | null;
};
