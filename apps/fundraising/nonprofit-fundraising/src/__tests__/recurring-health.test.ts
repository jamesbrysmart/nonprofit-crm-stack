import { describe, expect, it } from 'vitest';
import { deriveRecurringHealth } from 'src/recurring/recurring.model';

const now = new Date('2026-07-03T12:00:00Z');

describe('deriveRecurringHealth', () => {
  it('derives overdue for active agreements with a past next expected date', () => {
    expect(
      deriveRecurringHealth(
        {
          status: 'ACTIVE',
          nextExpectedAt: '2026-07-01',
        },
        now,
      ),
    ).toMatchObject({
      state: 'OVERDUE',
      label: 'Overdue',
      daysDelta: 2,
    });
  });

  it('derives due today for active agreements expected today', () => {
    expect(
      deriveRecurringHealth(
        {
          status: 'ACTIVE',
          nextExpectedAt: '2026-07-03',
        },
        now,
      ),
    ).toMatchObject({
      state: 'DUE_TODAY',
      label: 'Due today',
      daysDelta: 0,
    });
  });

  it('does not mark paused agreements overdue', () => {
    expect(
      deriveRecurringHealth(
        {
          status: 'PAUSED',
          nextExpectedAt: '2026-07-01',
        },
        now,
      ),
    ).toMatchObject({
      state: 'PAUSED',
      label: 'Paused',
      daysDelta: null,
    });
  });
});
