import type {
  RecordGiftRefundRequest,
  RecordGiftRefundResponse,
} from 'src/gift-lifecycle/gift-refund.types';
import { broadcastGiftRecordInvalidated } from 'src/gift-record/gift-record-sync';

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

export const recordGiftRefund = async (
  payload: RecordGiftRefundRequest,
): Promise<RecordGiftRefundResponse> => {
  const { apiBaseUrl, token } = getAppApiConfig();
  const response = await fetch(`${apiBaseUrl}/s/gifts/record-refund`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const rawBody = await response.text();

  if (!response.ok) {
    throw new Error(rawBody || `Gift refund failed with status ${response.status}`);
  }

  const parsed = JSON.parse(rawBody) as RecordGiftRefundResponse;
  broadcastGiftRecordInvalidated(payload.giftId);

  return parsed;
};

