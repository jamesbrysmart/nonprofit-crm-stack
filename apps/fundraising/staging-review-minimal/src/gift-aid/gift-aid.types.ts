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
  giftDate?: string | null;
  giftAidStatus?: GiftAidStatus;
  giftAidReasonCode?: string;
  giftAidDecisionSource?: GiftAidDecisionSource;
  giftAidLastEvaluatedAt?: string;
};
