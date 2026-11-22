import type { CSSProperties } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { GIFT_BATCH_WORKSPACE_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { useGiftBatchReview } from 'src/gift-batch-review/use-gift-batch-review';
import { BatchActionsSection } from 'src/gift-batch-review/workspace/batch-actions-section';
import { BatchCodingSection } from 'src/gift-batch-review/workspace/batch-coding-section';
import { BatchSummarySection } from 'src/gift-batch-review/workspace/batch-summary-section';
import { BatchWorklistsSection } from 'src/gift-batch-review/workspace/batch-worklists-section';
import { WorkspaceText } from 'src/front-components/workspace-layout';
import { useSingleSelectedRecordId } from 'src/front-components/use-single-selected-record-id';

const ROOT_STYLE: CSSProperties = {
  display: 'grid',
  padding: '0 8px 4px',
};

// One component owns the batch data so every section updates together after an
// action; sibling widgets cannot signal each other in the front-component sandbox.
const GiftBatchWorkspace = () => {
  const recordId = useSingleSelectedRecordId();
  const { record, loading, error, refresh } = useGiftBatchReview(recordId);

  if (loading && !record) {
    return <WorkspaceText>Loading batch...</WorkspaceText>;
  }

  if (error && !record) {
    return <WorkspaceText>{error}</WorkspaceText>;
  }

  if (!recordId || !record) {
    return <WorkspaceText>Batch not found.</WorkspaceText>;
  }

  const sectionProps = { recordId, record, onChanged: refresh };

  return (
    <div style={ROOT_STYLE}>
      {error ? <WorkspaceText>{error}</WorkspaceText> : null}
      <BatchSummarySection {...sectionProps} />
      <BatchActionsSection {...sectionProps} />
      <BatchCodingSection {...sectionProps} />
      <BatchWorklistsSection {...sectionProps} />
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: GIFT_BATCH_WORKSPACE_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'gift-batch-workspace',
  description:
    'Gift batch summary, actions, coding defaults and worklists, sharing one data load.',
  component: GiftBatchWorkspace,
});
