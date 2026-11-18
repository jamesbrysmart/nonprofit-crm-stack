import type { GiftStagingQueueScope } from 'src/gift-batch-review/gift-batch-review.data';
import { openGiftBatchQueue } from 'src/gift-batch-review/use-gift-batch-review';
import {
  WorkspaceQueueRow,
  WorkspaceSection,
  WorkspaceText,
} from 'src/front-components/workspace-layout';
import type { GiftBatchWorkspaceSectionProps } from 'src/gift-batch-review/workspace/workspace-section';

export const BatchWorklistsSection = ({
  recordId,
  record,
}: GiftBatchWorkspaceSectionProps) => {
  const openQueue = (scope: GiftStagingQueueScope) => {
    void openGiftBatchQueue(recordId, scope);
  };
  const hasActiveWorklists =
    record.ambiguousItems > 0 ||
    record.needsReviewItems > 0 ||
    record.readyItems > 0 ||
    record.failedItems > 0;

  return (
    <WorkspaceSection title="Worklists">
      <WorkspaceQueueRow
        label="All staged gifts"
        count={record.totalItems}
        onOpen={() => openQueue('all')}
      />

      {record.isOverWorkflowLimit ? (
        <WorkspaceText>Split the batch before using review worklists.</WorkspaceText>
      ) : (
        <>
          {record.ambiguousItems > 0 ? (
            <WorkspaceQueueRow
              label="Review possible donor matches"
              count={record.ambiguousItems}
              onOpen={() => openQueue('possible-donor-matches')}
            />
          ) : null}
          {record.needsReviewItems > 0 ? (
            <WorkspaceQueueRow
              label="Needs review"
              count={record.needsReviewItems}
              onOpen={() => openQueue('not-ready')}
            />
          ) : null}
          {record.readyItems > 0 ? (
            <WorkspaceQueueRow
              label="Ready to process"
              count={record.readyItems}
              onOpen={() => openQueue('ready')}
            />
          ) : null}
          {record.failedItems > 0 ? (
            <WorkspaceQueueRow
              label="Failed"
              count={record.failedItems}
              onOpen={() => openQueue('failed')}
            />
          ) : null}
          {!hasActiveWorklists ? (
            <WorkspaceText>
              No active worklists. Open all staged gifts to inspect this batch.
            </WorkspaceText>
          ) : null}
        </>
      )}
    </WorkspaceSection>
  );
};
