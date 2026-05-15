import { postAppRouteJson } from 'src/app-api/app-route-client';
import type {
  CheckSelectedGiftStagingReadinessRequest,
  CheckSelectedGiftStagingReadinessResponse,
  ProcessSelectedGiftStagingRequest,
  ProcessSelectedGiftStagingResponse,
  RunSelectedGiftStagingDonorMatchRequest,
  RunSelectedGiftStagingDonorMatchResponse,
} from 'src/batch-processing/batch-processing.types';

export const runSelectedGiftStagingDonorMatch = (
  input: RunSelectedGiftStagingDonorMatchRequest,
): Promise<RunSelectedGiftStagingDonorMatchResponse> =>
  postAppRouteJson<RunSelectedGiftStagingDonorMatchResponse>(
    '/s/gift-staging/run-donor-match-selected',
    input,
  );

export const checkSelectedGiftStagingReadiness = (
  input: CheckSelectedGiftStagingReadinessRequest,
): Promise<CheckSelectedGiftStagingReadinessResponse> =>
  postAppRouteJson<CheckSelectedGiftStagingReadinessResponse>(
    '/s/gift-staging/check-selected',
    input,
  );

export const processSelectedGiftStaging = (
  input: ProcessSelectedGiftStagingRequest,
): Promise<ProcessSelectedGiftStagingResponse> =>
  postAppRouteJson<ProcessSelectedGiftStagingResponse>(
    '/s/gift-staging/process-selected',
    input,
  );
