import type {
  ProcessBatchRequest,
  ProcessBatchResponse,
} from './batch-processing.types';

const getAppApiBaseUrl = () => {
  const apiBaseUrl = process.env.TWENTY_API_URL;
  const token =
    process.env.TWENTY_APP_ACCESS_TOKEN ?? process.env.TWENTY_API_KEY;

  if (!apiBaseUrl || !token) {
    throw new Error('API configuration missing');
  }

  return { apiBaseUrl, token };
};

export const processBatch = async (
  payload: ProcessBatchRequest,
): Promise<ProcessBatchResponse> => {
  const { apiBaseUrl, token } = getAppApiBaseUrl();
  const response = await fetch(
    `${apiBaseUrl}/s/batch-processing/process-batch`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || `Batch processing failed with status ${response.status}`);
  }

  return (await response.json()) as ProcessBatchResponse;
};
