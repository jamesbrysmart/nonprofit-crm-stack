import {
  defineLogicFunction,
  type RoutePayload,
} from 'twenty-sdk';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { applyGiftAidMetadata } from 'src/gift-aid/gift-aid.policy';
import { attachGiftToCurrentDraftIfClaimable } from 'src/gift-aid-claims/gift-aid-claim-batch';
import type {
  ManualGiftEntryRequest,
  ManualGiftEntryResponse,
} from 'src/manual-gift-entry/manual-gift-entry.types';

const normalizeString = (value: string | undefined) => value?.trim() ?? '';
const isGiftAidEnabled =
  (process.env.GIFT_AID_ENABLED ?? 'false').toLowerCase() === 'true';

const parseAmountMicros = (amountValue: string) => {
  const parsed = Number.parseFloat(amountValue);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error('Amount must be a positive number');
  }

  return Math.round(parsed * 1_000_000);
};

const normalizeGiftDate = (giftDate: string) => {
  const trimmed = normalizeString(giftDate);

  if (trimmed === '') {
    throw new Error('Gift date is required');
  }

  return trimmed;
};

const buildGiftPayload = (body: ManualGiftEntryRequest) => {
  const donorFirstName = normalizeString(body.donorFirstName);
  const donorLastName = normalizeString(body.donorLastName);
  const donorEmail = normalizeString(body.donorEmail);

  if (donorFirstName === '' || donorLastName === '') {
    throw new Error('Donor first name and last name are required');
  }

  const basePayload: Record<string, unknown> = {
    name: `Gift from ${donorFirstName} ${donorLastName}`.trim(),
    amount: {
      currencyCode: 'GBP',
      amountMicros: parseAmountMicros(body.amountValue),
    },
    giftDate: normalizeGiftDate(body.giftDate),
    donorFirstName,
    donorLastName,
    ...(donorEmail !== '' ? { donorEmail } : {}),
    giftAidRequested: body.giftAidRequested === true,
    giftAidDeclarationCaptured: body.giftAidDeclarationCaptured === true,
    ...(normalizeString(body.giftAidDeclarationDate) !== ''
      ? {
          giftAidDeclarationDate: normalizeString(body.giftAidDeclarationDate),
        }
      : {}),
    ...(normalizeString(body.giftAidCoverageScope) !== ''
      ? {
          giftAidCoverageScope: normalizeString(body.giftAidCoverageScope),
        }
      : {}),
    ...(normalizeString(body.giftAidDeclarationSource) !== ''
      ? {
          giftAidDeclarationSource: normalizeString(
            body.giftAidDeclarationSource,
          ),
        }
      : {}),
    ...(normalizeString(body.giftAidTextVersion) !== ''
      ? { giftAidTextVersion: normalizeString(body.giftAidTextVersion) }
      : {}),
  };

  if (body.donorChoice === 'USE_EXISTING') {
    const selectedDonorId = normalizeString(body.selectedDonorId);

    if (selectedDonorId === '') {
      throw new Error('Select an existing donor before creating the gift');
    }

    return {
      ...basePayload,
      donorId: selectedDonorId,
    };
  }

  return basePayload;
};

const ensurePersonForManualGift = async (
  client: CoreApiClient,
  body: ManualGiftEntryRequest,
) => {
  const donorFirstName = normalizeString(body.donorFirstName);
  const donorLastName = normalizeString(body.donorLastName);
  const donorEmail = normalizeString(body.donorEmail);

  const result = await client.mutation({
    createPerson: {
      __args: {
        data: {
          name: {
            firstName: donorFirstName,
            lastName: donorLastName,
          },
          ...(donorEmail !== ''
            ? {
                emails: {
                  primaryEmail: donorEmail,
                },
              }
            : {}),
        },
      },
      id: true,
    },
  } as any);

  const personId = result?.createPerson?.id;

  if (typeof personId !== 'string' || personId === '') {
    throw new Error('Create person response missing id');
  }

  return personId;
};

const handler = async (
  event: RoutePayload<ManualGiftEntryRequest>,
): Promise<ManualGiftEntryResponse> => {
  const body = event.body ?? ({} as ManualGiftEntryRequest);
  const client = new CoreApiClient();
  const donorId =
    body.donorChoice === 'USE_EXISTING'
      ? normalizeString(body.selectedDonorId)
      : await ensurePersonForManualGift(client, body);
  const payload = buildGiftPayload({
    ...body,
    donorChoice: 'USE_EXISTING',
    selectedDonorId: donorId,
  });
  const evaluatedPayload = await applyGiftAidMetadata(
    client,
    payload as any,
    isGiftAidEnabled,
  );

  const result = await client.mutation({
    createGift: {
      __args: {
        data: evaluatedPayload,
      },
      id: true,
    },
  } as any);

  const giftId = result?.createGift?.id;

  if (typeof giftId !== 'string' || giftId === '') {
    throw new Error('Create gift response missing id');
  }

  await attachGiftToCurrentDraftIfClaimable(client, giftId, evaluatedPayload as any);

  return {
    giftId,
    donorChoice: body.donorChoice,
  };
};

export default defineLogicFunction({
  universalIdentifier: '338b64f5-f0de-43fc-ae7c-b6e62e589d86',
  name: 'create-manual-gift',
  description:
    'Creates a real gift inside Twenty apps after explicit donor choice.',
  timeoutSeconds: 15,
  handler,
  httpRouteTriggerSettings: {
    path: '/manual-gift-entry/create-gift',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
