import { postAppRouteJson } from 'src/app-api/app-route-client';
import { broadcastGiftRecordInvalidated } from 'src/gift-record/gift-record-sync';
import type {
  SaveGiftCodingRequest,
  SaveGiftCodingResponse,
} from 'src/gift-record/gift-coding.types';

export const saveGiftCoding = async (
  payload: SaveGiftCodingRequest,
): Promise<SaveGiftCodingResponse> => {
  const parsed = await postAppRouteJson<SaveGiftCodingResponse>(
    '/s/gifts/save-coding',
    payload,
  );

  broadcastGiftRecordInvalidated(payload.giftId);

  return parsed;
};
