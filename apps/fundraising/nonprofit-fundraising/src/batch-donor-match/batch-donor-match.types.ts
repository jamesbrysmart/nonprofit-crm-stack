import type { PersonSummary } from 'src/manual-gift-entry/manual-gift-entry.types';

export type BatchDonorMatchRow = {
  id: string;
  donorFirstName: string | null;
  donorLastName: string | null;
  donorEmail: string | null;
  isAnonymousDonor: boolean | null;
  donorResolutionState: string | null;
  paymentState: string | null;
  processingStatus: string | null;
  donor?: {
    id?: string | null;
  } | null;
};

export type BatchDonorMatchRequest = {
  giftBatchId: string;
};

export type BatchDonorMatchResponse = {
  giftBatchId: string;
  totalCandidateRows: number;
  evaluatedRows: number;
  alreadyConfirmedRows: number;
  autoLinkedRows: number;
  ambiguousRows: number;
  unchangedRows: number;
};

export type BatchDonorMatchOutcome =
  | {
      kind: 'CONFIRMED';
      donorId: string;
    }
  | {
      kind: 'AMBIGUOUS';
      candidateCount: number;
    }
  | {
      kind: 'UNREVIEWED';
      candidateCount: number;
    };

export type BatchDonorMatchEvidence = {
  email: string;
  nameCandidates: ExactDonorCandidate[];
  emailCandidates: ExactDonorCandidate[];
};

export type BatchDonorMatchGroup = {
  firstName: string;
  lastName: string;
  email: string;
  rows: BatchDonorMatchRow[];
};

export type ExactDonorCandidate = PersonSummary & {
  emails?: {
    primaryEmail?: string | null;
    additionalEmails?: string[] | null;
  } | null;
};
