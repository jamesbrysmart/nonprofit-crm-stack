import { broadcastGiftStagingRecordInvalidated } from 'src/gift-staging-review/gift-staging-record-sync';

export const broadcastSelectedGiftStagingInvalidated = (recordIds: string[]) => {
  for (const recordId of recordIds) {
    broadcastGiftStagingRecordInvalidated(recordId);
  }
};

export const normalizeSelectedRecordIds = (recordIds: string[]) =>
  [...new Set(recordIds.map((id) => id.trim()).filter((id) => id !== ''))];
