import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { CoreApiClient } from 'twenty-client-sdk/core';
import type { TrustedStripeEvent } from 'src/stripe/stripe-event-router';

const effects = vi.hoisted(() => ({ advance: vi.fn(), rollups: vi.fn() }));
vi.mock('src/recurring/recurring.service', () => ({
  advanceRecurringAgreementExpectation: effects.advance,
}));
vi.mock('src/donor-rollups/donor-rollups', () => ({
  recomputeDonorRollups: effects.rollups,
}));

import { routeTrustedStripeEvent } from 'src/stripe/stripe-event-router';

type RecordData = { id: string; sourceFingerprint: string };

const event = (recurring: boolean, eventId = 'evt_replay'): TrustedStripeEvent => ({
  id: eventId,
  type: 'checkout.session.completed',
  created: 1791849600,
  data: { object: {
    id: `cs_${eventId}`, amount_total: 2500, currency: 'gbp', created: 1791849600,
    customer_details: { name: 'Ada Lovelace', email: 'ada@example.org' },
    ...(recurring ? { subscription: 'sub_replay' } : {}),
  } },
});

// Independent clients share a database model, including insert-only primary-key enforcement.
// The barrier gives both deliveries a legitimate pre-insert empty lookup snapshot.
const database = (recurring: boolean, options: {
  concurrent?: boolean; lostResponse?: boolean; rejectCreate?: boolean;
  existing?: RecordData; failReadAfterWrite?: boolean;
} = {}) => {
  const records = new Map<string, RecordData>();
  if (options.existing) records.set(options.existing.id, options.existing);
  const collection = recurring ? 'gifts' : 'giftStagings';
  const mutationKey = recurring ? 'createGift' : 'createGiftStaging';
  let lookupCount = 0;
  let createCount = 0;
  let generatedIds = 0;
  let release!: () => void;
  const barrier = new Promise<void>((resolve) => { release = resolve; });

  const client = (): CoreApiClient => ({
    query: async (input: Record<string, any>) => {
      if (input.recurringAgreements) return {
        recurringAgreements: { edges: [{ node: {
          id: 'agreement_1', name: 'Monthly giving', providerAgreementId: 'sub_replay',
          person: { id: 'person_1', name: { firstName: 'Ada', lastName: 'Lovelace' }, emails: { primaryEmail: 'ada@example.org' } },
        } }] },
      };
      const fingerprint = input[collection].__args.filter.sourceFingerprint.eq;
      const snapshot = [...records.values()].filter((record) => record.sourceFingerprint === fingerprint);
      lookupCount += 1;
      if (options.failReadAfterWrite && createCount > 0) throw new Error('Confirmation read failed');
      if (options.concurrent && lookupCount <= 2) {
        if (lookupCount === 2) release();
        await barrier;
      }
      return { [collection]: { edges: snapshot.map((node) => ({ node })) } };
    },
    mutation: async (input: Record<string, any>) => {
      createCount += 1;
      if (options.rejectCreate) throw new Error('Create permission denied');
      const data = input[mutationKey].__args.data;
      const id = data.id ?? `random_${++generatedIds}`;
      if (records.has(id)) throw new Error('Primary key conflict');
      const record = { ...data, id } as RecordData;
      records.set(id, record);
      if (options.lostResponse) throw new Error('Response lost after commit');
      return { [mutationKey]: { id } };
    },
  }) as unknown as CoreApiClient;

  return { client, records, get createCount() { return createCount; } };
};

beforeEach(() => {
  vi.resetAllMocks();
  effects.advance.mockResolvedValue('2026-11-01');
  effects.rollups.mockResolvedValue(undefined);
});

describe.each([false, true])('Stripe replay protection (recurring=%s)', (recurring) => {
  it('creates one record across independent concurrent deliveries', async () => {
    const db = database(recurring, { concurrent: true });
    const results = await Promise.all([
      routeTrustedStripeEvent(db.client(), event(recurring)),
      routeTrustedStripeEvent(db.client(), event(recurring)),
    ]);
    expect(db.records.size).toBe(1);
    expect(results.map((result) => 'result' in result && 'created' in result.result ? result.result.created : null).sort())
      .toEqual([false, true]);
    const ids = results.map((result) => {
      if (!('result' in result)) throw new Error('Missing routing result');
      return 'giftId' in result.result ? result.result.giftId : 'giftStagingId' in result.result ? result.result.giftStagingId : null;
    });
    expect(ids[0]).toBe(ids[1]);
    expect(db.createCount).toBe(2);
    expect(effects.advance).toHaveBeenCalledTimes(recurring ? 1 : 0);
    expect(effects.rollups).toHaveBeenCalledTimes(recurring ? 1 : 0);
  });

  it('recognises sequential replay without another insert', async () => {
    const db = database(recurring);
    await routeTrustedStripeEvent(db.client(), event(recurring));
    await routeTrustedStripeEvent(db.client(), event(recurring));
    expect(db.records.size).toBe(1);
    expect(db.createCount).toBe(1);
  });

  it('recognises an existing record without changing its identifier or content', async () => {
    const existing = { id: 'existing_record_id', sourceFingerprint: 'evt_replay' };
    const db = database(recurring, { existing });
    await routeTrustedStripeEvent(db.client(), event(recurring));
    expect([...db.records.values()]).toEqual([existing]);
    expect(db.createCount).toBe(0);
    expect(effects.advance).not.toHaveBeenCalled();
  });

  it('confirms a committed record after a lost response and does not recreate it', async () => {
    const db = database(recurring, { lostResponse: true });
    await routeTrustedStripeEvent(db.client(), event(recurring));
    await routeTrustedStripeEvent(db.client(), event(recurring));
    expect(db.records.size).toBe(1);
    expect(db.createCount).toBe(1);
  });

  it('propagates a failed creation when no stored record can be confirmed', async () => {
    const db = database(recurring, { rejectCreate: true });
    await expect(routeTrustedStripeEvent(db.client(), event(recurring))).rejects.toThrow('Create permission denied');
    expect(db.records.size).toBe(0);
    expect(db.createCount).toBe(1);
  });

  it('does not acknowledge a replay when its confirmation read fails', async () => {
    const db = database(recurring, { lostResponse: true, failReadAfterWrite: true });
    await expect(routeTrustedStripeEvent(db.client(), event(recurring))).rejects.toThrow('Confirmation read failed');
    expect(db.records.size).toBe(1);
  });

  it('keeps distinct event records distinct', async () => {
    const db = database(recurring);
    await routeTrustedStripeEvent(db.client(), event(recurring, 'evt_first'));
    await routeTrustedStripeEvent(db.client(), event(recurring, 'evt_second'));
    expect(db.records.size).toBe(2);
  });
});
