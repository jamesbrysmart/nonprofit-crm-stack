import { useState } from 'react';
import { enqueueSnackbar } from 'twenty-sdk/front-component';
import { Status } from 'twenty-ui/primitives/data-display';
import type { ThemeColor } from 'twenty-ui/theme';
import {
  ActionButton,
  SummaryStrip,
  SummaryStripItem,
  actionRowStyle,
} from 'src/front-components/front-component-ui';
import { formatAmount } from 'src/front-components/gift-aid-claim-batch-ui';
import {
  WorkspaceSection,
  WorkspaceText,
} from 'src/front-components/workspace-layout';
import {
  finalizeGiftAidClaimBatch,
  queueGiftAidClaimSubmission,
} from 'src/gift-aid-claims/gift-aid-claim.api';
import type { GiftAidClaimBatchRecord } from 'src/gift-aid-claims/gift-aid-claim.types';
import {
  formatClaimStatus,
  formatSubmissionStatus,
} from 'src/gift-aid-claims/workspace/claim-display';
import type { GiftAidClaimWorkspaceSectionProps } from 'src/gift-aid-claims/workspace/workspace-section';

const getOperationalState = (
  batch: GiftAidClaimBatchRecord,
): { label: string; color: ThemeColor; message: string } => {
  if (batch.status === 'FINALIZED') {
    return {
      label: 'Finalized',
      color: 'green',
      message: 'This claim has been finalized and is ready for submission follow-up.',
    };
  }

  if ((batch.blockingIssueCount ?? 0) > 0) {
    return {
      label: 'Blocked',
      color: 'amber',
      message: 'Resolve the blocking issues before finalizing this claim.',
    };
  }

  if ((batch.giftCount ?? 0) === 0) {
    return {
      label: 'Empty draft',
      color: 'gray',
      message: 'Add claimable gifts before finalizing this claim.',
    };
  }

  return {
    label: 'Ready to finalize',
    color: 'green',
    message: 'This claim is ready to finalize.',
  };
};

const isRetryableSubmissionStatus = (status: string | null | undefined) =>
  status === 'FAILED' || status === 'TIMED_OUT';

const canQueueClaimSubmission = (status: string | null | undefined) =>
  !status || isRetryableSubmissionStatus(status);

const getQueueMessage = (status: string | null | undefined) => {
  if (!status) {
    return 'Queue the first submission for this finalized claim when you are ready.';
  }

  if (isRetryableSubmissionStatus(status)) {
    return 'A previous submission attempt did not complete. You can queue another attempt.';
  }

  if (status === 'RESPONDED') {
    return 'A submission response has already been recorded for this claim.';
  }

  return 'A submission attempt is already recorded for this claim.';
};

const getQueueResultMessage = (status: string) =>
  status === 'BUILT'
    ? 'Claim submission prepared.'
    : status === 'RESPONDED'
      ? 'Claim response recorded.'
      : status === 'TIMED_OUT'
        ? 'Submission accepted, but no final response arrived in time.'
        : status === 'FAILED'
          ? 'Claim submission failed.'
          : 'Claim submission queued.';

// Route errors can arrive as a JSON-wrapped message.
const extractDisplayError = (error: unknown, fallback: string) => {
  if (!(error instanceof Error)) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(error.message) as {
      messages?: string[];
      message?: string;
    };
    const wrapped = parsed.messages?.[0] ?? parsed.message;

    if (wrapped) {
      return wrapped.replace(/^Error:\s*/, '');
    }
  } catch {
    // Not JSON; use the plain message.
  }

  return error.message.replace(/^Error:\s*/, '');
};

export const ClaimSummarySection = ({
  recordId,
  workspace,
  onChanged,
}: GiftAidClaimWorkspaceSectionProps) => {
  const [finalizing, setFinalizing] = useState(false);
  const [queueingSubmission, setQueueingSubmission] = useState(false);
  const batch = workspace.batch;

  if (!batch) {
    return null;
  }

  const blockingCount = batch.blockingIssueCount ?? 0;
  const state = getOperationalState(batch);
  const isDraft = batch.status === 'DRAFT';
  const canFinalize =
    (batch.giftCount ?? 0) > 0 && batch.hasBlockingIssues !== true;
  const latestSubmissionStatus = batch.latestSubmissionStatus ?? null;
  const busy = finalizing || queueingSubmission;

  const handleFinalize = async () => {
    setFinalizing(true);

    try {
      const result = await finalizeGiftAidClaimBatch({ batchId: recordId });
      await enqueueSnackbar({
        message: result.warningMessage
          ? `Draft claim finalized at ${result.submittedAt}. ${result.warningMessage}`
          : `Draft claim finalized at ${result.submittedAt}.`,
        variant: result.warningMessage ? 'warning' : 'success',
      });
      await onChanged();
    } catch (finalizeError) {
      await enqueueSnackbar({
        message: extractDisplayError(
          finalizeError,
          'Unable to finalize draft claim.',
        ),
        variant: 'error',
      });
    } finally {
      setFinalizing(false);
    }
  };

  const handleQueueSubmission = async () => {
    setQueueingSubmission(true);

    try {
      const result = await queueGiftAidClaimSubmission({ batchId: recordId });
      const message = getQueueResultMessage(result.status);
      await enqueueSnackbar({
        message: result.warningMessage
          ? `${message} ${result.warningMessage}`
          : message,
        variant:
          result.status === 'FAILED' || result.status === 'TIMED_OUT'
            ? 'error'
            : 'success',
      });
      await onChanged();
    } catch (queueError) {
      await enqueueSnackbar({
        message: extractDisplayError(
          queueError,
          'Unable to queue claim submission.',
        ),
        variant: 'error',
      });
    } finally {
      setQueueingSubmission(false);
    }
  };

  return (
    <WorkspaceSection
      title="Claim summary"
      headerAction={
        <Status color={state.color} weight="medium">
          {state.label}
        </Status>
      }
    >
      <WorkspaceText color="primary">{state.message}</WorkspaceText>

      <SummaryStrip>
        <SummaryStripItem label="Status" value={formatClaimStatus(batch.status)} />
        <SummaryStripItem label="Gifts" value={String(batch.giftCount ?? 0)} />
        <SummaryStripItem
          label="Total amount"
          value={formatAmount(batch.totalAmount)}
        />
        <SummaryStripItem
          label="Issues"
          value={
            blockingCount === 0
              ? 'No blocking issues'
              : `${blockingCount} blocking issue${blockingCount === 1 ? '' : 's'}`
          }
        />
        {!isDraft ? (
          <SummaryStripItem
            label="Latest submission"
            value={formatSubmissionStatus(latestSubmissionStatus)}
          />
        ) : null}
      </SummaryStrip>

      {isDraft ? (
        <div style={actionRowStyle}>
          <ActionButton
            title={finalizing ? 'Finalizing...' : 'Finalize draft claim'}
            variant="primary"
            onClick={() => {
              void handleFinalize();
            }}
            disabled={busy || !canFinalize}
          />
        </div>
      ) : (
        <>
          <WorkspaceText>{getQueueMessage(latestSubmissionStatus)}</WorkspaceText>
          {canQueueClaimSubmission(latestSubmissionStatus) ? (
            <div style={actionRowStyle}>
              <ActionButton
                title={
                  queueingSubmission
                    ? 'Queueing submission...'
                    : 'Queue claim submission'
                }
                variant="primary"
                onClick={() => {
                  void handleQueueSubmission();
                }}
                disabled={busy}
              />
            </div>
          ) : null}
        </>
      )}
    </WorkspaceSection>
  );
};
