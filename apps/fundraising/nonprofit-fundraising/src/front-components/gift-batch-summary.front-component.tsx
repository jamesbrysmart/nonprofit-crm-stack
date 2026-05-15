import { useEffect, useState } from 'react';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineFrontComponent } from 'twenty-sdk/define';
import { enqueueSnackbar, useRecordId } from 'twenty-sdk/front-component';
import { Button } from 'twenty-sdk/ui';
import {
  actionRowStyle,
  badgeStyle,
  compactMetaGridStyle,
  compactMetaItemStyle,
  compactWidgetRootStyle,
  inputStyle,
  labelStyle,
  secondaryTextStyle,
  subtlePanelStyle,
} from 'src/front-components/gift-staging-review-ui';
import { broadcastGiftBatchInvalidated } from 'src/gift-batch-review/gift-batch-sync';
import { useGiftBatchReview } from 'src/gift-batch-review/use-gift-batch-review';

export const GIFT_BATCH_SUMMARY_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER =
  'ad9b4651-f8ea-40a2-b714-bda5d8ef16ce';

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

const updateGiftBatchSetup = async (
  recordId: string,
  input: {
    expectedItemCount: string;
    expectedTotalAmount: string;
    currencyCode: string;
  },
) => {
  const client = new CoreApiClient();
  const normalizedCount = input.expectedItemCount.trim();
  const parsedCount =
    normalizedCount === '' ? null : Number.parseInt(normalizedCount, 10);

  if (
    normalizedCount !== '' &&
    (!Number.isFinite(parsedCount) || parsedCount === null || parsedCount < 0)
  ) {
    throw new Error('Expected item count must be a whole number or left blank.');
  }

  const amountMicros = decimalInputToMicros(input.expectedTotalAmount);

  if (input.expectedTotalAmount.trim() !== '' && amountMicros === null) {
    throw new Error('Expected total amount must be a valid number or left blank.');
  }

  await client.mutation({
    updateGiftBatch: {
      __args: {
        id: recordId,
        data: {
          expectedItemCount: parsedCount,
          expectedTotalAmount:
            amountMicros === null
              ? null
              : {
                  amountMicros,
                  currencyCode: input.currencyCode.trim() || 'GBP',
                },
        },
      },
      id: true,
    },
  } as any);
};

const getOperationalState = (input: {
  totalItems: number;
  failedItems: number;
  needsReviewItems: number;
  readyItems: number;
  processedItems: number;
  isOverWorkflowLimit: boolean;
}) => {
  if (input.isOverWorkflowLimit) {
    return {
      label: 'Batch too large',
      tone: 'warning' as const,
      message: 'This batch is above the supported pilot limit and must be split before workflow actions can continue.',
    };
  }

  if (input.totalItems === 0) {
    return {
      label: 'Empty batch',
      tone: 'neutral' as const,
      message: null,
    };
  }

  if (input.failedItems > 0) {
    return {
      label: 'Needs attention',
      tone: 'warning' as const,
      message: 'Some rows failed during processing and need follow-up.',
    };
  }

  if (input.needsReviewItems > 0) {
    return {
      label: 'Needs review',
      tone: 'warning' as const,
      message: 'Some rows still need review before they can be processed.',
    };
  }

  if (input.readyItems > 0) {
    return {
      label: 'Ready to process',
      tone: 'success' as const,
      message: 'This batch has rows ready to process now.',
    };
  }

  if (input.processedItems === input.totalItems) {
    return {
      label: 'Processed',
      tone: 'success' as const,
      message: 'All rows in this batch have already been processed.',
    };
  }

  return {
    label: 'In review',
    tone: 'neutral' as const,
    message: 'Use the worklists below to review and route the remaining rows.',
  };
};

const GiftBatchSummary = () => {
  const recordId = useRecordId();
  const { record, loading, error } = useGiftBatchReview(recordId);
  const [expectedItemCountInput, setExpectedItemCountInput] = useState('');
  const [expectedTotalAmountInput, setExpectedTotalAmountInput] = useState('');
  const [expectedTotalCurrencyCode, setExpectedTotalCurrencyCode] =
    useState('GBP');
  const [savingSetup, setSavingSetup] = useState(false);

  useEffect(() => {
    if (!record) {
      return;
    }

    setExpectedItemCountInput(
      record.expectedItemCount === null ? '' : String(record.expectedItemCount),
    );
    setExpectedTotalAmountInput(
      microsToDecimalInput(record.expectedTotalAmount?.amountMicros),
    );
    setExpectedTotalCurrencyCode(
      record.expectedTotalAmount?.currencyCode?.trim() || 'GBP',
    );
  }, [record]);

  if (loading && !record) {
    return <div style={secondaryTextStyle}>Loading batch summary...</div>;
  }

  if (error) {
    return <div style={secondaryTextStyle}>{error}</div>;
  }

  if (!record) {
    return <div style={secondaryTextStyle}>Batch not found.</div>;
  }

  const state = getOperationalState(record);
  const hasExpectedItemCount = record.expectedItemCount !== null;
  const hasExpectedTotalValue = record.expectedTotalValueDisplay !== '';
  const batchDetails = [record.source].filter((value) => value.trim() !== '').join(' · ');
  const limitMessage = record.workflowLimitMessage;

  const routingSummary =
    record.isOverWorkflowLimit
      ? limitMessage
      : record.failedItems > 0
      ? `${record.failedItems} row${record.failedItems === 1 ? '' : 's'} failed in processing.`
      : record.readyItems > 0 && record.needsReviewItems > 0
        ? `${record.readyItems} ready to process, ${record.needsReviewItems} still need review.`
      : record.readyItems > 0
          ? `${record.readyItems} row${record.readyItems === 1 ? '' : 's'} ready to process.`
          : record.needsReviewItems > 0
            ? `${record.needsReviewItems} row${record.needsReviewItems === 1 ? '' : 's'} still need review.`
            : record.totalItems > 0 && record.processedItems === record.totalItems
              ? 'All rows in this batch have already been processed.'
              : null;

  const itemSummary = hasExpectedItemCount
    ? `${record.totalItems} currently attached · ${record.expectedItemCount} expected`
    : `${record.totalItems} row${record.totalItems === 1 ? '' : 's'}`;

  const valueSummary = hasExpectedTotalValue
    ? `${record.totalValueDisplay} attached · ${record.expectedTotalValueDisplay} expected`
    : record.totalValueDisplay;
  const showBatchSetup = record.totalItems === 0;

  const handleSaveSetup = async () => {
    if (!recordId) {
      return;
    }

    setSavingSetup(true);

    try {
      await updateGiftBatchSetup(recordId, {
        expectedItemCount: expectedItemCountInput,
        expectedTotalAmount: expectedTotalAmountInput,
        currencyCode: expectedTotalCurrencyCode,
      });

      await enqueueSnackbar({
        message: 'Batch setup saved.',
        variant: 'success',
      });

      broadcastGiftBatchInvalidated(recordId);
    } catch (saveError) {
      await enqueueSnackbar({
        message:
          saveError instanceof Error
            ? saveError.message
            : 'Unable to save batch setup.',
        variant: 'error',
      });
    } finally {
      setSavingSetup(false);
    }
  };

  return (
    <div style={compactWidgetRootStyle}>
      <span style={badgeStyle(state.tone)}>{state.label}</span>
      {state.message ? (
        <div style={{ ...secondaryTextStyle, color: '#1f2328' }}>
          {state.message}
        </div>
      ) : null}
      {record.isOverWorkflowLimit ? (
        <div style={secondaryTextStyle}>
          This batch can be viewed, but donor match, readiness checks, and processing are blocked until it is split into smaller batches.
        </div>
      ) : null}

      {showBatchSetup ? (
        <div style={subtlePanelStyle}>
          <div style={labelStyle}>Batch setup</div>
          <div style={secondaryTextStyle}>
            Use Import records on Gift staging to add rows to this batch, then return here to review and process them.
          </div>
          <div style={secondaryTextStyle}>
            Pilot limit: maximum 200 donations per batch.
          </div>

          <div
            style={{
              display: 'grid',
              gap: '6px 10px',
              gridTemplateColumns: 'minmax(120px, 1fr) minmax(150px, 1fr) 84px',
              alignItems: 'end',
            }}
          >
            <label style={compactMetaItemStyle}>
              <span style={labelStyle}>Expected item count</span>
              <input
                type="number"
                min="0"
                value={expectedItemCountInput}
                onChange={(event) => {
                  setExpectedItemCountInput(getInputEventValue(event));
                }}
                style={inputStyle}
                placeholder="Optional"
              />
            </label>

            <label style={compactMetaItemStyle}>
              <span style={labelStyle}>Expected total value</span>
              <input
                type="text"
                inputMode="decimal"
                value={expectedTotalAmountInput}
                onChange={(event) => {
                  setExpectedTotalAmountInput(getInputEventValue(event));
                }}
                style={inputStyle}
                placeholder="Optional"
              />
            </label>

            <label style={compactMetaItemStyle}>
              <span style={labelStyle}>Currency</span>
              <input
                type="text"
                value={expectedTotalCurrencyCode}
                onChange={(event) => {
                  setExpectedTotalCurrencyCode(
                    getInputEventValue(event).toUpperCase(),
                  );
                }}
                style={inputStyle}
                placeholder="GBP"
                maxLength={3}
              />
            </label>
          </div>

          <div style={actionRowStyle}>
            <Button
              title={savingSetup ? 'Saving...' : 'Save batch setup'}
              variant="secondary"
              onClick={() => {
                void handleSaveSetup();
              }}
              disabled={savingSetup}
            />
          </div>
        </div>
      ) : null}

      <div style={compactMetaGridStyle}>
        <div style={compactMetaItemStyle}>
          <div style={labelStyle}>Source</div>
          <div style={secondaryTextStyle}>{batchDetails}</div>
        </div>
        <div style={compactMetaItemStyle}>
          <div style={labelStyle}>Rows</div>
          <div style={secondaryTextStyle}>{itemSummary}</div>
        </div>
        <div style={compactMetaItemStyle}>
          <div style={labelStyle}>Value</div>
          <div style={secondaryTextStyle}>{valueSummary}</div>
        </div>
      </div>

      {routingSummary ? (
        <div style={secondaryTextStyle}>{routingSummary}</div>
      ) : null}
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: GIFT_BATCH_SUMMARY_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'gift-batch-summary',
  description: 'Compact batch summary and posture for a gift batch.',
  component: GiftBatchSummary,
});
