import { describe, expect, it } from 'vitest';
import type {
  DuplicateCheckResponse,
  ManualGiftEntryResponse,
} from 'src/manual-gift-entry/manual-gift-entry.types';
import {
  callAppRoute,
  loadCurrentGiftAidClaimBatch,
  loadGiftById,
  loadGiftAidDeclarationsForPerson,
  loadPeopleByName,
} from './test-helpers';

describe('Manual gift entry routes', () => {
  it('should return expected duplicate-check categories', async () => {
    const adaResult = await callAppRoute<DuplicateCheckResponse>(
      '/s/donor-resolution/check-donor-duplicates',
      {
        donorFirstName: 'Ada',
        donorLastName: 'Lovelace',
      },
    );
    expect(adaResult.status).toBe('SINGLE_EXACT_MATCH');
    expect(adaResult.candidates).toHaveLength(1);

    const jamieResult = await callAppRoute<DuplicateCheckResponse>(
      '/s/donor-resolution/check-donor-duplicates',
      {
        donorFirstName: 'Jamie',
        donorLastName: 'Taylor',
      },
    );
    expect(jamieResult.status).toBe('MULTIPLE_EXACT_MATCHES');
    expect(jamieResult.candidates.length).toBeGreaterThan(1);

    const missingResult = await callAppRoute<DuplicateCheckResponse>(
      '/s/donor-resolution/check-donor-duplicates',
      {
        donorFirstName: 'Morgan',
        donorLastName: 'Pryce',
      },
    );
    expect(missingResult.status).toBe('NO_MATCH');
    expect(missingResult.candidates).toHaveLength(0);
  });

  it('should create a gift linked to an existing donor after explicit donor choice', async () => {
    const duplicateResult = await callAppRoute<DuplicateCheckResponse>(
      '/s/donor-resolution/check-donor-duplicates',
      {
        donorFirstName: 'Ada',
        donorLastName: 'Lovelace',
      },
    );

    const response = await callAppRoute<ManualGiftEntryResponse>(
      '/s/manual-gift-entry/create-gift',
      {
        donorFirstName: 'Ada',
        donorLastName: 'Lovelace',
        donorEmail: 'ada.lovelace@example.org',
        amountValue: '25.00',
        giftDate: '2026-04-16',
        donorChoice: 'USE_EXISTING',
        selectedDonorId: duplicateResult.candidates[0]?.id,
      },
    );

    expect(response.giftId).toBeDefined();
    expect(response.donorChoice).toBe('USE_EXISTING');

    const gift = await loadGiftById(response.giftId!);
    expect(gift).toBeTruthy();
    expect(gift?.donor?.id).toBe(duplicateResult.candidates[0]?.id);
    expect(gift?.donorFirstName).toBe('Ada');
    expect(gift?.donorLastName).toBe('Lovelace');
  });

  it('should create a new donor and linked gift when no duplicate exists', async () => {
    const uniqueSuffix = Date.now().toString();
    const donorFirstName = `Morgan${uniqueSuffix}`;
    const donorLastName = 'Pryce';
    const donorEmail = `morgan.pryce.${uniqueSuffix}@example.org`;

    const response = await callAppRoute<ManualGiftEntryResponse>(
      '/s/manual-gift-entry/create-gift',
      {
        donorFirstName,
        donorLastName,
        donorEmail,
        amountValue: '18.00',
        giftDate: '2026-04-16',
        donorChoice: 'CREATE_NEW',
      },
    );

    expect(response.giftId).toBeDefined();
    expect(response.donorChoice).toBe('CREATE_NEW');

    const gift = await loadGiftById(response.giftId!);
    expect(gift).toBeTruthy();
    expect(gift?.donorFirstName).toBe(donorFirstName);
    expect(gift?.donorLastName).toBe(donorLastName);
    expect(gift?.donorEmail).toBe(donorEmail);
    expect(gift?.donor?.id).toBeTruthy();

    const people = await loadPeopleByName(donorFirstName, donorLastName);
    expect(people).toHaveLength(1);
    expect(people[0]?.emails?.primaryEmail).toBe(donorEmail);
    expect(gift?.donor?.id).toBe(people[0]?.id);
  });

  it('should create a declaration and claimable gift when Gift Aid is captured during manual entry', async () => {
    const uniqueSuffix = Date.now().toString();
    const donorFirstName = `Grace${uniqueSuffix}`;
    const donorLastName = 'Hopper';
    const donorEmail = `grace.hopper.${uniqueSuffix}@example.org`;

    const response = await callAppRoute<ManualGiftEntryResponse>(
      '/s/manual-gift-entry/create-gift',
      {
        donorFirstName,
        donorLastName,
        donorEmail,
        amountValue: '33.00',
        giftDate: '2026-04-16',
        giftAidRequested: true,
        giftAidDeclarationCaptured: true,
        giftAidDeclarationDate: '2026-04-16',
        giftAidCoverageScope: 'past_and_future',
        giftAidDeclarationSource: 'manual_entry',
        giftAidTextVersion: 'v1',
        donorChoice: 'CREATE_NEW',
      },
    );

    const gift = await loadGiftById(response.giftId!);
    expect(gift?.giftAidStatus).toBe('CLAIMABLE');
    expect(gift?.giftAidReasonCode).toBe('valid_declaration_present');
    expect(gift?.giftAidDeclaration?.id).toBeTruthy();
    expect(gift?.giftAidClaimBatch?.id).toBeTruthy();

    const people = await loadPeopleByName(donorFirstName, donorLastName);
    const declarations = await loadGiftAidDeclarationsForPerson(people[0]!.id);
    const currentDraft = await loadCurrentGiftAidClaimBatch();

    expect(declarations).toHaveLength(1);
    expect(declarations[0]?.status).toBe('ACTIVE');
    expect(declarations[0]?.source).toBe('manual_entry');
    expect(currentDraft?.id).toBe(gift?.giftAidClaimBatch?.id);
  });
});
