import type {
  RecordGiftRefundRequest,
  RecordGiftRefundResponse,
} from 'src/gift-lifecycle/gift-refund.types';
import { broadcastGiftRecordInvalidated } from 'src/gift-record/gift-record-sync';
import { postAppRouteJson } from 'src/app-api/app-route-client';

export const recordGiftRefund = async (
  payload: RecordGiftRefundRequest,
): Promise<RecordGiftRefundResponse> => {
  const parsed = await postAppRouteJson<RecordGiftRefundResponse>(
    '/s/gifts/record-refund',
    payload,
  );
  broadcastGiftRecordInvalidated(payload.giftId);

  return parsed;
};
