import { useEffect, useState } from 'react';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineFrontComponent } from 'twenty-sdk/define';
import { enqueueSnackbar } from 'twenty-sdk/front-component';
import { Status } from 'twenty-ui/primitives/data-display';
import {
  ActionButton,
  actionRowStyle,
  compactDividerSectionStyle,
  compactWidgetRootStyle,
  secondaryTextStyle,
} from 'src/front-components/front-component-ui';
import {
  FormInput,
  FormSelect,
  FormTextarea,
} from 'src/front-components/form-controls';
import { useReloadOnTabChange } from 'src/front-components/use-reload-on-tab-change';
import { createManualGift } from 'src/manual-gift-entry/manual-gift-entry.api';
import type { ManualGiftPaymentType } from 'src/manual-gift-entry/manual-gift-entry.types';
import { PAYMENT_TYPE_OPTIONS } from 'src/manual-gift-entry/new-gift-support';
import { createRecordNote } from 'src/notes/create-record-note';
import { useRecurringAgreementReviewRecord } from 'src/recurring/use-recurring-agreement-review-record';
import {
  RECURRING_AGREEMENT_RECORD_PAYMENT_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

const todayDate = () => new Date().toISOString().slice(0, 10);

const formatAmountInput = (amountMicros: number | null) => {
  if (typeof amountMicros !== 'number' || !Number.isFinite(amountMicros)) {
    return '';
  }

  return (amountMicros / 1_000_000).toFixed(2);
};

const parseAmountMicros = (amountValue: string) => {
  const parsed = Number.parseFloat(amountValue.trim());

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return Math.round(parsed * 1_000_000);
};

const getInitialGiftDate = (nextExpectedAt: string | null) =>
  nextExpectedAt ?? todayDate();

const createGiftPaymentNote = async (args: {
  giftId: string;
  note: string;
}) => {
  const note = args.note.trim();

  if (note === '') {
    return null;
  }

  const client = new CoreApiClient();

  return createRecordNote(client, {
    title: 'Recurring payment note',
    body: note,
    targetIdFieldName: 'targetGiftId',
    targetRecordId: args.giftId,
  });
};

const hasSameLinkedGift = (
  recentGifts: Array<{
    giftDate: string | null;
    amount:
      | {
          amountMicros?: number | null;
          currencyCode?: string | null;
        }
      | null;
  }>,
  giftDate: string,
  amountMicros: number | null,
) => {
  if (giftDate === '' || amountMicros === null) {
    return false;
  }

  return recentGifts.some(
    (gift) =>
      gift.giftDate === giftDate &&
      gift.amount?.amountMicros === amountMicros,
  );
};

const RecurringAgreementRecordPayment = () => {
  const { record, loading, error, refresh } = useRecurringAgreementReviewRecord();
  const [amountValue, setAmountValue] = useState('');
  const [giftDate, setGiftDate] = useState('');
  const [paymentType, setPaymentType] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Keeps typed values: the form only resets when the agreement changes.
  useReloadOnTabChange(() => {
    void refresh();
  });

  useEffect(() => {
    if (!record) {
      return;
    }

    setAmountValue(formatAmountInput(record.amountMicros));
    setGiftDate(getInitialGiftDate(record.nextExpectedAt));
    setPaymentType(record.paymentType ?? '');
    setNote('');
  }, [record?.id]);

  if (loading && !record) {
    return <div style={secondaryTextStyle}>Loading payment action...</div>;
  }

  if (error) {
    return <div style={secondaryTextStyle}>{error}</div>;
  }

  if (!record) {
    return <div style={secondaryTextStyle}>Recurring agreement not found.</div>;
  }

  const parsedAmountMicros = parseAmountMicros(amountValue);
  const amountDiffers =
    record.amountMicros !== null &&
    parsedAmountMicros !== null &&
    parsedAmountMicros !== record.amountMicros;
  const dateDiffers =
    Boolean(record.nextExpectedAt) &&
    giftDate !== '' &&
    giftDate !== record.nextExpectedAt;
  const paymentTypeDiffers =
    Boolean(record.paymentType) &&
    paymentType !== '' &&
    paymentType !== record.paymentType;
  const duplicateLinkedGift = hasSameLinkedGift(
    record.recentGifts,
    giftDate,
    parsedAmountMicros,
  );
  const statusNeedsAttention = record.status !== 'ACTIVE';
  const canSubmit =
    !submitting &&
    record.donorId !== null &&
    record.donorFirstName !== '' &&
    record.donorLastName !== '' &&
    parsedAmountMicros !== null &&
    giftDate.trim() !== '' &&
    paymentType !== '';

  const handleSubmit = async () => {
    if (!canSubmit) {
      await enqueueSnackbar({
        message:
          'Complete donor, amount, gift date, and payment type before recording payment.',
        variant: 'warning',
      });
      return;
    }

    setSubmitting(true);

    try {
      const createGiftResult = await createManualGift({
        donorType: 'INDIVIDUAL',
        donorFirstName: record.donorFirstName,
        donorLastName: record.donorLastName,
        ...(record.donorEmail ? { donorEmail: record.donorEmail } : {}),
        giftType: 'DONATION',
        amountValue: amountValue.trim(),
        currencyCode: record.currencyCode,
        paymentType: paymentType as ManualGiftPaymentType,
        giftDate: giftDate.trim(),
        ...(record.fundId ? { selectedFundId: record.fundId } : {}),
        ...(record.appealId ? { selectedAppealId: record.appealId } : {}),
        ...(record.appealSourceId
          ? { selectedAppealSourceId: record.appealSourceId }
          : {}),
        donorChoice: 'USE_EXISTING',
        selectedDonorId: record.donorId ?? undefined,
        selectedRecurringAgreementId: record.id,
      });

      let noteWarning = '';

      try {
        await createGiftPaymentNote({
          giftId: createGiftResult.giftId,
          note,
        });
      } catch (noteError) {
        noteWarning =
          noteError instanceof Error
            ? noteError.message
            : 'Unable to save payment note.';
      }

      const refreshedRecord = await refresh();

      if (refreshedRecord) {
        setAmountValue(formatAmountInput(refreshedRecord.amountMicros));
        setGiftDate(getInitialGiftDate(refreshedRecord.nextExpectedAt));
        setPaymentType(refreshedRecord.paymentType ?? '');
      }

      if (noteWarning !== '') {
        await enqueueSnackbar({
          message: `Recurring payment recorded, but the note was not saved: ${noteWarning}`,
          variant: 'warning',
        });
      } else {
        await enqueueSnackbar({
          message: 'Recurring payment recorded.',
          variant: 'success',
        });
      }

      setNote('');
    } catch (submitError) {
      await enqueueSnackbar({
        message:
          submitError instanceof Error
            ? submitError.message
            : 'Unable to record recurring payment.',
        variant: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={compactWidgetRootStyle}>
      <div style={actionRowStyle}>
        <Status color={statusNeedsAttention ? 'amber' : 'gray'} weight="medium">
          Record payment
        </Status>
      </div>

      <div style={secondaryTextStyle}>
        Create a linked gift from this recurring agreement. The gift uses the
        agreement donor and coding shown in the summary.
      </div>

      <div
        style={{
          display: 'grid',
          gap: '10px',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        }}
      >
        <FormInput
          label="Amount"
          inputMode="decimal"
          value={amountValue}
          onChange={setAmountValue}
        />
        <FormInput
          label="Gift date"
          type="date"
          value={giftDate}
          onChange={setGiftDate}
        />
        <FormSelect
          label="Payment type"
          value={paymentType}
          onChange={setPaymentType}
          emptyOptionLabel="Select payment type"
          options={PAYMENT_TYPE_OPTIONS.map((option) => ({
            value: option.value,
            label: option.label,
          }))}
        />
      </div>

      <FormTextarea
        label="Payment note"
        rows={2}
        value={note}
        placeholder="Optional note saved on the created gift"
        onChange={setNote}
      />

      {statusNeedsAttention ||
      amountDiffers ||
      dateDiffers ||
      paymentTypeDiffers ||
      duplicateLinkedGift ? (
        <div style={compactDividerSectionStyle}>
          {statusNeedsAttention ? (
            <div style={secondaryTextStyle}>
              This agreement is {record.status.toLowerCase()}; record payment
              only if this is expected.
            </div>
          ) : null}
          {amountDiffers ? (
            <div style={secondaryTextStyle}>
              The payment amount differs from the agreement amount.
            </div>
          ) : null}
          {dateDiffers ? (
            <div style={secondaryTextStyle}>
              The gift date differs from the next expected date.
            </div>
          ) : null}
          {paymentTypeDiffers ? (
            <div style={secondaryTextStyle}>
              The payment type differs from the agreement payment type.
            </div>
          ) : null}
          {duplicateLinkedGift ? (
            <div style={secondaryTextStyle}>
              A recent linked gift already has this date and amount.
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
    RECURRING_AGREEMENT_RECORD_PAYMENT_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'recurring-agreement-record-payment',
  description: 'Records a linked gift payment from a recurring agreement.',
  component: RecurringAgreementRecordPayment,
});
