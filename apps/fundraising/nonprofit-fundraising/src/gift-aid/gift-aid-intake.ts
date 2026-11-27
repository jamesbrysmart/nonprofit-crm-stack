import { isGiftAidEnabled } from './gift-aid-config';
import type { GiftAidCaptureInput } from './gift-aid.types';
import { normalizeString } from 'src/utils/normalize-string';

export const buildGiftAidIntake = (capture: GiftAidCaptureInput, donorId?: string | null) => {
  if (!isGiftAidEnabled()) {
    return {};
  }

  return {
    giftAidIntake: {
      donorIdAtCapture: normalizeString(donorId),
      giftAidRequested: capture.giftAidRequested === true,
      giftAidDeclarationCaptured: capture.giftAidDeclarationCaptured === true,
      giftAidDeclarationDate: normalizeString(capture.giftAidDeclarationDate),
      giftAidCoverageScope: normalizeString(capture.giftAidCoverageScope),
      giftAidDeclarationSource: normalizeString(capture.giftAidDeclarationSource),
      giftAidTextVersion: normalizeString(capture.giftAidTextVersion),
      giftAidDeclarationId: normalizeString(capture.giftAidDeclarationId),
    },
  };
};
