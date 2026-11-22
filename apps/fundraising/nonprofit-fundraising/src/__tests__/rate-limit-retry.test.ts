import { describe, expect, it, vi } from 'vitest';
import { RestApiClientError } from 'twenty-client-sdk/rest';
import {
  getRateLimitRetryAfterMs,
  isRateLimitError,
  withRateLimitRetry,
} from 'src/core-api/rate-limit-retry';

const graphqlRateLimit = (retryAfterMs?: number) =>
  Object.assign(new Error('Rate limit exceeded'), {
    errors: [
      { message: 'Rate limit exceeded', extensions: { code: 'RATE_LIMITED', retryAfterMs } },
    ],
  });

const restRateLimit = (retryAfterSeconds?: number) =>
  new RestApiClientError('Too Many Requests', {
    status: 429,
    statusText: 'Too Many Requests',
    body: { retryAfterSeconds },
  } as never);

describe('rate-limit detection', () => {
  it('recognises GraphQL, wrapped GraphQL and REST rate limits', () => {
    expect(getRateLimitRetryAfterMs(graphqlRateLimit(400))).toBe(400);
    expect(
      getRateLimitRetryAfterMs(
        new Error(
          'Too Many Requests: {"errors":[{"extensions":{"code":"RATE_LIMITED","retryAfterMs":300}}]}',
        ),
      ),
    ).toBe(300);
    expect(getRateLimitRetryAfterMs(restRateLimit(2))).toBe(2_000);
    expect(isRateLimitError(restRateLimit())).toBe(true);
  });

  it('ignores other errors', () => {
    expect(isRateLimitError(new Error('Gift not found'))).toBe(false);
    expect(
      isRateLimitError(
        new RestApiClientError('Bad Request', { status: 400, statusText: 'Bad Request' } as never),
      ),
    ).toBe(false);
  });
});

describe('withRateLimitRetry', () => {
  it('retries a rate-limited operation after the suggested wait', async () => {
    const sleep = vi.fn(async () => undefined);
    const operation = vi
      .fn()
      .mockRejectedValueOnce(graphqlRateLimit(500))
      .mockResolvedValueOnce('done');

    await expect(withRateLimitRetry(operation, sleep)).resolves.toBe('done');
    expect(operation).toHaveBeenCalledTimes(2);
    expect(sleep).toHaveBeenCalledWith(500);
  });

  it('does not retry other errors', async () => {
    const sleep = vi.fn(async () => undefined);
    const operation = vi.fn().mockRejectedValue(new Error('Validation failed'));

    await expect(withRateLimitRetry(operation, sleep)).rejects.toThrow('Validation failed');
    expect(operation).toHaveBeenCalledTimes(1);
    expect(sleep).not.toHaveBeenCalled();
  });

  it('gives up after its attempts or wait budget, rethrowing the rate limit', async () => {
    const sleep = vi.fn(async () => undefined);
    const limited = graphqlRateLimit(200);
    const operation = vi.fn().mockRejectedValue(limited);

    await expect(withRateLimitRetry(operation, sleep)).rejects.toBe(limited);
    expect(operation).toHaveBeenCalledTimes(4);

    const slowOperation = vi.fn().mockRejectedValue(graphqlRateLimit(60_000));

    await expect(withRateLimitRetry(slowOperation, sleep)).rejects.toBeDefined();
    expect(slowOperation).toHaveBeenCalledTimes(1);
  });
});
