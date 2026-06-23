import { useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { enqueueSnackbar } from 'twenty-sdk/front-component';
import {
  ActionButton,
  actionRowStyle,
  compactWidgetRootStyle,
  secondaryTextStyle,
} from 'src/front-components/front-component-ui';
import {
  finalizeGiftAidClaimBatch,
  queueGiftAidClaimSubmission,
} from 'src/gift-aid-claims/gift-aid-claim.api';
import { useGiftAidClaimWorkspace } from 'src/gift-aid-claims/use-gift-aid-claim-workspace';

export const GIFT_AID_CLAIM_BATCH_ACTIONS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER =
  'fd3b6b63-8d3e-4d92-8e7f-4a943d3de44f';

const GiftAidClaimBatchActions = () => {
  const { recordId, workspace, loading, error, refresh } =
    useGiftAidClaimWorkspace();
  const [finalizing, setFinalizing] = useState(false);
  const [queueingSubmission, setQueueingSubmission] = useState(false);

  if (loading) {
    return <div style={secondaryTextStyle}>Loading claim actions...</div>;
  }

  if (error) {
    return <div style={secondaryTextStyle}>{error}</div>;
  }

  if (!workspace?.batch || !recordId) {
    return <div style={secondaryTextStyle}>Claim batch not found.</div>;
  }

  const batch = workspace.batch;
  const isDraft = batch.status === 'DRAFT';
  const canFinalize =
    (batch.giftCount ?? 0) > 0 && batch.hasBlockingIssues !== true;

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
        message:
          queueError instanceof Error
            ? queueError.message
            : 'Unable to queue claim submission.',
        variant: 'error',
      });
    } finally {
      setQueueingSubmission(false);
    }
  };

  return (
    <div style={compactWidgetRootStyle}>
      {isDraft ? (
        <>
          <div style={{ ...secondaryTextStyle, color: '#1f2328' }}>
            {canFinalize
              ? 'Finalize this draft when you are ready to freeze it.'
              : (batch.giftCount ?? 0) === 0
                ? 'Add claimable gifts before finalizing this draft.'
                : 'Resolve the blocking gifts before finalizing this draft.'}
          </div>
          <div style={actionRowStyle}>
            <ActionButton
              title={finalizing ? 'Finalizing...' : 'Finalize draft claim'}
              variant="primary"
              accent="blue"
              onClick={() => {
                void handleFinalize();
              }}
              disabled={finalizing || queueingSubmission || !canFinalize}
            />
          </div>
        </>
      ) : (
        <>
          <div style={{ ...secondaryTextStyle, color: '#1f2328' }}>
            Queue the submission when you are ready to continue from this finalized claim.
          </div>
          <div style={actionRowStyle}>
            <ActionButton
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
          </div>
        </>
      )}
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier:
    GIFT_AID_CLAIM_BATCH_ACTIONS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'gift-aid-claim-batch-actions',
  description: 'Primary actions for a Gift Aid claim batch.',
  component: GiftAidClaimBatchActions,
});
