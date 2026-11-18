import { Status } from 'twenty-ui/primitives/data-display';
import {
  SummaryStrip,
  SummaryStripItem,
} from 'src/front-components/front-component-ui';
import {
  WorkspaceSection,
  WorkspaceText,
} from 'src/front-components/workspace-layout';
import {
  formatDateTime,
  formatSubmissionEnvironment,
  formatSubmissionStatus,
  getLatestSubmission,
  getSubmissionStatusColor,
} from 'src/gift-aid-claims/workspace/claim-display';
import type { GiftAidClaimWorkspaceSectionProps } from 'src/gift-aid-claims/workspace/workspace-section';

export const ClaimSubmissionSection = ({
  workspace,
}: GiftAidClaimWorkspaceSectionProps) => {
  const latestStatus = workspace.batch?.latestSubmissionStatus ?? null;
  const latestSubmission = getLatestSubmission(workspace.submissions);

  if (!latestStatus) {
    return (
      <WorkspaceSection title="Submission status">
        <WorkspaceText>
          No claim submission has been recorded for this batch yet.
        </WorkspaceText>
      </WorkspaceSection>
    );
  }

  return (
    <WorkspaceSection
      title="Submission status"
      headerAction={
        <Status color={getSubmissionStatusColor(latestStatus)} weight="medium">
          {formatSubmissionStatus(latestStatus)}
        </Status>
      }
    >
      {latestSubmission ? (
        <>
          <SummaryStrip>
            <SummaryStripItem
              label="Environment"
              value={formatSubmissionEnvironment(latestSubmission.environment)}
            />
            <SummaryStripItem
              label="Completed"
              value={
                formatDateTime(
                  latestSubmission.completedAt ?? latestSubmission.submittedAt,
                ) ?? 'Pending'
              }
            />
          </SummaryStrip>
          {latestSubmission.failureMessage ? (
            <WorkspaceText>{latestSubmission.failureMessage}</WorkspaceText>
          ) : null}
        </>
      ) : (
        <WorkspaceText>
          A submission attempt has been recorded for this claim.
        </WorkspaceText>
      )}
    </WorkspaceSection>
  );
};
