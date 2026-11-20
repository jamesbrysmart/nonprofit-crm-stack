import { normalizeDonorResolutionState } from 'src/donor-resolution/donor-resolution-state';
import { normalizeString } from 'src/utils/normalize-string';

type ProcessabilityInput = {
  processingStatus: string | null | undefined;
  paymentState?: string | null | undefined;
  isAnonymousDonor?: boolean | null | undefined;
  donorResolutionState: string | null | undefined;
  donorFirstName?: string | null | undefined;
  donorLastName?: string | null | undefined;
  linkedDonorId?: string | null | undefined;
};

export const hasSufficientDonorEvidenceForNewDonor = (
  input: Pick<ProcessabilityInput, 'donorFirstName' | 'donorLastName'>,
) =>
  normalizeString(input.donorFirstName) !== '' &&
  normalizeString(input.donorLastName) !== '';

export const hasInitialOnlyDonorNamePart = (
  input: Pick<ProcessabilityInput, 'donorFirstName' | 'donorLastName'>,
) =>
  normalizeString(input.donorFirstName).length === 1 ||
  normalizeString(input.donorLastName).length === 1;

export const hasLinkedDonorForProcessing = (
  input: Pick<ProcessabilityInput, 'linkedDonorId'>,
) => normalizeString(input.linkedDonorId) !== '';

export const isExplicitAnonymousDonor = (
  input: Pick<ProcessabilityInput, 'isAnonymousDonor'>,
) => input.isAnonymousDonor === true;

export const isPaymentConfirmedOrNotRequired = (
  input: Pick<ProcessabilityInput, 'paymentState'>,
) => {
  const paymentState = normalizeString(input.paymentState).toUpperCase();

  return paymentState === '' || paymentState === 'PAYMENT_CONFIRMED';
};

export const isGiftStagingProcessable = (input: ProcessabilityInput) => {
  return Boolean(
    input.processingStatus !== 'PROCESSED' &&
      isPaymentConfirmedOrNotRequired(input) &&
      normalizeDonorResolutionState(input.donorResolutionState) !==
        'AMBIGUOUS' &&
      (isExplicitAnonymousDonor(input) ||
        hasLinkedDonorForProcessing(input) ||
        hasSufficientDonorEvidenceForNewDonor(input)),
  );
};
