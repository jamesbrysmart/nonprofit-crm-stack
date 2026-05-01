import { CoreApiClient } from 'twenty-client-sdk/core';
import {
  defineLogicFunction,
  type RoutePayload,
} from 'twenty-sdk/define';
import {
  canProcessBatchRow,
  executeBatchGiftProcessing,
} from 'src/batch-processing/batch-processing.executor';
import type { BatchProcessingRow } from 'src/batch-processing/batch-processing.types';

type ProcessGiftStagingRowRequest = {
  giftStagingId: string;
};

type ProcessGiftStagingRowResponse = {
  giftStagingId: string;
  processingStatus: 'NOT_READY' | 'PROCESSED' | 'PROCESS_FAILED';
  committedGiftId: string | null;
  recurringAgreementId: string | null;
  errorDetail: string | null;
};

const loadGiftStagingRow = async (
  client: CoreApiClient,
  giftStagingId: string,
): Promise<BatchProcessingRow | null> => {
  const result = await client.query({
    giftStaging: {
      __args: {
        filter: {
          id: { eq: giftStagingId },
        },
      },
      id: true,
      name: true,
      donorFirstName: true,
      donorLastName: true,
      donorEmail: true,
      donorMailingAddress: {
        addressStreet1: true,
        addressStreet2: true,
        addressCity: true,
        addressState: true,
        addressPostcode: true,
        addressCountry: true,
      },
      amount: {
        amountMicros: true,
        currencyCode: true,
      },
      giftDate: true,
      donationType: true,
      externalId: true,
      sourceFingerprint: true,
      providerEventId: true,
      provider: true,
      providerPaymentId: true,
      paymentProviderCustomerId: true,
      providerAgreementId: true,
      providerIntervalUnit: true,
      providerIntervalCount: true,
      donorPhone: true,
      rawProviderEvidence: true,
      donorResolutionState: true,
      donor: {
        id: true,
      },
      hasCoreGiftIssue: true,
      isReadyForProcessing: true,
      processingStatus: true,
      errorDetail: true,
      giftAidRequested: true,
      giftAidDeclarationCaptured: true,
      giftAidDeclarationDate: true,
      giftAidCoverageScope: true,
      giftAidDeclarationSource: true,
      giftAidTextVersion: true,
      giftAidDeclaration: {
        id: true,
      },
      recurringAgreement: {
        id: true,
      },
      committedGift: {
        id: true,
        name: true,
      },
    },
  } as any);

  return (result?.giftStaging as BatchProcessingRow | null) ?? null;
};

const handler = async (
  event: RoutePayload<ProcessGiftStagingRowRequest>,
): Promise<ProcessGiftStagingRowResponse> => {
  const giftStagingId = event.body?.giftStagingId?.trim();

  if (!giftStagingId) {
    throw new Error('giftStagingId is required');
  }

  const client = new CoreApiClient();
  const row = await loadGiftStagingRow(client, giftStagingId);

  if (!row) {
    throw new Error('Gift staging row not found');
  }

  if (!canProcessBatchRow(row)) {
    return {
      giftStagingId,
      processingStatus: 'NOT_READY',
      committedGiftId: row.committedGift?.id ?? null,
      recurringAgreementId: row.recurringAgreement?.id ?? null,
      errorDetail: row.errorDetail,
    };
  }

  const result = await executeBatchGiftProcessing([row]);
  const successful = result.successfulWritebacks[0];
  const failed = result.failedWritebacks[0];

  if (successful) {
    return {
      giftStagingId,
      processingStatus: 'PROCESSED',
      committedGiftId: successful.committedGiftId,
      recurringAgreementId: successful.recurringAgreementId ?? null,
      errorDetail: null,
    };
  }

  return {
    giftStagingId,
    processingStatus: 'PROCESS_FAILED',
    committedGiftId: null,
    recurringAgreementId: null,
    errorDetail: failed?.errorDetail ?? 'Row processing failed',
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
