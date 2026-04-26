import { CoreApiClient } from 'twenty-client-sdk/core';

const updateStagingReviewItem = async (
  recordId: string,
  data: Record<string, unknown>,
) => {
  const client = new CoreApiClient();

  await client.mutation({
    updateStagingReviewItem: {
      __args: {
        id: recordId,
        data,
      },
      id: true,
    },
  } as any);
};

export const saveGiftDate = async (
  recordId: string,
  giftDateInput: string,
) => {
  const nextGiftDate = giftDateInput
    ? new Date(giftDateInput).toISOString()
    : null;

  return updateStagingReviewItem(recordId, {
    giftDate: nextGiftDate,
    isReadyForProcessing: false,
  });
};

export const linkDonor = async (recordId: string, donorId: string) => {
  return updateStagingReviewItem(recordId, {
    donorId,
    donorResolutionState: 'CONFIRMED',
    isReadyForProcessing: false,
  });
};

export const leaveUnresolved = async (recordId: string) => {
  return updateStagingReviewItem(recordId, {
    donorId: null,
    donorResolutionState: 'UNRESOLVED',
    isReadyForProcessing: false,
  });
};

export const clearCoreGiftIssue = async (recordId: string) => {
  return updateStagingReviewItem(recordId, {
    hasCoreGiftIssue: false,
    isReadyForProcessing: false,
  });
};

export const flagCoreGiftIssue = async (recordId: string) => {
  return updateStagingReviewItem(recordId, {
    hasCoreGiftIssue: true,
    isReadyForProcessing: false,
  });
};

export const markReady = async (
  recordId: string,
  processingOutcome: 'NOT_RUN' | 'FAILED',
) => {
  return updateStagingReviewItem(recordId, {
    isReadyForProcessing: true,
    processingOutcome:
      processingOutcome === 'FAILED' ? 'NOT_RUN' : processingOutcome,
  });
};
