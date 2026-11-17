const EURO_FORMAT = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});

export const formatEuros = (amountMicros: number) => EURO_FORMAT.format(amountMicros / 1_000_000);
