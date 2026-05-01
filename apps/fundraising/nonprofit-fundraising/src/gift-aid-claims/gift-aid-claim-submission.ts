import { createHash } from 'node:crypto';
import { CoreApiClient } from 'twenty-client-sdk/core';
import {
  computeClaimBatchRollups,
  listGiftsForClaimBatch,
  refreshClaimBatchSummary,
} from './gift-aid-claim-batch';
import { runGiftAidHmrcSubmission } from './gift-aid-hmrc-runner';
import type {
  GiftAidClaimBatchRecord,
  GiftAidClaimSubmissionEnvironment,
  GiftAidClaimSubmissionSnapshot,
} from './gift-aid-claim.types';

const getSubmissionEnvironment = (): GiftAidClaimSubmissionEnvironment =>
  (process.env.HMRC_SUBMISSION_ENVIRONMENT ?? 'TEST').trim().toUpperCase() ===
  'LIVE'
    ? 'LIVE'
    : 'TEST';

const buildSnapshot = async (
  client: CoreApiClient,
  batch: GiftAidClaimBatchRecord,
): Promise<GiftAidClaimSubmissionSnapshot> => {
  const gifts = await listGiftsForClaimBatch(client, batch.id);
  const rollups = computeClaimBatchRollups(gifts);

  return {
    schemaVersion: 'gift-aid-claim-submission/v1',
    batch: {
      id: batch.id,
      name: batch.name,
      submittedAt: batch.submittedAt ?? null,
      giftCount: rollups.giftCount,
      totalAmountMicros: rollups.totalAmount.amountMicros ?? 0,
      blockingIssueCount: rollups.blockingIssueCount,
      hasBlockingIssues: rollups.hasBlockingIssues,
    },
    gifts: gifts.map((gift) => ({
      id: gift.id,
      giftDate: gift.giftDate ?? null,
      giftAidStatus: gift.giftAidStatus ?? null,
      giftAidReasonCode: gift.giftAidReasonCode ?? null,
      giftAidDecisionSource: gift.giftAidDecisionSource ?? null,
      giftAidDeclarationId: gift.giftAidDeclaration?.id ?? null,
      donorFirstName: gift.donorFirstName ?? null,
      donorLastName: gift.donorLastName ?? null,
      donorEmail: gift.donorEmail ?? null,
      donorMailingAddress: gift.donor?.mailingAddress ?? null,
      amountMicros: gift.amount?.amountMicros ?? 0,
      currencyCode: gift.amount?.currencyCode ?? 'GBP',
    })),
    environment: getSubmissionEnvironment(),
  };
};

const computeSnapshotHash = (snapshot: GiftAidClaimSubmissionSnapshot) =>
  createHash('sha256').update(JSON.stringify(snapshot)).digest('hex');

const createSubmissionRecord = async (
  client: CoreApiClient,
  batchId: string,
  snapshot: GiftAidClaimSubmissionSnapshot,
) => {
  const submittedAt = new Date().toISOString();
  const snapshotHash = computeSnapshotHash(snapshot);
  const result = await client.mutation({
    createGiftAidClaimSubmission: {
      __args: {
        data: {
          name: `Gift Aid submission ${submittedAt.slice(0, 10)}`,
          status: 'QUEUED',
          environment: snapshot.environment,
          submittedAt,
          snapshotJson: snapshot,
          snapshotHash,
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

  return result?.createGiftAidClaimSubmission as {
    id: string;
    submittedAt?: string;
    snapshotHash?: string;
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

export const queueGiftAidClaimSubmission = async (
  client: CoreApiClient,
  batchId: string,
) => {
  // Recompute batch rollups immediately before queueing so stale materialized
  // values never decide submit readiness on their own.
  await refreshClaimBatchSummary(client, batchId);

  const claimBatch = await loadClaimBatch(client, batchId);
  if (!claimBatch?.id) {
    throw new Error('Gift Aid claim batch not found');
  }

  if (claimBatch.status !== 'SUBMITTED') {
    throw new Error('Gift Aid claim batch must be finalized before HMRC queueing');
  }

  const snapshot = await buildSnapshot(client, claimBatch);

  if (snapshot.batch.giftCount === 0) {
    throw new Error('Gift Aid claim batch has no claimable gifts');
  }

  if (snapshot.batch.hasBlockingIssues) {
    throw new Error('Gift Aid claim batch still has blocking issues');
  }

  const submission = await createSubmissionRecord(client, claimBatch.id, snapshot);
  let adapterResult:
    | Awaited<ReturnType<typeof runGiftAidHmrcSubmission>>
    | undefined;

  try {
    adapterResult = await runGiftAidHmrcSubmission(
      snapshot,
      snapshot.environment,
    );
  } catch (error) {
    const completedAt = new Date().toISOString();
    const failureMessage =
      error instanceof Error ? error.message : 'HMRC submission runner failed';

    await client.mutation({
      updateGiftAidClaimSubmission: {
        __args: {
          id: submission.id,
          data: {
            status: 'FAILED',
            completedAt,
            failureCode: 'RUNNER_ERROR',
            failureMessage,
            errorSummaryJson: {
              code: 'RUNNER_ERROR',
              message: failureMessage,
            },
          },
        },
        id: true,
      },
    } as any);

    throw error;
  }

  if (adapterResult.ok) {
    await client.mutation({
      updateGiftAidClaimSubmission: {
        __args: {
          id: submission.id,
          data: {
            status: adapterResult.status,
            submittedToHmrcAt: adapterResult.submittedToHmrcAt,
            lastPolledAt: adapterResult.lastPolledAt,
            completedAt: adapterResult.completedAt,
            correlationId: adapterResult.correlationId,
            transactionId: adapterResult.transactionId,
            responseJson: adapterResult.responseBody,
          },
        },
        id: true,
      },
    } as any);

    return {
      claimBatchId: claimBatch.id,
      submissionId: submission.id,
      status: adapterResult.status,
    };
  }

  await client.mutation({
    updateGiftAidClaimSubmission: {
      __args: {
        id: submission.id,
        data: {
          status: adapterResult.status,
          submittedToHmrcAt: adapterResult.submittedToHmrcAt,
          lastPolledAt: adapterResult.lastPolledAt,
          completedAt: adapterResult.completedAt,
          correlationId: adapterResult.correlationId,
          failureCode: adapterResult.failureCode,
          failureMessage: adapterResult.failureMessage,
          responseJson: adapterResult.responseBody,
          errorSummaryJson: {
            code: adapterResult.failureCode,
            message: adapterResult.failureMessage,
          },
        },
      },
      id: true,
    },
  } as any);

  return {
    claimBatchId: claimBatch.id,
    submissionId: submission.id,
    status: adapterResult.status,
  };
};
