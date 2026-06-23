import { useEffect, useState } from 'react';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineFrontComponent } from 'twenty-sdk/define';
import { extractQueryRecord } from 'src/core-api/core-api-results';
import {
  AppPath,
  navigate,
  useRecordId,
} from 'twenty-sdk/front-component';
import {
  ActionButton,
  actionRowStyle,
  badgeStyle,
  compactMetaGridStyle,
  compactMetaItemStyle,
  compactWidgetRootStyle,
  labelStyle,
  secondaryTextStyle,
} from 'src/front-components/front-component-ui';

export const GIFT_AID_CLAIM_SUBMISSION_RECORD_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER =
  '0aa4d6b8-59ef-4f5f-a155-0fdcb14318bd';

type GiftAidClaimSubmissionRecordView = {
  id: string;
  name: string;
  status: string | null;
  environment: string | null;
  submittedAt: string | null;
  submittedToHmrcAt: string | null;
  lastPolledAt: string | null;
  completedAt: string | null;
  correlationId: string | null;
  transactionId: string | null;
  failureCode: string | null;
  failureMessage: string | null;
  snapshotHash: string | null;
  giftAidClaimBatch: {
    id: string;
    name: string | null;
    status: string | null;
  } | null;
};

const getSubmissionTone = (status: string | null | undefined) => {
  switch (status) {
    case 'RESPONDED':
      return 'success' as const;
    case 'FAILED':
    case 'TIMED_OUT':
      return 'warning' as const;
    default:
      return 'neutral' as const;
  }
};

const getSubmissionMessage = (status: string | null | undefined) => {
  switch (status) {
    case 'QUEUED':
      return 'This submission record was created automatically and is waiting to progress.';
    case 'BUILT':
      return 'The submission payload was prepared and recorded automatically.';
    case 'ACKNOWLEDGED':
      return 'HMRC acknowledged receipt of this submission attempt.';
    case 'AWAITING_RESPONSE':
      return 'This submission is still waiting for a final HMRC response.';
    case 'RESPONDED':
      return 'This submission has a recorded HMRC response.';
    case 'FAILED':
      return 'This submission attempt failed and is kept for history and troubleshooting.';
    case 'TIMED_OUT':
      return 'This submission timed out and is kept for history and troubleshooting.';
    default:
      return 'This is a system-generated submission history record for Gift Aid claim processing.';
  }
};

const loadSubmissionRecord = async (
  recordId: string,
): Promise<GiftAidClaimSubmissionRecordView | null> => {
  const client = new CoreApiClient();
  const result = await client.query({
    giftAidClaimSubmission: {
      __args: {
        filter: {
          id: { eq: recordId },
        },
      },
      id: true,
      name: true,
      status: true,
      environment: true,
      submittedAt: true,
      submittedToHmrcAt: true,
      lastPolledAt: true,
      completedAt: true,
      correlationId: true,
      transactionId: true,
      failureCode: true,
      failureMessage: true,
      snapshotHash: true,
      giftAidClaimBatch: {
        id: true,
        name: true,
        status: true,
      },
    },
  } as any);

  return (
    extractQueryRecord<GiftAidClaimSubmissionRecordView>(
      result,
      'giftAidClaimSubmission',
    ) ?? null
  );
};

const GiftAidClaimSubmissionRecord = () => {
  const recordId = useRecordId();
  const [record, setRecord] = useState<GiftAidClaimSubmissionRecordView | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const refresh = async () => {
      if (!recordId) {
        setError('No claim submission selected');
        setRecord(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        setRecord(await loadSubmissionRecord(recordId));
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Unable to load claim submission',
        );
        setRecord(null);
      } finally {
        setLoading(false);
      }
    };

    void refresh();
  }, [recordId]);

  if (loading) {
    return <div style={secondaryTextStyle}>Loading claim submission...</div>;
  }

  if (error) {
    return <div style={secondaryTextStyle}>{error}</div>;
  }

  if (!record) {
    return <div style={secondaryTextStyle}>Claim submission not found.</div>;
  }

  const handleOpenClaimBatch = async () => {
    if (!record.giftAidClaimBatch?.id) {
      return;
    }

    await navigate(AppPath.RecordShowPage, {
      objectNameSingular: 'giftAidClaimBatch',
      objectRecordId: record.giftAidClaimBatch.id,
    });
  };

  return (
    <div style={compactWidgetRootStyle}>
      <span style={badgeStyle(getSubmissionTone(record.status))}>
        {record.status ?? 'Unknown'}
      </span>

      <div style={{ ...secondaryTextStyle, color: '#1f2328' }}>
        {getSubmissionMessage(record.status)}
      </div>
      <div style={secondaryTextStyle}>
        This record is created automatically for audit and troubleshooting, not for manual editing.
      </div>

      <div style={actionRowStyle}>
        {record.giftAidClaimBatch?.id ? (
          <ActionButton
            title="Open parent claim batch"
            variant="secondary"
            onClick={() => {
              void handleOpenClaimBatch();
            }}
          />
        ) : null}
      </div>

      <div style={compactMetaGridStyle}>
        <div style={compactMetaItemStyle}>
          <div style={labelStyle}>Environment</div>
          <div style={secondaryTextStyle}>{record.environment ?? 'Unknown'}</div>
        </div>
        <div style={compactMetaItemStyle}>
          <div style={labelStyle}>Claim batch</div>
          <div style={secondaryTextStyle}>
            {record.giftAidClaimBatch?.name ?? 'Not linked'}
          </div>
        </div>
        <div style={compactMetaItemStyle}>
          <div style={labelStyle}>Queued</div>
          <div style={secondaryTextStyle}>{record.submittedAt ?? 'Not recorded'}</div>
        </div>
        <div style={compactMetaItemStyle}>
          <div style={labelStyle}>Sent to HMRC</div>
          <div style={secondaryTextStyle}>
            {record.submittedToHmrcAt ?? 'Not recorded'}
          </div>
        </div>
        <div style={compactMetaItemStyle}>
          <div style={labelStyle}>Last polled</div>
          <div style={secondaryTextStyle}>{record.lastPolledAt ?? 'Not recorded'}</div>
        </div>
        <div style={compactMetaItemStyle}>
          <div style={labelStyle}>Completed</div>
          <div style={secondaryTextStyle}>{record.completedAt ?? 'Not recorded'}</div>
        </div>
      </div>

      {record.failureMessage || record.failureCode ? (
        <div style={compactMetaGridStyle}>
          {record.failureCode ? (
            <div style={compactMetaItemStyle}>
              <div style={labelStyle}>Failure code</div>
              <div style={secondaryTextStyle}>{record.failureCode}</div>
            </div>
          ) : null}
          {record.failureMessage ? (
            <div style={compactMetaItemStyle}>
              <div style={labelStyle}>Failure summary</div>
              <div style={secondaryTextStyle}>{record.failureMessage}</div>
            </div>
          ) : null}
        </div>
      ) : null}

      {(record.transactionId || record.correlationId || record.snapshotHash) ? (
        <div style={compactMetaGridStyle}>
          {record.transactionId ? (
            <div style={compactMetaItemStyle}>
              <div style={labelStyle}>Transaction ID</div>
              <div style={secondaryTextStyle}>{record.transactionId}</div>
            </div>
          ) : null}
          {record.correlationId ? (
            <div style={compactMetaItemStyle}>
              <div style={labelStyle}>Correlation ID</div>
              <div style={secondaryTextStyle}>{record.correlationId}</div>
            </div>
          ) : null}
          {record.snapshotHash ? (
            <div style={compactMetaItemStyle}>
              <div style={labelStyle}>Snapshot hash</div>
              <div style={secondaryTextStyle}>{record.snapshotHash}</div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier:
    GIFT_AID_CLAIM_SUBMISSION_RECORD_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'gift-aid-claim-submission-record',
  description: 'Read-only Gift Aid claim submission history surface.',
  component: GiftAidClaimSubmissionRecord,
});
