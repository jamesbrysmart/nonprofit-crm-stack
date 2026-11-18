export const normalizeSelectedRecordIds = (recordIds: string[]) =>
  [...new Set(recordIds.map((id) => id.trim()).filter((id) => id !== ''))];
