import { randomUUID } from 'node:crypto';
import type { CoreApiClient } from 'twenty-client-sdk/core';
import { normalizeOnlineGiftAidEvidence } from 'src/gift-aid/online-gift-aid-evidence';
import {
  type DonationFormPublishedConfig,
  normalizeDonationFormString,
  resolveDonationFormDonationTypes,
} from 'src/donation-forms/donation-form-config';
import type {
  CreateDonationFormCheckoutSessionRequest,
  CreateDonationFormPaymentSessionResponse,
  DonationFormCheckoutDependencyOptions,
  DonationFormMailingAddress,
  DonationType,
  PublishedDonationFormForCheckout,
  StripeSessionResult,
} from './donation-form-checkout.types';
import {
  createGiftStagingRow,
  loadPublishedDonationFormForCheckout,
  updateGiftStagingRow,
} from './donation-form-checkout-repository';
import {
  buildCheckoutMetadata,
  buildPrePaymentRawEvidence,
} from './donation-form-checkout-evidence';
import {
  buildStripeCheckoutSessionInput,
  createStripeSessionCreator,
  resolveStripeApiKey,
  resolveStripePublishableKey,
} from './donation-form-checkout-stripe';

export type {
  CreateDonationFormCheckoutSessionRequest,
  CreateDonationFormPaymentSessionResponse,
  StripeCheckoutSessionCreator,
} from './donation-form-checkout.types';

const DONATION_FORM_INTAKE_SOURCE = 'donation_form';
const DONATION_FORM_GIFT_AID_SOURCE = 'donation_form_embed';

const normalizeString = normalizeDonationFormString;

const normalizeAddress = (
  value: DonationFormMailingAddress | null | undefined,
): DonationFormMailingAddress | undefined => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return undefined;
  }

  const normalized = {
    ...(normalizeString(value.addressStreet1) !== ''
      ? { addressStreet1: normalizeString(value.addressStreet1) }
      : {}),
    ...(normalizeString(value.addressStreet2) !== ''
      ? { addressStreet2: normalizeString(value.addressStreet2) }
      : {}),
    ...(normalizeString(value.addressCity) !== ''
      ? { addressCity: normalizeString(value.addressCity) }
      : {}),
    ...(normalizeString(value.addressState) !== ''
      ? { addressState: normalizeString(value.addressState) }
      : {}),
    ...(normalizeString(value.addressPostcode) !== ''
      ? { addressPostcode: normalizeString(value.addressPostcode) }
      : {}),
    ...(normalizeString(value.addressCountry) !== ''
      ? { addressCountry: normalizeString(value.addressCountry).toUpperCase() }
      : {}),
  };

  return Object.keys(normalized).length > 0 ? normalized : undefined;
};

const resolveAllowedDonationTypes = (
  value: string | undefined,
): DonationType[] => resolveDonationFormDonationTypes(value);

const resolveRequestedDonationType = ({
  configMode,
  requestedDonationType,
}: {
  configMode: string | undefined;
  requestedDonationType: string | undefined;
}): DonationType => {
  const allowedDonationTypes = resolveAllowedDonationTypes(configMode);
  const normalizedRequested = normalizeString(requestedDonationType).toUpperCase();

  if (normalizedRequested === '') {
    return allowedDonationTypes[0] ?? 'ONE_OFF';
  }

  if (
    (normalizedRequested === 'ONE_OFF' || normalizedRequested === 'RECURRING') &&
    allowedDonationTypes.includes(normalizedRequested as DonationType)
  ) {
    return normalizedRequested as DonationType;
  }

  throw new Error(
    'Donation type is not allowed by the published donation form config',
  );
};

const buildSourceFingerprint = (): string =>
  `dfs_${randomUUID().replace(/-/g, '')}`;

const buildGiftStagingName = ({
  donorFirstName,
  donorLastName,
  donationType,
}: {
  donorFirstName: string;
  donorLastName: string;
  donationType: DonationType;
}): string => {
  const donorName = `${donorFirstName} ${donorLastName}`.trim();
  const baseLabel =
    donationType === 'RECURRING'
      ? 'Monthly donation form submission'
      : 'Donation form submission';

  return donorName === ''
    ? baseLabel
    : `${baseLabel} from ${donorName}`;
};

const toAmountMicros = (amountMinorUnits: number): number =>
  amountMinorUnits * 10_000;

const validateAmountMinorUnits = ({
  amountMinorUnits,
  config,
}: {
  amountMinorUnits: number;
  config: DonationFormPublishedConfig;
}): number => {
  if (!Number.isInteger(amountMinorUnits) || amountMinorUnits <= 0) {
    throw new Error('Donation amount must be a positive integer in minor units');
  }

  const amountOptions = config.amountOptions ?? [];
  if (amountOptions.includes(amountMinorUnits)) {
    return amountMinorUnits;
  }

  if (config.allowCustomAmount === true) {
    const minimumAmount = config.minimumAmount ?? 1;
    if (amountMinorUnits >= minimumAmount) {
      return amountMinorUnits;
    }
  }

  throw new Error('Donation amount is not allowed by the published donation form config');
};

const createDonationFormPaymentSessionBase = async ({
  client,
  request,
  dependencies,
  publishedForm,
}: {
  client: CoreApiClient;
  request: CreateDonationFormCheckoutSessionRequest;
  dependencies: DonationFormCheckoutDependencyOptions;
  publishedForm?: PublishedDonationFormForCheckout;
}): Promise<{
  donationFormId: string;
  donationFormPublishedVersion: string;
  giftStagingId: string;
  checkoutSession: StripeSessionResult;
  sourceFingerprint: string;
  donationType: DonationType;
}> => {
  const publicId = normalizeString(request.publicId);
  if (publicId === '') {
    throw new Error('Donation form public id is required');
  }

  const donorFirstName = normalizeString(request.donorFirstName);
  const donorLastName = normalizeString(request.donorLastName);
  const donorEmail = normalizeString(request.donorEmail);

  if (donorFirstName === '' || donorLastName === '') {
    throw new Error('Donor first name and last name are required');
  }

  if (donorEmail === '') {
    throw new Error('Donor email is required');
  }

  const published =
    publishedForm ?? (await loadPublishedDonationFormForCheckout(client, publicId));
  const config = published.config;
  const donationType = resolveRequestedDonationType({
    configMode: config.mode,
    requestedDonationType: request.donationType,
  });

  const currencyCode = normalizeString(config.currencyCode).toLowerCase();
  if (currencyCode === '') {
    throw new Error('Published donation form config is missing currencyCode');
  }

  const amountMinorUnits = validateAmountMinorUnits({
    amountMinorUnits: request.amountMinorUnits ?? 0,
    config,
  });

  const donorMailingAddress = normalizeAddress(request.donorMailingAddress);
  const sourceFingerprint = buildSourceFingerprint();
  const giftAidRequested = config.giftAidEnabled === true && request.giftAidRequested === true;
  const supporterEmailOptOut = request.supporterEmailOptOut === true;
  const giftAidDeclarationSource =
    normalizeString(config.giftAidDeclarationSource) ||
    DONATION_FORM_GIFT_AID_SOURCE;
  const submittedAt = (dependencies.now ?? new Date()).toISOString();
  const giftAidDeclarationDate = submittedAt.slice(0, 10);
  const defaultAppealId =
    normalizeString(config.defaultAppeal?.id) ||
    normalizeString(config.defaultAppealSource?.appeal?.id);
  const defaultAppealSourceId = normalizeString(config.defaultAppealSource?.id);
  const defaultFundId =
    normalizeString(config.defaultFund?.id) ||
    normalizeString(config.defaultAppeal?.defaultFund?.id) ||
    normalizeString(config.defaultAppealSource?.appeal?.defaultFund?.id);
  const sourceAppealName =
    normalizeString(request.attribution?.sourceAppealName) ||
    normalizeString(config.defaultAppealSource?.appeal?.name) ||
    normalizeString(config.defaultAppeal?.name) ||
    normalizeString(config.sourceAppealName) ||
    undefined;
  const sourceFundName =
    normalizeString(request.attribution?.sourceFundName) ||
    normalizeString(config.defaultFund?.name) ||
    normalizeString(config.defaultAppeal?.defaultFund?.name) ||
    normalizeString(config.defaultAppealSource?.appeal?.defaultFund?.name) ||
    normalizeString(config.sourceFundName) ||
    undefined;
  const giftAidTextVersion =
    normalizeString(config.giftAidTextVersion) || undefined;
  const giftAidEvidence = normalizeOnlineGiftAidEvidence({
    giftAidRequested,
    donorFirstName,
    donorLastName,
    donorMailingAddress: donorMailingAddress ?? null,
    declarationDate: giftAidDeclarationDate,
    declarationSource: giftAidDeclarationSource,
    ...(giftAidTextVersion ? { textVersion: giftAidTextVersion } : {}),
  });

  if (config.requireAddress === true && !donorMailingAddress) {
    throw new Error(
      'This donation form requires the donor address before payment.',
    );
  }

  const giftStagingId = await createGiftStagingRow({
    client,
    input: {
      name: buildGiftStagingName({
        donorFirstName,
        donorLastName,
        donationType,
      }),
      intakeSource: DONATION_FORM_INTAKE_SOURCE,
      amount: {
        currencyCode: currencyCode.toUpperCase(),
        amountMicros: toAmountMicros(amountMinorUnits),
      },
      donationType,
      paymentType: 'CARD',
      ...(defaultAppealId !== ''
        ? {
            appeal: {
              connect: {
                where: {
                  id: defaultAppealId,
                },
              },
            },
          }
        : {}),
      ...(defaultAppealSourceId !== ''
        ? {
            appealSource: {
              connect: {
                where: {
                  id: defaultAppealSourceId,
                },
              },
            },
          }
        : {}),
      ...(defaultFundId !== ''
        ? {
            fund: {
              connect: {
                where: {
                  id: defaultFundId,
                },
              },
            },
          }
        : {}),
      sourceFingerprint,
      provider: 'STRIPE',
      ...(donationType === 'RECURRING'
        ? {
            providerIntervalUnit: 'month',
            providerIntervalCount: 1,
          }
        : {}),
      donorFirstName,
      donorLastName,
      donorEmail,
      ...(normalizeString(request.donorPhone) !== ''
        ? { donorPhone: normalizeString(request.donorPhone) }
        : {}),
      ...(donorMailingAddress ? { donorMailingAddress } : {}),
      supporterEmailOptOut,
      donorResolutionState: 'UNREVIEWED',
      giftReadyStatus: 'NEEDS_REVIEW',
      processingStatus: 'NOT_PROCESSED',
      paymentState: 'AWAITING_PAYMENT',
      donationFormId: published.donationFormId,
      donationFormPublishedVersion: published.publishedVersion,
      giftAidRequested: giftAidEvidence.giftAidRequested === true,
      giftAidDeclarationCaptured:
        giftAidEvidence.giftAidDeclarationCaptured === true,
      ...(giftAidEvidence.giftAidRequested === true
        ? {
            ...(normalizeString(giftAidEvidence.giftAidDeclarationDate)
              ? {
                  giftAidDeclarationDate: normalizeString(
                    giftAidEvidence.giftAidDeclarationDate,
                  ),
                }
              : {}),
            ...(normalizeString(giftAidEvidence.giftAidDeclarationSource)
              ? {
                  giftAidDeclarationSource: normalizeString(
                    giftAidEvidence.giftAidDeclarationSource,
                  ),
                }
              : {}),
            ...(normalizeString(giftAidEvidence.giftAidTextVersion)
              ? {
                  giftAidTextVersion: normalizeString(
                    giftAidEvidence.giftAidTextVersion,
                  ),
                }
              : {}),
            ...(normalizeString(giftAidEvidence.giftAidCoverageScope)
              ? {
                  giftAidCoverageScope: normalizeString(
                    giftAidEvidence.giftAidCoverageScope,
                  ),
                }
              : {}),
          }
        : {}),
      ...(sourceAppealName ? { sourceAppealName } : {}),
      ...(sourceFundName ? { sourceFundName } : {}),
      rawProviderEvidence: buildPrePaymentRawEvidence({
        sourceFingerprint,
        donationFormId: published.donationFormId,
        donationFormPublishedVersion: published.publishedVersion,
        donationType,
        giftAidEvidence,
        supporterEmailOptOut,
        attribution: request.attribution,
      }),
    },
  });

  const metadata = buildCheckoutMetadata({
    sourceFingerprint,
    giftStagingId,
    donationFormId: published.donationFormId,
    donationFormPublishedVersion: published.publishedVersion,
    donationType,
    sourceAppealName,
    sourceFundName,
    giftAidRequested: giftAidEvidence.giftAidRequested === true,
    giftAidDeclarationSource:
      normalizeString(giftAidEvidence.giftAidDeclarationSource) ||
      giftAidDeclarationSource,
    giftAidDeclarationDate:
      normalizeString(giftAidEvidence.giftAidDeclarationDate) || undefined,
    giftAidTextVersion,
  });

  const checkoutSessionInput = buildStripeCheckoutSessionInput({
    published,
    donationType,
    donorEmail,
    currencyCode,
    amountMinorUnits,
    metadata,
    sourceFingerprint,
  });

  const checkoutSession =
    await dependencies.stripeSessionCreator.createCheckoutSession(
      checkoutSessionInput,
    );

  try {
    await updateGiftStagingRow({
      client,
      giftStagingId,
      data: {
        externalId: checkoutSession.id,
        rawProviderEvidence: {
          ...buildPrePaymentRawEvidence({
            sourceFingerprint,
            donationFormId: published.donationFormId,
            donationFormPublishedVersion: published.publishedVersion,
            donationType,
            giftAidEvidence,
            supporterEmailOptOut,
            attribution: request.attribution,
          }),
          checkoutSessionId: checkoutSession.id,
          metadata,
        },
      },
    });
  } catch (error) {
    console.warn(
      JSON.stringify({
        event: 'donation_form_checkout_session_persist_warning',
        giftStagingId,
        checkoutSessionId: checkoutSession.id,
        message: error instanceof Error ? error.message : String(error),
      }),
    );
  }

  return {
    donationFormId: published.donationFormId,
    donationFormPublishedVersion: published.publishedVersion,
    giftStagingId,
    checkoutSession,
    sourceFingerprint,
    donationType,
  };
};

export const createDonationFormCheckoutSessionWithDependencies = async ({
  client,
  request,
  dependencies,
  publishedForm,
}: {
  client: CoreApiClient;
  request: CreateDonationFormCheckoutSessionRequest;
  dependencies: DonationFormCheckoutDependencyOptions;
  publishedForm?: PublishedDonationFormForCheckout;
}): Promise<CreateDonationFormPaymentSessionResponse> => {
  const publishableKey = normalizeString(dependencies.publishableKey);
  if (publishableKey === '') {
    throw new Error(
      'Stripe publishable key is not configured for Payment Element donation forms',
    );
  }

  const result = await createDonationFormPaymentSessionBase({
    client,
    request,
    dependencies,
    publishedForm,
  });

  const checkoutSessionClientSecret = normalizeString(
    result.checkoutSession.clientSecret,
  );
  if (checkoutSessionClientSecret === '') {
    throw new Error(
      'Stripe payment session response missing client secret',
    );
  }

  return {
    donationFormId: result.donationFormId,
    donationFormPublishedVersion: result.donationFormPublishedVersion,
    giftStagingId: result.giftStagingId,
    checkoutSessionId: result.checkoutSession.id,
    checkoutSessionClientSecret,
    publishableKey,
    sourceFingerprint: result.sourceFingerprint,
  };
};

export const createDonationFormCheckoutSession = async ({
  client,
  request,
}: {
  client: CoreApiClient;
  request: CreateDonationFormCheckoutSessionRequest;
}): Promise<CreateDonationFormPaymentSessionResponse> => {
  const publicId = normalizeString(request.publicId);
  if (publicId === '') {
    throw new Error('Donation form public id is required');
  }

  const published = await loadPublishedDonationFormForCheckout(client, publicId);
  const stripeApiKey = await resolveStripeApiKey(published.providerConfigKey);
  const publishableKey = resolveStripePublishableKey(published.providerConfigKey);

  return createDonationFormCheckoutSessionWithDependencies({
    client,
    request,
    dependencies: {
      stripeSessionCreator: createStripeSessionCreator(stripeApiKey),
      publishableKey,
    },
    publishedForm: published,
  });
};
