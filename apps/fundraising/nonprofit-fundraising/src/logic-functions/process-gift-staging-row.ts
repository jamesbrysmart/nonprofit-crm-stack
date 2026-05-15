import { CoreApiClient } from 'twenty-client-sdk/core';
import {
  defineLogicFunction,
  type RoutePayload,
} from 'twenty-sdk/define';
import { loadGiftStagingRowsForProcessing } from 'src/batch-processing/batch-loaders';
import { processGiftStagingRows } from 'src/gift-staging-review/gift-ready-check.service';

type ProcessGiftStagingRowRequest = {
  giftStagingId: string;
};

type ProcessGiftStagingRowResponse = {
  giftStagingId: string;
  processingStatus: 'NOT_PROCESSED' | 'PROCESSED' | 'PROCESS_FAILED';
  committedGiftId: string | null;
  recurringAgreementId: string | null;
  errorDetail: string | null;
};

const handler = async (
  event: RoutePayload<ProcessGiftStagingRowRequest>,
): Promise<ProcessGiftStagingRowResponse> => {
  const giftStagingId = event.body?.giftStagingId?.trim();

  if (!giftStagingId) {
    throw new Error('giftStagingId is required');
  }

  const client = new CoreApiClient();
  const rows = await loadGiftStagingRowsForProcessing(client, [giftStagingId]);
  const row = rows[0] ?? null;

  if (!row) {
    throw new Error('Gift staging row not found');
  }

  if (row.giftReadyStatus !== 'READY_TO_PROCESS') {
    return {
      giftStagingId,
      processingStatus: 'NOT_PROCESSED',
      committedGiftId: row.committedGift?.id ?? null,
      recurringAgreementId: row.recurringAgreement?.id ?? null,
      errorDetail: row.errorDetail,
    };
  }

  const result = await processGiftStagingRows(client, [row]);
  const refreshedRow = (
    await loadGiftStagingRowsForProcessing(client, [giftStagingId])
  )[0] ?? row;

  if (result.processedItems === 1) {
    return {
      giftStagingId,
      processingStatus: 'PROCESSED',
      committedGiftId: refreshedRow.committedGift?.id ?? null,
      recurringAgreementId: refreshedRow.recurringAgreement?.id ?? null,
      errorDetail: null,
    };
  }

  return {
    giftStagingId,
    processingStatus: 'PROCESS_FAILED',
    committedGiftId: null,
    recurringAgreementId: null,
    errorDetail: refreshedRow.errorDetail ?? 'Row processing failed',
  };
};

export default defineLogicFunction({
  universalIdentifier: 'f3ca7799-5824-4bc6-8197-c223a0372c17',
  name: 'process-gift-staging-row',
  description:
    'Processes a single staged gift row through the bounded gift-processing path.',
  timeoutSeconds: 120,
  handler,
  httpRouteTriggerSettings: {
    path: '/gift-staging/process-row',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
