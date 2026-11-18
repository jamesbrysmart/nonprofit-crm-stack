import type {
  RecordGiftRefundRequest,
  RecordGiftRefundResponse,
} from 'src/gift-lifecycle/gift-refund.types';
import { postAppRouteJson } from 'src/app-api/app-route-client';

export const recordGiftRefund = (
  payload: RecordGiftRefundRequest,
): Promise<RecordGiftRefundResponse> =>
  postAppRouteJson<RecordGiftRefundResponse>('/s/gifts/record-refund', payload);
