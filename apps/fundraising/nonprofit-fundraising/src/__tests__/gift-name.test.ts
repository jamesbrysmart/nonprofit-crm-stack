import { describe, expect, it } from 'vitest';
import { buildGiftName } from 'src/gifts/gift-name';

describe('buildGiftName', () => {
  it('builds a donation name for an individual donor', () => {
    expect(
      buildGiftName({
        giftType: 'DONATION',
        donorName: 'Ada Lovelace',
        amountMicros: 25_000_000,
        currencyCode: 'GBP',
        giftDate: '2026-06-24',
      }),
    ).toBe('Donation from Ada Lovelace - £25 - 2026-06-24');
  });

  it('prefers company name over donor name', () => {
    expect(
      buildGiftName({
        giftType: 'GRANT',
        donorName: 'Ada Lovelace',
        companyName: 'Northbank Foundation',
        amountMicros: 10_000_000_000,
        currencyCode: 'GBP',
        giftDate: '2026-06-24',
      }),
    ).toBe('Grant from Northbank Foundation - £10,000 - 2026-06-24');
  });

  it('keeps pennies when the amount is not a whole major currency unit', () => {
    expect(
      buildGiftName({
        giftType: 'SPONSORSHIP',
        companyName: 'Acme Ltd',
        amountMicros: 2_500_500_000,
        currencyCode: 'GBP',
        giftDate: '2026-06-24',
      }),
    ).toBe('Sponsorship from Acme Ltd - £2,500.50 - 2026-06-24');
  });

  it('marks gift in kind amounts as estimated', () => {
    expect(
      buildGiftName({
        giftType: 'GIFT_IN_KIND',
        donorName: 'Ada Lovelace',
        amountMicros: 150_000_000,
        currencyCode: 'GBP',
        giftDate: '2026-06-24',
      }),
    ).toBe('Gift in kind from Ada Lovelace - £150 est. - 2026-06-24');
  });

  it('omits amount when the amount is unavailable', () => {
    expect(
      buildGiftName({
        giftType: 'DONATION',
        donorName: 'Ada Lovelace',
        currencyCode: 'GBP',
        giftDate: '2026-06-24',
      }),
    ).toBe('Donation from Ada Lovelace - 2026-06-24');
  });
});
