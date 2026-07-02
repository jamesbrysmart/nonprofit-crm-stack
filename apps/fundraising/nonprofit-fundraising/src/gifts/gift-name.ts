export type GiftNameGiftType =
  | 'DONATION'
  | 'GRANT'
  | 'SPONSORSHIP'
  | 'GIFT_IN_KIND'
  | string
  | null
  | undefined;

const normalizeString = (value: string | null | undefined): string =>
  typeof value === 'string' ? value.trim() : '';

const buildGiftTypeLabel = (giftType: GiftNameGiftType): string => {
  switch (normalizeString(giftType).toUpperCase()) {
    case 'GRANT':
      return 'Grant';
    case 'SPONSORSHIP':
      return 'Sponsorship';
    case 'GIFT_IN_KIND':
      return 'Gift in kind';
    case 'DONATION':
    default:
      return 'Donation';
  }
};

const buildDonorLabel = (args: {
  donorName?: string | null;
  companyName?: string | null;
}): string => {
  const companyName = normalizeString(args.companyName);

  if (companyName !== '') {
    return companyName;
  }

  return normalizeString(args.donorName) || 'Unknown donor';
};

const formatAmount = (args: {
  amountMicros?: number | null;
  currencyCode?: string | null;
  giftType?: GiftNameGiftType;
}): string => {
  const { amountMicros } = args;
  const currencyCode = normalizeString(args.currencyCode).toUpperCase();

  if (typeof amountMicros !== 'number' || !Number.isFinite(amountMicros)) {
    return '';
  }

  const amount = amountMicros / 1_000_000;
  const hasDecimals = Math.abs(amount % 1) > Number.EPSILON;
  const formattedNumber = amount.toLocaleString('en-GB', {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  });
  const currencyPrefix =
    currencyCode === 'GBP' ? '£' : currencyCode === '' ? '' : `${currencyCode} `;
  const formattedAmount = `${currencyPrefix}${formattedNumber}`;

  return normalizeString(args.giftType).toUpperCase() === 'GIFT_IN_KIND'
    ? `${formattedAmount} est.`
    : formattedAmount;
};

export const buildGiftName = (args: {
  giftType?: GiftNameGiftType;
  donorName?: string | null;
  companyName?: string | null;
  amountMicros?: number | null;
  currencyCode?: string | null;
  giftDate?: string | null;
}): string => {
  const baseName = `${buildGiftTypeLabel(args.giftType)} from ${buildDonorLabel(
    args,
  )}`;
  const amount = formatAmount(args);
  const giftDate = normalizeString(args.giftDate);

  return [baseName, amount, giftDate]
    .filter((part) => part !== '')
    .join(' - ');
};
