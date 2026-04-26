import { describe, expect, it } from 'vitest';
import type { ProcessBatchResponse } from 'src/batch-processing/batch-processing.types';
import {
  callAppRoute,
  loadBatchByName,
  loadBatchRows,
  loadGiftById,
  loadStagingRowByName,
} from './test-helpers';

describe('Batch processing route', () => {
  it('should process the clean stress batch primarily through the batch path', async () => {
    const batch = await loadBatchByName('Executor clean path stress');

    const response = await callAppRoute<ProcessBatchResponse>(
      '/s/batch-processing/process-batch',
      {
        giftBatchId: batch.id,
      },
    );

    expect(response.executorMode).toBe('BOUNDED_HYBRID');
    expect(response.totalItems).toBe(35);
    expect(response.processedItems).toBe(35);
    expect(response.failedItems).toBe(0);
    expect(response.notReadyItems).toBe(0);
    expect(response.batchPathProcessed).toBeGreaterThan(0);
    expect(response.rowFallbackFailed).toBe(0);

    const rows = await loadBatchRows(batch.id);
    expect(rows).toHaveLength(35);
    expect(rows.every((row) => row.processingStatus === 'PROCESSED')).toBe(true);
    expect(rows.every((row) => row.committedGift?.id)).toBe(true);
  });

  it('should leave blocked rows behind while processing ready rows in the mixed batch', async () => {
    const batch = await loadBatchByName('Executor mixed readiness stress');

    const response = await callAppRoute<ProcessBatchResponse>(
      '/s/batch-processing/process-batch',
      {
        giftBatchId: batch.id,
      },
    );

    expect(response.batchStatus).toBe('PROCESSED_WITH_ISSUES');
    expect(response.processedItems).toBe(4);
    expect(response.failedItems).toBe(1);
    expect(response.notReadyItems).toBe(3);

    const rows = await loadBatchRows(batch.id);
    const processedRows = rows.filter((row) => row.processingStatus === 'PROCESSED');
    const failedRows = rows.filter((row) => row.processingStatus === 'PROCESS_FAILED');
    const notReadyRows = rows.filter((row) => row.processingStatus === 'NOT_READY');

    expect(processedRows).toHaveLength(4);
    expect(failedRows).toHaveLength(1);
    expect(notReadyRows).toHaveLength(3);
    expect(
      failedRows.some((row) =>
        row.errorDetail?.includes('Previous executor run failed'),
      ),
    ).toBe(true);

    const mixedGiftAidRow = await loadStagingRowByName('Mixed readiness row 001');
    const gift = await loadGiftById(mixedGiftAidRow.committedGift!.id);
    expect(gift?.giftAidStatus).toBe('CLAIMABLE');
    expect(gift?.giftAidReasonCode).toBe('valid_declaration_present');
    expect(gift?.giftAidDeclaration?.id).toBeTruthy();
    expect(gift?.giftAidClaimBatch?.id).toBeTruthy();
  });

  it('should isolate one failure while still processing the rest of the split fallback batch', async () => {
    const batch = await loadBatchByName('Executor split fallback stress');

    const response = await callAppRoute<ProcessBatchResponse>(
      '/s/batch-processing/process-batch',
      {
        giftBatchId: batch.id,
      },
    );

    expect(response.batchStatus).toBe('PROCESSED_WITH_ISSUES');
    expect(response.totalItems).toBe(9);
    expect(response.processedItems).toBe(8);
    expect(response.failedItems).toBe(1);
    expect(response.notReadyItems).toBe(0);
    expect(
      response.batchPathFailed + response.rowFallbackFailed,
    ).toBeGreaterThanOrEqual(1);

    const rows = await loadBatchRows(batch.id);
    const failedRow = rows.find((row) => row.processingStatus === 'PROCESS_FAILED');

    expect(failedRow).toBeDefined();
    expect(failedRow?.name).toBe('Split fallback bad row 009');
    expect(failedRow?.errorDetail).toContain('valid positive amount');
    expect(
      rows.filter((row) => row.processingStatus === 'PROCESSED'),
    ).toHaveLength(8);
  });
});
