import { useEffect, useState } from 'react';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineFrontComponent } from 'twenty-sdk/define';
import { useRecordId } from 'twenty-sdk/front-component';
import {
  badgeStyle,
  compactWidgetRootStyle,
  secondaryTextStyle,
} from 'src/front-components/front-component-ui';
import { deriveRecurringHealth } from 'src/recurring/recurring.model';
import { subscribeToRecurringAgreementInvalidated } from 'src/recurring/recurring-agreement-sync';
import { loadRecurringAgreementPaymentHealthInput } from 'src/recurring/recurring.service';
import type { RecurringAgreementHealth } from 'src/recurring/recurring.types';
import {
  RECURRING_AGREEMENT_PAYMENT_HEALTH_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

const getHealthTone = (
  state: RecurringAgreementHealth['state'],
): 'neutral' | 'warning' | 'success' | 'danger' => {
  switch (state) {
    case 'ON_TRACK':
      return 'success';
    case 'DUE_TODAY':
      return 'warning';
    case 'OVERDUE':
    case 'DELINQUENT':
      return 'danger';
    default:
      return 'neutral';
  }
};

const loadHealth = async (recordId: string) => {
  const client = new CoreApiClient();
  const healthInput = await loadRecurringAgreementPaymentHealthInput(
    client,
    recordId,
  );

  return healthInput ? deriveRecurringHealth(healthInput) : null;
};

const RecurringAgreementPaymentHealth = () => {
  const recordId = useRecordId();
  const [health, setHealth] = useState<RecurringAgreementHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    if (!recordId) {
      setHealth(null);
      setError('No recurring agreement selected');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const loaded = await loadHealth(recordId);

      if (!loaded) {
        setHealth(null);
        setError('Recurring agreement not found');
        return;
      }

      setHealth(loaded);
    } catch (loadError) {
      setHealth(null);
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Unable to load payment status',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, [recordId]);

  useEffect(() => {
    if (!recordId) {
      return () => {};
    }

    return subscribeToRecurringAgreementInvalidated({
      recordId,
      onInvalidate: refresh,
    });
  }, [recordId]);

  if (loading) {
    return <div style={secondaryTextStyle}>Loading payment status...</div>;
  }

  if (error) {
    return <div style={secondaryTextStyle}>{error}</div>;
  }

  if (!health) {
    return <div style={secondaryTextStyle}>Payment status unavailable.</div>;
  }

  return (
    <div style={compactWidgetRootStyle}>
      <div>
        <span style={badgeStyle(getHealthTone(health.state))}>
          {health.label}
        </span>
      </div>
      <div style={secondaryTextStyle}>{health.message}</div>
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier:
    RECURRING_AGREEMENT_PAYMENT_HEALTH_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'recurring-agreement-payment-health',
  description:
    'Shows derived payment status for a recurring agreement without writing lifecycle state.',
  component: RecurringAgreementPaymentHealth,
});
