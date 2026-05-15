import { CoreApiClient } from 'twenty-client-sdk/core';
import { normalizeOnlineGiftAidEvidence } from 'src/gift-aid/online-gift-aid-evidence';
import type { MailingAddressEvidence } from 'src/gift-aid/gift-aid.types';

const STRIPE_PROVIDER = 'STRIPE';
const STRIPE_INTAKE_SOURCE = 'stripe_webhook';
const STRIPE_GIFT_AID_SOURCE = 'stripe_checkout';
const DEFAULT_CURRENCY_CODE = 'GBP';

type StripeCheckoutSessionCustomerDetails = {
  email?: string | null;
  name?: string | null;
  phone?: string | null;
  address?: {
    line1?: string | null;
    line2?: string | null;
    city?: string | null;
    state?: string | null;
    postal_code?: string | null;
    country?: string | null;
  } | null;
};

type StripeCheckoutSessionCustomField = {
  key?: string | null;
  text?: {
    value?: string | null;
  } | null;
  numeric?: {
    value?: string | null;
  } | null;
  dropdown?: {
    value?: string | null;
  } | null;
} | null;

type StripeRecurringPriceEvidence = {
  recurring?: {
    interval?: string | null;
    interval_count?: number | null;
  } | null;
} | null;

type StripeSubscriptionEvidence = {
  id?: string | null;
  items?: {
    data?: Array<{
      price?: StripeRecurringPriceEvidence;
    } | null>;
  } | null;
};

type StripeCheckoutSession = {
  id?: string;
  amount_total?: number | null;
  currency?: string | null;
  created?: number;
  customer?: string | { id?: string | null } | null;
  customer_details?: StripeCheckoutSessionCustomerDetails | null;
  custom_fields?: StripeCheckoutSessionCustomField[] | null;
  metadata?: Record<string, string | null | undefined> | null;
  payment_intent?: string | { id?: string | null } | null;
  subscription?: string | StripeSubscriptionEvidence | null;
};

type RawProviderEvidence = {
  provider: 'STRIPE';
  eventType: string;
  checkoutSessionId: string;
  customerId?: string;
  paymentIntentId?: string;
  subscriptionId?: string;
  giftAid?: {
    requested?: boolean;
    declarationCaptured?: boolean;
    declarationDate?: string;
    declarationSource?: string;
    textVersion?: string;
    coverageScope?: string;
  };
  customerDetails?: {
    name?: string;
    email?: string;
    phone?: string;
    address?: MailingAddressEvidence;
  };
  recurring?: {
    intervalUnit?: string;
    intervalCount?: number;
  };
};

export type StripeCheckoutSessionCompletedEvent = {
  id?: string;
  type?: string;
  created?: number;
  data?: {
    object?: StripeCheckoutSession | null;
  } | null;
};

export type StripeOneOffGiftStagingInput = {
  name: string;
  intakeSource: typeof STRIPE_INTAKE_SOURCE;
  amount: {
    currencyCode: string;
    amountMicros: number;
  };
  giftDate: string;
  donationType: 'ONE_OFF' | 'RECURRING';
  donorFirstName: string;
  donorLastName: string;
  donorEmail?: string;
  donorPhone?: string;
  externalId: string;
  sourceFingerprint: string;
  providerEventId: string;
  provider: typeof STRIPE_PROVIDER;
  providerPaymentId?: string;
  paymentProviderCustomerId?: string;
  providerAgreementId?: string | null;
  providerIntervalUnit?: string;
  providerIntervalCount?: number;
  donorMailingAddress?: MailingAddressEvidence;
  rawProviderEvidence?: RawProviderEvidence;
  donorResolutionState: 'UNREVIEWED';
  giftReadyStatus: 'NEEDS_REVIEW';
  processingStatus: 'NOT_PROCESSED';
};

export type StripeOneOffGiftStagingResult =
  | {
      created: true;
      giftStagingId: string;
      sourceFingerprint: string;
      externalId: string;
    }
  | {
      created: false;
      giftStagingId: string;
      sourceFingerprint: string;
      externalId: string;
    };

const normalizeString = (value: string | null | undefined): string =>
  value?.trim() ?? '';

const formatUnixDate = (timestampSeconds: number): string =>
  new Date(timestampSeconds * 1000).toISOString().slice(0, 10);

const toCurrencyCode = (currency: string | null | undefined): string => {
  const normalized = normalizeString(currency).toUpperCase();

  return normalized === '' ? DEFAULT_CURRENCY_CODE : normalized;
};

const toAmountMicros = (amountMinorUnits: number | null | undefined): number => {
  if (!Number.isInteger(amountMinorUnits) || amountMinorUnits <= 0) {
    throw new Error('Stripe checkout session must include a positive amount_total');
  }

  return amountMinorUnits * 10_000;
};

const splitDonorName = (
  fullName: string,
): { donorFirstName: string; donorLastName: string } => {
  const trimmed = normalizeString(fullName);

  if (trimmed === '') {
    throw new Error('Stripe checkout session must include a donor name');
  }

  const segments = trimmed.split(/\s+/).filter((segment) => segment.length > 0);
  const donorFirstName = segments[0] ?? '';
  const donorLastName = segments.slice(1).join(' ');

  if (donorFirstName === '') {
    throw new Error('Stripe checkout session must include a donor name');
  }

  return {
    donorFirstName,
    donorLastName,
  };
};

const getProviderPaymentId = (
  paymentIntent: StripeCheckoutSession['payment_intent'],
): string | undefined => {
  if (typeof paymentIntent === 'string') {
    const normalized = normalizeString(paymentIntent);

    return normalized === '' ? undefined : normalized;
  }

  if (paymentIntent && typeof paymentIntent === 'object') {
    const normalized = normalizeString(paymentIntent.id);

    return normalized === '' ? undefined : normalized;
  }

  return undefined;
};

const getStripeObjectId = (
  value: string | { id?: string | null } | null | undefined,
): string | undefined => {
  if (typeof value === 'string') {
    const normalized = normalizeString(value);

    return normalized === '' ? undefined : normalized;
  }

  if (value && typeof value === 'object') {
    const normalized = normalizeString(value.id);

    return normalized === '' ? undefined : normalized;
  }

  return undefined;
};

const buildDonorMailingAddress = (
  address:
    | StripeCheckoutSessionCustomerDetails['address']
    | null
    | undefined,
): MailingAddressEvidence | undefined => {
  if (!address) {
    return undefined;
  }

  const donorMailingAddress = {
    ...(normalizeString(address.line1) !== ''
      ? { addressStreet1: normalizeString(address.line1) }
      : {}),
    ...(normalizeString(address.line2) !== ''
      ? { addressStreet2: normalizeString(address.line2) }
      : {}),
    ...(normalizeString(address.city) !== ''
      ? { addressCity: normalizeString(address.city) }
      : {}),
    ...(normalizeString(address.state) !== ''
      ? { addressState: normalizeString(address.state) }
      : {}),
    ...(normalizeString(address.postal_code) !== ''
      ? { addressPostcode: normalizeString(address.postal_code) }
      : {}),
    ...(normalizeString(address.country) !== ''
      ? { addressCountry: normalizeString(address.country).toUpperCase() }
      : {}),
  };

  return Object.keys(donorMailingAddress).length === 0
    ? undefined
    : donorMailingAddress;
};

const buildRawProviderEvidence = ({
  eventType,
  checkoutSessionId,
  customerId,
  paymentIntentId,
  subscriptionId,
  giftAid,
  donorName,
  donorEmail,
  donorPhone,
  donorMailingAddress,
  providerIntervalUnit,
  providerIntervalCount,
}: {
  eventType: string;
  checkoutSessionId: string;
  customerId?: string;
  paymentIntentId?: string;
  subscriptionId?: string;
  giftAid?: {
    requested?: boolean;
    declarationCaptured?: boolean;
    declarationDate?: string;
    declarationSource?: string;
    textVersion?: string;
    coverageScope?: string;
  };
  donorName: string;
  donorEmail: string;
  donorPhone: string;
  donorMailingAddress?: MailingAddressEvidence;
  providerIntervalUnit?: string;
  providerIntervalCount?: number;
}): RawProviderEvidence => ({
  provider: 'STRIPE',
  eventType,
  checkoutSessionId,
  ...(customerId ? { customerId } : {}),
  ...(paymentIntentId ? { paymentIntentId } : {}),
  ...(subscriptionId ? { subscriptionId } : {}),
  ...(giftAid ? { giftAid } : {}),
  customerDetails: {
    ...(donorName !== '' ? { name: donorName } : {}),
    ...(donorEmail !== '' ? { email: donorEmail } : {}),
    ...(donorPhone !== '' ? { phone: donorPhone } : {}),
    ...(donorMailingAddress ? { address: donorMailingAddress } : {}),
  },
  ...(providerIntervalUnit || typeof providerIntervalCount === 'number'
    ? {
        recurring: {
          ...(providerIntervalUnit ? { intervalUnit: providerIntervalUnit } : {}),
          ...(typeof providerIntervalCount === 'number'
            ? { intervalCount: providerIntervalCount }
            : {}),
        },
      }
    : {}),
});

const getCustomFieldValue = (
  session: StripeCheckoutSession,
  key: string,
): string | undefined => {
  const field = session.custom_fields?.find(
    (candidate) => normalizeString(candidate?.key) === key,
  );

  return (
    normalizeString(field?.text?.value) ??
    normalizeString(field?.dropdown?.value) ??
    normalizeString(field?.numeric?.value)
  );
};

const getMetadataValue = (
  session: StripeCheckoutSession,
  keys: string[],
): string | undefined => {
  for (const key of keys) {
    const value = normalizeString(session.metadata?.[key]);

    if (value) {
      return value;
    }
  }

  return undefined;
};

const getGiftAidRequestedValue = (session: StripeCheckoutSession): boolean => {
  const directValue =
    getMetadataValue(session, [
      'giftAidRequested',
      'gift_aid_requested',
      'giftAid',
      'gift_aid',
    ]) ??
    getCustomFieldValue(session, 'gift_aid_requested') ??
    getCustomFieldValue(session, 'giftAidRequested') ??
    getCustomFieldValue(session, 'gift_aid') ??
    getCustomFieldValue(session, 'giftAid');

  const normalized = normalizeString(directValue)?.toLowerCase();

  return (
    normalized === 'true' ||
    normalized === '1' ||
    normalized === 'yes' ||
    normalized === 'y' ||
    normalized === 'on' ||
    normalized === 'selected' ||
    normalized === 'requested'
  );
};

const extractStripeGiftAidEvidence = ({
  session,
  donorFirstName,
  donorLastName,
  donorMailingAddress,
  fallbackCaptureDate,
}: {
  session: StripeCheckoutSession;
  donorFirstName: string;
  donorLastName: string;
  donorMailingAddress?: MailingAddressEvidence;
  fallbackCaptureDate: string;
}) => {
  const giftAidRequested = getGiftAidRequestedValue(session);
  const giftAidDeclarationDate = getMetadataValue(session, [
    'giftAidDeclarationDate',
    'gift_aid_declaration_date',
    'giftAidDate',
    'gift_aid_date',
  ]);
  const giftAidDeclarationSource =
    getMetadataValue(session, [
      'giftAidDeclarationSource',
      'gift_aid_declaration_source',
      'giftAidSource',
      'gift_aid_source',
    ]) ?? STRIPE_GIFT_AID_SOURCE;
  const giftAidTextVersion = getMetadataValue(session, [
    'giftAidTextVersion',
    'gift_aid_text_version',
  ]);
  const giftAidCoverageScope = getMetadataValue(session, [
    'giftAidCoverageScope',
    'gift_aid_coverage_scope',
  ]);

  return normalizeOnlineGiftAidEvidence({
    giftAidRequested,
    donorFirstName,
    donorLastName,
    donorMailingAddress: donorMailingAddress ?? null,
    declarationDate: giftAidDeclarationDate,
    // If the source did not provide a separate declaration timestamp, we use
    // the best-known capture date from the intake event as a fallback.
    fallbackCaptureDate,
    declarationSource: giftAidDeclarationSource,
    textVersion: giftAidTextVersion,
    coverageScope: giftAidCoverageScope,
  });
};

const getSubscriptionIntervalEvidence = (
  subscription: StripeCheckoutSession['subscription'],
): { providerIntervalUnit?: string; providerIntervalCount?: number } => {
  if (!subscription || typeof subscription === 'string') {
    return {};
  }

  const recurring =
    subscription.items?.data?.find((item) => item?.price?.recurring)?.price
      ?.recurring ?? null;
  const providerIntervalUnit = normalizeString(recurring?.interval).toLowerCase();
  const providerIntervalCount = recurring?.interval_count;

  return {
    ...(providerIntervalUnit !== '' ? { providerIntervalUnit } : {}),
    ...(typeof providerIntervalCount === 'number' &&
    Number.isFinite(providerIntervalCount)
      ? { providerIntervalCount }
      : {}),
  };
};

const buildStagingName = (donorName: string): string =>
  `Stripe donation from ${donorName}`;

const buildRecurringStagingName = (donorName: string): string =>
  `Stripe recurring donation from ${donorName}`;

export const buildStripeOneOffGiftStagingInput = (
  event: StripeCheckoutSessionCompletedEvent,
): StripeOneOffGiftStagingInput => {
  if (event.type !== 'checkout.session.completed') {
    throw new Error('Stripe one-off staging only supports checkout.session.completed');
  }

  const eventId = normalizeString(event.id);

  if (eventId === '') {
    throw new Error('Stripe event id is required for sourceFingerprint');
  }

  const session = event.data?.object;

  if (!session) {
    throw new Error('Stripe checkout.session.completed event is missing data.object');
  }

  const externalId = normalizeString(session.id);

  if (externalId === '') {
    throw new Error('Stripe checkout session id is required');
  }

  const giftDateSource = session.created ?? event.created;

  if (!Number.isInteger(giftDateSource) || giftDateSource <= 0) {
    throw new Error('Stripe event must include a valid created timestamp');
  }

  const donorName = normalizeString(session.customer_details?.name);
  const donorEmail = normalizeString(session.customer_details?.email);
  const donorPhone = normalizeString(session.customer_details?.phone);
  const nameParts = splitDonorName(donorName);
  const providerPaymentId = getProviderPaymentId(session.payment_intent);
  const paymentProviderCustomerId = getStripeObjectId(session.customer);
  const providerAgreementId = getStripeObjectId(session.subscription);
  const intervalEvidence = getSubscriptionIntervalEvidence(session.subscription);
  const donorMailingAddress = buildDonorMailingAddress(
    session.customer_details?.address,
  );
  const donationType = providerAgreementId ? 'RECURRING' : 'ONE_OFF';
  const giftAidEvidence = extractStripeGiftAidEvidence({
    session,
    donorFirstName: nameParts.donorFirstName,
    donorLastName: nameParts.donorLastName,
    donorMailingAddress,
    fallbackCaptureDate: formatUnixDate(giftDateSource),
  });
  const rawProviderEvidence = buildRawProviderEvidence({
    eventType: event.type,
    checkoutSessionId: externalId,
    ...(paymentProviderCustomerId
      ? { customerId: paymentProviderCustomerId }
      : {}),
    ...(providerPaymentId ? { paymentIntentId: providerPaymentId } : {}),
    ...(providerAgreementId ? { subscriptionId: providerAgreementId } : {}),
    ...(giftAidEvidence.giftAidRequested === true ||
    giftAidEvidence.giftAidDeclarationCaptured === true ||
    normalizeString(giftAidEvidence.giftAidDeclarationDate) ||
    normalizeString(giftAidEvidence.giftAidDeclarationSource) ||
    normalizeString(giftAidEvidence.giftAidTextVersion) ||
    normalizeString(giftAidEvidence.giftAidCoverageScope)
      ? {
          giftAid: {
            ...(giftAidEvidence.giftAidRequested === true
              ? { requested: true }
              : {}),
            ...(giftAidEvidence.giftAidDeclarationCaptured === true
              ? { declarationCaptured: true }
              : {}),
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
              ? {
                  textVersion: normalizeString(
                    giftAidEvidence.giftAidTextVersion,
                  ),
                }
              : {}),
            ...(normalizeString(giftAidEvidence.giftAidCoverageScope)
              ? {
                  coverageScope: normalizeString(
                    giftAidEvidence.giftAidCoverageScope,
                  ),
                }
              : {}),
          },
        }
      : {}),
    donorName,
    donorEmail,
    donorPhone,
    donorMailingAddress,
    ...(intervalEvidence.providerIntervalUnit
      ? { providerIntervalUnit: intervalEvidence.providerIntervalUnit }
      : {}),
    ...(typeof intervalEvidence.providerIntervalCount === 'number'
      ? { providerIntervalCount: intervalEvidence.providerIntervalCount }
      : {}),
  });

  return {
    name: providerAgreementId
      ? buildRecurringStagingName(donorName)
      : buildStagingName(donorName),
    intakeSource: STRIPE_INTAKE_SOURCE,
    amount: {
      currencyCode: toCurrencyCode(session.currency),
      amountMicros: toAmountMicros(session.amount_total),
    },
    giftDate: formatUnixDate(giftDateSource),
    donationType,
    donorFirstName: nameParts.donorFirstName,
    donorLastName: nameParts.donorLastName,
    ...(donorEmail !== '' ? { donorEmail } : {}),
    ...(donorPhone !== '' ? { donorPhone } : {}),
    externalId,
    sourceFingerprint: eventId,
    providerEventId: eventId,
    provider: STRIPE_PROVIDER,
    ...(providerPaymentId ? { providerPaymentId } : {}),
    ...(paymentProviderCustomerId ? { paymentProviderCustomerId } : {}),
    providerAgreementId: providerAgreementId ?? null,
    ...intervalEvidence,
    ...(donorMailingAddress ? { donorMailingAddress } : {}),
    ...giftAidEvidence,
    rawProviderEvidence,
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
  };
};

export const createStripeOneOffGiftStaging = async (
  client: CoreApiClient,
  event: StripeCheckoutSessionCompletedEvent,
): Promise<StripeOneOffGiftStagingResult> => {
  const input = buildStripeOneOffGiftStagingInput(event);
  const existingId = await findGiftStagingBySourceFingerprint(
    client,
    input.sourceFingerprint,
  );

  if (existingId) {
    return {
      created: false,
      giftStagingId: existingId,
      sourceFingerprint: input.sourceFingerprint,
      externalId: input.externalId,
    };
  }

  const result = await client.mutation({
    createGiftStaging: {
      __args: {
        data: input,
      },
      id: true,
    },
  } as any);

  const recordId = result?.createGiftStaging?.id;

  if (typeof recordId !== 'string' || recordId === '') {
    throw new Error('Create gift staging response missing id');
  }

  return {
    created: true,
    giftStagingId: recordId,
    sourceFingerprint: input.sourceFingerprint,
    externalId: input.externalId,
  };
};

export const findGiftStagingBySourceFingerprint = async (
  client: CoreApiClient,
  sourceFingerprint: string,
): Promise<string | null> => {
  const normalized = normalizeString(sourceFingerprint);

  if (normalized === '') {
    throw new Error('sourceFingerprint is required');
  }

  const result = await client.query({
    giftStagings: {
      __args: {
        first: 1,
        filter: {
          sourceFingerprint: {
            eq: normalized,
          },
        },
      },
      edges: {
        node: {
          id: true,
        },
      },
    },
  } as any);

  const recordId = result?.giftStagings?.edges?.[0]?.node?.id;

  return typeof recordId === 'string' && recordId !== '' ? recordId : null;
};
