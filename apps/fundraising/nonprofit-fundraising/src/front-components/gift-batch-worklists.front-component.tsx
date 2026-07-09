import type { CSSProperties } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { useRecordId } from 'twenty-sdk/front-component';
import {
  compactDividerSectionStyle,
  compactWidgetRootStyle,
  secondaryTextStyle,
} from 'src/front-components/front-component-ui';
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

  if (loading && !record) {
    return <div style={secondaryTextStyle}>Loading worklists...</div>;
  }

  if (error) {
    return <div style={secondaryTextStyle}>{error}</div>;
  }

  if (!recordId || !record) {
    return <div style={secondaryTextStyle}>Batch not found.</div>;
  }

  const hasActiveWorklists =
    record.ambiguousItems > 0 ||
    record.needsReviewItems > 0 ||
    record.readyItems > 0 ||
    record.failedItems > 0;

  const openQueue = (scope: Parameters<typeof openGiftBatchQueue>[1]) => {
    void openGiftBatchQueue(recordId, scope);
  };

  return (
    <div style={compactWidgetRootStyle}>
      <div style={queueRowStyle}>
        <div style={{ ...secondaryTextStyle, color: '#1f2328' }}>All staged gifts</div>
        <div style={queueCountStyle}>
          {record.totalItems} gift{record.totalItems === 1 ? '' : 's'}
        </div>
        <button
          type="button"
          style={queueActionStyle}
          onClick={() => openQueue('all')}
        >
          Open
        </button>
      </div>

      {record.isOverWorkflowLimit ? (
        <div style={compactDividerSectionStyle}>
          <div style={secondaryTextStyle}>
            Split the batch before using review worklists.
          </div>
        </div>
      ) : (
        <>
          {record.ambiguousItems > 0 ? (
            <div style={compactDividerSectionStyle}>
              <div style={queueRowStyle}>
                <div style={{ ...secondaryTextStyle, color: '#1f2328' }}>
                  Review possible donor matches
                </div>
                <div style={queueCountStyle}>
                  {record.ambiguousItems} gift
                  {record.ambiguousItems === 1 ? '' : 's'}
                </div>
                <button
                  type="button"
                  style={queueActionStyle}
                  onClick={() => openQueue('possible-donor-matches')}
                >
                  Open
                </button>
              </div>
            </div>
          ) : null}

          {record.needsReviewItems > 0 ? (
            <div style={compactDividerSectionStyle}>
              <div style={queueRowStyle}>
                <div style={{ ...secondaryTextStyle, color: '#1f2328' }}>
                  Needs review
                </div>
                <div style={queueCountStyle}>
                  {record.needsReviewItems} gift
                  {record.needsReviewItems === 1 ? '' : 's'}
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
          ) : null}

          {record.readyItems > 0 ? (
            <div style={compactDividerSectionStyle}>
              <div style={queueRowStyle}>
                <div style={{ ...secondaryTextStyle, color: '#1f2328' }}>
                  Ready to process
                </div>
                <div style={queueCountStyle}>
                  {record.readyItems} gift{record.readyItems === 1 ? '' : 's'}
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
          ) : null}

          {record.failedItems > 0 ? (
            <div style={compactDividerSectionStyle}>
              <div style={queueRowStyle}>
                <div style={{ ...secondaryTextStyle, color: '#1f2328' }}>
                  Failed
                </div>
                <div style={queueCountStyle}>
                  {record.failedItems} gift{record.failedItems === 1 ? '' : 's'}
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
          ) : null}

          {!hasActiveWorklists ? (
            <div style={compactDividerSectionStyle}>
              <div style={secondaryTextStyle}>
                No active worklists. Open all staged gifts to inspect this batch.
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: GIFT_BATCH_WORKLISTS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'gift-batch-worklists',
  description: 'Compact staged-gift worklist links for a gift batch.',
  component: GiftBatchWorklists,
});
