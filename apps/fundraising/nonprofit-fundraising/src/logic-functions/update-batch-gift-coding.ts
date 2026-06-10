import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { loadBatchProcessingContext } from 'src/batch-processing/batch-loaders';
import {
  getGiftBatchWorkflowLimitMessage,
  isGiftBatchOverWorkflowLimit,
} from 'src/batch-processing/batch-processing.limits';
import type {
  BatchProcessingRow,
  UpdateBatchGiftCodingRequest,
  UpdateBatchGiftCodingResponse,
} from 'src/batch-processing/batch-processing.types';
import { persistGiftStagingBatchUpserts } from 'src/gift-staging/gift-staging-bulk-writeback';

const normalizeString = (value: string | null | undefined) =>
  typeof value === 'string' ? value.trim() : '';

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

const loadAppealSourceAppealId = async (
  client: CoreApiClient,
  appealSourceId: string,
): Promise<string> => {
  const result = await client.query({
    appealSource: {
      __args: {
        filter: {
          id: {
            eq: appealSourceId,
          },
        },
      },
      id: true,
      appeal: {
        id: true,
      },
    },
  } as any);

  return normalizeString(
    (result?.appealSource as { appeal?: { id?: string | null } | null } | null)
      ?.appeal?.id,
  );
};

const saveBatchCodingDefaults = async ({
  client,
  giftBatchId,
  defaultAppealId,
  defaultAppealSourceId,
  defaultFundId,
}: {
  client: CoreApiClient;
  giftBatchId: string;
  defaultAppealId: string;
  defaultAppealSourceId: string;
  defaultFundId: string;
}) => {
  await client.mutation({
    updateGiftBatch: {
      __args: {
        id: giftBatchId,
        data: {
          ...(defaultAppealId !== ''
            ? {
                defaultAppeal: {
                  connect: {
                    where: {
                      id: defaultAppealId,
                    },
                  },
                },
              }
            : {
                defaultAppealId: null,
              }),
          ...(defaultAppealSourceId !== ''
            ? {
                defaultAppealSource: {
                  connect: {
                    where: {
                      id: defaultAppealSourceId,
                    },
                  },
                },
              }
            : {
                defaultAppealSourceId: null,
              }),
          ...(defaultFundId !== ''
            ? {
                defaultFund: {
                  connect: {
                    where: {
                      id: defaultFundId,
                    },
                  },
                },
              }
            : {
                defaultFundId: null,
              }),
        },
      },
      id: true,
    },
  } as any);
};

const buildWritebackForRow = ({
  row,
  defaultAppealId,
  defaultAppealSourceId,
  defaultAppealSourceAppealId,
  defaultFundId,
}: {
  row: BatchProcessingRow;
  defaultAppealId: string;
  defaultAppealSourceId: string;
  defaultAppealSourceAppealId: string;
  defaultFundId: string;
}) => {
  const currentAppealId = normalizeString(row.appeal?.id);
  const currentAppealSourceId = normalizeString(row.appealSource?.id);
  const currentFundId = normalizeString(row.fund?.id);

  let nextAppealId = currentAppealId;
  let nextAppealSourceId = currentAppealSourceId;
  let nextFundId = currentFundId;

  if (currentAppealId === '') {
    if (defaultAppealId !== '') {
      nextAppealId = defaultAppealId;
    } else if (defaultAppealSourceAppealId !== '') {
      nextAppealId = defaultAppealSourceAppealId;
    }
  }

  if (currentAppealSourceId === '' && defaultAppealSourceId !== '') {
    if (currentAppealId === '' || currentAppealId === defaultAppealSourceAppealId) {
      nextAppealSourceId = defaultAppealSourceId;
    }
  }

  if (currentFundId === '' && defaultFundId !== '') {
    nextFundId = defaultFundId;
  }

  const appealChanged = nextAppealId !== currentAppealId;
  const appealSourceChanged = nextAppealSourceId !== currentAppealSourceId;
  const fundChanged = nextFundId !== currentFundId;

  if (!appealChanged && !appealSourceChanged && !fundChanged) {
    return null;
  }

  return {
    rowId: row.id,
    writeback: {
      id: row.id,
      ...(appealChanged ? { appealId: nextAppealId === '' ? null : nextAppealId } : {}),
      ...(appealSourceChanged
        ? {
            appealSourceId:
              nextAppealSourceId === '' ? null : nextAppealSourceId,
          }
        : {}),
      ...(fundChanged ? { fundId: nextFundId === '' ? null : nextFundId } : {}),
    },
    appealChanged,
    appealSourceChanged,
    fundChanged,
  };
};

const handler = async (
  event: RoutePayload<UpdateBatchGiftCodingRequest>,
): Promise<UpdateBatchGiftCodingResponse> => {
  const giftBatchId = normalizeString(event.body?.giftBatchId);
  let defaultAppealId = normalizeString(event.body?.defaultAppealId ?? undefined);
  const defaultAppealSourceId = normalizeString(
    event.body?.defaultAppealSourceId ?? undefined,
  );
  let defaultFundId = normalizeString(event.body?.defaultFundId ?? undefined);

  if (giftBatchId === '') {
    throw new Error('giftBatchId is required');
  }

  const client = new CoreApiClient();
  const defaultAppealSourceAppealId =
    defaultAppealSourceId === ''
      ? ''
      : await loadAppealSourceAppealId(client, defaultAppealSourceId);

  if (defaultAppealSourceId !== '' && defaultAppealSourceAppealId === '') {
    throw new Error('The selected appeal source is not linked to an appeal.');
  }

  if (
    defaultAppealId !== '' &&
    defaultAppealSourceAppealId !== '' &&
    defaultAppealId !== defaultAppealSourceAppealId
  ) {
    throw new Error(
      'The selected appeal source does not belong to the selected appeal.',
    );
  }

  if (defaultAppealId === '' && defaultAppealSourceAppealId !== '') {
    defaultAppealId = defaultAppealSourceAppealId;
  }

  if (defaultAppealId !== '' && defaultFundId === '') {
    defaultFundId = await loadAppealDefaultFund(client, defaultAppealId);
  }

  await saveBatchCodingDefaults({
    client,
    giftBatchId,
    defaultAppealId,
    defaultAppealSourceId,
    defaultFundId,
  });

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
      appealSourceUpdatedCount: 0,
      fundUpdatedCount: 0,
    };
  }

  let updatedRowCount = 0;
  let appealUpdatedCount = 0;
  let appealSourceUpdatedCount = 0;
  let fundUpdatedCount = 0;
  const writebacks: Array<{ id: string } & Record<string, unknown>> = [];

  for (const row of targetRows) {
    const next = buildWritebackForRow({
      row,
      defaultAppealId,
      defaultAppealSourceId,
      defaultAppealSourceAppealId,
      defaultFundId,
    });

    if (!next) {
      continue;
    }

    writebacks.push(next.writeback);
    updatedRowCount += 1;
    if (next.appealChanged) {
      appealUpdatedCount += 1;
    }
    if (next.appealSourceChanged) {
      appealSourceUpdatedCount += 1;
    }
    if (next.fundChanged) {
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
    appealSourceUpdatedCount,
    fundUpdatedCount,
  };
};

export default defineLogicFunction({
  universalIdentifier: '4e1a17c3-5c06-4e05-b224-a0fe67b844f0',
  name: 'update-batch-gift-coding',
  description:
    'Saves batch coding defaults and applies them to blank coding fields on unprocessed staging rows.',
  timeoutSeconds: 120,
  handler,
  httpRouteTriggerSettings: {
    path: '/batch-processing/update-gift-coding',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
