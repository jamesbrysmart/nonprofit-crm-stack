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
import { submitGiftAidClaimBatch } from 'src/gift-aid-claims/gift-aid-claim.api';
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
  const [submitting, setSubmitting] = useState(false);

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

  const handleSubmit = async () => {
    if (!recordId) {
      return;
    }

    setSubmitting(true);
    try {
      const result = await submitGiftAidClaimBatch({ batchId: recordId });
      await enqueueSnackbar({
        message: `Gift Aid claim submission ${result.status === 'SENT' ? 'sent' : 'failed'}.`,
        variant: result.status === 'SENT' ? 'success' : 'error',
      });
      await refresh();
    } catch (submitError) {
      await enqueueSnackbar({
        message: submitError instanceof Error ? submitError.message : 'Unable to submit claim batch.',
        variant: 'error',
      });
    } finally {
      setSubmitting(false);
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
        <button
          style={buttonStyle}
          onClick={() => void handleSubmit()}
          disabled={submitting || batch.status === 'SUBMITTED'}
        >
          {submitting ? 'Submitting...' : 'Submit claim batch'}
        </button>
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
