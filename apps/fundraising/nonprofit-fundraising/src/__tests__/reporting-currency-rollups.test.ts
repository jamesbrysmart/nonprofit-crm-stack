import { describe, expect, it } from 'vitest';
import { computeAppealRollupSummary } from 'src/appeal-rollups/appeal-rollups';
import { computeDonorRollupSummary } from 'src/donor-rollups/donor-rollups';
import {
  getReportingValueMicros,
  sumReportingValues,
} from 'src/reporting-currency/reporting-currency';

const gift = (
  id: string,
  giftDate: string,
  amount: number,
  currencyCode: string,
) => ({
  id,
  giftDate,
  giftType: 'DONATION',
  amount: { amountMicros: amount * 1_000_000, currencyCode },
});

describe('reporting-currency values', () => {
  it('uses a recorded reporting amount, then a same-currency amount, otherwise none', () => {
    expect(
      getReportingValueMicros(
        {
          amount: { amountMicros: 100_000_000, currencyCode: 'EUR' },
          reportingAmount: { amountMicros: 86_000_000, currencyCode: 'GBP' },
        },
        'GBP',
      ),
    ).toBe(86_000_000);
    expect(
      getReportingValueMicros(
        { amount: { amountMicros: 50_000_000, currencyCode: 'gbp' } },
        'GBP',
      ),
    ).toBe(50_000_000);
    expect(
      getReportingValueMicros(
        { amount: { amountMicros: 100_000_000, currencyCode: 'EUR' } },
        'GBP',
      ),
    ).toBeNull();
  });

  it('ignores a reporting amount recorded in a previous reporting currency', () => {
    expect(
      getReportingValueMicros(
        {
          amount: { amountMicros: 100_000_000, currencyCode: 'USD' },
          reportingAmount: { amountMicros: 79_000_000, currencyCode: 'GBP' },
        },
        'EUR',
      ),
    ).toBeNull();
  });

  it('counts gifts it cannot value instead of adding them', () => {
    expect(
      sumReportingValues(
        [gift('a', '2026-01-01', 100, 'GBP'), gift('b', '2026-01-02', 500, 'EUR')],
        'GBP',
      ),
    ).toEqual({
      total: { amountMicros: 100_000_000, currencyCode: 'GBP' },
      excludedCount: 1,
    });
  });
});

describe('rollups never combine currencies', () => {
  const mixedGifts = [
    gift('gbp-1', '2026-03-01', 100, 'GBP'),
    gift('eur-1', '2026-04-01', 500, 'EUR'),
    gift('gbp-2', '2026-02-01', 40, 'GBP'),
  ];

  it('recalculates donor totals after an exclusion is resolved and retains the original gift amount', () => {
    const summary = computeDonorRollupSummary(
      'person-1',
      mixedGifts,
      undefined,
      'GBP',
    );

    expect(summary.lifetimeGiftAmount).toEqual({
      amountMicros: 140_000_000,
      currencyCode: 'GBP',
    });
    expect(summary.largestGiftAmount).toEqual({
      amountMicros: 100_000_000,
      currencyCode: 'GBP',
    });
    expect(summary.giftCount).toBe(3);
    expect(summary.lastGiftDate).toBe('2026-04-01');
    expect(summary.lastGiftAmount).toEqual({
      amountMicros: 500_000_000,
      currencyCode: 'EUR',
    });

    const valuedGifts = mixedGifts.map((gift) =>
      gift.id === 'eur-1'
        ? {
            ...gift,
            reportingAmount: { amountMicros: 90_000_000, currencyCode: 'GBP' },
          }
        : gift,
    );

    expect(
      computeDonorRollupSummary('person-1', valuedGifts, undefined, 'GBP'),
    ).toMatchObject({
      lifetimeGiftAmount: { amountMicros: 230_000_000, currencyCode: 'GBP' },
      largestGiftAmount: { amountMicros: 100_000_000, currencyCode: 'GBP' },
      lastGiftAmount: { amountMicros: 500_000_000, currencyCode: 'EUR' },
      giftCount: 3,
    });
  });

  it('totals an appeal in the reporting currency only', () => {
    expect(
      computeAppealRollupSummary('appeal-1', mixedGifts, undefined, 'EUR')
        .raisedAmount,
    ).toEqual({ amountMicros: 500_000_000, currencyCode: 'EUR' });
  });
});
