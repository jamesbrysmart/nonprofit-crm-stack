import { main as runRollups } from '../serverlessFunctions/calculaterollups/src/index.ts';

type Json = Record<string, unknown>;

interface RequestLogEntry {
  url: string;
  method: string;
  body?: unknown;
}

const mockGifts = [
  {
    id: 'gift-1',
    donorId: 'person-1',
    amount: { value: 120.5 },
    dateReceived: '2025-01-15T12:00:00.000Z',
  },
  {
    id: 'gift-2',
    donorId: 'person-1',
    amount: { value: 79.5 },
    dateReceived: '2024-12-20T09:00:00.000Z',
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
    const items = donorId
      ? mockGifts.filter((gift) => gift.donorId === donorId)
      : mockGifts;
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
    record: { donorId: 'person-1' },
    gift: { donorId: 'person-1' },
  };

  const result = await runRollups(params);

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
