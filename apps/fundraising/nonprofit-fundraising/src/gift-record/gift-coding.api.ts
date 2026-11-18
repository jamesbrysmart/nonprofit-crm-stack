import { postAppRouteJson } from 'src/app-api/app-route-client';
import type {
  SaveGiftCodingRequest,
  SaveGiftCodingResponse,
} from 'src/gift-record/gift-coding.types';

export const saveGiftCoding = (
  payload: SaveGiftCodingRequest,
): Promise<SaveGiftCodingResponse> =>
  postAppRouteJson<SaveGiftCodingResponse>('/s/gifts/save-coding', payload);
