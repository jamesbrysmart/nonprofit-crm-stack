import { describe, expect, it, vi } from 'vitest';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { routeTrustedStripeEvent } from 'src/stripe/stripe-event-router';
import * as oneOffStaging from 'src/stripe/stripe-one-off-staging';
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
