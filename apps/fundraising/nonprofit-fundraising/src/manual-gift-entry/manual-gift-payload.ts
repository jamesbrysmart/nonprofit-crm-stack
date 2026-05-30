import type {
  ManualGiftDonorType,
  ManualGiftEntryRequest,
} from 'src/manual-gift-entry/manual-gift-entry.types';
import {
  getManualGiftPaymentType,
  normalizeRequiredCurrencyCode,
  normalizeRequiredGiftDate,
  normalizeString,
  parseRequiredManualGiftAmountMicros,
} from 'src/manual-gift-entry/manual-gift-normalization';

export const buildManualGiftPayload = (args: {
  body: ManualGiftEntryRequest;
  donorType: ManualGiftDonorType;
  donorId?: string | null;
  companyId?: string | null;
}) => {
  const { body, donorType, donorId, companyId } = args;
  const donorFirstName = normalizeString(body.donorFirstName);
  const donorLastName = normalizeString(body.donorLastName);
  const donorEmail = normalizeString(body.donorEmail);
  const companyName = normalizeString(body.companyName);

  if (donorType === 'INDIVIDUAL') {
    if (donorFirstName === '' || donorLastName === '') {
      throw new Error('Donor first name and last name are required');
    }
  } else if (companyName === '') {
    throw new Error('Company name is required');
  }

  return {
    // Manual entry bypasses staging by default because this is the trusted
    // operator path in the product model.
    name:
      donorType === 'INDIVIDUAL'
        ? `Gift from ${donorFirstName} ${donorLastName}`.trim()
        : `Gift from ${companyName}`,
    amount: {
      currencyCode: normalizeRequiredCurrencyCode(body.currencyCode),
      amountMicros: parseRequiredManualGiftAmountMicros(body.amountValue),
    },
    giftDate: normalizeRequiredGiftDate(body.giftDate),
    ...(donorType === 'INDIVIDUAL'
      ? {
          donorFirstName,
          donorLastName,
          donorId,
        }
      : {}),
    paymentType: getManualGiftPaymentType(body.paymentType),
    ...(donorType === 'INDIVIDUAL' && donorEmail !== ''
      ? { donorEmail }
      : {}),
    ...(donorType === 'COMPANY' && companyName !== '' ? { companyName } : {}),
    ...(donorType === 'COMPANY' && companyId ? { companyId } : {}),
    giftAidRequested:
      donorType === 'INDIVIDUAL' ? (body.giftAidRequested ?? null) : null,
    giftAidDeclarationCaptured:
      donorType === 'INDIVIDUAL'
        ? (body.giftAidDeclarationCaptured ?? null)
        : null,
    ...(donorType === 'INDIVIDUAL' &&
    normalizeString(body.giftAidDeclarationDate) !== ''
      ? { giftAidDeclarationDate: normalizeString(body.giftAidDeclarationDate) }
      : {}),
    ...(donorType === 'INDIVIDUAL' &&
    normalizeString(body.giftAidCoverageScope) !== ''
      ? { giftAidCoverageScope: normalizeString(body.giftAidCoverageScope) }
      : {}),
    ...(donorType === 'INDIVIDUAL' &&
    normalizeString(body.giftAidDeclarationSource) !== ''
      ? {
          giftAidDeclarationSource: normalizeString(
            body.giftAidDeclarationSource,
          ),
        }
      : {}),
    ...(donorType === 'INDIVIDUAL' &&
    normalizeString(body.giftAidTextVersion) !== ''
      ? { giftAidTextVersion: normalizeString(body.giftAidTextVersion) }
      : {}),
    ...(donorType === 'INDIVIDUAL' &&
    normalizeString(body.giftAidDeclarationId) !== ''
      ? { giftAidDeclarationId: normalizeString(body.giftAidDeclarationId) }
      : {}),
    ...(normalizeString(body.selectedRecurringAgreementId) !== ''
      ? {
          recurringAgreementId: normalizeString(
            body.selectedRecurringAgreementId,
          ),
        }
      : {}),
  };
};
