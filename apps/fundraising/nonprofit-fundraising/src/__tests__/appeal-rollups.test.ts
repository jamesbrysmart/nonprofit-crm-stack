import { describe, expect, it } from 'vitest';

import {
  collectAppealIds,
  computeAppealRollupSummary,
  getAffectedAppealIdsFromGiftDelete,
  getAffectedAppealIdsFromGiftRestore,
  getAffectedAppealIdsFromGiftUpdate,
} from 'src/appeal-rollups/appeal-rollups';

describe('collectAppealIds', () => {
  it('dedupes and trims appeal ids while removing empty values', () => {
    expect(
      collectAppealIds([
        ' appeal_1 ',
        'appeal_2',
        '',
        null,
        'appeal_1',
        undefined,
      ]),
    ).toEqual(['appeal_1', 'appeal_2']);
  });
});

describe('computeAppealRollupSummary', () => {
  it('computes amount, counts, and last gift date from committed gifts', () => {
    expect(
      computeAppealRollupSummary('appeal_1', [
        {
          id: 'gift_1',
          giftDate: '2026-05-01',
          amount: {
            amountMicros: 12_500_000,
            currencyCode: 'GBP',
          },
          appeal: {
            id: 'appeal_1',
          },
          donor: {
            id: 'person_1',
          },
        },
        {
          id: 'gift_2',
          giftDate: '2026-05-07',
          amount: {
            amountMicros: 30_000_000,
            currencyCode: 'GBP',
          },
          appeal: {
            id: 'appeal_1',
          },
          company: {
            id: 'company_1',
          },
        },
      ]),
    ).toEqual({
      appealId: 'appeal_1',
      raisedAmount: {
        amountMicros: 42_500_000,
        currencyCode: 'GBP',
      },
      giftCount: 2,
      donorCount: 2,
      lastGiftAt: '2026-05-07',
    });
  });

  it('excludes gifts in kind from default cash rollups', () => {
    expect(
      computeAppealRollupSummary('appeal_2', [
        {
          id: 'gift_inkind',
          giftType: 'GIFT_IN_KIND',
          giftDate: '2026-05-10',
          amount: {
            amountMicros: 50_000_000,
            currencyCode: 'GBP',
          },
          appeal: {
            id: 'appeal_2',
          },
          donor: {
            id: 'person_2',
          },
        },
        {
          id: 'gift_cash',
          giftType: 'SPONSORSHIP',
          giftDate: '2026-05-12',
          amount: {
            amountMicros: 20_000_000,
            currencyCode: 'GBP',
          },
          appeal: {
            id: 'appeal_2',
          },
          company: {
            id: 'company_2',
          },
        },
      ]),
    ).toEqual({
      appealId: 'appeal_2',
      raisedAmount: {
        amountMicros: 20_000_000,
        currencyCode: 'GBP',
      },
      giftCount: 1,
      donorCount: 1,
      lastGiftAt: '2026-05-12',
    });
  });

  it('resets empty appeals to zero-value rollups with a stable currency default', () => {
    expect(
      computeAppealRollupSummary('appeal_3', []),
    ).toEqual({
      appealId: 'appeal_3',
      raisedAmount: {
        amountMicros: 0,
        currencyCode: 'GBP',
      },
      giftCount: 0,
      donorCount: 0,
      lastGiftAt: null,
    });
  });
});

describe('gift database-event appeal extraction', () => {
  it('recomputes both old and new appeals on reassignment updates', () => {
    expect(
      getAffectedAppealIdsFromGiftUpdate({
        properties: {
          updatedFields: ['appealId'],
          before: {
            appealId: 'appeal_1',
          },
          after: {
            appealId: 'appeal_2',
          },
          diff: {},
        },
      } as any),
    ).toEqual(['appeal_1', 'appeal_2']);
  });

  it('extracts appeal ids for delete and restore events', () => {
    expect(
      getAffectedAppealIdsFromGiftDelete({
        properties: {
          before: {
            appealId: 'appeal_1',
          },
          after: {
            appealId: null,
          },
          updatedFields: ['deletedAt'],
          diff: {},
        },
      } as any),
    ).toEqual(['appeal_1']);

    expect(
      getAffectedAppealIdsFromGiftRestore({
        properties: {
          before: {
            appealId: null,
          },
          after: {
            appealId: 'appeal_2',
          },
          updatedFields: ['deletedAt'],
          diff: {},
        },
      } as any),
    ).toEqual(['appeal_2']);
  });
});
