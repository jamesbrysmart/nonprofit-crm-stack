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
  GiftAidClaimSubmissionRecord,
  GiftAidClaimSubmissionEnvironment,
  GiftAidClaimSubmissionSnapshot,
} from './gift-aid-claim.types';

const RETRYABLE_SUBMISSION_STATUSES = new Set(['FAILED', 'TIMED_OUT']);

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

const serializeRawJson = (value: unknown) => JSON.stringify(value);

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
          snapshotJson: serializeRawJson(snapshot),
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

const loadClaimSubmissions = async (
  client: CoreApiClient,
  batchId: string,
): Promise<GiftAidClaimSubmissionRecord[]> => {
  const result = await client.query({
    giftAidClaimSubmissions: {
      __args: {
        first: 50,
        filter: {
          giftAidClaimBatchId: {
            eq: batchId,
          },
        },
      },
      edges: {
        node: {
          id: true,
          status: true,
          submittedAt: true,
          completedAt: true,
          environment: true,
          name: true,
        },
      },
    },
  } as any);

  return (
    result?.giftAidClaimSubmissions?.edges?.map(
      (edge: { node: GiftAidClaimSubmissionRecord }) => edge.node,
    )?.sort((left, right) => {
      const leftTimestamp = left.submittedAt ?? left.completedAt ?? '';
      const rightTimestamp = right.submittedAt ?? right.completedAt ?? '';

      return rightTimestamp.localeCompare(leftTimestamp);
    }) ?? []
  );
};

const syncLatestSubmissionStatus = async (
  client: CoreApiClient,
  batchId: string,
  status: GiftAidClaimSubmissionRecord['status'] | null,
) => {
  await client.mutation({
    updateGiftAidClaimBatch: {
      __args: {
        id: batchId,
        data: {
          latestSubmissionStatus: status,
        },
      },
      id: true,
    },
  } as any);
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

  if (claimBatch.status !== 'FINALIZED') {
    throw new Error('Gift Aid claim batch must be finalized before HMRC queueing');
  }

  const latestSubmission = (await loadClaimSubmissions(client, batchId))[0] ?? null;

  if (
    latestSubmission?.status &&
    !RETRYABLE_SUBMISSION_STATUSES.has(latestSubmission.status)
  ) {
    throw new Error(
      `This finalized claim already has a ${latestSubmission.status.toLowerCase()} submission attempt recorded.`,
    );
  }

  const snapshot = await buildSnapshot(client, claimBatch);

  if (snapshot.batch.giftCount === 0) {
    throw new Error('Gift Aid claim batch has no claimable gifts');
  }

  if (snapshot.batch.hasBlockingIssues) {
    throw new Error('Gift Aid claim batch still has blocking issues');
  }

  const submission = await createSubmissionRecord(client, claimBatch.id, snapshot);
  await syncLatestSubmissionStatus(client, claimBatch.id, 'QUEUED');
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
            errorSummaryJson: serializeRawJson({
              code: 'RUNNER_ERROR',
              message: failureMessage,
            }),
          },
        },
        id: true,
      },
    } as any);
    await syncLatestSubmissionStatus(client, claimBatch.id, 'FAILED');

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
            responseJson: serializeRawJson(adapterResult.responseBody),
          },
        },
        id: true,
      },
    } as any);
    await syncLatestSubmissionStatus(client, claimBatch.id, adapterResult.status);

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
          responseJson: serializeRawJson(adapterResult.responseBody),
          errorSummaryJson: serializeRawJson({
            code: adapterResult.failureCode,
            message: adapterResult.failureMessage,
          }),
        },
      },
      id: true,
    },
  } as any);
  await syncLatestSubmissionStatus(client, claimBatch.id, adapterResult.status);

  return {
    claimBatchId: claimBatch.id,
    submissionId: submission.id,
    status: adapterResult.status,
  };
};
