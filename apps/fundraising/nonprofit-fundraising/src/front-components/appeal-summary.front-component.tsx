import { useEffect, useState } from 'react';
import { theme } from 'src/front-components/theme-tokens';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineFrontComponent } from 'twenty-sdk/define';
import { useSelectedRecordIds } from 'twenty-sdk/front-component';
import {
  SummaryStrip,
  SummaryStripItem,
  compactValueStyle,
  compactWidgetRootStyle,
  secondaryTextStyle,
  sectionHeaderStyle,
  ToneStatus,
} from 'src/front-components/front-component-ui';
import {
  APPEAL_SUMMARY_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { ReportingExclusionNotice } from 'src/reporting-currency/reporting-exclusion-notice';

type AppealSummaryRecord = {
  id: string;
  name?: string | null;
  status?: string | null;
  appealType?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  goalAmount?: {
    amountMicros?: number | null;
    currencyCode?: string | null;
  } | null;
  raisedAmount?: {
    amountMicros?: number | null;
    currencyCode?: string | null;
  } | null;
  giftCount?: number | null;
  donorCount?: number | null;
  lastGiftAt?: string | null;
  defaultFund?: {
    id?: string | null;
    name?: string | null;
  } | null;
};

const normalizeString = (value: string | null | undefined) =>
  typeof value === 'string' ? value.trim() : '';

const formatAmount = (
  amount:
    | {
        amountMicros?: number | null;
        currencyCode?: string | null;
      }
    | null
    | undefined,
) => {
  if (!amount || typeof amount.amountMicros !== 'number') {
    return 'Not set';
  }

  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: amount.currencyCode ?? 'GBP',
  }).format(amount.amountMicros / 1_000_000);
};

const formatDate = (value: string | null | undefined) => {
  const normalized = normalizeString(value);

  if (normalized === '') {
    return 'Not set';
  }

  const parsed = new Date(normalized);

  if (Number.isNaN(parsed.getTime())) {
    return normalized;
  }

  return new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(parsed);
};

const formatEnumLabel = (value: string | null | undefined) => {
  const normalized = normalizeString(value);

  if (normalized === '') {
    return 'Not set';
  }

  return normalized
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

const getStatusTone = (status: string | null | undefined) => {
  switch (normalizeString(status).toUpperCase()) {
    case 'ACTIVE':
      return 'success' as const;
    case 'CLOSED':
      return 'warning' as const;
    default:
      return 'neutral' as const;
  }
};

const loadAppealSummary = async (
  recordId: string,
): Promise<AppealSummaryRecord | null> => {
  const client = new CoreApiClient();
  const result = await client.query({
    appeal: {
      __args: {
        filter: {
          id: { eq: recordId },
        },
      },
      id: true,
      name: true,
      status: true,
      appealType: true,
      startDate: true,
      endDate: true,
      goalAmount: {
        amountMicros: true,
        currencyCode: true,
      },
      raisedAmount: {
        amountMicros: true,
        currencyCode: true,
      },
      giftCount: true,
      donorCount: true,
      lastGiftAt: true,
      defaultFund: {
        id: true,
        name: true,
      },
    },
  } as any);

  return (result?.appeal as AppealSummaryRecord | null) ?? null;
};

const buildGoalProgressLabel = (record: AppealSummaryRecord) => {
  const goalMicros = Math.round(record.goalAmount?.amountMicros ?? 0);
  const raisedMicros = Math.round(record.raisedAmount?.amountMicros ?? 0);

  // A goal set in another currency cannot be compared with the raised total.
  if (
    goalMicros <= 0 ||
    (record.goalAmount?.currencyCode ?? '').toUpperCase() !==
      (record.raisedAmount?.currencyCode ?? '').toUpperCase()
  ) {
    return null;
  }

  const percentage = Math.max(
    0,
    Math.round((raisedMicros / Math.max(goalMicros, 1)) * 100),
  );

  return `${percentage}% of goal`;
};

const buildDateRangeLabel = (record: AppealSummaryRecord) => {
  const startDate = normalizeString(record.startDate);
  const endDate = normalizeString(record.endDate);

  if (startDate === '' && endDate === '') {
    return 'No date range';
  }

  if (startDate !== '' && endDate !== '') {
    return `${formatDate(startDate)} to ${formatDate(endDate)}`;
  }

  if (startDate !== '') {
    return `Starts ${formatDate(startDate)}`;
  }

  return `Ends ${formatDate(endDate)}`;
};

const AppealSummary = () => {
  const selectedRecordIds = useSelectedRecordIds();
  const recordId = selectedRecordIds.length === 1 ? selectedRecordIds[0] : null;
  const [record, setRecord] = useState<AppealSummaryRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!recordId) {
        setError('No appeal selected');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const loaded = await loadAppealSummary(recordId);

        if (!loaded) {
          setRecord(null);
          setError('Appeal not found');
          return;
        }

        setRecord(loaded);
      } catch (loadError) {
        setRecord(null);
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Unable to load appeal summary',
        );
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, [recordId]);

  if (loading) {
    return <div style={secondaryTextStyle}>Loading appeal summary...</div>;
  }

  if (error) {
    return <div style={secondaryTextStyle}>{error}</div>;
  }

  if (!record || !recordId) {
    return <div style={secondaryTextStyle}>Appeal not found.</div>;
  }

  const goalProgressLabel = buildGoalProgressLabel(record);
  const identityLine = [
    normalizeString(record.defaultFund?.name) !== ''
      ? `Default fund: ${record.defaultFund?.name}`
      : '',
    buildDateRangeLabel(record),
  ]
    .filter((value) => value !== '')
    .join(' · ');

  return (
    <div style={compactWidgetRootStyle}>
      <div style={sectionHeaderStyle}>
        <div style={{ minWidth: 0 }}>
          <ToneStatus tone={getStatusTone(record.status)}>
            {formatEnumLabel(record.status)}
          </ToneStatus>
        </div>
      </div>

      <div style={compactValueStyle}>
        {normalizeString(record.name) || 'Untitled appeal'}
      </div>

      <div style={{ ...secondaryTextStyle, color: theme.font.color.primary }}>
        {formatEnumLabel(record.appealType)}
        {identityLine !== '' ? ` · ${identityLine}` : ''}
      </div>

      <SummaryStrip>
        <SummaryStripItem
          label="Raised"
          value={formatAmount(record.raisedAmount)}
        />
        <SummaryStripItem label="Goal" value={formatAmount(record.goalAmount)} />
        <SummaryStripItem
          label="Progress"
          value={goalProgressLabel ?? 'No goal set'}
        />
        <SummaryStripItem
          label="Gift count"
          value={Math.round(record.giftCount ?? 0)}
        />
        <SummaryStripItem
          label="Donor count"
          value={Math.round(record.donorCount ?? 0)}
        />
        <SummaryStripItem
          label="Last gift"
          value={formatDate(record.lastGiftAt)}
        />
      </SummaryStrip>
      <ReportingExclusionNotice relation="appeal" recordId={recordId} />
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: APPEAL_SUMMARY_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'appeal-summary',
  description:
    'Lightweight appeal home summary with factual KPIs.',
  component: AppealSummary,
});
