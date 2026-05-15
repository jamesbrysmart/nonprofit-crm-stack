import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { loadGiftStagingRowsForProcessing } from 'src/batch-processing/batch-loaders';
import { checkGiftStagingRowsReadiness } from 'src/gift-staging-review/gift-ready-check.service';
import type {
  CheckSelectedGiftStagingReadinessRequest,
  CheckSelectedGiftStagingReadinessResponse,
} from 'src/batch-processing/batch-processing.types';

const normalizeSelectedIds = (ids: string[] | null | undefined) =>
  [...new Set((ids ?? []).map((id) => id.trim()).filter((id) => id !== ''))];

const handler = async (
  event: RoutePayload<CheckSelectedGiftStagingReadinessRequest>,
): Promise<CheckSelectedGiftStagingReadinessResponse> => {
  const giftStagingIds = normalizeSelectedIds(event.body?.giftStagingIds);

  if (giftStagingIds.length === 0) {
    throw new Error('At least one giftStagingId is required');
  }

  const client = new CoreApiClient();
  const rows = await loadGiftStagingRowsForProcessing(client, giftStagingIds);

  if (rows.length !== giftStagingIds.length) {
    throw new Error('Some selected staging rows could not be loaded');
  }

  return {
    selectedItemCount: rows.length,
    ...(await checkGiftStagingRowsReadiness(client, rows)),
  };
};

export default defineLogicFunction({
  universalIdentifier: 'e43a7cfa-4e6f-4fa3-ac86-ec303114b973',
  name: 'check-selected-gift-staging-readiness',
  description:
    'Checks readiness for the currently selected staged gift rows.',
  timeoutSeconds: 120,
  handler,
  httpRouteTriggerSettings: {
    path: '/gift-staging/check-selected',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
