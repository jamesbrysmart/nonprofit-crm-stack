import { useEffect, useState, type CSSProperties } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { useRecordId } from 'twenty-sdk/front-component';
import { CoreApiClient } from 'twenty-client-sdk/core';
import {
  buildRecurringAgreementReviewRecord,
} from 'src/recurring/recurring.model';
import { loadRecurringAgreementById } from 'src/recurring/recurring.service';
import type { RecurringAgreementReviewRecord } from 'src/recurring/recurring.types';

export const RECURRING_AGREEMENT_RECORD_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER =
  '4f45856f-7b0d-4d93-b086-7f2d90b9d5cd';

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

const metricValueStyle: CSSProperties = {
  fontSize: '20px',
  fontWeight: 600,
  color: '#1f2328',
};

const secondaryTextStyle: CSSProperties = {
  fontSize: '13px',
  color: '#57606a',
  lineHeight: 1.5,
};

const rowCardStyle: CSSProperties = {
  border: '1px solid #d0d7de',
  borderRadius: '8px',
  padding: '12px',
  display: 'grid',
  gap: '6px',
  background: '#ffffff',
};

const getHealthStyle = (state: RecurringAgreementReviewRecord['health']['state']) => {
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

const loadRecurringAgreementReview = async (recordId: string) => {
  const client = new CoreApiClient();
  const record = await loadRecurringAgreementById(client, recordId);

  return record ? buildRecurringAgreementReviewRecord(record) : null;
};

const RecurringAgreementRecord = () => {
  const recordId = useRecordId();
  const [record, setRecord] = useState<RecurringAgreementReviewRecord | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!recordId) {
        setError('No recurring agreement selected');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const loaded = await loadRecurringAgreementReview(recordId);

        if (!loaded) {
          setRecord(null);
          setError('Recurring agreement not found');
          return;
        }

        setRecord(loaded);
      } catch (loadError) {
        setRecord(null);
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Unable to load recurring agreement',
        );
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, [recordId]);

  if (loading) {
    return <div style={secondaryTextStyle}>Loading recurring review...</div>;
  }

  if (error) {
    return <div style={secondaryTextStyle}>{error}</div>;
  }

  if (!record) {
    return <div style={secondaryTextStyle}>Recurring agreement not found.</div>;
  }

  return (
    <div
      style={{
        padding: '20px',
        fontFamily: 'sans-serif',
        display: 'grid',
        gap: '16px',
      }}
    >
      <div style={cardStyle}>
        <div style={{ display: 'grid', gap: '8px' }}>
          <div style={labelStyle}>Recurring commitment</div>
          <div style={metricValueStyle}>{record.name}</div>
          <div style={secondaryTextStyle}>
            Recurring agreements are the CRM commitment and expectation layer.
            Health is derived from the durable agreement facts rather than
            stored as separate metadata.
          </div>
        </div>
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
        <div style={secondaryTextStyle}>{record.health.message}</div>
      </div>

      <div
        style={{
          display: 'grid',
          gap: '12px',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        }}
      >
        <div style={cardStyle}>
          <div style={labelStyle}>Status</div>
          <div style={metricValueStyle}>{record.status}</div>
        </div>
        <div style={cardStyle}>
          <div style={labelStyle}>Cadence</div>
          <div style={metricValueStyle}>
            {record.intervalCount} x {record.cadence}
          </div>
        </div>
        <div style={cardStyle}>
          <div style={labelStyle}>Amount</div>
          <div style={metricValueStyle}>{record.amountLabel}</div>
        </div>
        <div style={cardStyle}>
          <div style={labelStyle}>Next expected</div>
          <div style={metricValueStyle}>{record.nextExpectedAt ?? '—'}</div>
        </div>
      </div>

      <div style={cardStyle}>
        <div style={labelStyle}>Context</div>
        <div style={secondaryTextStyle}>Donor: {record.donorName}</div>
        <div style={secondaryTextStyle}>Provider: {record.provider}</div>
        <div style={secondaryTextStyle}>Start date: {record.startDate ?? '—'}</div>
        <div style={secondaryTextStyle}>End date: {record.endDate ?? '—'}</div>
        <div style={secondaryTextStyle}>
          Provider agreement ID: {record.providerAgreementId ?? '—'}
        </div>
        <div style={secondaryTextStyle}>
          Provider payment method ID: {record.providerPaymentMethodId ?? '—'}
        </div>
        <div style={secondaryTextStyle}>
          Mandate reference: {record.mandateReference ?? '—'}
        </div>
      </div>

      <div style={cardStyle}>
        <div style={labelStyle}>Recent linked gifts</div>
        {record.recentGifts.length === 0 ? (
          <div style={secondaryTextStyle}>
            No committed gifts are currently linked to this agreement.
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '10px' }}>
            {record.recentGifts.map((gift) => (
              <div key={gift.id} style={rowCardStyle}>
                <strong>{gift.name ?? 'Unnamed gift'}</strong>
                <span style={secondaryTextStyle}>
                  {gift.donorFirstName ?? ''} {gift.donorLastName ?? ''}
                </span>
                <span style={secondaryTextStyle}>
                  Gift date: {gift.giftDate ?? '—'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={cardStyle}>
        <div style={labelStyle}>Related staged gifts</div>
        {record.recentGiftStagings.length === 0 ? (
          <div style={secondaryTextStyle}>
            No staged gifts are currently linked to this agreement.
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '10px' }}>
            {record.recentGiftStagings.map((row) => (
              <div key={row.id} style={rowCardStyle}>
                <strong>{row.name ?? 'Unnamed staging row'}</strong>
                <span style={secondaryTextStyle}>
                  {row.donorFirstName ?? ''} {row.donorLastName ?? ''}
                </span>
                <span style={secondaryTextStyle}>
                  Processing status: {row.processingStatus ?? '—'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier:
    RECURRING_AGREEMENT_RECORD_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'recurring-agreement-record',
  description:
    'Recurring agreement health and linkage review in record context.',
  component: RecurringAgreementRecord,
});
