import type { CSSProperties } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { useRecurringAgreementReviewRecord } from 'src/recurring/use-recurring-agreement-review-record';

export const RECURRING_AGREEMENT_STATE_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER =
  '57794d35-c598-44fc-a3dd-d80591d077cb';

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
  fontSize: '20px',
  fontWeight: 600,
  color: '#1f2328',
};

const textStyle: CSSProperties = {
  fontSize: '13px',
  color: '#57606a',
  lineHeight: 1.5,
};

const getHealthStyle = (state: string): CSSProperties => {
  switch (state) {
    case 'ON_TRACK':
      return { background: '#eef9f0', color: '#1a7f37' };
    case 'OVERDUE':
      return { background: '#fff8c5', color: '#7c5d00' };
    case 'DELINQUENT':
      return { background: '#fff5f5', color: '#8a2d2d' };
    default:
      return { background: '#f6f8fa', color: '#57606a' };
  }
};

const RecurringAgreementState = () => {
  const { record, loading, error } = useRecurringAgreementReviewRecord();

  if (loading) {
    return <div style={textStyle}>Loading recurring state...</div>;
  }

  if (error) {
    return <div style={textStyle}>{error}</div>;
  }

  if (!record) {
    return <div style={textStyle}>Recurring agreement not found.</div>;
  }

  return (
    <div style={cardStyle}>
      <div style={labelStyle}>Recurring state</div>
      <div style={valueStyle}>{record.name}</div>
      <div
        style={{
          borderRadius: '999px',
          padding: '4px 10px',
          fontSize: '12px',
          fontWeight: 600,
          width: 'fit-content',
          ...getHealthStyle(record.health.state),
        }}
      >
        {record.health.label}
      </div>
      <div style={textStyle}>{record.health.message}</div>
      <div
        style={{
          display: 'grid',
          gap: '10px',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        }}
      >
        <div>
          <div style={labelStyle}>Status</div>
          <div style={textStyle}>{record.status}</div>
        </div>
        <div>
          <div style={labelStyle}>Next expected</div>
          <div style={textStyle}>{record.nextExpectedAt ?? 'Not set'}</div>
        </div>
        <div>
          <div style={labelStyle}>Cadence</div>
          <div style={textStyle}>
            {record.intervalCount} x {record.cadence}
          </div>
        </div>
        <div>
          <div style={labelStyle}>Amount</div>
          <div style={textStyle}>{record.amountLabel}</div>
        </div>
      </div>
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier:
    RECURRING_AGREEMENT_STATE_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'recurring-agreement-state',
  description: 'Recurring agreement health and expectation summary.',
  component: RecurringAgreementState,
});
