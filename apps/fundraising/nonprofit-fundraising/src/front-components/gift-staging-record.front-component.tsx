import type { CSSProperties } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import {
  AppPath,
  navigate,
  useRecordId,
} from 'twenty-sdk/front-component';
import { Button } from 'twenty-sdk/ui';
import { isGiftAidEnabled } from 'src/gift-aid/gift-aid-config';
import { deriveReviewState } from 'src/gift-staging-review/gift-staging-review.model';
import { useGiftStagingReviewRecord } from 'src/gift-staging-review/use-gift-staging-review-record';

export const GIFT_STAGING_RECORD_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER =
  'f5d9953c-1e4a-4113-8bd2-031b97731ab9';

const labelStyle: CSSProperties = {
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  color: '#57606a',
  fontWeight: 500,
};

const secondaryTextStyle: CSSProperties = {
  fontSize: '13px',
  color: '#57606a',
  lineHeight: 1.5,
};

const statusPillStyle = (accent: string, background: string): CSSProperties => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  border: `1px solid ${accent}`,
  borderRadius: '999px',
  padding: '8px 12px',
  background,
  color: '#1f2328',
  fontSize: '14px',
  lineHeight: 1.3,
  fontWeight: 500,
});

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
    <div
      style={{
        padding: '16px',
        fontFamily: 'Inter, sans-serif',
        display: 'grid',
        gap: '12px',
      }}
    >
      <div style={{ display: 'grid', gap: '8px' }}>
        <div style={labelStyle}>Review state</div>
        <div style={statusPillStyle(reviewState.accent, reviewState.background)}>
          <span>{reviewState.title}</span>
          <span style={{ color: '#57606a', fontWeight: 400 }}>
            {reviewState.reason}
          </span>
        </div>
        <div style={secondaryTextStyle}>{reviewState.nextAction}</div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        <div style={secondaryTextStyle}>
          {record.giftBatchId === ''
            ? 'Not linked to a batch.'
            : `In batch: ${record.giftBatchName}`}
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {record.processingStatus === 'PROCESSED' &&
          record.committedGiftId !== '' ? (
            <Button
              title="Open committed gift"
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

      {(record.providerAgreementId !== '' ||
        (isGiftAidEnabled() && record.giftAidRequested)) && (
        <div style={secondaryTextStyle}>
          {record.providerAgreementId !== '' ? 'Recurring evidence present.' : ''}
          {record.providerAgreementId !== '' &&
          isGiftAidEnabled() &&
          record.giftAidRequested
            ? ' '
            : ''}
          {isGiftAidEnabled() && record.giftAidRequested
            ? 'Gift Aid capture present.'
            : ''}
        </div>
      )}
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
