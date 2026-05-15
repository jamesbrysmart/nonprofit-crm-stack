import type {
  CheckBatchRequest,
  CheckBatchResponse,
  ProcessBatchRequest,
  ProcessBatchResponse,
  RunBatchDonorMatchRequest,
  RunBatchDonorMatchResponse,
} from 'src/batch-processing/batch-processing.types';
import { postAppRouteJson } from 'src/app-api/app-route-client';

export const processBatch = (
  input: ProcessBatchRequest,
): Promise<ProcessBatchResponse> =>
  postAppRouteJson<ProcessBatchResponse>(
    '/s/batch-processing/process-batch',
    input,
  );

export const runBatchDonorMatch = (
  input: RunBatchDonorMatchRequest,
): Promise<RunBatchDonorMatchResponse> =>
  postAppRouteJson<RunBatchDonorMatchResponse>(
    '/s/batch-processing/run-donor-match',
    input,
  );

export const checkBatch = (
  input: CheckBatchRequest,
): Promise<CheckBatchResponse> =>
  postAppRouteJson<CheckBatchResponse>(
    '/s/batch-processing/check-batch',
    input,
  );
