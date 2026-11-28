import { isGiftAidEnabled } from './gift-aid-config';
import type { GiftAidCaptureInput } from './gift-aid.types';
import { normalizeString } from 'src/utils/normalize-string';

export const buildGiftAidIntake = (capture: GiftAidCaptureInput, donorId?: string | null) => {
  if (!isGiftAidEnabled()) {
    return {};
  }

  const giftAidRequested = capture.giftAidRequested === true;
  const giftAidDeclarationCaptured = capture.giftAidDeclarationCaptured === true;
  const giftAidDeclarationId = normalizeString(capture.giftAidDeclarationId);
  if (!giftAidRequested && !giftAidDeclarationCaptured && !giftAidDeclarationId) {
    // A gift with no new capture may still be covered by a declaration on file.
    return { giftAidIntake: { giftAidRequested } };
  }

  return {
    giftAidIntake: {
      giftAidRequested,
      giftAidDeclarationCaptured,
      ...(giftAidDeclarationCaptured ? { donorIdAtCapture: normalizeString(donorId) } : {}),
      giftAidDeclarationDate: normalizeString(capture.giftAidDeclarationDate) || undefined,
      giftAidCoverageScope: normalizeString(capture.giftAidCoverageScope) || undefined,
      giftAidDeclarationSource: normalizeString(capture.giftAidDeclarationSource) || undefined,
      giftAidTextVersion: normalizeString(capture.giftAidTextVersion) || undefined,
      giftAidDeclarationId: giftAidDeclarationId || undefined,
    },
  };
};
