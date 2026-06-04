import type { CoreApiClient } from 'twenty-client-sdk/core';
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

type GiftReadyRow = {
  id: string;
  amount:
    | {
        amountMicros?: number | null;
        currencyCode?: string | null;
      }
    | null;
  donor:
    | {
        id?: string | null;
      }
    | null;
  donorEmail?: string | null;
  donorFirstName?: string | null;
  donorLastName?: string | null;
  donorResolutionState?: string | null;
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
  appeal?:
    | {
        id?: string | null;
      }
    | null;
  appealSource?:
    | {
        id?: string | null;
      }
    | null;
  fund?:
    | {
        id?: string | null;
      }
    | null;
  recurringAgreement?:
    | {
        id?: string | null;
      }
    | null;
};

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
    preflight.category === 'READY' &&
    !row.donor?.id &&
    Boolean(
      findPrimaryEmailConflict({
        donorEmail: row.donorEmail,
        linkedDonorId: row.donor?.id,
        peopleByEmail,
      }),
    );

  return {
    giftReadyStatus:
      preflight.category === 'READY' &&
      isPaymentConfirmedOrNotRequired({ paymentState: row.paymentState }) &&
      !hasPrimaryEmailConflict
        ? 'READY_TO_PROCESS'
        : 'NEEDS_REVIEW',
    preflight,
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
