import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { runDonorMatchOnRows } from 'src/batch-donor-match/batch-donor-match.service';
import { loadGiftStagingRowsForDonorMatch } from 'src/batch-processing/batch-loaders';
import type {
  RunSelectedGiftStagingDonorMatchRequest,
  RunSelectedGiftStagingDonorMatchResponse,
} from 'src/batch-processing/batch-processing.types';

const normalizeSelectedIds = (ids: string[] | null | undefined) =>
  [...new Set((ids ?? []).map((id) => id.trim()).filter((id) => id !== ''))];

const handler = async (
  event: RoutePayload<RunSelectedGiftStagingDonorMatchRequest>,
): Promise<RunSelectedGiftStagingDonorMatchResponse> => {
  const giftStagingIds = normalizeSelectedIds(event.body?.giftStagingIds);

  if (giftStagingIds.length === 0) {
    throw new Error('At least one giftStagingId is required');
  }

  const client = new CoreApiClient();
  const rows = await loadGiftStagingRowsForDonorMatch(client, giftStagingIds);

  if (rows.length !== giftStagingIds.length) {
    throw new Error('Some selected staging rows could not be loaded');
  }

  return {
    selectedItemCount: rows.length,
    ...(await runDonorMatchOnRows(client, rows)),
  };
};

export default defineLogicFunction({
  universalIdentifier: 'f1a4bba0-8c48-4a89-8cb5-1e55e4e013cf',
  name: 'run-selected-gift-staging-donor-match',
  description:
    'Runs donor match for the currently selected staged gift rows.',
  timeoutSeconds: 120,
  handler,
  httpRouteTriggerSettings: {
    path: '/gift-staging/run-donor-match-selected',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
