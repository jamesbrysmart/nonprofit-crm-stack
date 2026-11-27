import { useEffect, useState } from 'react';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { RestApiClient } from 'twenty-client-sdk/rest';
import { defineFrontComponent } from 'twenty-sdk/define';
import {
  getApplicationVariable,
  openCommandConfirmationModal,
  useRecordId,
} from 'twenty-sdk/front-component';
import { MainButton } from 'twenty-ui/components/input';
import { GIFT_AID_CLAIM_ACTIONS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { loadClaimBatch } from 'src/gift-aid-claims/gift-aid-claim-batch.queries';
import type {
  FinalizeGiftAidClaimBatchResponse,
  GiftAidClaimBatchRecord,
  QueueGiftAidClaimSubmissionResponse,
} from 'src/gift-aid-claims/gift-aid-claim.types';

const ClaimActions = () => {
  const batchId = useRecordId();
  const [claim, setClaim] = useState<GiftAidClaimBatchRecord>();
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!batchId) return;
    let disposed = false;
    setClaim(undefined);
    setError('');
    setFeedback('');
    void loadClaimBatch(new CoreApiClient(), batchId)
      .then((batch) => {
        if (disposed) return;
        if (batch) setClaim(batch);
        else setError('Claim not found.');
      })
      .catch(() => {
        if (!disposed) setError('The claim could not be loaded.');
      });
    return () => {
      disposed = true;
    };
  }, [batchId]);

  if (!batchId) return null;
  const activeClaim = claim?.id === batchId ? claim : undefined;
  const isDraft = activeClaim?.status === 'DRAFT';
  const latestStatus = activeClaim?.latestSubmissionStatus;
  const canSubmit =
    activeClaim?.status === 'FINALIZED' &&
    getApplicationVariable('HMRC_SUBMISSION_ENABLED')?.toLowerCase() === 'true' &&
    (!latestStatus || latestStatus === 'FAILED' || latestStatus === 'TIMED_OUT');

  const runAction = async () => {
    if (!activeClaim || busy || (!isDraft && !canSubmit)) return;
    setBusy(true);
    setError('');
    setFeedback('');
    try {
      const decision = await openCommandConfirmationModal({
        title: isDraft ? 'Finalize this claim?' : 'Queue this claim for submission?',
        subtitle: isDraft
          ? 'Twenty will check every gift in the draft before finalizing the claim.'
          : 'This creates a submission attempt and records the result in the claim history.',
        confirmButtonText: isDraft ? 'Finalize claim' : 'Queue submission',
      });
      if (decision !== 'confirm') return;

      const client = new RestApiClient();
      const body = { batchId: activeClaim.id };
      if (isDraft) {
        const result = await client.post<FinalizeGiftAidClaimBatchResponse>(
          '/s/gift-aid-claims/finalize-claim-batch',
          body,
        );
        setClaim((current) => current?.id === activeClaim.id ? { ...current, status: result.status } : current);
        setFeedback(result.warningMessage ?? 'Claim finalized.');
      } else {
        const result = await client.post<QueueGiftAidClaimSubmissionResponse>(
          '/s/gift-aid-claims/queue-claim-submission',
          body,
        );
        setClaim((current) => current?.id === activeClaim.id
          ? { ...current, latestSubmissionStatus: result.status }
          : current);
        setFeedback(result.warningMessage ?? 'Submission attempt recorded.');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'The claim action could not be completed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {(isDraft || canSubmit) && (
        <MainButton disabled={busy} onClick={() => void runAction()}>
          {isDraft ? 'Finalize claim' : 'Queue submission'}
        </MainButton>
      )}
      {!activeClaim && !error && <p role="status">Loading claim…</p>}
      {error && <p role="alert">{error}</p>}
      {feedback && <p role="status">{feedback}</p>}
    </>
  );
};

export default defineFrontComponent({
  universalIdentifier: GIFT_AID_CLAIM_ACTIONS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'gift-aid-claim-actions',
  component: ClaimActions,
});
