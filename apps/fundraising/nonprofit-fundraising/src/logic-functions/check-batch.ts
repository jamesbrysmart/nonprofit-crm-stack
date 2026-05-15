import { CoreApiClient } from 'twenty-client-sdk/core';
import {
  defineLogicFunction,
  type RoutePayload,
} from 'twenty-sdk/define';
import { loadBatchProcessingContext } from 'src/batch-processing/batch-loaders';
import {
  getGiftBatchWorkflowLimitMessage,
  isGiftBatchOverWorkflowLimit,
} from 'src/batch-processing/batch-processing.limits';
import { checkGiftStagingRowsReadiness } from 'src/gift-staging-review/gift-ready-check.service';
import type {
  BatchProcessingRow,
  CheckBatchRequest,
  CheckBatchResponse,
} from 'src/batch-processing/batch-processing.types';

const normalizeString = (value: string | null | undefined) =>
  typeof value === 'string' ? value.trim() : '';

const formatCurrencyDisplay = ({
  amountMicros,
  currencyCode,
}: {
  amountMicros: number;
  currencyCode: string;
}) => `${currencyCode} ${(amountMicros / 1_000_000).toFixed(2)}`;

const formatExpectedTotalDisplay = (
  amount:
    | {
        amountMicros?: number | null;
        currencyCode?: string | null;
      }
    | null
    | undefined,
): string | null => {
  if (
    typeof amount?.amountMicros !== 'number' ||
    !Number.isFinite(amount.amountMicros)
  ) {
    return null;
  }

  const currencyCode = normalizeString(amount.currencyCode);

  if (currencyCode === '') {
    return null;
  }

  return formatCurrencyDisplay({
    amountMicros: amount.amountMicros,
    currencyCode,
  });
};

const summarizeActualTotal = (
  rows: BatchProcessingRow[],
): {
  display: string;
  amountMicros: number | null;
  currencyCode: string | null;
} => {
  if (rows.length === 0) {
    return {
      display: 'No rows',
      amountMicros: 0,
      currencyCode: null,
    };
  }

  const validRows = rows.filter(
    (row): row is BatchProcessingRow & {
      amount: {
        amountMicros: number;
        currencyCode?: string | null;
      };
    } =>
      typeof row.amount?.amountMicros === 'number' &&
      Number.isFinite(row.amount.amountMicros),
  );

  if (validRows.length !== rows.length) {
    return {
      display: 'Incomplete amounts',
      amountMicros: null,
      currencyCode: null,
    };
  }

  const currencies = new Set(
    validRows.map((row) => normalizeString(row.amount.currencyCode)),
  );

  if (currencies.size !== 1 || currencies.has('')) {
    return {
      display: 'Mixed or missing currencies',
      amountMicros: null,
      currencyCode: null,
    };
  }

  const currencyCode = [...currencies][0] ?? null;

  if (!currencyCode) {
    return {
      display: 'Mixed or missing currencies',
      amountMicros: null,
      currencyCode: null,
    };
  }

  const amountMicros = validRows.reduce(
    (sum, row) => sum + row.amount.amountMicros,
    0,
  );

  return {
    display: formatCurrencyDisplay({
      amountMicros,
      currencyCode,
    }),
    amountMicros,
    currencyCode,
  };
};

const handler = async (
  event: RoutePayload<CheckBatchRequest>,
): Promise<CheckBatchResponse> => {
  const giftBatchId = event.body?.giftBatchId?.trim();

  if (!giftBatchId) {
    throw new Error('giftBatchId is required');
  }

  const client = new CoreApiClient();
  const { batch, rows } = await loadBatchProcessingContext(client, giftBatchId);

  if (!batch) {
    throw new Error('Batch not found');
  }

  if (isGiftBatchOverWorkflowLimit(batch.totalItems)) {
    throw new Error(getGiftBatchWorkflowLimitMessage(batch.totalItems));
  }

  const counts = await checkGiftStagingRowsReadiness(client, rows);

  const expectedItemCount =
    typeof batch.expectedItemCount === 'number'
      ? batch.expectedItemCount
      : null;
  const itemCountMatchesExpected =
    expectedItemCount === null
      ? null
      : expectedItemCount === counts.actualItemCount;

  const actualTotal = summarizeActualTotal(rows);
  const expectedTotalDisplay = formatExpectedTotalDisplay(
    batch.expectedTotalAmount,
  );
  const expectedAmountMicros = batch.expectedTotalAmount?.amountMicros;
  const expectedCurrencyCode = normalizeString(
    batch.expectedTotalAmount?.currencyCode,
  );
  const totalMatchesExpected =
    typeof expectedAmountMicros !== 'number' ||
    !Number.isFinite(expectedAmountMicros) ||
    expectedCurrencyCode === ''
      ? null
      : actualTotal.amountMicros !== null &&
          actualTotal.currencyCode !== null &&
          actualTotal.amountMicros === expectedAmountMicros &&
          actualTotal.currencyCode === expectedCurrencyCode;

  return {
    giftBatchId,
    checkedAt: counts.checkedAt,
    actualItemCount: counts.actualItemCount,
    expectedItemCount,
    itemCountMatchesExpected,
    expectedTotalDisplay,
    actualTotalDisplay: actualTotal.display,
    totalMatchesExpected,
    readyItems: counts.readyItems,
    needsReviewItems: counts.needsReviewItems,
    failedItems: counts.failedItems,
    processedItems: counts.processedItems,
  };
};

export default defineLogicFunction({
  universalIdentifier: '4f4411fd-8ff4-4e5e-b4a5-91fe0d7e3c6a',
  name: 'check-batch',
  description:
    'Runs a pre-commit batch check against current staged gift data without creating gifts.',
  timeoutSeconds: 120,
  handler,
  httpRouteTriggerSettings: {
    path: '/batch-processing/check-batch',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
