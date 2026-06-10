import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { collectAppealIds, recomputeAppealRollups } from 'src/appeal-rollups/appeal-rollups';
import { resolveAppealSourceSelection } from 'src/appeal-sources/appeal-source-integrity';
import { resolveSoftCreditSelection } from 'src/soft-credits/soft-credit-integrity';
import {
  deriveFundraiserSoftCreditSelection,
  loadAppealSourceFundraisersById,
} from 'src/soft-credits/fundraiser-soft-credit';
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
      appealSource: {
        id: true,
      },
      fund: {
        id: true,
      },
      softCreditPerson: {
        id: true,
      },
      softCreditCompany: {
        id: true,
      },
      softCreditType: true,
    },
  } as any);

  return result?.gift as
    | {
        id?: string | null;
        appeal?: { id?: string | null } | null;
        appealSource?: { id?: string | null } | null;
        fund?: { id?: string | null } | null;
        softCreditPerson?: { id?: string | null } | null;
        softCreditCompany?: { id?: string | null } | null;
        softCreditType?: string | null;
      }
    | null;
};

const handler = async (
  event: RoutePayload<SaveGiftCodingRequest>,
): Promise<SaveGiftCodingResponse> => {
  if (!event.body) {
    throw new Error('Request body is required');
  }

  const { body } = event;
  const giftId = normalizeString(body.giftId);
  const inputAppealId = normalizeString(body.appealId);
  const inputAppealSourceId = normalizeString(body.appealSourceId);
  const fundId = normalizeString(body.fundId);
  const softCreditSelection = resolveSoftCreditSelection({
    softCreditPersonId: body.softCreditPersonId,
    softCreditCompanyId: body.softCreditCompanyId,
    softCreditType: body.softCreditType,
    treatUndefinedAsUnchanged: true,
  });

  if (giftId === '') {
    throw new Error('Gift id is required');
  }

  const client = new CoreApiClient();
  const existing = await loadGiftCodingContext(client, giftId);

  if (!existing?.id) {
    throw new Error('Gift not found');
  }

  const previousAppealId = normalizeString(existing.appeal?.id);
  const {
    appealId,
    appealSourceId,
    appealDefaultFundId,
  } = await resolveAppealSourceSelection({
    client,
    appealId: inputAppealId,
    appealSourceId: inputAppealSourceId,
  });
  const appealSourceFundraisers = await loadAppealSourceFundraisersById(client, [
    existing.appealSource?.id ?? '',
    appealSourceId,
  ]);
  const resolvedSoftCreditSelection = deriveFundraiserSoftCreditSelection({
    currentSoftCredit: {
      softCreditPersonId: existing.softCreditPerson?.id ?? '',
      softCreditCompanyId: existing.softCreditCompany?.id ?? '',
      softCreditType: existing.softCreditType ?? '',
    },
    currentAppealSourceFundraiser:
      appealSourceFundraisers[existing.appealSource?.id ?? ''],
    nextAppealSourceFundraiser: appealSourceFundraisers[appealSourceId],
    requestedSoftCreditSelection: softCreditSelection,
  });
  const nextFundId = fundId === '' ? appealDefaultFundId : fundId;

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
          ...(appealSourceId !== ''
            ? {
                appealSource: {
                  connect: {
                    where: {
                      id: appealSourceId,
                    },
                  },
                },
              }
            : {
                appealSourceId: null,
              }),
          ...(nextFundId !== ''
            ? {
                fund: {
                  connect: {
                    where: {
                      id: nextFundId,
                    },
                  },
                },
              }
            : {
                fundId: null,
              }),
          ...(resolvedSoftCreditSelection.mode === 'set' &&
          resolvedSoftCreditSelection.softCreditPersonId !== ''
            ? {
                softCreditPerson: {
                  connect: {
                    where: {
                      id: resolvedSoftCreditSelection.softCreditPersonId,
                    },
                  },
                },
                softCreditCompanyId: null,
                softCreditType: resolvedSoftCreditSelection.softCreditType,
              }
            : {}),
          ...(resolvedSoftCreditSelection.mode === 'set' &&
          resolvedSoftCreditSelection.softCreditCompanyId !== ''
            ? {
                softCreditCompany: {
                  connect: {
                    where: {
                      id: resolvedSoftCreditSelection.softCreditCompanyId,
                    },
                  },
                },
                softCreditPersonId: null,
                softCreditType: resolvedSoftCreditSelection.softCreditType,
              }
            : {}),
          ...(resolvedSoftCreditSelection.mode === 'clear'
            ? {
                softCreditPersonId: null,
                softCreditCompanyId: null,
                softCreditType: null,
              }
            : {}),
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
    appealSourceId: appealSourceId === '' ? null : appealSourceId,
    fundId: nextFundId === '' ? null : nextFundId,
    ...(resolvedSoftCreditSelection.mode !== 'unchanged'
      ? {
          softCreditPersonId:
            resolvedSoftCreditSelection.mode === 'set' &&
            resolvedSoftCreditSelection.softCreditPersonId !== ''
              ? resolvedSoftCreditSelection.softCreditPersonId
              : null,
          softCreditCompanyId:
            resolvedSoftCreditSelection.mode === 'set' &&
            resolvedSoftCreditSelection.softCreditCompanyId !== ''
              ? resolvedSoftCreditSelection.softCreditCompanyId
              : null,
          softCreditType:
            resolvedSoftCreditSelection.mode === 'set'
              ? resolvedSoftCreditSelection.softCreditType
              : null,
        }
      : {}),
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
