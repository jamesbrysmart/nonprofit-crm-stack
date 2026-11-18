import { enqueueJobs } from 'twenty-sdk/logic-function';

// Every install's cron fires in the same minute and shares one API budget, so
// a nightly cron only enqueues its work with a random delay across this window.
export const NIGHTLY_SPREAD_WINDOW_MS = 60 * 60 * 1000;

export const enqueueSpreadNightlyJob = async ({
  logicFunctionUniversalIdentifier,
  jobIdPrefix,
  now = new Date(),
  random = Math.random,
}: {
  logicFunctionUniversalIdentifier: string;
  jobIdPrefix: string;
  now?: Date;
  random?: () => number;
}) => {
  const delayMs = Math.floor(random() * NIGHTLY_SPREAD_WINDOW_MS);
  // A dated id makes a repeated enqueue on the same day a no-op.
  const jobId = `nonprofit-fundraising.${jobIdPrefix}.${now.toISOString().slice(0, 10)}`;
  const { jobIds } = await enqueueJobs({
    logicFunctionUniversalIdentifier,
    jobs: [{ payload: {}, jobId }],
    delayMs,
  });

  return { mode: 'scheduled' as const, jobId: jobIds[0] ?? jobId, delayMs };
};
