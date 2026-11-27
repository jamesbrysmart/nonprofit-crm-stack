import { describe, expect, it } from 'vitest';
import {
  callAppRoute,
  loadCurrentGiftAidClaimBatch,
  loadGiftById,
  loadGiftAidDeclarationsForPerson,
  loadPeopleByName,
} from '../../../nonprofit-fundraising/src/__tests__/test-helpers';

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
});
