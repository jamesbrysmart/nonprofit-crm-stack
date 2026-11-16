#!/usr/bin/env node

const ROUTE_PATH = '/s/stripe/intake/handle-event';

const getApiConfig = () => {
  const apiUrl = process.env.TWENTY_API_URL?.trim();
  const apiKey = process.env.TWENTY_API_KEY?.trim();

  if (!apiUrl || !apiKey) {
    throw new Error(
      'Set TWENTY_API_URL and TWENTY_API_KEY explicitly for a disposable test workspace. Saved CLI credentials are not used.',
    );
  }

  return { apiUrl, apiKey, source: 'environment' };
};

const normalizeApiUrl = (apiUrl) => apiUrl.replace(/\/$/, '');

const callStripeIntakeRoute = async ({ apiUrl, apiKey }, event) => {
  const response = await fetch(`${normalizeApiUrl(apiUrl)}${ROUTE_PATH}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(event),
  });

  const rawBody = await response.text();

  if (!response.ok) {
    throw new Error(
      `${ROUTE_PATH} failed with ${response.status}: ${rawBody || response.statusText}`,
    );
  }

  return JSON.parse(rawBody);
};

const createMatchedRecurringAgreement = async ({ suffix, subscriptionId }) => {
  const { CoreApiClient } = await import('twenty-client-sdk/core');
  const client = new CoreApiClient();
  const email = `stripe.fixture.${suffix}@example.org`;

  const personResult = await client.mutation({
    createPerson: {
      __args: {
        data: {
          name: {
            firstName: `StripeFixture${suffix}`,
            lastName: 'Recurring',
          },
          emails: {
            primaryEmail: email,
          },
        },
      },
      id: true,
    },
  });

  const personId = personResult?.createPerson?.id;

  if (!personId) {
    throw new Error('Fixture person creation did not return an id');
  }

  const agreementResult = await client.mutation({
    createRecurringAgreement: {
      __args: {
        data: {
          name: `Stripe fixture ${suffix} monthly giving`,
          status: 'ACTIVE',
          cadence: 'MONTHLY',
          intervalCount: 1,
          amount: {
            currencyCode: 'GBP',
            amountMicros: 15_000_000,
          },
          startDate: '2026-01-01',
          nextExpectedAt: '2026-04-21',
          provider: 'STRIPE',
          providerAgreementId: subscriptionId,
          person: {
            connect: {
              where: {
                id: personId,
              },
            },
          },
        },
      },
      id: true,
    },
  });

  const recurringAgreementId = agreementResult?.createRecurringAgreement?.id;

  if (!recurringAgreementId) {
    throw new Error('Fixture recurring agreement creation did not return an id');
  }

  return {
    personId,
    recurringAgreementId,
    email,
  };
};

const checkoutSessionCompleted = ({
  suffix,
  subscriptionId,
  giftAidRequested = false,
  omitAddress = false,
}) => ({
  id: `evt_fixture_${suffix}`,
  type: 'checkout.session.completed',
  created: 1777198422,
  data: {
    object: {
      id: `cs_fixture_${suffix}`,
      amount_total: 4200,
      currency: 'gbp',
      created: 1777198410,
      customer: `cus_fixture_${suffix}`,
      customer_details: {
        email: `stripe.fixture.${suffix}@example.org`,
        name: 'Stripe Fixture',
        ...(omitAddress
          ? {}
          : {
              address: {
                line1: '99 Charity Street',
                city: 'London',
                postal_code: 'EC1A 4AA',
                country: 'gb',
              },
            }),
      },
      ...(giftAidRequested
        ? {
            metadata: {
              gift_aid_requested: 'true',
            },
          }
        : {}),
      payment_intent: `pi_fixture_${suffix}`,
      ...(subscriptionId
        ? {
            subscription: {
              id: subscriptionId,
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
          }
        : {}),
    },
  },
});

const runFixture = async ({ label, event, apiConfig }) => {
  const result = await callStripeIntakeRoute(apiConfig, event);

  return {
    label,
    eventId: event.id,
    eventType: event.type,
    result,
  };
};

const main = async () => {
  const apiConfig = getApiConfig();
  const suffix = `${Date.now()}`;
  const matchedSubscriptionId = `sub_fixture_matched_${suffix}`;
  const unmatchedSubscriptionId = `sub_fixture_unmatched_${suffix}`;

  process.env.TWENTY_API_URL = normalizeApiUrl(apiConfig.apiUrl);
  process.env.TWENTY_API_KEY = apiConfig.apiKey;

  console.log(
    `Using ${normalizeApiUrl(apiConfig.apiUrl)} (${apiConfig.source}) for trusted Stripe intake fixtures.`,
  );

  const matchedSetup = await createMatchedRecurringAgreement({
    suffix,
    subscriptionId: matchedSubscriptionId,
  });

  const results = [];

  results.push(
    await runFixture({
      label: 'one-off checkout.session.completed',
      apiConfig,
      event: checkoutSessionCompleted({ suffix: `one_off_${suffix}` }),
    }),
  );

  results.push(
    await runFixture({
      label: 'one-off checkout.session.completed with Gift Aid requested but incomplete declaration evidence',
      apiConfig,
      event: checkoutSessionCompleted({
        suffix: `one_off_giftaid_requested_only_${suffix}`,
        giftAidRequested: true,
        omitAddress: true,
      }),
    }),
  );

  results.push(
    await runFixture({
      label: 'one-off checkout.session.completed with Gift Aid requested and captured declaration evidence',
      apiConfig,
      event: checkoutSessionCompleted({
        suffix: `one_off_giftaid_captured_${suffix}`,
        giftAidRequested: true,
      }),
    }),
  );

  results.push(
    await runFixture({
      label: 'recurring checkout.session.completed with confident match',
      apiConfig,
      event: checkoutSessionCompleted({
        suffix: `recurring_matched_${suffix}`,
        subscriptionId: matchedSubscriptionId,
      }),
    }),
  );

  results.push(
    await runFixture({
      label: 'recurring checkout.session.completed without match, staged for review',
      apiConfig,
      event: checkoutSessionCompleted({
        suffix: `recurring_unmatched_${suffix}`,
        subscriptionId: unmatchedSubscriptionId,
      }),
    }),
  );

  results.push(
    await runFixture({
      label: 'ignored unsupported event',
      apiConfig,
      event: {
        id: `evt_fixture_ignored_${suffix}`,
        type: 'charge.succeeded',
        data: {
          object: {},
        },
      },
    }),
  );

  console.log(
    JSON.stringify(
      {
        matchedSetup,
        results,
      },
      null,
      2,
    ),
  );
};

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : error);
  process.exit(1);
});
