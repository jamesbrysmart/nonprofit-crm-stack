import assert from 'node:assert/strict';

import { main as runRollups } from '../serverlessFunctions/calculaterollups/src/index.ts';

type Json = Record<string, unknown>;

interface RequestLogEntry {
  url: string;
  method: string;
  body?: unknown;
}

const now = new Date();
const currentYear = now.getUTCFullYear();
const previousYear = currentYear - 1;

const mockGifts = [
  {
    id: 'gift-1',
    donorId: 'person-1',
    appealId: 'appeal-1',
    householdId: 'household-1',
    companyId: 'company-1',
    recurringAgreementId: 'ra-1',
    amount: { amountMicros: 120_500_000, currencyCode: 'GBP' },
    giftDate: `${currentYear}-01-15T12:00:00.000Z`,
  },
  {
    id: 'gift-2',
    donorId: 'person-1',
    appealId: 'appeal-1',
    householdId: 'household-1',
    companyId: 'company-1',
    amount: { amountMicros: 79_500_000, currencyCode: 'GBP' },
    giftDate: `${previousYear}-12-20T09:00:00.000Z`,
  },
];

const mockPeople = [
  {
    id: 'person-1',
    householdId: 'household-1',
    lifetimeGiftAmount: { amountMicros: 0, currencyCode: 'GBP' },
    lifetimeGiftCount: 0,
    firstGiftDate: null,
    lastGiftDate: null,
    yearToDateGiftAmount: { amountMicros: 0, currencyCode: 'GBP' },
    yearToDateGiftCount: 0,
  },
];

const requestLog: RequestLogEntry[] = [];
const updatePayloads: Array<{ resource: string; id: string; payload: Json }> = [];

const jsonResponse = (data: Json | Json[]) =>
  new Response(JSON.stringify(data), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });

const getFilterValue = (expressions: string[], field: string) => {
  for (const expression of expressions) {
    const match = expression.match(new RegExp(`^${field}\\[eq\\]:(.+)$`));
    if (match) {
      try {
        return JSON.parse(match[1]) as string;
      } catch {
        return undefined;
      }
    }
  }
  return undefined;
};

const applyPatch = (collection: Array<Record<string, any>>, id: string, payload: Json) => {
  const entry = collection.find((item) => item.id === id);
  if (!entry) {
    return;
  }
  Object.entries(payload).forEach(([key, value]) => {
    entry[key] = value;
  });
};

global.fetch = async (
  rawUrl: string | URL,
  init?: { method?: string; body?: unknown },
): Promise<any> => {
  const url = typeof rawUrl === 'string' ? new URL(rawUrl) : rawUrl;
  const method = (init?.method ?? 'GET').toUpperCase();
  requestLog.push({
    url: url.toString(),
    method,
    body: init?.body ? safeParse(init.body) : undefined,
  });

  if (url.pathname.endsWith('/gifts') && method === 'GET') {
    const filterExpressions = url.searchParams.getAll('filter');
    const donorId = getFilterValue(filterExpressions, 'donorId');
    const appealId = getFilterValue(filterExpressions, 'appealId');
    const companyId = getFilterValue(filterExpressions, 'companyId');
    const recurringAgreementId = getFilterValue(filterExpressions, 'recurringAgreementId');
    const items = mockGifts.filter((gift) => {
      if (donorId && gift.donorId !== donorId) {
        return false;
      }
      if (appealId && gift.appealId !== appealId) {
        return false;
      }
      if (companyId && gift.companyId !== companyId) {
        return false;
      }
      if (recurringAgreementId && gift.recurringAgreementId !== recurringAgreementId) {
        return false;
      }
      return true;
    });
    return jsonResponse({
      data: {
        gifts: items,
      },
      pageInfo: {
        hasNextPage: false,
      },
    });
  }

  if (url.pathname.endsWith('/people') && method === 'GET') {
    const filterExpressions = url.searchParams.getAll('filter');
    const householdId = getFilterValue(filterExpressions, 'householdId');
    const items = mockPeople.filter((person) => {
      if (householdId && person.householdId !== householdId) {
        return false;
      }
      return true;
    });
    return jsonResponse({
      data: {
        people: items,
      },
      pageInfo: {
        hasNextPage: false,
      },
    });
  }

  if (url.pathname.includes('/people/') && method === 'PATCH') {
    const id = url.pathname.split('/').pop() ?? 'unknown';
    const payload = safeParse(init?.body) ?? {};
    updatePayloads.push({ resource: 'people', id, payload });
    applyPatch(mockPeople, id, payload);
    return jsonResponse({ data: { people: [{ id, ...payload }] } });
  }

  if (url.pathname.includes('/appeals/') && method === 'PATCH') {
    const id = url.pathname.split('/').pop() ?? 'unknown';
    const payload = safeParse(init?.body) ?? {};
    updatePayloads.push({ resource: 'appeals', id, payload });
    return jsonResponse({ data: { appeals: [{ id, ...payload }] } });
  }

  if (url.pathname.includes('/households/') && method === 'PATCH') {
    const id = url.pathname.split('/').pop() ?? 'unknown';
    const payload = safeParse(init?.body) ?? {};
    updatePayloads.push({ resource: 'households', id, payload });
    return jsonResponse({ data: { households: [{ id, ...payload }] } });
  }

  if (url.pathname.includes('/companies/') && method === 'PATCH') {
    const id = url.pathname.split('/').pop() ?? 'unknown';
    const payload = safeParse(init?.body) ?? {};
    updatePayloads.push({ resource: 'companies', id, payload });
    return jsonResponse({ data: { companies: [{ id, ...payload }] } });
  }

  if (url.pathname.includes('/recurringAgreements/') && method === 'PATCH') {
    const id = url.pathname.split('/').pop() ?? 'unknown';
    const payload = safeParse(init?.body) ?? {};
    updatePayloads.push({ resource: 'recurringAgreements', id, payload });
    return jsonResponse({ data: { recurringAgreements: [{ id, ...payload }] } });
  }

  throw new Error(`Unhandled request in mock fetch: ${method} ${url.toString()}`);
};

function safeParse(body: unknown) {
  if (!body) {
    return undefined;
  }
  if (typeof body === 'string') {
    try {
      return JSON.parse(body) as Json;
    } catch (error) {
      console.warn('Failed to parse request body', error);
      return undefined;
    }
  }
  return undefined;
}

async function main() {
  process.env.TWENTY_API_KEY = 'mock-api-key';
  process.env.TWENTY_API_BASE_URL = 'https://mock.twenty/api';

  const params = {
    trigger: { type: 'databaseEvent' },
    record: {
      donorId: 'person-1',
      appealId: 'appeal-1',
      householdId: 'household-1',
      companyId: 'company-1',
      recurringAgreementId: 'ra-1',
    },
    gift: {
      donorId: 'person-1',
      appealId: 'appeal-1',
      householdId: 'household-1',
      companyId: 'company-1',
      recurringAgreementId: 'ra-1',
    },
  };

  const result = await runRollups(params);

  assert.equal(result.status, 'ok', 'rollup execution should succeed');

  const expectedPayload = {
    lifetimeGiftAmount: { amountMicros: 200_000_000, currencyCode: 'GBP' },
    lifetimeGiftCount: 2,
    lastGiftDate: `${currentYear.toString().padStart(4, '0')}-01-15`,
    firstGiftDate: `${previousYear.toString().padStart(4, '0')}-12-20`,
    yearToDateGiftAmount: { amountMicros: 120_500_000, currencyCode: 'GBP' },
    yearToDateGiftCount: 1,
  };

  const personUpdate = updatePayloads.find(
    (payload) => payload.resource === 'people' && payload.id === 'person-1',
  );
  assert(personUpdate, 'expected a PATCH payload for person-1');
  assert.deepStrictEqual(personUpdate.payload, expectedPayload);

  const appealUpdate = updatePayloads.find(
    (payload) => payload.resource === 'appeals' && payload.id === 'appeal-1',
  );
  assert(appealUpdate, 'expected a PATCH payload for appeal-1');
  assert.deepStrictEqual(appealUpdate.payload, {
    raisedAmount: { amountMicros: 200_000_000, currencyCode: 'GBP' },
    giftCount: 2,
  });

  const householdUpdate = updatePayloads.find(
    (payload) => payload.resource === 'households' && payload.id === 'household-1',
  );
  assert(householdUpdate, 'expected a PATCH payload for household-1');
  assert.deepStrictEqual(householdUpdate.payload, expectedPayload);

  const companyUpdate = updatePayloads.find(
    (payload) => payload.resource === 'companies' && payload.id === 'company-1',
  );
  assert(companyUpdate, 'expected a PATCH payload for company-1');
  assert.deepStrictEqual(companyUpdate.payload, expectedPayload);

  const recurringUpdate = updatePayloads.find(
    (payload) => payload.resource === 'recurringAgreements' && payload.id === 'ra-1',
  );
  assert(recurringUpdate, 'expected a PATCH payload for ra-1');
  assert.deepStrictEqual(recurringUpdate.payload, {
    totalReceivedAmount: { amountMicros: 120_500_000, currencyCode: 'GBP' },
    paidInstallmentCount: 1,
    lastPaidAt: `${currentYear.toString().padStart(4, '0')}-01-15`,
  });

  console.log('--- Rollup execution summary ---');
  console.dir(result, { depth: null });

  console.log('\n--- PATCH payloads sent ---');
  console.dir(updatePayloads, { depth: null });

  console.log('\n--- Requests made ---');
  console.dir(requestLog, { depth: null });
}

main().catch((error) => {
  console.error('Smoke test failed', error);
  process.exitCode = 1;
});
