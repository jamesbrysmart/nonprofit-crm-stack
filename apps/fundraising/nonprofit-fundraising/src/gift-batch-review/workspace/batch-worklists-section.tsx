import type { CSSProperties } from 'react';
import { Button } from 'twenty-ui/primitives/input';
import { Text } from 'twenty-ui/primitives/typography';
import type { GiftStagingQueueScope } from 'src/gift-batch-review/gift-batch-review.data';
import { openGiftBatchQueue } from 'src/gift-batch-review/use-gift-batch-review';
import {
  WorkspaceSection,
  WorkspaceText,
} from 'src/front-components/workspace-layout';
import type { GiftBatchWorkspaceSectionProps } from 'src/gift-batch-review/workspace/workspace-section';

const QUEUE_ROW_STYLE: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) auto auto',
  alignItems: 'center',
  gap: 8,
};

const QUEUE_COUNT_STYLE: CSSProperties = {
  textAlign: 'right',
  minWidth: 56,
};

const giftCount = (count: number) => `${count} gift${count === 1 ? '' : 's'}`;

const QueueRow = ({
  label,
  count,
  onOpen,
}: {
  label: string;
  count: number;
  onOpen: () => void;
}) => (
  <div style={QUEUE_ROW_STYLE}>
    <Text render={<span />} size="sm">
      {label}
    </Text>
    <Text render={<span />} size="sm" color="secondary" style={QUEUE_COUNT_STYLE}>
      {giftCount(count)}
    </Text>
    <Button variant="link" size="sm" onClick={onOpen}>
      Open
    </Button>
  </div>
);

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
      <QueueRow
        label="All staged gifts"
        count={record.totalItems}
        onOpen={() => openQueue('all')}
      />

      {record.isOverWorkflowLimit ? (
        <WorkspaceText>Split the batch before using review worklists.</WorkspaceText>
      ) : (
        <>
          {record.ambiguousItems > 0 ? (
            <QueueRow
              label="Review possible donor matches"
              count={record.ambiguousItems}
              onOpen={() => openQueue('possible-donor-matches')}
            />
          ) : null}
          {record.needsReviewItems > 0 ? (
            <QueueRow
              label="Needs review"
              count={record.needsReviewItems}
              onOpen={() => openQueue('not-ready')}
            />
          ) : null}
          {record.readyItems > 0 ? (
            <QueueRow
              label="Ready to process"
              count={record.readyItems}
              onOpen={() => openQueue('ready')}
            />
          ) : null}
          {record.failedItems > 0 ? (
            <QueueRow
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
