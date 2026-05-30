import type { CoreApiClient } from 'twenty-client-sdk/core';
import {
  STRIPE_INTAKE_SOURCE,
  STRIPE_PROVIDER,
  type StripeCheckoutSessionCompletedEvent,
  type StripeOneOffGiftStagingInput,
  type StripeOneOffGiftStagingResult,
} from 'src/stripe/stripe-intake.types';
import {
  buildGiftAidRawProviderEvidence,
  buildRawProviderEvidence,
  extractCheckoutSessionEvidence,
  extractStripeGiftAidEvidence,
  getSubscriptionIntervalEvidence,
} from 'src/stripe/stripe-intake-evidence';
import {
  findGiftStagingBySourceFingerprint,
} from 'src/stripe/stripe-gift-staging-repository';
import {
  formatUnixDate,
  getProviderPaymentId,
  getStripeObjectId,
  normalizeString,
  splitDonorName,
  toAmountMicros,
  toCurrencyCode,
} from 'src/stripe/stripe-intake-utils';

export {
  STRIPE_PROVIDER,
  type RawProviderEvidence,
  type StripeCheckoutSession,
  type StripeCheckoutSessionCompletedEvent,
  type StripeDonationFormGiftStagingUpdateResult,
  type StripeInvoiceObject,
  type StripeInvoicePaymentPaidEvent,
  type StripeOneOffStagingDependencies,
  type StripeOneOffGiftStagingResult,
  type StripePaymentEconomicsEvidence,
} from 'src/stripe/stripe-intake.types';
export {
  buildDonorMailingAddress,
  buildNormalizedMetadataMap,
  buildRawProviderEvidence,
  getRequiredMetadataValue,
  getSubscriptionIntervalEvidence,
} from 'src/stripe/stripe-intake-evidence';
export {
  formatUnixDate,
  getInvoiceCorrelationMetadata,
  getInvoiceSubscriptionId,
  getProviderPaymentId,
  getStripeObjectId,
  normalizeString,
} from 'src/stripe/stripe-intake-utils';
export {
  findGiftStagingById,
  findGiftStagingBySourceFingerprint,
  findGiftStagingRecordByProviderAgreementId,
  findGiftStagingRecordBySourceFingerprint,
} from 'src/stripe/stripe-gift-staging-repository';
export {
  getStripePaymentEconomicsRetriever,
} from 'src/stripe/stripe-payment-economics';

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

  const {
    donorName,
    donorEmail,
    donorPhone,
    donorMailingAddress,
    attributionEvidence,
    normalizedMetadata,
    normalizedCustomFields,
    fallbackCaptureDate,
  } = extractCheckoutSessionEvidence({ session, giftDateSource });
  const nameParts = splitDonorName(donorName);
  const providerPaymentId = getProviderPaymentId(session.payment_intent);
  const paymentProviderCustomerId = getStripeObjectId(session.customer);
  const providerAgreementId = getStripeObjectId(session.subscription);
  const intervalEvidence = getSubscriptionIntervalEvidence(session.subscription);
  const donationType = providerAgreementId ? 'RECURRING' : 'ONE_OFF';
  const giftAidEvidence = extractStripeGiftAidEvidence({
    session,
    donorFirstName: nameParts.donorFirstName,
    donorLastName: nameParts.donorLastName,
    donorMailingAddress,
    fallbackCaptureDate,
  });
  const giftAidRawProviderEvidence =
    buildGiftAidRawProviderEvidence(giftAidEvidence);
  const rawProviderEvidence = buildRawProviderEvidence({
    eventType: event.type,
    checkoutSessionId: externalId,
    ...(paymentProviderCustomerId
      ? { customerId: paymentProviderCustomerId }
      : {}),
    ...(providerPaymentId ? { paymentIntentId: providerPaymentId } : {}),
    ...(providerAgreementId ? { subscriptionId: providerAgreementId } : {}),
    ...(giftAidRawProviderEvidence ? { giftAid: giftAidRawProviderEvidence } : {}),
    donorName,
    donorEmail,
    donorPhone,
    donorMailingAddress,
    ...(normalizedMetadata ? { metadata: normalizedMetadata } : {}),
    ...(normalizedCustomFields ? { customFields: normalizedCustomFields } : {}),
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
    ...attributionEvidence,
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
