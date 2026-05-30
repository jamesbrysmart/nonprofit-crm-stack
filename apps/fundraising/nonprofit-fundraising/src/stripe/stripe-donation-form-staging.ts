import { CoreApiClient } from 'twenty-client-sdk/core';
import {
  type RawProviderEvidence,
  STRIPE_PROVIDER,
  type StripeCheckoutSessionCompletedEvent,
  type StripeDonationFormGiftStagingUpdateResult,
  type StripeInvoicePaymentPaidEvent,
  type StripeOneOffStagingDependencies,
  type StripePaymentEconomicsEvidence,
  buildDonorMailingAddress,
  buildNormalizedMetadataMap,
  buildRawProviderEvidence,
  findGiftStagingById,
  findGiftStagingRecordByProviderAgreementId,
  findGiftStagingRecordBySourceFingerprint,
  formatUnixDate,
  getInvoiceCorrelationMetadata,
  getInvoiceSubscriptionId,
  getProviderPaymentId,
  getRequiredMetadataValue,
  getStripeObjectId,
  getStripePaymentEconomicsRetriever,
  getSubscriptionIntervalEvidence,
  normalizeString,
} from 'src/stripe/stripe-one-off-staging';

type DonationFormGiftStagingLocator = {
  giftStagingId?: string | null;
  sourceFingerprint?: string | null;
  providerAgreementId?: string | null;
};

type GiftStagingLookupRecord = {
  id: string;
  rawProviderEvidence?: Record<string, unknown> | null;
};

const findDonationFormGiftStagingRecord = async (
  client: CoreApiClient,
  locator: DonationFormGiftStagingLocator,
): Promise<GiftStagingLookupRecord | null> => {
  const metadataGiftStagingId = normalizeString(locator.giftStagingId);
  const sourceFingerprint = normalizeString(locator.sourceFingerprint);
  const providerAgreementId = normalizeString(locator.providerAgreementId);

  return (
    (metadataGiftStagingId !== ''
      ? await findGiftStagingById(client, metadataGiftStagingId)
      : null) ??
    (sourceFingerprint !== ''
      ? await findGiftStagingRecordBySourceFingerprint(client, sourceFingerprint)
      : null) ??
    (providerAgreementId !== ''
      ? await findGiftStagingRecordByProviderAgreementId(
          client,
          providerAgreementId,
        )
      : null)
  );
};

const updateDonationFormGiftStagingRecord = async ({
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

const mergeDonationFormRawProviderEvidence = ({
  existing,
  webhookEvidence,
  paymentLifecycle,
}: {
  existing?: Record<string, unknown>;
  webhookEvidence: RawProviderEvidence;
  paymentLifecycle: 'AWAITING_PAYMENT' | 'PAYMENT_CONFIRMED';
}): Record<string, unknown> => ({
  ...(existing ?? {}),
  ...webhookEvidence,
  paymentLifecycle,
  ...(existing?.submittedGiftAid &&
  !('submittedGiftAid' in webhookEvidence)
    ? {
        submittedGiftAid: existing.submittedGiftAid,
      }
    : {}),
  ...(existing?.attribution && !('attribution' in webhookEvidence)
    ? {
        attribution: existing.attribution,
      }
    : {}),
});

export const updateStripeDonationFormGiftStagingWithDependencies = async (
  client: CoreApiClient,
  event: StripeCheckoutSessionCompletedEvent,
  dependencies: StripeOneOffStagingDependencies = {},
): Promise<StripeDonationFormGiftStagingUpdateResult> => {
  if (event.type !== 'checkout.session.completed') {
    throw new Error(
      'Stripe donation-form staging update only supports checkout.session.completed',
    );
  }

  const session = event.data?.object;
  if (!session) {
    throw new Error(
      'Stripe checkout.session.completed event is missing data.object',
    );
  }

  const externalId = normalizeString(session.id);
  const providerEventId = normalizeString(event.id);
  const sourceFingerprint = getRequiredMetadataValue(session, [
    'sourceFingerprint',
  ]);
  const metadataGiftStagingId = getRequiredMetadataValue(session, [
    'giftStagingId',
  ]);

  if (externalId === '') {
    throw new Error('Stripe checkout session id is required');
  }

  if (providerEventId === '') {
    throw new Error('Stripe event id is required');
  }

  if (!sourceFingerprint) {
    throw new Error(
      'Stripe donation-form checkout session is missing sourceFingerprint metadata',
    );
  }

  const existingGiftStaging = await findDonationFormGiftStagingRecord(client, {
    giftStagingId: metadataGiftStagingId,
    sourceFingerprint,
  });

  if (!existingGiftStaging) {
    return {
      updated: false,
      reason: 'MISSING_PREPAYMENT_GIFT_STAGING',
      sourceFingerprint,
      externalId,
      providerEventId,
    };
  }

  const providerPaymentId = getProviderPaymentId(session.payment_intent);
  const paymentProviderCustomerId = getStripeObjectId(session.customer);
  const providerAgreementId = getStripeObjectId(session.subscription);
  const paymentConfirmedAtCheckout = !providerAgreementId;
  const intervalEvidence = getSubscriptionIntervalEvidence(session.subscription);
  const normalizedMetadata = buildNormalizedMetadataMap(session.metadata);
  const donorMailingAddress = buildDonorMailingAddress(
    session.customer_details?.address,
  );
  const donorName = normalizeString(session.customer_details?.name);
  const donorEmail = normalizeString(session.customer_details?.email);
  const donorPhone = normalizeString(session.customer_details?.phone);
  const giftDateSource = session.created ?? event.created;
  const paymentEconomicsRetriever =
    dependencies.paymentEconomicsRetriever ??
    (await getStripePaymentEconomicsRetriever());
  let paymentEconomics: StripePaymentEconomicsEvidence | null = null;

  if (paymentEconomicsRetriever) {
    try {
      if (!providerAgreementId || providerPaymentId) {
        paymentEconomics =
          await paymentEconomicsRetriever.retrievePaymentEconomics(session);
      }
    } catch (error) {
      console.warn(
        JSON.stringify({
          event: 'stripe_payment_economics_lookup_failed',
          checkoutSessionId: externalId,
          providerEventId,
          ...(providerAgreementId ? { subscriptionId: providerAgreementId } : {}),
          message: error instanceof Error ? error.message : String(error),
        }),
      );
    }
  }

  const resolvedProviderPaymentId =
    providerPaymentId ?? paymentEconomics?.paymentIntentId;

  const webhookProviderEvidence = buildRawProviderEvidence({
    eventType: event.type,
    checkoutSessionId: externalId,
    ...(paymentProviderCustomerId
      ? { customerId: paymentProviderCustomerId }
      : {}),
    ...(resolvedProviderPaymentId
      ? { paymentIntentId: resolvedProviderPaymentId }
      : {}),
    ...(providerAgreementId ? { subscriptionId: providerAgreementId } : {}),
    donorName,
    donorEmail,
    donorPhone,
    donorMailingAddress,
    ...(normalizedMetadata ? { metadata: normalizedMetadata } : {}),
    ...(intervalEvidence.providerIntervalUnit
      ? { providerIntervalUnit: intervalEvidence.providerIntervalUnit }
      : {}),
    ...(typeof intervalEvidence.providerIntervalCount === 'number'
      ? { providerIntervalCount: intervalEvidence.providerIntervalCount }
      : {}),
    ...(paymentEconomics ? { paymentEconomics } : {}),
  });

  await updateDonationFormGiftStagingRecord({
    client,
    giftStagingId: existingGiftStaging.id,
    data: {
      externalId,
      providerEventId,
      provider: STRIPE_PROVIDER,
      ...(resolvedProviderPaymentId
        ? { providerPaymentId: resolvedProviderPaymentId }
        : {}),
      ...(paymentEconomics?.grossPaymentAmount
        ? { grossPaymentAmount: paymentEconomics.grossPaymentAmount }
        : {}),
      ...(paymentEconomics?.processingFeeAmount
        ? {
            processingFeeAmount: paymentEconomics.processingFeeAmount,
          }
        : {}),
      ...(paymentEconomics?.netReceivedAmount
        ? { netReceivedAmount: paymentEconomics.netReceivedAmount }
        : {}),
      ...(paymentProviderCustomerId ? { paymentProviderCustomerId } : {}),
      ...(providerAgreementId ? { providerAgreementId } : {}),
      ...(intervalEvidence.providerIntervalUnit
        ? { providerIntervalUnit: intervalEvidence.providerIntervalUnit }
        : {}),
      ...(typeof intervalEvidence.providerIntervalCount === 'number'
        ? { providerIntervalCount: intervalEvidence.providerIntervalCount }
        : {}),
      ...(typeof giftDateSource === 'number' && giftDateSource > 0
        ? { giftDate: formatUnixDate(giftDateSource) }
        : {}),
      ...(paymentConfirmedAtCheckout
        ? { paymentState: 'PAYMENT_CONFIRMED' }
        : {}),
      rawProviderEvidence: mergeDonationFormRawProviderEvidence({
        existing: existingGiftStaging.rawProviderEvidence ?? undefined,
        webhookEvidence: webhookProviderEvidence,
        paymentLifecycle: paymentConfirmedAtCheckout
          ? 'PAYMENT_CONFIRMED'
          : 'AWAITING_PAYMENT',
      }),
    },
  });

  return {
    updated: true,
    giftStagingId: existingGiftStaging.id,
    sourceFingerprint,
    externalId,
  };
};

export const updateStripeDonationFormGiftStaging = async (
  client: CoreApiClient,
  event: StripeCheckoutSessionCompletedEvent,
): Promise<StripeDonationFormGiftStagingUpdateResult> =>
  updateStripeDonationFormGiftStagingWithDependencies(client, event);

export const updateStripeDonationFormRecurringInvoicePaymentGiftStagingWithDependencies =
  async (
    client: CoreApiClient,
    event: StripeInvoicePaymentPaidEvent,
    dependencies: StripeOneOffStagingDependencies = {},
): Promise<StripeDonationFormGiftStagingUpdateResult> => {
    if (event.type !== 'invoice_payment.paid') {
      throw new Error(
        'Stripe recurring donation-form invoice payment update only supports invoice_payment.paid',
      );
    }

    const invoicePayment = event.data?.object;
    if (!invoicePayment) {
      throw new Error(
        'Stripe invoice_payment.paid event is missing data.object',
      );
    }

    const externalId = normalizeString(invoicePayment.id);
    const providerEventId = normalizeString(event.id);

    if (externalId === '') {
      throw new Error('Stripe invoice payment id is required');
    }

    if (providerEventId === '') {
      throw new Error('Stripe event id is required');
    }

    const paymentEconomicsRetriever =
      dependencies.paymentEconomicsRetriever ??
      (await getStripePaymentEconomicsRetriever());
    const hydratedInvoicePayment =
      paymentEconomicsRetriever
        ? await paymentEconomicsRetriever.retrieveInvoicePaymentById(externalId)
        : null;
    const invoicePaymentForEconomics = hydratedInvoicePayment ?? invoicePayment;
    const invoiceId = getStripeObjectId(invoicePaymentForEconomics.invoice);

    if (!invoiceId) {
      return {
        updated: false,
        reason: 'MISSING_PREPAYMENT_GIFT_STAGING',
        sourceFingerprint: providerEventId,
        externalId,
        providerEventId,
      };
    }

    const hydratedInvoice =
      paymentEconomicsRetriever
        ? await paymentEconomicsRetriever.retrieveInvoiceById(invoiceId)
        : null;
    const invoiceForCorrelation =
      hydratedInvoice ??
      (invoicePaymentForEconomics.invoice &&
      typeof invoicePaymentForEconomics.invoice === 'object'
        ? invoicePaymentForEconomics.invoice
        : null);
    const providerAgreementId = getInvoiceSubscriptionId(invoiceForCorrelation);

    if (!providerAgreementId || !invoiceForCorrelation) {
      return {
        updated: false,
        reason: 'MISSING_PREPAYMENT_GIFT_STAGING',
        sourceFingerprint: providerEventId,
        externalId,
        providerEventId,
      };
    }

    const directInvoiceMetadata = getInvoiceCorrelationMetadata(
      invoiceForCorrelation,
    );
    const invoiceMetadata = directInvoiceMetadata
      ? directInvoiceMetadata
      : paymentEconomicsRetriever
        ? await paymentEconomicsRetriever.findSubscriptionMetadata(
            providerAgreementId,
          )
        : null;
    const sourceFingerprint = normalizeString(invoiceMetadata?.sourceFingerprint);
    const metadataGiftStagingId = normalizeString(invoiceMetadata?.giftStagingId);
    const existingGiftStaging = await findDonationFormGiftStagingRecord(client, {
      giftStagingId: metadataGiftStagingId,
      sourceFingerprint,
      providerAgreementId,
    });

    if (!existingGiftStaging) {
      return {
        updated: false,
        reason: 'MISSING_PREPAYMENT_GIFT_STAGING',
        sourceFingerprint:
          sourceFingerprint !== '' ? sourceFingerprint : providerAgreementId,
        externalId,
        providerEventId,
      };
    }

    const paymentIntentId = getStripeObjectId(
      invoicePaymentForEconomics.payment?.payment_intent,
    );
    let paymentEconomics: StripePaymentEconomicsEvidence | null = null;

    if (paymentEconomicsRetriever && paymentIntentId) {
      try {
        paymentEconomics =
          await paymentEconomicsRetriever.retrievePaymentEconomicsFromPaymentIntentId(
            paymentIntentId,
          );
      } catch (error) {
        console.warn(
          JSON.stringify({
            event: 'stripe_recurring_invoice_payment_paid_economics_lookup_failed',
            invoicePaymentId: externalId,
            invoiceId,
            providerAgreementId,
            providerEventId,
            message: error instanceof Error ? error.message : String(error),
          }),
        );
      }
    }

    const webhookProviderEvidence: RawProviderEvidence = {
      provider: 'STRIPE',
      eventType: event.type,
      invoiceId,
      ...(sourceFingerprint !== '' ? { sourceFingerprint } : {}),
      subscriptionId: providerAgreementId,
      ...(paymentIntentId ? { paymentIntentId } : {}),
      ...(invoiceMetadata
        ? {
            metadata: Object.fromEntries(
              Object.entries(invoiceMetadata).filter(
                ([key, value]) =>
                  normalizeString(key) !== '' && normalizeString(value) !== '',
              ),
            ),
          }
        : {}),
      ...(paymentEconomics ? { paymentEconomics } : {}),
      paymentEconomicsLookup: {
        attempted: true,
        path: 'invoice_payment.payment.payment_intent',
        latestInvoiceId: invoiceId,
        ...(paymentIntentId
          ? { paymentIntentId, paymentIntentIdFound: true }
          : { reason: 'missing_payment_intent_on_invoice_payment' }),
        ...(paymentEconomics?.latestChargeId
          ? {
              latestChargeId: paymentEconomics.latestChargeId,
              latestChargeIdFound: true,
            }
          : {}),
        ...(paymentEconomics?.balanceTransactionId
          ? {
              balanceTransactionId: paymentEconomics.balanceTransactionId,
              balanceTransactionIdFound: true,
            }
          : {}),
      },
    };

    await updateDonationFormGiftStagingRecord({
      client,
      giftStagingId: existingGiftStaging.id,
      data: {
        providerEventId,
        provider: STRIPE_PROVIDER,
        providerAgreementId,
        ...(paymentIntentId ? { providerPaymentId: paymentIntentId } : {}),
        ...(paymentEconomics?.grossPaymentAmount
          ? { grossPaymentAmount: paymentEconomics.grossPaymentAmount }
          : {}),
        ...(paymentEconomics?.processingFeeAmount
          ? {
              processingFeeAmount: paymentEconomics.processingFeeAmount,
            }
          : {}),
        ...(paymentEconomics?.netReceivedAmount
          ? { netReceivedAmount: paymentEconomics.netReceivedAmount }
          : {}),
        paymentState: 'PAYMENT_CONFIRMED',
        rawProviderEvidence: mergeDonationFormRawProviderEvidence({
          existing: existingGiftStaging.rawProviderEvidence ?? undefined,
          webhookEvidence: webhookProviderEvidence,
          paymentLifecycle: 'PAYMENT_CONFIRMED',
        }),
      },
    });

    return {
      updated: true,
      giftStagingId: existingGiftStaging.id,
      sourceFingerprint:
        sourceFingerprint !== '' ? sourceFingerprint : providerAgreementId,
      externalId,
    };
  };

export const updateStripeDonationFormRecurringInvoicePaymentGiftStaging = async (
  client: CoreApiClient,
  event: StripeInvoicePaymentPaidEvent,
): Promise<StripeDonationFormGiftStagingUpdateResult> =>
  updateStripeDonationFormRecurringInvoicePaymentGiftStagingWithDependencies(
    client,
    event,
  );
