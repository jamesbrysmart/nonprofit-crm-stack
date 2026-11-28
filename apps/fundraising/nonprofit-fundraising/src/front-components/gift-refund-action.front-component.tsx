import { useEffect, useState } from 'react';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineFrontComponent } from 'twenty-sdk/define';
import { enqueueSnackbar, } from 'twenty-sdk/front-component';
import { recordGiftRefund } from 'src/gift-lifecycle/gift-refund.api';
import { deriveRefundState } from 'src/gift-lifecycle/gift-refund';
import { FormInput, FormTextarea } from 'src/front-components/form-controls';
import { theme } from 'src/front-components/theme-tokens';
import { useReloadOnTabChange } from 'src/front-components/use-reload-on-tab-change';
import {
  ActionButton,
  actionRowStyle,
  compactMetaGridStyle,
  compactMetaItemStyle,
  compactWidgetRootStyle,
  labelStyle,
  secondaryTextStyle,
} from 'src/front-components/front-component-ui';
import {
  GIFT_REFUND_ACTION_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { getDefaultCurrencyCode } from 'src/reporting-currency/reporting-currency';
import { normalizeString } from 'src/utils/normalize-string';
import { formatCurrencyAmount } from 'src/utils/format-currency-amount';
import { useSingleSelectedRecordId } from 'src/front-components/use-single-selected-record-id';

type RefundActionGiftRecord = {
  id: string;
  amount?: {
    amountMicros?: number | null;
    currencyCode?: string | null;
  } | null;
  refundedAmount?: {
    amountMicros?: number | null;
    currencyCode?: string | null;
  } | null;
  refundDate?: string | null;
  refundNote?: string | null;
};

const formatAmount = (
  amount: { amountMicros?: number | null; currencyCode?: string | null } | null | undefined,
) => formatCurrencyAmount(amount, 'Amount not recorded');

const microsToDecimalInput = (amountMicros?: number | null) => {
  if (typeof amountMicros !== 'number' || !Number.isFinite(amountMicros)) {
    return '';
  }

  return (amountMicros / 1_000_000).toFixed(2);
};

const decimalInputToMicros = (value: string) => {
  const normalized = value.trim();

  if (normalized === '') {
    return null;
  }

  const parsed = Number(normalized);

  if (!Number.isFinite(parsed)) {
    return null;
  }

  return Math.round(parsed * 1_000_000);
};

const toDateInputValue = (value: string | null | undefined) => {
  const normalized = normalizeString(value);

  if (normalized === '') {
    return '';
  }

  return normalized.slice(0, 10);
};

const loadGift = async (recordId: string): Promise<RefundActionGiftRecord | null> => {
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
      refundedAmount: {
        amountMicros: true,
        currencyCode: true,
      },
      refundDate: true,
      refundNote: true,
    },
  });

  return (result?.gift as RefundActionGiftRecord | null) ?? null;
};

const GiftRefundAction = () => {
  const recordId = useSingleSelectedRecordId();
  const [record, setRecord] = useState<RefundActionGiftRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [refundedAmountInput, setRefundedAmountInput] = useState('');
  const [refundDateInput, setRefundDateInput] = useState('');
  const [refundNoteInput, setRefundNoteInput] = useState('');

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
        setRefundedAmountInput(microsToDecimalInput(loaded.refundedAmount?.amountMicros));
        setRefundDateInput(toDateInputValue(loaded.refundDate));
        setRefundNoteInput(normalizeString(loaded.refundNote));
      } catch (loadError) {
        setRecord(null);
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Unable to load refund action',
        );
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, [recordId]);

  useReloadOnTabChange(() => {
    if (!recordId) {
      return;
    }

    void (async () => {
        const loaded = await loadGift(recordId);

        if (!loaded) {
          return;
        }

        setRecord(loaded);
        setRefundedAmountInput(
          microsToDecimalInput(loaded.refundedAmount?.amountMicros),
        );
        setRefundDateInput(toDateInputValue(loaded.refundDate));
        setRefundNoteInput(normalizeString(loaded.refundNote));
    })();
  });

  if (loading && !record) {
    return <div style={secondaryTextStyle}>Loading refund action...</div>;
  }

  if (error) {
    return <div style={secondaryTextStyle}>{error}</div>;
  }

  if (!record) {
    return <div style={secondaryTextStyle}>Gift not found.</div>;
  }

  const refundState = deriveRefundState({
    amount: record.amount,
    refundedAmount: record.refundedAmount,
  });
  const originalAmountMicros =
    typeof record.amount?.amountMicros === 'number'
      ? Math.round(record.amount.amountMicros)
      : 0;
  const refundedAmountMicros =
    typeof record.refundedAmount?.amountMicros === 'number'
      ? Math.round(record.refundedAmount.amountMicros)
      : 0;
  const remainingAmountMicros = Math.max(
    0,
    originalAmountMicros - refundedAmountMicros,
  );
  const currencyCode = normalizeString(record.amount?.currencyCode) || getDefaultCurrencyCode();

  const handleRecordRefund = async () => {
    if (!recordId) {
      return;
    }

    const refundedAmountMicrosFromInput =
      decimalInputToMicros(refundedAmountInput);

    if (
      refundedAmountMicrosFromInput === null ||
      refundedAmountMicrosFromInput <= 0
    ) {
      await enqueueSnackbar({
        message: 'Enter a refunded amount greater than zero.',
        variant: 'error',
      });
      return;
    }

    if (refundDateInput.trim() === '') {
      await enqueueSnackbar({
        message: 'Enter the refund date.',
        variant: 'error',
      });
      return;
    }

    setSaving(true);

    try {
      const result = await recordGiftRefund({
        giftId: recordId,
        refundedAmountMicros: refundedAmountMicrosFromInput,
        refundDate: refundDateInput,
        refundNote: refundNoteInput.trim() === '' ? null : refundNoteInput.trim(),
      });

      const message =
        result.refundState === 'FULLY_REFUNDED'
          ? 'Gift marked as fully refunded.'
          : 'Refund recorded on gift.';

      await enqueueSnackbar({
        message,
        variant: 'success',
      });

      const loaded = await loadGift(recordId);
      if (loaded) {
        setRecord(loaded);
      }
    } catch (refundError) {
      await enqueueSnackbar({
        message:
          refundError instanceof Error
            ? refundError.message
            : 'Unable to record refund.',
        variant: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={compactWidgetRootStyle}>
      <div style={{ ...secondaryTextStyle, color: theme.font.color.primary }}>
        {refundState === 'NOT_REFUNDED'
          ? 'Record a full or partial refund without changing the original gift amount.'
          : refundState === 'PARTIALLY_REFUNDED'
            ? 'This gift already has a recorded partial refund. Update the refunded total if more money has been returned.'
            : 'This gift is fully refunded. You can still correct the recorded refund facts if needed.'}
      </div>

      <div style={compactMetaGridStyle}>
        <div style={compactMetaItemStyle}>
          <div style={labelStyle}>Original amount</div>
          <div>{formatAmount(record.amount)}</div>
        </div>
        <div style={compactMetaItemStyle}>
          <div style={labelStyle}>Refunded total</div>
          <div>{formatAmount(record.refundedAmount)}</div>
        </div>
        <div style={compactMetaItemStyle}>
          <div style={labelStyle}>Remaining active value</div>
          <div>{formatCurrencyAmount({
            amountMicros: remainingAmountMicros,
            currencyCode,
          })}</div>
        </div>
      </div>

      <div style={compactMetaGridStyle}>
        <FormInput
          label="Refunded amount"
          inputMode="decimal"
          value={refundedAmountInput}
          onChange={setRefundedAmountInput}
        />
        <FormInput
          label="Refund date"
          type="date"
          value={refundDateInput}
          onChange={setRefundDateInput}
        />
      </div>

      <FormTextarea
        label="Refund note"
        rows={3}
        value={refundNoteInput}
        onChange={setRefundNoteInput}
      />

      <div style={actionRowStyle}>
        <ActionButton
          title={
            saving
              ? 'Saving refund...'
              : refundState === 'NOT_REFUNDED'
                ? 'Record refund'
                : 'Update refund'
          }
          variant="primary"
          accent="blue"
          onClick={() => {
            void handleRecordRefund();
          }}
          disabled={saving}
        />
      </div>
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier:
    GIFT_REFUND_ACTION_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'gift-refund-action',
  description: 'Controlled refund action for a committed gift record.',
  component: GiftRefundAction,
});
