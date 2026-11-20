import { describe, expect, it } from 'vitest';
import { chunkArray } from 'src/utils/chunk-array';
import { formatCurrencyAmount } from 'src/utils/format-currency-amount';
import { normalizeString } from 'src/utils/normalize-string';

describe('shared utils', () => {
  it('normalizeString trims strings and empties everything else', () => {
    expect(normalizeString('  Ada ')).toBe('Ada');
    expect(normalizeString(null)).toBe('');
    expect(normalizeString(undefined)).toBe('');
    expect(normalizeString(42)).toBe('');
  });

  it('chunkArray splits into fixed-size chunks and rejects a zero size', () => {
    expect(chunkArray([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
    expect(chunkArray([], 3)).toEqual([]);
    expect(() => chunkArray([1], 0)).toThrow();
  });

  it('formatCurrencyAmount formats in the amount currency or shows the empty label', () => {
    expect(formatCurrencyAmount({ amountMicros: 12_500_000, currencyCode: 'GBP' })).toBe('£12.50');
    expect(formatCurrencyAmount({ amountMicros: 5_000_000, currencyCode: 'EUR' })).toBe('€5.00');
    expect(formatCurrencyAmount(null, 'Not set')).toBe('Not set');
    expect(formatCurrencyAmount({ amountMicros: 1_000_000, currencyCode: 'XYZ1' })).toBe('XYZ1 1.00');
  });
});
