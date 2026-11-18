import { AppPath, navigate } from 'twenty-sdk/front-component';
import { Status } from 'twenty-ui/primitives/data-display';
import type { ThemeColor } from 'twenty-ui/theme';
import {
  ActionButton,
  SummaryStrip,
  SummaryStripItem,
  actionRowStyle,
} from 'src/front-components/front-component-ui';
import {
  WorkspaceSection,
  WorkspaceText,
} from 'src/front-components/workspace-layout';
import { isGiftAidEnabled } from 'src/gift-aid/gift-aid-config';
import {
  deriveReviewIssues,
  deriveReviewState,
} from 'src/gift-staging-review/gift-staging-review.model';
import type { GiftStagingWorkspaceSectionProps } from 'src/gift-staging-review/workspace/workspace-section';

const REVIEW_TONE_COLORS: Record<
  ReturnType<typeof deriveReviewState>['tone'],
  ThemeColor
> = {
  success: 'green',
  neutral: 'gray',
  warning: 'amber',
  danger: 'red',
};

export const StagingSummarySection = ({
  record,
}: GiftStagingWorkspaceSectionProps) => {
  const reviewState = deriveReviewState(record);
  const reviewIssues = deriveReviewIssues(record);
  const hasRecurringGiving = record.providerAgreementId !== '';
  const hasGiftAidRequest = isGiftAidEnabled() && record.giftAidRequested;
  const reviewNotes = [
    hasRecurringGiving ? 'Recurring giving' : '',
    hasGiftAidRequest ? 'Gift Aid' : '',
  ]
    .filter((value) => value !== '')
    .join(' and ');
  const hasCommittedGift =
    record.processingStatus === 'PROCESSED' && record.committedGiftId !== '';

  return (
    <WorkspaceSection
      title="Review summary"
      headerAction={
        <Status
          color={REVIEW_TONE_COLORS[reviewState.tone]}
          weight="medium"
        >
          {reviewState.title}
        </Status>
      }
    >
      <WorkspaceText color="primary">{reviewState.reason}</WorkspaceText>

      {reviewIssues.length > 1 ? (
        <>
          <WorkspaceText>Blocking issues</WorkspaceText>
          {reviewIssues.map((issue) => (
            <WorkspaceText key={issue.code}>{issue.label}</WorkspaceText>
          ))}
        </>
      ) : null}

      <SummaryStrip>
        <SummaryStripItem label="Amount" value={record.amountDisplay} />
        <SummaryStripItem
          label="Batch"
          value={record.giftBatchId === '' ? 'Not in a batch.' : record.giftBatchName}
        />
        {record.appealName !== '' ? (
          <SummaryStripItem label="Appeal" value={record.appealName} />
        ) : null}
        <SummaryStripItem
          label="Gift record"
          value={hasCommittedGift ? 'Created.' : 'Not created yet.'}
        />
        {reviewNotes !== '' ? (
          <SummaryStripItem label="Review notes" value={`${reviewNotes} noted.`} />
        ) : null}
      </SummaryStrip>

      {hasCommittedGift || record.giftBatchId !== '' ? (
        <div style={actionRowStyle}>
          {hasCommittedGift ? (
            <ActionButton
              title="Open gift record"
              variant="primary"
              onClick={() => {
                void navigate(
                  AppPath.RecordShowPage,
                  { objectNameSingular: 'gift', objectRecordId: record.committedGiftId },
                  {},
                );
              }}
            />
          ) : null}
          {record.giftBatchId !== '' ? (
            <ActionButton
              title="Go to batch"
              variant="secondary"
              onClick={() => {
                void navigate(AppPath.RecordShowPage, {
                  objectNameSingular: 'giftBatch',
                  objectRecordId: record.giftBatchId,
                });
              }}
            />
          ) : null}
        </div>
      ) : null}
    </WorkspaceSection>
  );
};
