import type {
  GiftAidCaptureInput,
  MailingAddressEvidence,
  OnlineGiftAidEvidenceInput,
} from './gift-aid.types';

const normalizeString = (value: unknown) =>
  typeof value === 'string' && value.trim() !== '' ? value.trim() : undefined;

const hasRequiredHomeAddressEvidence = (
  address: MailingAddressEvidence | null | undefined,
) => {
  if (!address) {
    return false;
  }

  return (
    normalizeString(address.addressStreet1) &&
    normalizeString(address.addressCity) &&
    normalizeString(address.addressPostcode) &&
    normalizeString(address.addressCountry)
  );
};

export const normalizeOnlineGiftAidEvidence = ({
  giftAidRequested,
  donorFirstName,
  donorLastName,
  donorMailingAddress,
  declarationDate,
  fallbackCaptureDate,
  declarationSource,
  textVersion,
  coverageScope,
}: OnlineGiftAidEvidenceInput): GiftAidCaptureInput => {
  const requested = giftAidRequested === true;

  if (!requested) {
    return {
      giftAidRequested: false,
      giftAidDeclarationCaptured: false,
    };
  }

  const normalizedDate =
    normalizeString(declarationDate) ?? normalizeString(fallbackCaptureDate);
  const normalizedSource = normalizeString(declarationSource);
  const normalizedTextVersion = normalizeString(textVersion);
  const normalizedCoverageScope = normalizeString(coverageScope);
  const hasIdentity =
    normalizeString(donorFirstName) && normalizeString(donorLastName);
  const hasAddress = hasRequiredHomeAddressEvidence(donorMailingAddress);

  return {
    giftAidRequested: true,
    giftAidDeclarationCaptured:
      Boolean(hasIdentity) &&
      Boolean(hasAddress) &&
      Boolean(normalizedSource) &&
      Boolean(normalizedDate),
    ...(normalizedDate ? { giftAidDeclarationDate: normalizedDate } : {}),
    ...(normalizedSource
      ? { giftAidDeclarationSource: normalizedSource }
      : {}),
    ...(normalizedTextVersion
      ? { giftAidTextVersion: normalizedTextVersion }
      : {}),
    ...(normalizedCoverageScope
      ? { giftAidCoverageScope: normalizedCoverageScope }
      : {}),
  };
};
