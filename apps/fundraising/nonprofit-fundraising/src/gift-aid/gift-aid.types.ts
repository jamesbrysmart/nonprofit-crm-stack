export type GiftAidStatus = 'CLAIMABLE' | 'NOT_CLAIMABLE' | 'NEEDS_REVIEW';

export type GiftAidDecisionSource = 'SYSTEM' | 'MANUAL_OVERRIDE';

export type GiftAidDeclarationStatus =
  | 'ACTIVE'
  | 'INSUFFICIENT'
  | 'REVOKED'
  | 'SUPERSEDED';

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

export type GiftAidDeclarationRecord = {
  id: string;
  status?: string | null;
  statusReason?: string | null;
  declarationDate?: string | null;
  coverageScope?: string | null;
  source?: string | null;
  textVersion?: string | null;
  revokedAt?: string | null;
  person?: {
    id?: string | null;
  } | null;
};

export type GiftAidEvaluatedPayload = GiftAidCaptureInput & {
  donorId?: string | null;
  donorFirstName?: string | null;
  donorLastName?: string | null;
  donorEmail?: string | null;
  giftDate?: string | null;
  name?: string | null;
  giftType?: string | null;
  amount?:
    | {
        amountMicros?: number | null;
        currencyCode?: string | null;
      }
    | null;
  giftAidStatus?: GiftAidStatus;
  giftAidReasonCode?: string;
  giftAidDecisionSource?: GiftAidDecisionSource;
  giftAidLastEvaluatedAt?: string;
};
