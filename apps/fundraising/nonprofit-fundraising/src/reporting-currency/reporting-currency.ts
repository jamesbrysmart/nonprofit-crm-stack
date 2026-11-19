// Financial totals are kept in one organisational reporting currency. A gift
// only contributes when it has a value in that currency; others are excluded
// from totals rather than added at face value.

export type Money =
  | {
      amountMicros?: number | null;
      currencyCode?: string | null;
    }
  | null
  | undefined;

const CURRENCY_CODE_PATTERN = /^[A-Z]{3}$/;

export const normalizeCurrencyCode = (value: string | null | undefined) =>
  (value ?? '').trim().toUpperCase();

// Null until an admin sets REPORTING_CURRENCY: totals are then left untouched
// rather than computed in an assumed currency.
export const getReportingCurrencyCode = (): string | null => {
  const configured = normalizeCurrencyCode(process.env.REPORTING_CURRENCY);

  return CURRENCY_CODE_PATTERN.test(configured) ? configured : null;
};

export const valueInCurrency = (money: Money, currencyCode: string) =>
  money &&
  normalizeCurrencyCode(money.currencyCode) === currencyCode &&
  typeof money.amountMicros === 'number' &&
  Number.isFinite(money.amountMicros)
    ? Math.round(money.amountMicros)
    : null;

// The gift's recorded reporting amount when it is in the current reporting
// currency, otherwise its own amount when that already is.
export const getReportingValueMicros = (
  gift: { amount?: Money; reportingAmount?: Money },
  reportingCurrencyCode: string,
): number | null =>
  valueInCurrency(gift.reportingAmount, reportingCurrencyCode) ??
  valueInCurrency(gift.amount, reportingCurrencyCode);

export const sumReportingValues = <TGift extends { amount?: Money; reportingAmount?: Money }>(
  gifts: TGift[],
  reportingCurrencyCode: string,
) => {
  let amountMicros = 0;
  let excludedCount = 0;

  for (const gift of gifts) {
    const value = getReportingValueMicros(gift, reportingCurrencyCode);

    if (value === null) {
      excludedCount += 1;
    } else {
      amountMicros += value;
    }
  }

  return {
    total: { amountMicros, currencyCode: reportingCurrencyCode },
    excludedCount,
  };
};

export const findLargestByReportingValue = <TGift extends { amount?: Money; reportingAmount?: Money }>(
  gifts: TGift[],
  reportingCurrencyCode: string,
) => {
  let largest: number | null = null;

  for (const gift of gifts) {
    const value = getReportingValueMicros(gift, reportingCurrencyCode);

    if (value !== null && (largest === null || value > largest)) {
      largest = value;
    }
  }

  return largest === null
    ? null
    : { amountMicros: largest, currencyCode: reportingCurrencyCode };
};
