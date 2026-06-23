import { useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import {
  enqueueSnackbar,
  useRecordId,
} from 'twenty-sdk/front-component';
import {
  ActionButton,
  actionRowStyle,
  compactDividerSectionStyle,
  compactMetaItemStyle,
  compactValueStyle,
  compactWidgetRootStyle,
  badgeStyle,
  labelStyle,
  secondaryTextStyle,
  sectionHeaderStyle,
} from 'src/front-components/front-component-ui';
import { processGiftStagingRow } from 'src/gift-staging-review/gift-staging-processing.api';
import {
  checkIfReady,
} from 'src/gift-staging-review/gift-staging-review.actions';
import { useGiftStagingReviewRecord } from 'src/gift-staging-review/use-gift-staging-review-record';

export const GIFT_STAGING_PROCESSING_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER =
  'f220540d-7733-4c07-bcb3-35d18c643be7';

const getProcessingTone = (processingStatus: string) => {
  if (processingStatus === 'PROCESSED') {
    return 'success' as const;
  }

  if (processingStatus === 'PROCESS_FAILED') {
    return 'warning' as const;
  }

  return 'neutral' as const;
};

const getProcessingLabel = (processingStatus: string) => {
  if (processingStatus === 'PROCESSED') {
    return 'Processed';
  }

  if (processingStatus === 'PROCESS_FAILED') {
    return 'Process failed';
  }

  return 'Not processed';
};

const GiftStagingProcessing = () => {
  const recordId = useRecordId();
  const { record, loading, error, refresh } = useGiftStagingReviewRecord(
    recordId,
  );
  const [saving, setSaving] = useState(false);
  const [processingRow, setProcessingRow] = useState(false);

  if (loading) {
    return <div style={secondaryTextStyle}>Loading processing widget...</div>;
  }

  if (error) {
    return <div style={secondaryTextStyle}>{error}</div>;
  }

  if (!record || !recordId) {
    return <div style={secondaryTextStyle}>Staging row not found.</div>;
  }

  const processingTone = getProcessingTone(
    record.processingStatus,
  );
  const processingLabel = getProcessingLabel(record.processingStatus);
  const showCheckReady = record.processingStatus !== 'PROCESSED';
  const canProcess =
    record.giftReadyStatus === 'READY_TO_PROCESS' &&
    record.processingStatus !== 'PROCESSED';
  const afterMutationRefresh = async () => {
    await refresh();
  };

  const handleCheckReady = async () => {
    setSaving(true);

    try {
      await checkIfReady(recordId);
      await enqueueSnackbar({
        message: 'Readiness checked.',
        variant: 'success',
      });
      await afterMutationRefresh();
    } catch (actionError) {
      await enqueueSnackbar({
        message:
          actionError instanceof Error
            ? actionError.message
            : 'Unable to mark as reviewed.',
        variant: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleProcessRow = async () => {
    setProcessingRow(true);

    try {
      const result = await processGiftStagingRow({
        giftStagingId: recordId,
      });

      await enqueueSnackbar({
        message:
          result.processingStatus === 'PROCESSED'
            ? result.stagingWritebackSucceeded
              ? 'Gift record created.'
              : `Gift record created, but staging sync did not complete cleanly.${result.reconciliationError ? ` ${result.reconciliationError}` : ''}`
            : result.processingStatus === 'PROCESS_FAILED'
              ? result.errorDetail ?? 'This gift could not be processed.'
              : 'This gift cannot be processed yet.',
        variant:
          result.processingStatus === 'PROCESSED'
            ? result.stagingWritebackSucceeded
              ? 'success'
              : 'warning'
            : result.processingStatus === 'PROCESS_FAILED'
              ? 'error'
              : 'info',
      });

      await afterMutationRefresh();
    } catch (processError) {
      await enqueueSnackbar({
        message:
          processError instanceof Error
            ? processError.message
            : 'Unable to process this gift.',
        variant: 'error',
      });
    } finally {
      setProcessingRow(false);
    }
  };

  return (
    <div style={compactWidgetRootStyle}>
      <div style={sectionHeaderStyle}>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={badgeStyle(processingTone)}>{processingLabel}</span>
          {record.giftReadyStatus === 'READY_TO_PROCESS' ? (
            <span style={badgeStyle('success')}>Ready to process</span>
          ) : null}
        </div>
        {record.committedGiftName !== '' ? (
          <div style={{ ...compactMetaItemStyle, justifyItems: 'end' }}>
            <div style={labelStyle}>Gift record</div>
            <div style={compactValueStyle}>{record.committedGiftName}</div>
          </div>
        ) : null}
      </div>

      {record.errorDetail !== '' ? (
        <div style={{ ...compactDividerSectionStyle, gap: '4px' }}>
          <div style={labelStyle}>Problem</div>
          <div style={{ ...secondaryTextStyle, color: '#b42318' }}>
            {record.errorDetail}
          </div>
        </div>
      ) : null}

      <div style={actionRowStyle}>
        <ActionButton
          title={processingRow ? 'Processing...' : 'Process'}
          variant="primary"
          onClick={() => {
            void handleProcessRow();
          }}
          disabled={saving || processingRow || !canProcess}
        />
        {showCheckReady ? (
          <ActionButton
            title="Check if ready"
            variant="secondary"
            onClick={() => {
              void handleCheckReady();
            }}
            disabled={saving || processingRow}
          />
        ) : null}
      </div>
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier:
    GIFT_STAGING_PROCESSING_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'gift-staging-processing',
  description: 'Core processing controls for a staged gift record.',
  component: GiftStagingProcessing,
});
