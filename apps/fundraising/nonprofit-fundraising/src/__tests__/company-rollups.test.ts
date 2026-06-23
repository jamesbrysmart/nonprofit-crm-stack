import { describe, expect, it, vi } from 'vitest';

import {
  collectCompanyIds,
  computeCompanyRollupSummary,
  getAffectedCompanyIdsFromGiftUpdate,
  getAffectedCompanyIdsFromOpportunityUpdate,
} from 'src/company-rollups/company-rollups';

describe('collectCompanyIds', () => {
  it('dedupes and trims company ids while removing empty values', () => {
    expect(
      collectCompanyIds([
        ' company_1 ',
        'company_2',
        '',
        null,
        'company_1',
        undefined,
      ]),
    ).toEqual(['company_1', 'company_2']);
  });
});

describe('computeCompanyRollupSummary', () => {
  it('computes factual company funding rollups without using stage semantics', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-16T12:00:00.000Z'));

    expect(
      computeCompanyRollupSummary(
        'company_1',
        [
          {
            id: 'gift_1',
            giftDate: '2026-05-01',
            amount: {
              amountMicros: 12_500_000,
              currencyCode: 'GBP',
            },
            company: {
              id: 'company_1',
            },
          },
          {
            id: 'gift_2',
            giftDate: '2026-05-07',
            amount: {
              amountMicros: 30_000_000,
              currencyCode: 'GBP',
            },
            company: {
              id: 'company_1',
            },
          },
        ],
        [
          {
            id: 'opportunity_1',
            applicationDeadline: '2026-07-20',
            fundingPeriodEnd: '2027-03-31',
            awardedAmount: {
              amountMicros: 100_000_000,
              currencyCode: 'GBP',
            },
            company: {
              id: 'company_1',
            },
          },
          {
            id: 'opportunity_2',
            applicationDeadline: '2026-07-01',
            fundingPeriodEnd: '2026-12-31',
            awardedAmount: {
              amountMicros: null,
              currencyCode: null,
            },
            company: {
              id: 'company_1',
            },
          },
        ],
      ),
    ).toEqual({
      companyId: 'company_1',
      lifetimeGiftAmount: {
        amountMicros: 42_500_000,
        currencyCode: 'GBP',
      },
      lastGiftDate: '2026-05-07',
      awardedOpportunityAmount: {
        amountMicros: 100_000_000,
        currencyCode: 'GBP',
      },
      awardedOpportunityCount: 1,
      nextApplicationDeadline: '2026-07-01',
      nextFundingPeriodEnd: '2026-12-31',
    });

    vi.useRealTimers();
  });

  it('excludes gifts in kind and past forward-looking dates', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-16T12:00:00.000Z'));

    expect(
      computeCompanyRollupSummary(
        'company_2',
        [
          {
            id: 'gift_inkind',
            giftType: 'GIFT_IN_KIND',
            giftDate: '2026-05-10',
            amount: {
              amountMicros: 50_000_000,
              currencyCode: 'GBP',
            },
          },
          {
            id: 'gift_cash',
            giftType: 'DONATION',
            giftDate: '2026-05-12',
            amount: {
              amountMicros: 20_000_000,
              currencyCode: 'GBP',
            },
          },
        ],
        [
          {
            id: 'past_opportunity',
            applicationDeadline: '2026-01-01',
            fundingPeriodEnd: '2026-02-01',
            awardedAmount: {
              amountMicros: 0,
              currencyCode: 'GBP',
            },
          },
        ],
      ),
    ).toEqual({
      companyId: 'company_2',
      lifetimeGiftAmount: {
        amountMicros: 20_000_000,
        currencyCode: 'GBP',
      },
      lastGiftDate: '2026-05-12',
      awardedOpportunityAmount: {
        amountMicros: 0,
        currencyCode: 'GBP',
      },
      awardedOpportunityCount: 0,
      nextApplicationDeadline: null,
      nextFundingPeriodEnd: null,
    });

    vi.useRealTimers();
  });
});

describe('company rollup database-event extraction', () => {
  it('recomputes both old and new companies on gift reassignment', () => {
    expect(
      getAffectedCompanyIdsFromGiftUpdate({
        properties: {
          updatedFields: ['companyId'],
          before: {
            companyId: 'company_1',
          },
          after: {
            companyId: 'company_2',
          },
          diff: {},
        },
      } as any),
    ).toEqual(['company_1', 'company_2']);
  });

  it('recomputes both old and new companies on opportunity reassignment', () => {
    expect(
      getAffectedCompanyIdsFromOpportunityUpdate({
        properties: {
          updatedFields: ['companyId'],
          before: {
            companyId: 'company_1',
          },
          after: {
            companyId: 'company_2',
          },
          diff: {},
        },
      } as any),
    ).toEqual(['company_1', 'company_2']);
  });
});
