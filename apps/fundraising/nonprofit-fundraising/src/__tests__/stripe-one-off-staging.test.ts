import { describe, expect, it } from 'vitest';

import {
  buildStripeOneOffGiftStagingInput,
  type StripeCheckoutSessionCompletedEvent,
} from 'src/stripe/stripe-one-off-staging';

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
      customer_details: {
        email: 'ada@example.com',
        name: 'Ada Lovelace',
      },
      payment_intent: 'pi_123',
    },
  },
  ...overrides,
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
      donorFirstName: 'Ada',
      donorLastName: 'Lovelace',
      donorEmail: 'ada@example.com',
      externalId: 'cs_test_123',
      sourceFingerprint: 'evt_test_123',
      provider: 'STRIPE',
      providerPaymentId: 'pi_123',
      donorResolutionState: 'UNREVIEWED',
      hasCoreGiftIssue: false,
      isReadyForProcessing: false,
      processingStatus: 'NOT_READY',
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
            customer_details: {
              email: null,
              name: 'Madonna',
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
    expect(input.providerPaymentId).toBe('pi_456');
    expect(input.providerAgreementId).toBeUndefined();
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
            subscription: 'sub_subscription',
          },
        },
      }),
    );

    expect(input.name).toBe('Stripe recurring donation from Grace Hopper');
    expect(input.providerAgreementId).toBe('sub_subscription');
    expect(input.providerPaymentId).toBe('pi_subscription');
    expect(input.processingStatus).toBe('NOT_READY');
    expect(input.isReadyForProcessing).toBe(false);
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
});
