import { useEffect, useState, type CSSProperties } from 'react';
import { CoreApiClient } from 'twenty-client-sdk/core';
import {
  defineFrontComponent,
  enqueueSnackbar,
  useRecordId,
} from 'twenty-sdk';
import {
  loadGiftAidClaimWorkspace,
} from 'src/gift-aid-claims/gift-aid-claim-batch';
import {
  finalizeGiftAidClaimBatch,
  queueGiftAidClaimSubmission,
} from 'src/gift-aid-claims/gift-aid-claim.api';
import type { GiftAidClaimWorkspaceRecord } from 'src/gift-aid-claims/gift-aid-claim.types';

export const GIFT_AID_CLAIM_BATCH_RECORD_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER =
  '04bfb604-ef05-4e1c-9d8f-e8fd00dcb9db';

const cardStyle: CSSProperties = {
  border: '1px solid #d8dee4',
  borderRadius: '10px',
  padding: '16px',
  display: 'grid',
  gap: '10px',
  background: '#ffffff',
};

const textStyle: CSSProperties = {
  fontSize: '13px',
  color: '#57606a',
  lineHeight: 1.5,
};

const buttonStyle: CSSProperties = {
  borderRadius: '6px',
  padding: '10px 14px',
  font: 'inherit',
  cursor: 'pointer',
  border: 'none',
  background: '#1f6feb',
  color: '#ffffff',
};

const loadWorkspace = async (recordId: string): Promise<GiftAidClaimWorkspaceRecord> => {
  const client = new CoreApiClient();
  return await loadGiftAidClaimWorkspace(client, recordId);
};

const GiftAidClaimBatchRecord = () => {
  const recordId = useRecordId();
  const [workspace, setWorkspace] = useState<GiftAidClaimWorkspaceRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [finalizing, setFinalizing] = useState(false);
  const [queueingSubmission, setQueueingSubmission] = useState(false);

  const refresh = async () => {
    if (!recordId) {
      setError('No claim batch selected');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      setWorkspace(await loadWorkspace(recordId));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load claim workspace');
      setWorkspace(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, [recordId]);

  const handleFinalize = async () => {
    if (!recordId) {
      return;
    }

    setFinalizing(true);
    try {
      const result = await finalizeGiftAidClaimBatch({ batchId: recordId });
      await enqueueSnackbar({
        message: `Gift Aid claim batch finalized at ${result.submittedAt}.`,
        variant: 'success',
      });
      await refresh();
    } catch (finalizeError) {
      await enqueueSnackbar({
        message:
          finalizeError instanceof Error
            ? finalizeError.message
            : 'Unable to finalize claim batch.',
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
          ? 'Gift Aid claim payload built and recorded.'
          : result.status === 'SENT'
            ? 'Gift Aid claim submission sent.'
            : 'Gift Aid claim submission failed.';
      await enqueueSnackbar({
        message,
        variant: result.status === 'FAILED' ? 'error' : 'success',
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

  if (loading) {
    return <div style={textStyle}>Loading Gift Aid claim workspace...</div>;
  }

  if (error) {
    return <div style={textStyle}>{error}</div>;
  }

  if (!workspace?.batch) {
    return <div style={textStyle}>Claim batch not found.</div>;
  }

  const batch = workspace.batch;

  const canFinalize = batch.status === 'DRAFT';
  const canQueueSubmission = batch.status === 'SUBMITTED';

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', display: 'grid', gap: '16px' }}>
      <div style={cardStyle}>
        <div style={{ fontSize: '20px', fontWeight: 600 }}>{batch.name}</div>
        <div style={textStyle}>
          Gift Aid claim workspace and bounded submission probe inside Twenty apps.
        </div>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div>Status: {batch.status}</div>
          <div>Gift count: {batch.giftCount ?? 0}</div>
          <div>Blocking issues: {batch.blockingIssueCount ?? 0}</div>
          <div>Submitted at: {batch.submittedAt ?? 'Not submitted'}</div>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            style={buttonStyle}
            onClick={() => void handleFinalize()}
            disabled={finalizing || queueingSubmission || !canFinalize}
          >
            {finalizing ? 'Finalizing...' : 'Finalize claim'}
          </button>
          <button
            style={buttonStyle}
            onClick={() => void handleQueueSubmission()}
            disabled={queueingSubmission || finalizing || !canQueueSubmission}
          >
            {queueingSubmission ? 'Queueing...' : 'Queue HMRC test submission'}
          </button>
        </div>
      </div>

      <div style={cardStyle}>
        <div style={{ fontWeight: 600 }}>Claim gifts</div>
        {workspace.gifts.length === 0 ? (
          <div style={textStyle}>No gifts are currently attached to this claim batch.</div>
        ) : (
          workspace.gifts.map((gift) => (
            <div key={gift.id} style={{ display: 'grid', gap: '4px', paddingBottom: '8px', borderBottom: '1px solid #f0f0f0' }}>
              <div>{gift.name ?? gift.id}</div>
              <div style={textStyle}>
                {gift.giftAidStatus ?? 'Unknown'}{gift.giftAidReasonCode ? ` · ${gift.giftAidReasonCode}` : ''}
              </div>
            </div>
          ))
        )}
      </div>

      <div style={cardStyle}>
        <div style={{ fontWeight: 600 }}>Submission history</div>
        {workspace.submissions.length === 0 ? (
          <div style={textStyle}>No submissions have been recorded for this claim batch yet.</div>
        ) : (
          workspace.submissions.map((submission) => (
            <div key={submission.id} style={{ display: 'grid', gap: '4px', paddingBottom: '8px', borderBottom: '1px solid #f0f0f0' }}>
              <div>{submission.name}</div>
              <div style={textStyle}>
                {submission.status} · {submission.environment} · {submission.completedAt ?? submission.submittedAt ?? 'Pending'}
              </div>
              {submission.transactionId ? (
                <div style={textStyle}>Transaction: {submission.transactionId}</div>
              ) : null}
              {submission.snapshotHash ? (
                <div style={textStyle}>Snapshot hash: {submission.snapshotHash}</div>
              ) : null}
              {submission.failureMessage ? <div style={textStyle}>Failure: {submission.failureMessage}</div> : null}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default defineFrontComponent({
  name: 'Gift Aid Claim Batch Record',
  universalIdentifier: GIFT_AID_CLAIM_BATCH_RECORD_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  component: GiftAidClaimBatchRecord,
});
