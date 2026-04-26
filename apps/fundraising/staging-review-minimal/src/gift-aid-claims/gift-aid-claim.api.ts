import type { GiftAidClaimWorkspaceRecord } from './gift-aid-claim.types';

const getAppApiBaseUrl = () => {
  const apiBaseUrl = process.env.TWENTY_API_URL;
  const token =
    process.env.TWENTY_APP_ACCESS_TOKEN ?? process.env.TWENTY_API_KEY;

  if (!apiBaseUrl || !token) {
    throw new Error('API configuration missing');
  }

  return { apiBaseUrl, token };
};

export const submitGiftAidClaimBatch = async (payload: { batchId: string }) => {
  const { apiBaseUrl, token } = getAppApiBaseUrl();
  const response = await fetch(
    `${apiBaseUrl}/s/gift-aid-claims/submit-claim-batch`,
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
    throw new Error(body || `Gift Aid claim submission failed with status ${response.status}`);
  }

  return (await response.json()) as {
    claimBatchId: string;
    submissionId: string;
    status: 'SENT' | 'FAILED';
  };
};

export type { GiftAidClaimWorkspaceRecord };
