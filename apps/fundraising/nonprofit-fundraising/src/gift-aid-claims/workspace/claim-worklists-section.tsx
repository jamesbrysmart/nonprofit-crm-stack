import { openGiftQueue } from 'src/front-components/gift-aid-claim-batch-ui';
import {
  WorkspaceQueueRow,
  WorkspaceSection,
} from 'src/front-components/workspace-layout';
import type { GiftAidClaimWorkspaceSectionProps } from 'src/gift-aid-claims/workspace/workspace-section';

export const ClaimWorklistsSection = ({
  recordId,
  workspace,
}: GiftAidClaimWorkspaceSectionProps) => {
  const blockingCount = workspace.gifts.filter(
    (gift) => gift.giftAidStatus !== 'CLAIMABLE',
  ).length;

  return (
    <WorkspaceSection title="Gift worklists">
      <WorkspaceQueueRow
        label="In this claim"
        count={workspace.gifts.length}
        onOpen={() => void openGiftQueue(recordId, 'claim')}
      />
      <WorkspaceQueueRow
        label="Blocking in claim"
        count={blockingCount}
        onOpen={() => void openGiftQueue(recordId, 'claim-blockers')}
      />
      <WorkspaceQueueRow
        label="Needs review outside claim"
        count={workspace.needsReviewGifts.length}
        onOpen={() => void openGiftQueue(recordId, 'needs-review-outside-claim')}
      />
    </WorkspaceSection>
  );
};
