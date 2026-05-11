import type { CSSProperties } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { useRecordId } from 'twenty-sdk/front-component';
import {
  compactDividerSectionStyle,
  compactWidgetRootStyle,
  secondaryTextStyle,
} from 'src/front-components/gift-staging-review-ui';
import {
  openGiftBatchQueue,
  useGiftBatchReview,
} from 'src/gift-batch-review/use-gift-batch-review';

export const GIFT_BATCH_WORKLISTS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER =
  '4432b728-7ae1-4ad2-92f6-49d5b1624398';

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

const GiftBatchWorklists = () => {
  const recordId = useRecordId();
  const { record, loading, error } = useGiftBatchReview(recordId);

  if (loading) {
    return <div style={secondaryTextStyle}>Loading worklists...</div>;
  }

  if (error) {
    return <div style={secondaryTextStyle}>{error}</div>;
  }

  if (!recordId || !record) {
    return <div style={secondaryTextStyle}>Batch not found.</div>;
  }

  const notReadyItems = record.rows.filter(
    (row) => row.processingStatus !== 'PROCESSED' && !row.isReadyForProcessing,
  ).length;

  const openQueue = (scope: Parameters<typeof openGiftBatchQueue>[1]) => {
    void openGiftBatchQueue(recordId, scope);
  };

  return (
    <div style={compactWidgetRootStyle}>
      <div style={queueRowStyle}>
        <div style={{ ...secondaryTextStyle, color: '#1f2328' }}>All staged rows</div>
        <div style={queueCountStyle}>
          {record.totalItems} row{record.totalItems === 1 ? '' : 's'}
        </div>
        <button
          type="button"
          style={queueActionStyle}
          onClick={() => openQueue('all')}
        >
          Open
        </button>
      </div>

      <div style={compactDividerSectionStyle}>
        <div style={queueRowStyle}>
          <div style={{ ...secondaryTextStyle, color: '#1f2328' }}>Failed</div>
          <div style={queueCountStyle}>
            {record.failedItems} row{record.failedItems === 1 ? '' : 's'}
          </div>
          <button
            type="button"
            style={queueActionStyle}
            onClick={() => openQueue('failed')}
          >
            Open
          </button>
        </div>
      </div>

      <div style={compactDividerSectionStyle}>
        <div style={queueRowStyle}>
          <div style={{ ...secondaryTextStyle, color: '#1f2328' }}>Ambiguous</div>
          <div style={queueCountStyle}>
            {record.ambiguousItems} row{record.ambiguousItems === 1 ? '' : 's'}
          </div>
          <button
            type="button"
            style={queueActionStyle}
            onClick={() => openQueue('ambiguous')}
          >
            Open
          </button>
        </div>
      </div>

      <div style={compactDividerSectionStyle}>
        <div style={queueRowStyle}>
          <div style={{ ...secondaryTextStyle, color: '#1f2328' }}>
            Needs donor review
          </div>
          <div style={queueCountStyle}>
            {record.unresolvedItems} row
            {record.unresolvedItems === 1 ? '' : 's'}
          </div>
          <button
            type="button"
            style={queueActionStyle}
            onClick={() => openQueue('needs-donor-review')}
          >
            Open
          </button>
        </div>
      </div>

      <div style={compactDividerSectionStyle}>
        <div style={queueRowStyle}>
          <div style={{ ...secondaryTextStyle, color: '#1f2328' }}>Ready</div>
          <div style={queueCountStyle}>
            {record.readyItems} row{record.readyItems === 1 ? '' : 's'}
          </div>
          <button
            type="button"
            style={queueActionStyle}
            onClick={() => openQueue('ready')}
          >
            Open
          </button>
        </div>
      </div>

      <div style={compactDividerSectionStyle}>
        <div style={queueRowStyle}>
          <div style={{ ...secondaryTextStyle, color: '#1f2328' }}>Not ready</div>
          <div style={queueCountStyle}>
            {notReadyItems} row{notReadyItems === 1 ? '' : 's'}
          </div>
          <button
            type="button"
            style={queueActionStyle}
            onClick={() => openQueue('not-ready')}
          >
            Open
          </button>
        </div>
      </div>
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: GIFT_BATCH_WORKLISTS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'gift-batch-worklists',
  description: 'Compact staged-gift worklist links for a gift batch.',
  component: GiftBatchWorklists,
});
