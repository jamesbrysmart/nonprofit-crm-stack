import type { MailingAddressEvidence } from 'src/gift-aid/gift-aid.types';
import type {
  ManualGiftCompanyChoice,
  ManualGiftDonorChoice,
  ManualGiftDonorType,
  ManualGiftEntryRequest,
  ManualGiftPaymentType,
  ManualGiftType,
} from 'src/manual-gift-entry/manual-gift-entry.types';

export const normalizeString = (value: string | null | undefined) =>
  value?.trim() ?? '';

export const getManualGiftDonorType = (
  donorType: ManualGiftDonorType | undefined,
): ManualGiftDonorType => {
  switch (donorType) {
    case 'INDIVIDUAL':
    case 'COMPANY':
      return donorType;
    default:
      return 'INDIVIDUAL';
  }
};

export const parseManualGiftAmountMicros = (
  amountValue: string | null | undefined,
) => {
  const parsed = Number.parseFloat(normalizeString(amountValue));

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return Math.round(parsed * 1_000_000);
};

export const parseRequiredManualGiftAmountMicros = (
  amountValue: string | null | undefined,
) => {
  const amountMicros = parseManualGiftAmountMicros(amountValue);

  if (amountMicros === null) {
    throw new Error('Amount must be a positive number');
  }

  return amountMicros;
};

export const normalizeCurrencyCode = (currencyCode: string | undefined) =>
  normalizeString(currencyCode).toUpperCase();

export const normalizeRequiredCurrencyCode = (
  currencyCode: string | undefined,
) => {
  const normalized = normalizeCurrencyCode(currencyCode);

  if (normalized === '') {
    throw new Error('Currency is required');
  }

  return normalized;
};

export const normalizeGiftDate = (giftDate: string | undefined) =>
  normalizeString(giftDate);

export const normalizeRequiredGiftDate = (giftDate: string | undefined) => {
  const normalized = normalizeGiftDate(giftDate);

  if (normalized === '') {
    throw new Error('Gift date is required');
  }

  return normalized;
};

export const getManualGiftDonorChoice = (
  donorChoice: ManualGiftDonorChoice | undefined,
): ManualGiftDonorChoice => {
  if (donorChoice === 'USE_EXISTING' || donorChoice === 'CREATE_NEW') {
    return donorChoice;
  }

  throw new Error(
    'Choose whether to use an existing donor or create a new donor before saving.',
  );
};

export const getManualGiftCompanyChoice = (
  companyChoice: ManualGiftCompanyChoice | undefined,
): ManualGiftCompanyChoice => {
  if (companyChoice === 'USE_EXISTING' || companyChoice === 'CREATE_NEW') {
    return companyChoice;
  }

  throw new Error(
    'Choose whether to use an existing company or create a new company before saving.',
  );
};

export const getManualGiftPaymentType = (
  paymentType: ManualGiftEntryRequest['paymentType'],
): ManualGiftPaymentType => {
  switch (paymentType) {
    case 'CARD':
    case 'DIRECT_DEBIT':
    case 'BANK_TRANSFER':
    case 'CASH':
    case 'CHEQUE':
    case 'OTHER':
      return paymentType;
    default:
      throw new Error('Payment type is required');
  }
};

export const getManualGiftType = (
  giftType: ManualGiftEntryRequest['giftType'],
): ManualGiftType => {
  switch (giftType) {
    case 'DONATION':
    case 'GRANT':
    case 'SPONSORSHIP':
    case 'GIFT_IN_KIND':
      return giftType;
    default:
      return 'DONATION';
  }
};

export const normalizeManualGiftMailingAddress = (
  mailingAddress: MailingAddressEvidence | null | undefined,
) => {
  if (!mailingAddress) {
    return null;
  }

  const normalized = {
    ...(normalizeString(mailingAddress.addressStreet1) !== ''
      ? { addressStreet1: normalizeString(mailingAddress.addressStreet1) }
      : {}),
    ...(normalizeString(mailingAddress.addressStreet2) !== ''
      ? { addressStreet2: normalizeString(mailingAddress.addressStreet2) }
      : {}),
    ...(normalizeString(mailingAddress.addressCity) !== ''
      ? { addressCity: normalizeString(mailingAddress.addressCity) }
      : {}),
    ...(normalizeString(mailingAddress.addressState) !== ''
      ? { addressState: normalizeString(mailingAddress.addressState) }
      : {}),
    ...(normalizeString(mailingAddress.addressPostcode) !== ''
      ? { addressPostcode: normalizeString(mailingAddress.addressPostcode) }
      : {}),
    ...(normalizeString(mailingAddress.addressCountry) !== ''
      ? {
          addressCountry: normalizeString(
            mailingAddress.addressCountry,
          ).toUpperCase(),
        }
      : {}),
  };

  return Object.keys(normalized).length === 0 ? null : normalized;
};
