import { RestApiClient, RestApiClientError } from 'twenty-client-sdk/rest';
import { toRawErrorBody } from 'src/app-api/app-route-client';
import {
  isRateLimitError,
  withRateLimitRetry,
} from 'src/core-api/rate-limit-retry';

export const postTwentyRest = async <TResponse>({
  path,
  body,
}: {
  path: string;
  body: unknown;
}): Promise<TResponse> => {
  try {
    const result = await withRateLimitRetry(() =>
      new RestApiClient().post<TResponse>(path, body, {
        headers: { Accept: 'application/json' },
      }),
    );

    return (result ?? null) as TResponse;
  } catch (error) {
    // Rethrown as is, so callers can tell nothing was written.
    if (isRateLimitError(error)) {
      throw error;
    }

    if (error instanceof RestApiClientError && error.status !== undefined) {
      throw new Error(
        toRawErrorBody(error.body) ||
          `Twenty REST request failed with ${error.status}`,
      );
    }

    throw error;
  }
};
