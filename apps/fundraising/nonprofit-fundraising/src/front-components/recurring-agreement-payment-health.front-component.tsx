import { useCallback, useEffect, useState } from 'react';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineFrontComponent } from 'twenty-sdk/define';
import { useSelectedRecordIds } from 'twenty-sdk/front-component';
import { Status } from 'twenty-ui/primitives/data-display';
import type { ThemeColor } from 'twenty-ui/theme';
import {
  compactWidgetRootStyle,
  secondaryTextStyle,
} from 'src/front-components/front-component-ui';
import { useReloadOnTabChange } from 'src/front-components/use-reload-on-tab-change';
import { deriveRecurringHealth } from 'src/recurring/recurring.model';
import { loadRecurringAgreementPaymentHealthInput } from 'src/recurring/recurring.service';
import type { RecurringAgreementHealth } from 'src/recurring/recurring.types';
import {
  RECURRING_AGREEMENT_PAYMENT_HEALTH_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

const getHealthColor = (state: RecurringAgreementHealth['state']): ThemeColor => {
  switch (state) {
    case 'ON_TRACK':
      return 'green';
    case 'DUE_TODAY':
      return 'amber';
    case 'OVERDUE':
    case 'DELINQUENT':
      return 'red';
    default:
      return 'gray';
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
  const selectedRecordIds = useSelectedRecordIds();
  const recordId = selectedRecordIds.length === 1 ? selectedRecordIds[0] : null;
  const [health, setHealth] = useState<RecurringAgreementHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
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
  }, [recordId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useReloadOnTabChange(() => {
    void refresh();
  });

  if (loading && !health) {
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
        <Status color={getHealthColor(health.state)} weight="medium">
          {health.label}
        </Status>
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
