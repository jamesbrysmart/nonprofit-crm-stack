import type { GiftStagingReviewRecord } from 'src/gift-staging-review/gift-staging-review.types';

export type GiftStagingWorkspaceSectionProps = {
  recordId: string;
  record: GiftStagingReviewRecord;
  // Reloads the shared staging record so every section reflects the change.
  onChanged: () => Promise<GiftStagingReviewRecord | null>;
};
