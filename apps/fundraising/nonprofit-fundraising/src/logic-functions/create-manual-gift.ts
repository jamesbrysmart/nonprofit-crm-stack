import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { createGiftAidDeclarationService } from 'src/gift-aid/gift-aid.declarations';
import { attachGiftToCurrentDraftIfClaimable } from 'src/gift-aid-claims/gift-aid-claim-batch';
import { recomputeDonorRollups } from 'src/donor-rollups/donor-rollups';
import { isGiftAidEnabled } from 'src/gift-aid/gift-aid-config';
import { applyGiftAidMetadata } from 'src/gift-aid/gift-aid.policy';
import { advanceRecurringAgreementExpectation } from 'src/recurring/recurring.service';
import type {
  ManualGiftCompanyChoice,
  ManualGiftDonorType,
  ManualGiftDonorChoice,
  ManualGiftEntryRequest,
  ManualGiftPaymentType,
  ManualGiftEntryResponse,
} from 'src/manual-gift-entry/manual-gift-entry.types';
import type { MailingAddressEvidence } from 'src/gift-aid/gift-aid.types';

const normalizeString = (value: string | undefined) => value?.trim() ?? '';

const getDonorType = (
  donorType: ManualGiftDonorType | undefined,
): ManualGiftDonorType => {
  switch (donorType) {
    case 'INDIVIDUAL':
    case 'COMPANY':
      return donorType;
    default:
      return 'INDIVIDUAL';
  }
};

const parseAmountMicros = (amountValue: string) => {
  const parsed = Number.parseFloat(amountValue);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error('Amount must be a positive number');
  }

  return Math.round(parsed * 1_000_000);
};

const normalizeCurrencyCode = (currencyCode: string | undefined) => {
  const trimmed = normalizeString(currencyCode).toUpperCase();

  if (trimmed === '') {
    throw new Error('Currency is required');
  }

  return trimmed;
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

const getCompanyChoice = (
  companyChoice: ManualGiftCompanyChoice | undefined,
): ManualGiftCompanyChoice => {
  if (companyChoice === 'USE_EXISTING' || companyChoice === 'CREATE_NEW') {
    return companyChoice;
  }

  throw new Error(
    'Choose whether to use an existing company or create a new company before saving.',
  );
};

const getPaymentType = (
  paymentType: ManualGiftEntryRequest['paymentType'],
): ManualGiftPaymentType => {
  switch (paymentType) {
    case 'CARD':
    case 'DIRECT_DEBIT':
    case 'BANK_TRANSFER':
    case 'CASH':
    case 'CHEQUE':
    case 'OTHER':
      return paymentType;
    default:
      throw new Error('Payment type is required');
  }
};

const normalizeMailingAddress = (
  mailingAddress: MailingAddressEvidence | null | undefined,
) => {
  if (!mailingAddress) {
    return null;
  }

  const normalized = {
    ...(normalizeString(mailingAddress.addressStreet1) !== ''
      ? { addressStreet1: normalizeString(mailingAddress.addressStreet1) }
      : {}),
    ...(normalizeString(mailingAddress.addressStreet2) !== ''
      ? { addressStreet2: normalizeString(mailingAddress.addressStreet2) }
      : {}),
    ...(normalizeString(mailingAddress.addressCity) !== ''
      ? { addressCity: normalizeString(mailingAddress.addressCity) }
      : {}),
    ...(normalizeString(mailingAddress.addressState) !== ''
      ? { addressState: normalizeString(mailingAddress.addressState) }
      : {}),
    ...(normalizeString(mailingAddress.addressPostcode) !== ''
      ? { addressPostcode: normalizeString(mailingAddress.addressPostcode) }
      : {}),
    ...(normalizeString(mailingAddress.addressCountry) !== ''
      ? {
          addressCountry: normalizeString(
            mailingAddress.addressCountry,
          ).toUpperCase(),
        }
      : {}),
  };

  return Object.keys(normalized).length === 0 ? null : normalized;
};

const buildGiftPayload = (args: {
  body: ManualGiftEntryRequest;
  donorType: ManualGiftDonorType;
  donorId?: string | null;
  companyId?: string | null;
}) => {
  const { body, donorType, donorId, companyId } = args;
  const donorFirstName = normalizeString(body.donorFirstName);
  const donorLastName = normalizeString(body.donorLastName);
  const donorEmail = normalizeString(body.donorEmail);
  const companyName = normalizeString(body.companyName);
  const appealName = normalizeString(body.appealName);

  if (donorType === 'INDIVIDUAL') {
    if (donorFirstName === '' || donorLastName === '') {
      throw new Error('Donor first name and last name are required');
    }
  } else if (companyName === '') {
    throw new Error('Company name is required');
  }

  return {
    // Manual entry bypasses staging by default because this is the trusted
    // operator path in the product model.
    name:
      donorType === 'INDIVIDUAL'
        ? `Gift from ${donorFirstName} ${donorLastName}`.trim()
        : `Gift from ${companyName}`,
    amount: {
      currencyCode: normalizeCurrencyCode(body.currencyCode),
      amountMicros: parseAmountMicros(normalizeString(body.amountValue)),
    },
    giftDate: normalizeGiftDate(normalizeString(body.giftDate)),
    ...(donorType === 'INDIVIDUAL'
      ? {
          donorFirstName,
          donorLastName,
          donorId,
        }
      : {}),
    paymentType: getPaymentType(body.paymentType),
    ...(donorType === 'INDIVIDUAL' && donorEmail !== ''
      ? { donorEmail }
      : {}),
    ...(donorType === 'COMPANY' && companyName !== '' ? { companyName } : {}),
    ...(donorType === 'COMPANY' && companyId ? { companyId } : {}),
    ...(appealName !== '' ? { appealName } : {}),
    giftAidRequested:
      donorType === 'INDIVIDUAL' ? (body.giftAidRequested ?? null) : null,
    giftAidDeclarationCaptured:
      donorType === 'INDIVIDUAL'
        ? (body.giftAidDeclarationCaptured ?? null)
        : null,
    ...(donorType === 'INDIVIDUAL' &&
    normalizeString(body.giftAidDeclarationDate) !== ''
      ? { giftAidDeclarationDate: normalizeString(body.giftAidDeclarationDate) }
      : {}),
    ...(donorType === 'INDIVIDUAL' &&
    normalizeString(body.giftAidCoverageScope) !== ''
      ? { giftAidCoverageScope: normalizeString(body.giftAidCoverageScope) }
      : {}),
    ...(donorType === 'INDIVIDUAL' &&
    normalizeString(body.giftAidDeclarationSource) !== ''
      ? {
          giftAidDeclarationSource: normalizeString(
            body.giftAidDeclarationSource,
          ),
        }
      : {}),
    ...(donorType === 'INDIVIDUAL' &&
    normalizeString(body.giftAidTextVersion) !== ''
      ? { giftAidTextVersion: normalizeString(body.giftAidTextVersion) }
      : {}),
    ...(donorType === 'INDIVIDUAL' &&
    normalizeString(body.giftAidDeclarationId) !== ''
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
  const donorMailingAddress = normalizeMailingAddress(body.donorMailingAddress);

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
          ...(donorMailingAddress
            ? {
                mailingAddress: donorMailingAddress,
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

const ensureCompanyForManualGift = async (
  client: CoreApiClient,
  body: ManualGiftEntryRequest,
) => {
  const companyName = normalizeString(body.companyName);

  const result = await client.mutation({
    createCompany: {
      __args: {
        data: {
          name: companyName,
        },
      },
      id: true,
    },
  } as any);

  const companyId = result?.createCompany?.id;

  if (typeof companyId !== 'string' || companyId === '') {
    throw new Error('Create company response missing id');
  }

  return companyId;
};

const resolveIndividualDonorId = async (
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

const resolveCompanyId = async (
  client: CoreApiClient,
  body: ManualGiftEntryRequest,
  companyChoice: ManualGiftCompanyChoice,
) => {
  if (companyChoice === 'USE_EXISTING') {
    const selectedCompanyId = normalizeString(body.selectedCompanyId);

    if (selectedCompanyId === '') {
      throw new Error('Select an existing company before creating the gift');
    }

    return selectedCompanyId;
  }

  return ensureCompanyForManualGift(client, body);
};

const handler = async (
  event: RoutePayload<ManualGiftEntryRequest>,
): Promise<ManualGiftEntryResponse> => {
  const body = event.body ?? ({} as ManualGiftEntryRequest);
  const donorType = getDonorType(body.donorType);
  const client = new CoreApiClient();
  const donorChoice =
    donorType === 'INDIVIDUAL' ? getDonorChoice(body.donorChoice) : null;
  const companyChoice =
    donorType === 'COMPANY' ? getCompanyChoice(body.companyChoice) : null;
  const donorId =
    donorType === 'INDIVIDUAL'
      ? await resolveIndividualDonorId(client, body, donorChoice)
      : null;
  const companyId =
    donorType === 'COMPANY'
      ? await resolveCompanyId(client, body, companyChoice)
      : null;
  const giftAidDeclarationService = createGiftAidDeclarationService(client);
  const giftAidInput =
    donorType === 'INDIVIDUAL'
      ? body
      : {
          ...body,
          giftAidRequested: false,
          giftAidDeclarationCaptured: false,
          giftAidDeclarationDate: '',
          giftAidCoverageScope: '',
          giftAidDeclarationSource: '',
          giftAidTextVersion: '',
          giftAidDeclarationId: '',
        };
  const evaluatedGiftPayload = await applyGiftAidMetadata(
    giftAidDeclarationService,
    buildGiftPayload({
      body: giftAidInput,
      donorType,
      donorId,
      companyId,
    }),
    isGiftAidEnabled(),
  );
  const declarationId = normalizeString(evaluatedGiftPayload.giftAidDeclarationId);
  const recurringAgreementId = normalizeString(
    evaluatedGiftPayload.recurringAgreementId as string | undefined,
  );
  const opportunityId = normalizeString(
    body.selectedOpportunityId as string | undefined,
  );
  const giftData = { ...evaluatedGiftPayload } as Record<string, unknown>;
  delete giftData.donorId;
  delete giftData.companyId;
  delete giftData.opportunityId;
  delete giftData.giftAidDeclarationId;
  delete giftData.recurringAgreementId;

  const result = await client.mutation({
    createGift: {
      __args: {
        data: {
          ...giftData,
          ...(donorId
            ? {
                donor: {
                  connect: {
                    where: {
                      id: donorId,
                    },
                  },
                },
              }
            : {}),
          ...(companyId
            ? {
                company: {
                  connect: {
                    where: {
                      id: companyId,
                    },
                  },
                },
              }
            : {}),
          ...(opportunityId !== ''
            ? {
                opportunity: {
                  connect: {
                    where: {
                      id: opportunityId,
                    },
                  },
                },
              }
            : {}),
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

  if (donorId) {
    try {
      await recomputeDonorRollups(client, [donorId]);
    } catch (error) {
      console.warn(
        'Non-blocking donor rollup recompute failed after manual gift create',
        donorId,
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  return {
    giftId,
    donorType,
    donorId,
    companyId,
    donorChoice,
    companyChoice,
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
