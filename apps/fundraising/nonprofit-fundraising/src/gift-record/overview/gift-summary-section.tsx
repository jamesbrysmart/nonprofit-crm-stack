import { useEffect, useState } from 'react';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { Status } from 'twenty-ui/primitives/data-display';
import { deriveRefundState } from 'src/gift-lifecycle/gift-refund';
import {
  SummaryStrip,
  SummaryStripItem,
  compactValueStyle,
  compactWidgetRootStyle,
  contextMetricStyle,
  secondaryTextStyle,
} from 'src/front-components/front-component-ui';
import { theme } from 'src/front-components/theme-tokens';
import { normalizeString } from 'src/utils/normalize-string';
import { formatCurrencyAmount } from 'src/utils/format-currency-amount';

type GiftRecordSummaryRecord = {
  id: string;
  giftType?: string | null;
  paymentType?: string | null;
  isAnonymousDonor?: boolean | null;
  amount?: {
    amountMicros?: number | null;
    currencyCode?: string | null;
  } | null;
  giftDate?: string | null;
  provider?: string | null;
  coveredFeeAmount?: {
    amountMicros?: number | null;
    currencyCode?: string | null;
  } | null;
  grossPaymentAmount?: {
    amountMicros?: number | null;
    currencyCode?: string | null;
  } | null;
  processingFeeAmount?: {
    amountMicros?: number | null;
    currencyCode?: string | null;
  } | null;
  reportingAmount?: {
    amountMicros?: number | null;
    currencyCode?: string | null;
  } | null;
  reportingAmountStatus?: string | null;
  netReceivedAmount?: {
    amountMicros?: number | null;
    currencyCode?: string | null;
  } | null;
  refundedAmount?: {
    amountMicros?: number | null;
    currencyCode?: string | null;
  } | null;
  refundDate?: string | null;
  donor?: {
    id?: string | null;
    name?: {
      firstName?: string | null;
      lastName?: string | null;
    } | null;
  } | null;
  company?: {
    id?: string | null;
    name?: string | null;
  } | null;
  appeal?: {
    id?: string | null;
    name?: string | null;
  } | null;
  appealSource?: {
    id?: string | null;
    name?: string | null;
  } | null;
  fund?: {
    id?: string | null;
    name?: string | null;
  } | null;
  opportunity?: {
    id?: string | null;
    name?: string | null;
  } | null;
  recurringAgreement?: {
    id?: string | null;
    name?: string | null;
  } | null;
  softCreditPerson?: {
    id?: string | null;
    name?: {
      firstName?: string | null;
      lastName?: string | null;
    } | null;
  } | null;
  softCreditCompany?: {
    id?: string | null;
    name?: string | null;
  } | null;
  softCreditType?: string | null;
  giftAidClaimBatch?: {
    id?: string | null;
    name?: string | null;
  } | null;
};

type SummaryItem = {
  label: string;
  value: string;
};

const buildPersonName = (
  firstName: string | null | undefined,
  lastName: string | null | undefined,
) => `${normalizeString(firstName)} ${normalizeString(lastName)}`.trim();

const formatAmount = (
  amount: { amountMicros?: number | null; currencyCode?: string | null } | null | undefined,
) => formatCurrencyAmount(amount, 'Amount not recorded');

const hasAmount = (amount: GiftRecordSummaryRecord['amount']) =>
  typeof amount?.amountMicros === 'number';

const hasPositiveAmount = (amount: GiftRecordSummaryRecord['amount']) =>
  typeof amount?.amountMicros === 'number' && amount.amountMicros > 0;

const amountsDiffer = (
  first: GiftRecordSummaryRecord['amount'],
  second: GiftRecordSummaryRecord['amount'],
) =>
  typeof first?.amountMicros === 'number' &&
  typeof second?.amountMicros === 'number' &&
  first.amountMicros !== second.amountMicros;

const formatSelectValue = (value: string | null | undefined) =>
  normalizeString(value)
    .toLowerCase()
    .split('_')
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ');

const formatGiftDate = (value: string | null | undefined) => {
  const normalized = normalizeString(value);
  if (normalized === '') {
    return 'Date not recorded';
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

const getGiftIdentity = (record: GiftRecordSummaryRecord) => {
  if (record.isAnonymousDonor === true) {
    return 'Anonymous donor';
  }

  const donorName = buildPersonName(
    record.donor?.name?.firstName,
    record.donor?.name?.lastName,
  );
  const companyName = normalizeString(record.company?.name);

  if (donorName !== '' && companyName !== '') {
    return `${donorName} · ${companyName}`;
  }

  if (donorName !== '') {
    return donorName;
  }

  if (companyName !== '') {
    return companyName;
  }

  return 'Gift record';
};

const getRefundSignal = (record: GiftRecordSummaryRecord) => {
  const refundState = deriveRefundState({
    amount: record.amount,
    refundedAmount: record.refundedAmount,
  });

  switch (refundState) {
    case 'PARTIALLY_REFUNDED':
      return { tone: 'warning' as const, label: 'Partially refunded' };
    case 'FULLY_REFUNDED':
      return { tone: 'warning' as const, label: 'Fully refunded' };
    default:
      return null;
  }
};

const compactItems = (items: Array<SummaryItem | null>) =>
  items.filter((item): item is SummaryItem => item !== null);

const relationshipName = (
  relation: { name?: string | null } | null | undefined,
) => {
  const name = normalizeString(relation?.name);
  return name === '' ? null : name;
};

const personRelationshipName = (
  relation:
    | {
        name?: {
          firstName?: string | null;
          lastName?: string | null;
        } | null;
      }
    | null
    | undefined,
) => {
  const name = buildPersonName(
    relation?.name?.firstName,
    relation?.name?.lastName,
  );
  return name === '' ? null : name;
};

const sectionTitleStyle = {
  ...secondaryTextStyle,
  color: theme.font.color.primary,
  fontWeight: 600,
};

const renderSummarySection = (title: string, items: SummaryItem[]) =>
  items.length > 0 ? (
    <div style={{ display: 'grid', gap: '6px' }}>
      <div style={sectionTitleStyle}>{title}</div>
      <SummaryStrip>
        {items.map((item) => (
          <SummaryStripItem
            key={`${title}-${item.label}`}
            label={item.label}
            value={item.value}
          />
        ))}
      </SummaryStrip>
    </div>
  ) : null;

const getGiftSummaryLine = (record: GiftRecordSummaryRecord) => {
  const giftType = formatSelectValue(record.giftType) || 'Gift';
  const identity = getGiftIdentity(record);
  const giftDate = formatGiftDate(record.giftDate);

  if (identity === 'Gift record') {
    return `${giftType} · ${giftDate}`;
  }

  return `${giftType} from ${identity} · ${giftDate}`;
};

const loadGift = async (
  recordId: string,
): Promise<GiftRecordSummaryRecord | null> => {
  const client = new CoreApiClient();
  const result = await client.query({
    gift: {
      __args: {
        filter: {
          id: { eq: recordId },
        },
      },
      id: true,
      giftType: true,
      paymentType: true,
      isAnonymousDonor: true,
      amount: {
        amountMicros: true,
        currencyCode: true,
      },
      giftDate: true,
      provider: true,
      coveredFeeAmount: {
        amountMicros: true,
        currencyCode: true,
      },
      grossPaymentAmount: {
        amountMicros: true,
        currencyCode: true,
      },
      processingFeeAmount: {
        amountMicros: true,
        currencyCode: true,
      },
      reportingAmount: {
        amountMicros: true,
        currencyCode: true,
      },
      reportingAmountStatus: true,
      netReceivedAmount: {
        amountMicros: true,
        currencyCode: true,
      },
      refundedAmount: {
        amountMicros: true,
        currencyCode: true,
      },
      refundDate: true,
      donor: {
        id: true,
        name: {
          firstName: true,
          lastName: true,
        },
      },
      company: {
        id: true,
        name: true,
      },
      appeal: {
        id: true,
        name: true,
      },
      appealSource: {
        id: true,
        name: true,
      },
      fund: {
        id: true,
        name: true,
      },
      opportunity: {
        id: true,
        name: true,
      },
      recurringAgreement: {
        id: true,
        name: true,
      },
      softCreditPerson: {
        id: true,
        name: {
          firstName: true,
          lastName: true,
        },
      },
      softCreditCompany: {
        id: true,
        name: true,
      },
      softCreditType: true,
      giftAidClaimBatch: {
        id: true,
        name: true,
      },
    },
  } as any);

  return (result?.gift as GiftRecordSummaryRecord | null) ?? null;
};

const REPORTING_SOURCE_LABELS: Record<string, string> = {
  PROVIDER_SETTLEMENT: 'from payment provider',
  MANUAL: 'entered manually',
};

// Only shown when the gift is not in the reporting currency.
const getReportingItem = (record: GiftRecordSummaryRecord) => {
  const status = record.reportingAmountStatus ?? '';

  if (status === '' || status === 'SAME_CURRENCY') {
    return null;
  }

  if (status === 'MISSING' || !hasAmount(record.reportingAmount)) {
    return {
      label: 'Reporting amount',
      value: 'Needed: not yet in fundraising totals',
    };
  }

  const source = REPORTING_SOURCE_LABELS[status];

  return {
    label: 'Reporting amount',
    value: source
      ? `${formatAmount(record.reportingAmount)} (${source})`
      : formatAmount(record.reportingAmount),
  };
};

export const GiftSummarySection = ({
  recordId,
  reloadToken,
}: {
  recordId: string;
  reloadToken: number;
}) => {
  const [record, setRecord] = useState<GiftRecordSummaryRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!recordId) {
        setError('No gift selected');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const loaded = await loadGift(recordId);

        if (!loaded) {
          setRecord(null);
          setError('Gift not found');
          return;
        }

        setRecord(loaded);
      } catch (loadError) {
        setRecord(null);
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Unable to load gift summary',
        );
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, [recordId]);

  useEffect(() => {
    if (reloadToken === 0) {
      return;
    }

    void loadGift(recordId).then((loaded) => {
      if (loaded) {
        setRecord(loaded);
      }
    });
  }, [recordId, reloadToken]);

  if (loading && !record) {
    return <div style={secondaryTextStyle}>Loading gift summary...</div>;
  }

  if (error) {
    return <div style={secondaryTextStyle}>{error}</div>;
  }

  if (!record) {
    return <div style={secondaryTextStyle}>Gift not found.</div>;
  }

  const refundSignal = getRefundSignal(record);
  const provider = normalizeString(record.provider);
  const recurringAgreementName = normalizeString(record.recurringAgreement?.name);
  const claimBatchName = normalizeString(record.giftAidClaimBatch?.name);
  const appealName = relationshipName(record.appeal);
  const appealSourceName = relationshipName(record.appealSource);
  const fundName = relationshipName(record.fund);
  const opportunityName = relationshipName(record.opportunity);
  const softCreditPersonName = personRelationshipName(record.softCreditPerson);
  const softCreditCompanyName = relationshipName(record.softCreditCompany);
  const softCreditName = softCreditPersonName ?? softCreditCompanyName;
  const softCreditType = formatSelectValue(record.softCreditType);

  const coreItems = compactItems([
    {
      label: 'Gift type',
      value: formatSelectValue(record.giftType) || 'Donation',
    },
    {
      label: 'Payment type',
      value: formatSelectValue(record.paymentType) || 'Not recorded',
    },
    provider !== '' ? { label: 'Provider', value: provider } : null,
    record.isAnonymousDonor === true
      ? { label: 'Donor status', value: 'Anonymous donor' }
      : null,
  ]);
  const fundraisingItems = compactItems([
    appealSourceName
      ? { label: 'Appeal source', value: appealSourceName }
      : null,
    appealName ? { label: 'Appeal', value: appealName } : null,
    fundName ? { label: 'Fund', value: fundName } : null,
    opportunityName ? { label: 'Opportunity', value: opportunityName } : null,
    recurringAgreementName !== ''
      ? { label: 'Recurring', value: recurringAgreementName }
      : null,
    softCreditName
      ? {
          label: softCreditType === '' ? 'Soft credit' : softCreditType,
          value: softCreditName,
        }
      : null,
  ]);
  const financialItems = compactItems([
    getReportingItem(record),
    hasPositiveAmount(record.refundedAmount)
      ? { label: 'Refunded', value: formatAmount(record.refundedAmount) }
      : null,
    normalizeString(record.refundDate) !== ''
      ? { label: 'Refund date', value: formatGiftDate(record.refundDate) }
      : null,
    hasAmount(record.grossPaymentAmount) &&
    amountsDiffer(record.grossPaymentAmount, record.amount)
      ? { label: 'Payment total', value: formatAmount(record.grossPaymentAmount) }
      : null,
    hasPositiveAmount(record.coveredFeeAmount)
      ? { label: 'Covered fees', value: formatAmount(record.coveredFeeAmount) }
      : null,
    hasPositiveAmount(record.processingFeeAmount)
      ? {
          label: 'Processing fees',
          value: formatAmount(record.processingFeeAmount),
        }
      : null,
    hasAmount(record.netReceivedAmount) &&
    amountsDiffer(record.netReceivedAmount, record.amount)
      ? { label: 'Net received', value: formatAmount(record.netReceivedAmount) }
      : null,
    claimBatchName !== ''
      ? { label: 'Gift Aid claim', value: claimBatchName }
      : null,
  ]);

  return (
    <div style={compactWidgetRootStyle}>
      {refundSignal ? (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Status color="amber" weight="medium">
            {refundSignal.label}
          </Status>
        </div>
      ) : null}

      <div style={contextMetricStyle}>{formatAmount(record.amount)}</div>
      <div style={{ ...compactValueStyle, color: theme.font.color.primary }}>
        {getGiftSummaryLine(record)}
      </div>

      {renderSummarySection('Gift context', coreItems)}
      {renderSummarySection('Fundraising context', fundraisingItems)}
      {renderSummarySection('Financial context', financialItems)}
    </div>
  );
};
