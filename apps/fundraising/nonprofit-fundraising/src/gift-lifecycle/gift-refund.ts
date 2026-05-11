export type CurrencyAmount = {
  amountMicros?: number | null;
  currencyCode?: string | null;
} | null;

export type DerivedRefundState =
  | 'NOT_REFUNDED'
  | 'PARTIALLY_REFUNDED'
  | 'FULLY_REFUNDED';

const normalizeAmountMicros = (value: number | null | undefined) => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.round(value));
};

export const deriveRefundState = ({
  amount,
  refundedAmount,
}: {
  amount?: CurrencyAmount;
  refundedAmount?: CurrencyAmount;
}): DerivedRefundState => {
  const originalAmountMicros = normalizeAmountMicros(amount?.amountMicros);
  const refundedAmountMicros = normalizeAmountMicros(refundedAmount?.amountMicros);

  if (refundedAmountMicros <= 0) {
    return 'NOT_REFUNDED';
  }

  if (originalAmountMicros > 0 && refundedAmountMicros < originalAmountMicros) {
    return 'PARTIALLY_REFUNDED';
  }

  return 'FULLY_REFUNDED';
};

