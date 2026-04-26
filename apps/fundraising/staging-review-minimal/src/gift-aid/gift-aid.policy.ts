import { CoreApiClient } from 'twenty-client-sdk/core';
import {
  ensureGiftAidDeclarationForPayload,
  getGiftAidDeclarationById,
  resolveApplicableGiftAidDeclaration,
} from './gift-aid.declarations';
import type { GiftAidEvaluatedPayload } from './gift-aid.types';

const normalizeString = (value: unknown) =>
  typeof value === 'string' && value.trim() !== '' ? value.trim() : undefined;

const normalizeBoolean = (value: unknown) => {
  return typeof value === 'boolean' ? value : undefined;
};

const normalizeCaptureField = (value: unknown) => normalizeString(value);

const stripGiftAidCaptureFields = (
  payload: GiftAidEvaluatedPayload,
): GiftAidEvaluatedPayload => {
  const clone: GiftAidEvaluatedPayload = { ...payload };

  delete clone.giftAidRequested;
  delete clone.giftAidDeclarationCaptured;
  delete clone.giftAidDeclarationDate;
  delete clone.giftAidCoverageScope;
  delete clone.giftAidDeclarationSource;
  delete clone.giftAidTextVersion;

  return clone;
};

export const normalizeGiftAidCapture = (
  payload: GiftAidEvaluatedPayload,
): GiftAidEvaluatedPayload => {
  const clone: GiftAidEvaluatedPayload = { ...payload };

  clone.giftAidRequested = normalizeBoolean(clone.giftAidRequested);
  clone.giftAidDeclarationCaptured = normalizeBoolean(
    clone.giftAidDeclarationCaptured,
  );
  clone.giftAidDeclarationDate = normalizeCaptureField(clone.giftAidDeclarationDate);
  clone.giftAidCoverageScope = normalizeCaptureField(clone.giftAidCoverageScope);
  clone.giftAidDeclarationSource = normalizeCaptureField(
    clone.giftAidDeclarationSource,
  );
  clone.giftAidTextVersion = normalizeCaptureField(clone.giftAidTextVersion);
  clone.giftAidDeclarationId = normalizeCaptureField(clone.giftAidDeclarationId);
  delete clone.giftAidStatus;
  delete clone.giftAidReasonCode;
  delete clone.giftAidDecisionSource;
  delete clone.giftAidLastEvaluatedAt;

  return clone;
};

export const applyGiftAidMetadata = async (
  client: CoreApiClient,
  payload: GiftAidEvaluatedPayload,
  enabled: boolean,
): Promise<GiftAidEvaluatedPayload> => {
  const normalized = normalizeGiftAidCapture(payload);

  if (!enabled) {
    return stripGiftAidCaptureFields(normalized);
  }

  const withDeclaration = await ensureGiftAidDeclarationForPayload(client, normalized);
  const explicitDeclarationId = normalizeString(withDeclaration.giftAidDeclarationId);

  if (explicitDeclarationId) {
    const explicitDeclaration = await getGiftAidDeclarationById(
      client,
      explicitDeclarationId,
    );
    if (
      normalizeString(withDeclaration.donorId) &&
      normalizeString(explicitDeclaration?.person?.id) &&
      normalizeString(explicitDeclaration?.person?.id) !==
        normalizeString(withDeclaration.donorId)
    ) {
      return stripGiftAidCaptureFields({
        ...withDeclaration,
        giftAidStatus: 'NEEDS_REVIEW',
        giftAidReasonCode: 'declaration_donor_mismatch',
        giftAidDecisionSource: 'SYSTEM',
        giftAidLastEvaluatedAt: new Date().toISOString(),
      });
    }
  }

  const declaration = await resolveApplicableGiftAidDeclaration(client, withDeclaration);
  if (declaration?.id) {
    const hasIdentity =
      normalizeString(withDeclaration.donorFirstName) &&
      normalizeString(withDeclaration.donorLastName);

    return stripGiftAidCaptureFields({
      ...withDeclaration,
      giftAidDeclarationId: declaration.id,
      giftAidStatus: hasIdentity ? 'CLAIMABLE' : 'NEEDS_REVIEW',
      giftAidReasonCode: hasIdentity
        ? 'valid_declaration_present'
        : 'donor_data_incomplete',
      giftAidDecisionSource: 'SYSTEM',
      giftAidLastEvaluatedAt: new Date().toISOString(),
    });
  }

  if (withDeclaration.giftAidRequested === true) {
    return stripGiftAidCaptureFields({
      ...withDeclaration,
      giftAidStatus: 'NEEDS_REVIEW',
      giftAidReasonCode:
        normalizeString(withDeclaration.donorFirstName) ||
        normalizeString(withDeclaration.donorLastName) ||
        normalizeString(withDeclaration.donorId)
          ? 'no_declaration_on_file'
          : 'donor_data_incomplete',
      giftAidDecisionSource: 'SYSTEM',
      giftAidLastEvaluatedAt: new Date().toISOString(),
    });
  }

  return stripGiftAidCaptureFields({
    ...withDeclaration,
    giftAidStatus: 'NOT_CLAIMABLE',
    giftAidReasonCode: 'not_requested',
    giftAidDecisionSource: 'SYSTEM',
    giftAidLastEvaluatedAt: new Date().toISOString(),
  });
};
