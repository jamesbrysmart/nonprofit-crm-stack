import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { createGiftAidDeclarationService } from 'src/gift-aid/gift-aid.declarations';
import { attachGiftToCurrentDraftIfClaimable } from 'src/gift-aid-claims/gift-aid-claim-batch';
import { isGiftAidEnabled } from 'src/gift-aid/gift-aid-config';
import { applyGiftAidMetadata } from 'src/gift-aid/gift-aid.policy';
import { advanceRecurringAgreementExpectation } from 'src/recurring/recurring.service';
import type {
  ManualGiftDonorChoice,
  ManualGiftEntryRequest,
  ManualGiftEntryResponse,
} from 'src/manual-gift-entry/manual-gift-entry.types';

const normalizeString = (value: string | undefined) => value?.trim() ?? '';

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

const getDonorChoice = (
  donorChoice: ManualGiftDonorChoice | undefined,
): ManualGiftDonorChoice => {
  if (donorChoice === 'USE_EXISTING' || donorChoice === 'CREATE_NEW') {
    return donorChoice;
  }

  throw new Error(
    'Choose whether to use an existing donor or create a new donor before saving.',
  );
};

const buildGiftPayload = (body: ManualGiftEntryRequest, donorId: string) => {
  const donorFirstName = normalizeString(body.donorFirstName);
  const donorLastName = normalizeString(body.donorLastName);
  const donorEmail = normalizeString(body.donorEmail);

  if (donorFirstName === '' || donorLastName === '') {
    throw new Error('Donor first name and last name are required');
  }

  return {
    // Manual entry bypasses staging by default because this is the trusted
    // operator path in the product model.
    name: `Gift from ${donorFirstName} ${donorLastName}`.trim(),
    amount: {
      currencyCode: 'GBP',
      amountMicros: parseAmountMicros(normalizeString(body.amountValue)),
    },
    giftDate: normalizeGiftDate(normalizeString(body.giftDate)),
    donorFirstName,
    donorLastName,
    donorId,
    ...(donorEmail !== '' ? { donorEmail } : {}),
    giftAidRequested: body.giftAidRequested ?? null,
    giftAidDeclarationCaptured: body.giftAidDeclarationCaptured ?? null,
    ...(normalizeString(body.giftAidDeclarationDate) !== ''
      ? { giftAidDeclarationDate: normalizeString(body.giftAidDeclarationDate) }
      : {}),
    ...(normalizeString(body.giftAidCoverageScope) !== ''
      ? { giftAidCoverageScope: normalizeString(body.giftAidCoverageScope) }
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
    ...(normalizeString(body.giftAidDeclarationId) !== ''
      ? { giftAidDeclarationId: normalizeString(body.giftAidDeclarationId) }
      : {}),
    ...(normalizeString(body.selectedRecurringAgreementId) !== ''
      ? {
          recurringAgreementId: normalizeString(
            body.selectedRecurringAgreementId,
          ),
        }
      : {}),
  };
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

const resolveDonorId = async (
  client: CoreApiClient,
  body: ManualGiftEntryRequest,
  donorChoice: ManualGiftDonorChoice,
) => {
  if (donorChoice === 'USE_EXISTING') {
    const selectedDonorId = normalizeString(body.selectedDonorId);

    if (selectedDonorId === '') {
      throw new Error('Select an existing donor before creating the gift');
    }

    return selectedDonorId;
  }

  return ensurePersonForManualGift(client, body);
};

const handler = async (
  event: RoutePayload<ManualGiftEntryRequest>,
): Promise<ManualGiftEntryResponse> => {
  const body = event.body ?? ({} as ManualGiftEntryRequest);
  const donorChoice = getDonorChoice(body.donorChoice);
  const client = new CoreApiClient();
  const donorId = await resolveDonorId(client, body, donorChoice);
  const giftAidDeclarationService = createGiftAidDeclarationService(client);
  const evaluatedGiftPayload = await applyGiftAidMetadata(
    giftAidDeclarationService,
    buildGiftPayload(body, donorId),
    isGiftAidEnabled(),
  );
  const declarationId = normalizeString(evaluatedGiftPayload.giftAidDeclarationId);
  const recurringAgreementId = normalizeString(
    evaluatedGiftPayload.recurringAgreementId as string | undefined,
  );
  const giftData = { ...evaluatedGiftPayload } as Record<string, unknown>;
  delete giftData.donorId;
  delete giftData.giftAidDeclarationId;
  delete giftData.recurringAgreementId;

  const result = await client.mutation({
    createGift: {
      __args: {
        data: {
          ...giftData,
          donor: {
            connect: {
              where: {
                id: donorId,
              },
            },
          },
          ...(declarationId !== ''
            ? {
                giftAidDeclaration: {
                  connect: {
                    where: {
                      id: declarationId,
                    },
                  },
                },
              }
            : {}),
          ...(recurringAgreementId !== ''
            ? {
                recurringAgreement: {
                  connect: {
                    where: {
                      id: recurringAgreementId,
                    },
                  },
                },
              }
            : {}),
        },
      },
      id: true,
    },
  } as any);

  const giftId = result?.createGift?.id;

  if (typeof giftId !== 'string' || giftId === '') {
    throw new Error('Create gift response missing id');
  }

  if (isGiftAidEnabled()) {
    await attachGiftToCurrentDraftIfClaimable(client, giftId, {
      giftAidStatus:
        typeof evaluatedGiftPayload.giftAidStatus === 'string'
          ? evaluatedGiftPayload.giftAidStatus
          : null,
      giftAidClaimBatchId: null,
    });
  }

  if (recurringAgreementId !== '') {
    await advanceRecurringAgreementExpectation(
      client,
      recurringAgreementId,
      normalizeGiftDate(normalizeString(body.giftDate)),
    );
  }

  return {
    giftId,
    donorId,
    donorChoice,
    recurringAgreementId: recurringAgreementId === '' ? null : recurringAgreementId,
  };
};

export default defineLogicFunction({
  universalIdentifier: '8d3f92ec-9432-48d2-a0fd-ec12eb0e512f',
  name: 'create-manual-gift',
  description:
    'Creates a committed gift after explicit donor choice in the manual entry flow.',
  timeoutSeconds: 15,
  handler,
  httpRouteTriggerSettings: {
    path: '/manual-gift-entry/create-gift',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
