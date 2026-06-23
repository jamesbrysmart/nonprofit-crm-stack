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

export const PERSON_RECORD_SUMMARY_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER =
  '1e1c6282-b236-4e3e-ac0d-c6f495fc4476';

type PersonRecordSummaryRecord = {
  id: string;
  lifetimeGiftAmount?: {
    amountMicros?: number | null;
    currencyCode?: string | null;
  } | null;
  giftCount?: number | null;
  firstGiftDate?: string | null;
  lastGiftDate?: string | null;
  lastGiftAmount?: {
    amountMicros?: number | null;
    currencyCode?: string | null;
  } | null;
  largestGiftAmount?: {
    amountMicros?: number | null;
    currencyCode?: string | null;
  } | null;
  recurringAgreements?: {
    edges?: Array<{
      node?: {
        id?: string | null;
        status?: string | null;
      } | null;
    }>;
  } | null;
  giftAidDeclarations?: {
    edges?: Array<{
      node?: {
        id?: string | null;
        status?: string | null;
        revokedAt?: string | null;
      } | null;
    }>;
  } | null;
  fundraiserAppealSources?: {
    edges?: Array<{
      node?: {
        id?: string | null;
      } | null;
    }>;
  } | null;
};

const normalizeString = (value: string | null | undefined) =>
  typeof value === 'string' ? value.trim() : '';

const formatCurrencyAmount = (
  amount: PersonRecordSummaryRecord['lifetimeGiftAmount'],
  emptyLabel = 'Not recorded',
) => {
  const micros = amount?.amountMicros;
  const currency = normalizeString(amount?.currencyCode) || 'GBP';

  if (typeof micros !== 'number') {
    return emptyLabel;
  }

  try {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency,
    }).format(micros / 1_000_000);
  } catch {
    return `${currency} ${(micros / 1_000_000).toFixed(2)}`;
  }
};

const formatGiftAmountAndDate = (
  amount: PersonRecordSummaryRecord['lastGiftAmount'],
  date: string | null | undefined,
) => {
  const amountLabel = formatCurrencyAmount(amount, '');
  const dateLabel = formatDate(date);

  if (amountLabel !== '' && dateLabel !== 'Not recorded') {
    return `${amountLabel} · ${dateLabel}`;
  }

  return amountLabel || dateLabel;
};

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

const loadPerson = async (
  recordId: string,
): Promise<PersonRecordSummaryRecord | null> => {
  const client = new CoreApiClient();
  const result = await client.query({
    person: {
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
      giftCount: true,
      firstGiftDate: true,
      lastGiftDate: true,
      lastGiftAmount: {
        amountMicros: true,
        currencyCode: true,
      },
      largestGiftAmount: {
        amountMicros: true,
        currencyCode: true,
      },
      recurringAgreements: {
        __args: {
          first: 5,
        },
        edges: {
          node: {
            id: true,
            status: true,
          },
        },
      },
      giftAidDeclarations: {
        __args: {
          first: 5,
        },
        edges: {
          node: {
            id: true,
            status: true,
            revokedAt: true,
          },
        },
      },
      fundraiserAppealSources: {
        __args: {
          first: 25,
        },
        edges: {
          node: {
            id: true,
          },
        },
      },
    },
  } as any);

  return (result?.person as PersonRecordSummaryRecord | null) ?? null;
};

const PersonRecordSummary = () => {
  const recordId = useRecordId();
  const [record, setRecord] = useState<PersonRecordSummaryRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!recordId) {
        setRecord(null);
        setError('No person selected');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const loaded = await loadPerson(recordId);

        if (!loaded) {
          setRecord(null);
          setError('Person not found');
          return;
        }

        setRecord(loaded);
      } catch (loadError) {
        setRecord(null);
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Unable to load person summary',
        );
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, [recordId]);

  if (loading) {
    return <div style={secondaryTextStyle}>Loading person summary...</div>;
  }

  if (error) {
    return <div style={secondaryTextStyle}>{error}</div>;
  }

  if (!record) {
    return <div style={secondaryTextStyle}>Person not found.</div>;
  }

  const recurringCount = record.recurringAgreements?.edges?.filter(
    (edge) => normalizeString(edge.node?.id) !== '',
  ).length ?? 0;
  const activeRecurringCount = record.recurringAgreements?.edges?.filter(
    (edge) => normalizeString(edge.node?.status).toUpperCase() === 'ACTIVE',
  ).length ?? 0;
  const declarationCount = record.giftAidDeclarations?.edges?.filter(
    (edge) => normalizeString(edge.node?.id) !== '',
  ).length ?? 0;
  const activeDeclarationCount = record.giftAidDeclarations?.edges?.filter(
    (edge) => normalizeString(edge.node?.status).toUpperCase() === 'ACTIVE',
  ).length ?? 0;
  const fundraiserSourceCount = record.fundraiserAppealSources?.edges?.filter(
    (edge) => normalizeString(edge.node?.id) !== '',
  ).length ?? 0;
  const giftCount =
    typeof record.giftCount === 'number' ? record.giftCount : 0;
  const hasFundraisingContext =
    giftCount > 0 ||
    recurringCount > 0 ||
    declarationCount > 0 ||
    fundraiserSourceCount > 0;
  const signals = [
    giftCount > 0 ? { label: 'Donor', tone: 'success' } : null,
    fundraiserSourceCount > 0
      ? { label: 'Fundraiser', tone: 'success' }
      : null,
    activeDeclarationCount > 0
      ? { label: 'Gift Aid active', tone: 'success' }
      : declarationCount > 0
        ? { label: 'Gift Aid inactive', tone: 'neutral' }
        : null,
    activeRecurringCount > 0
      ? { label: 'Recurring donor', tone: 'success' }
      : recurringCount > 0
        ? { label: 'Recurring history', tone: 'neutral' }
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
          {giftCount > 0 ? (
            <SummaryStrip>
              <SummaryStripItem label="Lifetime giving">
                <div style={compactValueStyle}>
                  {formatCurrencyAmount(
                    record.lifetimeGiftAmount,
                    'Not recorded',
                  )}
                </div>
              </SummaryStripItem>
              <SummaryStripItem label="Gifts">
                <div style={compactValueStyle}>{giftCount}</div>
              </SummaryStripItem>
              <SummaryStripItem label="Last gift">
                <div style={compactValueStyle}>
                  {formatGiftAmountAndDate(
                    record.lastGiftAmount,
                    record.lastGiftDate,
                  )}
                </div>
              </SummaryStripItem>
              <SummaryStripItem label="Largest gift">
                <div style={compactValueStyle}>
                  {formatCurrencyAmount(record.largestGiftAmount)}
                </div>
              </SummaryStripItem>
            </SummaryStrip>
          ) : null}
        </>
      ) : (
        <div style={contextSignalRowStyle}>
          <span style={badgeStyle('neutral')}>No constituent activity</span>
          <span style={secondaryTextStyle}>Standard CRM contact.</span>
        </div>
      )}
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: PERSON_RECORD_SUMMARY_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'person-record-summary',
  description:
    'General person summary with conditional fundraising context for donor-admin workflows.',
  component: PersonRecordSummary,
});
