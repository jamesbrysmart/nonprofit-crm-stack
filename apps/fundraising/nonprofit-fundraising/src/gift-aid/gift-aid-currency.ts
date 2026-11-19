// Gift Aid is claimed from HMRC in sterling. Until foreign-currency gifts carry
// a sterling valuation at the donation date, only GBP gifts can be claimable.
export const GIFT_AID_CURRENCY_CODE = 'GBP';

export const NON_STERLING_GIFT_AID_REASON_CODE = 'non_sterling_currency';

export const isSterlingAmount = (
  amount: { currencyCode?: string | null } | null | undefined,
) =>
  (amount?.currencyCode ?? '').trim().toUpperCase() === GIFT_AID_CURRENCY_CODE;
