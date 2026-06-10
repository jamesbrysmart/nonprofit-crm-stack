import { useEffect, useState } from 'react';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineFrontComponent } from 'twenty-sdk/define';
import { enqueueSnackbar, useRecordId } from 'twenty-sdk/front-component';
import { Button } from 'twenty-sdk/ui';
import { recordGiftRefund } from 'src/gift-lifecycle/gift-refund.api';
import { deriveRefundState } from 'src/gift-lifecycle/gift-refund';
import { subscribeToGiftRecordInvalidated } from 'src/gift-record/gift-record-sync';
import {
  actionRowStyle,
  compactMetaGridStyle,
  compactMetaItemStyle,
  compactWidgetRootStyle,
  inputStyle,
  labelStyle,
  secondaryTextStyle,
} from 'src/front-components/front-component-ui';

export const GIFT_REFUND_ACTION_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER =
  '6d86a03b-c4ec-4a3c-9a77-56c86fbf0ca6';

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
  giftAidClaimBatch?: {
    id?: string | null;
    name?: string | null;
    status?: string | null;
  } | null;
};

const normalizeString = (value: string | null | undefined) =>
  typeof value === 'string' ? value.trim() : '';

const getInputEventValue = (event: unknown) => {
  if (
    typeof event === 'object' &&
    event !== null &&
    'detail' in event &&
    typeof event.detail === 'object' &&
    event.detail !== null &&
    'value' in event.detail
  ) {
    return String(event.detail.value ?? '');
  }

  if (
    typeof event === 'object' &&
    event !== null &&
    'target' in event &&
    typeof event.target === 'object' &&
    event.target !== null &&
    'value' in event.target
  ) {
    return String((event.target as { value?: unknown }).value ?? '');
  }

  return '';
};

const formatAmount = (amount: RefundActionGiftRecord['amount']) => {
  const micros = amount?.amountMicros;
  const currency = normalizeString(amount?.currencyCode) || 'GBP';

  if (typeof micros !== 'number') {
    return 'Amount not recorded';
  }

  return `${currency} ${(micros / 1_000_000).toFixed(2)}`;
};

const formatAmountFromMicros = (amountMicros: number, currencyCode: string) =>
  `${currencyCode} ${(amountMicros / 1_000_000).toFixed(2)}`;

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
      giftAidClaimBatch: {
        id: true,
        name: true,
        status: true,
      },
    },
  } as any);

  return (result?.gift as RefundActionGiftRecord | null) ?? null;
};

const GiftRefundAction = () => {
  const recordId = useRecordId();
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
        setRefundedAmountInput(
          microsToDecimalInput(loaded.refundedAmount?.amountMicros),
        );
        setRefundDateInput(toDateInputValue(loaded.refundDate));
        setRefundNoteInput(normalizeString(loaded.refundNote));
      },
    });
  }, [recordId]);

  if (loading) {
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
  const currencyCode = normalizeString(record.amount?.currencyCode) || 'GBP';
  const linkedClaimBatchStatus = normalizeString(record.giftAidClaimBatch?.status);
  const linkedClaimBatchName = normalizeString(record.giftAidClaimBatch?.name);
  const isFinalizedGiftAidClaim = linkedClaimBatchStatus === 'FINALIZED';

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
      <div style={{ ...secondaryTextStyle, color: '#1f2328' }}>
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
          <div>{formatAmountFromMicros(remainingAmountMicros, currencyCode)}</div>
        </div>
      </div>

      {isFinalizedGiftAidClaim ? (
        <div style={{ ...secondaryTextStyle, color: '#7c5700' }}>
          {linkedClaimBatchName === ''
            ? 'This gift is already part of finalized Gift Aid claim work. Refund follow-up for finalized claims is not implemented in this first pass.'
            : `This gift is already part of finalized Gift Aid claim work (${linkedClaimBatchName}). Refund follow-up for finalized claims is not implemented in this first pass.`}
        </div>
      ) : (
        <>
          <div style={compactMetaGridStyle}>
            <div style={compactMetaItemStyle}>
              <div style={labelStyle}>Refunded amount</div>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={refundedAmountInput}
                onChange={(event) => {
                  setRefundedAmountInput(getInputEventValue(event));
                }}
                style={inputStyle}
              />
            </div>
            <div style={compactMetaItemStyle}>
              <div style={labelStyle}>Refund date</div>
              <input
                type="date"
                value={refundDateInput}
                onChange={(event) => {
                  setRefundDateInput(getInputEventValue(event));
                }}
                style={inputStyle}
              />
            </div>
          </div>

          <div style={compactMetaItemStyle}>
            <div style={labelStyle}>Refund note</div>
            <textarea
              value={refundNoteInput}
              onChange={(event) => {
                setRefundNoteInput(getInputEventValue(event));
              }}
              rows={3}
              style={inputStyle}
            />
          </div>

          <div style={actionRowStyle}>
            <Button
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

          {normalizeString(record.giftAidClaimBatch?.id) !== '' &&
          linkedClaimBatchStatus === 'DRAFT' ? (
            <div style={{ ...secondaryTextStyle, color: '#1f2328' }}>
              This gift is currently in draft Gift Aid claim work. Recording a refund will remove it from that draft claim in this first pass.
            </div>
          ) : null}
        </>
      )}
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
