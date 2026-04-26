import type {
  BatchSummaryRecord,
  BatchReviewRow,
  GiftBatchReviewRecord,
  GiftBatchReviewRow,
} from './gift-batch-review.types';

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

const buildReviewRow = (row: BatchReviewRow): GiftBatchReviewRow => {
  const processingStatus = coalesceString(row.processingStatus, 'NOT_READY');

  return {
    id: row.id,
    name: coalesceString(row.name, 'Unnamed staged row'),
    donorEvidenceName: buildDonorEvidenceName(row),
    donorEmail: coalesceString(row.donorEmail, 'No email captured'),
    donorResolutionState: coalesceString(
      row.donorResolutionState,
      'UNREVIEWED',
    ),
    processingStatus,
    hasCoreGiftIssue: row.hasCoreGiftIssue ?? false,
    isReadyForProcessing: row.isReadyForProcessing ?? false,
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

  return {
    id: batch.id,
    name: batch.name,
    source: coalesceString(batch.source, 'Unknown source'),
    status: coalesceString(batch.status, 'PENDING'),
    totalItems: batch.totalItems ?? reviewRows.length,
    processedItems: batch.processedItems ?? 0,
    failedItems: batch.failedItems ?? 0,
    readyItems: reviewRows.filter((row) => row.isReadyForProcessing).length,
    blockedItems: reviewRows.filter((row) => row.hasCoreGiftIssue).length,
    unresolvedItems: reviewRows.filter(
      (row) =>
        row.donorResolutionState === 'UNREVIEWED' ||
        row.donorResolutionState === 'AMBIGUOUS' ||
        row.donorResolutionState === 'UNRESOLVED',
    ).length,
    rows: reviewRows,
  };
};
