import type { GiftAidClaimWorkspaceRecord } from 'src/gift-aid-claims/gift-aid-claim.types';

export type GiftAidClaimWorkspaceSectionProps = {
  recordId: string;
  workspace: GiftAidClaimWorkspaceRecord;
  // Reloads the shared claim data so every section reflects the change.
  onChanged: () => Promise<void>;
};
