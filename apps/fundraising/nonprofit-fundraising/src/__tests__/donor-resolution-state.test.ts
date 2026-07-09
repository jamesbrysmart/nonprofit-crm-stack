import { describe, expect, it } from 'vitest';
import { normalizeDonorResolutionState } from 'src/donor-resolution/donor-resolution-state';

describe('normalizeDonorResolutionState', () => {
  it('treats blank, missing, and unknown values as unreviewed', () => {
    expect(normalizeDonorResolutionState(null)).toBe('UNREVIEWED');
    expect(normalizeDonorResolutionState(undefined)).toBe('UNREVIEWED');
    expect(normalizeDonorResolutionState('')).toBe('UNREVIEWED');
    expect(normalizeDonorResolutionState('unexpected')).toBe('UNREVIEWED');
  });

  it('normalizes known values before comparison', () => {
    expect(normalizeDonorResolutionState(' ambiguous ')).toBe('AMBIGUOUS');
    expect(normalizeDonorResolutionState('new_donor')).toBe('NEW_DONOR');
    expect(normalizeDonorResolutionState('confirmed')).toBe('CONFIRMED');
  });
});
