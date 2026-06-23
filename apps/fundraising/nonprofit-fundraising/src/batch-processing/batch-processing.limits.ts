export const MAX_GIFT_BATCH_ITEMS = 100;

export const isGiftBatchOverWorkflowLimit = (
  totalItems: number | null | undefined,
) =>
  typeof totalItems === 'number' &&
  Number.isFinite(totalItems) &&
  totalItems > MAX_GIFT_BATCH_ITEMS;

export const getGiftBatchWorkflowLimitMessage = (
  totalItems: number | null | undefined,
) => {
  const count =
    typeof totalItems === 'number' && Number.isFinite(totalItems)
      ? totalItems
      : 'This';

  return `${count} ${count === 1 ? 'donation is' : 'donations are'} attached to this batch. The current workflow supports a maximum of ${MAX_GIFT_BATCH_ITEMS} donations per batch. Re-import or split the batch before running donor match, checking readiness, or processing.`;
};
