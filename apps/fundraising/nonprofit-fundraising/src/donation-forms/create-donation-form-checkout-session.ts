import { randomUUID } from 'node:crypto';
import type { CoreApiClient } from 'twenty-client-sdk/core';
import Stripe from 'stripe';
import { normalizeOnlineGiftAidEvidence } from 'src/gift-aid/online-gift-aid-evidence';
import type { GiftAidCaptureInput } from 'src/gift-aid/gift-aid.types';

type DonationFormPublicRecord = {
  id?: string | null;
  publicId?: string | null;
  status?: string | null;
  publishedVersion?: string | null;
  paymentProvider?: string | null;
  providerConfigKey?: string | null;
  publishedConfig?: Record<string, unknown> | null;
};

type DonationFormPublishedConfig = {
  title?: string;
  description?: string;
  mode?: string;
  currencyCode?: string;
  amountOptions?: number[];
  allowCustomAmount?: boolean;
  minimumAmount?: number;
  successUrl?: string;
  cancelUrl?: string;
  giftAidEnabled?: boolean;
  giftAidTextVersion?: string;
  giftAidDeclarationSource?: string;
  sourceAppealName?: string;
  sourceFundName?: string;
  requireAddress?: boolean;
  collectPhone?: boolean;
};

type DonationFormMailingAddress = {
  addressStreet1?: string | null;
  addressStreet2?: string | null;
  addressCity?: string | null;
  addressState?: string | null;
  addressPostcode?: string | null;
  addressCountry?: string | null;
};

export type CreateDonationFormCheckoutSessionRequest = {
  publicId?: string;
  donationType?: string;
  amountMinorUnits?: number;
  donorFirstName?: string;
  donorLastName?: string;
  donorEmail?: string;
  donorPhone?: string;
  donorMailingAddress?: DonationFormMailingAddress | null;
  giftAidRequested?: boolean;
  attribution?: {
    sourceAppealName?: string;
    sourceFundName?: string;
    referrer?: string;
    utm?: Record<string, string>;
    embedContext?: Record<string, unknown>;
  };
};

export type CreateDonationFormPaymentSessionResponse = {
  donationFormId: string;
  donationFormPublishedVersion: string;
  giftStagingId: string;
  checkoutSessionId: string;
  checkoutSessionClientSecret: string;
  publishableKey: string;
  sourceFingerprint: string;
};

type StripeSessionResult = {
  id: string;
  url?: string | null;
  clientSecret?: string | null;
};

type DonationType = 'ONE_OFF' | 'RECURRING';

export type StripeCheckoutSessionCreator = {
  createCheckoutSession: (
    input: Stripe.Checkout.SessionCreateParams,
  ) => Promise<StripeSessionResult>;
};

type DependencyOptions = {
  stripeSessionCreator: StripeCheckoutSessionCreator;
  now?: Date;
  publishableKey?: string;
};

const DONATION_FORM_INTAKE_SOURCE = 'donation_form';
const DONATION_FORM_GIFT_AID_SOURCE = 'donation_form_embed';

const normalizeString = (value: string | null | undefined): string =>
  value?.trim() ?? '';

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

const normalizeConfig = (
  value: Record<string, unknown> | null | undefined,
): DonationFormPublishedConfig | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  const amountOptions = Array.isArray(value.amountOptions)
    ? value.amountOptions.filter(
        (entry): entry is number =>
          typeof entry === 'number' && Number.isInteger(entry) && entry > 0,
      )
    : undefined;

  return {
    title: normalizeString(value.title as string | null | undefined) || undefined,
    description:
      normalizeString(value.description as string | null | undefined) ||
      undefined,
    mode: normalizeString(value.mode as string | null | undefined) || undefined,
    currencyCode:
      normalizeString(value.currencyCode as string | null | undefined)
        .toUpperCase() || undefined,
    amountOptions:
      amountOptions && amountOptions.length > 0 ? amountOptions : undefined,
    allowCustomAmount: value.allowCustomAmount === true,
    minimumAmount:
      typeof value.minimumAmount === 'number' &&
      Number.isInteger(value.minimumAmount) &&
      value.minimumAmount > 0
        ? value.minimumAmount
        : undefined,
    successUrl:
      normalizeString(value.successUrl as string | null | undefined) || undefined,
    cancelUrl:
      normalizeString(value.cancelUrl as string | null | undefined) || undefined,
    giftAidEnabled: value.giftAidEnabled === true,
    giftAidTextVersion:
      normalizeString(value.giftAidTextVersion as string | null | undefined) ||
      undefined,
    giftAidDeclarationSource:
      normalizeString(
        value.giftAidDeclarationSource as string | null | undefined,
      ) || undefined,
    sourceAppealName:
      normalizeString(value.sourceAppealName as string | null | undefined) ||
      undefined,
    sourceFundName:
      normalizeString(value.sourceFundName as string | null | undefined) ||
      undefined,
    requireAddress: value.requireAddress === true,
    collectPhone: value.collectPhone === true,
  };
};

const resolveAllowedDonationTypes = (
  value: string | undefined,
): DonationType[] => {
  const normalized = normalizeString(value).toUpperCase();

  if (
    normalized === 'ONE_OFF_AND_MONTHLY' ||
    normalized === 'MONTHLY_AND_ONE_OFF' ||
    normalized === 'MIXED'
  ) {
    return ['ONE_OFF', 'RECURRING'];
  }

  if (normalized === 'RECURRING') {
    return ['RECURRING'];
  }

  return ['ONE_OFF'];
};

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

const assertValidUrl = (value: string | undefined, fieldName: string): string => {
  if (!value) {
    throw new Error(`${fieldName} is required in the published donation form config`);
  }

  try {
    return new URL(value).toString();
  } catch {
    throw new Error(`${fieldName} must be a valid URL in the published donation form config`);
  }
};

const resolveStripeApiKey = (providerConfigKey: string): string => {
  if (providerConfigKey !== 'stripe-default') {
    throw new Error(
      `Unsupported Stripe provider config key "${providerConfigKey}" in this spike`,
    );
  }

  const apiKey = normalizeString(
    process.env.STRIPE_SECRET_KEY ?? process.env.STRIPE_API_KEY,
  );

  if (apiKey === '') {
    throw new Error('Stripe secret key is not configured for donation form checkout');
  }

  return apiKey;
};

const resolveStripePublishableKey = (providerConfigKey: string): string => {
  if (providerConfigKey !== 'stripe-default') {
    throw new Error(
      `Unsupported Stripe provider config key "${providerConfigKey}" in this spike`,
    );
  }

  const publishableKey = normalizeString(process.env.STRIPE_PUBLISHABLE_KEY);

  if (publishableKey === '') {
    throw new Error(
      'Stripe publishable key is not configured for Payment Element donation forms',
    );
  }

  return publishableKey;
};

const loadPublishedDonationFormForCheckout = async (
  client: CoreApiClient,
  publicId: string,
): Promise<{
  donationFormId: string;
  publishedVersion: string;
  providerConfigKey: string;
  config: DonationFormPublishedConfig;
}> => {
  const result = await client.query({
    donationForm: {
      __args: {
        filter: {
          publicId: {
            eq: publicId,
          },
        },
      },
      id: true,
      publicId: true,
      status: true,
      publishedVersion: true,
      paymentProvider: true,
      providerConfigKey: true,
      publishedConfig: true,
    },
  } as any);

  const record = (result?.donationForm as DonationFormPublicRecord | null) ?? null;

  if (!record?.id) {
    throw new Error('Published donation form not found');
  }

  if (normalizeString(record.status) !== 'LIVE') {
    throw new Error('Donation form is not live');
  }

  if (normalizeString(record.paymentProvider) !== 'STRIPE') {
    throw new Error('Only Stripe donation forms are supported in this spike');
  }

  const publishedVersion = normalizeString(record.publishedVersion);
  if (publishedVersion === '') {
    throw new Error('Donation form is missing a published version');
  }

  const providerConfigKey = normalizeString(record.providerConfigKey);
  if (providerConfigKey === '') {
    throw new Error('Donation form is missing a provider config key');
  }

  const config = normalizeConfig(record.publishedConfig ?? null);
  if (!config) {
    throw new Error('Donation form is missing published config');
  }

  return {
    donationFormId: record.id,
    publishedVersion,
    providerConfigKey,
    config,
  };
};

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

const createGiftStagingRow = async ({
  client,
  input,
}: {
  client: CoreApiClient;
  input: Record<string, unknown>;
}): Promise<string> => {
  const result = await client.mutation({
    createGiftStaging: {
      __args: {
        data: input,
      },
      id: true,
    },
  } as any);

  const giftStagingId = result?.createGiftStaging?.id;
  if (typeof giftStagingId !== 'string' || giftStagingId.trim() === '') {
    throw new Error('Create gift staging response missing id');
  }

  return giftStagingId.trim();
};

const updateGiftStagingRow = async ({
  client,
  giftStagingId,
  data,
}: {
  client: CoreApiClient;
  giftStagingId: string;
  data: Record<string, unknown>;
}): Promise<void> => {
  await client.mutation({
    updateGiftStaging: {
      __args: {
        id: giftStagingId,
        data,
      },
      id: true,
    },
  } as any);
};

const buildPrePaymentRawEvidence = ({
  sourceFingerprint,
  donationFormId,
  donationFormPublishedVersion,
  donationType,
  giftAidEvidence,
  attribution,
}: {
  sourceFingerprint: string;
  donationFormId: string;
  donationFormPublishedVersion: string;
  donationType: DonationType;
  giftAidEvidence: GiftAidCaptureInput;
  attribution?: CreateDonationFormCheckoutSessionRequest['attribution'];
}) => ({
  provider: 'STRIPE',
  flow: 'DONATION_FORM',
  paymentLifecycle: 'AWAITING_PAYMENT',
  sourceFingerprint,
  donationFormId,
  donationFormPublishedVersion,
  donationType,
  ...(donationType === 'RECURRING'
    ? {
        recurring: {
          intervalUnit: 'month',
          intervalCount: 1,
        },
      }
    : {}),
  submittedGiftAid: {
    requested: giftAidEvidence.giftAidRequested === true,
    declarationCaptured: giftAidEvidence.giftAidDeclarationCaptured === true,
    ...(normalizeString(giftAidEvidence.giftAidDeclarationDate)
      ? {
          declarationDate: normalizeString(
            giftAidEvidence.giftAidDeclarationDate,
          ),
        }
      : {}),
    ...(normalizeString(giftAidEvidence.giftAidDeclarationSource)
      ? {
          declarationSource: normalizeString(
            giftAidEvidence.giftAidDeclarationSource,
          ),
        }
      : {}),
    ...(normalizeString(giftAidEvidence.giftAidTextVersion)
      ? { textVersion: normalizeString(giftAidEvidence.giftAidTextVersion) }
      : {}),
  },
  ...(attribution
    ? {
        attribution: {
          ...(normalizeString(attribution.sourceAppealName) !== ''
            ? { sourceAppealName: normalizeString(attribution.sourceAppealName) }
            : {}),
          ...(normalizeString(attribution.sourceFundName) !== ''
            ? { sourceFundName: normalizeString(attribution.sourceFundName) }
            : {}),
          ...(normalizeString(attribution.referrer) !== ''
            ? { referrer: normalizeString(attribution.referrer) }
            : {}),
          ...(attribution.utm ? { utm: attribution.utm } : {}),
          ...(attribution.embedContext
            ? { embedContext: attribution.embedContext }
            : {}),
        },
      }
    : {}),
});

const buildCheckoutMetadata = ({
  sourceFingerprint,
  giftStagingId,
  donationFormId,
  donationFormPublishedVersion,
  donationType,
  sourceAppealName,
  sourceFundName,
  giftAidRequested,
  giftAidDeclarationSource,
  giftAidDeclarationDate,
  giftAidTextVersion,
}: {
  sourceFingerprint: string;
  giftStagingId: string;
  donationFormId: string;
  donationFormPublishedVersion: string;
  donationType: DonationType;
  sourceAppealName?: string;
  sourceFundName?: string;
  giftAidRequested: boolean;
  giftAidDeclarationSource: string;
  giftAidDeclarationDate?: string;
  giftAidTextVersion?: string;
}): Record<string, string> => ({
  sourceFingerprint,
  giftStagingId,
  donationFormId,
  donationFormPublishedVersion,
  donationType,
  giftAidRequested: giftAidRequested ? 'true' : 'false',
  giftAidDeclarationSource,
  ...(giftAidDeclarationDate ? { giftAidDeclarationDate } : {}),
  ...(giftAidTextVersion ? { giftAidTextVersion } : {}),
  ...(sourceAppealName ? { sourceAppealName } : {}),
  ...(sourceFundName ? { sourceFundName } : {}),
});

const createStripeSessionCreator = (
  stripeApiKey: string,
): StripeCheckoutSessionCreator => {
  const stripe = new Stripe(stripeApiKey);

  return {
    createCheckoutSession: async (input) => {
      const session = await stripe.checkout.sessions.create(input);

      if (normalizeString(session.id) === '') {
        throw new Error('Stripe checkout session response missing id');
      }

      return {
        id: session.id,
        url: session.url,
        clientSecret: session.client_secret,
      };
    },
  };
};

const createDonationFormPaymentSessionBase = async ({
  client,
  request,
  dependencies,
}: {
  client: CoreApiClient;
  request: CreateDonationFormCheckoutSessionRequest;
  dependencies: DependencyOptions;
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

  const published = await loadPublishedDonationFormForCheckout(client, publicId);
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
  const giftAidDeclarationSource =
    normalizeString(config.giftAidDeclarationSource) ||
    DONATION_FORM_GIFT_AID_SOURCE;
  const submittedAt = (dependencies.now ?? new Date()).toISOString();
  const giftAidDeclarationDate = submittedAt.slice(0, 10);
  const sourceAppealName =
    normalizeString(request.attribution?.sourceAppealName) ||
    normalizeString(config.sourceAppealName) ||
    undefined;
  const sourceFundName =
    normalizeString(request.attribution?.sourceFundName) ||
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

  if (giftAidRequested && giftAidEvidence.giftAidDeclarationCaptured !== true) {
    throw new Error(
      'Gift Aid requires the donor home address to be completed before payment.',
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

  const checkoutSessionInput: Stripe.Checkout.SessionCreateParams = {
    mode: donationType === 'RECURRING' ? 'subscription' : 'payment',
    customer_email: donorEmail,
    billing_address_collection:
      config.requireAddress === true ? 'required' : 'auto',
    phone_number_collection: {
      enabled: config.collectPhone === true,
    },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: currencyCode,
          unit_amount: amountMinorUnits,
          ...(donationType === 'RECURRING'
            ? {
                recurring: {
                  interval: 'month',
                },
              }
            : {}),
          product_data: {
            name:
              normalizeString(config.title) ||
              (donationType === 'RECURRING' ? 'Monthly donation' : 'Donation'),
            ...(normalizeString(config.description) !== ''
              ? { description: normalizeString(config.description) }
              : {}),
          },
        },
      },
    ],
    metadata,
    client_reference_id: sourceFingerprint,
  };

  checkoutSessionInput.ui_mode = 'elements';
  checkoutSessionInput.payment_method_types = ['card'];
  checkoutSessionInput.return_url = assertValidUrl(config.successUrl, 'successUrl');

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
}: {
  client: CoreApiClient;
  request: CreateDonationFormCheckoutSessionRequest;
  dependencies: DependencyOptions;
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
  const stripeApiKey = resolveStripeApiKey(published.providerConfigKey);
  const publishableKey = resolveStripePublishableKey(published.providerConfigKey);

  return createDonationFormCheckoutSessionWithDependencies({
    client,
    request,
    dependencies: {
      stripeSessionCreator: createStripeSessionCreator(stripeApiKey),
      publishableKey,
    },
  });
};
