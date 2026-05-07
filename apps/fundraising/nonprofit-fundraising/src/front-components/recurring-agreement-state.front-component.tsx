import { defineFrontComponent } from 'twenty-sdk/define';
import { useRecurringAgreementReviewRecord } from 'src/recurring/use-recurring-agreement-review-record';
import {
  badgeStyle,
  compactMetaGridStyle,
  compactMetaItemStyle,
  compactValueStyle,
  compactWidgetRootStyle,
  labelStyle,
  secondaryTextStyle,
  sectionHeaderStyle,
} from 'src/front-components/gift-staging-review-ui';

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

      <div style={compactMetaGridStyle}>
        <div style={compactMetaItemStyle}>
          <div style={labelStyle}>Status</div>
          <div style={secondaryTextStyle}>{formatEnumLabel(record.status)}</div>
        </div>
        <div style={compactMetaItemStyle}>
          <div style={labelStyle}>Next due</div>
          <div style={secondaryTextStyle}>{record.nextExpectedAt ?? 'Not set'}</div>
        </div>
        <div style={compactMetaItemStyle}>
          <div style={labelStyle}>Cadence</div>
          <div style={secondaryTextStyle}>
            {record.intervalCount} x {formatEnumLabel(record.cadence)}
          </div>
        </div>
        <div style={compactMetaItemStyle}>
          <div style={labelStyle}>Amount</div>
          <div style={secondaryTextStyle}>{record.amountLabel}</div>
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
