import { useEffect, useState } from 'react';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineFrontComponent } from 'twenty-sdk/define';
import { useRecordId } from 'twenty-sdk/front-component';
import {
  SummaryStrip,
  SummaryStripItem,
  badgeStyle,
  contextSignalRowStyle,
  compactValueStyle,
  compactWidgetRootStyle,
  secondaryTextStyle,
} from 'src/front-components/front-component-ui';

export const COMPANY_RECORD_SUMMARY_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER =
  'fb455e53-c13d-49d6-8895-602cc9c2b094';

type CompanyRecordSummaryRecord = {
  id: string;
  lifetimeGiftAmount?: CurrencyAmount | null;
  lastGiftDate?: string | null;
  awardedOpportunityAmount?: CurrencyAmount | null;
  awardedOpportunityCount?: number | null;
  nextApplicationDeadline?: string | null;
  nextFundingPeriodEnd?: string | null;
};

type CurrencyAmount = {
  amountMicros?: number | null;
  currencyCode?: string | null;
};

const normalizeString = (value: string | null | undefined) =>
  typeof value === 'string' ? value.trim() : '';

const formatDate = (value: string | null | undefined) => {
  const normalized = normalizeString(value);

  if (normalized === '') {
    return 'Not recorded';
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

const hasAmount = (amount: CurrencyAmount | null | undefined) =>
  Math.round(amount?.amountMicros ?? 0) !== 0;

const formatAmount = (
  amount: CurrencyAmount | null | undefined,
  emptyLabel = 'Not recorded',
) => {
  if (!hasAmount(amount)) {
    return emptyLabel;
  }

  const currencyCode = normalizeString(amount?.currencyCode) || 'GBP';
  const amountMicros = Math.round(amount?.amountMicros ?? 0);

  try {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currencyCode,
    }).format(amountMicros / 1_000_000);
  } catch {
    return `${currencyCode} ${(amountMicros / 1_000_000).toFixed(2)}`;
  }
};

const loadCompany = async (
  recordId: string,
): Promise<CompanyRecordSummaryRecord | null> => {
  const client = new CoreApiClient();
  const result = await client.query({
    company: {
      __args: {
        filter: {
          id: { eq: recordId },
        },
      },
      id: true,
      lifetimeGiftAmount: {
        amountMicros: true,
        currencyCode: true,
      },
      lastGiftDate: true,
      awardedOpportunityAmount: {
        amountMicros: true,
        currencyCode: true,
      },
      awardedOpportunityCount: true,
      nextApplicationDeadline: true,
      nextFundingPeriodEnd: true,
    },
  } as any);

  return (result?.company as CompanyRecordSummaryRecord | null) ?? null;
};

const CompanyRecordSummary = () => {
  const recordId = useRecordId();
  const [record, setRecord] = useState<CompanyRecordSummaryRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!recordId) {
        setRecord(null);
        setError('No company selected');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const loaded = await loadCompany(recordId);

        if (!loaded) {
          setRecord(null);
          setError('Company not found');
          return;
        }

        setRecord(loaded);
      } catch (loadError) {
        setRecord(null);
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Unable to load company summary',
        );
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, [recordId]);

  if (loading) {
    return <div style={secondaryTextStyle}>Loading company summary...</div>;
  }

  if (error) {
    return <div style={secondaryTextStyle}>{error}</div>;
  }

  if (!record) {
    return <div style={secondaryTextStyle}>Company not found.</div>;
  }

  const awardedOpportunityCount = Math.round(
    record.awardedOpportunityCount ?? 0,
  );
  const hasGiftValue = hasAmount(record.lifetimeGiftAmount);
  const hasAwardedValue = hasAmount(record.awardedOpportunityAmount);
  const hasForwardDates =
    normalizeString(record.nextApplicationDeadline) !== '' ||
    normalizeString(record.nextFundingPeriodEnd) !== '';
  const hasFundraisingContext =
    hasGiftValue ||
    hasAwardedValue ||
    awardedOpportunityCount > 0 ||
    hasForwardDates;
  const signals = [
    hasGiftValue ? { label: 'Funding received', tone: 'success' } : null,
    hasAwardedValue || awardedOpportunityCount > 0
      ? { label: 'Awarded funding', tone: 'success' }
      : null,
    normalizeString(record.nextApplicationDeadline) !== ''
      ? { label: 'Upcoming deadline', tone: 'warning' }
      : null,
    normalizeString(record.nextFundingPeriodEnd) !== ''
      ? { label: 'Funding period ending', tone: 'neutral' }
      : null,
  ].filter(
    (
      signal,
    ): signal is {
      label: string;
      tone: 'neutral' | 'warning' | 'success';
    } => signal !== null,
  );

  return (
    <div style={compactWidgetRootStyle}>
      {hasFundraisingContext ? (
        <>
          <div style={contextSignalRowStyle}>
            {signals.map((signal) => (
              <span key={signal.label} style={badgeStyle(signal.tone)}>
                {signal.label}
              </span>
            ))}
          </div>
          <SummaryStrip>
            {hasGiftValue ? (
              <SummaryStripItem label="Received">
                <div style={compactValueStyle}>
                  {formatAmount(record.lifetimeGiftAmount)}
                </div>
              </SummaryStripItem>
            ) : null}
            {hasAwardedValue ? (
              <SummaryStripItem label="Awarded">
                <div style={compactValueStyle}>
                  {formatAmount(record.awardedOpportunityAmount)}
                </div>
              </SummaryStripItem>
            ) : null}
            {awardedOpportunityCount > 0 ? (
              <SummaryStripItem label="Awards">
                <div style={compactValueStyle}>{awardedOpportunityCount}</div>
              </SummaryStripItem>
            ) : null}
            {normalizeString(record.nextApplicationDeadline) !== '' ? (
              <SummaryStripItem label="Next deadline">
                <div style={compactValueStyle}>
                  {formatDate(record.nextApplicationDeadline)}
                </div>
              </SummaryStripItem>
            ) : null}
            {normalizeString(record.lastGiftDate) !== '' ? (
              <SummaryStripItem label="Last funding">
                <div style={compactValueStyle}>
                  {formatDate(record.lastGiftDate)}
                </div>
              </SummaryStripItem>
            ) : null}
            {normalizeString(record.nextFundingPeriodEnd) !== '' ? (
              <SummaryStripItem label="Funding ends">
                <div style={compactValueStyle}>
                  {formatDate(record.nextFundingPeriodEnd)}
                </div>
              </SummaryStripItem>
            ) : null}
          </SummaryStrip>
        </>
      ) : (
        <div style={contextSignalRowStyle}>
          <span style={badgeStyle('neutral')}>No funding activity</span>
          <span style={secondaryTextStyle}>Standard CRM company.</span>
        </div>
      )}
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: COMPANY_RECORD_SUMMARY_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'company-record-summary',
  description:
    'General company summary with conditional fundraising context for donor-admin workflows.',
  component: CompanyRecordSummary,
});
