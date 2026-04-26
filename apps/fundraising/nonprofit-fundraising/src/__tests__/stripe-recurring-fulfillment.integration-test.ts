import { describe, expect, it } from 'vitest';
import type {
  StripeRecurringCheckoutSessionCompletedEvent,
  StripeRecurringFulfillmentResult,
} from 'src/stripe/stripe-recurring-fulfillment';
import {
  callAppRoute,
  createPerson,
  createRecurringAgreement,
  loadGiftById,
  loadRecurringAgreementById,
} from './test-helpers';

const buildRecurringEvent = ({
  suffix,
  subscriptionId,
}: {
  suffix: string;
  subscriptionId: string;
}): StripeRecurringCheckoutSessionCompletedEvent => ({
  id: `evt_recurring_${suffix}`,
  type: 'checkout.session.completed',
  created: 1777198422,
  data: {
    object: {
      id: `cs_recurring_${suffix}`,
      amount_total: 1500,
      currency: 'gbp',
      created: 1777198410,
      customer_details: {
        email: `nina.${suffix}@example.org`,
        name: 'Nina Simone',
      },
      payment_intent: `pi_recurring_${suffix}`,
      subscription: subscriptionId,
    },
  },
});

describe('Stripe recurring fulfillment intake', () => {
  it('should create a committed gift for a confident existing agreement match', async () => {
    const suffix = `${Date.now()}-matched`;
    const subscriptionId = `sub_${suffix}`;
    const person = await createPerson({
      firstName: `Nina${suffix}`,
      lastName: 'Simone',
      email: `nina.${suffix}@example.org`,
    });
    const agreement = await createRecurringAgreement({
      name: `Nina ${suffix} monthly giving`,
      personId: person.id,
      provider: 'STRIPE',
      providerAgreementId: subscriptionId,
    });
    const event = buildRecurringEvent({ suffix, subscriptionId });

    const firstResponse = await callAppRoute<StripeRecurringFulfillmentResult>(
      '/s/stripe/intake/create-recurring-gift',
      event,
    );

    expect(firstResponse.created).toBe(true);
    if (!firstResponse.created) {
      throw new Error(`Expected gift creation, got ${firstResponse.reason}`);
    }

    const gift = await loadGiftById(firstResponse.giftId);
    expect(gift).toBeTruthy();
    expect(gift?.donor?.id).toBe(person.id);
    expect(gift?.recurringAgreement?.id).toBe(agreement.id);
    expect(gift?.donorFirstName).toBe(`Nina${suffix}`);
    expect(gift?.donorLastName).toBe('Simone');
    expect(gift?.donorEmail).toBe(`nina.${suffix}@example.org`);
    expect(gift?.externalId).toBe(`cs_recurring_${suffix}`);
    expect(gift?.sourceFingerprint).toBe(`evt_recurring_${suffix}`);
    expect(gift?.provider).toBe('STRIPE');
    expect(gift?.providerPaymentId).toBe(`pi_recurring_${suffix}`);
    expect(gift?.amount?.currencyCode).toBe('GBP');
    expect(gift?.amount?.amountMicros).toBe(15_000_000);

    const advancedAgreement = await loadRecurringAgreementById(agreement.id);
    expect(advancedAgreement?.nextExpectedAt).toBe('2026-05-21');

    const replayResponse = await callAppRoute<StripeRecurringFulfillmentResult>(
      '/s/stripe/intake/create-recurring-gift',
      event,
    );

    expect(replayResponse.created).toBe(false);
    expect(replayResponse.reason).toBe('DUPLICATE_SOURCE_FINGERPRINT');
    expect(replayResponse.giftId).toBe(firstResponse.giftId);

    const afterReplayAgreement = await loadRecurringAgreementById(agreement.id);
    expect(afterReplayAgreement?.nextExpectedAt).toBe('2026-05-21');
  });

  it('should not create a gift when recurring Stripe evidence is unmatched', async () => {
    const suffix = `${Date.now()}-unmatched`;
    const event = buildRecurringEvent({
      suffix,
      subscriptionId: `sub_unmatched_${suffix}`,
    });

    const response = await callAppRoute<StripeRecurringFulfillmentResult>(
      '/s/stripe/intake/create-recurring-gift',
      event,
    );

    expect(response.created).toBe(false);
    expect(response.reason).toBe('NO_CONFIDENT_RECURRING_AGREEMENT_MATCH');
    expect(response.providerAgreementId).toBe(`sub_unmatched_${suffix}`);
  });
});
