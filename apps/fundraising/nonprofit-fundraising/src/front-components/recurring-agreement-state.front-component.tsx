import { defineFrontComponent } from 'twenty-sdk/define';
import { useRecurringAgreementReviewRecord } from 'src/recurring/use-recurring-agreement-review-record';
import {
  CompactMetaGrid,
  CompactMetaItem,
  badgeStyle,
  compactValueStyle,
  compactWidgetRootStyle,
  secondaryTextStyle,
  sectionHeaderStyle,
} from 'src/front-components/front-component-ui';

export const RECURRING_AGREEMENT_STATE_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER =
  '57794d35-c598-44fc-a3dd-d80591d077cb';

const getHealthTone = (state: string) => {
  switch (state) {
    case 'ON_TRACK':
      return 'success' as const;
    case 'OVERDUE':
    case 'DELINQUENT':
      return 'warning' as const;
    default:
      return 'neutral' as const;
  }
};

const formatEnumLabel = (value: string) => {
  return value
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

const RecurringAgreementState = () => {
  const { record, loading, error } = useRecurringAgreementReviewRecord();

  if (loading) {
    return <div style={secondaryTextStyle}>Loading recurring state...</div>;
  }

  if (error) {
    return <div style={secondaryTextStyle}>{error}</div>;
  }

  if (!record) {
    return <div style={secondaryTextStyle}>Recurring agreement not found.</div>;
  }

  return (
    <div style={compactWidgetRootStyle}>
      <div style={sectionHeaderStyle}>
        <div style={{ minWidth: 0 }}>
          <span style={badgeStyle(getHealthTone(record.health.state))}>
            {record.health.label}
          </span>
        </div>
      </div>

      <div style={compactValueStyle}>{record.name}</div>
      <div style={{ ...secondaryTextStyle, color: '#1f2328' }}>
        {record.health.message}
      </div>

      <CompactMetaGrid>
        <CompactMetaItem label="Status" value={formatEnumLabel(record.status)} />
        <CompactMetaItem label="Next due" value={record.nextExpectedAt ?? 'Not set'} />
        <CompactMetaItem
          label="Cadence"
          value={`${record.intervalCount} x ${formatEnumLabel(record.cadence)}`}
        />
        <CompactMetaItem label="Amount" value={record.amountLabel} />
        <CompactMetaItem
          label="Payment type"
          value={record.paymentType ? formatEnumLabel(record.paymentType) : 'Not set'}
        />
        {record.fundName ? (
          <CompactMetaItem label="Fund" value={record.fundName} />
        ) : null}
        {record.appealName ? (
          <CompactMetaItem label="Appeal" value={record.appealName} />
        ) : null}
        {record.appealSourceName ? (
          <CompactMetaItem label="Appeal source" value={record.appealSourceName} />
        ) : null}
      </CompactMetaGrid>
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
