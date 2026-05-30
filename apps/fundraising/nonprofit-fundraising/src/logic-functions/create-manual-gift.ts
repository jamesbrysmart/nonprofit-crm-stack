import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { recomputeAppealRollups } from 'src/appeal-rollups/appeal-rollups';
import { createGiftAidDeclarationService } from 'src/gift-aid/gift-aid.declarations';
import { attachGiftToCurrentDraftIfClaimable } from 'src/gift-aid-claims/gift-aid-claim-batch';
import { recomputeDonorRollups } from 'src/donor-rollups/donor-rollups';
import { isGiftAidEnabled } from 'src/gift-aid/gift-aid-config';
import { applyGiftAidMetadata } from 'src/gift-aid/gift-aid.policy';
import { advanceRecurringAgreementExpectation } from 'src/recurring/recurring.service';
import { resolveAppealSourceSelection } from 'src/appeal-sources/appeal-source-integrity';
import { resolveSoftCreditSelection } from 'src/soft-credits/soft-credit-integrity';
import type {
  ManualGiftCompanyChoice,
  ManualGiftDonorChoice,
  ManualGiftEntryRequest,
  ManualGiftEntryResponse,
} from 'src/manual-gift-entry/manual-gift-entry.types';
import {
  getManualGiftCompanyChoice,
  getManualGiftDonorChoice,
  getManualGiftDonorType,
  normalizeManualGiftMailingAddress,
  normalizeRequiredGiftDate,
  normalizeString,
} from 'src/manual-gift-entry/manual-gift-normalization';
import { buildManualGiftPayload } from 'src/manual-gift-entry/manual-gift-payload';

const resolveAppealAndFundSelection = async (
  client: CoreApiClient,
  body: ManualGiftEntryRequest,
) => {
  const selectedAppealSourceId = normalizeString(body.selectedAppealSourceId);
  const {
    appealId,
    appealDefaultFundId,
    appealSourceId,
  } = await resolveAppealSourceSelection({
    client,
    appealId: normalizeString(body.selectedAppealId),
    appealSourceId: selectedAppealSourceId,
  });
  let fundId = normalizeString(body.selectedFundId);

  if (fundId === '' && appealDefaultFundId !== '') {
    fundId = appealDefaultFundId;
  }

  if (appealId !== '' && fundId === '' && appealSourceId === '') {
    const result = await client.query({
      appeal: {
        __args: {
          filter: {
            id: { eq: appealId },
          },
        },
        id: true,
        defaultFund: {
          id: true,
        },
      },
    } as any);

    const resolvedAppeal = result?.appeal as
      | {
          id?: string | null;
          defaultFund?: { id?: string | null } | null;
        }
      | null;

    if (!resolvedAppeal?.id) {
      throw new Error('Selected appeal was not found');
    }

    fundId = normalizeString(resolvedAppeal.defaultFund?.id);
  }

  return {
    appealId,
    appealSourceId,
    fundId,
  };
};

const ensurePersonForManualGift = async (
  client: CoreApiClient,
  body: ManualGiftEntryRequest,
) => {
  const donorFirstName = normalizeString(body.donorFirstName);
  const donorLastName = normalizeString(body.donorLastName);
  const donorEmail = normalizeString(body.donorEmail);
  const donorMailingAddress = normalizeManualGiftMailingAddress(
    body.donorMailingAddress,
  );

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
  const donorType = getManualGiftDonorType(body.donorType);
  const client = new CoreApiClient();
  const donorChoice =
    donorType === 'INDIVIDUAL'
      ? getManualGiftDonorChoice(body.donorChoice)
      : null;
  const companyChoice =
    donorType === 'COMPANY'
      ? getManualGiftCompanyChoice(body.companyChoice)
      : null;
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
    buildManualGiftPayload({
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
  const { appealId, appealSourceId, fundId } =
    await resolveAppealAndFundSelection(client, body);
  const softCreditSelection = resolveSoftCreditSelection({
    softCreditPersonId: body.selectedSoftCreditPersonId,
    softCreditCompanyId: body.selectedSoftCreditCompanyId,
    softCreditType: body.selectedSoftCreditType,
  });
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
            : {}),
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
            : {}),
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
            : {}),
          ...(softCreditSelection.mode === 'set' &&
          softCreditSelection.softCreditPersonId !== ''
            ? {
                softCreditPerson: {
                  connect: {
                    where: {
                      id: softCreditSelection.softCreditPersonId,
                    },
                  },
                },
              }
            : {}),
          ...(softCreditSelection.mode === 'set' &&
          softCreditSelection.softCreditCompanyId !== ''
            ? {
                softCreditCompany: {
                  connect: {
                    where: {
                      id: softCreditSelection.softCreditCompanyId,
                    },
                  },
                },
              }
            : {}),
          ...(softCreditSelection.mode === 'set'
            ? {
                softCreditType: softCreditSelection.softCreditType,
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
      normalizeRequiredGiftDate(body.giftDate),
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

  if (appealId !== '') {
    try {
      await recomputeAppealRollups(client, [appealId]);
    } catch (error) {
      console.warn(
        'Non-blocking appeal rollup recompute failed after manual gift create',
        appealId,
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
