import { describe, expect, it } from 'vitest';
import type {
  StripeCheckoutSessionCompletedEvent,
  StripeOneOffGiftStagingResult,
} from 'src/stripe/stripe-one-off-staging';
import {
  callAppRoute,
  loadGiftStagingById,
} from './test-helpers';

const buildEvent = (suffix: string): StripeCheckoutSessionCompletedEvent => ({
  id: `evt_stage_${suffix}`,
  type: 'checkout.session.completed',
  created: 1777198422,
  data: {
    object: {
      id: `cs_stage_${suffix}`,
      amount_total: 2500,
      currency: 'gbp',
      created: 1777198410,
      customer: `cus_stage_${suffix}`,
      customer_details: {
        email: `ada.${suffix}@example.org`,
        name: 'Ada Lovelace',
        phone: '+44 20 7946 0958',
        address: {
          line1: '12 Analytical Engine Row',
          city: 'London',
          postal_code: 'SW1A 1AA',
          country: 'gb',
        },
      },
      payment_intent: `pi_stage_${suffix}`,
    },
  },
});

describe('Stripe one-off staging intake', () => {
  it('should create a staged gift and suppress replay duplicates by sourceFingerprint', async () => {
    const suffix = `${Date.now()}-stripe`;
    const event = buildEvent(suffix);

    const firstResponse = await callAppRoute<StripeOneOffGiftStagingResult>(
      '/s/stripe/intake/create-one-off-gift-staging',
      event,
    );

    expect(firstResponse.created).toBe(true);

    const createdRecord = await loadGiftStagingById(firstResponse.giftStagingId);
    expect(createdRecord).toBeTruthy();
    expect(createdRecord?.name).toBe('Stripe donation from Ada Lovelace');
    expect(createdRecord?.intakeSource).toBe('stripe_webhook');
    expect(createdRecord?.giftDate).toBe('2026-04-26');
    expect(createdRecord?.donationType).toBe('ONE_OFF');
    expect(createdRecord?.donorFirstName).toBe('Ada');
    expect(createdRecord?.donorLastName).toBe('Lovelace');
    expect(createdRecord?.donorEmail).toBe(`ada.${suffix}@example.org`);
    expect(createdRecord?.donorPhone).toBe('+44 20 7946 0958');
    expect(createdRecord?.donorMailingAddress).toEqual({
      addressStreet1: '12 Analytical Engine Row',
      addressCity: 'London',
      addressPostcode: 'SW1A 1AA',
      addressCountry: 'GB',
    });
    expect(createdRecord?.externalId).toBe(`cs_stage_${suffix}`);
    expect(createdRecord?.sourceFingerprint).toBe(`evt_stage_${suffix}`);
    expect(createdRecord?.providerEventId).toBe(`evt_stage_${suffix}`);
    expect(createdRecord?.provider).toBe('STRIPE');
    expect(createdRecord?.providerPaymentId).toBe(`pi_stage_${suffix}`);
    expect(createdRecord?.paymentProviderCustomerId).toBe(
      `cus_stage_${suffix}`,
    );
    expect(createdRecord?.rawProviderEvidence).toEqual({
      provider: 'STRIPE',
      eventType: 'checkout.session.completed',
      checkoutSessionId: `cs_stage_${suffix}`,
      customerId: `cus_stage_${suffix}`,
      paymentIntentId: `pi_stage_${suffix}`,
      customerDetails: {
        name: 'Ada Lovelace',
        email: `ada.${suffix}@example.org`,
        phone: '+44 20 7946 0958',
        address: {
          addressStreet1: '12 Analytical Engine Row',
          addressCity: 'London',
          addressPostcode: 'SW1A 1AA',
          addressCountry: 'GB',
        },
      },
    });
    expect(createdRecord?.donorResolutionState).toBe('UNREVIEWED');
    expect(createdRecord?.hasCoreGiftIssue).toBe(false);
    expect(createdRecord?.isReadyForProcessing).toBe(false);
    expect(createdRecord?.processingStatus).toBe('NOT_READY');
    expect(createdRecord?.amount?.currencyCode).toBe('GBP');
    expect(createdRecord?.amount?.amountMicros).toBe(25_000_000);

    const secondResponse = await callAppRoute<StripeOneOffGiftStagingResult>(
      '/s/stripe/intake/create-one-off-gift-staging',
      event,
    );

    expect(secondResponse.created).toBe(false);
    expect(secondResponse.giftStagingId).toBe(firstResponse.giftStagingId);
    expect(secondResponse.sourceFingerprint).toBe(firstResponse.sourceFingerprint);
    expect(secondResponse.externalId).toBe(firstResponse.externalId);
  });
});
