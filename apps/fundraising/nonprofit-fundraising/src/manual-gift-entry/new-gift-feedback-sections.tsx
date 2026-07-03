import { closeSidePanel } from 'twenty-sdk/front-component';
import type { ManualGiftDuplicateMatch } from 'src/manual-gift-entry/manual-gift-entry.types';
import { ActionButton } from 'src/front-components/front-component-ui';
import type { NewGiftController } from 'src/manual-gift-entry/new-gift-section.types';
import {
  candidateButtonStyle,
  formatAmountMicros,
  secondaryTextStyle,
  sectionTitleStyle,
  stackedSectionStyle,
  warningSectionStyle,
} from 'src/manual-gift-entry/new-gift-support';

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
    <div style={warningSectionStyle}>
      <div style={sectionTitleStyle}>Possible duplicate gift</div>
      <div style={secondaryTextStyle}>
        A gift with the same donor or company, amount, and date already exists
        or is waiting to be processed. This is a warning only. You can still
        create the gift if it is genuinely separate.
      </div>

      <div style={stackedSectionStyle}>
        {duplicateGiftCheckResult.matches.map(
          (match: ManualGiftDuplicateMatch) => (
            <div key={`${match.kind}:${match.id}`} style={candidateButtonStyle}>
              <strong>{match.name}</strong>
              <span style={secondaryTextStyle}>
                {match.kind === 'COMMITTED_GIFT'
                  ? 'Committed gift'
                  : 'Staged gift'}{' '}
                · {match.giftDate} ·{' '}
                {formatAmountMicros(match.amountMicros, match.currencyCode)}
              </span>
              <span style={secondaryTextStyle}>
                {match.status ?? 'Status unavailable'}
                {match.giftBatchName ? ` · Batch: ${match.giftBatchName}` : ''}
              </span>
            </div>
          ),
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <ActionButton
          title="Create anyway"
          variant="secondary"
          onClick={() => {
            void handleSubmit(true);
          }}
          disabled={submitting}
        />
      </div>
    </div>
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
