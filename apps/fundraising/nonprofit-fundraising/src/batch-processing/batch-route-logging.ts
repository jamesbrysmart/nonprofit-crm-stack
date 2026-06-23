type BatchRouteLogDetails = Record<
  string,
  string | number | boolean | null | undefined
>;

const formatError = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

export const createBatchRouteLogger = ({
  route,
  giftBatchId,
}: {
  route: string;
  giftBatchId: string;
}) => {
  const startedAt = Date.now();

  const buildPayload = (details?: BatchRouteLogDetails) => ({
    route,
    giftBatchId,
    elapsedMs: Date.now() - startedAt,
    ...(details ?? {}),
  });

  return {
    info: (stage: string, details?: BatchRouteLogDetails) => {
      console.info(`[gift-batch:${route}] ${stage}`, buildPayload(details));
    },
    warn: (stage: string, details?: BatchRouteLogDetails) => {
      console.warn(`[gift-batch:${route}] ${stage}`, buildPayload(details));
    },
    fail: (stage: string, error: unknown, details?: BatchRouteLogDetails) => {
      console.warn(
        `[gift-batch:${route}] ${stage}`,
        buildPayload({
          ...(details ?? {}),
          error: formatError(error),
        }),
      );
    },
  };
};
