import { ActionButton } from 'src/front-components/front-component-ui';
import type { NewGiftController } from 'src/manual-gift-entry/new-gift-section.types';
import {
  bodyTextStyle,
  buildRecurringAgreementDisplayName,
  candidateButtonStyle,
  checkboxLabelStyle,
  fieldActionGridStyle,
  fieldStyle,
  getInputEventChecked,
  getInputEventValue,
  inputStyle,
  labelStyle,
  secondaryTextStyle,
  sectionStyle,
  sectionTitleStyle,
  selectedCandidateButtonStyle,
  stackedSectionStyle,
} from 'src/manual-gift-entry/new-gift-support';

export const RecurringLinkageSection = ({
  controller,
}: {
  controller: NewGiftController;
}) => {
  const {
    linkRecurringAgreement,
    setLinkRecurringAgreement,
    recurringSearchQuery,
    setRecurringSearchQuery,
    recurringResults,
    setRecurringResults,
    selectedRecurringAgreementId,
    setSelectedRecurringAgreementId,
    searchingRecurring,
    canSearchRecurring,
    submitting,
    handleSearchRecurringAgreements,
  } = controller;

  if (controller.isAnonymousDonor) {
    return null;
  }

  return (
    <div style={sectionStyle}>
      <div style={sectionTitleStyle}>Recurring linkage</div>

      <label style={checkboxLabelStyle}>
        <input
          type="checkbox"
          checked={linkRecurringAgreement}
          onChange={(event) => {
            const checked = getInputEventChecked(event);
            setLinkRecurringAgreement(checked);

            if (!checked) {
              setRecurringResults([]);
              setSelectedRecurringAgreementId(null);
              setRecurringSearchQuery('');
            }
          }}
        />
        <span>Link to an existing recurring agreement</span>
      </label>

      {linkRecurringAgreement ? (
        <>
          <p style={bodyTextStyle}>
            Use this only when the gift belongs to an existing recurring
            agreement.
          </p>
          <div style={fieldActionGridStyle}>
            <label style={fieldStyle}>
              <span style={labelStyle}>Search recurring agreements</span>
              <input
                style={inputStyle}
                value={recurringSearchQuery}
                placeholder="Donor name, agreement name, or reference"
                onChange={(event) =>
                  setRecurringSearchQuery(getInputEventValue(event))
                }
              />
            </label>

            <div>
              <ActionButton
                title={searchingRecurring ? 'Searching...' : 'Search'}
                variant="secondary"
                onClick={() => {
                  void handleSearchRecurringAgreements();
                }}
                disabled={searchingRecurring || submitting || !canSearchRecurring}
              />
            </div>
          </div>

          {recurringResults.length > 0 ? (
            <div style={stackedSectionStyle}>
              {recurringResults.map((agreement) => {
                const isSelected = agreement.id === selectedRecurringAgreementId;

                return (
                  <button
                    key={agreement.id}
                    type="button"
                    style={
                      isSelected
                        ? selectedCandidateButtonStyle
                        : candidateButtonStyle
                    }
                    onClick={() => {
                      setSelectedRecurringAgreementId(agreement.id);
                    }}
                  >
                    <strong>{buildRecurringAgreementDisplayName(agreement)}</strong>
                    <span style={secondaryTextStyle}>
                      {agreement.status ?? 'Status unavailable'} ·{' '}
                      {agreement.nextExpectedAt ?? 'No next date'} ·{' '}
                      {agreement.provider ?? 'MANUAL'}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
};
