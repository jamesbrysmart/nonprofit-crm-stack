import {
  normalizeCurrencyCode,
  valueInCurrency,
  type Money,
} from 'src/reporting-currency/reporting-currency';

export const REPORTING_AMOUNT_STATUSES = [
  'SAME_CURRENCY',
  'PROVIDER_SETTLEMENT',
  'MANUAL',
  'MISSING',
] as const;

export type ReportingAmountStatus = (typeof REPORTING_AMOUNT_STATUSES)[number];

export type GiftReportingInput = {
  amount?: Money;
  reportingAmount?: Money;
  reportingAmountStatus?: string | null;
  grossPaymentAmount?: Money;
};

export type GiftReportingValue = {
  reportingAmount: { amountMicros: number; currencyCode: string } | null;
  reportingAmountStatus: ReportingAmountStatus;
};

const inReportingCurrency = (
  amountMicros: number,
  currencyCode: string,
): GiftReportingValue['reportingAmount'] => ({ amountMicros, currencyCode });

// The single rule for a gift's reporting value, applied when a gift is created,
// edited or backfilled. It only fills the reporting fields; the donor's amount
// is never changed.
export const resolveGiftReportingValue = (
  gift: GiftReportingInput,
  reportingCurrencyCode: string,
): GiftReportingValue => {
  const ownAmount = valueInCurrency(gift.amount, reportingCurrencyCode);

  if (ownAmount !== null) {
    return {
      reportingAmount: inReportingCurrency(ownAmount, reportingCurrencyCode),
      reportingAmountStatus: 'SAME_CURRENCY',
    };
  }

  // The provider's gross settlement is what it actually credited for the
  // whole payment, before fees, in that currency.
  const settlement = valueInCurrency(
    gift.grossPaymentAmount,
    reportingCurrencyCode,
  );
  const recorded = valueInCurrency(gift.reportingAmount, reportingCurrencyCode);

  if (
    settlement !== null &&
    gift.reportingAmountStatus === 'PROVIDER_SETTLEMENT' &&
    (recorded === null || recorded === settlement)
  ) {
    return {
      reportingAmount: inReportingCurrency(settlement, reportingCurrencyCode),
      reportingAmountStatus: 'PROVIDER_SETTLEMENT',
    };
  }

  // A value someone entered wins over the settlement once it differs from it.
  if (recorded !== null) {
    return {
      reportingAmount: inReportingCurrency(recorded, reportingCurrencyCode),
      reportingAmountStatus: 'MANUAL',
    };
  }

  if (settlement !== null) {
    return {
      reportingAmount: inReportingCurrency(settlement, reportingCurrencyCode),
      reportingAmountStatus: 'PROVIDER_SETTLEMENT',
    };
  }

  return { reportingAmount: null, reportingAmountStatus: 'MISSING' };
};

export const hasSameReportingValue = (
  current: GiftReportingInput,
  next: GiftReportingValue,
) =>
  current.reportingAmountStatus === next.reportingAmountStatus &&
  (next.reportingAmount === null
    ? !current.reportingAmount ||
      typeof current.reportingAmount.amountMicros !== 'number'
    : Math.round(current.reportingAmount?.amountMicros ?? Number.NaN) ===
        next.reportingAmount.amountMicros &&
      normalizeCurrencyCode(current.reportingAmount?.currencyCode) ===
        next.reportingAmount.currencyCode);

// Adds the reporting fields to a gift about to be created. Without a reporting
// currency the payload is returned unchanged and the fields stay empty.
export const withGiftReportingValue = <
  TPayload extends { amount?: Money; grossPaymentAmount?: Money },
>(
  payload: TPayload,
  enteredReportingAmount: Money,
  reportingCurrencyCode: string | null,
) => {
  if (!reportingCurrencyCode) {
    return payload;
  }

  const value = resolveGiftReportingValue(
    {
      amount: payload.amount,
      grossPaymentAmount: payload.grossPaymentAmount,
      reportingAmount: enteredReportingAmount,
    },
    reportingCurrencyCode,
  );

  return {
    ...payload,
    ...(value.reportingAmount ? { reportingAmount: value.reportingAmount } : {}),
    reportingAmountStatus: value.reportingAmountStatus,
  };
};
