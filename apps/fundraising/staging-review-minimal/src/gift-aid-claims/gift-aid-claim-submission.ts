import { CoreApiClient } from 'twenty-client-sdk/core';
import {
  getOrCreateCurrentDraftClaimBatch,
  listGiftsForClaimBatch,
  refreshClaimBatchSummary,
} from './gift-aid-claim-batch';
import type {
  GiftAidClaimBatchRecord,
  GiftAidClaimSubmissionEnvironment,
  GiftAidClaimSubmissionSnapshot,
} from './gift-aid-claim.types';

const normalizeMode = (value: string | undefined) => {
  const normalized = (value ?? 'mock_success').trim().toLowerCase();
  return normalized === 'mock_failure' ? 'mock_failure' : 'mock_success';
};

const getSubmissionEnvironment = (): GiftAidClaimSubmissionEnvironment =>
  (process.env.HMRC_SUBMISSION_ENVIRONMENT ?? 'TEST').trim().toUpperCase() ===
  'LIVE'
    ? 'LIVE'
    : 'TEST';

const isSubmissionEnabled = () =>
  (process.env.HMRC_SUBMISSION_ENABLED ?? 'false').trim().toLowerCase() === 'true';

const buildSnapshot = async (
  client: CoreApiClient,
  batch: GiftAidClaimBatchRecord,
): Promise<GiftAidClaimSubmissionSnapshot> => {
  const gifts = await listGiftsForClaimBatch(client, batch.id);

  return {
    schemaVersion: 'gift-aid-claim-submission/v1',
    batchId: batch.id,
    batchName: batch.name,
    giftCount: gifts.length,
    totalAmountMicros: gifts.reduce(
      (sum, gift) => sum + (gift.amount?.amountMicros ?? 0),
      0,
    ),
    giftIds: gifts.map((gift) => gift.id),
    environment: getSubmissionEnvironment(),
  };
};

const createSubmissionRecord = async (
  client: CoreApiClient,
  batchId: string,
  snapshot: GiftAidClaimSubmissionSnapshot,
) => {
  const submittedAt = new Date().toISOString();
  const result = await client.mutation({
    createGiftAidClaimSubmission: {
      __args: {
        data: {
          name: `Gift Aid submission ${submittedAt.slice(0, 10)}`,
          status: 'QUEUED',
          environment: snapshot.environment,
          submittedAt,
          snapshotJson: JSON.stringify(snapshot),
          giftAidClaimBatch: {
            connect: {
              where: {
                id: batchId,
              },
            },
          },
        },
      },
      id: true,
      submittedAt: true,
    },
  } as any);

  return result?.createGiftAidClaimSubmission as { id: string; submittedAt?: string };
};

const invokeSubmissionAdapter = async (snapshot: GiftAidClaimSubmissionSnapshot) => {
  if (!isSubmissionEnabled()) {
    throw new Error('HMRC submission probe is disabled');
  }

  const mode = normalizeMode(process.env.HMRC_SUBMISSION_MODE);
  const correlationId = `ga-${snapshot.batchId}-${Date.now()}`;

  if (mode === 'mock_failure') {
    return {
      ok: false as const,
      correlationId,
      failureCode: 'MOCK_FAILURE',
      failureMessage: 'Gift Aid submission adapter configured to fail',
      responseBody: {
        mode,
        accepted: false,
      },
    };
  }

  return {
    ok: true as const,
    correlationId,
    externalSubmissionId: `hmrc-probe-${Date.now()}`,
    responseBody: {
      mode,
      accepted: true,
      environment: snapshot.environment,
    },
  };
};

const loadClaimBatch = async (client: CoreApiClient, batchId: string) => {
  const refreshed = await client.query({
    giftAidClaimBatch: {
      __args: {
        filter: {
          id: { eq: batchId },
        },
      },
      id: true,
      name: true,
      status: true,
      submittedAt: true,
      giftCount: true,
      totalAmount: true,
      hasBlockingIssues: true,
      blockingIssueCount: true,
    },
  } as any);

  return refreshed?.giftAidClaimBatch as GiftAidClaimBatchRecord | null;
};

export const submitGiftAidClaimBatch = async (
  client: CoreApiClient,
  batchId: string,
) => {
  await refreshClaimBatchSummary(client, batchId);

  const claimBatch = await loadClaimBatch(client, batchId);
  if (!claimBatch?.id) {
    throw new Error('Gift Aid claim batch not found');
  }

  if ((claimBatch.giftCount ?? 0) === 0) {
    throw new Error('Gift Aid claim batch has no claimable gifts');
  }

  if (claimBatch.hasBlockingIssues === true) {
    throw new Error('Gift Aid claim batch still has blocking issues');
  }

  const snapshot = await buildSnapshot(client, claimBatch);
  const submission = await createSubmissionRecord(client, claimBatch.id, snapshot);

  await client.mutation({
    updateGiftAidClaimBatch: {
      __args: {
        id: claimBatch.id,
        data: {
          status: 'SUBMITTING',
        },
      },
      id: true,
    },
  } as any);

  const adapterResult = await invokeSubmissionAdapter(snapshot);
  const completedAt = new Date().toISOString();

  if (adapterResult.ok) {
    await client.mutation({
      updateGiftAidClaimSubmission: {
        __args: {
          id: submission.id,
          data: {
            status: 'SENT',
            completedAt,
            externalSubmissionId: adapterResult.externalSubmissionId,
            correlationId: adapterResult.correlationId,
            responseJson: JSON.stringify(adapterResult.responseBody),
          },
        },
        id: true,
      },
      updateGiftAidClaimBatch: {
        __args: {
          id: claimBatch.id,
          data: {
            status: 'SUBMITTED',
            submittedAt: completedAt,
          },
        },
        id: true,
      },
    } as any);

    await getOrCreateCurrentDraftClaimBatch(client);

    return {
      claimBatchId: claimBatch.id,
      submissionId: submission.id,
      status: 'SENT' as const,
    };
  }

  await client.mutation({
    updateGiftAidClaimSubmission: {
      __args: {
        id: submission.id,
        data: {
          status: 'FAILED',
          completedAt,
          correlationId: adapterResult.correlationId,
          failureCode: adapterResult.failureCode,
          failureMessage: adapterResult.failureMessage,
          responseJson: JSON.stringify(adapterResult.responseBody),
        },
      },
      id: true,
    },
    updateGiftAidClaimBatch: {
      __args: {
        id: claimBatch.id,
        data: {
          status: 'SUBMISSION_FAILED',
        },
      },
      id: true,
    },
  } as any);

  return {
    claimBatchId: claimBatch.id,
    submissionId: submission.id,
    status: 'FAILED' as const,
  };
};
