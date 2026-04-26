import { describe, expect, it } from 'vitest';
import { findGiftStagingBySourceFingerprint } from 'src/stripe/stripe-one-off-staging';
import type {
  StripeEventRoutingResult,
  TrustedStripeEvent,
} from 'src/stripe/stripe-event-router';
import {
  callAppRoute,
  createPerson,
  createRecurringAgreement,
  getCoreClient,
  loadGiftById,
  loadGiftStagingById,
  loadRecurringAgreementById,
} from './test-helpers';

const buildCheckoutSessionEvent = ({
  suffix,
  subscriptionId,
}: {
  suffix: string;
  subscriptionId?: string;
}): TrustedStripeEvent => ({
  id: `evt_router_${suffix}`,
  type: 'checkout.session.completed',
  data: {
    object: {
      id: `cs_router_${suffix}`,
      amount_total: 4200,
      currency: 'gbp',
      created: 1777198410,
      customer_details: {
        email: `router.${suffix}@example.org`,
        name: 'Grace Hopper',
      },
      payment_intent: `pi_router_${suffix}`,
      ...(subscriptionId ? { subscription: subscriptionId } : {}),
    },
  },
});

const callRouter = (event: TrustedStripeEvent) =>
  callAppRoute<StripeEventRoutingResult>('/s/stripe/intake/handle-event', event);

describe('Stripe event router intake', () => {
  it('should stage checkout.session.completed events without a subscription', async () => {
    const suffix = `${Date.now()}-one-off`;
    const response = await callRouter(buildCheckoutSessionEvent({ suffix }));

    expect(response.action).toBe('CREATE_ONE_OFF_GIFT_STAGING');
    if (response.action !== 'CREATE_ONE_OFF_GIFT_STAGING') {
      throw new Error(`Expected one-off staging, got ${response.action}`);
    }

    expect(response.result.created).toBe(true);

    const createdRecord = await loadGiftStagingById(response.result.giftStagingId);
    expect(createdRecord?.externalId).toBe(`cs_router_${suffix}`);
    expect(createdRecord?.sourceFingerprint).toBe(`evt_router_${suffix}`);
    expect(createdRecord?.provider).toBe('STRIPE');
    expect(createdRecord?.providerPaymentId).toBe(`pi_router_${suffix}`);
    expect(createdRecord?.providerAgreementId).toBeNull();
    expect(createdRecord?.processingStatus).toBe('NOT_READY');
  });

  it('should create a committed gift for a confident recurring agreement match', async () => {
    const suffix = `${Date.now()}-recurring`;
    const subscriptionId = `sub_router_${suffix}`;
    const person = await createPerson({
      firstName: `Grace${suffix}`,
      lastName: 'Hopper',
      email: `router.${suffix}@example.org`,
    });
    const agreement = await createRecurringAgreement({
      name: `Grace ${suffix} monthly giving`,
      personId: person.id,
      provider: 'STRIPE',
      providerAgreementId: subscriptionId,
    });

    const response = await callRouter(
      buildCheckoutSessionEvent({ suffix, subscriptionId }),
    );

    expect(response.action).toBe('CREATE_RECURRING_GIFT');
    if (response.action !== 'CREATE_RECURRING_GIFT') {
      throw new Error(`Expected recurring gift, got ${response.action}`);
    }

    expect(response.result.created).toBe(true);
    if (!response.result.created) {
      throw new Error(`Expected gift creation, got ${response.result.reason}`);
    }

    const gift = await loadGiftById(response.result.giftId);
    expect(gift?.donor?.id).toBe(person.id);
    expect(gift?.recurringAgreement?.id).toBe(agreement.id);
    expect(gift?.externalId).toBe(`cs_router_${suffix}`);
    expect(gift?.sourceFingerprint).toBe(`evt_router_${suffix}`);
    expect(gift?.provider).toBe('STRIPE');
    expect(gift?.providerPaymentId).toBe(`pi_router_${suffix}`);

    const stagingId = await findGiftStagingBySourceFingerprint(
      getCoreClient(),
      `evt_router_${suffix}`,
    );
    expect(stagingId).toBeNull();

    const advancedAgreement = await loadRecurringAgreementById(agreement.id);
    expect(advancedAgreement?.nextExpectedAt).toBe('2026-05-21');
  });

  it('should create staging for recurring Stripe evidence that is unmatched', async () => {
    const suffix = `${Date.now()}-unmatched`;
    const subscriptionId = `sub_router_unmatched_${suffix}`;

    const response = await callRouter(
      buildCheckoutSessionEvent({ suffix, subscriptionId }),
    );

    expect(response.action).toBe('CREATE_RECURRING_GIFT_STAGING');
    if (response.action !== 'CREATE_RECURRING_GIFT_STAGING') {
      throw new Error(`Expected recurring staging path, got ${response.action}`);
    }

    expect(response.result.providerAgreementId).toBe(subscriptionId);
    expect(response.result.created).toBe(true);

    const staging = await loadGiftStagingById(response.result.giftStagingId);
    expect(staging?.name).toBe('Stripe recurring donation from Grace Hopper');
    expect(staging?.provider).toBe('STRIPE');
    expect(staging?.providerPaymentId).toBe(`pi_router_${suffix}`);
    expect(staging?.providerAgreementId).toBe(subscriptionId);
    expect(staging?.processingStatus).toBe('NOT_READY');
    expect(staging?.isReadyForProcessing).toBe(false);
  });

  it('should ignore unsupported Stripe event types without mutation', async () => {
    const response = await callRouter({
      id: `evt_router_${Date.now()}-ignored`,
      type: 'charge.succeeded',
      data: {
        object: {},
      },
    });

    expect(response).toEqual({
      action: 'IGNORED',
      reason: 'UNSUPPORTED_EVENT_TYPE',
      eventType: 'charge.succeeded',
    });
  });
});
