import { describe, expect, it } from 'vitest';

import {
  buildDonorExistingRollupsFilter,
  collectDonorIds,
  computeDonorRollupSummary,
  getAffectedDonorIdsFromGiftDelete,
  getAffectedDonorIdsFromGiftRestore,
  getAffectedDonorIdsFromGiftUpdate,
} from 'src/donor-rollups/donor-rollups';

describe('collectDonorIds', () => {
  it('dedupes and trims donor ids while removing empty values', () => {
    expect(
      collectDonorIds([
        ' person_1 ',
        'person_2',
        '',
        null,
        'person_1',
        undefined,
      ]),
    ).toEqual(['person_1', 'person_2']);
  });
});

describe('buildDonorExistingRollupsFilter', () => {
  it('uses currency subfield filters for composite amount fields', () => {
    expect(buildDonorExistingRollupsFilter()).toMatchObject({
      or: expect.arrayContaining([
        {
          lastGiftAmount: {
            amountMicros: {
              is: 'NOT_NULL',
            },
          },
        },
        {
          largestGiftAmount: {
            amountMicros: {
              is: 'NOT_NULL',
            },
          },
        },
      ]),
    });
  });
});

describe('computeDonorRollupSummary', () => {
  it('computes amount, count, and last gift date from committed gifts', () => {
    expect(
      computeDonorRollupSummary('person_1', [
        {
          id: 'gift_1',
          giftDate: '2026-05-01',
          amount: {
            amountMicros: 12_500_000,
            currencyCode: 'GBP',
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
          donor: {
            id: 'person_1',
          },
        },
      ]),
    ).toEqual({
      donorId: 'person_1',
      lifetimeGiftAmount: {
        amountMicros: 42_500_000,
        currencyCode: 'GBP',
      },
      giftCount: 2,
      firstGiftDate: '2026-05-01',
      lastGiftDate: '2026-05-07',
      lastGiftAmount: {
        amountMicros: 30_000_000,
        currencyCode: 'GBP',
      },
      largestGiftAmount: {
        amountMicros: 30_000_000,
        currencyCode: 'GBP',
      },
    });
  });

  it('keeps last gift amount separate from largest gift amount', () => {
    expect(
      computeDonorRollupSummary('person_1', [
        {
          id: 'gift_largest',
          giftDate: '2026-05-01',
          amount: {
            amountMicros: 100_000_000,
            currencyCode: 'GBP',
          },
          donor: {
            id: 'person_1',
          },
        },
        {
          id: 'gift_latest',
          giftDate: '2026-05-07',
          amount: {
            amountMicros: 30_000_000,
            currencyCode: 'GBP',
          },
          donor: {
            id: 'person_1',
          },
        },
      ]),
    ).toMatchObject({
      firstGiftDate: '2026-05-01',
      lastGiftDate: '2026-05-07',
      lastGiftAmount: {
        amountMicros: 30_000_000,
        currencyCode: 'GBP',
      },
      largestGiftAmount: {
        amountMicros: 100_000_000,
        currencyCode: 'GBP',
      },
    });
  });

  it('resets empty donors to zero-value rollups with a stable currency default', () => {
    expect(
      computeDonorRollupSummary('person_2', []),
    ).toEqual({
      donorId: 'person_2',
      lifetimeGiftAmount: {
        amountMicros: 0,
        currencyCode: 'GBP',
      },
      giftCount: 0,
      firstGiftDate: null,
      lastGiftDate: null,
      lastGiftAmount: null,
      largestGiftAmount: null,
    });
  });

  it('excludes gifts in kind from default cash rollups', () => {
    expect(
      computeDonorRollupSummary('person_3', [
        {
          id: 'gift_inkind',
          giftType: 'GIFT_IN_KIND',
          giftDate: '2026-05-10',
          amount: {
            amountMicros: 50_000_000,
            currencyCode: 'GBP',
          },
          donor: {
            id: 'person_3',
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
          donor: {
            id: 'person_3',
          },
        },
      ]),
    ).toEqual({
      donorId: 'person_3',
      lifetimeGiftAmount: {
        amountMicros: 20_000_000,
        currencyCode: 'GBP',
      },
      giftCount: 1,
      firstGiftDate: '2026-05-12',
      lastGiftDate: '2026-05-12',
      lastGiftAmount: {
        amountMicros: 20_000_000,
        currencyCode: 'GBP',
      },
      largestGiftAmount: {
        amountMicros: 20_000_000,
        currencyCode: 'GBP',
      },
    });
  });
});

describe('gift database-event donor extraction', () => {
  it('recomputes both old and new donors on reassignment updates', () => {
    expect(
      getAffectedDonorIdsFromGiftUpdate({
        properties: {
          updatedFields: ['donorId'],
          before: {
            donorId: 'person_1',
          },
          after: {
            donorId: 'person_2',
          },
          diff: {},
        },
      } as any),
    ).toEqual(['person_1', 'person_2']);
  });

  it('extracts donor ids for delete and restore events', () => {
    expect(
      getAffectedDonorIdsFromGiftDelete({
        properties: {
          before: {
            donorId: 'person_1',
          },
          after: {
            donorId: null,
          },
          updatedFields: ['deletedAt'],
          diff: {},
        },
      } as any),
    ).toEqual(['person_1']);

    expect(
      getAffectedDonorIdsFromGiftRestore({
        properties: {
          before: {
            donorId: null,
          },
          after: {
            donorId: 'person_2',
          },
          updatedFields: ['deletedAt'],
          diff: {},
        },
      } as any),
    ).toEqual(['person_2']);
  });
});
