import type { MailingAddressEvidence } from 'src/gift-aid/gift-aid.types';
import { normalizeOnlineGiftAidEvidence } from 'src/gift-aid/online-gift-aid-evidence';
import {
  STRIPE_GIFT_AID_SOURCE,
  type RawProviderEvidence,
  type StripeCheckoutSession,
  type StripeCheckoutSessionCustomerDetails,
} from 'src/stripe/stripe-intake.types';
import {
  formatUnixDate,
  normalizeString,
} from 'src/stripe/stripe-intake-utils';

export const buildDonorMailingAddress = (
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

export const buildRawProviderEvidence = ({
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
  paymentEconomicsLookup,
  paymentEconomics,
  metadata,
  customFields,
}: {
  eventType: string;
  checkoutSessionId: string;
  customerId?: string;
  paymentIntentId?: string;
  subscriptionId?: string;
  giftAid?: RawProviderEvidence['giftAid'];
  donorName: string;
  donorEmail: string;
  donorPhone: string;
  donorMailingAddress?: MailingAddressEvidence;
  providerIntervalUnit?: string;
  providerIntervalCount?: number;
  paymentEconomicsLookup?: RawProviderEvidence['paymentEconomicsLookup'];
  paymentEconomics?: RawProviderEvidence['paymentEconomics'];
  metadata?: Record<string, string>;
  customFields?: Record<string, string>;
}): RawProviderEvidence => ({
  provider: 'STRIPE',
  eventType,
  checkoutSessionId,
  ...(customerId ? { customerId } : {}),
  ...(paymentIntentId ? { paymentIntentId } : {}),
  ...(subscriptionId ? { subscriptionId } : {}),
  ...(metadata ? { metadata } : {}),
  ...(customFields ? { customFields } : {}),
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
  ...(paymentEconomicsLookup ? { paymentEconomicsLookup } : {}),
  ...(paymentEconomics ? { paymentEconomics } : {}),
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

export const getRequiredMetadataValue = (
  session: StripeCheckoutSession,
  keys: string[],
): string | undefined => {
  const value = getMetadataValue(session, keys);

  return normalizeString(value) || undefined;
};

export const buildNormalizedMetadataMap = (
  metadata: StripeCheckoutSession['metadata'],
): Record<string, string> | undefined => {
  if (!metadata) {
    return undefined;
  }

  const normalizedEntries = Object.entries(metadata)
    .map(([key, value]) => [normalizeString(key), normalizeString(value)] as const)
    .filter(([key, value]) => key !== '' && value !== '');

  return normalizedEntries.length === 0
    ? undefined
    : Object.fromEntries(normalizedEntries);
};

export const buildNormalizedCustomFieldMap = (
  customFields: StripeCheckoutSession['custom_fields'],
): Record<string, string> | undefined => {
  if (!customFields || customFields.length === 0) {
    return undefined;
  }

  const normalizedEntries = customFields
    .map((field) => {
      const key = normalizeString(field?.key);
      const value =
        normalizeString(field?.text?.value) ||
        normalizeString(field?.dropdown?.value) ||
        normalizeString(field?.numeric?.value);

      return [key, value] as const;
    })
    .filter(([key, value]) => key !== '' && value !== '');

  return normalizedEntries.length === 0
    ? undefined
    : Object.fromEntries(normalizedEntries);
};

const getAttributionEvidenceValue = (
  session: StripeCheckoutSession,
  keys: string[],
): string | undefined =>
  getMetadataValue(session, keys) ??
  keys
    .map((key) => getCustomFieldValue(session, key))
    .find((value) => normalizeString(value) !== '');

export const extractStripeAttributionEvidence = (
  session: StripeCheckoutSession,
) => {
  const sourceAppealName = getAttributionEvidenceValue(session, [
    'appealName',
    'appeal_name',
    'appeal',
    'campaignName',
    'campaign_name',
    'campaign',
    'campaignLabel',
    'campaign_label',
    'pageName',
    'page_name',
    'pageTitle',
    'page_title',
  ]);
  const sourceFundName = getAttributionEvidenceValue(session, [
    'fundName',
    'fund_name',
    'fund',
    'fundLabel',
    'fund_label',
    'designation',
    'designationName',
    'designation_name',
    'designationLabel',
    'designation_label',
  ]);

  return {
    ...(sourceAppealName ? { sourceAppealName } : {}),
    ...(sourceFundName ? { sourceFundName } : {}),
  };
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

export const extractStripeGiftAidEvidence = ({
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

export const buildGiftAidRawProviderEvidence = (
  giftAidEvidence: ReturnType<typeof extractStripeGiftAidEvidence>,
): RawProviderEvidence['giftAid'] | undefined => {
  if (
    giftAidEvidence.giftAidRequested !== true &&
    giftAidEvidence.giftAidDeclarationCaptured !== true &&
    !normalizeString(giftAidEvidence.giftAidDeclarationDate) &&
    !normalizeString(giftAidEvidence.giftAidDeclarationSource) &&
    !normalizeString(giftAidEvidence.giftAidTextVersion) &&
    !normalizeString(giftAidEvidence.giftAidCoverageScope)
  ) {
    return undefined;
  }

  return {
    ...(giftAidEvidence.giftAidRequested === true ? { requested: true } : {}),
    ...(giftAidEvidence.giftAidDeclarationCaptured === true
      ? { declarationCaptured: true }
      : {}),
    ...(normalizeString(giftAidEvidence.giftAidDeclarationDate)
      ? { declarationDate: normalizeString(giftAidEvidence.giftAidDeclarationDate) }
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
    ...(normalizeString(giftAidEvidence.giftAidCoverageScope)
      ? { coverageScope: normalizeString(giftAidEvidence.giftAidCoverageScope) }
      : {}),
  };
};

export const getSubscriptionIntervalEvidence = (
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

export const extractCheckoutSessionEvidence = ({
  session,
  giftDateSource,
}: {
  session: StripeCheckoutSession;
  giftDateSource: number;
}) => {
  const donorName = normalizeString(session.customer_details?.name);
  const donorEmail = normalizeString(session.customer_details?.email);
  const donorPhone = normalizeString(session.customer_details?.phone);
  const donorMailingAddress = buildDonorMailingAddress(
    session.customer_details?.address,
  );

  return {
    donorName,
    donorEmail,
    donorPhone,
    donorMailingAddress,
    attributionEvidence: extractStripeAttributionEvidence(session),
    normalizedMetadata: buildNormalizedMetadataMap(session.metadata),
    normalizedCustomFields: buildNormalizedCustomFieldMap(session.custom_fields),
    fallbackCaptureDate: formatUnixDate(giftDateSource),
  };
};
