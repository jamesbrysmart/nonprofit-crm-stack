import { describe, expect, it } from 'vitest';
import { computeAppealRollupSummary } from 'src/appeal-rollups/appeal-rollups';
import { computeCompanyRollupSummary } from 'src/company-rollups/company-rollups';
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

  it('totals and ranks donor gifts in the reporting currency only', () => {
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
    // The €500 gift is larger at face value but has no GBP value.
    expect(summary.largestGiftAmount).toEqual({
      amountMicros: 100_000_000,
      currencyCode: 'GBP',
    });
    // Counts, dates and the last gift still reflect every gift.
    expect(summary.giftCount).toBe(3);
    expect(summary.lastGiftDate).toBe('2026-04-01');
    expect(summary.lastGiftAmount).toEqual({
      amountMicros: 500_000_000,
      currencyCode: 'EUR',
    });
  });

  it('leaves monetary totals untouched when no reporting currency is set', () => {
    const summary = computeDonorRollupSummary(
      'person-1',
      mixedGifts,
      undefined,
      null,
    );

    expect(summary.lifetimeGiftAmount).toBeUndefined();
    expect(summary.largestGiftAmount).toBeUndefined();
    expect(summary.giftCount).toBe(3);
  });

  it('totals an appeal in the reporting currency only', () => {
    expect(
      computeAppealRollupSummary('appeal-1', mixedGifts, undefined, 'EUR')
        .raisedAmount,
    ).toEqual({ amountMicros: 500_000_000, currencyCode: 'EUR' });
  });

  it('totals company awards only in the reporting currency', () => {
    const summary = computeCompanyRollupSummary(
      'company-1',
      [],
      [
        { id: 'opp-1', awardedAmount: { amountMicros: 10_000_000_000, currencyCode: 'GBP' } },
        { id: 'opp-2', awardedAmount: { amountMicros: 20_000_000_000, currencyCode: 'USD' } },
      ],
      undefined,
      'GBP',
    );

    expect(summary.awardedOpportunityAmount).toEqual({
      amountMicros: 10_000_000_000,
      currencyCode: 'GBP',
    });
    expect(summary.awardedOpportunityCount).toBe(2);
  });
});
