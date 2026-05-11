import { describe, expect, it } from 'vitest';

import { deriveRefundState } from 'src/gift-lifecycle/gift-refund';

describe('deriveRefundState', () => {
  it('returns not refunded when no refunded amount is recorded', () => {
    expect(
      deriveRefundState({
        amount: {
          amountMicros: 50_000_000,
          currencyCode: 'GBP',
        },
        refundedAmount: null,
      }),
    ).toBe('NOT_REFUNDED');
  });

  it('returns partially refunded when refunded amount is below original amount', () => {
    expect(
      deriveRefundState({
        amount: {
          amountMicros: 50_000_000,
          currencyCode: 'GBP',
        },
        refundedAmount: {
          amountMicros: 10_000_000,
          currencyCode: 'GBP',
        },
      }),
    ).toBe('PARTIALLY_REFUNDED');
  });

  it('returns fully refunded when refunded amount reaches original amount', () => {
    expect(
      deriveRefundState({
        amount: {
          amountMicros: 50_000_000,
          currencyCode: 'GBP',
        },
        refundedAmount: {
          amountMicros: 50_000_000,
          currencyCode: 'GBP',
        },
      }),
    ).toBe('FULLY_REFUNDED');
  });
});

