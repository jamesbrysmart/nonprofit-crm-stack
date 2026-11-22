import { useSelectedRecordIds } from 'twenty-sdk/front-component';

// The record a record-page widget is showing: the one selected record, or null.
export const useSingleSelectedRecordId = (): string | null => {
  const selectedRecordIds = useSelectedRecordIds();

  return selectedRecordIds.length === 1 ? (selectedRecordIds[0] ?? null) : null;
};
