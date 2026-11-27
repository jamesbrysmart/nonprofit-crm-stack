import { afterEach, describe, expect, it, vi } from 'vitest';
import type { CoreApiClient } from 'twenty-client-sdk/core';
import { routeTrustedStripeEvent } from 'src/stripe/stripe-event-router';
import * as oneOffStaging from 'src/stripe/stripe-one-off-staging';
import * as donationFormStaging from 'src/stripe/stripe-donation-form-staging';
import * as recurringFulfillment from 'src/stripe/stripe-recurring-fulfillment';

const client = {} as CoreApiClient;

describe('routeTrustedStripeEvent', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each([
    { donationType: 'one-off', subscription: undefined },
    { donationType: 'recurring', subscription: 'sub_router_unit' },
  ])(
    'routes a $donationType donation-form checkout to its pre-payment row',
    async ({ subscription }) => {
      const updateResult = {
        updated: true,
        giftStagingId: 'gift-staging-donation-form',
        sourceFingerprint: 'dfs_router_unit',
        externalId: 'cs_router_unit',
      } as const;
      const updateSpy = vi
        .spyOn(donationFormStaging, 'updateStripeDonationFormGiftStaging')
        .mockResolvedValue(updateResult);
      const recurringSpy = vi.spyOn(
        recurringFulfillment,
        'createStripeRecurringGiftForConfidentMatch',
      );
      const oneOffSpy = vi.spyOn(oneOffStaging, 'createStripeOneOffGiftStaging');

      const result = await routeTrustedStripeEvent(client, {
        id: 'evt_router_unit',
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_router_unit',
            subscription,
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
      expect(recurringSpy).not.toHaveBeenCalled();
    },
  );

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

  it.each(['invoice.paid', 'charge.succeeded'])(
    'ignores %s without starting gift intake',
    async (type) => {
      const oneOffSpy = vi.spyOn(oneOffStaging, 'createStripeOneOffGiftStaging');
      const recurringSpy = vi.spyOn(
        recurringFulfillment,
        'createStripeRecurringGiftForConfidentMatch',
      );

      const result = await routeTrustedStripeEvent(client, {
        id: 'evt_ignored',
        type,
        data: { object: {} },
      });

      expect(result).toEqual({
        action: 'IGNORED',
        reason: 'UNSUPPORTED_EVENT_TYPE',
        eventType: type,
      });
      expect(oneOffSpy).not.toHaveBeenCalled();
      expect(recurringSpy).not.toHaveBeenCalled();
    },
  );
});
