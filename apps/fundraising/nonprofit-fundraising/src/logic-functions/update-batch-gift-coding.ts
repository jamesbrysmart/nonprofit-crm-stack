import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { loadBatchProcessingContext } from 'src/batch-processing/batch-loaders';
import {
  getGiftBatchWorkflowLimitMessage,
  isGiftBatchOverWorkflowLimit,
} from 'src/batch-processing/batch-processing.limits';
import { persistGiftStagingBatchUpserts } from 'src/gift-staging/gift-staging-bulk-writeback';
import type {
  BatchGiftCodingAppealMode,
  BatchGiftCodingFundMode,
  BatchProcessingRow,
  UpdateBatchGiftCodingRequest,
  UpdateBatchGiftCodingResponse,
} from 'src/batch-processing/batch-processing.types';

const normalizeString = (value: string | null | undefined) =>
  typeof value === 'string' ? value.trim() : '';

const isAppealSetMode = (mode: BatchGiftCodingAppealMode) =>
  mode === 'SET_ALL' || mode === 'SET_WHERE_BLANK';

const isFundSetMode = (mode: BatchGiftCodingFundMode) =>
  mode === 'SET_ALL' || mode === 'SET_WHERE_BLANK';

const isFundDefaultMode = (mode: BatchGiftCodingFundMode) =>
  mode === 'SET_APPEAL_DEFAULT_ALL' || mode === 'SET_APPEAL_DEFAULT_WHERE_BLANK';

const loadAppealDefaultFund = async (
  client: CoreApiClient,
  appealId: string,
): Promise<string> => {
  const result = await client.query({
    appeal: {
      __args: {
        filter: {
          id: {
            eq: appealId,
          },
        },
      },
      id: true,
      defaultFund: {
        id: true,
      },
    },
  } as any);

  return normalizeString(
    (result?.appeal as { defaultFund?: { id?: string | null } | null } | null)
      ?.defaultFund?.id,
  );
};

const buildNextAppealId = ({
  row,
  mode,
  selectedAppealId,
}: {
  row: BatchProcessingRow;
  mode: BatchGiftCodingAppealMode;
  selectedAppealId: string;
}) => {
  const currentAppealId = normalizeString(row.appeal?.id);

  switch (mode) {
    case 'LEAVE_UNCHANGED':
      return currentAppealId;
    case 'CLEAR':
      return '';
    case 'SET_ALL':
      return selectedAppealId;
    case 'SET_WHERE_BLANK':
      return currentAppealId === '' ? selectedAppealId : currentAppealId;
  }
};

const buildNextFundId = ({
  row,
  mode,
  selectedFundId,
  appealDefaultFundId,
}: {
  row: BatchProcessingRow;
  mode: BatchGiftCodingFundMode;
  selectedFundId: string;
  appealDefaultFundId: string;
}) => {
  const currentFundId = normalizeString(row.fund?.id);

  switch (mode) {
    case 'LEAVE_UNCHANGED':
      return currentFundId;
    case 'CLEAR':
      return '';
    case 'SET_ALL':
      return selectedFundId;
    case 'SET_WHERE_BLANK':
      return currentFundId === '' ? selectedFundId : currentFundId;
    case 'SET_APPEAL_DEFAULT_ALL':
      return appealDefaultFundId;
    case 'SET_APPEAL_DEFAULT_WHERE_BLANK':
      return currentFundId === '' ? appealDefaultFundId : currentFundId;
  }
};

const buildNextAppealSourceMutation = ({
  row,
  nextAppealId,
}: {
  row: BatchProcessingRow;
  nextAppealId: string;
}) => {
  const currentAppealSourceId = normalizeString(row.appealSource?.id);
  const currentAppealSourceAppealId = normalizeString(row.appealSource?.appeal?.id);

  if (currentAppealSourceId === '') {
    return {};
  }

  if (nextAppealId !== '' && currentAppealSourceAppealId === nextAppealId) {
    return {};
  }

  return {
    appealSourceId: null,
  };
};

const handler = async (
  event: RoutePayload<UpdateBatchGiftCodingRequest>,
): Promise<UpdateBatchGiftCodingResponse> => {
  const giftBatchId = normalizeString(event.body?.giftBatchId);
  const appealMode = event.body?.appealMode ?? 'LEAVE_UNCHANGED';
  const fundMode = event.body?.fundMode ?? 'LEAVE_UNCHANGED';
  const selectedAppealId = normalizeString(event.body?.selectedAppealId);
  const selectedFundId = normalizeString(event.body?.selectedFundId);

  if (giftBatchId === '') {
    throw new Error('giftBatchId is required');
  }

  if (isAppealSetMode(appealMode) && selectedAppealId === '') {
    throw new Error('Select an appeal before applying appeal coding.');
  }

  if (isFundSetMode(fundMode) && selectedFundId === '') {
    throw new Error('Select a fund before applying fund coding.');
  }

  if (isFundDefaultMode(fundMode) && selectedAppealId === '') {
    throw new Error(
      'Select an appeal before using its default fund in batch coding.',
    );
  }

  const client = new CoreApiClient();
  const { batch, rows } = await loadBatchProcessingContext(client, giftBatchId);

  if (!batch) {
    throw new Error('Batch not found');
  }

  if (isGiftBatchOverWorkflowLimit(batch.totalItems)) {
    throw new Error(getGiftBatchWorkflowLimitMessage(batch.totalItems));
  }

  const targetRows = rows.filter(
    (row) => normalizeString(row.processingStatus) !== 'PROCESSED',
  );

  if (targetRows.length === 0) {
    return {
      giftBatchId,
      targetedItemCount: 0,
      updatedRowCount: 0,
      appealUpdatedCount: 0,
      fundUpdatedCount: 0,
    };
  }

  const appealDefaultFundId = isFundDefaultMode(fundMode)
    ? await loadAppealDefaultFund(client, selectedAppealId)
    : '';

  if (isFundDefaultMode(fundMode) && appealDefaultFundId === '') {
    throw new Error('The selected appeal does not have a default fund.');
  }

  let updatedRowCount = 0;
  let appealUpdatedCount = 0;
  let fundUpdatedCount = 0;
  const writebacks: Array<{ id: string } & Record<string, unknown>> = [];

  for (const row of targetRows) {
    const currentAppealId = normalizeString(row.appeal?.id);
    const currentFundId = normalizeString(row.fund?.id);

    const nextAppealId = buildNextAppealId({
      row,
      mode: appealMode,
      selectedAppealId,
    });
    const nextFundId = buildNextFundId({
      row,
      mode: fundMode,
      selectedFundId,
      appealDefaultFundId,
    });

    const appealChanged = nextAppealId !== currentAppealId;
    const fundChanged = nextFundId !== currentFundId;
    const appealSourceMutation = buildNextAppealSourceMutation({
      row,
      nextAppealId,
    });
    const appealSourceChanged = Object.keys(appealSourceMutation).length > 0;

    if (!appealChanged && !fundChanged && !appealSourceChanged) {
      continue;
    }

    writebacks.push({
      id: row.id,
      ...(appealChanged ? { appealId: nextAppealId === '' ? null : nextAppealId } : {}),
      ...appealSourceMutation,
      ...(fundChanged ? { fundId: nextFundId === '' ? null : nextFundId } : {}),
    });

    updatedRowCount += 1;
    if (appealChanged) {
      appealUpdatedCount += 1;
    }
    if (fundChanged) {
      fundUpdatedCount += 1;
    }
  }

  await persistGiftStagingBatchUpserts(writebacks, {
    allowedIds: new Set(targetRows.map((row) => row.id)),
  });

  return {
    giftBatchId,
    targetedItemCount: targetRows.length,
    updatedRowCount,
    appealUpdatedCount,
    fundUpdatedCount,
  };
};

export default defineLogicFunction({
  universalIdentifier: '4e1a17c3-5c06-4e05-b224-a0fe67b844f0',
  name: 'update-batch-gift-coding',
  description:
    'Applies explicit appeal and fund coding updates across unprocessed staging rows in a batch.',
  timeoutSeconds: 120,
  handler,
  httpRouteTriggerSettings: {
    path: '/batch-processing/update-gift-coding',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
