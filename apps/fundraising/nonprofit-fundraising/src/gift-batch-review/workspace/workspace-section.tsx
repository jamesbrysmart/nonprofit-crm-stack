import type { GiftBatchReviewRecord } from 'src/gift-batch-review/gift-batch-review.types';

export type GiftBatchWorkspaceSectionProps = {
  recordId: string;
  record: GiftBatchReviewRecord;
  // Reloads the shared batch data so every section reflects the change.
  onChanged: () => Promise<void>;
};
