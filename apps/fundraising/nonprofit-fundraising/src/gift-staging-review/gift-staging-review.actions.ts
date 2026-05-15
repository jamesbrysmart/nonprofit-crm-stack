import { CoreApiClient } from 'twenty-client-sdk/core';
import {
  buildConflictMessage,
  findPrimaryEmailConflict,
  loadPeopleByPrimaryEmails,
} from 'src/donor-resolution/donor-creation-viability';
import {
  evaluateGiftReadyRow,
  type GiftReadyStatus,
} from './gift-ready-status';
import { broadcastGiftStagingRecordInvalidated } from './gift-staging-record-sync';

const updateGiftStaging = async (
  recordId: string,
  data: Record<string, unknown>,
) => {
  const client = new CoreApiClient();

  await client.mutation({
    updateGiftStaging: {
      __args: {
        id: recordId,
        data,
      },
      id: true,
    },
  } as any);

  broadcastGiftStagingRecordInvalidated(recordId);
};

const loadGiftStagingForReadinessCheck = async (recordId: string) => {
  const client = new CoreApiClient();
  const result = await client.query({
    giftStaging: {
      __args: {
        filter: {
          id: { eq: recordId },
        },
      },
      id: true,
      amount: {
        amountMicros: true,
        currencyCode: true,
      },
      donorFirstName: true,
      donorLastName: true,
      donorEmail: true,
      donorResolutionState: true,
      donor: {
        id: true,
      },
      giftDate: true,
      processingStatus: true,
      provider: true,
      providerAgreementId: true,
      providerIntervalCount: true,
      providerIntervalUnit: true,
      recurringAgreement: {
        id: true,
      },
    },
  } as any);

  return {
    client,
    row: result?.giftStaging as
      | {
          id?: string;
          amount?:
            | {
                amountMicros?: number | null;
                currencyCode?: string | null;
              }
            | null;
          donorFirstName?: string | null;
          donorLastName?: string | null;
          donorEmail?: string | null;
          donorResolutionState?: string | null;
          donor?: { id?: string | null } | null;
          giftDate?: string | null;
          processingStatus?: string | null;
          provider?: string | null;
          providerAgreementId?: string | null;
          providerIntervalCount?: number | null;
          providerIntervalUnit?: string | null;
          recurringAgreement?: { id?: string | null } | null;
        }
      | null,
  };
};

const evaluateGiftReadyStatus = async ({
  client,
  row,
}: {
  client: CoreApiClient;
  row: {
    id?: string;
    amount?:
      | {
          amountMicros?: number | null;
          currencyCode?: string | null;
        }
      | null;
    donorFirstName?: string | null;
    donorLastName?: string | null;
    donorEmail?: string | null;
    donorResolutionState?: string | null;
    donor?: { id?: string | null } | null;
    giftDate?: string | null;
    processingStatus?: string | null;
    provider?: string | null;
    providerAgreementId?: string | null;
    providerIntervalCount?: number | null;
    providerIntervalUnit?: string | null;
    recurringAgreement?: { id?: string | null } | null;
  };
}): Promise<GiftReadyStatus> => {
  const peopleByEmail = await loadPeopleByPrimaryEmails(client, [
    row.donorEmail ?? '',
  ]);
  const evaluation = evaluateGiftReadyRow({
    row: {
      id: row.id ?? '',
      amount: row.amount ?? null,
      donor: row.donor ?? null,
      donorEmail: row.donorEmail ?? null,
      donorFirstName: row.donorFirstName ?? null,
      donorLastName: row.donorLastName ?? null,
      donorResolutionState: row.donorResolutionState ?? null,
      giftDate: row.giftDate ?? null,
      processingStatus: row.processingStatus ?? null,
      provider: row.provider ?? null,
      providerAgreementId: row.providerAgreementId ?? null,
      providerIntervalCount: row.providerIntervalCount ?? null,
      providerIntervalUnit: row.providerIntervalUnit ?? null,
      recurringAgreement: row.recurringAgreement ?? null,
    },
    peopleByEmail,
  });

  if (evaluation.hasPrimaryEmailConflict) {
    const conflict = findPrimaryEmailConflict({
      donorEmail: row.donorEmail,
      linkedDonorId: row.donor?.id,
      peopleByEmail,
    });

    throw new Error(buildConflictMessage(row.donorEmail?.trim() ?? '', conflict ?? undefined));
  }

  return evaluation.giftReadyStatus;
};

const checkGiftReadyStatus = async (recordId: string): Promise<GiftReadyStatus> => {
  const { client, row } = await loadGiftStagingForReadinessCheck(recordId);

  if (!row) {
    throw new Error('Gift staging row not found');
  }

  return evaluateGiftReadyStatus({
    client,
    row: {
      ...row,
      id: row.id ?? recordId,
    },
  });
};

export const saveGiftDate = async (recordId: string, giftDate: string) => {
  return updateGiftStaging(recordId, {
    giftDate: giftDate === '' ? null : giftDate,
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
  });
};

export const saveDonorEvidence = async (
  recordId: string,
  donorEvidence: {
    donorFirstName: string;
    donorLastName: string;
    donorEmail: string;
  },
) => {
  return updateGiftStaging(recordId, {
    donorFirstName: donorEvidence.donorFirstName.trim(),
    donorLastName: donorEvidence.donorLastName.trim(),
    donorEmail:
      donorEvidence.donorEmail.trim() === ''
        ? null
        : donorEvidence.donorEmail.trim(),
    donorId: null,
    donorResolutionState: 'NEW_DONOR',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
  });
};

export const linkDonor = async (recordId: string, donorId: string) => {
  return updateGiftStaging(recordId, {
    donor: {
      connect: {
        where: {
          id: donorId,
        },
      },
    },
    donorResolutionState: 'CONFIRMED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
  });
};

export const leaveUnresolved = async (recordId: string) => {
  const { client, row } = await loadGiftStagingForReadinessCheck(recordId);

  if (!row) {
    throw new Error('Gift staging row not found');
  }

  const donorRow = {
    ...row,
    id: row.id ?? recordId,
    donor: null,
    donorResolutionState: 'NEW_DONOR',
    processingStatus: 'NOT_PROCESSED',
  };

  const giftReadyStatus = await evaluateGiftReadyStatus({
    client,
    row: donorRow,
  });

  return updateGiftStaging(recordId, {
    giftReadyStatus,
    donorId: null,
    donorResolutionState: 'NEW_DONOR',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
  });
};

export const checkIfReady = async (recordId: string) => {
  const giftReadyStatus = await checkGiftReadyStatus(recordId);

  return updateGiftStaging(recordId, {
    giftReadyStatus,
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
  });
};
