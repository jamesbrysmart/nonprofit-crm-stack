import Stripe from 'stripe';
import {
  type PaymentEconomicsCurrencyAmount,
  type StripeCheckoutSession,
  type StripeInvoiceObject,
  type StripeInvoicePaymentPaidObject,
  type StripePaymentEconomicsEvidence,
  type StripePaymentEconomicsRetriever,
} from 'src/stripe/stripe-intake.types';
import {
  getProviderPaymentId,
  getStripeObjectId,
  normalizeString,
  toCurrencyCode,
} from 'src/stripe/stripe-intake-utils';

const resolveStripeApiKey = (): string => {
  const apiKey = normalizeString(
    process.env.STRIPE_SECRET_KEY,
  );

  if (apiKey === '') {
    throw new Error('Stripe secret key is not configured');
  }

  return apiKey;
};

const buildCurrencyAmountFromMinorUnits = ({
  amountMinorUnits,
  currency,
}: {
  amountMinorUnits: number | null | undefined;
  currency: string | null | undefined;
}): PaymentEconomicsCurrencyAmount | null => {
  if (!Number.isInteger(amountMinorUnits)) {
    return null;
  }

  return {
    amountMicros: amountMinorUnits * 10_000,
    currencyCode: toCurrencyCode(currency),
  };
};

const createStripePaymentEconomicsRetriever = (
  apiKey: string,
): StripePaymentEconomicsRetriever => {
  const stripe = new Stripe(apiKey);

  const retrievePaymentEconomicsFromPaymentIntentId = async (
    paymentIntentId: string,
  ): Promise<StripePaymentEconomicsEvidence | null> => {
    const normalizedPaymentIntentId = normalizeString(paymentIntentId);

    if (normalizedPaymentIntentId === '') {
      return null;
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(
      normalizedPaymentIntentId,
    );

    const latestChargeRef = paymentIntent.latest_charge;
    const latestChargeId =
      typeof latestChargeRef === 'string'
        ? normalizeString(latestChargeRef) || undefined
        : normalizeString(latestChargeRef?.id) || undefined;

    const charge =
      latestChargeId !== undefined
        ? await stripe.charges.retrieve(latestChargeId, {
            expand: ['balance_transaction'],
          })
        : null;

    const balanceTransactionRef = charge?.balance_transaction;
    const balanceTransactionId =
      typeof balanceTransactionRef === 'string'
        ? normalizeString(balanceTransactionRef) || undefined
        : normalizeString(balanceTransactionRef?.id) || undefined;

    const balanceTransaction =
      typeof balanceTransactionRef === 'string'
        ? await stripe.balanceTransactions.retrieve(balanceTransactionRef)
        : balanceTransactionRef ?? null;

    const grossPaymentAmount = balanceTransaction
      ? buildCurrencyAmountFromMinorUnits({
          amountMinorUnits: balanceTransaction.amount,
          currency: balanceTransaction.currency,
        })
      : buildCurrencyAmountFromMinorUnits({
          amountMinorUnits: charge?.amount,
          currency: charge?.currency,
        });

    const processingFeeAmount = balanceTransaction
      ? buildCurrencyAmountFromMinorUnits({
          amountMinorUnits: balanceTransaction.fee,
          currency: balanceTransaction.currency,
        })
      : null;

    const netReceivedAmount = balanceTransaction
      ? buildCurrencyAmountFromMinorUnits({
          amountMinorUnits: balanceTransaction.net,
          currency: balanceTransaction.currency,
        })
      : null;

    return {
      paymentIntentId: normalizedPaymentIntentId,
      ...(latestChargeId ? { latestChargeId } : {}),
      ...(balanceTransactionId ? { balanceTransactionId } : {}),
      ...(grossPaymentAmount ? { grossPaymentAmount } : {}),
      ...(processingFeeAmount ? { processingFeeAmount } : {}),
      ...(netReceivedAmount ? { netReceivedAmount } : {}),
    };
  };

  return {
    retrievePaymentEconomics: async (
      session: StripeCheckoutSession,
    ): Promise<StripePaymentEconomicsEvidence | null> => {
      let paymentIntentId = getProviderPaymentId(session.payment_intent);

      if (!paymentIntentId) {
        const subscriptionId = getStripeObjectId(session.subscription);

        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(
            subscriptionId,
            {
              expand: ['latest_invoice.payment_intent'],
            },
          );

          const latestInvoice = subscription.latest_invoice;

          if (latestInvoice && typeof latestInvoice !== 'string') {
            paymentIntentId = getProviderPaymentId(latestInvoice.payment_intent);
          }
        }
      }

      return paymentIntentId
        ? retrievePaymentEconomicsFromPaymentIntentId(paymentIntentId)
        : null;
    },
    retrievePaymentEconomicsFromPaymentIntentId,
    retrieveInvoiceById: async (
      invoiceId: string,
    ): Promise<StripeInvoiceObject | null> => {
      const normalizedInvoiceId = normalizeString(invoiceId);

      if (normalizedInvoiceId === '') {
        return null;
      }

      const invoice = await stripe.invoices.retrieve(normalizedInvoiceId, {
        expand: ['lines.data', 'parent.subscription_details.subscription'],
      });

      return invoice as unknown as StripeInvoiceObject;
    },
    retrieveInvoicePaymentById: async (
      invoicePaymentId: string,
    ): Promise<StripeInvoicePaymentPaidObject | null> => {
      const normalizedInvoicePaymentId = normalizeString(invoicePaymentId);

      if (normalizedInvoicePaymentId === '') {
        return null;
      }

      const invoicePayment = await stripe.invoicePayments.retrieve(
        normalizedInvoicePaymentId,
        {
          expand: ['invoice', 'payment.payment_intent'],
        },
      );

      return invoicePayment as unknown as StripeInvoicePaymentPaidObject;
    },
    findSubscriptionMetadata: async (
      subscriptionId: string,
    ): Promise<Record<string, string | null | undefined> | null> => {
      const normalizedSubscriptionId = normalizeString(subscriptionId);

      if (normalizedSubscriptionId === '') {
        return null;
      }

      const subscription =
        await stripe.subscriptions.retrieve(normalizedSubscriptionId);

      return subscription.metadata ?? null;
    },
  };
};

export const getStripePaymentEconomicsRetriever =
  async (): Promise<StripePaymentEconomicsRetriever | null> => {
    try {
      const apiKey = resolveStripeApiKey();

      return createStripePaymentEconomicsRetriever(apiKey);
    } catch {
      return null;
    }
  };
