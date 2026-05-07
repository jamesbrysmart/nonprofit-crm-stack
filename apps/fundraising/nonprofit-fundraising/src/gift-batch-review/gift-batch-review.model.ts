import type {
  BatchSummaryRecord,
  BatchReviewRow,
  GiftBatchReviewRecord,
  GiftBatchReviewRow,
} from './gift-batch-review.types';
import { isGiftStagingProcessable } from 'src/gift-staging-review/gift-staging-processability';

const coalesceString = (
  value: string | null | undefined,
  fallback = '',
): string => {
  if (typeof value !== 'string') {
    return fallback;
  }

  const trimmed = value.trim();

  return trimmed === '' ? fallback : trimmed;
};

const buildDonorEvidenceName = (row: BatchReviewRow): string => {
  const firstName = coalesceString(row.donorFirstName);
  const lastName = coalesceString(row.donorLastName);
  const fullName = `${firstName} ${lastName}`.trim();

  if (fullName !== '') {
    return fullName;
  }

  return coalesceString(row.donorEmail, 'Unknown donor evidence');
};

const formatAmountDisplay = (
  amount: BatchReviewRow['amount'],
): string => {
  if (!amount || typeof amount.amountMicros !== 'number') {
    return 'Unknown amount';
  }

  return `${coalesceString(amount.currencyCode, 'GBP')} ${(
    amount.amountMicros / 1_000_000
  ).toFixed(2)}`;
};

const formatTotalValueDisplay = (rows: BatchReviewRow[]): string => {
  const rowsWithAmount = rows.filter(
    (row): row is BatchReviewRow & {
      amount: {
        amountMicros: number;
        currencyCode?: string | null;
      };
    } =>
      typeof row.amount?.amountMicros === 'number' &&
      Number.isFinite(row.amount.amountMicros),
  );

  if (rowsWithAmount.length === 0) {
    return 'Unknown value';
  }

  const distinctCurrencies = new Set(
    rowsWithAmount.map((row) => coalesceString(row.amount.currencyCode, 'GBP')),
  );

  if (distinctCurrencies.size !== 1) {
    return 'Mixed currencies';
  }

  const currencyCode = [...distinctCurrencies][0] ?? 'GBP';
  const totalAmountMicros = rowsWithAmount.reduce(
    (sum, row) => sum + row.amount.amountMicros,
    0,
  );

  return `${currencyCode} ${(totalAmountMicros / 1_000_000).toFixed(2)}`;
};

const buildReviewRow = (row: BatchReviewRow): GiftBatchReviewRow => {
  const processingStatus = coalesceString(row.processingStatus, 'NOT_PROCESSED');
  const isProcessable = isGiftStagingProcessable({
    processingStatus,
    donorResolutionState: row.donorResolutionState,
    donorFirstName: row.donorFirstName,
    donorLastName: row.donorLastName,
    linkedDonorId: row.donor?.id,
  });

  return {
    id: row.id,
    name: coalesceString(row.name, 'Unnamed staged row'),
    donorEvidenceName: buildDonorEvidenceName(row),
    donorEmail: coalesceString(row.donorEmail, 'No email captured'),
    amountDisplay: formatAmountDisplay(row.amount),
    giftDate: coalesceString(row.giftDate, 'No gift date captured'),
    provider: coalesceString(row.provider, 'No provider'),
    providerAgreementId: coalesceString(
      row.providerAgreementId,
      'No provider agreement',
    ),
    donorResolutionState: coalesceString(
      row.donorResolutionState,
      'UNREVIEWED',
    ),
    processingStatus,
    isReadyForProcessing: row.isReadyForProcessing ?? false,
    isProcessable,
    isProcessed: processingStatus === 'PROCESSED',
    errorDetail: coalesceString(row.errorDetail),
    committedGiftName: coalesceString(
      row.committedGift?.name,
      row.committedGift?.id ? 'Committed gift linked' : 'Not processed',
    ),
  };
};

export const buildGiftBatchReviewRecord = (
  batch: BatchSummaryRecord,
  rows: BatchReviewRow[],
): GiftBatchReviewRecord => {
  const reviewRows = rows.map(buildReviewRow);
  const processedItems = reviewRows.filter(
    (row) => row.processingStatus === 'PROCESSED',
  ).length;
  const failedItems = reviewRows.filter(
    (row) => row.processingStatus === 'PROCESS_FAILED',
  ).length;

  return {
    id: batch.id,
    name: batch.name,
    source: coalesceString(batch.source, 'Unknown source'),
    status: coalesceString(batch.status, 'PENDING'),
    totalItems: reviewRows.length,
    totalValueDisplay: formatTotalValueDisplay(rows),
    eligibleItems: reviewRows.filter((row) => row.isProcessable).length,
    processedItems,
    failedItems,
    readyItems: reviewRows.filter(
      (row) => row.isProcessable && row.isReadyForProcessing,
    ).length,
    unresolvedItems: reviewRows.filter(
      (row) =>
        row.donorResolutionState === 'UNREVIEWED' ||
        row.donorResolutionState === 'AMBIGUOUS' ||
        row.donorResolutionState === 'UNRESOLVED',
    ).length,
    rows: reviewRows,
  };
};
