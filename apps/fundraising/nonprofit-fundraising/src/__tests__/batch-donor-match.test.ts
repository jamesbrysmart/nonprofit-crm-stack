import { describe, expect, it } from 'vitest';
import {
  canEvaluateBatchDonorMatchRow,
  determineBatchDonorMatchOutcome,
  groupRowsForBatchDonorMatch,
} from 'src/batch-donor-match/batch-donor-match';

describe('batch donor match', () => {
  it('groups identical exact donor evidence together', () => {
    const groups = groupRowsForBatchDonorMatch([
      {
        id: 'row_1',
        donorFirstName: 'Ada',
        donorLastName: 'Lovelace',
        donorEmail: 'ada@example.com',
        isAnonymousDonor: false,
        donorResolutionState: 'UNREVIEWED',
        paymentState: null,
        processingStatus: 'NOT_PROCESSED',
        donor: null,
      },
      {
        id: 'row_2',
        donorFirstName: 'Ada',
        donorLastName: 'Lovelace',
        donorEmail: 'ada@example.com',
        isAnonymousDonor: false,
        donorResolutionState: 'UNREVIEWED',
        paymentState: null,
        processingStatus: 'NOT_PROCESSED',
        donor: null,
      },
      {
        id: 'row_3',
        donorFirstName: 'Ada',
        donorLastName: 'Lovelace',
        donorEmail: 'other@example.com',
        isAnonymousDonor: false,
        donorResolutionState: 'UNREVIEWED',
        paymentState: null,
        processingStatus: 'NOT_PROCESSED',
        donor: null,
      },
    ]);

    expect(groups).toHaveLength(2);
    expect(groups[0]?.rows.map((row) => row.id)).toEqual(['row_1', 'row_2']);
  });

  it('auto-links only when one exact email candidate exists', () => {
    const outcome = determineBatchDonorMatchOutcome({
      email: 'ada@example.com',
      nameCandidates: [
        {
          id: 'person_1',
          emails: {
            primaryEmail: 'ada@example.com',
            additionalEmails: [],
          },
        },
      ],
      emailCandidates: [
        {
          id: 'person_1',
          emails: {
            primaryEmail: 'ada@example.com',
            additionalEmails: [],
          },
        },
      ],
    });

    expect(outcome).toEqual({
      kind: 'CONFIRMED',
      donorId: 'person_1',
    });
  });

  it('marks rows ambiguous when multiple exact email candidates exist', () => {
    const outcome = determineBatchDonorMatchOutcome({
      email: 'ada@example.com',
      nameCandidates: [
        {
          id: 'person_1',
          emails: {
            primaryEmail: 'ada@example.com',
            additionalEmails: [],
          },
        },
        {
          id: 'person_2',
          emails: {
            primaryEmail: 'ada@example.com',
            additionalEmails: [],
          },
        },
      ],
      emailCandidates: [],
    });

    expect(outcome).toEqual({
      kind: 'AMBIGUOUS',
      candidateCount: 2,
    });
  });

  it('marks same-name rows ambiguous when email does not safely auto-link', () => {
    const outcome = determineBatchDonorMatchOutcome({
      email: 'ada@example.com',
      nameCandidates: [
        {
          id: 'person_1',
          emails: {
            primaryEmail: 'other@example.com',
            additionalEmails: ['another@example.com'],
          },
        },
      ],
      emailCandidates: [],
    });

    expect(outcome).toEqual({
      kind: 'AMBIGUOUS',
      candidateCount: 1,
    });
  });

  it('marks unique exact email-only matches ambiguous for review', () => {
    const outcome = determineBatchDonorMatchOutcome({
      email: 'ada@example.com',
      nameCandidates: [],
      emailCandidates: [
        {
          id: 'person_1',
          emails: {
            primaryEmail: 'ada@example.com',
            additionalEmails: [],
          },
        },
      ],
    });

    expect(outcome).toEqual({
      kind: 'AMBIGUOUS',
      candidateCount: 1,
    });
  });

  it('leaves rows unreviewed when no candidate set exists', () => {
    const outcome = determineBatchDonorMatchOutcome({
      email: 'nobody@example.com',
      nameCandidates: [],
      emailCandidates: [],
    });

    expect(outcome).toEqual({
      kind: 'UNREVIEWED',
      candidateCount: 0,
    });
  });

  it('evaluates unreviewed, unprocessed, donorless rows with first and last name even when email is missing', () => {
    expect(
      canEvaluateBatchDonorMatchRow({
        id: 'row_1',
        donorFirstName: 'Ada',
        donorLastName: 'Lovelace',
        donorEmail: 'ada@example.com',
        isAnonymousDonor: false,
        donorResolutionState: 'UNREVIEWED',
        paymentState: null,
        processingStatus: 'NOT_PROCESSED',
        donor: null,
      }),
    ).toBe(true);

    expect(
      canEvaluateBatchDonorMatchRow({
        id: 'row_2',
        donorFirstName: 'Ada',
        donorLastName: 'Lovelace',
        donorEmail: '',
        isAnonymousDonor: false,
        donorResolutionState: 'UNREVIEWED',
        paymentState: null,
        processingStatus: 'NOT_PROCESSED',
        donor: null,
      }),
    ).toBe(true);
  });

  it('does not evaluate rows that are still awaiting payment confirmation', () => {
    expect(
      canEvaluateBatchDonorMatchRow({
        id: 'row_3',
        donorFirstName: 'Ada',
        donorLastName: 'Lovelace',
        donorEmail: 'ada@example.com',
        isAnonymousDonor: false,
        donorResolutionState: 'UNREVIEWED',
        paymentState: 'AWAITING_PAYMENT',
        processingStatus: 'NOT_PROCESSED',
        donor: null,
      }),
    ).toBe(false);
  });

  it('does not evaluate rows marked anonymous', () => {
    expect(
      canEvaluateBatchDonorMatchRow({
        id: 'row_4',
        donorFirstName: 'Ada',
        donorLastName: 'Lovelace',
        donorEmail: 'ada@example.com',
        isAnonymousDonor: true,
        donorResolutionState: 'UNREVIEWED',
        paymentState: null,
        processingStatus: 'NOT_PROCESSED',
        donor: null,
      }),
    ).toBe(false);
  });
});
