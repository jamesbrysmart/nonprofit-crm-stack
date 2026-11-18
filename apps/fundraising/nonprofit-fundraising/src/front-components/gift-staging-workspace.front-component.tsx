import type { CSSProperties } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { useSelectedRecordIds } from 'twenty-sdk/front-component';
import { GIFT_STAGING_WORKSPACE_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { WorkspaceText } from 'src/front-components/workspace-layout';
import { useGiftStagingReviewRecord } from 'src/gift-staging-review/use-gift-staging-review-record';
import { StagingCodingSection } from 'src/gift-staging-review/workspace/staging-coding-section';
import { StagingDonorReviewSection } from 'src/gift-staging-review/workspace/staging-donor-review-section';
import { StagingProcessingSection } from 'src/gift-staging-review/workspace/staging-processing-section';
import { StagingSummarySection } from 'src/gift-staging-review/workspace/staging-summary-section';

const ROOT_STYLE: CSSProperties = {
  display: 'grid',
  padding: '0 8px 4px',
};

// One component owns the staging record so every section updates together after
// an action; sibling widgets cannot signal each other in the front-component sandbox.
const GiftStagingWorkspace = () => {
  const selectedRecordIds = useSelectedRecordIds();
  const recordId = selectedRecordIds.length === 1 ? selectedRecordIds[0] : null;
  const { record, loading, error, refresh } = useGiftStagingReviewRecord(recordId);

  if (loading && !record) {
    return <WorkspaceText>Loading staged gift...</WorkspaceText>;
  }

  if (error && !record) {
    return <WorkspaceText>{error}</WorkspaceText>;
  }

  if (!recordId || !record) {
    return <WorkspaceText>Staging row not found.</WorkspaceText>;
  }

  const sectionProps = { recordId, record, onChanged: refresh };

  return (
    <div style={ROOT_STYLE}>
      <StagingSummarySection {...sectionProps} />
      <StagingDonorReviewSection {...sectionProps} />
      <StagingCodingSection {...sectionProps} />
      <StagingProcessingSection {...sectionProps} />
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: GIFT_STAGING_WORKSPACE_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'gift-staging-workspace',
  description:
    'Staged gift review summary, donor review, coding and processing, sharing one data load.',
  component: GiftStagingWorkspace,
});
