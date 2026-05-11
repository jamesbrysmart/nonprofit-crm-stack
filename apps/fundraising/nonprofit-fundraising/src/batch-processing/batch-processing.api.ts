import type {
  ProcessBatchRequest,
  ProcessBatchResponse,
  RunBatchDonorMatchRequest,
  RunBatchDonorMatchResponse,
} from 'src/batch-processing/batch-processing.types';

const getAppApiConfig = () => {
  const apiBaseUrl = process.env.TWENTY_API_URL;
  const token =
    process.env.TWENTY_APP_ACCESS_TOKEN ?? process.env.TWENTY_API_KEY;

  if (!apiBaseUrl || !token) {
    throw new Error('App API configuration missing');
  }

  return {
    apiBaseUrl: apiBaseUrl.replace(/\/$/, ''),
    token,
  };
};

const postJson = async <TResponse>(
  path: string,
  body: Record<string, unknown>,
): Promise<TResponse> => {
  const { apiBaseUrl, token } = getAppApiConfig();
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const rawBody = await response.text();

  if (!response.ok) {
    throw new Error(rawBody || `Request failed with status ${response.status}`);
  }

  return JSON.parse(rawBody) as TResponse;
};

export const processBatch = (
  input: ProcessBatchRequest,
): Promise<ProcessBatchResponse> =>
  postJson<ProcessBatchResponse>('/s/batch-processing/process-batch', input);

export const runBatchDonorMatch = (
  input: RunBatchDonorMatchRequest,
): Promise<RunBatchDonorMatchResponse> =>
  postJson<RunBatchDonorMatchResponse>(
    '/s/batch-processing/run-donor-match',
    input,
  );
