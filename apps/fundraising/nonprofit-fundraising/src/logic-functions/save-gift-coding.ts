import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { collectAppealIds, recomputeAppealRollups } from 'src/appeal-rollups/appeal-rollups';
import type {
  SaveGiftCodingRequest,
  SaveGiftCodingResponse,
} from 'src/gift-record/gift-coding.types';

const normalizeString = (value: string | null | undefined) =>
  typeof value === 'string' ? value.trim() : '';

const loadGiftCodingContext = async (
  client: CoreApiClient,
  giftId: string,
) => {
  const result = await client.query({
    gift: {
      __args: {
        filter: {
          id: {
            eq: giftId,
          },
        },
      },
      id: true,
      appeal: {
        id: true,
      },
      fund: {
        id: true,
      },
    },
  } as any);

  return result?.gift as
    | {
        id?: string | null;
        appeal?: { id?: string | null } | null;
        fund?: { id?: string | null } | null;
      }
    | null;
};

const handler = async (
  event: RoutePayload<SaveGiftCodingRequest>,
): Promise<SaveGiftCodingResponse> => {
  const giftId = normalizeString(event.body.giftId);
  const appealId = normalizeString(event.body.appealId);
  const fundId = normalizeString(event.body.fundId);

  if (giftId === '') {
    throw new Error('Gift id is required');
  }

  const client = new CoreApiClient();
  const existing = await loadGiftCodingContext(client, giftId);

  if (!existing?.id) {
    throw new Error('Gift not found');
  }

  const previousAppealId = normalizeString(existing.appeal?.id);

  await client.mutation({
    updateGift: {
      __args: {
        id: giftId,
        data: {
          ...(appealId !== ''
            ? {
                appeal: {
                  connect: {
                    where: {
                      id: appealId,
                    },
                  },
                },
              }
            : {
                appealId: null,
              }),
          ...(fundId !== ''
            ? {
                fund: {
                  connect: {
                    where: {
                      id: fundId,
                    },
                  },
                },
              }
            : {
                fundId: null,
              }),
        },
      },
      id: true,
    },
  } as any);

  const appealIdsToRecompute = collectAppealIds([previousAppealId, appealId]);

  if (appealIdsToRecompute.length > 0) {
    try {
      await recomputeAppealRollups(client, appealIdsToRecompute);
    } catch (error) {
      console.warn(
        'Non-blocking appeal rollup recompute failed after gift coding update',
        giftId,
        appealIdsToRecompute.join(','),
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  return {
    giftId,
    appealId: appealId === '' ? null : appealId,
    fundId: fundId === '' ? null : fundId,
  };
};

export default defineLogicFunction({
  universalIdentifier: '981e238e-c099-4d2d-acfa-1d60dbbef9f8',
  name: 'save-gift-coding',
  description:
    'Updates appeal and fund coding on a committed gift and refreshes affected appeal rollups.',
  timeoutSeconds: 15,
  handler,
  httpRouteTriggerSettings: {
    path: '/gifts/save-coding',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
