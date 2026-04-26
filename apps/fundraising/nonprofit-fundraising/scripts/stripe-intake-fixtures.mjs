#!/usr/bin/env node

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const ROUTE_PATH = '/s/stripe/intake/handle-event';

const readJsonIfExists = (filePath) => {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
};

const getConfigFromTwentyCli = () => {
  const home = os.homedir();
  const candidates = [
    path.join(home, '.twenty', 'config.test.json'),
    path.join(home, '.twenty', 'config.json'),
  ];

  for (const candidate of candidates) {
    const config = readJsonIfExists(candidate);
    const defaultRemote = config?.defaultRemote ?? 'local';
    const remote = config?.remotes?.[defaultRemote] ?? config?.remotes?.local;
    const apiUrl = remote?.apiUrl;
    const apiKey =
      remote?.apiKey ??
      remote?.accessToken ??
      remote?.appAccessToken ??
      remote?.twentyCLIAccessToken;

    if (apiUrl && apiKey) {
      return {
        apiUrl,
        apiKey,
        source: candidate,
      };
    }
  }

  return null;
};

const getApiConfig = () => {
  if (process.env.TWENTY_API_URL && process.env.TWENTY_API_KEY) {
    return {
      apiUrl: process.env.TWENTY_API_URL,
      apiKey: process.env.TWENTY_API_KEY,
      source: 'environment',
    };
  }

  const cliConfig = getConfigFromTwentyCli();

  if (cliConfig) {
    return cliConfig;
  }

  throw new Error(
    'Set TWENTY_API_URL and TWENTY_API_KEY, or run the Twenty CLI auth/server flow first.',
  );
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

const checkoutSessionCompleted = ({ suffix, subscriptionId }) => ({
  id: `evt_fixture_${suffix}`,
  type: 'checkout.session.completed',
  created: 1777198422,
  data: {
    object: {
      id: `cs_fixture_${suffix}`,
      amount_total: 4200,
      currency: 'gbp',
      created: 1777198410,
      customer_details: {
        email: `stripe.fixture.${suffix}@example.org`,
        name: 'Stripe Fixture',
      },
      payment_intent: `pi_fixture_${suffix}`,
      ...(subscriptionId ? { subscription: subscriptionId } : {}),
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
