type ProcessabilityInput = {
  processingStatus: string | null | undefined;
  donorResolutionState: string | null | undefined;
  donorFirstName?: string | null | undefined;
  donorLastName?: string | null | undefined;
  linkedDonorId?: string | null | undefined;
};

const normalizeString = (value: string | null | undefined) =>
  typeof value === 'string' ? value.trim() : '';

export const hasSufficientDonorEvidenceForNewDonor = (
  input: Pick<ProcessabilityInput, 'donorFirstName' | 'donorLastName'>,
) =>
  normalizeString(input.donorFirstName) !== '' &&
  normalizeString(input.donorLastName) !== '';

export const hasLinkedDonorForProcessing = (
  input: Pick<ProcessabilityInput, 'linkedDonorId'>,
) => normalizeString(input.linkedDonorId) !== '';

export const isGiftStagingProcessable = (input: ProcessabilityInput) => {
  return Boolean(
    input.processingStatus !== 'PROCESSED' &&
      input.donorResolutionState !== 'AMBIGUOUS' &&
      (hasLinkedDonorForProcessing(input) ||
        hasSufficientDonorEvidenceForNewDonor(input)),
  );
};
