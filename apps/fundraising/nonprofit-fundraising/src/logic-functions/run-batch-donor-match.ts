import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import {
  getGiftBatchWorkflowLimitMessage,
  isGiftBatchOverWorkflowLimit,
} from 'src/batch-processing/batch-processing.limits';
import { createBatchRouteLogger } from 'src/batch-processing/batch-route-logging';
import { runDonorMatchOnRows } from 'src/batch-donor-match/batch-donor-match.service';
import { loadBatchDonorMatchContext } from 'src/batch-processing/batch-loaders';
import type {
  BatchDonorMatchRequest,
  BatchDonorMatchResponse,
} from 'src/batch-donor-match/batch-donor-match.types';

const handler = async (
  event: RoutePayload<BatchDonorMatchRequest>,
): Promise<BatchDonorMatchResponse> => {
  const giftBatchId =
    typeof event.body?.giftBatchId === 'string' ? event.body.giftBatchId.trim() : '';

  if (giftBatchId === '') {
    throw new Error('giftBatchId is required');
  }

  const logger = createBatchRouteLogger({
    route: 'run-batch-donor-match',
    giftBatchId,
  });
  logger.info('started');

  const client = new CoreApiClient();
  try {
    const { batch, rows } = await loadBatchDonorMatchContext(client, giftBatchId);

    logger.info('context_loaded', { rowCount: rows.length });

    if (!batch) {
      throw new Error('Batch not found');
    }

    if (isGiftBatchOverWorkflowLimit(rows.length)) {
      throw new Error(getGiftBatchWorkflowLimitMessage(rows.length));
    }
    const result = await runDonorMatchOnRows(client, rows);
    logger.info('donor_match_completed', {
      totalCandidateRows: result.totalCandidateRows,
      evaluatedRows: result.evaluatedRows,
      autoLinkedRows: result.autoLinkedRows,
      ambiguousRows: result.ambiguousRows,
      unchangedRows: result.unchangedRows,
    });

    logger.info('completed', {
      evaluatedRows: result.evaluatedRows,
      autoLinkedRows: result.autoLinkedRows,
      ambiguousRows: result.ambiguousRows,
    });

    return {
      giftBatchId,
      ...result,
    };
  } catch (error) {
    logger.fail('failed', error);
    throw error;
  }
};

export default defineLogicFunction({
  universalIdentifier: '6448d2f5-91fc-465c-8204-ee0ffcbfdcb8',
  name: 'run-batch-donor-match',
  description:
    'Runs a conservative donor-match pass for one gift batch and writes safe outcomes back to staging rows.',
  timeoutSeconds: 120,
  handler,
  httpRouteTriggerSettings: {
    path: '/batch-processing/run-donor-match',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
