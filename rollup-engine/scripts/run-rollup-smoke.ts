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
    amount: { amountMicros: 120_500_000, currencyCode: 'GBP' },
    giftDate: `${currentYear}-01-15T12:00:00.000Z`,
  },
  {
    id: 'gift-2',
    donorId: 'person-1',
    appealId: 'appeal-1',
    amount: { amountMicros: 79_500_000, currencyCode: 'GBP' },
    giftDate: `${previousYear}-12-20T09:00:00.000Z`,
  },
];

const requestLog: RequestLogEntry[] = [];
const updatePayloads: Array<{ id: string; payload: Json }> = [];

const jsonResponse = (data: Json | Json[]) =>
  new Response(JSON.stringify(data), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });

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
    const donorId = url.searchParams.get('filter[donorId]');
    const appealId = url.searchParams.get('filter[appealId]');
    const items = mockGifts.filter((gift) => {
      const donorMatch = donorId ? gift.donorId === donorId : true;
      const appealMatch = appealId ? gift.appealId === appealId : true;
      return donorMatch && appealMatch;
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

  if (url.pathname.includes('/people/') && method === 'PATCH') {
    const id = url.pathname.split('/').pop() ?? 'unknown';
    const payload = safeParse(init?.body) ?? {};
    updatePayloads.push({ id, payload });
    return jsonResponse({ data: { people: [{ id, ...payload }] } });
  }

  if (url.pathname.includes('/appeals/') && method === 'PATCH') {
    const id = url.pathname.split('/').pop() ?? 'unknown';
    const payload = safeParse(init?.body) ?? {};
    updatePayloads.push({ id, payload });
    return jsonResponse({ data: { appeals: [{ id, ...payload }] } });
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
    record: { donorId: 'person-1', appealId: 'appeal-1' },
    gift: { donorId: 'person-1', appealId: 'appeal-1' },
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

  const personUpdate = updatePayloads.find((payload) => payload.id === 'person-1');
  assert(personUpdate, 'expected a PATCH payload for person-1');
  assert.deepStrictEqual(personUpdate.payload, expectedPayload);

  const appealUpdate = updatePayloads.find((payload) => payload.id === 'appeal-1');
  assert(appealUpdate, 'expected a PATCH payload for appeal-1');
  assert.deepStrictEqual(appealUpdate.payload, {
    raisedAmount: { amountMicros: 200_000_000, currencyCode: 'GBP' },
    giftCount: 2,
  });

  console.log('--- Rollup execution summary ---');
  console.dir(result, { depth: null });

  console.log('\n--- PATCH payloads sent to people ---');
  console.dir(updatePayloads, { depth: null });

  console.log('\n--- Requests made ---');
  console.dir(requestLog, { depth: null });
}

main().catch((error) => {
  console.error('Smoke test failed', error);
  process.exitCode = 1;
});
