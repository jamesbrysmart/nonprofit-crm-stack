import { useEffect, useState } from 'react';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineFrontComponent } from 'twenty-sdk/define';
import { useRecordId } from 'twenty-sdk/front-component';
import { deriveRefundState } from 'src/gift-lifecycle/gift-refund';
import { subscribeToGiftRecordInvalidated } from 'src/gift-record/gift-record-sync';
import {
  SummaryStrip,
  SummaryStripItem,
  badgeStyle,
  compactValueStyle,
  compactWidgetRootStyle,
  secondaryTextStyle,
} from 'src/front-components/front-component-ui';

export const GIFT_RECORD_SUMMARY_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER =
  '9c6fe424-f7a3-4b1f-b4b0-ae10308b9d0a';

type GiftRecordSummaryRecord = {
  id: string;
  amount?: {
    amountMicros?: number | null;
    currencyCode?: string | null;
  } | null;
  giftDate?: string | null;
  provider?: string | null;
  providerPaymentId?: string | null;
  refundedAmount?: {
    amountMicros?: number | null;
    currencyCode?: string | null;
  } | null;
  refundDate?: string | null;
  giftAidStatus?: string | null;
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
  recurringAgreement?: {
    id?: string | null;
    name?: string | null;
  } | null;
  giftAidClaimBatch?: {
    id?: string | null;
    name?: string | null;
  } | null;
};

const normalizeString = (value: string | null | undefined) =>
  typeof value === 'string' ? value.trim() : '';

const buildPersonName = (
  firstName: string | null | undefined,
  lastName: string | null | undefined,
) => `${normalizeString(firstName)} ${normalizeString(lastName)}`.trim();

const formatAmount = (amount: GiftRecordSummaryRecord['amount']) => {
  const micros = amount?.amountMicros;
  const currency = normalizeString(amount?.currencyCode) || 'GBP';

  if (typeof micros !== 'number') {
    return 'Amount not recorded';
  }

  return `${currency} ${(micros / 1_000_000).toFixed(2)}`;
};

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

const getGiftAidSignal = (status: string | null | undefined) => {
  switch (normalizeString(status).toUpperCase()) {
    case 'CLAIMABLE':
      return { tone: 'success' as const, label: 'Gift Aid claimable' };
    case 'NEEDS_REVIEW':
      return { tone: 'warning' as const, label: 'Gift Aid needs review' };
    case 'NOT_CLAIMABLE':
      return { tone: 'neutral' as const, label: 'Gift Aid not claimable' };
    default:
      return null;
  }
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

const getPostureMessage = (record: GiftRecordSummaryRecord) => {
  const refundState = deriveRefundState({
    amount: record.amount,
    refundedAmount: record.refundedAmount,
  });

  if (refundState === 'FULLY_REFUNDED') {
    return 'A refund has been recorded on this gift. Treat it as a lifecycle event rather than an ordinary active gift.';
  }

  if (refundState === 'PARTIALLY_REFUNDED') {
    return 'A partial refund has been recorded on this gift. Review linked areas before changing key details.';
  }

  if (normalizeString(record.giftAidClaimBatch?.id) !== '') {
    return 'This gift is already part of Gift Aid claim work. Review linked areas before changing key details.';
  }

  if (normalizeString(record.recurringAgreement?.id) !== '') {
    return 'This gift is linked to a recurring agreement. Review linked areas before changing key details.';
  }

  if (normalizeString(record.provider) !== '') {
    return 'This gift came from a tracked source. Review provider details before changing key details.';
  }

  return 'This gift currently has no linked downstream context and is in a calmer maintenance state.';
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
      amount: {
        amountMicros: true,
        currencyCode: true,
      },
      giftDate: true,
      provider: true,
      providerPaymentId: true,
      refundedAmount: {
        amountMicros: true,
        currencyCode: true,
      },
      refundDate: true,
      giftAidStatus: true,
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
      recurringAgreement: {
        id: true,
        name: true,
      },
      giftAidClaimBatch: {
        id: true,
        name: true,
      },
    },
  } as any);

  return (result?.gift as GiftRecordSummaryRecord | null) ?? null;
};

const GiftRecordSummaryWidget = () => {
  const recordId = useRecordId();
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
    if (!recordId) {
      return;
    }

    return subscribeToGiftRecordInvalidated({
      recordId,
      onInvalidate: async () => {
        const loaded = await loadGift(recordId);

        if (!loaded) {
          return;
        }

        setRecord(loaded);
      },
    });
  }, [recordId]);

  if (loading) {
    return <div style={secondaryTextStyle}>Loading gift summary...</div>;
  }

  if (error) {
    return <div style={secondaryTextStyle}>{error}</div>;
  }

  if (!record) {
    return <div style={secondaryTextStyle}>Gift not found.</div>;
  }

  const giftAidSignal = getGiftAidSignal(record.giftAidStatus);
  const refundSignal = getRefundSignal(record);
  const provider = normalizeString(record.provider);
  const recurringAgreementName = normalizeString(record.recurringAgreement?.name);
  const claimBatchName = normalizeString(record.giftAidClaimBatch?.name);

  return (
    <div style={compactWidgetRootStyle}>
      <div style={compactValueStyle}>{getGiftIdentity(record)}</div>
      <div style={{ ...secondaryTextStyle, color: '#1f2328' }}>
        {formatAmount(record.amount)} · {formatGiftDate(record.giftDate)}
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {giftAidSignal ? (
          <span style={badgeStyle(giftAidSignal.tone)}>{giftAidSignal.label}</span>
        ) : null}
        {refundSignal ? (
          <span style={badgeStyle(refundSignal.tone)}>{refundSignal.label}</span>
        ) : null}
        {recurringAgreementName !== '' ? (
          <span style={badgeStyle('neutral')}>Recurring linked</span>
        ) : null}
        {provider !== '' ? (
          <span style={badgeStyle('neutral')}>Source tracked</span>
        ) : null}
      </div>

      <div style={{ ...secondaryTextStyle, color: '#1f2328' }}>
        {getPostureMessage(record)}
      </div>

      <SummaryStrip>
        <SummaryStripItem
          label="Provider"
          value={provider === '' ? 'Manual / not recorded' : provider}
        />
        <SummaryStripItem
          label="Recurring"
          value={recurringAgreementName === '' ? 'Not linked' : recurringAgreementName}
        />
        <SummaryStripItem
          label="Gift Aid claim"
          value={claimBatchName === '' ? 'Not in a claim batch' : claimBatchName}
        />
        <SummaryStripItem
          label="Provider reference"
          value={
            normalizeString(record.providerPaymentId) === ''
              ? 'Not recorded'
              : normalizeString(record.providerPaymentId)
          }
        />
      </SummaryStrip>
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: GIFT_RECORD_SUMMARY_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'gift-record-summary',
  description: 'Compact gift summary and handling posture for the gift home tab.',
  component: GiftRecordSummaryWidget,
});
