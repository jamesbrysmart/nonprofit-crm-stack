import { describe, expect, it, vi } from 'vitest';
import { CoreApiClient } from 'twenty-client-sdk/core';

import {
  buildStripeOneOffGiftStagingInput,
  type StripeCheckoutSessionCompletedEvent,
} from 'src/stripe/stripe-one-off-staging';
import {
  updateStripeDonationFormGiftStaging,
  updateStripeDonationFormGiftStagingWithDependencies,
  updateStripeDonationFormRecurringInvoicePaymentGiftStagingWithDependencies,
} from 'src/stripe/stripe-donation-form-staging';

const buildEvent = (
  overrides: Partial<StripeCheckoutSessionCompletedEvent> = {},
): StripeCheckoutSessionCompletedEvent => ({
  id: 'evt_test_123',
  type: 'checkout.session.completed',
  created: 1777198422,
  data: {
    object: {
      id: 'cs_test_123',
      amount_total: 2500,
      currency: 'gbp',
      created: 1777198410,
      customer: 'cus_123',
      customer_details: {
        email: 'ada@example.com',
        name: 'Ada Lovelace',
        phone: '+44 20 7946 0958',
        address: {
          line1: '12 Analytical Engine Row',
          city: 'London',
          postal_code: 'SW1A 1AA',
          country: 'gb',
        },
      },
      payment_intent: 'pi_123',
    },
  },
  ...overrides,
});

describe('updateStripeDonationFormGiftStaging', () => {
  it('merges webhook evidence onto existing pre-payment raw provider evidence', async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce({
        giftStaging: {
          id: 'gift-staging-prepayment',
          rawProviderEvidence: {
            provider: 'STRIPE',
            flow: 'DONATION_FORM',
            paymentLifecycle: 'AWAITING_PAYMENT',
            attribution: {
              referrer: 'https://example.org/campaign',
            },
            submittedGiftAid: {
              requested: true,
              declarationSource: 'donation_form_embed',
            },
          },
        },
      });
    const mutation = vi.fn().mockResolvedValue({
      updateGiftStaging: {
        id: 'gift-staging-prepayment',
      },
    });
    const client = {
      query,
      mutation,
    } as unknown as CoreApiClient;

    const result = await updateStripeDonationFormGiftStaging(client, {
      id: 'evt_form_complete',
      type: 'checkout.session.completed',
      created: 1777198422,
      data: {
        object: {
          id: 'cs_form_complete',
          amount_total: 2500,
          currency: 'gbp',
          created: 1777198410,
          customer: 'cus_form_complete',
          customer_details: {
            email: 'ada@example.com',
            name: 'Ada Lovelace',
          },
          payment_intent: 'pi_form_complete',
          metadata: {
            sourceFingerprint: 'dfs_form_complete',
            giftStagingId: 'gift-staging-prepayment',
          },
        },
      },
    });

    expect(result).toEqual({
      updated: true,
      giftStagingId: 'gift-staging-prepayment',
      sourceFingerprint: 'dfs_form_complete',
      externalId: 'cs_form_complete',
    });
    expect(mutation).toHaveBeenCalledOnce();
    expect(mutation.mock.calls[0]?.[0]).toEqual({
      updateGiftStaging: {
        __args: {
          id: 'gift-staging-prepayment',
          data: {
            externalId: 'cs_form_complete',
            providerEventId: 'evt_form_complete',
            provider: 'STRIPE',
            providerPaymentId: 'pi_form_complete',
            paymentProviderCustomerId: 'cus_form_complete',
            giftDate: '2026-04-26',
            paymentState: 'PAYMENT_CONFIRMED',
            rawProviderEvidence: {
              provider: 'STRIPE',
              flow: 'DONATION_FORM',
              paymentLifecycle: 'PAYMENT_CONFIRMED',
              eventType: 'checkout.session.completed',
              checkoutSessionId: 'cs_form_complete',
              customerId: 'cus_form_complete',
              paymentIntentId: 'pi_form_complete',
              metadata: {
                sourceFingerprint: 'dfs_form_complete',
                giftStagingId: 'gift-staging-prepayment',
              },
              customerDetails: {
                name: 'Ada Lovelace',
                email: 'ada@example.com',
              },
              attribution: {
                referrer: 'https://example.org/campaign',
              },
              submittedGiftAid: {
                requested: true,
                declarationSource: 'donation_form_embed',
              },
            },
          },
        },
        id: true,
      },
    });
  });

  it('persists recurring agreement evidence onto the existing donation-form staging row', async () => {
    const query = vi.fn().mockResolvedValueOnce({
      giftStaging: {
        id: 'gift-staging-recurring',
        rawProviderEvidence: {
          provider: 'STRIPE',
          flow: 'DONATION_FORM',
          paymentLifecycle: 'AWAITING_PAYMENT',
          donationType: 'RECURRING',
          recurring: {
            intervalUnit: 'month',
            intervalCount: 1,
          },
        },
      },
    });
    const mutation = vi.fn().mockResolvedValue({
      updateGiftStaging: {
        id: 'gift-staging-recurring',
      },
    });
    const client = {
      query,
      mutation,
    } as unknown as CoreApiClient;

    const result = await updateStripeDonationFormGiftStaging(client, {
      id: 'evt_form_recurring_complete',
      type: 'checkout.session.completed',
      created: 1777198422,
      data: {
        object: {
          id: 'cs_form_recurring_complete',
          amount_total: 2500,
          currency: 'gbp',
          created: 1777198410,
          customer: 'cus_form_recurring_complete',
          customer_details: {
            email: 'ada@example.com',
            name: 'Ada Lovelace',
          },
          payment_intent: 'pi_form_recurring_complete',
          subscription: 'sub_form_recurring_complete',
          metadata: {
            sourceFingerprint: 'dfs_form_recurring_complete',
            giftStagingId: 'gift-staging-recurring',
          },
        },
      },
    });

    expect(result).toEqual({
      updated: true,
      giftStagingId: 'gift-staging-recurring',
      sourceFingerprint: 'dfs_form_recurring_complete',
      externalId: 'cs_form_recurring_complete',
    });
    expect(mutation).toHaveBeenCalledOnce();
    expect(mutation.mock.calls[0]?.[0]).toEqual({
      updateGiftStaging: {
        __args: {
          id: 'gift-staging-recurring',
          data: {
            externalId: 'cs_form_recurring_complete',
            providerEventId: 'evt_form_recurring_complete',
            provider: 'STRIPE',
            providerPaymentId: 'pi_form_recurring_complete',
            paymentProviderCustomerId: 'cus_form_recurring_complete',
            providerAgreementId: 'sub_form_recurring_complete',
            giftDate: '2026-04-26',
            rawProviderEvidence: {
              provider: 'STRIPE',
              flow: 'DONATION_FORM',
              paymentLifecycle: 'AWAITING_PAYMENT',
              donationType: 'RECURRING',
              recurring: {
                intervalUnit: 'month',
                intervalCount: 1,
              },
              eventType: 'checkout.session.completed',
              checkoutSessionId: 'cs_form_recurring_complete',
              customerId: 'cus_form_recurring_complete',
              paymentIntentId: 'pi_form_recurring_complete',
              subscriptionId: 'sub_form_recurring_complete',
              metadata: {
                sourceFingerprint: 'dfs_form_recurring_complete',
                giftStagingId: 'gift-staging-recurring',
              },
              customerDetails: {
                name: 'Ada Lovelace',
                email: 'ada@example.com',
              },
            },
          },
        },
        id: true,
      },
    });
  });

  it('maps Stripe payment economics from balance transaction evidence onto the existing staging row', async () => {
    const query = vi.fn().mockResolvedValueOnce({
      giftStaging: {
        id: 'gift-staging-economics',
        rawProviderEvidence: {
          provider: 'STRIPE',
          flow: 'DONATION_FORM',
          paymentLifecycle: 'AWAITING_PAYMENT',
        },
      },
    });
    const mutation = vi.fn().mockResolvedValue({
      updateGiftStaging: {
        id: 'gift-staging-economics',
      },
    });
    const client = {
      query,
      mutation,
    } as unknown as CoreApiClient;
    const paymentEconomicsRetriever = {
      retrievePaymentEconomics: vi.fn().mockResolvedValue({
        paymentIntentId: 'pi_form_economics',
        latestChargeId: 'ch_form_economics',
        balanceTransactionId: 'txn_form_economics',
        grossPaymentAmount: {
          amountMicros: 25_000_000,
          currencyCode: 'GBP',
        },
        processingFeeAmount: {
          amountMicros: 500_000,
          currencyCode: 'GBP',
        },
        netReceivedAmount: {
          amountMicros: 24_500_000,
          currencyCode: 'GBP',
        },
      }),
    };

    const result = await updateStripeDonationFormGiftStagingWithDependencies(
      client,
      {
        id: 'evt_form_economics',
        type: 'checkout.session.completed',
        created: 1777198422,
        data: {
          object: {
            id: 'cs_form_economics',
            amount_total: 2500,
            currency: 'gbp',
            created: 1777198410,
            customer: 'cus_form_economics',
            customer_details: {
              email: 'ada@example.com',
              name: 'Ada Lovelace',
            },
            payment_intent: 'pi_form_economics',
            metadata: {
              sourceFingerprint: 'dfs_form_economics',
              giftStagingId: 'gift-staging-economics',
            },
          },
        },
      },
      {
        paymentEconomicsRetriever,
      },
    );

    expect(result).toEqual({
      updated: true,
      giftStagingId: 'gift-staging-economics',
      sourceFingerprint: 'dfs_form_economics',
      externalId: 'cs_form_economics',
    });
    expect(paymentEconomicsRetriever.retrievePaymentEconomics).toHaveBeenCalledOnce();
    expect(mutation.mock.calls[0]?.[0]).toEqual({
      updateGiftStaging: {
        __args: {
          id: 'gift-staging-economics',
          data: {
            externalId: 'cs_form_economics',
            providerEventId: 'evt_form_economics',
            provider: 'STRIPE',
            providerPaymentId: 'pi_form_economics',
            grossPaymentAmount: {
              amountMicros: 25_000_000,
              currencyCode: 'GBP',
            },
            processingFeeAmount: {
              amountMicros: 500_000,
              currencyCode: 'GBP',
            },
            netReceivedAmount: {
              amountMicros: 24_500_000,
              currencyCode: 'GBP',
            },
            paymentProviderCustomerId: 'cus_form_economics',
            giftDate: '2026-04-26',
            paymentState: 'PAYMENT_CONFIRMED',
            rawProviderEvidence: {
              provider: 'STRIPE',
              flow: 'DONATION_FORM',
              paymentLifecycle: 'PAYMENT_CONFIRMED',
              eventType: 'checkout.session.completed',
              checkoutSessionId: 'cs_form_economics',
              customerId: 'cus_form_economics',
              paymentIntentId: 'pi_form_economics',
              metadata: {
                sourceFingerprint: 'dfs_form_economics',
                giftStagingId: 'gift-staging-economics',
              },
              customerDetails: {
                name: 'Ada Lovelace',
                email: 'ada@example.com',
              },
              paymentEconomics: {
                paymentIntentId: 'pi_form_economics',
                latestChargeId: 'ch_form_economics',
                balanceTransactionId: 'txn_form_economics',
                grossPaymentAmount: {
                  amountMicros: 25_000_000,
                  currencyCode: 'GBP',
                },
                processingFeeAmount: {
                  amountMicros: 500_000,
                  currencyCode: 'GBP',
                },
                netReceivedAmount: {
                  amountMicros: 24_500_000,
                  currencyCode: 'GBP',
                },
              },
            },
          },
        },
        id: true,
      },
    });
  });

  it('keeps confirmation flowing when Stripe payment economics are unavailable', async () => {
    const query = vi.fn().mockResolvedValueOnce({
      giftStaging: {
        id: 'gift-staging-no-economics',
        rawProviderEvidence: {
          provider: 'STRIPE',
          flow: 'DONATION_FORM',
          paymentLifecycle: 'AWAITING_PAYMENT',
        },
      },
    });
    const mutation = vi.fn().mockResolvedValue({
      updateGiftStaging: {
        id: 'gift-staging-no-economics',
      },
    });
    const client = {
      query,
      mutation,
    } as unknown as CoreApiClient;
    const paymentEconomicsRetriever = {
      retrievePaymentEconomics: vi.fn().mockResolvedValue(null),
    };

    await updateStripeDonationFormGiftStagingWithDependencies(
      client,
      {
        id: 'evt_form_no_economics',
        type: 'checkout.session.completed',
        created: 1777198422,
        data: {
          object: {
            id: 'cs_form_no_economics',
            amount_total: 2500,
            currency: 'gbp',
            created: 1777198410,
            customer: 'cus_form_no_economics',
            customer_details: {
              email: 'ada@example.com',
              name: 'Ada Lovelace',
            },
            payment_intent: 'pi_form_no_economics',
            metadata: {
              sourceFingerprint: 'dfs_form_no_economics',
              giftStagingId: 'gift-staging-no-economics',
            },
          },
        },
      },
      {
        paymentEconomicsRetriever,
      },
    );

    expect(paymentEconomicsRetriever.retrievePaymentEconomics).toHaveBeenCalledOnce();
    const updateData = mutation.mock.calls[0]?.[0]?.updateGiftStaging?.__args?.data;
    expect(updateData.grossPaymentAmount).toBeUndefined();
    expect(updateData.processingFeeAmount).toBeUndefined();
    expect(updateData.netReceivedAmount).toBeUndefined();
  });

  it('uses a two-step lifecycle for recurring donation-form Stripe payments', async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce({
        giftStaging: {
          id: 'gift-staging-recurring-lifecycle',
          rawProviderEvidence: {
            provider: 'STRIPE',
            flow: 'DONATION_FORM',
            paymentLifecycle: 'AWAITING_PAYMENT',
            donationType: 'RECURRING',
          },
        },
      })
      .mockResolvedValueOnce({
        giftStaging: {
          id: 'gift-staging-recurring-lifecycle',
          rawProviderEvidence: {
            provider: 'STRIPE',
            flow: 'DONATION_FORM',
            paymentLifecycle: 'PAYMENT_CONFIRMED',
            donationType: 'RECURRING',
            eventType: 'checkout.session.completed',
            checkoutSessionId: 'cs_form_recurring_lifecycle',
            subscriptionId: 'sub_form_recurring_lifecycle',
          },
        },
      });
    const mutation = vi
      .fn()
      .mockResolvedValue({ updateGiftStaging: { id: 'gift-staging-recurring-lifecycle' } });
    const client = {
      query,
      mutation,
    } as unknown as CoreApiClient;
    const paymentEconomicsRetriever = {
      retrievePaymentEconomics: vi.fn(),
      retrieveInvoiceById: vi.fn().mockResolvedValue({
        id: 'in_form_recurring_lifecycle',
        metadata: {},
        parent: {
          subscription_details: {
            metadata: {
              sourceFingerprint: 'dfs_form_recurring_lifecycle',
              giftStagingId: 'gift-staging-recurring-lifecycle',
            },
            subscription: 'sub_form_recurring_lifecycle',
          },
        },
      }),
      retrieveInvoicePaymentById: vi.fn().mockResolvedValue({
        id: 'ip_form_recurring_lifecycle',
        invoice: 'in_form_recurring_lifecycle',
        payment: {
          type: 'payment_intent',
          payment_intent: 'pi_form_recurring_lifecycle',
        },
      }),
      findSubscriptionMetadata: vi.fn(),
      retrievePaymentEconomicsFromPaymentIntentId: vi.fn().mockResolvedValue({
        paymentIntentId: 'pi_form_recurring_lifecycle',
        latestChargeId: 'ch_form_recurring_lifecycle',
        balanceTransactionId: 'txn_form_recurring_lifecycle',
        grossPaymentAmount: {
          amountMicros: 10_000_000,
          currencyCode: 'GBP',
        },
        processingFeeAmount: {
          amountMicros: 530_000,
          currencyCode: 'GBP',
        },
        netReceivedAmount: {
          amountMicros: 9_470_000,
          currencyCode: 'GBP',
        },
      }),
    };

    await updateStripeDonationFormGiftStagingWithDependencies(
      client,
      {
        id: 'evt_form_recurring_lifecycle_checkout',
        type: 'checkout.session.completed',
        created: 1777198422,
        data: {
          object: {
            id: 'cs_form_recurring_lifecycle',
            amount_total: 2500,
            currency: 'gbp',
            created: 1777198410,
            customer: 'cus_form_recurring_lifecycle',
            customer_details: {
              email: 'ada@example.com',
              name: 'Ada Lovelace',
            },
            payment_intent: null,
            subscription: 'sub_form_recurring_lifecycle',
            metadata: {
              sourceFingerprint: 'dfs_form_recurring_lifecycle',
              giftStagingId: 'gift-staging-recurring-lifecycle',
            },
          },
        },
      },
      {
        paymentEconomicsRetriever,
      },
    );

    await updateStripeDonationFormRecurringInvoicePaymentGiftStagingWithDependencies(
      client,
      {
        id: 'evt_form_recurring_lifecycle_invoice_payment',
        type: 'invoice_payment.paid',
        data: {
          object: {
            id: 'ip_form_recurring_lifecycle',
            invoice: 'in_form_recurring_lifecycle',
            payment: {
              type: 'payment_intent',
              payment_intent: 'pi_form_recurring_lifecycle',
            },
          },
        },
      },
      {
        paymentEconomicsRetriever,
      },
    );

    expect(paymentEconomicsRetriever.retrievePaymentEconomics).not.toHaveBeenCalled();
    expect(mutation).toHaveBeenCalledTimes(2);

    const checkoutUpdate = mutation.mock.calls[0]?.[0]?.updateGiftStaging?.__args?.data;
    expect(checkoutUpdate.providerAgreementId).toBe('sub_form_recurring_lifecycle');
    expect(checkoutUpdate.providerPaymentId).toBeUndefined();
    expect(checkoutUpdate.paymentState).toBeUndefined();
    expect(checkoutUpdate.grossPaymentAmount).toBeUndefined();
    expect(checkoutUpdate.processingFeeAmount).toBeUndefined();
    expect(checkoutUpdate.netReceivedAmount).toBeUndefined();

    const invoicePaymentUpdate =
      mutation.mock.calls[1]?.[0]?.updateGiftStaging?.__args?.data;
    expect(invoicePaymentUpdate.providerAgreementId).toBe(
      'sub_form_recurring_lifecycle',
    );
    expect(invoicePaymentUpdate.paymentState).toBe('PAYMENT_CONFIRMED');
    expect(invoicePaymentUpdate.providerPaymentId).toBe(
      'pi_form_recurring_lifecycle',
    );
    expect(invoicePaymentUpdate.grossPaymentAmount).toEqual({
      amountMicros: 10_000_000,
      currencyCode: 'GBP',
    });
    expect(invoicePaymentUpdate.processingFeeAmount).toEqual({
      amountMicros: 530_000,
      currencyCode: 'GBP',
    });
    expect(invoicePaymentUpdate.netReceivedAmount).toEqual({
      amountMicros: 9_470_000,
      currencyCode: 'GBP',
    });
  });

});

describe('updateStripeDonationFormRecurringInvoicePaymentGiftStaging', () => {
  it('maps recurring invoice_payment.paid economics onto the existing donation-form staging row', async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce({
        giftStaging: {
          id: 'gift-staging-recurring-invoice-payment',
          rawProviderEvidence: {
            provider: 'STRIPE',
            flow: 'DONATION_FORM',
            paymentLifecycle: 'PAYMENT_CONFIRMED',
          },
        },
      });
    const mutation = vi.fn().mockResolvedValue({
      updateGiftStaging: {
        id: 'gift-staging-recurring-invoice-payment',
      },
    });
    const client = {
      query,
      mutation,
    } as unknown as CoreApiClient;
    const paymentEconomicsRetriever = {
      retrieveInvoiceById: vi.fn().mockResolvedValue({
        id: 'in_invoice_payment',
        metadata: {},
        parent: {
          subscription_details: {
            metadata: {
              sourceFingerprint: 'dfs_invoice_payment',
              giftStagingId: 'gift-staging-recurring-invoice-payment',
            },
            subscription: 'sub_invoice_payment',
          },
        },
      }),
      retrieveInvoicePaymentById: vi.fn().mockResolvedValue({
        id: 'ip_invoice_payment',
        invoice: 'in_invoice_payment',
        payment: {
          type: 'payment_intent',
          payment_intent: 'pi_invoice_payment_paid',
        },
      }),
      findSubscriptionMetadata: vi.fn(),
      retrievePaymentEconomicsFromPaymentIntentId: vi.fn().mockResolvedValue({
        paymentIntentId: 'pi_invoice_payment_paid',
        latestChargeId: 'ch_invoice_payment_paid',
        balanceTransactionId: 'txn_invoice_payment_paid',
        grossPaymentAmount: {
          amountMicros: 10_000_000,
          currencyCode: 'GBP',
        },
        processingFeeAmount: {
          amountMicros: 530_000,
          currencyCode: 'GBP',
        },
        netReceivedAmount: {
          amountMicros: 9_470_000,
          currencyCode: 'GBP',
        },
      }),
    };

    const result =
      await updateStripeDonationFormRecurringInvoicePaymentGiftStagingWithDependencies(
        client,
        {
          id: 'evt_invoice_payment_paid',
          type: 'invoice_payment.paid',
          data: {
            object: {
              id: 'ip_invoice_payment',
              invoice: 'in_invoice_payment',
              payment: {
                type: 'payment_intent',
                payment_intent: 'pi_invoice_payment_paid',
              },
            },
          },
        },
        {
          paymentEconomicsRetriever,
        },
      );

    expect(result).toEqual({
      updated: true,
      giftStagingId: 'gift-staging-recurring-invoice-payment',
      sourceFingerprint: 'dfs_invoice_payment',
      externalId: 'ip_invoice_payment',
    });
    expect(paymentEconomicsRetriever.retrieveInvoicePaymentById).toHaveBeenCalledWith(
      'ip_invoice_payment',
    );
    expect(paymentEconomicsRetriever.retrieveInvoiceById).toHaveBeenCalledWith(
      'in_invoice_payment',
    );
    expect(
      paymentEconomicsRetriever.retrievePaymentEconomicsFromPaymentIntentId,
    ).toHaveBeenCalledWith('pi_invoice_payment_paid');
    expect(mutation.mock.calls[0]?.[0]).toEqual({
      updateGiftStaging: {
        __args: {
          id: 'gift-staging-recurring-invoice-payment',
          data: {
            providerEventId: 'evt_invoice_payment_paid',
            provider: 'STRIPE',
            providerAgreementId: 'sub_invoice_payment',
            providerPaymentId: 'pi_invoice_payment_paid',
            paymentState: 'PAYMENT_CONFIRMED',
            grossPaymentAmount: {
              amountMicros: 10_000_000,
              currencyCode: 'GBP',
            },
            processingFeeAmount: {
              amountMicros: 530_000,
              currencyCode: 'GBP',
            },
            netReceivedAmount: {
              amountMicros: 9_470_000,
              currencyCode: 'GBP',
            },
            rawProviderEvidence: {
              provider: 'STRIPE',
              flow: 'DONATION_FORM',
              paymentLifecycle: 'PAYMENT_CONFIRMED',
              eventType: 'invoice_payment.paid',
              invoiceId: 'in_invoice_payment',
              sourceFingerprint: 'dfs_invoice_payment',
              subscriptionId: 'sub_invoice_payment',
              paymentIntentId: 'pi_invoice_payment_paid',
              metadata: {
                sourceFingerprint: 'dfs_invoice_payment',
                giftStagingId: 'gift-staging-recurring-invoice-payment',
              },
              paymentEconomicsLookup: {
                attempted: true,
                path: 'invoice_payment.payment.payment_intent',
                latestInvoiceId: 'in_invoice_payment',
                paymentIntentId: 'pi_invoice_payment_paid',
                paymentIntentIdFound: true,
                latestChargeId: 'ch_invoice_payment_paid',
                latestChargeIdFound: true,
                balanceTransactionId: 'txn_invoice_payment_paid',
                balanceTransactionIdFound: true,
              },
              paymentEconomics: {
                paymentIntentId: 'pi_invoice_payment_paid',
                latestChargeId: 'ch_invoice_payment_paid',
                balanceTransactionId: 'txn_invoice_payment_paid',
                grossPaymentAmount: {
                  amountMicros: 10_000_000,
                  currencyCode: 'GBP',
                },
                processingFeeAmount: {
                  amountMicros: 530_000,
                  currencyCode: 'GBP',
                },
                netReceivedAmount: {
                  amountMicros: 9_470_000,
                  currencyCode: 'GBP',
                },
              },
            },
          },
        },
        id: true,
      },
    });
  });
});

describe('buildStripeOneOffGiftStagingInput', () => {
  it('maps a completed checkout session into the Stage 1 staging shape', () => {
    const input = buildStripeOneOffGiftStagingInput(buildEvent());

    expect(input).toEqual({
      name: 'Stripe donation from Ada Lovelace',
      intakeSource: 'stripe_webhook',
      amount: {
        currencyCode: 'GBP',
        amountMicros: 25_000_000,
      },
      giftDate: '2026-04-26',
      donationType: 'ONE_OFF',
      paymentType: 'CARD',
      donorFirstName: 'Ada',
      donorLastName: 'Lovelace',
      donorEmail: 'ada@example.com',
      donorPhone: '+44 20 7946 0958',
      externalId: 'cs_test_123',
      sourceFingerprint: 'evt_test_123',
      providerEventId: 'evt_test_123',
      provider: 'STRIPE',
      providerPaymentId: 'pi_123',
      paymentProviderCustomerId: 'cus_123',
      providerAgreementId: null,
      donorMailingAddress: {
        addressStreet1: '12 Analytical Engine Row',
        addressCity: 'London',
        addressPostcode: 'SW1A 1AA',
        addressCountry: 'GB',
      },
      rawProviderEvidence: {
        provider: 'STRIPE',
        eventType: 'checkout.session.completed',
        checkoutSessionId: 'cs_test_123',
        customerId: 'cus_123',
        paymentIntentId: 'pi_123',
        customerDetails: {
          name: 'Ada Lovelace',
          email: 'ada@example.com',
          phone: '+44 20 7946 0958',
          address: {
            addressStreet1: '12 Analytical Engine Row',
            addressCity: 'London',
            addressPostcode: 'SW1A 1AA',
            addressCountry: 'GB',
          },
        },
      },
      donorResolutionState: 'UNREVIEWED',
      giftReadyStatus: 'NEEDS_REVIEW',
      processingStatus: 'NOT_PROCESSED',
      giftAidRequested: false,
      giftAidDeclarationCaptured: false,
    });
  });

  it('supports a payment_intent object and omits optional fields when absent', () => {
    const input = buildStripeOneOffGiftStagingInput(
      buildEvent({
        data: {
          object: {
            id: 'cs_test_456',
            amount_total: 5000,
            currency: null,
            created: 1777198410,
            customer: {
              id: 'cus_456',
            },
            customer_details: {
              email: null,
              name: 'Madonna',
              phone: '+1 212 555 0100',
              address: {
                line1: '5 Music Lane',
                line2: 'Apartment 3',
                city: 'New York',
                state: 'NY',
                postal_code: '10001',
                country: 'us',
              },
            },
            payment_intent: {
              id: 'pi_456',
            },
          },
        },
      }),
    );

    expect(input.amount.currencyCode).toBe('GBP');
    expect(input.donorFirstName).toBe('Madonna');
    expect(input.donorLastName).toBe('');
    expect(input.donorEmail).toBeUndefined();
    expect(input.donorPhone).toBe('+1 212 555 0100');
    expect(input.providerPaymentId).toBe('pi_456');
    expect(input.providerEventId).toBe('evt_test_123');
    expect(input.paymentProviderCustomerId).toBe('cus_456');
    expect(input.providerAgreementId).toBeNull();
    expect(input.donorMailingAddress).toEqual({
      addressStreet1: '5 Music Lane',
      addressStreet2: 'Apartment 3',
      addressCity: 'New York',
      addressState: 'NY',
      addressPostcode: '10001',
      addressCountry: 'US',
    });
    expect(input.rawProviderEvidence).toEqual({
      provider: 'STRIPE',
      eventType: 'checkout.session.completed',
      checkoutSessionId: 'cs_test_456',
      customerId: 'cus_456',
      paymentIntentId: 'pi_456',
      customerDetails: {
        name: 'Madonna',
        phone: '+1 212 555 0100',
        address: {
          addressStreet1: '5 Music Lane',
          addressStreet2: 'Apartment 3',
          addressCity: 'New York',
          addressState: 'NY',
          addressPostcode: '10001',
          addressCountry: 'US',
        },
      },
    });
  });

  it('carries Stripe subscription evidence for recurring-related staging review', () => {
    const input = buildStripeOneOffGiftStagingInput(
      buildEvent({
        data: {
          object: {
            id: 'cs_test_subscription',
            amount_total: 1500,
            currency: 'gbp',
            created: 1777198410,
            customer_details: {
              email: 'grace@example.org',
              name: 'Grace Hopper',
            },
            payment_intent: 'pi_subscription',
            subscription: {
              id: 'sub_subscription',
              items: {
                data: [
                  {
                    price: {
                      recurring: {
                        interval: 'month',
                        interval_count: 1,
                      },
                    },
                  },
                ],
              },
            },
          },
        },
      }),
    );

    expect(input.name).toBe('Stripe recurring donation from Grace Hopper');
    expect(input.donationType).toBe('RECURRING');
    expect(input.providerAgreementId).toBe('sub_subscription');
    expect(input.providerPaymentId).toBe('pi_subscription');
    expect(input.providerIntervalUnit).toBe('month');
    expect(input.providerIntervalCount).toBe(1);
    expect(input.rawProviderEvidence).toEqual({
      provider: 'STRIPE',
      eventType: 'checkout.session.completed',
      checkoutSessionId: 'cs_test_subscription',
      paymentIntentId: 'pi_subscription',
      subscriptionId: 'sub_subscription',
      customerDetails: {
        name: 'Grace Hopper',
        email: 'grace@example.org',
      },
      recurring: {
        intervalUnit: 'month',
        intervalCount: 1,
      },
    });
    expect(input.processingStatus).toBe('NOT_PROCESSED');
    expect(input.giftReadyStatus).toBe('NEEDS_REVIEW');
  });

  it('falls back to the event created timestamp when the session created timestamp is absent', () => {
    const input = buildStripeOneOffGiftStagingInput(
      buildEvent({
        created: 1777198422,
        data: {
          object: {
            id: 'cs_test_789',
            amount_total: 1000,
            currency: 'usd',
            customer_details: {
              name: 'Grace Hopper',
            },
            payment_intent: null,
          },
        },
      }),
    );

    expect(input.giftDate).toBe('2026-04-26');
    expect(input.amount.currencyCode).toBe('USD');
    expect(input.providerPaymentId).toBeUndefined();
  });

  it('rejects unsupported Stripe event types', () => {
    expect(() =>
      buildStripeOneOffGiftStagingInput(
        buildEvent({
          type: 'payment_intent.succeeded',
        }),
      ),
    ).toThrow('Stripe one-off staging only supports checkout.session.completed');
  });

  it('rejects a session without a positive amount_total', () => {
    expect(() =>
      buildStripeOneOffGiftStagingInput(
        buildEvent({
          data: {
            object: {
              id: 'cs_test_bad_amount',
              amount_total: 0,
              customer_details: {
                name: 'Ada Lovelace',
              },
            },
          },
        }),
      ),
    ).toThrow('Stripe checkout session must include a positive amount_total');
  });

  it('rejects a session without a donor name', () => {
    expect(() =>
      buildStripeOneOffGiftStagingInput(
        buildEvent({
          data: {
            object: {
              id: 'cs_test_missing_name',
              amount_total: 2500,
              customer_details: {
                email: 'ada@example.com',
                name: '',
              },
            },
          },
        }),
      ),
    ).toThrow('Stripe checkout session must include a donor name');
  });

  it('captures online Gift Aid evidence when request, identity, and address are present', () => {
    const input = buildStripeOneOffGiftStagingInput(
      buildEvent({
        data: {
          object: {
            id: 'cs_test_giftaid',
            amount_total: 2500,
            currency: 'gbp',
            created: 1777198410,
            customer_details: {
              email: 'ada@example.com',
              name: 'Ada Lovelace',
              address: {
                line1: '12 Analytical Engine Row',
                city: 'London',
                postal_code: 'SW1A 1AA',
                country: 'gb',
              },
            },
            metadata: {
              gift_aid_requested: 'true',
            },
            payment_intent: 'pi_giftaid',
          },
        },
      }),
    );

    expect(input.giftAidRequested).toBe(true);
    expect(input.giftAidDeclarationCaptured).toBe(true);
    expect(input.giftAidDeclarationDate).toBe('2026-04-26');
    expect(input.giftAidDeclarationSource).toBe('stripe_checkout');
    expect(input.giftAidTextVersion).toBeUndefined();
    expect(input.giftAidCoverageScope).toBeUndefined();
    expect(input.rawProviderEvidence?.giftAid).toEqual({
      requested: true,
      declarationCaptured: true,
      declarationDate: '2026-04-26',
      declarationSource: 'stripe_checkout',
    });
  });

  it('preserves Gift Aid request without marking declaration captured when address is missing', () => {
    const input = buildStripeOneOffGiftStagingInput(
      buildEvent({
        data: {
          object: {
            id: 'cs_test_giftaid_missing_address',
            amount_total: 2500,
            currency: 'gbp',
            created: 1777198410,
            customer_details: {
              email: 'ada@example.com',
              name: 'Ada Lovelace',
            },
            metadata: {
              giftAidRequested: 'true',
              giftAidTextVersion: 'v1',
            },
            payment_intent: 'pi_giftaid_missing_address',
          },
        },
      }),
    );

    expect(input.giftAidRequested).toBe(true);
    expect(input.giftAidDeclarationCaptured).toBe(false);
    expect(input.giftAidDeclarationDate).toBe('2026-04-26');
    expect(input.giftAidDeclarationSource).toBe('stripe_checkout');
    expect(input.giftAidTextVersion).toBe('v1');
    expect(input.rawProviderEvidence?.giftAid).toEqual({
      requested: true,
      declarationDate: '2026-04-26',
      declarationSource: 'stripe_checkout',
      textVersion: 'v1',
    });
  });

  it('extracts human-readable attribution/designation evidence without canonical mapping', () => {
    const input = buildStripeOneOffGiftStagingInput(
      buildEvent({
        data: {
          object: {
            id: 'cs_test_attribution',
            amount_total: 2500,
            currency: 'gbp',
            created: 1777198410,
            customer_details: {
              email: 'ada@example.com',
              name: 'Ada Lovelace',
            },
            metadata: {
              campaign_name: 'Spring Appeal 2026',
              designation: 'Emergency Relief',
              page_id: 'pg_123',
            },
            custom_fields: [
              {
                key: 'pageTitle',
                text: {
                  value: 'Override page title',
                },
              },
            ],
            payment_intent: 'pi_attr',
          },
        },
      }),
    );

    expect(input.sourceAppealName).toBe('Spring Appeal 2026');
    expect(input.sourceFundName).toBe('Emergency Relief');
    expect(input.rawProviderEvidence).toEqual({
      provider: 'STRIPE',
      eventType: 'checkout.session.completed',
      checkoutSessionId: 'cs_test_attribution',
      paymentIntentId: 'pi_attr',
      metadata: {
        campaign_name: 'Spring Appeal 2026',
        designation: 'Emergency Relief',
        page_id: 'pg_123',
      },
      customFields: {
        pageTitle: 'Override page title',
      },
      customerDetails: {
        name: 'Ada Lovelace',
        email: 'ada@example.com',
      },
    });
  });

  it('does not promote opaque ids into source appeal or fund names', () => {
    const input = buildStripeOneOffGiftStagingInput(
      buildEvent({
        data: {
          object: {
            id: 'cs_test_ids_only',
            amount_total: 2500,
            currency: 'gbp',
            created: 1777198410,
            customer_details: {
              email: 'ada@example.com',
              name: 'Ada Lovelace',
            },
            metadata: {
              campaign_id: 'camp_123',
              fund_id: 'fund_456',
            },
            payment_intent: 'pi_ids_only',
          },
        },
      }),
    );

    expect(input.sourceAppealName).toBeUndefined();
    expect(input.sourceFundName).toBeUndefined();
    expect(input.rawProviderEvidence).toEqual({
      provider: 'STRIPE',
      eventType: 'checkout.session.completed',
      checkoutSessionId: 'cs_test_ids_only',
      paymentIntentId: 'pi_ids_only',
      metadata: {
        campaign_id: 'camp_123',
        fund_id: 'fund_456',
      },
      customerDetails: {
        name: 'Ada Lovelace',
        email: 'ada@example.com',
      },
    });
  });
});
