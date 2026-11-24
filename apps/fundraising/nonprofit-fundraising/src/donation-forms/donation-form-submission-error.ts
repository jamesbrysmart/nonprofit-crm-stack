// Codes the public donation form shows to donors; messages stay technical for logs.
export type DonationFormSubmissionErrorCode =
  | 'INVALID_AMOUNT'
  | 'INVALID_SUBMISSION'
  | 'FORM_UNAVAILABLE'
  | 'FORM_EXPIRED'
  | 'REJECTED';

export class DonationFormSubmissionError extends Error {
  readonly code: DonationFormSubmissionErrorCode;

  constructor(code: DonationFormSubmissionErrorCode, message: string) {
    super(message);
    this.name = 'DonationFormSubmissionError';
    this.code = code;
  }
}
