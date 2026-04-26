import { CoreApiClient } from 'twenty-client-sdk/core';

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
};

export const saveGiftDate = async (recordId: string, giftDate: string) => {
  return updateGiftStaging(recordId, {
    giftDate: giftDate === '' ? null : giftDate,
    isReadyForProcessing: false,
    processingStatus: 'NOT_READY',
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
    isReadyForProcessing: false,
    processingStatus: 'NOT_READY',
  });
};

export const leaveUnresolved = async (recordId: string) => {
  return updateGiftStaging(recordId, {
    donorId: null,
    donorResolutionState: 'UNRESOLVED',
    isReadyForProcessing: false,
    processingStatus: 'NOT_READY',
  });
};

export const clearCoreGiftIssue = async (recordId: string) => {
  return updateGiftStaging(recordId, {
    hasCoreGiftIssue: false,
    isReadyForProcessing: false,
    processingStatus: 'NOT_READY',
  });
};

export const flagCoreGiftIssue = async (recordId: string) => {
  return updateGiftStaging(recordId, {
    hasCoreGiftIssue: true,
    isReadyForProcessing: false,
    processingStatus: 'NOT_READY',
  });
};

export const markReady = async (recordId: string) => {
  return updateGiftStaging(recordId, {
    isReadyForProcessing: true,
    processingStatus: 'READY',
    errorDetail: null,
  });
};
