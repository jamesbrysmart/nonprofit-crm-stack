import type { CSSProperties } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { AppPath, navigate } from 'twenty-sdk/front-component';
import { Button } from 'twenty-sdk/ui';
import { useRecurringAgreementReviewRecord } from 'src/recurring/use-recurring-agreement-review-record';

export const RECURRING_AGREEMENT_LINKED_GIFTS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER =
  'c0271717-1aeb-4e64-8506-5fd7a9e7e242';

const cardStyle: CSSProperties = {
  border: '1px solid #d8dee4',
  borderRadius: '10px',
  padding: '16px',
  display: 'grid',
  gap: '10px',
  background: '#ffffff',
};

const labelStyle: CSSProperties = {
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  color: '#57606a',
};

const valueStyle: CSSProperties = {
  fontSize: '16px',
  fontWeight: 600,
  color: '#1f2328',
};

const textStyle: CSSProperties = {
  fontSize: '13px',
  color: '#57606a',
  lineHeight: 1.5,
};

const buildGiftQueryParams = (agreementId: string) => ({
  'filter[recurringAgreement][IS]': [agreementId],
});

const RecurringAgreementLinkedGifts = () => {
  const { recordId, record, loading, error } = useRecurringAgreementReviewRecord();

  if (loading) {
    return <div style={textStyle}>Loading linked gifts...</div>;
  }

  if (error) {
    return <div style={textStyle}>{error}</div>;
  }

  if (!record || !recordId) {
    return <div style={textStyle}>Recurring agreement not found.</div>;
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
    <div style={cardStyle}>
      <div style={labelStyle}>Linked gifts</div>
      <div style={valueStyle}>
        {record.recentGifts.length === 0
          ? 'No recent linked gifts'
          : `${record.recentGifts.length} recent linked gift${record.recentGifts.length === 1 ? '' : 's'}`}
      </div>
      <div style={textStyle}>
        Open the native gifts view to inspect gifts linked to this recurring
        agreement.
      </div>
      <div>
        <Button
          title="Open linked gifts"
          variant="secondary"
          onClick={() => {
            void handleOpenLinkedGifts();
          }}
        />
      </div>
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
