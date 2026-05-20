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
