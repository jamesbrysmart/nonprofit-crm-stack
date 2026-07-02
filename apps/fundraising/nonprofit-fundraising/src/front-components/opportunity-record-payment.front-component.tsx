import { useEffect, useMemo, useState } from 'react';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineFrontComponent } from 'twenty-sdk/define';
import { enqueueSnackbar, useRecordId } from 'twenty-sdk/front-component';
import { extractQueryRecord } from 'src/core-api/core-api-results';
import {
  ActionButton,
  actionRowStyle,
  badgeStyle,
  compactDividerSectionStyle,
  compactWidgetRootStyle,
  inputStyle,
  labelStyle,
  secondaryTextStyle,
  SummaryStrip,
  SummaryStripItem,
  textareaStyle,
} from 'src/front-components/front-component-ui';
import { createManualGift } from 'src/manual-gift-entry/manual-gift-entry.api';
import type { ManualGiftPaymentType } from 'src/manual-gift-entry/manual-gift-entry.types';
import {
  PAYMENT_TYPE_OPTIONS,
  getInputEventValue,
} from 'src/manual-gift-entry/new-gift-support';
import { deriveGiftTypeForOpportunityPayment } from 'src/opportunity-payments/opportunity-payment-gift-type';

export const OPPORTUNITY_RECORD_PAYMENT_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER =
  'dd442e7b-aba3-418d-9717-0c6849d7304a';

type CurrencyAmount = {
  amountMicros?: number | null;
  currencyCode?: string | null;
};

type OpportunityLinkedGift = {
  id: string;
  giftDate?: string | null;
  giftType?: string | null;
  amount?: CurrencyAmount | null;
};

type OpportunityPaymentRecord = {
  id: string;
  name?: string | null;
  fundingType?: string | null;
  amount?: CurrencyAmount | null;
  awardedAmount?: CurrencyAmount | null;
  company?: {
    id?: string | null;
    name?: string | null;
  } | null;
  gifts?: {
    edges?: Array<{
      node?: OpportunityLinkedGift | null;
    }> | null;
  } | null;
};

const GIFT_TYPE_LABELS = {
  DONATION: 'Donation',
  GRANT: 'Grant',
  SPONSORSHIP: 'Sponsorship',
  GIFT_IN_KIND: 'Gift in kind',
};

const normalizeString = (value: string | null | undefined) =>
  typeof value === 'string' ? value.trim() : '';

const todayDate = () => new Date().toISOString().slice(0, 10);

const parseAmountMicros = (amountValue: string) => {
  const parsed = Number.parseFloat(amountValue.trim());

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return Math.round(parsed * 1_000_000);
};

const normalizeCurrencyCode = (currencyCode: string | null | undefined) => {
  const normalized = normalizeString(currencyCode).toUpperCase();

  return normalized === '' ? 'GBP' : normalized;
};

const getOpportunityCurrencyCode = (record: OpportunityPaymentRecord) =>
  normalizeCurrencyCode(
    record.awardedAmount?.currencyCode ?? record.amount?.currencyCode ?? 'GBP',
  );

const formatMoney = (amountMicros: number | null, currencyCode: string) => {
  if (typeof amountMicros !== 'number' || !Number.isFinite(amountMicros)) {
    return '-';
  }

  return `${currencyCode} ${(amountMicros / 1_000_000).toLocaleString(
    undefined,
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  )}`;
};

const getLinkedGifts = (record: OpportunityPaymentRecord) =>
  record.gifts?.edges
    ?.map((edge) => edge.node)
    .filter((gift): gift is OpportunityLinkedGift => Boolean(gift?.id)) ?? [];

const getReceivedAmountMicros = (
  gifts: OpportunityLinkedGift[],
  currencyCode: string,
) =>
  gifts
    .filter(
      (gift) =>
        gift.giftType !== 'GIFT_IN_KIND' &&
        normalizeCurrencyCode(gift.amount?.currencyCode) === currencyCode,
    )
    .reduce((total, gift) => total + (gift.amount?.amountMicros ?? 0), 0);

const hasSameLinkedGift = (
  gifts: OpportunityLinkedGift[],
  giftDate: string,
  amountMicros: number | null,
  currencyCode: string,
) => {
  if (giftDate === '' || amountMicros === null) {
    return false;
  }

  return gifts.some(
    (gift) =>
      gift.giftDate === giftDate &&
      gift.amount?.amountMicros === amountMicros &&
      normalizeCurrencyCode(gift.amount?.currencyCode) === currencyCode,
  );
};

const loadOpportunity = async (
  recordId: string,
): Promise<OpportunityPaymentRecord | null> => {
  const client = new CoreApiClient();
  const result = await client.query({
    opportunity: {
      __args: {
        filter: {
          id: { eq: recordId },
        },
      },
      id: true,
      name: true,
      fundingType: true,
      amount: {
        amountMicros: true,
        currencyCode: true,
      },
      awardedAmount: {
        amountMicros: true,
        currencyCode: true,
      },
      company: {
        id: true,
        name: true,
      },
      gifts: {
        edges: {
          node: {
            id: true,
            giftDate: true,
            giftType: true,
            amount: {
              amountMicros: true,
              currencyCode: true,
            },
          },
        },
      },
    },
  } as any);

  return extractQueryRecord<OpportunityPaymentRecord>(result, 'opportunity') ?? null;
};

const OpportunityRecordPayment = () => {
  const recordId = useRecordId();
  const [record, setRecord] = useState<OpportunityPaymentRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [amountValue, setAmountValue] = useState('');
  const [giftDate, setGiftDate] = useState(todayDate());
  const [paymentType, setPaymentType] =
    useState<ManualGiftPaymentType | ''>('BANK_TRANSFER');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const refresh = async () => {
    if (!recordId) {
      return null;
    }

    const refreshedRecord = await loadOpportunity(recordId);
    setRecord(refreshedRecord);

    return refreshedRecord;
  };

  useEffect(() => {
    let active = true;

    const load = async () => {
      if (!recordId) {
        setRecord(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const loadedRecord = await loadOpportunity(recordId);

        if (active) {
          setRecord(loadedRecord);
        }
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'Unable to load opportunity payment context.',
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, [recordId]);

  const paymentContext = useMemo(() => {
    if (!record) {
      return null;
    }

    const currencyCode = getOpportunityCurrencyCode(record);
    const linkedGifts = getLinkedGifts(record);
    const receivedAmountMicros = getReceivedAmountMicros(
      linkedGifts,
      currencyCode,
    );
    const awardedAmountMicros =
      typeof record.awardedAmount?.amountMicros === 'number'
        ? record.awardedAmount.amountMicros
        : null;

    return {
      currencyCode,
      linkedGifts,
      receivedAmountMicros,
      awardedAmountMicros,
      remainingAmountMicros:
        awardedAmountMicros === null
          ? null
          : awardedAmountMicros - receivedAmountMicros,
    };
  }, [record]);

  if (loading) {
    return <div style={secondaryTextStyle}>Loading payment action...</div>;
  }

  if (error !== '') {
    return <div style={secondaryTextStyle}>{error}</div>;
  }

  if (!record || !paymentContext) {
    return <div style={secondaryTextStyle}>Opportunity not found.</div>;
  }

  const companyId = normalizeString(record.company?.id);
  const companyName = normalizeString(record.company?.name);
  const giftType = deriveGiftTypeForOpportunityPayment(record.fundingType);
  const parsedAmountMicros = parseAmountMicros(amountValue);
  const duplicateLinkedGift = hasSameLinkedGift(
    paymentContext.linkedGifts,
    giftDate,
    parsedAmountMicros,
    paymentContext.currencyCode,
  );
  const canSubmit =
    !submitting &&
    companyId !== '' &&
    parsedAmountMicros !== null &&
    giftDate.trim() !== '' &&
    paymentType !== '';

  const handleSubmit = async () => {
    if (!canSubmit) {
      await enqueueSnackbar({
        message:
          'Add a company, amount, gift date, and payment type before recording payment.',
        variant: 'warning',
      });
      return;
    }

    setSubmitting(true);

    try {
      await createManualGift({
        donorType: 'COMPANY',
        companyName,
        giftType,
        amountValue: amountValue.trim(),
        currencyCode: paymentContext.currencyCode,
        paymentType,
        giftDate: giftDate.trim(),
        ...(description.trim() !== ''
          ? { description: description.trim() }
          : {}),
        companyChoice: 'USE_EXISTING',
        selectedCompanyId: companyId,
        selectedOpportunityId: record.id,
      });

      await refresh();
      setAmountValue('');
      setGiftDate(todayDate());
      setPaymentType('BANK_TRANSFER');
      setDescription('');

      await enqueueSnackbar({
        message: 'Payment recorded.',
        variant: 'success',
      });
    } catch (submitError) {
      await enqueueSnackbar({
        message:
          submitError instanceof Error
            ? submitError.message
            : 'Unable to record payment.',
        variant: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={compactWidgetRootStyle}>
      <div style={actionRowStyle}>
        <span style={badgeStyle(companyId === '' ? 'warning' : 'neutral')}>
          Record payment
        </span>
      </div>

      <SummaryStrip>
        <SummaryStripItem label="Company">
          <strong>{companyName === '' ? 'No company set' : companyName}</strong>
        </SummaryStripItem>
        <SummaryStripItem label="Funding type">
          <strong>{normalizeString(record.fundingType) || '-'}</strong>
        </SummaryStripItem>
        <SummaryStripItem label="Awarded amount">
          <strong>
            {formatMoney(
              paymentContext.awardedAmountMicros,
              paymentContext.currencyCode,
            )}
          </strong>
        </SummaryStripItem>
        <SummaryStripItem label="Received so far">
          <strong>
            {formatMoney(
              paymentContext.receivedAmountMicros,
              paymentContext.currencyCode,
            )}
          </strong>
        </SummaryStripItem>
        <SummaryStripItem label="Remaining">
          <strong>
            {formatMoney(
              paymentContext.remainingAmountMicros,
              paymentContext.currencyCode,
            )}
          </strong>
        </SummaryStripItem>
        <SummaryStripItem label="Gift type">
          <strong>{GIFT_TYPE_LABELS[giftType]}</strong>
        </SummaryStripItem>
      </SummaryStrip>

      <div
        style={{
          display: 'grid',
          gap: '10px',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        }}
      >
        <label style={{ display: 'grid', gap: '6px' }}>
          <span style={labelStyle}>Amount</span>
          <input
            style={inputStyle}
            value={amountValue}
            inputMode="decimal"
            onChange={(event) => setAmountValue(getInputEventValue(event))}
          />
        </label>
        <label style={{ display: 'grid', gap: '6px' }}>
          <span style={labelStyle}>Gift date</span>
          <input
            style={inputStyle}
            type="date"
            value={giftDate}
            onChange={(event) => setGiftDate(getInputEventValue(event))}
          />
        </label>
        <label style={{ display: 'grid', gap: '6px' }}>
          <span style={labelStyle}>Payment type</span>
          <select
            style={inputStyle}
            value={paymentType}
            onChange={(event) =>
              setPaymentType(
                getInputEventValue(event) as ManualGiftPaymentType,
              )
            }
          >
            {PAYMENT_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label style={{ display: 'grid', gap: '6px' }}>
        <span style={labelStyle}>Gift description</span>
        <textarea
          style={{ ...textareaStyle, minHeight: '64px' }}
          value={description}
          placeholder="Optional description saved on the created gift, e.g. first instalment of 3"
          onChange={(event) => setDescription(getInputEventValue(event))}
        />
      </label>

      {companyId === '' || duplicateLinkedGift ? (
        <div style={compactDividerSectionStyle}>
          {companyId === '' ? (
            <div style={secondaryTextStyle}>
              Add a Company/funder to this Opportunity before recording a
              payment.
            </div>
          ) : null}
          {duplicateLinkedGift ? (
            <div style={secondaryTextStyle}>
              A linked gift already has this date, amount, and currency.
            </div>
          ) : null}
        </div>
      ) : null}

      <ActionButton
        title={submitting ? 'Recording...' : 'Record payment'}
        variant="primary"
        onClick={() => {
          void handleSubmit();
        }}
        disabled={!canSubmit}
      />
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier:
    OPPORTUNITY_RECORD_PAYMENT_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'opportunity-record-payment',
  description: 'Records a linked gift payment from an opportunity.',
  component: OpportunityRecordPayment,
});
