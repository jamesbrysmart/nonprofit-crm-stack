import type { CSSProperties } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { GIFT_AID_CLAIM_WORKSPACE_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { useReloadOnTabChange } from 'src/front-components/use-reload-on-tab-change';
import { WorkspaceText } from 'src/front-components/workspace-layout';
import { ClaimSubmissionSection } from 'src/gift-aid-claims/workspace/claim-submission-section';
import { ClaimSummarySection } from 'src/gift-aid-claims/workspace/claim-summary-section';
import { ClaimWorklistsSection } from 'src/gift-aid-claims/workspace/claim-worklists-section';
import { useClaimWorkspace } from 'src/gift-aid-claims/workspace/use-claim-workspace';
import { useSingleSelectedRecordId } from 'src/front-components/use-single-selected-record-id';

const ROOT_STYLE: CSSProperties = {
  display: 'grid',
  padding: '0 8px 4px',
};

// One component owns the claim data so every section updates together after an
// action; sibling widgets cannot signal each other in the front-component sandbox.
const GiftAidClaimWorkspace = () => {
  const recordId = useSingleSelectedRecordId();
  const { workspace, loading, error, refresh } = useClaimWorkspace(recordId);

  useReloadOnTabChange(() => {
    void refresh();
  });

  if (loading && !workspace) {
    return <WorkspaceText>Loading claim...</WorkspaceText>;
  }

  if (error && !workspace) {
    return <WorkspaceText>{error}</WorkspaceText>;
  }

  if (!recordId || !workspace?.batch) {
    return <WorkspaceText>Claim batch not found.</WorkspaceText>;
  }

  const sectionProps = { recordId, workspace, onChanged: refresh };

  return (
    <div style={ROOT_STYLE}>
      {error ? <WorkspaceText>{error}</WorkspaceText> : null}
      <ClaimSummarySection {...sectionProps} />
      <ClaimWorklistsSection {...sectionProps} />
      <ClaimSubmissionSection {...sectionProps} />
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: GIFT_AID_CLAIM_WORKSPACE_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'gift-aid-claim-workspace',
  description:
    'Gift Aid claim summary, actions, worklists and submission status, sharing one data load.',
  component: GiftAidClaimWorkspace,
});
