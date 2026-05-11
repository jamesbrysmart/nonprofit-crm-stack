import { describe, expect, it } from 'vitest';

import {
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
      lifetimeGiftCount: 2,
      lastGiftDate: '2026-05-07',
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
      lifetimeGiftCount: 0,
      lastGiftDate: null,
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
