import { defineFrontComponent } from 'twenty-sdk/define';
import { enqueueSnackbar } from 'twenty-sdk/front-component';
import { Button } from 'twenty-sdk/ui';
import {
  actionRowStyle,
  badgeStyle,
  compactMetaGridStyle,
  compactMetaItemStyle,
  compactWidgetRootStyle,
  labelStyle,
  secondaryTextStyle,
} from 'src/front-components/front-component-ui';
import { formatAmount } from 'src/front-components/gift-aid-claim-batch-ui';
import {
  finalizeGiftAidClaimBatch,
  queueGiftAidClaimSubmission,
} from 'src/gift-aid-claims/gift-aid-claim.api';
import { useGiftAidClaimWorkspace } from 'src/gift-aid-claims/use-gift-aid-claim-workspace';
import { useState } from 'react';

export const GIFT_AID_CLAIM_BATCH_SUMMARY_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER =
  'aa27b537-9167-497d-b0cc-c7956dd2f78a';

const getOperationalState = (input: {
  status?: string | null;
  giftCount?: number | null;
  blockingIssueCount?: number | null;
}) => {
  if (input.status === 'FINALIZED') {
    return {
      label: 'Finalized',
      tone: 'success' as const,
      message: 'This claim has been finalized and is ready for submission follow-up.',
    };
  }

  const giftCount = input.giftCount ?? 0;
  const blockingIssueCount = input.blockingIssueCount ?? 0;

  if (blockingIssueCount > 0) {
    return {
      label: 'Blocked',
      tone: 'warning' as const,
      message: 'Resolve the blocking issues before finalizing this claim.',
    };
  }

  if (giftCount === 0) {
    return {
      label: 'Empty draft',
      tone: 'neutral' as const,
      message: 'Add claimable gifts before finalizing this claim.',
    };
  }

  return {
    label: 'Ready to finalize',
    tone: 'success' as const,
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
    // Fall through to plain message handling.
  }

  return error.message.replace(/^Error:\s*/, '');
};

const GiftAidClaimBatchSummary = () => {
  const { recordId, workspace, loading, error, refresh } =
    useGiftAidClaimWorkspace();
  const [finalizing, setFinalizing] = useState(false);
  const [queueingSubmission, setQueueingSubmission] = useState(false);

  if (loading) {
    return <div style={secondaryTextStyle}>Loading claim summary...</div>;
  }

  if (error) {
    return <div style={secondaryTextStyle}>{error}</div>;
  }

  if (!workspace?.batch) {
    return <div style={secondaryTextStyle}>Claim batch not found.</div>;
  }

  const batch = workspace.batch;
  const blockingCount = batch.blockingIssueCount ?? 0;
  const operationalState = getOperationalState(batch);
  const isDraft = batch.status === 'DRAFT';
  const canFinalize =
    (batch.giftCount ?? 0) > 0 && batch.hasBlockingIssues !== true;
  const latestSubmissionStatus = batch.latestSubmissionStatus ?? null;
  const canQueueSubmissionNow = canQueueClaimSubmission(latestSubmissionStatus);

  const handleFinalize = async () => {
    if (!recordId) {
      return;
    }

    setFinalizing(true);
    try {
      const result = await finalizeGiftAidClaimBatch({ batchId: recordId });
      await enqueueSnackbar({
        message: result.warningMessage
          ? `Draft claim finalized at ${result.submittedAt}. ${result.warningMessage}`
          : `Draft claim finalized at ${result.submittedAt}.`,
        variant: result.warningMessage ? 'warning' : 'success',
      });
      await refresh();
    } catch (finalizeError) {
      await enqueueSnackbar({
        message:
          finalizeError instanceof Error
            ? finalizeError.message
            : 'Unable to finalize draft claim.',
        variant: 'error',
      });
    } finally {
      setFinalizing(false);
    }
  };

  const handleQueueSubmission = async () => {
    if (!recordId) {
      return;
    }

    setQueueingSubmission(true);
    try {
      const result = await queueGiftAidClaimSubmission({ batchId: recordId });
      const message =
        result.status === 'BUILT'
          ? 'Claim submission prepared.'
          : result.status === 'RESPONDED'
            ? 'Claim response recorded.'
            : result.status === 'TIMED_OUT'
              ? 'Submission accepted, but no final response arrived in time.'
              : result.status === 'FAILED'
                ? 'Claim submission failed.'
                : 'Claim submission queued.';

      await enqueueSnackbar({
        message: result.warningMessage
          ? `${message} ${result.warningMessage}`
          : message,
        variant:
          result.status === 'FAILED' || result.status === 'TIMED_OUT'
            ? 'error'
            : 'success',
      });
      await refresh();
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
    <div style={compactWidgetRootStyle}>
      <span style={badgeStyle(operationalState.tone)}>{operationalState.label}</span>
      <div style={{ ...secondaryTextStyle, color: '#1f2328' }}>
        {operationalState.message}
      </div>

      <div style={compactMetaGridStyle}>
        <div style={compactMetaItemStyle}>
          <div style={labelStyle}>Status</div>
          <div style={secondaryTextStyle}>{batch.status ?? 'Unknown'}</div>
        </div>
        <div style={compactMetaItemStyle}>
          <div style={labelStyle}>Gifts</div>
          <div style={secondaryTextStyle}>{batch.giftCount ?? 0}</div>
        </div>
        <div style={compactMetaItemStyle}>
          <div style={labelStyle}>Total amount</div>
          <div style={secondaryTextStyle}>{formatAmount(batch.totalAmount)}</div>
        </div>
        <div style={compactMetaItemStyle}>
          <div style={labelStyle}>Issues</div>
          <div style={secondaryTextStyle}>
            {blockingCount === 0
              ? 'No blocking issues'
              : `${blockingCount} blocking issue${blockingCount === 1 ? '' : 's'}`}
          </div>
        </div>
        {!isDraft ? (
          <div style={compactMetaItemStyle}>
            <div style={labelStyle}>Latest submission</div>
            <div style={secondaryTextStyle}>
              {latestSubmissionStatus ?? 'Not queued'}
            </div>
          </div>
        ) : null}
      </div>

      <div style={actionRowStyle}>
        {isDraft ? (
          <Button
            title={finalizing ? 'Finalizing...' : 'Finalize draft claim'}
            variant="primary"
            accent="blue"
            onClick={() => {
              void handleFinalize();
            }}
            disabled={finalizing || queueingSubmission || !canFinalize}
          />
        ) : (
          <>
            <div style={{ ...secondaryTextStyle, color: '#1f2328' }}>
              {getQueueMessage(latestSubmissionStatus)}
            </div>
            {canQueueSubmissionNow ? (
              <Button
                title={
                  queueingSubmission
                    ? 'Queueing submission...'
                    : 'Queue claim submission'
                }
                variant="primary"
                accent="blue"
                onClick={() => {
                  void handleQueueSubmission();
                }}
                disabled={queueingSubmission || finalizing}
              />
            ) : null}
          </>
        )}
      </div>
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier:
    GIFT_AID_CLAIM_BATCH_SUMMARY_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'gift-aid-claim-batch-summary',
  description: 'Compact summary for a Gift Aid claim batch.',
  component: GiftAidClaimBatchSummary,
});
