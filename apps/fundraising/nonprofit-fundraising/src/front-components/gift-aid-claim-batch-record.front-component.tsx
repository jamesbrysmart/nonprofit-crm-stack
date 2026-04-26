import { useEffect, useState, type CSSProperties } from 'react';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineFrontComponent } from 'twenty-sdk/define';
import { enqueueSnackbar, useRecordId } from 'twenty-sdk/front-component';
import { Button } from 'twenty-sdk/ui';
import { submitGiftAidClaimBatch } from 'src/gift-aid-claims/gift-aid-claim.api';
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
  const [submitting, setSubmitting] = useState(false);

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

  const handleSubmit = async () => {
    if (!recordId) {
      return;
    }

    setSubmitting(true);
    try {
      await submitGiftAidClaimBatch({ batchId: recordId });
      await enqueueSnackbar({
        message:
          'Draft claim finalized internally. This does not imply HMRC transmission.',
        variant: 'success',
      });
      await refresh();
    } catch (submitError) {
      await enqueueSnackbar({
        message:
          submitError instanceof Error
            ? submitError.message
            : 'Unable to finalize draft claim.',
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
  const isDraft = batch.status === 'DRAFT' || batch.status === 'SUBMISSION_FAILED';

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
            <div>
              <Button
                title={submitting ? 'Finalizing...' : 'Finalize draft claim'}
                variant="primary"
                accent="blue"
                onClick={() => {
                  void handleSubmit();
                }}
                disabled={
                  submitting ||
                  (batch.giftCount ?? 0) === 0 ||
                  batch.hasBlockingIssues === true
                }
              />
            </div>
          </div>
        ) : null}
      </div>

      <div style={cardStyle}>
        <div style={labelStyle}>Draft claim gifts</div>
        {workspace.gifts.length === 0 ? (
          <div style={textStyle}>
            No claimable gifts are currently attached to this draft claim.
          </div>
        ) : (
          workspace.gifts.map((gift) => (
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
      </div>

      <div style={cardStyle}>
        <div style={labelStyle}>Needs review</div>
        <div style={textStyle}>
          These are final gifts with `giftAidStatus = NEEDS_REVIEW` that are not
          currently attached to the draft claim.
        </div>
        {workspace.needsReviewGifts.length === 0 ? (
          <div style={textStyle}>
            No final gifts currently sit outside the draft claim in needs review.
          </div>
        ) : (
          workspace.needsReviewGifts.map((gift) => (
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
