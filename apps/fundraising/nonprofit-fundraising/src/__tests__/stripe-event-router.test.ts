import { describe, expect, it, vi } from 'vitest';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { routeTrustedStripeEvent } from 'src/stripe/stripe-event-router';
import * as oneOffStaging from 'src/stripe/stripe-one-off-staging';
import * as donationFormStaging from 'src/stripe/stripe-donation-form-staging';
import * as recurringFulfillment from 'src/stripe/stripe-recurring-fulfillment';

const client = {} as CoreApiClient;

const buildCheckoutSessionEvent = (subscription?: string) => ({
  id: 'evt_router_unit',
  type: 'checkout.session.completed',
  data: {
    object: {
      id: 'cs_router_unit',
      subscription,
    },
  },
});

describe('routeTrustedStripeEvent', () => {
  it('routes checkout.session.completed without a subscription to one-off staging', async () => {
    const oneOffResult = {
      created: true,
      giftStagingId: 'gift-staging-id',
      sourceFingerprint: 'evt_router_unit',
      externalId: 'cs_router_unit',
    } as const;
    const oneOffSpy = vi
      .spyOn(oneOffStaging, 'createStripeOneOffGiftStaging')
      .mockResolvedValue(oneOffResult);
    const recurringSpy = vi.spyOn(
      recurringFulfillment,
      'createStripeRecurringGiftForConfidentMatch',
    );

    const result = await routeTrustedStripeEvent(
      client,
      buildCheckoutSessionEvent(),
    );

    expect(result).toEqual({
      action: 'CREATE_ONE_OFF_GIFT_STAGING',
      result: oneOffResult,
    });
    expect(oneOffSpy).toHaveBeenCalledOnce();
    expect(recurringSpy).not.toHaveBeenCalled();
  });

  it('routes donation-form checkout sessions to update the existing gift staging row', async () => {
    const updateResult = {
      updated: true,
      giftStagingId: 'gift-staging-donation-form',
      sourceFingerprint: 'dfs_router_unit',
      externalId: 'cs_router_unit',
    } as const;
    const updateSpy = vi
      .spyOn(donationFormStaging, 'updateStripeDonationFormGiftStaging')
      .mockResolvedValue(updateResult);
    const oneOffSpy = vi.spyOn(oneOffStaging, 'createStripeOneOffGiftStaging');

    const result = await routeTrustedStripeEvent(client, {
      id: 'evt_router_unit',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_router_unit',
          metadata: {
            sourceFingerprint: 'dfs_router_unit',
          },
        },
      },
    });

    expect(result).toEqual({
      action: 'UPDATE_DONATION_FORM_GIFT_STAGING',
      result: updateResult,
    });
    expect(updateSpy).toHaveBeenCalledOnce();
    expect(oneOffSpy).not.toHaveBeenCalled();
  });

  it('routes recurring donation-form checkout sessions to update the existing gift staging row before recurring fulfillment logic', async () => {
    const updateResult = {
      updated: true,
      giftStagingId: 'gift-staging-donation-form-recurring',
      sourceFingerprint: 'dfs_router_recurring',
      externalId: 'cs_router_unit',
    } as const;
    const updateSpy = vi
      .spyOn(donationFormStaging, 'updateStripeDonationFormGiftStaging')
      .mockResolvedValue(updateResult);
    const recurringSpy = vi.spyOn(
      recurringFulfillment,
      'createStripeRecurringGiftForConfidentMatch',
    );

    const result = await routeTrustedStripeEvent(client, {
      id: 'evt_router_unit',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_router_unit',
          subscription: 'sub_router_unit',
          metadata: {
            sourceFingerprint: 'dfs_router_recurring',
          },
        },
      },
    });

    expect(result).toEqual({
      action: 'UPDATE_DONATION_FORM_GIFT_STAGING',
      result: updateResult,
    });
    expect(updateSpy).toHaveBeenCalledOnce();
    expect(recurringSpy).not.toHaveBeenCalled();
  });

  it('routes invoice_payment.paid to recurring donation-form staging update', async () => {
    const updateResult = {
      updated: true,
      giftStagingId: 'gift-staging-recurring-invoice-payment',
      sourceFingerprint: 'dfs_router_invoice_payment',
      externalId: 'ip_router_unit',
    } as const;
    const invoicePaymentUpdateSpy = vi
      .spyOn(
        donationFormStaging,
        'updateStripeDonationFormRecurringInvoicePaymentGiftStaging',
      )
      .mockResolvedValue(updateResult);

    const result = await routeTrustedStripeEvent(client, {
      id: 'evt_invoice_payment_router_unit',
      type: 'invoice_payment.paid',
      data: {
        object: {
          id: 'ip_router_unit',
          invoice: 'in_router_unit',
          payment: {
            payment_intent: 'pi_router_unit',
          },
        },
      },
    });

    expect(result).toEqual({
      action: 'UPDATE_DONATION_FORM_GIFT_STAGING',
      result: updateResult,
    });
    expect(invoicePaymentUpdateSpy).toHaveBeenCalledOnce();
  });

  it('ignores invoice.paid for donation-form recurring updates now that invoice_payment.paid is canonical', async () => {
    const result = await routeTrustedStripeEvent(client, {
      id: 'evt_invoice_router_unit',
      type: 'invoice.paid',
      data: {
        object: {
          id: 'in_router_unit',
          subscription: 'sub_router_unit',
        },
      },
    });

    expect(result).toEqual({
      action: 'IGNORED',
      reason: 'UNSUPPORTED_EVENT_TYPE',
      eventType: 'invoice.paid',
    });
  });

  it('ignores invoice.payment_succeeded for donation-form recurring updates now that invoice_payment.paid is canonical', async () => {
    const result = await routeTrustedStripeEvent(client, {
      id: 'evt_invoice_payment_succeeded_router_unit',
      type: 'invoice.payment_succeeded',
      data: {
        object: {
          id: 'in_router_unit',
          subscription: 'sub_router_unit',
        },
      },
    });

    expect(result).toEqual({
      action: 'IGNORED',
      reason: 'UNSUPPORTED_EVENT_TYPE',
      eventType: 'invoice.payment_succeeded',
    });
  });

  it('ignores payment_intent.succeeded for donation-form recurring updates now that invoice_payment.paid is canonical', async () => {
    const result = await routeTrustedStripeEvent(client, {
      id: 'evt_payment_intent_router_unit',
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: 'pi_router_unit',
          invoice: 'in_router_unit',
        },
      },
    });

    expect(result).toEqual({
      action: 'IGNORED',
      reason: 'UNSUPPORTED_EVENT_TYPE',
      eventType: 'payment_intent.succeeded',
    });
  });

  it('routes matched checkout.session.completed subscriptions to recurring fulfillment', async () => {
    const recurringResult = {
      created: true,
      giftId: 'gift-id',
      recurringAgreementId: 'recurring-agreement-id',
      sourceFingerprint: 'evt_router_unit',
      externalId: 'cs_router_unit',
      nextExpectedAt: '2026-05-21',
    } as const;
    const oneOffSpy = vi.spyOn(oneOffStaging, 'createStripeOneOffGiftStaging');
    const recurringSpy = vi
      .spyOn(recurringFulfillment, 'createStripeRecurringGiftForConfidentMatch')
      .mockResolvedValue(recurringResult);
    const recurringStagingSpy = vi.spyOn(
      recurringFulfillment,
      'createStripeRecurringGiftStagingForReview',
    );

    const result = await routeTrustedStripeEvent(
      client,
      buildCheckoutSessionEvent('sub_router_unit'),
    );

    expect(result).toEqual({
      action: 'CREATE_RECURRING_GIFT',
      result: recurringResult,
    });
    expect(oneOffSpy).not.toHaveBeenCalled();
    expect(recurringSpy).toHaveBeenCalledOnce();
    expect(recurringStagingSpy).not.toHaveBeenCalled();
  });

  it('routes unmatched checkout.session.completed subscriptions to staging review', async () => {
    const recurringResult = {
      created: false,
      reason: 'NO_CONFIDENT_RECURRING_AGREEMENT_MATCH',
      sourceFingerprint: 'evt_router_unit',
      externalId: 'cs_router_unit',
      providerAgreementId: 'sub_router_unit',
    } as const;
    const recurringStagingResult = {
      created: true,
      giftStagingId: 'gift-staging-id',
      sourceFingerprint: 'evt_router_unit',
      externalId: 'cs_router_unit',
      providerAgreementId: 'sub_router_unit',
    } as const;
    const oneOffSpy = vi.spyOn(oneOffStaging, 'createStripeOneOffGiftStaging');
    const recurringSpy = vi
      .spyOn(recurringFulfillment, 'createStripeRecurringGiftForConfidentMatch')
      .mockResolvedValue(recurringResult);
    const recurringStagingSpy = vi
      .spyOn(recurringFulfillment, 'createStripeRecurringGiftStagingForReview')
      .mockResolvedValue(recurringStagingResult);

    const result = await routeTrustedStripeEvent(
      client,
      buildCheckoutSessionEvent('sub_router_unit'),
    );

    expect(result).toEqual({
      action: 'CREATE_RECURRING_GIFT_STAGING',
      result: recurringStagingResult,
    });
    expect(oneOffSpy).not.toHaveBeenCalled();
    expect(recurringSpy).toHaveBeenCalledOnce();
    expect(recurringStagingSpy).toHaveBeenCalledOnce();
  });

  it('ignores unsupported Stripe event types', async () => {
    const oneOffSpy = vi.spyOn(oneOffStaging, 'createStripeOneOffGiftStaging');
    const recurringSpy = vi.spyOn(
      recurringFulfillment,
      'createStripeRecurringGiftForConfidentMatch',
    );

    const result = await routeTrustedStripeEvent(client, {
      id: 'evt_ignored',
      type: 'charge.succeeded',
      data: {
        object: {},
      },
    });

    expect(result).toEqual({
      action: 'IGNORED',
      reason: 'UNSUPPORTED_EVENT_TYPE',
      eventType: 'charge.succeeded',
    });
    expect(oneOffSpy).not.toHaveBeenCalled();
    expect(recurringSpy).not.toHaveBeenCalled();
  });
});
