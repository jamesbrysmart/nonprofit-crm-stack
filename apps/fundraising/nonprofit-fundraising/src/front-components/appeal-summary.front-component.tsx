import { useEffect, useState } from 'react';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineFrontComponent } from 'twenty-sdk/define';
import {
  AppPath,
  navigate,
  useRecordId,
} from 'twenty-sdk/front-component';
import { Button } from 'twenty-sdk/ui';
import {
  actionRowStyle,
  badgeStyle,
  compactDividerSectionStyle,
  compactMetaGridStyle,
  compactMetaItemStyle,
  compactValueStyle,
  compactWidgetRootStyle,
  labelStyle,
  secondaryTextStyle,
  sectionHeaderStyle,
} from 'src/front-components/gift-staging-review-ui';

export const APPEAL_SUMMARY_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER =
  '1af94784-e9f5-4520-b5a3-3089948f7e35';

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

const buildAdvisories = (record: AppealSummaryRecord) => {
  const advisories: string[] = [];
  const giftCount = Math.max(0, Math.round(record.giftCount ?? 0));
  const goalMicros = Math.round(record.goalAmount?.amountMicros ?? 0);

  if (giftCount === 0) {
    advisories.push('No gifts have been coded to this appeal yet.');
  } else if (normalizeString(record.status).toUpperCase() === 'ACTIVE') {
    advisories.push('This appeal is active and receiving coded gifts.');
  }

  if (goalMicros <= 0) {
    advisories.push('No goal amount set.');
  }

  if (normalizeString(record.defaultFund?.id) === '') {
    advisories.push('No default fund set.');
  }

  if (
    normalizeString(record.startDate) === '' &&
    normalizeString(record.endDate) === ''
  ) {
    advisories.push('No date range set.');
  }

  return advisories;
};

const buildGoalProgressLabel = (record: AppealSummaryRecord) => {
  const goalMicros = Math.round(record.goalAmount?.amountMicros ?? 0);
  const raisedMicros = Math.round(record.raisedAmount?.amountMicros ?? 0);

  if (goalMicros <= 0) {
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

const buildGiftQueryParams = (appealId: string) => ({
  'filter[appeal][IS]': [appealId],
});

const buildGiftStagingQueryParams = (appealId: string) => ({
  'filter[appeal][IS]': [appealId],
});

const AppealSummary = () => {
  const recordId = useRecordId();
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

  const advisories = buildAdvisories(record);
  const goalProgressLabel = buildGoalProgressLabel(record);
  const identityLine = [
    normalizeString(record.defaultFund?.name) !== ''
      ? `Default fund: ${record.defaultFund?.name}`
      : '',
    buildDateRangeLabel(record),
  ]
    .filter((value) => value !== '')
    .join(' · ');

  const handleOpenGifts = async () => {
    await navigate(
      AppPath.RecordIndexPage,
      {
        objectNamePlural: 'gifts',
      },
      buildGiftQueryParams(recordId),
    );
  };

  const handleOpenGiftStagings = async () => {
    await navigate(
      AppPath.RecordIndexPage,
      {
        objectNamePlural: 'giftStagings',
      },
      buildGiftStagingQueryParams(recordId),
    );
  };

  return (
    <div style={compactWidgetRootStyle}>
      <div style={sectionHeaderStyle}>
        <div style={{ minWidth: 0 }}>
          <span style={badgeStyle(getStatusTone(record.status))}>
            {formatEnumLabel(record.status)}
          </span>
        </div>
      </div>

      <div style={compactValueStyle}>
        {normalizeString(record.name) || 'Untitled appeal'}
      </div>

      <div style={{ ...secondaryTextStyle, color: '#1f2328' }}>
        {formatEnumLabel(record.appealType)}
        {identityLine !== '' ? ` · ${identityLine}` : ''}
      </div>

      <div style={compactDividerSectionStyle}>
        <div style={compactMetaGridStyle}>
          <div style={compactMetaItemStyle}>
            <div style={labelStyle}>Raised</div>
            <div style={secondaryTextStyle}>{formatAmount(record.raisedAmount)}</div>
          </div>
          <div style={compactMetaItemStyle}>
            <div style={labelStyle}>Goal</div>
            <div style={secondaryTextStyle}>{formatAmount(record.goalAmount)}</div>
          </div>
          <div style={compactMetaItemStyle}>
            <div style={labelStyle}>Progress</div>
            <div style={secondaryTextStyle}>{goalProgressLabel ?? 'No goal set'}</div>
          </div>
          <div style={compactMetaItemStyle}>
            <div style={labelStyle}>Gift count</div>
            <div style={secondaryTextStyle}>{Math.round(record.giftCount ?? 0)}</div>
          </div>
          <div style={compactMetaItemStyle}>
            <div style={labelStyle}>Donor count</div>
            <div style={secondaryTextStyle}>{Math.round(record.donorCount ?? 0)}</div>
          </div>
          <div style={compactMetaItemStyle}>
            <div style={labelStyle}>Last gift</div>
            <div style={secondaryTextStyle}>{formatDate(record.lastGiftAt)}</div>
          </div>
        </div>
      </div>

      {advisories.length > 0 ? (
        <div style={compactDividerSectionStyle}>
          {advisories.map((advisory) => (
            <div key={advisory} style={secondaryTextStyle}>
              {advisory}
            </div>
          ))}
        </div>
      ) : null}

      <div style={compactDividerSectionStyle}>
        <div style={actionRowStyle}>
          <Button
            title="View gifts for this appeal"
            variant="secondary"
            onClick={() => {
              void handleOpenGifts();
            }}
          />
          <Button
            title="View staged gifts for this appeal"
            variant="secondary"
            onClick={() => {
              void handleOpenGiftStagings();
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: APPEAL_SUMMARY_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'appeal-summary',
  description:
    'Lightweight appeal home summary with factual KPIs and related-work navigation.',
  component: AppealSummary,
});
