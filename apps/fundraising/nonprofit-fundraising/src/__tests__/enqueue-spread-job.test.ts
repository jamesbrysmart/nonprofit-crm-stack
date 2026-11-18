import { beforeEach, describe, expect, it, vi } from 'vitest';

const enqueueJobs = vi.fn();

vi.mock('twenty-sdk/logic-function', () => ({ enqueueJobs }));

const { enqueueSpreadNightlyJob, NIGHTLY_SPREAD_WINDOW_MS } = await import(
  'src/scheduling/enqueue-spread-job'
);

describe('enqueueSpreadNightlyJob', () => {
  beforeEach(() => {
    enqueueJobs.mockReset();
    enqueueJobs.mockResolvedValue({ jobIds: ['returned-id'] });
  });

  it('enqueues one dated job delayed within the spread window', async () => {
    const result = await enqueueSpreadNightlyJob({
      logicFunctionUniversalIdentifier: 'target-id',
      jobIdPrefix: 'donor-rollup-reconciliation',
      now: new Date('2026-11-18T03:00:00.000Z'),
      random: () => 0.5,
    });

    expect(enqueueJobs).toHaveBeenCalledWith({
      logicFunctionUniversalIdentifier: 'target-id',
      jobs: [
        {
          payload: {},
          jobId: 'nonprofit-fundraising.donor-rollup-reconciliation.2026-11-18',
        },
      ],
      delayMs: NIGHTLY_SPREAD_WINDOW_MS / 2,
    });
    expect(result).toEqual({
      mode: 'scheduled',
      jobId: 'returned-id',
      delayMs: NIGHTLY_SPREAD_WINDOW_MS / 2,
    });
  });

  it('keeps the delay inside the window', async () => {
    const result = await enqueueSpreadNightlyJob({
      logicFunctionUniversalIdentifier: 'target-id',
      jobIdPrefix: 'donation-form-payment-expiry',
      random: () => 0.999999,
    });

    expect(result.delayMs).toBeLessThan(NIGHTLY_SPREAD_WINDOW_MS);
  });
});
