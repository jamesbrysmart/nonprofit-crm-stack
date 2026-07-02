import { describe, expect, it } from 'vitest';
import { deriveGiftTypeForOpportunityPayment } from 'src/opportunity-payments/opportunity-payment-gift-type';

describe('deriveGiftTypeForOpportunityPayment', () => {
  it.each([
    ['GRANT', 'GRANT'],
    ['TRUST_FOUNDATION', 'GRANT'],
    ['STATUTORY_BID', 'GRANT'],
    ['CORPORATE_SPONSORSHIP', 'SPONSORSHIP'],
    ['MAJOR_GIFT', 'DONATION'],
    ['OTHER', 'DONATION'],
    [null, 'DONATION'],
    ['unexpected_value', 'DONATION'],
  ] as const)('maps %s to %s', (fundingType, expectedGiftType) => {
    expect(deriveGiftTypeForOpportunityPayment(fundingType)).toBe(
      expectedGiftType,
    );
  });
});
