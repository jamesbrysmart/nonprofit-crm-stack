import type {
  ManualGiftDonorType,
  ManualGiftEntryRequest,
} from 'src/manual-gift-entry/manual-gift-entry.types';
import { buildGiftName } from 'src/gifts/gift-name';
import {
  getManualGiftType,
  getManualGiftPaymentType,
  normalizeRequiredCurrencyCode,
  normalizeRequiredGiftDate,
  parseRequiredManualGiftAmountMicros,
} from 'src/manual-gift-entry/manual-gift-normalization';
import { normalizeString } from 'src/utils/normalize-string';

export const buildManualGiftPayload = (args: {
  body: ManualGiftEntryRequest;
  donorType: ManualGiftDonorType;
  donorId?: string | null;
  companyId?: string | null;
}) => {
  const { body, donorType, donorId, companyId } = args;
  const giftType = getManualGiftType(body.giftType);
  const isAnonymousDonor =
    donorType === 'INDIVIDUAL' && body.isAnonymousDonor === true;
  const donorFirstName = isAnonymousDonor
    ? ''
    : normalizeString(body.donorFirstName);
  const donorLastName = isAnonymousDonor
    ? ''
    : normalizeString(body.donorLastName);
  const donorEmail = normalizeString(body.donorEmail);
  const companyName = normalizeString(body.companyName);
  const description = normalizeString(body.description);
  const provider = normalizeString(body.provider);
  const currencyCode = normalizeRequiredCurrencyCode(body.currencyCode);
  const amountMicros = parseRequiredManualGiftAmountMicros(body.amountValue);
  const giftDate = normalizeRequiredGiftDate(body.giftDate);
  const donorName = `${donorFirstName} ${donorLastName}`.trim();

  if (
    donorType === 'INDIVIDUAL' &&
    !isAnonymousDonor &&
    (donorFirstName === '' || donorLastName === '')
  ) {
    throw new Error('Donor first name and last name are required');
  }

  if (donorType === 'COMPANY' && companyName === '') {
    throw new Error('Company name is required');
  }

  return {
    // Manual entry bypasses staging by default because this is the trusted
    // operator path in the product model.
    name: buildGiftName({
      giftType,
      donorName,
      companyName: donorType === 'COMPANY' ? companyName : null,
      isAnonymousDonor,
      amountMicros,
      currencyCode,
      giftDate,
    }),
    amount: {
      currencyCode,
      amountMicros,
    },
    giftDate,
    giftType,
    ...(description !== '' ? { description } : {}),
    ...(provider !== '' ? { provider } : {}),
    ...(donorType === 'INDIVIDUAL'
      ? {
          donorFirstName,
          donorLastName,
          donorId,
        }
      : {}),
    ...(isAnonymousDonor ? { isAnonymousDonor: true } : {}),
    paymentType: getManualGiftPaymentType(body.paymentType),
    ...(donorType === 'INDIVIDUAL' && !isAnonymousDonor && donorEmail !== ''
      ? { donorEmail }
      : {}),
    ...(donorType === 'COMPANY' && companyName !== '' ? { companyName } : {}),
    ...(donorType === 'COMPANY' && companyId ? { companyId } : {}),
    ...(normalizeString(body.selectedRecurringAgreementId) !== ''
      ? {
          recurringAgreementId: normalizeString(
            body.selectedRecurringAgreementId,
          ),
        }
      : {}),
  };
};
