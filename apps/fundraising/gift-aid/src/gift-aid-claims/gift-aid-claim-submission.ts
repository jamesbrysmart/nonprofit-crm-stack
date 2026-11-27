import { createHash } from 'node:crypto';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { computeClaimBatchRollups } from './gift-aid-claim-batch-rollups';
import { listGiftsForClaimBatch, loadClaimBatch } from './gift-aid-claim-batch.queries';
import { runGiftAidHmrcSubmission } from './gift-aid-hmrc-runner';
import type {
  GiftAidClaimBatchRecord,
  GiftAidClaimSubmissionStatus,
  MailingAddress,
  GiftAidClaimSubmissionEnvironment,
  GiftAidClaimSubmissionSnapshot,
} from './gift-aid-claim.types';

const RETRYABLE_SUBMISSION_STATUSES = new Set(['FAILED', 'TIMED_OUT']);

const getSubmissionEnvironment = (): GiftAidClaimSubmissionEnvironment =>
  (process.env.HMRC_SUBMISSION_ENVIRONMENT ?? 'TEST').trim().toUpperCase() ===
  'LIVE'
    ? 'LIVE'
    : 'TEST';

const readMailingAddress = (value: unknown): MailingAddress => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;

  const fields = value as Record<string, unknown>;
  const text = (key: string) => typeof fields[key] === 'string' ? fields[key] : undefined;
  return {
    addressStreet1: text('addressStreet1'),
    addressStreet2: text('addressStreet2'),
    addressCity: text('addressCity'),
    addressState: text('addressState'),
    addressPostcode: text('addressPostcode'),
    addressCountry: text('addressCountry'),
  };
};

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
      donorMailingAddress: readMailingAddress(gift.donor?.mailingAddress),
      amountMicros: gift.amount?.amountMicros ?? 0,
      currencyCode: gift.amount?.currencyCode ?? '',
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
  });

  return result.createGiftAidClaimSubmission;
};

const loadLatestClaimSubmissionStatus = async (
  client: CoreApiClient,
  batchId: string,
): Promise<GiftAidClaimSubmissionStatus | undefined> => {
  const result = await client.query({
    giftAidClaimSubmissions: {
      __args: {
        first: 1,
        filter: { giftAidClaimBatchId: { eq: batchId } },
        orderBy: [{ submittedAt: 'DescNullsLast' }],
      },
      edges: { node: { status: true } },
    },
  });
  return result.giftAidClaimSubmissions?.edges[0]?.node.status;
};

const syncLatestSubmissionStatus = async (
  client: CoreApiClient,
  batchId: string,
  status: GiftAidClaimSubmissionStatus | null,
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
  });
};

const markSubmissionFailed = async ({
  client,
  submissionId,
  batchId,
  failureCode,
  failureMessage,
}: {
  client: CoreApiClient;
  submissionId: string;
  batchId: string;
  failureCode: string;
  failureMessage: string;
}) => {
  const completedAt = new Date().toISOString();

  await client.mutation({
    updateGiftAidClaimSubmission: {
      __args: {
        id: submissionId,
        data: {
          status: 'FAILED',
          completedAt,
          failureCode,
          failureMessage,
          errorSummaryJson: {
            code: failureCode,
            message: failureMessage,
          },
        },
      },
      id: true,
    },
  });
  await syncLatestSubmissionStatus(client, batchId, 'FAILED');
};

export const queueGiftAidClaimSubmission = async (
  client: CoreApiClient,
  batchId: string,
) => {
  const claimBatch = await loadClaimBatch(client, batchId);
  if (!claimBatch?.id) {
    throw new Error('Gift Aid claim batch not found');
  }

  if (claimBatch.status !== 'FINALIZED') {
    throw new Error('Gift Aid claim batch must be finalized before HMRC queueing');
  }

  const latestStatus = await loadLatestClaimSubmissionStatus(client, batchId);

  if (latestStatus && !RETRYABLE_SUBMISSION_STATUSES.has(latestStatus)) {
    throw new Error(
      `This finalized claim already has a ${latestStatus.toLowerCase()} submission attempt recorded.`,
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
  if (!submission?.id) {
    throw new Error('Gift Aid claim submission creation did not return an id');
  }
  let adapterResult:
    | Awaited<ReturnType<typeof runGiftAidHmrcSubmission>>
    | undefined;

  try {
    await syncLatestSubmissionStatus(client, claimBatch.id, 'QUEUED');
    adapterResult = await runGiftAidHmrcSubmission(
      snapshot,
      snapshot.environment,
    );
  } catch (error) {
    const failureMessage =
      error instanceof Error ? error.message : 'HMRC submission runner failed';

    await markSubmissionFailed({
      client,
      submissionId: submission.id,
      batchId: claimBatch.id,
      failureCode: 'RUNNER_ERROR',
      failureMessage,
    });

    return {
      claimBatchId: claimBatch.id,
      submissionId: submission.id,
      status: 'FAILED',
      warningMessage: failureMessage,
    };
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
    });
    await syncLatestSubmissionStatus(client, claimBatch.id, adapterResult.status);

    return {
      claimBatchId: claimBatch.id,
      submissionId: submission.id,
      status: adapterResult.status,
      warningMessage: null,
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
  });
  await syncLatestSubmissionStatus(client, claimBatch.id, adapterResult.status);

  return {
    claimBatchId: claimBatch.id,
    submissionId: submission.id,
    status: adapterResult.status,
    warningMessage:
      adapterResult.status === 'FAILED' || adapterResult.status === 'TIMED_OUT'
        ? adapterResult.failureMessage
        : null,
  };
};
