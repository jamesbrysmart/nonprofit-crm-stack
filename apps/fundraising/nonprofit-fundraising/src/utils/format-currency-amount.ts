import { getDefaultCurrencyCode } from 'src/reporting-currency/reporting-currency';
type CurrencyAmount = {
  amountMicros?: number | null;
  currencyCode?: string | null;
};

const normalizeCurrencyCode = (value: string | null | undefined) => {
  const normalized = typeof value === 'string' ? value.trim() : '';

  return normalized === '' ? getDefaultCurrencyCode() : normalized;
};

export const formatCurrencyAmount = (
  amount: CurrencyAmount | null | undefined,
  emptyLabel = 'Not recorded',
) => {
  const micros = amount?.amountMicros;

  if (typeof micros !== 'number') {
    return emptyLabel;
  }

  const currencyCode = normalizeCurrencyCode(amount?.currencyCode);
  const units = micros / 1_000_000;

  try {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currencyCode,
    }).format(units);
  } catch {
    return `${currencyCode} ${units.toFixed(2)}`;
  }
};
