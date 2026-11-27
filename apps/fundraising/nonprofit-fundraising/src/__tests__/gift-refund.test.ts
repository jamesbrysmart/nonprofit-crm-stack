import { describe, expect, it } from 'vitest';

import { deriveRefundState } from 'src/gift-lifecycle/gift-refund';

describe('deriveRefundState', () => {
  it.each([
    [null, 'NOT_REFUNDED'],
    [10_000_000, 'PARTIALLY_REFUNDED'],
    [50_000_000, 'FULLY_REFUNDED'],
  ] as const)(
    'classifies a £50 gift with a refund of %s micros as %s',
    (amountMicros, state) => {
      expect(
        deriveRefundState({
          amount: { amountMicros: 50_000_000, currencyCode: 'GBP' },
          refundedAmount:
            amountMicros === null ? null : { amountMicros, currencyCode: 'GBP' },
        }),
      ).toBe(state);
    },
  );
});

