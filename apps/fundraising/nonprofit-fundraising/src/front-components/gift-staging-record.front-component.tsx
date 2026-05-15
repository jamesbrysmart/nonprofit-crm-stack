import { defineFrontComponent } from 'twenty-sdk/define';
import {
  AppPath,
  navigate,
  useRecordId,
} from 'twenty-sdk/front-component';
import { Button } from 'twenty-sdk/ui';
import {
  actionRowStyle,
  compactDividerSectionStyle,
  compactMetaGridStyle,
  compactMetaItemStyle,
  compactWidgetRootStyle,
  labelStyle,
  reviewStateStyle,
  secondaryTextStyle,
  sectionHeaderStyle,
} from 'src/front-components/gift-staging-review-ui';
import { isGiftAidEnabled } from 'src/gift-aid/gift-aid-config';
import { deriveReviewState } from 'src/gift-staging-review/gift-staging-review.model';
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
    });
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
            <Button
              title="Open gift record"
              variant="primary"
              onClick={() => {
                void handleGoToCommittedGift();
              }}
            />
          ) : null}
          {record.giftBatchId !== '' ? (
            <Button
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

      <div style={compactDividerSectionStyle}>
        <div style={compactMetaGridStyle}>
          <div style={compactMetaItemStyle}>
            <div style={labelStyle}>Amount</div>
            <div style={secondaryTextStyle}>{record.amountDisplay}</div>
          </div>
          <div style={compactMetaItemStyle}>
            <div style={labelStyle}>Batch</div>
            <div style={secondaryTextStyle}>
              {record.giftBatchId === ''
                ? 'Not in a batch.'
                : record.giftBatchName}
            </div>
          </div>
          <div style={compactMetaItemStyle}>
            <div style={labelStyle}>Gift record</div>
            <div style={secondaryTextStyle}>
              {record.processingStatus === 'PROCESSED' &&
              record.committedGiftId !== ''
                ? 'Created.'
                : 'Not created yet.'}
            </div>
          </div>
          {(record.providerAgreementId !== '' ||
            (isGiftAidEnabled() && record.giftAidRequested)) && (
            <div style={compactMetaItemStyle}>
              <div style={labelStyle}>Review notes</div>
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
            </div>
          )}
        </div>
      </div>
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
