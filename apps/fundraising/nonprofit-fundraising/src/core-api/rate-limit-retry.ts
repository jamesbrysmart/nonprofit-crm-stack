import { CoreApiClient } from 'twenty-client-sdk/core';
import { RestApiClientError } from 'twenty-client-sdk/rest';

// Twenty rejects a rate-limited request before running it, so retrying is safe
// even for writes. The app's request budget refills continuously, so the
// server's suggested wait is usually short; the total wait stays well inside
// logic-function timeouts.
const MAX_ATTEMPTS = 4;
const MAX_TOTAL_WAIT_MS = 10_000;
const MIN_WAIT_MS = 250;
const FALLBACK_WAIT_MS = 1_000;

type GraphqlErrorLike = {
  extensions?: { code?: unknown; retryAfterMs?: unknown };
};

const readGraphqlErrors = (error: unknown): GraphqlErrorLike[] => {
  if (typeof error !== 'object' || error === null) {
    return [];
  }

  const errors = (error as { errors?: unknown }).errors;

  if (Array.isArray(errors)) {
    return errors as GraphqlErrorLike[];
  }

  // A non-2xx GraphQL response is thrown as "<status text>: <raw body>".
  const message = error instanceof Error ? error.message : '';
  const bodyStart = message.indexOf('{');

  if (bodyStart === -1) {
    return [];
  }

  try {
    const body = JSON.parse(message.slice(bodyStart)) as { errors?: unknown };

    return Array.isArray(body.errors) ? (body.errors as GraphqlErrorLike[]) : [];
  } catch {
    return [];
  }
};

const readRestRetryAfterMs = (error: RestApiClientError) => {
  const body = error.body as { retryAfterSeconds?: unknown } | undefined;
  const seconds = body?.retryAfterSeconds;

  return typeof seconds === 'number' && Number.isFinite(seconds)
    ? seconds * 1_000
    : null;
};

// Returns the server's suggested wait for a rate-limited request, or
// undefined when the error is not a rate limit.
export const getRateLimitRetryAfterMs = (
  error: unknown,
): number | null | undefined => {
  if (error instanceof RestApiClientError) {
    return error.status === 429 ? readRestRetryAfterMs(error) : undefined;
  }

  const rateLimited = readGraphqlErrors(error).find(
    (graphqlError) => graphqlError.extensions?.code === 'RATE_LIMITED',
  );

  if (!rateLimited) {
    return undefined;
  }

  const retryAfterMs = rateLimited.extensions?.retryAfterMs;

  return typeof retryAfterMs === 'number' && Number.isFinite(retryAfterMs)
    ? retryAfterMs
    : null;
};

export const isRateLimitError = (error: unknown) =>
  getRateLimitRetryAfterMs(error) !== undefined;

const wait = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

export const withRateLimitRetry = async <TResult>(
  operation: () => Promise<TResult>,
  sleep: (ms: number) => Promise<void> = wait,
): Promise<TResult> => {
  let waitedMs = 0;

  for (let attempt = 1; ; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      const retryAfterMs = getRateLimitRetryAfterMs(error);

      if (retryAfterMs === undefined || attempt >= MAX_ATTEMPTS) {
        throw error;
      }

      const delayMs = Math.max(
        MIN_WAIT_MS,
        retryAfterMs ?? FALLBACK_WAIT_MS * 2 ** (attempt - 1),
      );

      if (waitedMs + delayMs > MAX_TOTAL_WAIT_MS) {
        throw error;
      }

      waitedMs += delayMs;
      await sleep(delayMs);
    }
  }
};

// The core API client for server-side code: queries and mutations are retried
// when Twenty rate-limits them.
export const createCoreApiClient = (): CoreApiClient => {
  const client = new CoreApiClient();

  return new Proxy(client, {
    get(target, property, receiver) {
      const value = Reflect.get(target, property, receiver);

      if (
        (property === 'query' || property === 'mutation') &&
        typeof value === 'function'
      ) {
        return (...args: unknown[]) =>
          withRateLimitRetry(() => value.apply(target, args));
      }

      return value;
    },
  });
};
