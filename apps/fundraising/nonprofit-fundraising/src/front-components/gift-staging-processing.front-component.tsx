import { useEffect, useState, type CSSProperties } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import {
  enqueueSnackbar,
  useRecordId,
} from 'twenty-sdk/front-component';
import { Button } from 'twenty-sdk/ui';
import { isGiftAidEnabled } from 'src/gift-aid/gift-aid-config';
import { processGiftStagingRow } from 'src/gift-staging-review/gift-staging-processing.api';
import {
  clearCoreGiftIssue,
  flagCoreGiftIssue,
  markReady,
  saveGiftDate,
} from 'src/gift-staging-review/gift-staging-review.actions';
import { useGiftStagingReviewRecord } from 'src/gift-staging-review/use-gift-staging-review-record';

export const GIFT_STAGING_PROCESSING_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER =
  'f220540d-7733-4c07-bcb3-35d18c643be7';

const cardStyle: CSSProperties = {
  border: '1px solid #d8dee4',
  borderRadius: '8px',
  padding: '16px',
  display: 'grid',
  gap: '16px',
  background: '#ffffff',
  fontFamily: 'Inter, sans-serif',
};

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

const inputStyle: CSSProperties = {
  border: '1px solid #d0d7de',
  borderRadius: '6px',
  padding: '10px 12px',
  font: 'inherit',
  background: '#ffffff',
};

const getInputEventValue = (event: unknown) => {
  if (
    typeof event === 'object' &&
    event !== null &&
    'detail' in event &&
    typeof event.detail === 'object' &&
    event.detail !== null &&
    'value' in event.detail
  ) {
    return String(event.detail.value ?? '');
  }

  return '';
};

const GiftStagingProcessing = () => {
  const recordId = useRecordId();
  const { record, loading, error, refresh } = useGiftStagingReviewRecord(
    recordId,
  );
  const [giftDateInput, setGiftDateInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [processingRow, setProcessingRow] = useState(false);

  useEffect(() => {
    if (record && giftDateInput === '') {
      setGiftDateInput(record.giftDate);
    }
  }, [record, giftDateInput]);

  if (loading) {
    return <div style={secondaryTextStyle}>Loading processing widget...</div>;
  }

  if (error) {
    return <div style={secondaryTextStyle}>{error}</div>;
  }

  if (!record || !recordId) {
    return <div style={secondaryTextStyle}>Staging row not found.</div>;
  }

  const afterMutationRefresh = async () => {
    await refresh();
  };

  const handleSaveGiftDate = async () => {
    setSaving(true);

    try {
      await saveGiftDate(recordId, giftDateInput);
      await enqueueSnackbar({
        message: 'Gift date saved.',
        variant: 'success',
      });
      await afterMutationRefresh();
    } catch (saveError) {
      await enqueueSnackbar({
        message:
          saveError instanceof Error
            ? saveError.message
            : 'Unable to save gift date.',
        variant: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleCoreGiftIssue = async () => {
    setSaving(true);

    try {
      if (record.hasCoreGiftIssue) {
        await clearCoreGiftIssue(recordId);
        await enqueueSnackbar({
          message: 'Core gift issue cleared.',
          variant: 'success',
        });
      } else {
        await flagCoreGiftIssue(recordId);
        await enqueueSnackbar({
          message: 'Core gift issue flagged.',
          variant: 'success',
        });
      }

      await afterMutationRefresh();
    } catch (actionError) {
      await enqueueSnackbar({
        message:
          actionError instanceof Error
            ? actionError.message
            : 'Unable to update core gift issue state.',
        variant: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleMarkReady = async () => {
    setSaving(true);

    try {
      await markReady(recordId);
      await enqueueSnackbar({
        message: 'Row marked ready.',
        variant: 'success',
      });
      await afterMutationRefresh();
    } catch (actionError) {
      await enqueueSnackbar({
        message:
          actionError instanceof Error
            ? actionError.message
            : 'Unable to mark row ready.',
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
            ? 'Staged gift processed successfully.'
            : result.processingStatus === 'PROCESS_FAILED'
              ? result.errorDetail ?? 'Staged gift failed during processing.'
              : 'This staged gift is not ready for processing.',
        variant:
          result.processingStatus === 'PROCESSED'
            ? 'success'
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
            : 'Unable to process staged gift.',
        variant: 'error',
      });
    } finally {
      setProcessingRow(false);
    }
  };

  return (
    <div style={cardStyle}>
      <div style={labelStyle}>Processing and core fixes</div>
      <div style={secondaryTextStyle}>
        Processing status: {record.processingStatus}
      </div>
      <div style={secondaryTextStyle}>
        Committed gift: {record.committedGiftName}
      </div>

      <label style={{ display: 'grid', gap: '6px' }}>
        <span style={labelStyle}>Gift date</span>
        <input
          style={inputStyle}
          type="date"
          value={giftDateInput}
          onChange={(event) => setGiftDateInput(getInputEventValue(event))}
        />
      </label>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <Button
          title="Save gift date"
          variant="secondary"
          onClick={() => {
            void handleSaveGiftDate();
          }}
          disabled={saving}
        />
        <Button
          title={
            record.hasCoreGiftIssue
              ? 'Clear core gift issue'
              : 'Flag core gift issue'
          }
          variant="secondary"
          onClick={() => {
            void handleToggleCoreGiftIssue();
          }}
          disabled={saving}
        />
      </div>

      {record.errorDetail !== '' ? (
        <div style={{ ...secondaryTextStyle, color: '#d12424' }}>
          Last error: {record.errorDetail}
        </div>
      ) : null}

      <div style={secondaryTextStyle}>
        Ready means the row is reviewed enough to be processed.
      </div>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <Button
          title="Mark ready"
          variant="primary"
          accent="blue"
          onClick={() => {
            void handleMarkReady();
          }}
          disabled={saving || record.hasCoreGiftIssue}
        />
        <Button
          title={processingRow ? 'Processing...' : 'Process row'}
          variant="secondary"
          onClick={() => {
            void handleProcessRow();
          }}
          disabled={
            saving || processingRow || record.processingStatus === 'PROCESSED'
          }
        />
      </div>

      {record.providerAgreementId !== '' ? (
        <div style={secondaryTextStyle}>
          Recurring provider evidence is present. Check `Audit` before
          processing if cadence evidence matters.
        </div>
      ) : null}
      {isGiftAidEnabled() && record.giftAidRequested ? (
        <div style={secondaryTextStyle}>
          Gift Aid capture facts are present. Check `Audit` for the captured
          declaration evidence.
        </div>
      ) : null}
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
