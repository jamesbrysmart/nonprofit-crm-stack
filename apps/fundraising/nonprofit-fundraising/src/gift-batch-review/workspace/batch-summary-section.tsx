import { useEffect, useState, type CSSProperties } from 'react';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { enqueueSnackbar } from 'twenty-sdk/front-component';
import { Status } from 'twenty-ui/primitives/data-display';
import type { ThemeColor } from 'twenty-ui/theme';
import { MAX_GIFT_BATCH_ITEMS } from 'src/batch-processing/batch-processing.limits';
import { FormInput } from 'src/front-components/form-controls';
import {
  ActionButton,
  SummaryStrip,
  SummaryStripItem,
  actionRowStyle,
  subtlePanelStyle,
} from 'src/front-components/front-component-ui';
import type { GiftBatchReviewRecord } from 'src/gift-batch-review/gift-batch-review.types';
import {
  WorkspaceSection,
  WorkspaceText,
} from 'src/front-components/workspace-layout';
import type { GiftBatchWorkspaceSectionProps } from 'src/gift-batch-review/workspace/workspace-section';
import { getDefaultCurrencyCode } from 'src/reporting-currency/reporting-currency';

const SETUP_FIELDS_STYLE: CSSProperties = {
  display: 'grid',
  gap: '6px 10px',
  gridTemplateColumns: 'minmax(120px, 1fr) minmax(150px, 1fr) 84px',
  alignItems: 'end',
};

const DEFAULT_BATCH_CURRENCY_CODE = getDefaultCurrencyCode();

const microsToDecimalInput = (amountMicros?: number | null) =>
  typeof amountMicros === 'number' && Number.isFinite(amountMicros)
    ? (amountMicros / 1_000_000).toFixed(2)
    : '';

const decimalInputToMicros = (value: string) => {
  const normalized = value.trim();

  if (normalized === '') {
    return null;
  }

  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? Math.round(parsed * 1_000_000) : null;
};

const updateGiftBatchSetup = async (
  recordId: string,
  input: {
    expectedItemCount: string;
    expectedTotalAmount: string;
    currencyCode: string;
  },
) => {
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

  await new CoreApiClient().mutation({
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
                  currencyCode:
                    input.currencyCode.trim() || DEFAULT_BATCH_CURRENCY_CODE,
                },
        },
      },
      id: true,
    },
  } as any);
};

const getOperationalState = (
  record: GiftBatchReviewRecord,
): { label: string; color: ThemeColor; message: string | null } => {
  if (record.isOverWorkflowLimit) {
    return { label: 'Batch too large', color: 'red', message: null };
  }

  if (record.totalItems === 0) {
    return { label: 'Empty batch', color: 'gray', message: null };
  }

  if (record.failedItems > 0) {
    return {
      label: 'Needs attention',
      color: 'amber',
      message: 'Some gifts failed during processing and need follow-up.',
    };
  }

  if (record.needsReviewItems > 0) {
    return {
      label: 'Needs review',
      color: 'amber',
      message: 'Some gifts still need review before they can be processed.',
    };
  }

  if (record.readyItems > 0) {
    return {
      label: 'Ready to process',
      color: 'green',
      message: 'This batch has gifts ready to process now.',
    };
  }

  if (record.processedItems === record.totalItems) {
    return {
      label: 'Processed',
      color: 'green',
      message: 'All gifts in this batch have already been processed.',
    };
  }

  return {
    label: 'In review',
    color: 'gray',
    message: 'Use the worklists below to review and route the remaining rows.',
  };
};

const getRoutingSummary = (record: GiftBatchReviewRecord) => {
  const plural = (count: number) => (count === 1 ? '' : 's');

  if (record.isOverWorkflowLimit) {
    return record.workflowLimitMessage;
  }

  if (record.failedItems > 0) {
    return `${record.failedItems} gift${plural(record.failedItems)} failed in processing.`;
  }

  if (record.readyItems > 0 && record.needsReviewItems > 0) {
    return `${record.readyItems} ready to process, ${record.needsReviewItems} still need review.`;
  }

  if (record.readyItems > 0) {
    return `${record.readyItems} gift${plural(record.readyItems)} ready to process.`;
  }

  if (record.needsReviewItems > 0) {
    return `${record.needsReviewItems} gift${plural(record.needsReviewItems)} still need review.`;
  }

  if (record.totalItems > 0 && record.processedItems === record.totalItems) {
    return 'All gifts in this batch have already been processed.';
  }

  return null;
};

export const BatchSummarySection = ({
  recordId,
  record,
  onChanged,
}: GiftBatchWorkspaceSectionProps) => {
  const [expectedItemCountInput, setExpectedItemCountInput] = useState('');
  const [expectedTotalAmountInput, setExpectedTotalAmountInput] = useState('');
  const [expectedTotalCurrencyCode, setExpectedTotalCurrencyCode] =
    useState(DEFAULT_BATCH_CURRENCY_CODE);
  const [savingSetup, setSavingSetup] = useState(false);

  useEffect(() => {
    setExpectedItemCountInput(
      record.expectedItemCount === null ? '' : String(record.expectedItemCount),
    );
    setExpectedTotalAmountInput(
      microsToDecimalInput(record.expectedTotalAmount?.amountMicros),
    );
    setExpectedTotalCurrencyCode(
      record.expectedTotalAmount?.currencyCode?.trim() ||
        DEFAULT_BATCH_CURRENCY_CODE,
    );
  }, [record]);

  const state = getOperationalState(record);
  const routingSummary = getRoutingSummary(record);
  const batchDetails = [record.source]
    .filter((value) => value.trim() !== '')
    .join(' · ');
  const itemSummary =
    record.expectedItemCount !== null
      ? `${record.totalItems} currently attached · ${record.expectedItemCount} expected`
      : `${record.totalItems} gift${record.totalItems === 1 ? '' : 's'}`;
  const valueSummary =
    record.expectedTotalValueDisplay !== ''
      ? `${record.totalValueDisplay} attached · ${record.expectedTotalValueDisplay} expected`
      : record.totalValueDisplay;

  const handleSaveSetup = async () => {
    setSavingSetup(true);

    try {
      await updateGiftBatchSetup(recordId, {
        expectedItemCount: expectedItemCountInput,
        expectedTotalAmount: expectedTotalAmountInput,
        currencyCode: expectedTotalCurrencyCode,
      });
      await enqueueSnackbar({ message: 'Batch setup saved.', variant: 'success' });
      await onChanged();
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
    <WorkspaceSection
      title="Batch summary"
      headerAction={
        <Status color={state.color} weight="medium">
          {state.label}
        </Status>
      }
    >
      {state.message ? (
        <WorkspaceText color="primary">{state.message}</WorkspaceText>
      ) : null}
      {record.isOverWorkflowLimit ? (
        <WorkspaceText>
          Batch actions are blocked until this import is split into smaller
          batches.
        </WorkspaceText>
      ) : null}

      {record.totalItems === 0 ? (
        <div style={subtlePanelStyle}>
          <WorkspaceText color="primary">Batch setup</WorkspaceText>
          <WorkspaceText>
            Use Import records on Gift staging to add rows to this batch, then
            return here to review and process them.
          </WorkspaceText>
          <WorkspaceText>
            Maximum {MAX_GIFT_BATCH_ITEMS} gifts per batch.
          </WorkspaceText>
          <div style={SETUP_FIELDS_STYLE}>
            <FormInput
              label="Expected item count"
              inputMode="numeric"
              placeholder="Optional"
              value={expectedItemCountInput}
              onChange={setExpectedItemCountInput}
            />
            <FormInput
              label="Expected total value"
              inputMode="decimal"
              placeholder="Optional"
              value={expectedTotalAmountInput}
              onChange={setExpectedTotalAmountInput}
            />
            <FormInput
              label="Currency"
              placeholder={DEFAULT_BATCH_CURRENCY_CODE}
              maxLength={3}
              value={expectedTotalCurrencyCode}
              onChange={(value) =>
                setExpectedTotalCurrencyCode(value.toUpperCase())
              }
            />
          </div>
          <div style={actionRowStyle}>
            <ActionButton
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

      <SummaryStrip>
        <SummaryStripItem label="Source" value={batchDetails} />
        <SummaryStripItem label="Rows" value={itemSummary} />
        <SummaryStripItem label="Value" value={valueSummary} />
      </SummaryStrip>

      {routingSummary ? <WorkspaceText>{routingSummary}</WorkspaceText> : null}
    </WorkspaceSection>
  );
};
