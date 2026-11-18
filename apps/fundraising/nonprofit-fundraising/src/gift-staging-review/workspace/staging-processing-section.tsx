import { useState, type CSSProperties } from 'react';
import { enqueueSnackbar } from 'twenty-sdk/front-component';
import { Callout } from 'twenty-ui/components/feedback';
import { Status } from 'twenty-ui/primitives/data-display';
import type { ThemeColor } from 'twenty-ui/theme';
import {
  ActionButton,
  SummaryStrip,
  SummaryStripItem,
  actionRowStyle,
} from 'src/front-components/front-component-ui';
import { WorkspaceSection } from 'src/front-components/workspace-layout';
import { processGiftStagingRow } from 'src/gift-staging-review/gift-staging-processing.api';
import { checkIfReady } from 'src/gift-staging-review/gift-staging-review.actions';
import type { GiftStagingWorkspaceSectionProps } from 'src/gift-staging-review/workspace/workspace-section';

const STATUS_ROW_STYLE: CSSProperties = {
  display: 'flex',
  gap: 8,
  alignItems: 'center',
  flexWrap: 'wrap',
};

const getProcessingColor = (processingStatus: string): ThemeColor =>
  processingStatus === 'PROCESSED'
    ? 'green'
    : processingStatus === 'PROCESS_FAILED'
      ? 'amber'
      : 'gray';

const getProcessingLabel = (processingStatus: string) => {
  if (processingStatus === 'PROCESSED') {
    return 'Processed';
  }

  if (processingStatus === 'PROCESS_FAILED') {
    return 'Process failed';
  }

  return 'Not processed';
};

export const StagingProcessingSection = ({
  recordId,
  record,
  onChanged,
}: GiftStagingWorkspaceSectionProps) => {
  const [saving, setSaving] = useState(false);
  const [processingRow, setProcessingRow] = useState(false);

  const showCheckReady = record.processingStatus !== 'PROCESSED';
  const canProcess =
    record.giftReadyStatus === 'READY_TO_PROCESS' &&
    record.processingStatus !== 'PROCESSED';
  const afterMutationRefresh = async () => {
    await onChanged();
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
    <WorkspaceSection title="Processing">
      <div style={STATUS_ROW_STYLE}>
        <Status color={getProcessingColor(record.processingStatus)} weight="medium">
          {getProcessingLabel(record.processingStatus)}
        </Status>
        {record.giftReadyStatus === 'READY_TO_PROCESS' ? (
          <Status color="green">Ready to process</Status>
        ) : null}
      </div>

      {record.committedGiftName !== '' ? (
        <SummaryStrip>
          <SummaryStripItem label="Gift record" value={record.committedGiftName} />
        </SummaryStrip>
      ) : null}

      {record.errorDetail !== '' ? (
        <Callout status="error" title="Problem" description={record.errorDetail} />
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
    </WorkspaceSection>
  );
};
