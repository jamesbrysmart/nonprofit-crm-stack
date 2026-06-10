import type { CSSProperties } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import {
  compactDividerSectionStyle,
  compactWidgetRootStyle,
  secondaryTextStyle,
} from 'src/front-components/front-component-ui';
import { openGiftQueue } from 'src/front-components/gift-aid-claim-batch-ui';
import { useGiftAidClaimWorkspace } from 'src/gift-aid-claims/use-gift-aid-claim-workspace';

export const GIFT_AID_CLAIM_BATCH_WORKLISTS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER =
  '9344eaa5-a55a-4864-b214-739f12b319f5';

const queueRowStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) auto auto',
  alignItems: 'center',
  gap: '8px',
};

const queueCountStyle: CSSProperties = {
  fontSize: '13px',
  color: '#57606a',
  textAlign: 'right',
  minWidth: '56px',
};

const queueActionStyle: CSSProperties = {
  border: 'none',
  background: 'transparent',
  padding: 0,
  color: '#1f6feb',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
};

const GiftAidClaimBatchWorklists = () => {
  const { recordId, workspace, loading, error } = useGiftAidClaimWorkspace();

  if (loading) {
    return <div style={secondaryTextStyle}>Loading gift worklists...</div>;
  }

  if (error) {
    return <div style={secondaryTextStyle}>{error}</div>;
  }

  if (!workspace || !recordId) {
    return <div style={secondaryTextStyle}>Claim batch not found.</div>;
  }

  const claimGiftCount = workspace.gifts.length;
  const claimBlockingCount = workspace.gifts.filter(
    (gift) => gift.giftAidStatus !== 'CLAIMABLE',
  ).length;
  const needsReviewOutsideClaimCount = workspace.needsReviewGifts.length;

  return (
    <div style={compactWidgetRootStyle}>
      <div style={queueRowStyle}>
        <div style={{ ...secondaryTextStyle, color: '#1f2328' }}>In this claim</div>
        <div style={queueCountStyle}>
          {claimGiftCount} gift{claimGiftCount === 1 ? '' : 's'}
        </div>
        <button
          type="button"
          style={queueActionStyle}
          onClick={() => {
            void openGiftQueue(recordId, 'claim');
          }}
        >
          Open
        </button>
      </div>

      <div style={compactDividerSectionStyle}>
        <div style={queueRowStyle}>
          <div style={{ ...secondaryTextStyle, color: '#1f2328' }}>
            Blocking in claim
          </div>
          <div style={queueCountStyle}>
            {claimBlockingCount} gift{claimBlockingCount === 1 ? '' : 's'}
          </div>
          <button
            type="button"
            style={queueActionStyle}
            onClick={() => {
              void openGiftQueue(recordId, 'needs-review-outside-claim');
            }}
          >
            Open
          </button>
        </div>
      </div>

      <div style={compactDividerSectionStyle}>
        <div style={queueRowStyle}>
          <div style={{ ...secondaryTextStyle, color: '#1f2328' }}>
            Needs review outside claim
          </div>
          <div style={queueCountStyle}>
            {needsReviewOutsideClaimCount} gift
            {needsReviewOutsideClaimCount === 1 ? '' : 's'}
          </div>
          <button
            type="button"
            style={queueActionStyle}
            onClick={() => {
              void openGiftQueue(recordId, 'claim-blockers');
            }}
          >
            Open
          </button>
        </div>
      </div>
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier:
    GIFT_AID_CLAIM_BATCH_WORKLISTS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'gift-aid-claim-batch-worklists',
  description: 'Gift worklist links for a Gift Aid claim batch.',
  component: GiftAidClaimBatchWorklists,
});
