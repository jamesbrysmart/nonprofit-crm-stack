import { useState, type CSSProperties } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { useSelectedRecordIds } from 'twenty-sdk/front-component';
import { GIFT_OVERVIEW_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { useReloadOnTabChange } from 'src/front-components/use-reload-on-tab-change';
import {
  WorkspaceSection,
  WorkspaceText,
} from 'src/front-components/workspace-layout';
import { GiftCodingSection } from 'src/gift-record/overview/gift-coding-section';
import { GiftSummarySection } from 'src/gift-record/overview/gift-summary-section';

const ROOT_STYLE: CSSProperties = {
  display: 'grid',
  padding: '0 8px 4px',
};

// The sections keep their own queries; a shared token reloads both after a
// coding correction or when the tab is shown again (e.g. after a refund).
const GiftOverview = () => {
  const selectedRecordIds = useSelectedRecordIds();
  const recordId = selectedRecordIds.length === 1 ? selectedRecordIds[0] : null;
  const [reloadToken, setReloadToken] = useState(0);
  const reload = () => setReloadToken((current) => current + 1);

  useReloadOnTabChange(reload);

  if (!recordId) {
    return <WorkspaceText>Gift not found.</WorkspaceText>;
  }

  return (
    <div style={ROOT_STYLE}>
      <WorkspaceSection title="Gift summary">
        <GiftSummarySection recordId={recordId} reloadToken={reloadToken} />
      </WorkspaceSection>
      <WorkspaceSection title="Coding corrections">
        <GiftCodingSection
          recordId={recordId}
          reloadToken={reloadToken}
          onChanged={reload}
        />
      </WorkspaceSection>
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: GIFT_OVERVIEW_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'gift-overview',
  description: 'Gift summary and coding corrections for the gift Home tab.',
  component: GiftOverview,
});
