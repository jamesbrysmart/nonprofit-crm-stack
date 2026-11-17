import { closeSidePanel } from 'twenty-sdk/front-component';
import { Callout } from 'twenty-ui/components/feedback';
import { Text } from 'twenty-ui/primitives/typography';
import type { ManualGiftDuplicateMatch } from 'src/manual-gift-entry/manual-gift-entry.types';
import { ActionButton } from 'src/front-components/front-component-ui';
import type { NewGiftController } from 'src/manual-gift-entry/new-gift-section.types';
import { formatAmountMicros } from 'src/manual-gift-entry/new-gift-support';

const DUPLICATE_MATCH_LIST_STYLE = {
  display: 'grid',
  gap: 8,
  marginTop: 8,
} as const;

export const DuplicateGiftWarning = ({
  controller,
}: {
  controller: NewGiftController;
}) => {
  const {
    duplicateGiftWarningVisible,
    duplicateGiftCheckResult,
    submitting,
    handleSubmit,
  } = controller;

  if (!duplicateGiftWarningVisible || !duplicateGiftCheckResult) {
    return null;
  }

  return (
    <Callout
      status="warning"
      title="Possible duplicate gift"
      description={
        <>
          A gift with the same donor or company, amount, and date already
          exists or is waiting to be processed. This is a warning only. You can
          still create the gift if it is genuinely separate.
          <span style={DUPLICATE_MATCH_LIST_STYLE}>
            {duplicateGiftCheckResult.matches.map(
              (match: ManualGiftDuplicateMatch) => (
                <Text
                  key={`${match.kind}:${match.id}`}
                  render={<span />}
                  style={{ display: 'grid' }}
                >
                  <Text render={<span />} weight="medium">
                    {match.name}
                  </Text>
                  <Text render={<span />} color="secondary">
                    {match.kind === 'COMMITTED_GIFT'
                      ? 'Committed gift'
                      : 'Staged gift'}{' '}
                    · {match.giftDate} ·{' '}
                    {formatAmountMicros(match.amountMicros, match.currencyCode)}
                    {' · '}
                    {match.status ?? 'Status unavailable'}
                    {match.giftBatchName
                      ? ` · Batch: ${match.giftBatchName}`
                      : ''}
                  </Text>
                </Text>
              ),
            )}
          </span>
        </>
      }
      action={
        <Callout.Action
          disabled={submitting}
          onClick={() => {
            void handleSubmit(true);
          }}
        >
          Create anyway
        </Callout.Action>
      }
    />
  );
};

export const NewGiftActionFooter = ({
  controller,
}: {
  controller: NewGiftController;
}) => {
  const { submitting, handleSubmit } = controller;

  return (
    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
      <ActionButton
        title="Cancel"
        variant="secondary"
        onClick={() => {
          void closeSidePanel();
        }}
        disabled={submitting}
      />
      <ActionButton
        title={submitting ? 'Creating...' : 'Create gift'}
        variant="primary"
        accent="blue"
        onClick={() => {
          void handleSubmit();
        }}
        disabled={submitting}
      />
    </div>
  );
};
