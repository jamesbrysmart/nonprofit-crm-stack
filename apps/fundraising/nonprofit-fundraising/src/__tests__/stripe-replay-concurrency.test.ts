import { describe, expect, it, vi } from 'vitest';
import type { CoreApiClient } from 'twenty-client-sdk/core';
import type { TrustedStripeEvent } from 'src/stripe/stripe-event-router';

vi.mock('src/donor-rollups/donor-rollups', () => ({
  recomputeDonorRollups: vi.fn(),
}));

import { routeTrustedStripeEvent } from 'src/stripe/stripe-event-router';

type RecordData = { id: string; sourceFingerprint: string };

const event = (
  subscription?: string,
  eventId = 'evt_replay',
): TrustedStripeEvent => ({
  id: eventId,
  type: 'checkout.session.completed',
  created: 1791849600,
  data: {
    object: {
      id: `cs_${eventId}`,
      amount_total: 2500,
      currency: 'gbp',
      created: 1791849600,
      payment_intent: `pi_${eventId}`,
      customer_details: { name: 'Ada Lovelace', email: 'ada@example.org' },
      ...(subscription ? { subscription } : {}),
    },
  },
});

// Independent clients share a database model, including insert-only primary-key enforcement.
// The barrier gives both deliveries a legitimate pre-insert empty lookup snapshot.
const database = (
  options: {
    concurrent?: boolean;
    lostResponse?: boolean;
    rejectCreate?: boolean;
    existing?: RecordData;
    failReadAfterWrite?: boolean;
  } = {},
) => {
  const agreement = {
    id: 'agreement_1',
    name: 'Monthly giving',
    providerAgreementId: 'sub_replay',
    cadence: 'MONTHLY',
    intervalCount: 1,
    nextExpectedAt: '2026-10-10',
    person: {
      id: 'person_1',
      name: { firstName: 'Ada', lastName: 'Lovelace' },
      emails: { primaryEmail: 'ada@example.org' },
    },
  };
  const records = new Map<string, RecordData>();
  if (options.existing) records.set(options.existing.id, options.existing);
  let lookupCount = 0;
  let createCount = 0;
  let generatedIds = 0;
  let release!: () => void;
  const barrier = new Promise<void>((resolve) => {
    release = resolve;
  });

  const client = (): CoreApiClient => ({
    query: async (input: Record<string, any>) => {
      if (input.recurringAgreements) {
        const filters: Array<{ providerAgreementId?: { eq?: string } }> =
          input.recurringAgreements.__args.filter.and;
        const matches = filters.some(
          (filter) =>
            filter.providerAgreementId?.eq === agreement.providerAgreementId,
        );
        return {
          recurringAgreements: { edges: matches ? [{ node: agreement }] : [] },
        };
      }
      if (input.recurringAgreement) {
        const id = input.recurringAgreement.__args.filter.id.eq;
        return { recurringAgreement: id === agreement.id ? agreement : null };
      }
      const collection = input.gifts ? 'gifts' : 'giftStagings';
      const fingerprint = input[collection].__args.filter.sourceFingerprint.eq;
      const snapshot = [...records.values()].filter(
        (record) => record.sourceFingerprint === fingerprint,
      );
      lookupCount += 1;
      if (options.failReadAfterWrite && createCount > 0) {
        throw new Error('Confirmation read failed');
      }
      if (options.concurrent && lookupCount <= 2) {
        if (lookupCount === 2) release();
        await barrier;
      }
      return { [collection]: { edges: snapshot.map((node) => ({ node })) } };
    },
    mutation: async (input: Record<string, any>) => {
      if (input.updateRecurringAgreement) {
        const { id, data } = input.updateRecurringAgreement.__args;
        if (id !== agreement.id) {
          throw new Error(`Unknown agreement ${id}`);
        }
        agreement.nextExpectedAt = data.nextExpectedAt;
        return { updateRecurringAgreement: { id } };
      }
      createCount += 1;
      if (options.rejectCreate) throw new Error('Create permission denied');
      const mutationKey = input.createGift ? 'createGift' : 'createGiftStaging';
      const data = input[mutationKey].__args.data;
      const id = data.id ?? `random_${++generatedIds}`;
      if (records.has(id)) throw new Error('Primary key conflict');
      const record = { ...data, id } as RecordData;
      records.set(id, record);
      if (options.lostResponse) throw new Error('Response lost after commit');
      return { [mutationKey]: { id } };
    },
  }) as unknown as CoreApiClient;

  return {
    agreement,
    client,
    records,
    get createCount() {
      return createCount;
    },
  };
};

it('preserves an unmatched subscription payment for staging review', async () => {
  const db = database();
  const result = await routeTrustedStripeEvent(db.client(), event('sub_unmatched'));

  expect(result.action).toBe('CREATE_RECURRING_GIFT_STAGING');
  expect([...db.records.values()]).toMatchObject([
    {
      amount: { amountMicros: 25_000_000, currencyCode: 'GBP' },
      providerAgreementId: 'sub_unmatched',
      providerPaymentId: 'pi_evt_replay',
      donationType: 'RECURRING',
      giftReadyStatus: 'NEEDS_REVIEW',
      processingStatus: 'NOT_PROCESSED',
    },
  ]);
  expect(db.agreement.nextExpectedAt).toBe('2026-10-10');
});

describe.each([
  {
    name: 'one-off payment',
    subscription: undefined,
    action: 'CREATE_ONE_OFF_GIFT_STAGING',
    idField: 'giftStagingId',
    expectedDate: '2026-10-10',
  },
  {
    name: 'matched recurring payment',
    subscription: 'sub_replay',
    action: 'CREATE_RECURRING_GIFT',
    idField: 'giftId',
    expectedDate: '2026-11-10',
  },
] as const)('Stripe intake for a $name', ({ subscription, action, idField, expectedDate }) => {
  it('creates one record across independent concurrent deliveries', async () => {
    const db = database({ concurrent: true });
    const results = await Promise.all([
      routeTrustedStripeEvent(db.client(), event(subscription)),
      routeTrustedStripeEvent(db.client(), event(subscription)),
    ]);
    expect(db.records.size).toBe(1);
    const [storedId] = db.records.keys();
    for (const created of [true, false]) {
      expect(results).toContainEqual(
        expect.objectContaining({
          action,
          result: expect.objectContaining({ created, [idField]: storedId }),
        }),
      );
    }
    expect(db.createCount).toBe(2);
    expect(db.agreement.nextExpectedAt).toBe(expectedDate);
  });

  it('records the payment in the intended workflow and preserves it on replay', async () => {
    const db = database();
    const first = await routeTrustedStripeEvent(db.client(), event(subscription));
    const replay = await routeTrustedStripeEvent(db.client(), event(subscription));
    const [storedId] = db.records.keys();

    expect(first).toMatchObject({ action, result: { created: true, [idField]: storedId } });
    expect(replay).toMatchObject({ action, result: { created: false, [idField]: storedId } });
    expect([...db.records.values()]).toMatchObject([
      {
        amount: { amountMicros: 25_000_000, currencyCode: 'GBP' },
        giftDate: '2026-10-13',
        externalId: 'cs_evt_replay',
        providerPaymentId: 'pi_evt_replay',
        ...(subscription
          ? {
              donor: { connect: { where: { id: 'person_1' } } },
              recurringAgreement: { connect: { where: { id: 'agreement_1' } } },
            }
          : { donationType: 'ONE_OFF', processingStatus: 'NOT_PROCESSED' }),
      },
    ]);
    expect(db.createCount).toBe(1);
    expect(db.agreement.nextExpectedAt).toBe(expectedDate);
  });

  it('recognises an existing record without changing its identifier or content', async () => {
    const existing = { id: 'existing_record_id', sourceFingerprint: 'evt_replay' };
    const db = database({ existing });
    const result = await routeTrustedStripeEvent(db.client(), event(subscription));
    expect(result).toMatchObject({ action, result: { [idField]: existing.id } });
    expect([...db.records.values()]).toEqual([existing]);
    expect(db.createCount).toBe(0);
  });

  it('confirms a committed record after a lost response and does not recreate it', async () => {
    const db = database({ lostResponse: true });
    const recovered = await routeTrustedStripeEvent(db.client(), event(subscription));
    const replay = await routeTrustedStripeEvent(db.client(), event(subscription));

    expect(db.records.size).toBe(1);
    const [storedId] = db.records.keys();
    expect(recovered).toMatchObject({ action, result: { [idField]: storedId } });
    expect(replay).toMatchObject({
      action,
      result: { created: false, [idField]: storedId },
    });
    expect(db.createCount).toBe(1);
  });

  it('propagates a failed creation when no stored record can be confirmed', async () => {
    const db = database({ rejectCreate: true });
    await expect(routeTrustedStripeEvent(db.client(), event(subscription)))
      .rejects.toThrow('Create permission denied');
    expect(db.records.size).toBe(0);
    expect(db.createCount).toBe(1);
  });

  it('does not acknowledge a replay when its confirmation read fails', async () => {
    const db = database({ lostResponse: true, failReadAfterWrite: true });
    await expect(routeTrustedStripeEvent(db.client(), event(subscription)))
      .rejects.toThrow('Confirmation read failed');
    expect(db.records.size).toBe(1);
  });

  it('keeps distinct event records distinct', async () => {
    const db = database();
    await routeTrustedStripeEvent(db.client(), event(subscription, 'evt_first'));
    await routeTrustedStripeEvent(db.client(), event(subscription, 'evt_second'));
    expect(db.records.size).toBe(2);
  });
});
