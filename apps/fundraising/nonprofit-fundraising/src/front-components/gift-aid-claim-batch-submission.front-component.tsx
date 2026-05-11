import { defineFrontComponent } from 'twenty-sdk/define';
import {
  badgeStyle,
  compactMetaGridStyle,
  compactMetaItemStyle,
  compactWidgetRootStyle,
  labelStyle,
  secondaryTextStyle,
} from 'src/front-components/gift-staging-review-ui';
import { useGiftAidClaimWorkspace } from 'src/gift-aid-claims/use-gift-aid-claim-workspace';

export const GIFT_AID_CLAIM_BATCH_SUBMISSION_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER =
  '32185bf5-72e0-44e5-a739-44e4ab4eb8db';

const GiftAidClaimBatchSubmission = () => {
  const { workspace, loading, error } = useGiftAidClaimWorkspace();

  if (loading) {
    return <div style={secondaryTextStyle}>Loading submission status...</div>;
  }

  if (error) {
    return <div style={secondaryTextStyle}>{error}</div>;
  }

  if (!workspace?.batch) {
    return <div style={secondaryTextStyle}>Claim batch not found.</div>;
  }

  const latestSubmission = workspace.submissions[0] ?? null;
  const latestSubmissionStatus = workspace.batch.latestSubmissionStatus ?? null;

  if (!latestSubmissionStatus) {
    return (
      <div style={compactWidgetRootStyle}>
        <div style={{ ...secondaryTextStyle, color: '#1f2328' }}>
          No claim submission has been recorded for this batch yet.
        </div>
      </div>
    );
  }

  const tone =
    latestSubmissionStatus === 'FAILED' || latestSubmissionStatus === 'TIMED_OUT'
      ? 'warning'
      : latestSubmissionStatus === 'RESPONDED'
        ? 'success'
        : 'neutral';

  return (
    <div style={compactWidgetRootStyle}>
      <span style={badgeStyle(tone)}>{latestSubmissionStatus}</span>
      <div style={{ ...secondaryTextStyle, color: '#1f2328' }}>
        Latest claim submission
      </div>
      {latestSubmission ? (
        <>
          <div style={compactMetaGridStyle}>
            <div style={compactMetaItemStyle}>
              <div style={labelStyle}>Environment</div>
              <div style={secondaryTextStyle}>{latestSubmission.environment}</div>
            </div>
            <div style={compactMetaItemStyle}>
              <div style={labelStyle}>Completed</div>
              <div style={secondaryTextStyle}>
                {latestSubmission.completedAt ??
                  latestSubmission.submittedAt ??
                  'Pending'}
              </div>
            </div>
          </div>
          {latestSubmission.failureMessage ? (
            <div style={secondaryTextStyle}>{latestSubmission.failureMessage}</div>
          ) : null}
        </>
      ) : (
        <div style={secondaryTextStyle}>
          A submission attempt has been recorded for this claim.
        </div>
      )}
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier:
    GIFT_AID_CLAIM_BATCH_SUBMISSION_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'gift-aid-claim-batch-submission',
  description: 'Minimal submission status for a Gift Aid claim batch.',
  component: GiftAidClaimBatchSubmission,
});
