import { broadcastGiftStagingRecordInvalidated } from './gift-staging-record-sync';

type ProcessGiftStagingRowRequest = {
  giftStagingId: string;
};

export type ProcessGiftStagingRowResponse = {
  giftStagingId: string;
  processingStatus: 'NOT_READY' | 'PROCESSED' | 'PROCESS_FAILED';
  committedGiftId: string | null;
  recurringAgreementId: string | null;
  errorDetail: string | null;
};

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

export const processGiftStagingRow = (
  input: ProcessGiftStagingRowRequest,
): Promise<ProcessGiftStagingRowResponse> =>
  postJson<ProcessGiftStagingRowResponse>(
    '/s/gift-staging/process-row',
    input,
  ).then((response) => {
    broadcastGiftStagingRecordInvalidated(input.giftStagingId);

    return response;
  });
