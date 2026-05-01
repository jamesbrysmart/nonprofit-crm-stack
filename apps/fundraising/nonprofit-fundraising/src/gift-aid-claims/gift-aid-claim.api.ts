import type {
  FinalizeGiftAidClaimBatchResponse,
  QueueGiftAidClaimSubmissionResponse,
} from 'src/gift-aid-claims/gift-aid-claim.types';

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

export const finalizeGiftAidClaimBatch = async (payload: {
  batchId: string;
}): Promise<FinalizeGiftAidClaimBatchResponse> => {
  const { apiBaseUrl, token } = getAppApiConfig();
  const response = await fetch(
    `${apiBaseUrl}/s/gift-aid-claims/finalize-claim-batch`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    },
  );

  const rawBody = await response.text();

  if (!response.ok) {
    throw new Error(
      rawBody || `Gift Aid claim submission failed with status ${response.status}`,
    );
  }

  return JSON.parse(rawBody) as FinalizeGiftAidClaimBatchResponse;
};

export const queueGiftAidClaimSubmission = async (payload: {
  batchId: string;
}): Promise<QueueGiftAidClaimSubmissionResponse> => {
  const { apiBaseUrl, token } = getAppApiConfig();
  const response = await fetch(
    `${apiBaseUrl}/s/gift-aid-claims/queue-claim-submission`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    },
  );

  const rawBody = await response.text();

  if (!response.ok) {
    throw new Error(
      rawBody || `Gift Aid claim submission failed with status ${response.status}`,
    );
  }

  return JSON.parse(rawBody) as QueueGiftAidClaimSubmissionResponse;
};
