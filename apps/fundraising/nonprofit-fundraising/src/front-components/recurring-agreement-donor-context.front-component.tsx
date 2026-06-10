import { defineFrontComponent } from 'twenty-sdk/define';
import { AppPath, navigate } from 'twenty-sdk/front-component';
import { Button } from 'twenty-sdk/ui';
import {
  badgeStyle,
  compactConfirmationCardStyle,
  compactValueStyle,
  compactWidgetRootStyle,
  secondaryTextStyle,
  sectionHeaderStyle,
} from 'src/front-components/front-component-ui';
import { useRecurringAgreementReviewRecord } from 'src/recurring/use-recurring-agreement-review-record';

export const RECURRING_AGREEMENT_DONOR_CONTEXT_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER =
  '5b499f8b-ee5b-4bc4-bbca-00b76e109340';

const RecurringAgreementDonorContext = () => {
  const { record, loading, error } = useRecurringAgreementReviewRecord();

  if (loading) {
    return <div style={secondaryTextStyle}>Loading donor context...</div>;
  }

  if (error) {
    return <div style={secondaryTextStyle}>{error}</div>;
  }

  if (!record) {
    return <div style={secondaryTextStyle}>Recurring agreement not found.</div>;
  }

  const hasDonor = !!record.donorId;
  const donorEmail = record.donorEmail?.trim() ?? '';

  const handleGoToDonor = async () => {
    if (!record.donorId) {
      return;
    }

    await navigate(AppPath.RecordShowPage, {
      objectNameSingular: 'person',
      objectRecordId: record.donorId,
    });
  };

  return (
    <div style={compactWidgetRootStyle}>
      <div style={sectionHeaderStyle}>
        <span style={badgeStyle(hasDonor ? 'neutral' : 'warning')}>
          {hasDonor ? 'Donor linked' : 'No donor linked'}
        </span>
      </div>

      {hasDonor ? (
        <>
          <div style={compactConfirmationCardStyle}>
            <div style={compactValueStyle}>{record.donorName}</div>
            <div style={secondaryTextStyle}>
              {donorEmail === '' ? 'No email on record' : donorEmail}
            </div>
          </div>
          <Button
            title="Open donor record"
            variant="secondary"
            onClick={() => {
              void handleGoToDonor();
            }}
          />
        </>
      ) : (
        <div style={secondaryTextStyle}>
          This recurring agreement is not currently linked to a donor record.
        </div>
      )}
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier:
    RECURRING_AGREEMENT_DONOR_CONTEXT_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'recurring-agreement-donor-context',
  description: 'Linked donor context for recurring agreement investigation.',
  component: RecurringAgreementDonorContext,
});
