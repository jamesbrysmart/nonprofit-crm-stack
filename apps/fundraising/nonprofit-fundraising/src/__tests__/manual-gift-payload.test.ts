import { describe, expect, it } from 'vitest';
import { buildManualGiftPayload } from 'src/manual-gift-entry/manual-gift-payload';

describe('buildManualGiftPayload', () => {
  it('allows anonymous individual gifts without donor name evidence', () => {
    expect(
      buildManualGiftPayload({
        body: {
          isAnonymousDonor: true,
          amountValue: '25.00',
          currencyCode: 'GBP',
          paymentType: 'BANK_TRANSFER',
          giftDate: '2026-04-21',
        },
        donorType: 'INDIVIDUAL',
        donorId: null,
      }),
    ).toMatchObject({
      isAnonymousDonor: true,
      donorFirstName: '',
      donorLastName: '',
      donorId: null,
    });
  });

  it('still requires donor names for non-anonymous individual gifts', () => {
    expect(() =>
      buildManualGiftPayload({
        body: {
          amountValue: '25.00',
          currencyCode: 'GBP',
          paymentType: 'BANK_TRANSFER',
          giftDate: '2026-04-21',
        },
        donorType: 'INDIVIDUAL',
        donorId: null,
      }),
    ).toThrow('Donor first name and last name are required');
  });
});
