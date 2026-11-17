import { ActionButton } from 'src/front-components/front-component-ui';
import {
  ChoiceCards,
  FormCheckbox,
  FormInput,
} from 'src/front-components/form-controls';
import type { NewGiftController } from 'src/manual-gift-entry/new-gift-section.types';
import {
  bodyTextStyle,
  buildRecurringAgreementDisplayName,
  fieldActionGridStyle,
  sectionStyle,
  sectionTitleStyle,
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

      <FormCheckbox
        label="Link to an existing recurring agreement"
        checked={linkRecurringAgreement}
        onChange={(checked) => {
          setLinkRecurringAgreement(checked);

          if (!checked) {
            setRecurringResults([]);
            setSelectedRecurringAgreementId(null);
            setRecurringSearchQuery('');
          }
        }}
      />

      {linkRecurringAgreement ? (
        <>
          <p style={bodyTextStyle}>
            Use this only when the gift belongs to an existing recurring
            agreement.
          </p>
          <div style={fieldActionGridStyle}>
            <FormInput
              label="Search recurring agreements"
              placeholder="Donor name, agreement name, or reference"
              value={recurringSearchQuery}
              onChange={setRecurringSearchQuery}
            />
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
            <ChoiceCards
              ariaLabel="Recurring agreements"
              value={selectedRecurringAgreementId}
              onChange={setSelectedRecurringAgreementId}
              options={recurringResults.map((agreement) => ({
                value: agreement.id,
                title: buildRecurringAgreementDisplayName(agreement),
                description: `${agreement.status ?? 'Status unavailable'} · ${
                  agreement.nextExpectedAt ?? 'No next date'
                } · ${agreement.provider ?? 'MANUAL'}`,
              }))}
            />
          ) : null}
        </>
      ) : null}
    </div>
  );
};
