import { defineFrontComponent } from 'twenty-sdk/define';
import { useRecordId } from 'twenty-sdk/front-component';
import {
  badgeStyle,
  compactMetaGridStyle,
  compactMetaItemStyle,
  compactWidgetRootStyle,
  labelStyle,
  secondaryTextStyle,
} from 'src/front-components/gift-staging-review-ui';
import { useGiftBatchReview } from 'src/gift-batch-review/use-gift-batch-review';

export const GIFT_BATCH_SUMMARY_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER =
  'ad9b4651-f8ea-40a2-b714-bda5d8ef16ce';

const getOperationalState = (input: {
  totalItems: number;
  failedItems: number;
  ambiguousItems: number;
  unresolvedItems: number;
  readyItems: number;
  processedItems: number;
}) => {
  if (input.totalItems === 0) {
    return {
      label: 'Empty batch',
      tone: 'neutral' as const,
      message: 'This batch does not contain any staged gifts yet.',
    };
  }

  if (input.failedItems > 0) {
    return {
      label: 'Needs attention',
      tone: 'warning' as const,
      message: 'Some rows failed during processing and need follow-up.',
    };
  }

  if (input.ambiguousItems > 0 || input.unresolvedItems > 0) {
    return {
      label: 'Needs donor review',
      tone: 'warning' as const,
      message: 'Review unresolved donor matches before processing this batch.',
    };
  }

  if (input.readyItems > 0) {
    return {
      label: 'Ready to process',
      tone: 'success' as const,
      message: 'This batch has rows ready to process now.',
    };
  }

  if (input.processedItems === input.totalItems) {
    return {
      label: 'Processed',
      tone: 'success' as const,
      message: 'All rows in this batch have already been processed.',
    };
  }

  return {
    label: 'In review',
    tone: 'neutral' as const,
    message: 'Use the worklists below to review and route the remaining rows.',
  };
};

const GiftBatchSummary = () => {
  const recordId = useRecordId();
  const { record, loading, error } = useGiftBatchReview(recordId);

  if (loading) {
    return <div style={secondaryTextStyle}>Loading batch summary...</div>;
  }

  if (error) {
    return <div style={secondaryTextStyle}>{error}</div>;
  }

  if (!record) {
    return <div style={secondaryTextStyle}>Batch not found.</div>;
  }

  const state = getOperationalState(record);

  return (
    <div style={compactWidgetRootStyle}>
      <span style={badgeStyle(state.tone)}>{state.label}</span>
      <div style={{ ...secondaryTextStyle, color: '#1f2328' }}>
        {state.message}
      </div>

      <div style={compactMetaGridStyle}>
        <div style={compactMetaItemStyle}>
          <div style={labelStyle}>Batch</div>
          <div style={secondaryTextStyle}>{record.name}</div>
        </div>
        <div style={compactMetaItemStyle}>
          <div style={labelStyle}>Status</div>
          <div style={secondaryTextStyle}>{record.status}</div>
        </div>
        <div style={compactMetaItemStyle}>
          <div style={labelStyle}>Source</div>
          <div style={secondaryTextStyle}>{record.source}</div>
        </div>
        <div style={compactMetaItemStyle}>
          <div style={labelStyle}>Rows</div>
          <div style={secondaryTextStyle}>{record.totalItems}</div>
        </div>
        <div style={compactMetaItemStyle}>
          <div style={labelStyle}>Total value</div>
          <div style={secondaryTextStyle}>{record.totalValueDisplay}</div>
        </div>
        <div style={compactMetaItemStyle}>
          <div style={labelStyle}>Processed</div>
          <div style={secondaryTextStyle}>{record.processedItems}</div>
        </div>
        <div style={compactMetaItemStyle}>
          <div style={labelStyle}>Ready</div>
          <div style={secondaryTextStyle}>{record.readyItems}</div>
        </div>
        <div style={compactMetaItemStyle}>
          <div style={labelStyle}>Needs review</div>
          <div style={secondaryTextStyle}>{record.unresolvedItems}</div>
        </div>
        <div style={compactMetaItemStyle}>
          <div style={labelStyle}>Failed</div>
          <div style={secondaryTextStyle}>{record.failedItems}</div>
        </div>
      </div>
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: GIFT_BATCH_SUMMARY_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'gift-batch-summary',
  description: 'Compact batch summary and posture for a gift batch.',
  component: GiftBatchSummary,
});
