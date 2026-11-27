import { describe, expect, it } from 'vitest';
import type { StripeRecurringFulfillmentResult } from 'src/stripe/stripe-recurring-fulfillment';
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
  metadata,
}: {
  suffix: string;
  subscriptionId?: string;
  metadata?: Record<string, string>;
}) => ({
  id: `evt_router_${suffix}`,
  type: 'checkout.session.completed',
  data: {
    object: {
      id: `cs_router_${suffix}`,
      amount_total: 4200,
      currency: 'gbp',
      created: 1777198410,
      customer: `cus_router_${suffix}`,
      customer_details: {
        email: `router.${suffix}@example.org`,
        name: 'Grace Hopper',
        phone: '+44 20 7000 1234',
        address: {
          line1: '44 Compiler Street',
          city: 'London',
          postal_code: 'EC1A 1BB',
          country: 'gb',
        },
      },
      payment_intent: `pi_router_${suffix}`,
      ...(subscriptionId ? { subscription: subscriptionId } : {}),
      ...(metadata ? { metadata } : {}),
    },
  },
} satisfies TrustedStripeEvent);

const callRouter = (event: TrustedStripeEvent) =>
  callAppRoute<StripeEventRoutingResult>('/s/stripe/intake/handle-event', event);

const loadIntakeRecordIds = async (sourceFingerprint: string) => {
  const client = getCoreClient();
  const args = {
    first: 2,
    filter: { sourceFingerprint: { eq: sourceFingerprint } },
  };
  const { gifts, giftStagings } = await client.query({
    gifts: { __args: args, edges: { node: { id: true } } },
    giftStagings: { __args: args, edges: { node: { id: true } } },
  });
  return {
    giftIds: gifts?.edges.map(({ node }) => node.id),
    stagingIds: giftStagings?.edges.map(({ node }) => node.id),
  };
};

describe('Stripe event router intake', () => {
  it('stages a one-off payment once and preserves its attribution evidence on replay', async () => {
    const suffix = `${Date.now()}-one-off`;
    const metadata = {
      campaign_name: 'Spring Appeal',
      designation: 'Emergency Relief',
      campaign_id: 'provider-campaign',
    };
    const event = buildCheckoutSessionEvent({ suffix, metadata });
    const response = await callRouter(event);
    if (response.action !== 'CREATE_ONE_OFF_GIFT_STAGING') {
      throw new Error(`Expected one-off staging, got ${response.action}`);
    }

    expect(response.result.created).toBe(true);
    const stagingId = response.result.giftStagingId;

    expect(await callRouter(event)).toMatchObject({
      action: 'CREATE_ONE_OFF_GIFT_STAGING',
      result: { created: false, giftStagingId: stagingId },
    });
    expect(await loadIntakeRecordIds(event.id)).toEqual({
      giftIds: [],
      stagingIds: [stagingId],
    });
    expect(await loadGiftStagingById(stagingId)).toMatchObject({
      intakeSource: 'stripe_webhook',
      giftDate: '2026-04-26',
      donationType: 'ONE_OFF',
      amount: { amountMicros: 42_000_000, currencyCode: 'GBP' },
      donorFirstName: 'Grace',
      donorLastName: 'Hopper',
      donorEmail: `router.${suffix}@example.org`,
      donorPhone: '+44 20 7000 1234',
      donorMailingAddress: {
        addressStreet1: '44 Compiler Street',
        addressCity: 'London',
        addressPostcode: 'EC1A 1BB',
        addressCountry: 'GB',
      },
      externalId: `cs_router_${suffix}`,
      sourceFingerprint: event.id,
      providerEventId: event.id,
      provider: 'STRIPE',
      providerPaymentId: `pi_router_${suffix}`,
      paymentProviderCustomerId: `cus_router_${suffix}`,
      rawProviderEvidence: {
        eventType: event.type,
        checkoutSessionId: `cs_router_${suffix}`,
        metadata,
      },
      sourceAppealName: 'Spring Appeal',
      sourceFundName: 'Emergency Relief',
      donorResolutionState: 'UNREVIEWED',
      giftReadyStatus: 'NEEDS_REVIEW',
      processingStatus: 'NOT_PROCESSED',
    });
  });

  it('records a matched recurring payment and advances its schedule once across replays', async () => {
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

    const event = buildCheckoutSessionEvent({ suffix, subscriptionId });
    const response = await callRouter(event);

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
    expect(gift?.donorFirstName).toBe(`Grace${suffix}`);
    expect(gift?.donorLastName).toBe('Hopper');
    expect(gift?.donorEmail).toBe(`router.${suffix}@example.org`);
    expect(gift?.amount).toEqual({
      amountMicros: 42_000_000,
      currencyCode: 'GBP',
    });
    expect(gift?.externalId).toBe(`cs_router_${suffix}`);
    expect(gift?.sourceFingerprint).toBe(`evt_router_${suffix}`);
    expect(gift?.provider).toBe('STRIPE');
    expect(gift?.providerPaymentId).toBe(`pi_router_${suffix}`);

    const advancedAgreement = await loadRecurringAgreementById(agreement.id);
    expect(advancedAgreement?.nextExpectedAt).toBe('2026-05-21');

    expect(await callRouter(event)).toMatchObject({
      action: 'CREATE_RECURRING_GIFT',
      result: {
        created: false,
        reason: 'DUPLICATE_SOURCE_FINGERPRINT',
        giftId: response.result.giftId,
      },
    });

    expect(await loadIntakeRecordIds(event.id)).toEqual({
      giftIds: [response.result.giftId],
      stagingIds: [],
    });
    const agreementAfterReplay = await loadRecurringAgreementById(agreement.id);
    expect(agreementAfterReplay?.nextExpectedAt).toBe(
      advancedAgreement?.nextExpectedAt,
    );
  });

  it('keeps unmatched recurring payments out of committed gifts and stages them for review', async () => {
    const suffix = `${Date.now()}-unmatched`;
    const subscriptionId = `sub_router_unmatched_${suffix}`;
    const event = buildCheckoutSessionEvent({ suffix, subscriptionId });
    const direct = await callAppRoute<StripeRecurringFulfillmentResult>(
      '/s/stripe/intake/create-recurring-gift',
      event,
    );

    expect(direct).toMatchObject({
      created: false,
      reason: 'NO_CONFIDENT_RECURRING_AGREEMENT_MATCH',
      providerAgreementId: subscriptionId,
    });
    expect(await loadIntakeRecordIds(event.id)).toEqual({
      giftIds: [],
      stagingIds: [],
    });

    const response = await callRouter(event);
    expect(response.action).toBe('CREATE_RECURRING_GIFT_STAGING');
    if (response.action !== 'CREATE_RECURRING_GIFT_STAGING') {
      throw new Error(`Expected recurring staging path, got ${response.action}`);
    }

    expect(response.result.providerAgreementId).toBe(subscriptionId);
    expect(response.result.created).toBe(true);

    const staging = await loadGiftStagingById(response.result.giftStagingId);
    expect(staging?.name).toBe('Stripe recurring donation from Grace Hopper');
    expect(staging?.donationType).toBe('RECURRING');
    expect(staging?.provider).toBe('STRIPE');
    expect(staging?.providerPaymentId).toBe(`pi_router_${suffix}`);
    expect(staging?.providerAgreementId).toBe(subscriptionId);
    expect(staging?.processingStatus).toBe('NOT_PROCESSED');
    expect(staging?.giftReadyStatus).toBe('NEEDS_REVIEW');
    expect(await loadIntakeRecordIds(event.id)).toEqual({
      giftIds: [],
      stagingIds: [response.result.giftStagingId],
    });
  });

  it('ignores unsupported Stripe events without persisting a gift or staging row', async () => {
    const id = `evt_router_${Date.now()}-ignored`;
    const response = await callRouter({
      id,
      type: 'charge.succeeded',
      data: { object: {} },
    });

    expect(response).toEqual({
      action: 'IGNORED',
      reason: 'UNSUPPORTED_EVENT_TYPE',
      eventType: 'charge.succeeded',
    });
    expect(await loadIntakeRecordIds(id)).toEqual({ giftIds: [], stagingIds: [] });
  });
});
