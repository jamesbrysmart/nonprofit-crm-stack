import type { CoreApiClient } from 'twenty-client-sdk/core';
import type { BatchProcessingRow } from 'src/batch-processing/batch-processing.types';
import {
  classifyBatchPreflight,
  type BatchPreflightResult,
} from 'src/batch-processing/batch-processing.preflight';
import {
  findPrimaryEmailConflict,
  loadPeopleByPrimaryEmails,
  type PeopleByEmailMap,
} from 'src/donor-resolution/donor-creation-viability';
import { isPaymentConfirmedOrNotRequired } from './gift-staging-processability';

export type GiftReadyStatus = 'NEEDS_REVIEW' | 'READY_TO_PROCESS';

type GiftReadyRow = Pick<
  BatchProcessingRow,
  | 'id'
  | 'amount'
  | 'donor'
  | 'donorEmail'
  | 'donorFirstName'
  | 'donorLastName'
  | 'isAnonymousDonor'
  | 'donorResolutionState'
  | 'giftDate'
  | 'paymentType'
  | 'paymentState'
  | 'processingStatus'
  | 'provider'
  | 'providerAgreementId'
  | 'providerIntervalCount'
  | 'providerIntervalUnit'
  | 'appealSourceExternalId'
  | 'sourceAppealName'
  | 'sourceFundName'
  | 'appeal'
  | 'appealSource'
  | 'fund'
  | 'recurringAgreement'
>;

export type GiftReadyEvaluation = {
  giftReadyStatus: GiftReadyStatus;
  preflight: BatchPreflightResult;
  hasPrimaryEmailConflict: boolean;
};

const normalizeString = (value: string | null | undefined) =>
  typeof value === 'string' ? value.trim() : '';

export const normalizeGiftReadyStatus = (
  value: string | null | undefined,
): GiftReadyStatus => {
  return normalizeString(value).toUpperCase() === 'READY_TO_PROCESS'
    ? 'READY_TO_PROCESS'
    : 'NEEDS_REVIEW';
};

export const evaluateGiftReadyRow = ({
  row,
  peopleByEmail,
}: {
  row: GiftReadyRow;
  peopleByEmail: PeopleByEmailMap;
}): GiftReadyEvaluation => {
  const preflight = classifyBatchPreflight(row);
  const hasPrimaryEmailConflict =
    row.isAnonymousDonor !== true &&
    !row.donor?.id &&
    Boolean(
      findPrimaryEmailConflict({
        donorEmail: row.donorEmail,
        linkedDonorId: row.donor?.id,
        peopleByEmail,
      }),
    );
  const preflightWithEmailConflict: BatchPreflightResult =
    hasPrimaryEmailConflict &&
    preflight.category !== 'PROCESSED' &&
    preflight.category !== 'FAILED'
      ? {
          category: 'NEEDS_REVIEW',
          issueCodes: [
            ...preflight.issueCodes,
            'DONOR_PRIMARY_EMAIL_CONFLICT',
          ],
        }
      : preflight;

  return {
    giftReadyStatus:
      preflightWithEmailConflict.category === 'READY' &&
      isPaymentConfirmedOrNotRequired({ paymentState: row.paymentState }) &&
      !hasPrimaryEmailConflict
        ? 'READY_TO_PROCESS'
        : 'NEEDS_REVIEW',
    preflight: preflightWithEmailConflict,
    hasPrimaryEmailConflict,
  };
};

export const loadGiftReadyEvaluations = async (
  client: CoreApiClient,
  rows: GiftReadyRow[],
) => {
  const emails = rows
    .filter((row) => !row.donor?.id)
    .map((row) => row.donorEmail ?? '');
  const peopleByEmail = await loadPeopleByPrimaryEmails(client, emails);

  return new Map(
    rows.map((row) => [
      row.id,
      evaluateGiftReadyRow({
        row,
        peopleByEmail,
      }),
    ]),
  );
};
