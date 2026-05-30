import type { GiftAidCaptureInput } from 'src/gift-aid/gift-aid.types';
import { normalizeDonationFormString } from './donation-form-config';
import type {
  CreateDonationFormCheckoutSessionRequest,
  DonationType,
} from './donation-form-checkout.types';

const normalizeString = normalizeDonationFormString;

export const buildPrePaymentRawEvidence = ({
  sourceFingerprint,
  donationFormId,
  donationFormPublishedVersion,
  donationType,
  giftAidEvidence,
  supporterEmailOptOut,
  attribution,
}: {
  sourceFingerprint: string;
  donationFormId: string;
  donationFormPublishedVersion: string;
  donationType: DonationType;
  giftAidEvidence: GiftAidCaptureInput;
  supporterEmailOptOut: boolean;
  attribution?: CreateDonationFormCheckoutSessionRequest['attribution'];
}) => ({
  provider: 'STRIPE',
  flow: 'DONATION_FORM',
  paymentLifecycle: 'AWAITING_PAYMENT',
  sourceFingerprint,
  donationFormId,
  donationFormPublishedVersion,
  donationType,
  ...(donationType === 'RECURRING'
    ? {
        recurring: {
          intervalUnit: 'month',
          intervalCount: 1,
        },
      }
    : {}),
  submittedGiftAid: {
    requested: giftAidEvidence.giftAidRequested === true,
    declarationCaptured: giftAidEvidence.giftAidDeclarationCaptured === true,
    ...(normalizeString(giftAidEvidence.giftAidDeclarationDate)
      ? {
          declarationDate: normalizeString(
            giftAidEvidence.giftAidDeclarationDate,
          ),
        }
      : {}),
    ...(normalizeString(giftAidEvidence.giftAidDeclarationSource)
      ? {
          declarationSource: normalizeString(
            giftAidEvidence.giftAidDeclarationSource,
          ),
        }
      : {}),
    ...(normalizeString(giftAidEvidence.giftAidTextVersion)
      ? { textVersion: normalizeString(giftAidEvidence.giftAidTextVersion) }
      : {}),
  },
  supporterEmailOptOut,
  ...(attribution
    ? {
        attribution: {
          ...(normalizeString(attribution.sourceAppealName) !== ''
            ? { sourceAppealName: normalizeString(attribution.sourceAppealName) }
            : {}),
          ...(normalizeString(attribution.sourceFundName) !== ''
            ? { sourceFundName: normalizeString(attribution.sourceFundName) }
            : {}),
          ...(normalizeString(attribution.referrer) !== ''
            ? { referrer: normalizeString(attribution.referrer) }
            : {}),
          ...(attribution.utm ? { utm: attribution.utm } : {}),
          ...(attribution.embedContext
            ? { embedContext: attribution.embedContext }
            : {}),
        },
      }
    : {}),
});

export const buildCheckoutMetadata = ({
  sourceFingerprint,
  giftStagingId,
  donationFormId,
  donationFormPublishedVersion,
  donationType,
  sourceAppealName,
  sourceFundName,
  giftAidRequested,
  giftAidDeclarationSource,
  giftAidDeclarationDate,
  giftAidTextVersion,
}: {
  sourceFingerprint: string;
  giftStagingId: string;
  donationFormId: string;
  donationFormPublishedVersion: string;
  donationType: DonationType;
  sourceAppealName?: string;
  sourceFundName?: string;
  giftAidRequested: boolean;
  giftAidDeclarationSource: string;
  giftAidDeclarationDate?: string;
  giftAidTextVersion?: string;
}): Record<string, string> => ({
  sourceFingerprint,
  giftStagingId,
  donationFormId,
  donationFormPublishedVersion,
  donationType,
  giftAidRequested: giftAidRequested ? 'true' : 'false',
  giftAidDeclarationSource,
  ...(giftAidDeclarationDate ? { giftAidDeclarationDate } : {}),
  ...(giftAidTextVersion ? { giftAidTextVersion } : {}),
  ...(sourceAppealName ? { sourceAppealName } : {}),
  ...(sourceFundName ? { sourceFundName } : {}),
});
