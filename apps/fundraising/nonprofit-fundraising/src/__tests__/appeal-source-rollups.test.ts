import { describe, expect, it } from 'vitest';

import {
  collectAppealSourceIds,
  computeAppealSourceRollupSummary,
  getAffectedAppealSourceIdsFromGiftDelete,
  getAffectedAppealSourceIdsFromGiftRestore,
  getAffectedAppealSourceIdsFromGiftUpdate,
} from 'src/appeal-source-rollups/appeal-source-rollups';

describe('collectAppealSourceIds', () => {
  it('dedupes and trims appeal source ids while removing empty values', () => {
    expect(
      collectAppealSourceIds([
        ' source_1 ',
        'source_2',
        '',
        null,
        'source_1',
        undefined,
      ]),
    ).toEqual(['source_1', 'source_2']);
  });
});

describe('computeAppealSourceRollupSummary', () => {
  it('computes amount, counts, and last gift date from committed gifts', () => {
    expect(
      computeAppealSourceRollupSummary('source_1', [
        {
          id: 'gift_1',
          giftDate: '2026-05-01',
          amount: {
            amountMicros: 12_500_000,
            currencyCode: 'GBP',
          },
          appealSource: {
            id: 'source_1',
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
          appealSource: {
            id: 'source_1',
          },
          company: {
            id: 'company_1',
          },
        },
      ]),
    ).toEqual({
      appealSourceId: 'source_1',
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
      computeAppealSourceRollupSummary('source_2', [
        {
          id: 'gift_inkind',
          giftType: 'GIFT_IN_KIND',
          giftDate: '2026-05-10',
          amount: {
            amountMicros: 50_000_000,
            currencyCode: 'GBP',
          },
          appealSource: {
            id: 'source_2',
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
          appealSource: {
            id: 'source_2',
          },
          company: {
            id: 'company_2',
          },
        },
      ]),
    ).toEqual({
      appealSourceId: 'source_2',
      raisedAmount: {
        amountMicros: 20_000_000,
        currencyCode: 'GBP',
      },
      giftCount: 1,
      donorCount: 1,
      lastGiftAt: '2026-05-12',
    });
  });

  it('resets empty appeal sources to zero-value rollups with a stable currency default', () => {
    expect(computeAppealSourceRollupSummary('source_3', [])).toEqual({
      appealSourceId: 'source_3',
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

describe('gift database-event appeal source extraction', () => {
  it('recomputes both old and new appeal sources on reassignment updates', () => {
    expect(
      getAffectedAppealSourceIdsFromGiftUpdate({
        properties: {
          updatedFields: ['appealSourceId'],
          before: {
            appealSourceId: 'source_1',
          },
          after: {
            appealSourceId: 'source_2',
          },
          diff: {},
        },
      } as any),
    ).toEqual(['source_1', 'source_2']);
  });

  it('extracts appeal source ids for delete and restore events', () => {
    expect(
      getAffectedAppealSourceIdsFromGiftDelete({
        properties: {
          before: {
            appealSourceId: 'source_1',
          },
          after: {
            appealSourceId: null,
          },
          updatedFields: ['deletedAt'],
          diff: {},
        },
      } as any),
    ).toEqual(['source_1']);

    expect(
      getAffectedAppealSourceIdsFromGiftRestore({
        properties: {
          before: {
            appealSourceId: null,
          },
          after: {
            appealSourceId: 'source_2',
          },
          updatedFields: ['deletedAt'],
          diff: {},
        },
      } as any),
    ).toEqual(['source_2']);
  });
});
