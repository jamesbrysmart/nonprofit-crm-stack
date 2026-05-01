import type { CSSProperties } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { AppPath, navigate } from 'twenty-sdk/front-component';
import { Button } from 'twenty-sdk/ui';
import { useRecurringAgreementReviewRecord } from 'src/recurring/use-recurring-agreement-review-record';

export const RECURRING_AGREEMENT_DONOR_CONTEXT_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER =
  '5b499f8b-ee5b-4bc4-bbca-00b76e109340';

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

const statusPillStyle = (tone: 'neutral' | 'warning'): CSSProperties => ({
  borderRadius: '999px',
  padding: '4px 10px',
  fontSize: '12px',
  fontWeight: 600,
  width: 'fit-content',
  background: tone === 'warning' ? '#fff8c5' : '#f6f8fa',
  color: tone === 'warning' ? '#7c5d00' : '#57606a',
});

const RecurringAgreementDonorContext = () => {
  const { record, loading, error } = useRecurringAgreementReviewRecord();

  if (loading) {
    return <div style={textStyle}>Loading donor context...</div>;
  }

  if (error) {
    return <div style={textStyle}>{error}</div>;
  }

  if (!record) {
    return <div style={textStyle}>Recurring agreement not found.</div>;
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
    <div style={cardStyle}>
      <div style={labelStyle}>Donor context</div>
      <div style={valueStyle}>{record.donorName}</div>
      <div style={statusPillStyle(hasDonor ? 'neutral' : 'warning')}>
        {hasDonor ? 'Donor linked' : 'No donor linked'}
      </div>
      <div style={textStyle}>
        {hasDonor
          ? 'Use the donor record when recurring follow-up needs donor context or contact details.'
          : 'This recurring agreement does not currently link to a donor record.'}
      </div>
      <div>
        <div style={labelStyle}>Primary email</div>
        <div style={textStyle}>
          {donorEmail === '' ? 'Not recorded' : donorEmail}
        </div>
      </div>
      {hasDonor ? (
        <div>
          <Button
            title="Go to donor"
            variant="secondary"
            onClick={() => {
              void handleGoToDonor();
            }}
          />
        </div>
      ) : null}
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
