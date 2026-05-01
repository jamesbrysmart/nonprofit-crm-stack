import { useEffect, useState, type CSSProperties } from 'react';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineFrontComponent } from 'twenty-sdk/define';
import {
  AppPath,
  enqueueSnackbar,
  navigate,
  useRecordId,
} from 'twenty-sdk/front-component';
import { Button } from 'twenty-sdk/ui';
import {
  finalizeGiftAidClaimBatch,
  queueGiftAidClaimSubmission,
} from 'src/gift-aid-claims/gift-aid-claim.api';
import { loadGiftAidClaimWorkspace } from 'src/gift-aid-claims/gift-aid-claim-batch';
import type { GiftAidClaimWorkspaceRecord } from 'src/gift-aid-claims/gift-aid-claim.types';

export const GIFT_AID_CLAIM_BATCH_RECORD_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER =
  'ab33c655-7558-4d0a-a5b9-c1846fc40b4c';

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

const labelStyle: CSSProperties = {
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  color: '#57606a',
};

const valueStyle: CSSProperties = {
  fontSize: '15px',
  color: '#1f2328',
};

const metricValueStyle: CSSProperties = {
  fontSize: '20px',
  fontWeight: 600,
  color: '#1f2328',
};

const actionRowStyle: CSSProperties = {
  display: 'flex',
  gap: '10px',
  flexWrap: 'wrap',
};

const actionGridStyle: CSSProperties = {
  display: 'grid',
  gap: '10px',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
};

type GiftQueueScope =
  | 'claim'
  | 'claim-blockers'
  | 'needs-review'
  | 'needs-review-outside-claim';

const formatAmount = (
  amount:
    | {
        amountMicros?: number | null;
        currencyCode?: string | null;
      }
    | null
    | undefined,
) => {
  if (!amount || typeof amount.amountMicros !== 'number') {
    return 'Unknown amount';
  }

  return `${amount.currencyCode ?? 'GBP'} ${(amount.amountMicros / 1_000_000).toFixed(2)}`;
};

const buildGiftLabel = (gift: {
  name?: string | null;
  donorFirstName?: string | null;
  donorLastName?: string | null;
  donorEmail?: string | null;
}) => {
  const firstName = gift.donorFirstName?.trim() ?? '';
  const lastName = gift.donorLastName?.trim() ?? '';
  const donorName = `${firstName} ${lastName}`.trim();

  if (gift.name?.trim()) {
    return gift.name.trim();
  }

  if (donorName !== '') {
    return donorName;
  }

  if (gift.donorEmail?.trim()) {
    return gift.donorEmail.trim();
  }

  return 'Unnamed gift';
};

const buildGiftQueryParams = (
  batchId: string,
  scope: GiftQueueScope,
): Record<string, string | string[]> => {
  const queryParams: Record<string, string | string[]> = {};

  switch (scope) {
    case 'claim':
      queryParams['filter[giftAidClaimBatch][IS]'] = [batchId];
      break;
    case 'claim-blockers':
      queryParams['filter[giftAidClaimBatch][IS]'] = [batchId];
      queryParams['filter[giftAidStatus][IS_NOT]'] = ['CLAIMABLE'];
      break;
    case 'needs-review':
      queryParams['filter[giftAidStatus][IS]'] = ['NEEDS_REVIEW'];
      break;
    case 'needs-review-outside-claim':
      queryParams['filter[giftAidStatus][IS]'] = ['NEEDS_REVIEW'];
      queryParams['filter[giftAidClaimBatch][IS_NOT]'] = [batchId];
      break;
    default:
      break;
  }

  return queryParams;
};

const loadWorkspace = async (
  recordId: string,
): Promise<GiftAidClaimWorkspaceRecord> => {
  const client = new CoreApiClient();
  return await loadGiftAidClaimWorkspace(client, recordId);
};

const GiftAidClaimBatchRecord = () => {
  const recordId = useRecordId();
  const [workspace, setWorkspace] = useState<GiftAidClaimWorkspaceRecord | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [finalizing, setFinalizing] = useState(false);
  const [queueingSubmission, setQueueingSubmission] = useState(false);

  useEffect(() => {
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
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Unable to load claim workspace',
        );
        setWorkspace(null);
      } finally {
        setLoading(false);
      }
    };

    void refresh();
  }, [recordId]);

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
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Unable to load claim workspace',
      );
      setWorkspace(null);
    } finally {
      setLoading(false);
    }
  };

  const handleFinalize = async () => {
    if (!recordId) {
      return;
    }

    setFinalizing(true);
    try {
      const result = await finalizeGiftAidClaimBatch({ batchId: recordId });
      await enqueueSnackbar({
        message: `Draft claim finalized internally at ${result.submittedAt}.`,
        variant: 'success',
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
          ? 'Gift Aid claim payload built and recorded.'
          : result.status === 'RESPONDED'
            ? 'ETS terminal response recorded for this claim submission.'
            : result.status === 'TIMED_OUT'
              ? 'ETS accepted the submission, but no terminal response arrived within the polling limit.'
              : 'Gift Aid claim submission failed.';

      await enqueueSnackbar({
        message,
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

  const handleOpenGiftQueue = async (scope: GiftQueueScope) => {
    if (!recordId) {
      return;
    }

    await navigate(
      AppPath.RecordIndexPage,
      {
        objectNamePlural: 'gifts',
      },
      buildGiftQueryParams(recordId, scope),
    );
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
  const isDraft = batch.status === 'DRAFT';
  const canQueueSubmission = batch.status === 'SUBMITTED';
  const claimGiftCount = workspace.gifts.length;
  const claimBlockingCount = workspace.gifts.filter(
    (gift) => gift.giftAidStatus !== 'CLAIMABLE',
  ).length;
  const needsReviewOutsideClaimCount = workspace.needsReviewGifts.length;
  const previewClaimGifts = workspace.gifts.slice(0, 3);
  const previewNeedsReviewGifts = workspace.needsReviewGifts.slice(0, 3);

  return (
    <div
      style={{
        padding: '20px',
        fontFamily: 'sans-serif',
        display: 'grid',
        gap: '16px',
      }}
    >
      <div style={cardStyle}>
        <div style={labelStyle}>
          {isDraft ? 'Current draft claim' : 'Submitted claim'}
        </div>
        <div style={{ fontSize: '20px', fontWeight: 600 }}>{batch.name}</div>
        <div style={textStyle}>
          {isDraft
            ? 'This workspace centers on the current draft claim and the final gifts that still need Gift Aid follow-up before they can join it.'
            : 'This claim has been finalized internally and should now be treated as historical claim context rather than active draft work.'}
        </div>
        <div
          style={{
            display: 'grid',
            gap: '12px',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          }}
        >
          <div>
            <div style={labelStyle}>Status</div>
            <div style={valueStyle}>{batch.status ?? 'Unknown'}</div>
          </div>
          <div>
            <div style={labelStyle}>Gift count</div>
            <div style={valueStyle}>{batch.giftCount ?? 0}</div>
          </div>
          <div>
            <div style={labelStyle}>Total amount</div>
            <div style={valueStyle}>{formatAmount(batch.totalAmount)}</div>
          </div>
          <div>
            <div style={labelStyle}>Blocking issues</div>
            <div style={valueStyle}>{batch.blockingIssueCount ?? 0}</div>
          </div>
        </div>
        {isDraft ? (
          <div style={{ display: 'grid', gap: '8px' }}>
            <div style={textStyle}>
              Finalizing closes this draft claim and prepares the next current
              draft. This is an internal workflow step, not HMRC transmission.
            </div>
            <div style={actionRowStyle}>
              <Button
                title={finalizing ? 'Finalizing...' : 'Finalize draft claim'}
                variant="primary"
                accent="blue"
                onClick={() => {
                  void handleFinalize();
                }}
                disabled={
                  finalizing ||
                  queueingSubmission ||
                  (batch.giftCount ?? 0) === 0 ||
                  batch.hasBlockingIssues === true
                }
              />
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '8px' }}>
            <div style={textStyle}>
              This claim is finalized internally. HMRC test submission is a
              separate probe that should run only from this frozen claim state.
            </div>
            <div style={actionRowStyle}>
              <Button
                title={
                  queueingSubmission
                    ? 'Queueing submission...'
                    : 'Queue HMRC test submission'
                }
                variant="primary"
                accent="blue"
                onClick={() => {
                  void handleQueueSubmission();
                }}
                disabled={queueingSubmission || finalizing || !canQueueSubmission}
              />
            </div>
          </div>
        )}
      </div>

      <div
        style={{
          display: 'grid',
          gap: '12px',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        }}
      >
        <div style={cardStyle}>
          <div style={labelStyle}>In this claim</div>
          <div style={metricValueStyle}>{claimGiftCount}</div>
        </div>
        <div style={cardStyle}>
          <div style={labelStyle}>Blocking in claim</div>
          <div style={metricValueStyle}>{claimBlockingCount}</div>
        </div>
        <div style={cardStyle}>
          <div style={labelStyle}>Needs review outside claim</div>
          <div style={metricValueStyle}>{needsReviewOutsideClaimCount}</div>
        </div>
      </div>

      <div style={cardStyle}>
        <div style={{ display: 'grid', gap: '6px' }}>
          <div style={labelStyle}>Open gift worklists</div>
          <div style={textStyle}>
            Use native gift views for the real Gift Aid review work. This page
            should stay as the control surface for the current claim rather than
            trying to become the full review workspace.
          </div>
        </div>
        <div style={actionGridStyle}>
          <Button
            title={`Open ${claimGiftCount} gifts in this claim`}
            variant="secondary"
            onClick={() => {
              void handleOpenGiftQueue('claim');
            }}
          />
          <Button
            title={`Open ${claimBlockingCount} blocking gifts in this claim`}
            variant="secondary"
            onClick={() => {
              void handleOpenGiftQueue('claim-blockers');
            }}
          />
          <Button
            title={`Open ${needsReviewOutsideClaimCount} needs-review gifts outside this claim`}
            variant="secondary"
            onClick={() => {
              void handleOpenGiftQueue('needs-review-outside-claim');
            }}
          />
          <Button
            title="Open all needs-review gifts"
            variant="secondary"
            onClick={() => {
              void handleOpenGiftQueue('needs-review');
            }}
          />
        </div>
      </div>

      <div style={cardStyle}>
        <div style={labelStyle}>Submission history</div>
        <div style={textStyle}>
          Durable submission records stay separate from claim finalization so
          the HMRC probe can evolve without changing the claim lifecycle.
        </div>
        {workspace.submissions.length === 0 ? (
          <div style={textStyle}>
            No HMRC submissions have been recorded for this claim batch yet.
          </div>
        ) : (
          workspace.submissions.map((submission) => (
            <div
              key={submission.id}
              style={{
                display: 'grid',
                gap: '4px',
                paddingBottom: '8px',
                borderBottom: '1px solid #f0f0f0',
              }}
            >
              <div>{submission.name}</div>
              <div style={textStyle}>
                {submission.status} · {submission.environment} ·{' '}
                {submission.completedAt ?? submission.submittedAt ?? 'Pending'}
              </div>
              {submission.transactionId ? (
                <div style={textStyle}>Transaction: {submission.transactionId}</div>
              ) : null}
              {submission.snapshotHash ? (
                <div style={textStyle}>Snapshot hash: {submission.snapshotHash}</div>
              ) : null}
              {submission.failureMessage ? (
                <div style={textStyle}>Failure: {submission.failureMessage}</div>
              ) : null}
            </div>
          ))
        )}
      </div>

      <div style={cardStyle}>
        <div style={labelStyle}>Quick claim scan</div>
        <div style={textStyle}>
          Keep this lightweight. For meaningful correction or review work, open
          one of the native gift queues above.
        </div>
        {claimGiftCount === 0 ? (
          <div style={textStyle}>
            No claimable gifts are currently attached to this draft claim.
          </div>
        ) : (
          previewClaimGifts.map((gift) => (
            <div
              key={gift.id}
              style={{
                display: 'grid',
                gap: '4px',
                paddingBottom: '8px',
                borderBottom: '1px solid #f0f0f0',
              }}
            >
              <div>{buildGiftLabel(gift)}</div>
              <div style={textStyle}>
                {gift.giftAidStatus ?? 'Unknown'} ·{' '}
                {gift.giftAidReasonCode ?? 'No reason code'} ·{' '}
                {formatAmount(gift.amount)}
              </div>
            </div>
          ))
        )}
        {claimGiftCount > previewClaimGifts.length ? (
          <div style={textStyle}>
            {claimGiftCount - previewClaimGifts.length} more gifts are in this
            claim.
          </div>
        ) : null}
      </div>

      <div style={cardStyle}>
        <div style={labelStyle}>Needs review</div>
        <div style={textStyle}>
          These are final gifts with `giftAidStatus = NEEDS_REVIEW` that are not
          currently attached to the draft claim.
        </div>
        {needsReviewOutsideClaimCount === 0 ? (
          <div style={textStyle}>
            No final gifts currently sit outside the draft claim in needs review.
          </div>
        ) : (
          previewNeedsReviewGifts.map((gift) => (
            <div
              key={gift.id}
              style={{
                display: 'grid',
                gap: '4px',
                paddingBottom: '8px',
                borderBottom: '1px solid #f0f0f0',
              }}
            >
              <div>{buildGiftLabel(gift)}</div>
              <div style={textStyle}>
                {gift.giftAidReasonCode ?? 'No reason code'} ·{' '}
                {formatAmount(gift.amount)}
              </div>
              <div style={textStyle}>
                Declaration:{' '}
                {gift.giftAidDeclaration?.id
                  ? gift.giftAidDeclaration.id
                  : 'Not linked'}
              </div>
            </div>
          ))
        )}
        {needsReviewOutsideClaimCount > previewNeedsReviewGifts.length ? (
          <div style={textStyle}>
            {needsReviewOutsideClaimCount - previewNeedsReviewGifts.length} more
            needs-review gifts sit outside this claim.
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default defineFrontComponent({
  name: 'Gift Aid Claim Batch Record',
  universalIdentifier:
    GIFT_AID_CLAIM_BATCH_RECORD_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  component: GiftAidClaimBatchRecord,
});
