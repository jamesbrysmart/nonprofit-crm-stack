import { describe, expect, it } from 'vitest';
import {
  hasSameReportingValue,
  resolveGiftReportingValue,
  withGiftReportingValue,
} from 'src/reporting-currency/gift-reporting-value';

const money = (amount: number, currencyCode: string) => ({
  amountMicros: amount * 1_000_000,
  currencyCode,
});

describe('resolveGiftReportingValue', () => {
  it('copies the amount when the gift is in the reporting currency', () => {
    expect(
      resolveGiftReportingValue(
        { amount: money(50, 'GBP'), reportingAmount: money(1, 'GBP') },
        'GBP',
      ),
    ).toEqual({ reportingAmount: money(50, 'GBP'), reportingAmountStatus: 'SAME_CURRENCY' });
  });

  it('uses the provider settlement for a converted payment', () => {
    expect(
      resolveGiftReportingValue(
        { amount: money(100, 'EUR'), grossPaymentAmount: money(86, 'GBP') },
        'GBP',
      ),
    ).toEqual({
      reportingAmount: money(86, 'GBP'),
      reportingAmountStatus: 'PROVIDER_SETTLEMENT',
    });
  });

  it('does not treat a settlement in another currency as a reporting value', () => {
    expect(
      resolveGiftReportingValue(
        { amount: money(100, 'EUR'), grossPaymentAmount: money(100, 'EUR') },
        'GBP',
      ),
    ).toEqual({ reportingAmount: null, reportingAmountStatus: 'MISSING' });
  });

  it('keeps a value entered manually, including over a settlement it replaces', () => {
    expect(
      resolveGiftReportingValue(
        {
          amount: money(100, 'EUR'),
          reportingAmount: money(85, 'GBP'),
          reportingAmountStatus: 'PROVIDER_SETTLEMENT',
          grossPaymentAmount: money(86, 'GBP'),
        },
        'GBP',
      ),
    ).toEqual({ reportingAmount: money(85, 'GBP'), reportingAmountStatus: 'MANUAL' });
  });

  it('marks a foreign gift without any value as needing one', () => {
    expect(
      resolveGiftReportingValue({ amount: money(100, 'USD') }, 'GBP'),
    ).toEqual({ reportingAmount: null, reportingAmountStatus: 'MISSING' });
  });

  it('clears a reporting amount left in a previous reporting currency', () => {
    expect(
      resolveGiftReportingValue(
        {
          amount: money(100, 'USD'),
          reportingAmount: money(79, 'GBP'),
          reportingAmountStatus: 'MANUAL',
        },
        'EUR',
      ),
    ).toEqual({ reportingAmount: null, reportingAmountStatus: 'MISSING' });
  });

  it('is stable when applied to its own result', () => {
    const inputs = [
      { amount: money(10, 'GBP') },
      { amount: money(100, 'EUR'), grossPaymentAmount: money(86, 'GBP') },
      { amount: money(100, 'EUR'), reportingAmount: money(85, 'GBP') },
      { amount: money(100, 'USD') },
    ];

    for (const input of inputs) {
      const first = resolveGiftReportingValue(input, 'GBP');
      const again = resolveGiftReportingValue({ ...input, ...first }, 'GBP');

      expect(again).toEqual(first);
      expect(hasSameReportingValue({ ...input, ...first }, again)).toBe(true);
    }
  });
});

describe('withGiftReportingValue', () => {
  it('leaves the payload unchanged without a reporting currency', () => {
    const payload = { amount: money(20, 'EUR') };

    expect(withGiftReportingValue(payload, money(17, 'GBP'), null)).toBe(payload);
  });

  it('adds the value and status for a same-currency gift', () => {
    expect(withGiftReportingValue({ amount: money(20, 'GBP') }, null, 'GBP')).toEqual({
      amount: money(20, 'GBP'),
      reportingAmount: money(20, 'GBP'),
      reportingAmountStatus: 'SAME_CURRENCY',
    });
  });

  it('uses an entered value for a foreign gift, and otherwise marks it missing', () => {
    expect(
      withGiftReportingValue({ amount: money(20, 'EUR') }, money(17, 'GBP'), 'GBP'),
    ).toMatchObject({ reportingAmount: money(17, 'GBP'), reportingAmountStatus: 'MANUAL' });
    expect(
      withGiftReportingValue({ amount: money(20, 'EUR') }, null, 'GBP'),
    ).toEqual({ amount: money(20, 'EUR'), reportingAmountStatus: 'MISSING' });
  });
});
