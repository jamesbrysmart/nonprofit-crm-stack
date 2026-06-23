import { defineFrontComponent } from 'twenty-sdk/define';
import {
  AppPath,
  navigate,
  useRecordId,
} from 'twenty-sdk/front-component';
import {
  ActionButton,
  SummaryStrip,
  SummaryStripItem,
  actionRowStyle,
  compactDividerSectionStyle,
  compactWidgetRootStyle,
  labelStyle,
  reviewStateStyle,
  secondaryTextStyle,
  sectionHeaderStyle,
} from 'src/front-components/front-component-ui';
import { isGiftAidEnabled } from 'src/gift-aid/gift-aid-config';
import {
  deriveReviewIssues,
  deriveReviewState,
} from 'src/gift-staging-review/gift-staging-review.model';
import { useGiftStagingReviewRecord } from 'src/gift-staging-review/use-gift-staging-review-record';

export const GIFT_STAGING_RECORD_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER =
  'f5d9953c-1e4a-4113-8bd2-031b97731ab9';

const GiftStagingReviewSummary = () => {
  const recordId = useRecordId();
  const { record, loading, error } = useGiftStagingReviewRecord(recordId);

  if (loading) {
    return <div style={secondaryTextStyle}>Loading review summary...</div>;
  }

  if (error) {
    return <div style={secondaryTextStyle}>{error}</div>;
  }

  if (!record) {
    return <div style={secondaryTextStyle}>Staging row not found.</div>;
  }

  const reviewState = deriveReviewState(record);
  const reviewIssues = deriveReviewIssues(record);

  const handleGoToBatch = async () => {
    if (record.giftBatchId === '') {
      return;
    }

    await navigate(AppPath.RecordShowPage, {
      objectNameSingular: 'giftBatch',
      objectRecordId: record.giftBatchId,
    });
  };

  const handleGoToCommittedGift = async () => {
    if (record.committedGiftId === '') {
      return;
    }

    await navigate(AppPath.RecordShowPage, {
      objectNameSingular: 'gift',
      objectRecordId: record.committedGiftId,
    }, {});
  };

  return (
    <div style={compactWidgetRootStyle}>
      <div style={sectionHeaderStyle}>
        <div style={{ minWidth: 0 }}>
          <div style={reviewStateStyle(reviewState.accent, reviewState.background)}>
            <span>{reviewState.title}</span>
          </div>
        </div>
        <div style={actionRowStyle}>
          {record.processingStatus === 'PROCESSED' &&
          record.committedGiftId !== '' ? (
            <ActionButton
              title="Open gift record"
              variant="primary"
              onClick={() => {
                void handleGoToCommittedGift();
              }}
            />
          ) : null}
          {record.giftBatchId !== '' ? (
            <ActionButton
              title="Go to batch"
              variant="secondary"
              onClick={() => {
                void handleGoToBatch();
              }}
            />
          ) : null}
        </div>
      </div>

      <div style={{ ...secondaryTextStyle, color: '#1f2328' }}>
        {reviewState.reason}
      </div>

      {reviewIssues.length > 1 ? (
        <div style={compactDividerSectionStyle}>
          <div style={labelStyle}>Blocking issues</div>
          <div style={{ ...secondaryTextStyle, display: 'grid', gap: '4px' }}>
            {reviewIssues.map((issue) => (
              <div key={issue.code}>{issue.label}</div>
            ))}
          </div>
        </div>
      ) : null}

      <SummaryStrip>
        <SummaryStripItem label="Amount">
          <div style={secondaryTextStyle}>{record.amountDisplay}</div>
        </SummaryStripItem>
        <SummaryStripItem label="Batch">
          <div style={secondaryTextStyle}>
            {record.giftBatchId === ''
              ? 'Not in a batch.'
              : record.giftBatchName}
          </div>
        </SummaryStripItem>
        {record.appealName !== '' ? (
          <SummaryStripItem label="Appeal">
            <div style={secondaryTextStyle}>{record.appealName}</div>
          </SummaryStripItem>
        ) : null}
        <SummaryStripItem label="Gift record">
          <div style={secondaryTextStyle}>
            {record.processingStatus === 'PROCESSED' &&
            record.committedGiftId !== ''
              ? 'Created.'
              : 'Not created yet.'}
          </div>
        </SummaryStripItem>
        {(record.providerAgreementId !== '' ||
          (isGiftAidEnabled() && record.giftAidRequested)) && (
          <SummaryStripItem label="Review notes">
            <div style={secondaryTextStyle}>
              {record.providerAgreementId !== '' ? 'Recurring giving' : ''}
              {record.providerAgreementId !== '' &&
              isGiftAidEnabled() &&
              record.giftAidRequested
                ? ' and '
                : ''}
              {isGiftAidEnabled() && record.giftAidRequested
                ? 'Gift Aid'
                : ''}
              {' noted.'}
            </div>
          </SummaryStripItem>
        )}
      </SummaryStrip>
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: GIFT_STAGING_RECORD_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'gift-staging-record-review-summary',
  description:
    'Operational landing widget for a staged gift record review.',
  component: GiftStagingReviewSummary,
});
