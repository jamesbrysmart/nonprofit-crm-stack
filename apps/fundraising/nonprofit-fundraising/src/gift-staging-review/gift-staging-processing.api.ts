import { broadcastGiftStagingRecordInvalidated } from './gift-staging-record-sync';
import { postAppRouteJson } from 'src/app-api/app-route-client';

type ProcessGiftStagingRowRequest = {
  giftStagingId: string;
};

export type ProcessGiftStagingRowResponse = {
  giftStagingId: string;
  processingStatus: 'NOT_PROCESSED' | 'PROCESSED' | 'PROCESS_FAILED';
  committedGiftId: string | null;
  recurringAgreementId: string | null;
  errorDetail: string | null;
};

export const processGiftStagingRow = (
  input: ProcessGiftStagingRowRequest,
): Promise<ProcessGiftStagingRowResponse> =>
  postAppRouteJson<ProcessGiftStagingRowResponse>(
    '/s/gift-staging/process-row',
    input,
  ).then((response) => {
    broadcastGiftStagingRecordInvalidated(input.giftStagingId);

    return response;
  });
