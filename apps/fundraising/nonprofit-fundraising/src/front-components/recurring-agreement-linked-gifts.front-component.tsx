import { defineFrontComponent } from 'twenty-sdk/define';
import { AppPath, navigate } from 'twenty-sdk/front-component';
import { Button } from 'twenty-sdk/ui';
import {
  compactValueStyle,
  compactWidgetRootStyle,
  labelStyle,
  secondaryTextStyle,
} from 'src/front-components/gift-staging-review-ui';
import { useRecurringAgreementReviewRecord } from 'src/recurring/use-recurring-agreement-review-record';

export const RECURRING_AGREEMENT_LINKED_GIFTS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER =
  'c0271717-1aeb-4e64-8506-5fd7a9e7e242';

const buildGiftQueryParams = (agreementId: string) => ({
  'filter[recurringAgreement][IS]': [agreementId],
});

const RecurringAgreementLinkedGifts = () => {
  const { recordId, record, loading, error } = useRecurringAgreementReviewRecord();

  if (loading) {
    return <div style={secondaryTextStyle}>Loading linked gifts...</div>;
  }

  if (error) {
    return <div style={secondaryTextStyle}>{error}</div>;
  }

  if (!record || !recordId) {
    return <div style={secondaryTextStyle}>Recurring agreement not found.</div>;
  }

  const handleOpenLinkedGifts = async () => {
    await navigate(
      AppPath.RecordIndexPage,
      {
        objectNamePlural: 'gifts',
      },
      buildGiftQueryParams(recordId),
    );
  };

  return (
    <div style={compactWidgetRootStyle}>
      <div style={labelStyle}>Linked gifts</div>
      <div style={compactValueStyle}>
        {record.recentGifts.length === 0
          ? 'No linked gifts yet'
          : `${record.recentGifts.length} linked gift${record.recentGifts.length === 1 ? '' : 's'}`}
      </div>
      <Button
        title="Open linked gifts"
        variant="secondary"
        onClick={() => {
          void handleOpenLinkedGifts();
        }}
      />
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier:
    RECURRING_AGREEMENT_LINKED_GIFTS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'recurring-agreement-linked-gifts',
  description: 'Native gift worklist entry point for linked recurring gifts.',
  component: RecurringAgreementLinkedGifts,
});
