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
import { resolveAppealSourceSelection } from 'src/appeal-sources/appeal-source-integrity';
import { resolveSoftCreditSelection } from 'src/soft-credits/soft-credit-integrity';
import {
  deriveFundraiserSoftCreditSelection,
  loadAppealSourceFundraisersById,
} from 'src/soft-credits/fundraiser-soft-credit';
import { resolveAppealSourceExternalIdsForRows } from 'src/appeal-sources/appeal-source-external-id-resolution';

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
      paymentType: true,
      paymentState: true,
      processingStatus: true,
      provider: true,
      providerAgreementId: true,
      providerIntervalCount: true,
      providerIntervalUnit: true,
      appealSourceExternalId: true,
      sourceAppealName: true,
      sourceFundName: true,
      appeal: {
        id: true,
      },
      appealSource: {
        id: true,
      },
      fund: {
        id: true,
      },
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
          paymentType?: string | null;
          paymentState?: string | null;
          processingStatus?: string | null;
          provider?: string | null;
          providerAgreementId?: string | null;
          providerIntervalCount?: number | null;
          providerIntervalUnit?: string | null;
          appealSourceExternalId?: string | null;
          sourceAppealName?: string | null;
          sourceFundName?: string | null;
          appeal?: { id?: string | null } | null;
          appealSource?: { id?: string | null } | null;
          fund?: { id?: string | null } | null;
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
    paymentType?: string | null;
    paymentState?: string | null;
    processingStatus?: string | null;
    provider?: string | null;
    providerAgreementId?: string | null;
    providerIntervalCount?: number | null;
    providerIntervalUnit?: string | null;
    appealSourceExternalId?: string | null;
    sourceAppealName?: string | null;
    sourceFundName?: string | null;
    appeal?: { id?: string | null } | null;
    appealSource?: { id?: string | null } | null;
    fund?: { id?: string | null } | null;
    recurringAgreement?: { id?: string | null } | null;
  };
}): Promise<GiftReadyStatus> => {
  const [resolvedRow] = await resolveAppealSourceExternalIdsForRows(client, [
    row,
  ]);
  const peopleByEmail = await loadPeopleByPrimaryEmails(client, [
    resolvedRow?.donorEmail ?? '',
  ]);
  const evaluation = evaluateGiftReadyRow({
    row: {
      id: resolvedRow.id ?? '',
      amount: resolvedRow.amount ?? null,
      donor: resolvedRow.donor ?? null,
      donorEmail: resolvedRow.donorEmail ?? null,
      donorFirstName: resolvedRow.donorFirstName ?? null,
      donorLastName: resolvedRow.donorLastName ?? null,
      donorResolutionState: resolvedRow.donorResolutionState ?? null,
      giftDate: resolvedRow.giftDate ?? null,
      paymentType: resolvedRow.paymentType ?? null,
      paymentState: resolvedRow.paymentState ?? null,
      processingStatus: resolvedRow.processingStatus ?? null,
      provider: resolvedRow.provider ?? null,
      providerAgreementId: resolvedRow.providerAgreementId ?? null,
      providerIntervalCount: resolvedRow.providerIntervalCount ?? null,
      providerIntervalUnit: resolvedRow.providerIntervalUnit ?? null,
      appealSourceExternalId: resolvedRow.appealSourceExternalId ?? null,
      sourceAppealName: resolvedRow.sourceAppealName ?? null,
      sourceFundName: resolvedRow.sourceFundName ?? null,
      appeal: resolvedRow.appeal ?? null,
      appealSource: resolvedRow.appealSource ?? null,
      fund: resolvedRow.fund ?? null,
      recurringAgreement: resolvedRow.recurringAgreement ?? null,
    },
    peopleByEmail,
  });

  if (evaluation.hasPrimaryEmailConflict) {
    const conflict = findPrimaryEmailConflict({
      donorEmail: resolvedRow.donorEmail,
      linkedDonorId: resolvedRow.donor?.id,
      peopleByEmail,
    });

    throw new Error(
      buildConflictMessage(resolvedRow.donorEmail?.trim() ?? '', conflict ?? undefined),
    );
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

export const saveGiftCoding = async (
  recordId: string,
  coding: {
    appealId: string;
    appealSourceId: string;
    fundId: string;
    paymentType?: string;
    softCreditPersonId?: string;
    softCreditCompanyId?: string;
    softCreditType?: string;
  },
) => {
  const client = new CoreApiClient();
  const existing = await client.query({
    giftStaging: {
      __args: {
        filter: {
          id: {
            eq: recordId,
          },
        },
      },
      id: true,
      appealSource: {
        id: true,
      },
      softCreditPerson: {
        id: true,
      },
      softCreditCompany: {
        id: true,
      },
      softCreditType: true,
    },
  } as any);
  const currentGiftStaging = existing?.giftStaging as
    | {
        id?: string | null;
        appealSource?: { id?: string | null } | null;
        softCreditPerson?: { id?: string | null } | null;
        softCreditCompany?: { id?: string | null } | null;
        softCreditType?: string | null;
      }
    | null;

  if (!currentGiftStaging?.id) {
    throw new Error('Gift staging row not found');
  }

  const {
    appealId,
    appealSourceId,
    appealDefaultFundId,
  } = await resolveAppealSourceSelection({
    client,
    appealId: coding.appealId.trim(),
    appealSourceId: coding.appealSourceId.trim(),
  });
  const softCreditSelection = resolveSoftCreditSelection({
    softCreditPersonId: coding.softCreditPersonId,
    softCreditCompanyId: coding.softCreditCompanyId,
    softCreditType: coding.softCreditType,
    treatUndefinedAsUnchanged: true,
  });
  const appealSourceFundraisers = await loadAppealSourceFundraisersById(client, [
    currentGiftStaging.appealSource?.id ?? '',
    appealSourceId,
  ]);
  const resolvedSoftCreditSelection = deriveFundraiserSoftCreditSelection({
    currentSoftCredit: {
      softCreditPersonId: currentGiftStaging.softCreditPerson?.id ?? '',
      softCreditCompanyId: currentGiftStaging.softCreditCompany?.id ?? '',
      softCreditType: currentGiftStaging.softCreditType ?? '',
    },
    currentAppealSourceFundraiser:
      appealSourceFundraisers[currentGiftStaging.appealSource?.id ?? ''],
    nextAppealSourceFundraiser: appealSourceFundraisers[appealSourceId],
    requestedSoftCreditSelection: softCreditSelection,
  });
  const fundId = coding.fundId.trim() === '' ? appealDefaultFundId : coding.fundId.trim();
  const paymentType = coding.paymentType?.trim().toUpperCase() ?? '';

  if (
    paymentType !== '' &&
    !['CARD', 'DIRECT_DEBIT', 'BANK_TRANSFER', 'CASH', 'CHEQUE', 'OTHER'].includes(
      paymentType,
    )
  ) {
    throw new Error('Payment type is not supported');
  }

  return updateGiftStaging(recordId, {
    ...(appealId !== ''
      ? {
          appeal: {
            connect: {
              where: {
                id: appealId,
              },
            },
          },
        }
      : {
          appealId: null,
        }),
    ...(appealSourceId !== ''
      ? {
          appealSource: {
            connect: {
              where: {
                id: appealSourceId,
              },
            },
          },
        }
      : {
          appealSourceId: null,
        }),
    ...(fundId !== ''
      ? {
          fund: {
            connect: {
              where: {
                id: fundId,
              },
            },
          },
          }
        : {
            fundId: null,
          }),
    ...(resolvedSoftCreditSelection.mode === 'set' &&
    resolvedSoftCreditSelection.softCreditPersonId !== ''
      ? {
          softCreditPerson: {
            connect: {
              where: {
                id: resolvedSoftCreditSelection.softCreditPersonId,
              },
            },
          },
          softCreditCompanyId: null,
          softCreditType: resolvedSoftCreditSelection.softCreditType,
        }
      : {}),
    ...(resolvedSoftCreditSelection.mode === 'set' &&
    resolvedSoftCreditSelection.softCreditCompanyId !== ''
      ? {
          softCreditCompany: {
            connect: {
              where: {
                id: resolvedSoftCreditSelection.softCreditCompanyId,
              },
            },
          },
          softCreditPersonId: null,
          softCreditType: resolvedSoftCreditSelection.softCreditType,
        }
      : {}),
    ...(resolvedSoftCreditSelection.mode === 'clear'
      ? {
          softCreditPersonId: null,
          softCreditCompanyId: null,
          softCreditType: null,
        }
      : {}),
    paymentType: paymentType === '' ? null : paymentType,
  });
};
