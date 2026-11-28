import { describe, expect, it } from 'vitest';
import { CoreApiClient } from 'twenty-client-sdk/core';
import {
  callAppRoute,
  createPerson,
  loadPeopleByName,
} from '../../../nonprofit-fundraising/src/__tests__/test-helpers';

const client = new CoreApiClient();

const loadGiftById = async (id: string) => {
  const { gift } = await client.query({
    gift: {
      __args: { filter: { id: { eq: id } } },
      id: true,
      giftType: true,
      refundedAmount: { amountMicros: true },
      donor: { id: true },
      giftAidDeclaration: { id: true },
      giftAidClaimBatch: { id: true },
      giftAidStatus: true,
      giftAidReasonCode: true,
    },
  });
  return gift;
};

const loadCurrentGiftAidClaimBatch = async () => {
  const result = await client.query({
    giftAidClaimBatches: {
      __args: {
        first: 10,
        filter: {
          status: {
            eq: 'DRAFT',
          },
        },
      },
      edges: {
        node: {
          id: true,
          name: true,
          status: true,
          giftCount: true,
          blockingIssueCount: true,
          totalAmount: {
            amountMicros: true,
            currencyCode: true,
          },
        },
      },
    },
  });

  return result?.giftAidClaimBatches?.edges?.[0]?.node ?? null;
};

const loadGiftAidDeclarationsForPerson = async (personId: string) => {
  const result = await client.query({
    giftAidDeclarations: {
      __args: {
        first: 100,
        filter: {
          personId: {
            eq: personId,
          },
        },
      },
      edges: {
        node: {
          id: true,
          status: true,
          source: true,
          declarationDate: true,
        },
      },
    },
  });

  return (
    result?.giftAidDeclarations?.edges?.map(
      (edge: { node: unknown }) => edge.node,
    ) ?? []
  ) as Array<{
    id: string;
    status?: string | null;
    source?: string | null;
    declarationDate?: string | null;
  }>;
};

describe('Gift Aid after manual gift entry', () => {
  it('adds a claimable gift to the draft and finalizes it from the Gift Aid app', async () => {
    const suffix = `${Date.now()}-gift-aid`;
    const donorFirstName = `Grace${suffix}`;
    const donorLastName = 'Hopper';
    const donorEmail = `grace.${suffix}@example.org`;

    const response = await callAppRoute<{ giftId: string }>(
      '/s/manual-gift-entry/create-gift',
      {
        donorFirstName,
        donorLastName,
        donorEmail,
        donorMailingAddress: { addressPostcode: 'SW1A 1AA', addressCountry: 'GB' },
        amountValue: '33.00',
        currencyCode: 'GBP',
        paymentType: 'BANK_TRANSFER',
        giftDate: '2026-04-22',
        giftAidRequested: true,
        giftAidDeclarationCaptured: true,
        giftAidDeclarationDate: '2026-04-22',
        giftAidCoverageScope: 'past_and_future',
        giftAidDeclarationSource: 'manual_entry',
        giftAidTextVersion: 'v1',
        donorChoice: 'CREATE_NEW',
      },
    );

    await expect.poll(
      async () => (await loadGiftById(response.giftId))?.giftAidClaimBatch?.id,
      { timeout: 15_000 },
    ).toBeTruthy();
    const gift = await loadGiftById(response.giftId);
    expect(gift?.giftAidStatus).toBe('CLAIMABLE');
    expect(gift?.giftAidReasonCode).toBe('valid_declaration_present');
    expect(gift?.giftAidDeclaration?.id).toBeTruthy();
    expect(gift?.giftAidClaimBatch?.id).toBeTruthy();

    const people = await loadPeopleByName(donorFirstName, donorLastName);
    const declarations = await loadGiftAidDeclarationsForPerson(people[0]!.id);
    await expect.poll(
      async () => (await loadCurrentGiftAidClaimBatch())?.totalAmount?.amountMicros ?? 0,
      { timeout: 15_000 },
    ).toBeGreaterThanOrEqual(33_000_000);
    const currentDraft = await loadCurrentGiftAidClaimBatch();

    expect(declarations).toHaveLength(1);
    expect(declarations[0]?.status).toBe('ACTIVE');
    expect(declarations[0]?.source).toBe('manual_entry');
    const draftGiftCount = currentDraft?.giftCount;
    const draftTotal = currentDraft?.totalAmount?.amountMicros;
    if (
      !currentDraft ||
      typeof draftGiftCount !== 'number' ||
      typeof draftTotal !== 'number'
    ) {
      throw new Error('Expected a persisted draft claim summary');
    }
    expect(currentDraft.id).toBe(gift?.giftAidClaimBatch?.id);
    expect(draftGiftCount).toBeGreaterThanOrEqual(1);
    expect(draftTotal).toBeGreaterThanOrEqual(33_000_000);

    const refundCandidate = await callAppRoute<{ giftId: string }>(
      '/s/manual-gift-entry/create-gift',
      {
        donorFirstName,
        donorLastName,
        donorEmail,
        donorChoice: 'USE_EXISTING',
        selectedDonorId: people[0]!.id,
        amountValue: '20.00',
        currencyCode: 'GBP',
        paymentType: 'BANK_TRANSFER',
        giftDate: '2026-04-22',
      },
    );
    await expect.poll(
      async () => (await loadGiftById(refundCandidate.giftId))?.giftAidClaimBatch?.id,
      { timeout: 15_000 },
    ).toBe(currentDraft.id);
    await callAppRoute('/s/gifts/record-refund', {
      giftId: refundCandidate.giftId,
      refundedAmountMicros: 5_000_000,
      refundDate: '2026-04-26',
    });
    await expect.poll(
      () => loadGiftById(refundCandidate.giftId),
      { timeout: 15_000 },
    ).toMatchObject({
      giftAidStatus: 'NOT_CLAIMABLE',
      giftAidReasonCode: 'gift_refunded_or_reversed',
      giftAidClaimBatch: null,
      refundedAmount: { amountMicros: 5_000_000 },
    });
    await expect.poll(loadCurrentGiftAidClaimBatch, { timeout: 15_000 }).toMatchObject({
      giftCount: draftGiftCount,
      totalAmount: { amountMicros: draftTotal },
    });

    const finalized = await callAppRoute<{
      claimBatchId: string;
      status: string;
      nextDraftBatchId: string | null;
    }>('/s/gift-aid-claims/finalize-claim-batch', { batchId: currentDraft.id });

    expect(finalized).toMatchObject({ claimBatchId: currentDraft.id, status: 'FINALIZED' });
    expect(finalized.nextDraftBatchId).toBeTruthy();
    expect(await loadCurrentGiftAidClaimBatch()).toMatchObject({
      id: finalized.nextDraftBatchId,
      giftCount: 0,
    });
    const finalizedGift = await loadGiftById(response.giftId);
    expect(finalizedGift?.giftAidClaimBatch?.id).toBe(currentDraft.id);
    expect(finalizedGift?.giftAidDeclaration?.id).toBe(declarations[0]?.id);
    await expect(callAppRoute('/s/gifts/record-refund', {
      giftId: response.giftId,
      refundedAmountMicros: 10_000_000,
      refundDate: '2026-04-26',
    })).rejects.toThrow(/finali[sz]ed Gift Aid claim/i);
    expect((await loadGiftById(response.giftId))?.refundedAmount?.amountMicros ?? 0).toBe(0);
  });

  it('should not mark a gift in kind as claimable even when the donor already has a declaration', async () => {
    const suffix = `${Date.now()}-gift-in-kind`;
    const donorFirstName = `Iris${suffix}`;
    const donorLastName = 'Murdoch';
    const donorEmail = `iris.${suffix}@example.org`;

    const donationResponse = await callAppRoute<{ giftId: string }>(
      '/s/manual-gift-entry/create-gift',
      {
        donorFirstName,
        donorLastName,
        donorEmail,
        amountValue: '20.00',
        currencyCode: 'GBP',
        paymentType: 'BANK_TRANSFER',
        giftDate: '2026-04-22',
        giftAidRequested: true,
        giftAidDeclarationCaptured: true,
        giftAidDeclarationDate: '2026-04-22',
        giftAidCoverageScope: 'past_and_future',
        giftAidDeclarationSource: 'manual_entry',
        giftAidTextVersion: 'v1',
        donorChoice: 'CREATE_NEW',
      },
    );

    await expect.poll(
      async () => (await loadGiftById(donationResponse.giftId))?.giftAidStatus,
      { timeout: 15_000 },
    ).toBe('CLAIMABLE');
    const donationGift = await loadGiftById(donationResponse.giftId);
    expect(donationGift?.giftAidStatus).toBe('CLAIMABLE');
    expect(donationGift?.donor?.id).toBeTruthy();

    const donorId = donationGift?.donor?.id ?? '';
    const inKindResponse = await callAppRoute<{ giftId: string }>(
      '/s/manual-gift-entry/create-gift',
      {
        donorFirstName,
        donorLastName,
        donorEmail,
        amountValue: '150.00',
        currencyCode: 'GBP',
        paymentType: 'OTHER',
        giftDate: '2026-04-23',
        donorChoice: 'USE_EXISTING',
        selectedDonorId: donorId,
        giftType: 'GIFT_IN_KIND',
        description: 'Donated artwork for spring auction',
      },
    );

    await expect.poll(
      async () => (await loadGiftById(inKindResponse.giftId))?.giftAidReasonCode,
      { timeout: 15_000 },
    ).toBe('gift_type_not_eligible');
    const inKindGift = await loadGiftById(inKindResponse.giftId);
    const declarations = await loadGiftAidDeclarationsForPerson(donorId);

    expect(inKindGift?.giftType).toBe('GIFT_IN_KIND');
    expect(inKindGift?.giftAidStatus).toBe('NOT_CLAIMABLE');
    expect(inKindGift?.giftAidReasonCode).toBe('gift_type_not_eligible');
    expect(inKindGift?.giftAidDeclaration?.id ?? null).toBeNull();
    expect(inKindGift?.giftAidClaimBatch?.id ?? null).toBeNull();
    expect(declarations).toHaveLength(1);
  });

  it('processes declaration evidence from a paid donation form staging row', async () => {
    const suffix = Date.now().toString();
    const donorFirstName = 'Staged';
    const donorLastName = `Donor${suffix}`;
    const donorEmail = `staged.${suffix}@example.org`;
    const person = await createPerson({ firstName: donorFirstName, lastName: donorLastName, email: donorEmail });
    const { createGiftStaging } = await client.mutation({
      createGiftStaging: {
        __args: {
          data: {
            name: `Gift Aid staged donation ${suffix}`,
            donorId: person.id,
            donorFirstName,
            donorLastName,
            donorEmail,
            donorResolutionState: 'CONFIRMED',
            amount: { amountMicros: 12_000_000, currencyCode: 'GBP' },
            giftDate: '2026-04-22',
            donationType: 'ONE_OFF',
            paymentType: 'CARD',
            paymentState: 'PAYMENT_CONFIRMED',
            provider: 'STRIPE',
            giftAidRequested: true,
            giftAidDeclarationCaptured: true,
            giftAidDeclarationDate: '2026-04-22',
            giftAidCoverageScope: 'past_and_future',
            giftAidDeclarationSource: 'donation_form',
            giftAidTextVersion: 'v1',
          },
        },
        id: true,
      },
    });
    expect(createGiftStaging?.id).toBeTruthy();
    const result = await callAppRoute<{ committedGiftId: string | null; processingStatus: string }>(
      '/s/gift-staging/process-row',
      { giftStagingId: createGiftStaging?.id },
    );
    expect(result.processingStatus).toBe('PROCESSED');
    if (!result.committedGiftId) throw new Error('The staged donation did not produce a Gift');
    const giftId = result.committedGiftId;
    await expect.poll(() => loadGiftById(giftId), { timeout: 15_000 }).toMatchObject({
      giftAidStatus: 'CLAIMABLE',
      giftAidDeclaration: { id: expect.any(String) },
      giftAidClaimBatch: { id: expect.any(String) },
    });
    expect(await loadGiftAidDeclarationsForPerson(person.id)).toMatchObject([
      { source: 'donation_form', status: 'ACTIVE' },
    ]);
  });
});
